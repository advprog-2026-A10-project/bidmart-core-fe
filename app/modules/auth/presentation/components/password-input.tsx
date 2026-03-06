import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "~/shared/components/ui/input";
import { Button } from "~/shared/components/ui/button";
import type { ComponentPropsWithoutRef } from "react";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

/**
 * PasswordInput — an Input that toggles between password and text visibility.
 */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className={className} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOff className="text-muted-foreground h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
