import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router";

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
import { Label } from "~/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/shared/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";

const topUpSchema = z.object({
  amount: z.coerce
    .number()
    .min(10000, "Minimum top up amount is Rp 10.000")
    .positive("Amount must be positive"),
  paymentMethod: z.enum(["bank_transfer", "credit_card", "ewallet"] as const),
});

type TopUpFormValues = z.infer<typeof topUpSchema>;

export function TopUpForm() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "bank_transfer" as const,
    },
  });

  function onSubmit(data: TopUpFormValues) {
    console.log("TopUp Data:", data);
    toast.success("Top up request submitted!");
    navigate("/wallet");
  }

  return (
    <Card className="border-t-primary/80 mx-auto w-full max-w-md border-t-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Top Up Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (IDR)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-2.5 left-3 font-medium">
                        Rp
                      </span>
                      <Input
                        placeholder="0"
                        type="number"
                        className="pl-10 text-lg font-medium"
                        {...field}
                        value={field.value as number}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="hover:bg-muted/50 flex cursor-pointer items-center space-y-0 space-x-3 rounded-md border p-4 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="bank_transfer" />
                        </FormControl>
                        <Label className="flex-1 cursor-pointer font-normal">Bank Transfer</Label>
                      </FormItem>
                      <FormItem className="hover:bg-muted/50 flex cursor-pointer items-center space-y-0 space-x-3 rounded-md border p-4 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="credit_card" />
                        </FormControl>
                        <Label className="flex-1 cursor-pointer font-normal">Credit Card</Label>
                      </FormItem>
                      <FormItem className="hover:bg-muted/50 flex cursor-pointer items-center space-y-0 space-x-3 rounded-md border p-4 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="ewallet" />
                        </FormControl>
                        <Label className="flex-1 cursor-pointer font-normal">E-Wallet</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="h-12 w-full text-lg">
              Top Up Now
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
