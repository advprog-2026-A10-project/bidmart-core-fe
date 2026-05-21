import { Outlet } from "react-router";

import { createApiSessionGuardLoader } from "~/shared/infrastructure/auth/route-guard";

export const loader = createApiSessionGuardLoader({
  probePath: "/me/bids",
});

export default function AuctionsLayoutRoute() {
  return <Outlet />;
}
