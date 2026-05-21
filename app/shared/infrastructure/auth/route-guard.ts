import { redirect, type LoaderFunctionArgs } from "react-router";

type ApiSessionGuardConfig = {
  probePath: string;
  probeQuery?: Record<string, string>;
  fallbackLoginPath?: string;
};

function resolveProbeUrl(
  requestUrl: string,
  probePath: string,
  probeQuery?: Record<string, string>,
): string {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const base = apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : requestUrl;
  const probeUrl = new URL(probePath, base);

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

    try {
      const response = await fetch(
        resolveProbeUrl(request.url, config.probePath, config.probeQuery),
        {
          method: "GET",
          headers,
          credentials: "include",
        },
      );

      if (response.ok) {
        return null;
      }
      if (response.status === 401 || response.status === 403) {
        throw redirect(loginRedirectUrl);
      }
    } catch {
      throw redirect(loginRedirectUrl);
    }

    return null;
  };
}
