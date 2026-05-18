import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  BellIcon,
  ChevronDownIcon,
  GavelIcon,
  LayoutGridIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  ShoppingBagIcon,
  StoreIcon,
  TrendingUpIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "~/shared/components/ui/avatar";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { Separator } from "~/shared/components/ui/separator";

const PLACEHOLDER_USER = {
  name: "John Doe",
  email: "john@example.com",
  initials: "JD",
  balance: "1,200.00",
  notificationCount: 3,
};

const primaryNav = [
  { label: "Catalog", to: "/catalog", icon: LayoutGridIcon },
  { label: "My Bids", to: "/me/bids", icon: TrendingUpIcon },
  { label: "Orders", to: "/orders", icon: PackageIcon },
];

const mobileNav = [
  { label: "Catalog", to: "/catalog", icon: LayoutGridIcon },
  { label: "My Bids", to: "/me/bids", icon: TrendingUpIcon },
  { label: "Orders", to: "/orders", icon: PackageIcon },
  { label: "Wallet", to: "/wallet", icon: WalletIcon },
  { label: "Notifications", to: "/notifications", icon: BellIcon },
  { label: "My Listings", to: "/seller/listings", icon: StoreIcon },
  { label: "Seller Orders", to: "/seller/orders", icon: ShoppingBagIcon },
];

function BidMartLogo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 outline-none">
      <div className="bg-primary flex size-8 items-center justify-center rounded-lg shadow-[0_1px_2px_rgba(16,5,173,0.3)] transition-all duration-150 group-hover:shadow-[0_2px_6px_rgba(16,5,173,0.4)]">
        <GavelIcon className="size-4 text-white" />
      </div>
      <span className="text-[1.1rem] font-bold tracking-tight">BidMart</span>
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { name, initials, balance, notificationCount } = PLACEHOLDER_USER;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    if (mediaQuery.matches) {
      setMobileOpen(false);
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <BidMartLogo />

        {/* Desktop primary nav */}
        <nav className="ml-2 hidden items-center gap-0.5 sm:flex">
          {primaryNav.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Wallet */}
          <Button variant="ghost" size="sm" className="hidden gap-2 sm:flex" asChild>
            <Link to="/wallet">
              <WalletIcon className="size-4" />
              <span className="font-semibold">${balance}</span>
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/notifications">
              <BellIcon className="size-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full p-0 text-[10px]">
                  {notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDownIcon className="hidden size-3.5 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{name}</span>
                  <span className="text-muted-foreground text-xs">{PLACEHOLDER_USER.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/me/bids">
                    <TrendingUpIcon />
                    My Bids
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">
                    <PackageIcon />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wallet">
                    <WalletIcon />
                    Wallet
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                  Seller
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/seller/listings">
                    <StoreIcon />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/seller/orders">
                    <ShoppingBagIcon />
                    Seller Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOutIcon />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-40 border-t bg-background px-4 pb-4 pt-2 shadow-lg sm:hidden">
          <nav className="flex flex-col gap-0.5">
            {mobileNav.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          <Separator className="my-3" />
          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-muted-foreground text-xs">${balance} in wallet</p>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-2">
              <LogOutIcon className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
