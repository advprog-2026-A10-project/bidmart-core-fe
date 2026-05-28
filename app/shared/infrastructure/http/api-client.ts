import { NetworkError } from "~/shared/domain/errors/network-error";
import { NotFoundError } from "~/shared/domain/errors/not-found-error";
import { ValidationError } from "~/shared/domain/errors/validation-error";
import type { RequestOptions } from "./types";

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";

function resolveBrowserOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "http://localhost";
}

function resolveApiBaseUrl(): string {
  if (!rawBaseUrl) {
    return resolveBrowserOrigin();
  }

  try {
    return new URL(rawBaseUrl).toString();
  } catch {
    return new URL(rawBaseUrl, resolveBrowserOrigin()).toString();
  }
}

const BASE_URL = resolveApiBaseUrl().replace(/\/$/, "");

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BASE_URL}${normalizedPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function parseErrorResponse(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;
  let fieldErrors: Record<string, string[]> | undefined;

  try {
    const body = (await response.json()) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    if (body.message) message = body.message;
    if (body.errors) fieldErrors = body.errors;
  } catch {
    // Body not parseable as JSON — use default message
  }

  switch (response.status) {
    case 404:
      throw new NotFoundError("Resource");
    case 422:
      throw new ValidationError(message, fieldErrors);
    default:
      throw new NetworkError(message, response.status);
  }
}

async function request<T>(
  method: string,
  path: string,
  options?: RequestOptions & { body?: unknown },
): Promise<T> {
  const { params, body, headers, ...rest } = options ?? {};

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    credentials: "include", // Send httpOnly cookies automatically
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),

  delete: <T = void>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
