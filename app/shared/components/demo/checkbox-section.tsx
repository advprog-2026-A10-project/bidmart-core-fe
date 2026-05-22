import { Checkbox } from "~/shared/components/ui/checkbox";
import { Label } from "~/shared/components/ui/label";

export function CheckboxSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Checkbox</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">States</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-unchecked" />
            <Label htmlFor="checkbox-unchecked">Unchecked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-checked" defaultChecked />
            <Label htmlFor="checkbox-checked">Checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-disabled" disabled />
            <Label htmlFor="checkbox-disabled">Disabled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
            <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
          </div>
        </div>
      </div>
    </section>
  );
}
