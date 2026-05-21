import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "from-accent via-accent/40 to-accent animate-[shimmer_1.8s_ease-in-out_infinite] rounded-md bg-gradient-to-r bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
