import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "~/lib/utils";

interface CountdownTimerProps {
  endsAt: string;
  className?: string;
}

export function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endsAt).getTime();
      const now = Date.now();
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeLeft("0h 0m 0s");
        setIsEnded(true);
        return true; // should stop
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setIsEnded(false);
      return false;
    };

    // Initial calculation
    const shouldStop = calculateTime();
    if (shouldStop) return;

    const interval = setInterval(() => {
      if (calculateTime()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) return null; // Avoid hydration mismatch or flash

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-mono text-sm font-medium",
        isEnded ? "text-destructive" : "text-primary",
        className,
      )}
    >
      <Clock className="h-4 w-4" />
      <span>{isEnded ? "Auction Ended" : timeLeft}</span>
    </div>
  );
}
