import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/shared/components/ui/form";
import { Input } from "~/shared/components/ui/input";
import { useMemo } from "react";

interface BidFormProps {
  currentBid: number;
  minIncrement: number;
  onSubmit: (amount: number) => void;
  isSubmitting?: boolean;
}

export function BidForm({ currentBid, minIncrement, onSubmit, isSubmitting }: BidFormProps) {
  const minBid = currentBid + minIncrement;

  const formSchema = useMemo(
    () =>
      z.object({
        amount: z.coerce.number().min(minBid, `Bid must be at least ${minBid.toLocaleString()}`),
      }),
    [minBid],
  );

  const form = useForm<{ amount: number }>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: minBid,
    },
  });

  function handleSubmit(values: { amount: number }) {
    onSubmit(values.amount);
    // We don't reset here immediately, let the parent handle success/refetch
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Bid</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    Rp
                  </span>
                  <Input type="number" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Placing Bid..." : "Place Bid"}
        </Button>
      </form>
    </Form>
  );
}
