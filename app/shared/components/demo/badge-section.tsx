import { Badge } from "~/shared/components/ui/badge";

export function BadgeSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Badge</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
        </div>
      </div>
    </section>
  );
}
