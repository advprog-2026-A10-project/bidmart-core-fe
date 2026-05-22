import { Outlet } from "react-router";

import { createApiSessionGuardLoader } from "~/shared/infrastructure/auth/route-guard";

export const loader = createApiSessionGuardLoader({
  probePath: "/notifications",
  probeQuery: {
    limit: "1",
  },
});

export default function NotificationsLayoutRoute() {
  return <Outlet />;
}
