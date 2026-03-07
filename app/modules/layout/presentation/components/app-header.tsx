import { Link, NavLink } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/shared/components/ui/avatar";
import { Badge } from "~/shared/components/ui/badge";
import { cn } from "~/lib/utils";

const mockCurrentUser = {
  id: "user-1",
  name: "Budi Santoso",
  role: "buyer" as "buyer" | "seller",
};

const navLinks = [
  { to: "/catalog", label: "Catalog" },
  { to: "/me/bids", label: "My Bids" },
  { to: "/wallet", label: "Wallet" },
  { to: "/orders", label: "Orders" },
  { to: "/notifications", label: "Notifications" },
];

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center px-4 md:px-8">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight">Bidmart</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "hover:text-foreground/80 transition-colors",
                    isActive ? "text-foreground" : "text-foreground/60",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-3">
            <div className="flex hidden flex-col items-end sm:flex">
              <span className="text-sm leading-none font-medium">{mockCurrentUser.name}</span>
              <Badge variant="secondary" className="mt-1 h-5 px-1.5 text-[10px] font-normal">
                {mockCurrentUser.role}
              </Badge>
            </div>
            <Avatar className="h-8 w-8 border">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${mockCurrentUser.name}`}
                alt={mockCurrentUser.name}
              />
              <AvatarFallback>{mockCurrentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
