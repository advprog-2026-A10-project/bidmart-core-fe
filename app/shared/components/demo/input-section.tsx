import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";

export function InputSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Input</h2>

      <div className="grid max-w-sm gap-4">
        <div className="space-y-2">
          <Label htmlFor="input-default">Default</Label>
          <Input id="input-default" placeholder="Enter text..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-email">Email</Label>
          <Input id="input-email" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-password">Password</Label>
          <Input id="input-password" type="password" placeholder="••••••••" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-disabled">Disabled</Label>
          <Input id="input-disabled" disabled placeholder="Not editable" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-file">File</Label>
          <Input id="input-file" type="file" />
        </div>
      </div>
    </section>
  );
}
