import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchSessionUser, resolveLoginUrl, signOut, type SessionUser } from "./auth-client";

export const SESSION_QUERY_KEY = ["auth", "session"] as const;

/**
 * Returns the current session user along with `isLoading` / `isSignedIn`
 * helpers. Backed by TanStack Query with a 5-minute stale time so the
 * navbar does not re-validate the session on every render.
 */
export function useSession() {
  const query = useQuery<SessionUser | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSessionUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isSignedIn: !!query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Mutation wrapper around `signOut` that clears the session cache and
 * redirects to the login page so the next page load goes through the
 * unauthenticated path.
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: signOut,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });

  const trigger = useCallback(async () => {
    await mutation.mutateAsync();
    if (typeof window !== "undefined") {
      const redirectTarget = window.location.href;
      window.location.href = resolveLoginUrl(redirectTarget);
    }
  }, [mutation]);

  return {
    signOut: trigger,
    isSigningOut: mutation.isPending,
  };
}
