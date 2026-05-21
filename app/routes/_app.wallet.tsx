import { Outlet } from "react-router";

import { createApiSessionGuardLoader } from "~/shared/infrastructure/auth/route-guard";

export const loader = createApiSessionGuardLoader({
  probePath: "/wallet",
});

export default function WalletLayoutRoute() {
  return <Outlet />;
}
