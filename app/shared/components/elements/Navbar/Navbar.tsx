import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
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

import { getOrderUseCases } from "~/modules/order/infrastructure";
import { getWalletUseCases } from "~/modules/wallet/infrastructure/factories/wallet-repository.factory";
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
import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  deriveInitials,
  resolveLoginUrl,
  useSession,
  useSignOut,
  type SessionUser,
} from "~/shared/infrastructure/auth";

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

const WALLET_BALANCE_QUERY_KEY = ["navbar", "wallet-balance"] as const;
const NOTIFICATION_COUNT_QUERY_KEY = ["navbar", "notification-count"] as const;
const NOTIFICATION_BADGE_CAP = 9;

function formatBalance(availableCents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(availableCents);
}

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

function SignedOutActions() {
  const location = useLocation();

  // When the user has no active session, show a single Sign in CTA and route
  // them to the auth-fe login page (preserving the current location so they
  // come back here after authenticating).
  const loginUrl = useMemo(() => {
    const target =
      typeof window !== "undefined"
        ? `${window.location.origin}${location.pathname}${location.search}${location.hash}`
        : undefined;
    return resolveLoginUrl(target);
  }, [location.hash, location.pathname, location.search]);

  return (
    <Button size="sm" asChild>
      <a href={loginUrl}>Sign in</a>
    </Button>
  );
}

function NavbarSessionSkeleton() {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Skeleton className="hidden h-8 w-24 sm:block" />
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

function SignedInActions({ user }: { user: SessionUser }) {
  const location = useLocation();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === location.pathname;

  const initials = useMemo(
    () => deriveInitials(user.name, user.email),
    [user.name, user.email],
  );

  const walletBalanceQuery = useQuery({
    queryKey: WALLET_BALANCE_QUERY_KEY,
    queryFn: () => getWalletUseCases().getWallet.execute(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const notificationCountQuery = useQuery({
    queryKey: NOTIFICATION_COUNT_QUERY_KEY,
    queryFn: async () => {
      const notifications = await getOrderUseCases().listNotifications.execute({
        unreadOnly: true,
      });
      return notifications.length;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { signOut, isSigningOut } = useSignOut();
  const notificationCount = notificationCountQuery.data ?? 0;
  const notificationBadgeLabel =
    notificationCount > NOTIFICATION_BADGE_CAP
      ? `${NOTIFICATION_BADGE_CAP}+`
      : String(notificationCount);

  return (
    <>
      <div className="ml-auto flex items-center gap-1">
        {/* Wallet */}
        <Button variant="ghost" size="sm" className="hidden gap-2 sm:flex" asChild>
          <Link to="/wallet">
            <WalletIcon className="size-4" />
            <span className="font-semibold">
              {walletBalanceQuery.isLoading ? (
                <Skeleton className="inline-block h-4 w-14 align-middle" />
              ) : walletBalanceQuery.isError || !walletBalanceQuery.data ? (
                "—"
              ) : (
                formatBalance(walletBalanceQuery.data.availableCents)
              )}
            </span>
          </Link>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/notifications">
            <BellIcon className="size-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full p-0 text-[10px]">
                {notificationBadgeLabel}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ring-offset-background focus-visible:ring-ring ml-1 flex items-center gap-2 rounded-full transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDownIcon className="text-muted-foreground hidden size-3.5 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{user.name || user.email}</span>
                <span className="text-muted-foreground text-xs">{user.email}</span>
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
            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onSelect={(event) => {
                event.preventDefault();
                void signOut();
              }}
            >
              <LogOutIcon />
              {isSigningOut ? "Signing out…" : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 sm:hidden"
          onClick={() =>
            setMobileOpenPath((openPath) =>
              openPath === location.pathname ? null : location.pathname,
            )
          }
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </Button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="bg-background absolute inset-x-0 top-full z-40 border-t px-4 pt-2 pb-4 shadow-lg sm:hidden">
          <nav className="flex flex-col gap-0.5">
            {mobileNav.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpenPath(null)}
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
              <p className="text-sm font-semibold">{user.name || user.email}</p>
              <p className="text-muted-foreground text-xs">
                {walletBalanceQuery.data
                  ? `${formatBalance(walletBalanceQuery.data.availableCents)} available`
                  : user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-2"
              disabled={isSigningOut}
              onClick={() => void signOut()}
            >
              <LogOutIcon className="size-4" />
              {isSigningOut ? "Signing out…" : "Sign Out"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function Navbar() {
  const { user, isLoading, isSignedIn } = useSession();

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <BidMartLogo />

        {/* Desktop primary nav (always visible — browsing the catalog does
            not require a session) */}
        <nav className="ml-2 hidden items-center gap-0.5 sm:flex">
          {primaryNav.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
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

        {isLoading ? (
          <NavbarSessionSkeleton />
        ) : isSignedIn && user ? (
          <SignedInActions user={user} />
        ) : (
          <div className="ml-auto">
            <SignedOutActions />
          </div>
        )}
      </div>
    </header>
  );
}
