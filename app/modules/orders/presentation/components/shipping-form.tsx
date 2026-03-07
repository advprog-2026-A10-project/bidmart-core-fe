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
import { Input } from "~/shared/components/ui/input";

const shippingSchema = z.object({
  courier: z.string().min(1, "Courier name is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  estimatedDelivery: z.string().min(1, "Estimated delivery date is required"), // Validate as date string
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormValues>;
  onSubmit: (values: ShippingFormValues) => void;
  isSubmitting?: boolean;
}

export function ShippingForm({ defaultValues, onSubmit, isSubmitting = false }: ShippingFormProps) {
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      courier: "",
      trackingNumber: "",
      estimatedDelivery: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="courier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Courier Service</FormLabel>
              <FormControl>
                <Input placeholder="e.g. JNE, FedEx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. TRK123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedDelivery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Delivery Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Shipping Details"}
        </Button>
      </form>
    </Form>
  );
}
