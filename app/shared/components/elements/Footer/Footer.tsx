import { Link } from "react-router";
import { GavelIcon, GithubIcon, InstagramIcon, TwitterIcon } from "lucide-react";

import { Separator } from "~/shared/components/ui/separator";

const footerLinks = {
  Platform: [{ label: "Catalog", href: "/catalog" }],
  Buyers: [
    { label: "My Bids", href: "/me/bids" },
    { label: "Orders", href: "/orders" },
    { label: "Wallet", href: "/wallet" },
    { label: "Notifications", href: "/notifications" },
  ],
  Sellers: [
    { label: "Create Listing", href: "/seller/listings/new" },
    { label: "My Listings", href: "/seller/listings" },
    { label: "Seller Orders", href: "/seller/orders" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link to="/" className="mb-4 flex items-center gap-2.5">
              <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                <GavelIcon className="size-4 text-white" />
              </div>
              <span className="text-[1.1rem] font-bold tracking-tight">BidMart</span>
            </Link>
            <p className="text-muted-foreground mb-5 max-w-xs text-sm leading-relaxed">
              The premier online bidding marketplace. Discover, bid, and win unique items from
              sellers around the world.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
              >
                <TwitterIcon className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
              >
                <GithubIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h3 className="mb-3 text-sm font-semibold">{group}</h3>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} BidMart. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Developed by <span className="text-foreground font-semibold">AdvProg A10</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
