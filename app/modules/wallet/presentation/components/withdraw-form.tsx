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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { WALLET_MOCK_PAYLOADS } from "../pages/constant";

const MAX_BALANCE = WALLET_MOCK_PAYLOADS.getWalletBalance.response.success.balance;

const withdrawSchema = z.object({
  amount: z.coerce
    .number()
    .min(10000, "Minimum withdrawal is Rp 10.000")
    .max(MAX_BALANCE, `Insufficient balance (Max: ${MAX_BALANCE.toLocaleString("id-ID")})`),
  bankAccount: z.string().min(5, "Bank account number is too short"),
  bankName: z.enum(["BCA", "BNI", "BRI", "Mandiri", "CIMB"] as const),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export function WithdrawForm() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      bankAccount: "",
      bankName: "BCA" as const,
    },
  });

  function onSubmit(data: WithdrawFormValues) {
    console.log("Withdraw Data:", data);
    toast.success("Withdrawal request submitted!");
    navigate("/wallet");
  }

  return (
    <Card className="border-t-destructive/80 mx-auto w-full max-w-md border-t-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-destructive text-2xl font-bold tracking-tight">
          Withdraw Funds
        </CardTitle>
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
                  <div className="text-muted-foreground text-right text-xs">
                    Max: Rp {MAX_BALANCE.toLocaleString("id-ID")}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BCA">BCA</SelectItem>
                      <SelectItem value="BNI">BNI</SelectItem>
                      <SelectItem value="BRI">BRI</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                      <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="destructive" className="h-12 w-full text-lg">
              Withdraw Funds
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
