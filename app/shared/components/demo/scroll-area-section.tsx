import { ScrollArea } from "~/shared/components/ui/scroll-area";
import { Separator } from "~/shared/components/ui/separator";

const tags = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Next.js",
  "Vite",
  "Zustand",
  "React Query",
  "Zod",
  "React Hook Form",
  "Radix UI",
  "Framer Motion",
  "Lucide Icons",
  "Prettier",
  "ESLint",
];

export function ScrollAreaSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Scroll Area</h2>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Vertical</p>
          <ScrollArea className="h-48 w-56 rounded-md border">
            <div className="p-4">
              {tags.map((tag) => (
                <div key={tag}>
                  <p className="text-sm">{tag}</p>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Horizontal</p>
          <ScrollArea className="w-56 rounded-md border">
            <div className="flex gap-4 p-4">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-muted shrink-0 rounded-md px-3 py-1 text-sm whitespace-nowrap"
                >
                  {tag}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}
