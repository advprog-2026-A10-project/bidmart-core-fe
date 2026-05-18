import { Textarea } from "~/shared/components/ui/textarea";
import { Label } from "~/shared/components/ui/label";

export function TextareaSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Textarea</h2>

      <div className="grid max-w-sm gap-4">
        <div className="space-y-2">
          <Label htmlFor="textarea-default">Default</Label>
          <Textarea id="textarea-default" placeholder="Type your message here..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-prefilled">Pre-filled</Label>
          <Textarea
            id="textarea-prefilled"
            defaultValue="This textarea already has some content inside it to show how it looks with text."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-disabled">Disabled</Label>
          <Textarea id="textarea-disabled" disabled placeholder="Not editable" />
        </div>
      </div>
    </section>
  );
}
