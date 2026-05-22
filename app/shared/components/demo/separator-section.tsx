import { Separator } from "~/shared/components/ui/separator";

export function SeparatorSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Separator</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Horizontal</p>
        <div className="space-y-2">
          <p className="text-sm">Above separator</p>
          <Separator />
          <p className="text-sm">Below separator</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Vertical</p>
        <div className="flex h-8 items-center gap-3">
          <span className="text-sm">Blog</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Docs</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Source</span>
        </div>
      </div>
    </section>
  );
}
