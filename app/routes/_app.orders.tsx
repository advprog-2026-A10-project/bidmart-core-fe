import { Outlet } from "react-router";

import { createApiSessionGuardLoader } from "~/shared/infrastructure/auth/route-guard";

export const loader = createApiSessionGuardLoader({
  probePath: "/orders",
});

export default function OrdersLayoutRoute() {
  return <Outlet />;
}
