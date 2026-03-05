import { apiClient } from "~/shared/infrastructure/http/api-client";
import type { User } from "~/modules/auth/domain/entities/user";
import type { IAuthRepository } from "~/modules/auth/domain/repositories/auth-repository.interface";
import { loginApiSchema, messageApiSchema, registerApiSchema } from "../api/schemas";
import { AuthApiMapper } from "../api/auth-api.mapper";

/**
 * AuthApiRepository — concrete implementation of IAuthRepository.
 *
 * LSP: fully substitutable for IAuthRepository everywhere it is used.
 * OCP: new data sources extend IAuthRepository without modifying use cases.
 *
 * All responses are validated against Zod schemas at this boundary (fail-fast).
 */
export class AuthApiRepository implements IAuthRepository {
  private readonly basePath = "/auth";

  async login(credentials: { email: string; password: string }): Promise<User> {
    const raw = await apiClient.post<unknown>(`${this.basePath}/login`, credentials);
    const validated = loginApiSchema.parse(raw);
    return AuthApiMapper.toDomain(validated.user);
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ message: string }> {
    const raw = await apiClient.post<unknown>(`${this.basePath}/register`, data);
    const validated = registerApiSchema.parse(raw);
    return { message: validated.message };
  }

  async verifyEmail(data: { token: string }): Promise<{ message: string }> {
    const raw = await apiClient.post<unknown>(`${this.basePath}/verify-email`, data);
    const validated = messageApiSchema.parse(raw);
    return { message: validated.message };
  }

  async resendVerification(data: { email: string }): Promise<{ message: string }> {
    const raw = await apiClient.post<unknown>(`${this.basePath}/resend-verification`, data);
    const validated = messageApiSchema.parse(raw);
    return { message: validated.message };
  }

  async logout(): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/logout`);
  }
}
