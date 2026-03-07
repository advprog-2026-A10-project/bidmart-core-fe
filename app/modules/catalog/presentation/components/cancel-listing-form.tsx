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
import { Textarea } from "~/shared/components/ui/textarea";

const cancelSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export type CancelFormValues = z.infer<typeof cancelSchema>;

interface CancelListingFormProps {
  onSubmit: (values: CancelFormValues) => void;
  isSubmitting?: boolean;
}

export function CancelListingForm({ onSubmit, isSubmitting = false }: CancelListingFormProps) {
  const form = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for cancellation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please explain why you are cancelling this listing..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
