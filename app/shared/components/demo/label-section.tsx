import { Label } from "~/shared/components/ui/label";
import { Input } from "~/shared/components/ui/input";
import { Checkbox } from "~/shared/components/ui/checkbox";

export function LabelSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Label</h2>

      <div className="space-y-4">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="label-input">Paired with input</Label>
          <Input id="label-input" placeholder="Enter value..." />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="label-checkbox" />
          <Label htmlFor="label-checkbox">Paired with checkbox</Label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="label-disabled-chk" disabled />
            <Label htmlFor="label-disabled-chk">Disabled label (inherits peer state)</Label>
          </div>
        </div>
      </div>
    </section>
  );
}
