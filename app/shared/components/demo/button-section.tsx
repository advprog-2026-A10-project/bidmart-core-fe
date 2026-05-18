import { Button } from "~/shared/components/ui/button";

export function ButtonSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Button</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">States</p>
        <div className="flex flex-wrap gap-3">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </section>
  );
}
