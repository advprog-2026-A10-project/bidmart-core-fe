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
  maxAmount?: number;
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

  const schema = z
    .object({
      amount: z
        .number({ message: "Masukkan nominal bid yang valid." })
        .finite("Masukkan nominal bid yang valid.")
        .refine((value) => value >= minimumAllowed, {
          message: `Bid minimum adalah Rp${minimumAllowed.toLocaleString("id-ID")}.`,
        }),
      maxAmount: z
        .number({ message: "Masukkan nominal proxy max yang valid." })
        .positive("Proxy max harus lebih besar dari 0.")
        .optional(),
    })
    .refine((values) => values.maxAmount === undefined || values.maxAmount >= values.amount, {
      message: "Proxy max harus lebih besar atau sama dengan nominal bid.",
      path: ["maxAmount"],
    });

  const form = useForm<BidFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: minimumAllowed,
      maxAmount: undefined,
    },
  });

  useEffect(() => {
    form.reset({ amount: minimumAllowed, maxAmount: undefined });
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
                  onChange={(event) => field.onChange(Number(event.target.value))}
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

        <FormField
          control={form.control}
          name="maxAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proxy max (opsional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={minimumAllowed}
                  step={minIncrement}
                  inputMode="numeric"
                  placeholder="Contoh: 20000000"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value.trim();
                    field.onChange(nextValue === "" ? undefined : Number(nextValue));
                  }}
                />
              </FormControl>
              <FormDescription>
                Jika diisi, sistem akan melakukan auto-bid sampai batas ini saat ada penawaran lain.
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
