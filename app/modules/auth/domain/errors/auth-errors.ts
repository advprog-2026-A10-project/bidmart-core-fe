import { AppError } from "~/shared/domain/errors/app-error";

/**
 * AuthError — base domain error for all authentication errors.
 * SRP: all auth domain errors extend this single base.
 */
export class AuthError extends AppError {
  constructor(message: string, code: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "AuthError";
  }
}

/**
 * InvalidCredentialsError — thrown when email/password combination is wrong.
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password.", "INVALID_CREDENTIALS", 401);
    this.name = "InvalidCredentialsError";
  }
}

/**
 * EmailAlreadyExistsError — thrown when registering with an already-used email.
 */
export class EmailAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`Email "${email}" is already registered.`, "EMAIL_ALREADY_EXISTS", 409);
    this.name = "EmailAlreadyExistsError";
  }
}

/**
 * EmailNotVerifiedError — thrown when trying to login without verifying email.
 */
export class EmailNotVerifiedError extends AuthError {
  constructor() {
    super(
      "Email address has not been verified. Please check your inbox.",
      "EMAIL_NOT_VERIFIED",
      403,
    );
    this.name = "EmailNotVerifiedError";
  }
}

/**
 * InvalidVerificationTokenError — thrown when email verification token is invalid or expired.
 */
export class InvalidVerificationTokenError extends AuthError {
  constructor() {
    super("Verification token is invalid or has expired.", "INVALID_VERIFICATION_TOKEN", 400);
    this.name = "InvalidVerificationTokenError";
  }
}
