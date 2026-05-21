// Thin client for the auth service (`bidmart-auth-be`).
//
// Core-fe and auth-fe share the same `auth_session` httpOnly cookie set by
// auth-be, but the cookie cannot be read from JavaScript. To know "who is
// signed in" the navbar has to ask the auth service via POST /auth/validate
// (see bidmart-auth-be/docs/AUTH_VALIDATE_CONTRACT.md). The same service
// owns sign-out via POST /auth/logout.

import { createModuleLogger } from "~/shared/infrastructure/logger/module-logger";

export type SessionUser = {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly mfaSatisfied: boolean;
  readonly sessionExpiry: string;
};

const logger = createModuleLogger("auth-session");

function resolveAuthBaseUrl(): string | null {
  const raw = (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined)?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : null;
}

export function resolveLoginUrl(redirectTarget?: string): string {
  const configured = (import.meta.env.VITE_AUTH_LOGIN_URL as string | undefined)?.trim();
  const base = configured && configured.length > 0 ? configured : "/auth/login";
  if (!redirectTarget) return base;
  try {
    const url = new URL(base, typeof window !== "undefined" ? window.location.href : undefined);
    url.searchParams.set("redirect", redirectTarget);
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Fetch the current session from `bidmart-auth-be`. Resolves to `null` when
 * the user is not signed in (401) or when `VITE_AUTH_API_BASE_URL` is not
 * configured (so the navbar renders the signed-out state instead of
 * crashing in unconfigured environments).
 */
export async function fetchSessionUser(): Promise<SessionUser | null> {
  const base = resolveAuthBaseUrl();
  if (!base) {
    logger.debug("validate_skipped", {
      reason: "VITE_AUTH_API_BASE_URL is not configured",
    });
    return null;
  }

  return logger.trace(
    "validateSession",
    async ({ requestId }) => {
      const response = await fetch(`${base}/auth/validate`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
      });

      if (response.status === 401 || response.status === 403) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`auth-be validate returned ${response.status}`);
      }

      const body = (await response.json()) as Record<string, unknown>;
      // Tolerant shape: AUTH_VALIDATE_CONTRACT names + a couple of variants
      // that appeared in earlier iterations of the contract document.
      const userId = String(body.userId ?? body.user_id ?? "");
      const name = String(body.name ?? "");
      const email = String(body.email ?? "");
      if (!userId || !email) return null;
      return {
        userId,
        name,
        email,
        emailVerified: Boolean(body.emailVerified ?? body.email_verified ?? false),
        mfaSatisfied: Boolean(body.mfaSatisfied ?? body.mfa_satisfied ?? false),
        sessionExpiry: String(body.sessionExpiry ?? body.session_expiry ?? ""),
      } satisfies SessionUser;
    },
  );
}

/**
 * Tell `bidmart-auth-be` to revoke the current session. The cookie is
 * httpOnly so only the server can clear it, and we have to do that before
 * sending the user back to the login page; otherwise the next page load
 * would resurrect the same session.
 */
export async function signOut(): Promise<void> {
  const base = resolveAuthBaseUrl();
  if (!base) {
    logger.warn("logout_skipped", {
      reason: "VITE_AUTH_API_BASE_URL is not configured",
    });
    return;
  }

  await logger.trace("signOut", async ({ requestId }) => {
    try {
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
      });
    } catch (error) {
      // The cookie is cleared by the response even on transient errors; we
      // log so dev sees it but the user still proceeds to login.
      logger.warn("logout_request_failed", { message: String(error) });
    }
  });
}

/**
 * Build initials (max 2 chars) from a display name, falling back to the
 * first character of the email when the name is empty.
 */
export function deriveInitials(name: string, email: string): string {
  const trimmedName = name.trim();
  if (trimmedName.length > 0) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    const first = parts[0] ?? "";
    if (parts.length === 1) {
      return first.slice(0, 2).toUpperCase();
    }
    const last = parts[parts.length - 1] ?? "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  const trimmedEmail = email.trim();
  return (trimmedEmail[0] ?? "?").toUpperCase();
}
