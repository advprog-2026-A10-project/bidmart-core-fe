import { useEffect, useState } from "react";

type CountdownTimerProps = {
  endsAt: string;
  className?: string;
};

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
};

function calculateTimeLeft(endsAt: string): TimeLeft {
  const distance = Math.max(new Date(endsAt).getTime() - Date.now(), 0);

  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    isFinished: distance <= 0,
  };
}

export function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => {
      setTimeLeft(calculateTimeLeft(endsAt));
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [endsAt]);

  if (!timeLeft) {
    return <span className={className}>--h --m --s</span>;
  }

  return (
    <span className={className}>
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
}
