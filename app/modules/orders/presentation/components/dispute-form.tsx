import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components/ui/select";
import { Textarea } from "~/shared/components/ui/textarea";

const disputeSchema = z.object({
  reason: z.enum(["item_not_received", "item_not_as_described", "payment_issue", "other"] as const),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description is too long"),
});

export type DisputeFormValues = z.infer<typeof disputeSchema>;

interface DisputeFormProps {
  onSubmit: (values: DisputeFormValues) => void;
  isSubmitting?: boolean;
}

export function DisputeForm({ onSubmit, isSubmitting = false }: DisputeFormProps) {
  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      reason: undefined,
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Dispute</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="item_not_received">Item not received</SelectItem>
                  <SelectItem value="item_not_as_described">Item not as described</SelectItem>
                  <SelectItem value="payment_issue">Payment issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="destructive" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting Dispute..." : "Submit Dispute"}
        </Button>
      </form>
    </Form>
  );
}
