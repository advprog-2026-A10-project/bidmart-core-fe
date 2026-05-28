type Swatch = { label: string; value: string; textClass: string };

const brandScale: Swatch[] = [
  { label: "50", value: "hsl(244 100% 97%)", textClass: "text-brand-900" },
  { label: "100", value: "hsl(244 95% 93%)", textClass: "text-brand-900" },
  { label: "200", value: "hsl(244 93% 84%)", textClass: "text-brand-900" },
  { label: "300", value: "hsl(244 92% 72%)", textClass: "text-brand-900" },
  { label: "400", value: "hsl(244 92% 58%)", textClass: "text-white" },
  { label: "500", value: "hsl(244 94% 46%)", textClass: "text-white" },
  { label: "600", value: "hsl(244 94% 40%)", textClass: "text-white" },
  { label: "700 — primary", value: "hsl(244 94% 35%)", textClass: "text-white" },
  { label: "800", value: "hsl(244 88% 25%)", textClass: "text-white" },
  { label: "900", value: "hsl(244 82% 17%)", textClass: "text-white" },
  { label: "950", value: "hsl(244 78% 10%)", textClass: "text-white" },
];

type SemanticSwatch = { token: string; cssVar: string; label: string; textClass: string };

const semanticTokens: SemanticSwatch[] = [
  {
    token: "Primary",
    cssVar: "var(--color-primary)",
    label: "#1005AD",
    textClass: "text-white",
  },
  {
    token: "Primary Foreground",
    cssVar: "var(--color-primary-foreground)",
    label: "On primary",
    textClass: "text-foreground",
  },
  {
    token: "Secondary",
    cssVar: "var(--color-secondary)",
    label: "Secondary fill",
    textClass: "text-secondary-foreground",
  },
  {
    token: "Accent",
    cssVar: "var(--color-accent)",
    label: "Hover / interactive",
    textClass: "text-accent-foreground",
  },
  {
    token: "Muted",
    cssVar: "var(--color-muted)",
    label: "Subtle background",
    textClass: "text-muted-foreground",
  },
  {
    token: "Destructive",
    cssVar: "var(--color-destructive)",
    label: "Error / danger",
    textClass: "text-white",
  },
  {
    token: "Background",
    cssVar: "var(--color-background)",
    label: "Page background",
    textClass: "text-foreground",
  },
  {
    token: "Foreground",
    cssVar: "var(--color-foreground)",
    label: "Body text",
    textClass: "text-white",
  },
  {
    token: "Border",
    cssVar: "var(--color-border)",
    label: "Dividers & edges",
    textClass: "text-foreground",
  },
  {
    token: "Ring",
    cssVar: "var(--color-ring)",
    label: "Focus ring",
    textClass: "text-white",
  },
];

export function ColorSection() {
  return (
    <section className="space-y-10">
      <h2 className="text-xl font-semibold">Colors</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Brand scale</p>
        <div className="flex flex-col overflow-hidden rounded-xl border">
          {brandScale.map((swatch) => (
            <div
              key={swatch.label}
              className="flex h-12 items-center justify-between px-4"
              style={{ backgroundColor: swatch.value }}
            >
              <span className={`text-sm font-medium ${swatch.textClass}`}>{swatch.label}</span>
              <span className={`font-mono text-xs ${swatch.textClass} opacity-75`}>
                {swatch.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Semantic tokens</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {semanticTokens.map((s) => (
            <div
              key={s.token}
              className="flex h-20 flex-col justify-between rounded-lg border p-3"
              style={{ backgroundColor: s.cssVar }}
            >
              <span className={`text-xs font-semibold ${s.textClass}`}>{s.token}</span>
              <span className={`text-xs ${s.textClass} opacity-70`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
