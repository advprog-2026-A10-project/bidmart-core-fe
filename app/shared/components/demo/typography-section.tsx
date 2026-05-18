type TypeSpec = {
  category: string;
  name: string;
  sample: string;
  className: string;
  size: string;
  weight: string;
  usage: string;
};

const typeScale: TypeSpec[] = [
  // Headings
  {
    category: "Heading",
    name: "H1",
    sample: "The fastest auction platform",
    className: "text-4xl font-bold leading-tight",
    size: "2.25 rem / 36 px",
    weight: "700 Bold",
    usage: "Page titles",
  },
  {
    category: "Heading",
    name: "H2",
    sample: "Active bids & listings",
    className: "text-3xl font-bold leading-tight",
    size: "1.875 rem / 30 px",
    weight: "700 Bold",
    usage: "Section headings",
  },
  {
    category: "Heading",
    name: "H3",
    sample: "Auction details",
    className: "text-2xl font-semibold leading-snug",
    size: "1.5 rem / 24 px",
    weight: "600 SemiBold",
    usage: "Card & panel headings",
  },
  {
    category: "Heading",
    name: "H4",
    sample: "Current highest bid",
    className: "text-xl font-semibold leading-snug",
    size: "1.25 rem / 20 px",
    weight: "600 SemiBold",
    usage: "Sub-panel headings",
  },
  // Subheadings
  {
    category: "Subheading",
    name: "Subheading L",
    sample: "Bid history",
    className: "text-lg font-semibold leading-normal",
    size: "1.125 rem / 18 px",
    weight: "600 SemiBold",
    usage: "Table & list headers",
  },
  {
    category: "Subheading",
    name: "Subheading",
    sample: "Seller information",
    className: "text-base font-semibold leading-normal",
    size: "1 rem / 16 px",
    weight: "600 SemiBold",
    usage: "Labels, group titles",
  },
  {
    category: "Subheading",
    name: "Subheading S",
    sample: "Condition: Like new",
    className: "text-sm font-medium leading-normal",
    size: "0.875 rem / 14 px",
    weight: "500 Medium",
    usage: "Metadata labels",
  },
  // Body
  {
    category: "Body",
    name: "Body L",
    sample: "This auction closes in 2 hours. Place your bid before the timer runs out.",
    className: "text-base font-normal leading-relaxed",
    size: "1 rem / 16 px",
    weight: "400 Regular",
    usage: "Primary reading text",
  },
  {
    category: "Body",
    name: "Body",
    sample: "Minimum increment: $10. All bids are binding once confirmed by the seller.",
    className: "text-sm font-normal leading-relaxed",
    size: "0.875 rem / 14 px",
    weight: "400 Regular",
    usage: "Default UI text",
  },
  {
    category: "Body",
    name: "Body S",
    sample: "Last updated 3 minutes ago",
    className: "text-xs font-normal leading-normal",
    size: "0.75 rem / 12 px",
    weight: "400 Regular",
    usage: "Captions, timestamps",
  },
];

const categories = ["Heading", "Subheading", "Body"] as const;

export function TypographySection() {
  return (
    <section className="space-y-10">
      <h2 className="text-xl font-semibold">Typography</h2>
      <p className="text-muted-foreground -mt-6 text-sm">
        Font family: <span className="font-semibold text-foreground">Plus Jakarta Sans</span>
      </p>

      {categories.map((category) => {
        const items = typeScale.filter((t) => t.category === category);
        return (
          <div key={category} className="space-y-4">
            <p className="text-muted-foreground text-sm font-medium">{category}</p>
            <div className="divide-y rounded-xl border">
              {items.map((spec) => (
                <div key={spec.name} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-6">
                  <div className="w-32 shrink-0 space-y-0.5">
                    <p className="text-xs font-semibold">{spec.name}</p>
                    <p className="text-muted-foreground font-mono text-xs">{spec.size}</p>
                    <p className="text-muted-foreground font-mono text-xs">{spec.weight}</p>
                    <p className="text-muted-foreground text-xs">{spec.usage}</p>
                  </div>
                  <p className={spec.className}>{spec.sample}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
