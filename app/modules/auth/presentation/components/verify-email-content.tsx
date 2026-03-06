import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/shared/components/ui/form";
import { Input } from "~/shared/components/ui/input";
import { Button } from "~/shared/components/ui/button";
import { useVerifyEmailMutation } from "../hooks/use-verify-email-mutation";
import { useResendVerificationMutation } from "../hooks/use-resend-verification-mutation";

const resendFormSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
});

type ResendFormValues = z.infer<typeof resendFormSchema>;

interface VerifyEmailContentProps {
  token?: string;
  email?: string;
}

/**
 * VerifyEmailContent — handles two states:
 * 1. Token present → auto-verify on mount, show spinner → success/error message.
 * 2. No token → show "Check your email" + resend form.
 */
export function VerifyEmailContent({ token, email }: VerifyEmailContentProps) {
  const verifyEmail = useVerifyEmailMutation();
  const resendVerification = useResendVerificationMutation();

  const form = useForm<ResendFormValues>({
    resolver: zodResolver(resendFormSchema),
    defaultValues: { email: email ?? "" },
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token });
    }
    // Intentionally only runs on mount when token is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleResend(values: ResendFormValues) {
    resendVerification.mutate({ email: values.email });
  }

  // Token present — show verification status
  if (token) {
    if (verifyEmail.isPending) {
      return (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div
            className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
            role="status"
            aria-label="Verifying email"
          />
          <p className="text-muted-foreground text-sm">Verifying your email…</p>
        </div>
      );
    }

    if (verifyEmail.isSuccess) {
      return (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-sm font-medium text-green-600">
            {verifyEmail.data.message || "Your email has been verified!"}
          </p>
          <Button asChild>
            <Link to="/login">Continue to sign in</Link>
          </Button>
        </div>
      );
    }

    if (verifyEmail.isError) {
      return (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-destructive text-sm font-medium">
            {verifyEmail.error.message || "Verification failed. The link may have expired."}
          </p>
          <Button variant="outline" onClick={() => verifyEmail.reset()}>
            Try again
          </Button>
        </div>
      );
    }
  }

  // No token — show "check your inbox" + resend form
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        We sent a verification link to your email. Click the link to activate your account.
      </p>

      <div className="rounded-lg border p-4">
        <p className="mb-4 text-sm font-medium">Didn&apos;t receive the email?</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleResend)} className="space-y-3" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={resendVerification.isPending}
            >
              {resendVerification.isPending ? "Sending..." : "Resend verification email"}
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        <Link to="/login" className="hover:text-primary font-medium underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
