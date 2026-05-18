import { RadioGroup, RadioGroupItem } from "~/shared/components/ui/radio-group";
import { Label } from "~/shared/components/ui/label";

export function RadioGroupSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Radio Group</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Default</p>
        <RadioGroup defaultValue="option-1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-1" id="radio-1" />
            <Label htmlFor="radio-1">Option 1</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-2" id="radio-2" />
            <Label htmlFor="radio-2">Option 2</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option-3" id="radio-3" />
            <Label htmlFor="radio-3">Option 3</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">With disabled item</p>
        <RadioGroup defaultValue="plan-free">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="plan-free" id="plan-free" />
            <Label htmlFor="plan-free">Free plan</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="plan-pro" id="plan-pro" />
            <Label htmlFor="plan-pro">Pro plan</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="plan-enterprise" id="plan-enterprise" disabled />
            <Label htmlFor="plan-enterprise">Enterprise (contact sales)</Label>
          </div>
        </RadioGroup>
      </div>
    </section>
  );
}
