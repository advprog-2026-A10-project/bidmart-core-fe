import { redirect, type LoaderFunctionArgs } from "react-router";

type ApiSessionGuardConfig = {
  probePath: string;
  probeQuery?: Record<string, string>;
  fallbackLoginPath?: string;
  timeoutMs?: number;
};

function resolveApiBaseUrl(requestUrl: string): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return new URL("/", requestUrl).toString();
  }

  try {
    return new URL(raw).toString();
  } catch {
    return new URL(raw, requestUrl).toString();
  }
}

function resolveProbeUrl(
  requestUrl: string,
  probePath: string,
  probeQuery?: Record<string, string>,
): string {
  // Join probe path relative to API base path. Leading slash in probePath
  // must not reset "/api/v1" to "/".
  const base = new URL(resolveApiBaseUrl(requestUrl));
  const normalizedBasePath = base.pathname.endsWith("/") ? base.pathname : `${base.pathname}/`;
  base.pathname = normalizedBasePath;
  const normalizedProbePath = probePath.replace(/^\/+/, "");
  const probeUrl = new URL(normalizedProbePath, base);

  if (probeQuery) {
    for (const [key, value] of Object.entries(probeQuery)) {
      probeUrl.searchParams.set(key, value);
    }
  }

  return probeUrl.toString();
}

function resolveLoginRedirectUrl(requestedUrl: string, fallbackLoginPath: string): string {
  const configuredLoginUrl = (import.meta.env.VITE_AUTH_LOGIN_URL as string | undefined)?.trim();
  const loginUrl =
    configuredLoginUrl && configuredLoginUrl.length > 0 ? configuredLoginUrl : fallbackLoginPath;
  const normalized = new URL(loginUrl, requestedUrl);
  normalized.searchParams.set("redirect", requestedUrl);
  return normalized.toString();
}

export function createApiSessionGuardLoader(config: ApiSessionGuardConfig) {
  return async function loader({ request }: LoaderFunctionArgs) {
    const requestedUrl = new URL(request.url);
    const loginRedirectUrl = resolveLoginRedirectUrl(
      requestedUrl.toString(),
      config.fallbackLoginPath ?? "/auth/login",
    );

    const headers = new Headers({ Accept: "application/json" });
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    }

    const timeoutMs = config.timeoutMs ?? 8000;
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await fetch(
        resolveProbeUrl(request.url, config.probePath, config.probeQuery),
        {
          method: "GET",
          headers,
          credentials: "include",
          signal: abortController.signal,
        },
      );
      clearTimeout(timeoutHandle);

      if (response.ok) {
        return null;
      }
      if (response.status === 401 || response.status === 403) {
        throw redirect(loginRedirectUrl);
      }
    } catch {
      clearTimeout(timeoutHandle);
      throw redirect(loginRedirectUrl);
    }

    return null;
  };
}
