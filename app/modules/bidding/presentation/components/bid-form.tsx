import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/shared/components/ui/form";
import { Input } from "~/shared/components/ui/input";

type BidFormValues = {
  amount: number;
};

type BidFormProps = {
  currentBid: number;
  minIncrement: number;
  isSubmitting?: boolean;
  onSubmit: (values: BidFormValues) => Promise<void> | void;
};

export function BidForm({
  currentBid,
  minIncrement,
  isSubmitting = false,
  onSubmit,
}: BidFormProps) {
  const minimumAllowed = currentBid + minIncrement;

  const schema = z.object({
    amount: z.coerce
      .number({ message: "Masukkan nominal bid yang valid." })
      .finite("Masukkan nominal bid yang valid.")
      .refine((value) => value >= minimumAllowed, {
        message: `Bid minimum adalah Rp${minimumAllowed.toLocaleString("id-ID")}.`,
      }),
  });

  const form = useForm<BidFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: minimumAllowed,
    },
  });

  useEffect(() => {
    form.reset({ amount: minimumAllowed });
  }, [form, minimumAllowed]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominal bid</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={minimumAllowed}
                  step={minIncrement}
                  inputMode="numeric"
                  placeholder="Masukkan nominal bid"
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormDescription>
                Bid berikutnya minimal Rp{minimumAllowed.toLocaleString("id-ID")} dan harus
                mengikuti increment Rp{minIncrement.toLocaleString("id-ID")}. Jika bid masuk di 2
                menit terakhir, waktu lelang akan otomatis bertambah 2 menit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Place Bid"}
        </Button>
      </form>
    </Form>
  );
}
