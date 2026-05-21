import { Outlet } from "react-router";

import { createApiSessionGuardLoader } from "~/shared/infrastructure/auth/route-guard";

export const loader = createApiSessionGuardLoader({
  probePath: "/seller/listings",
  probeQuery: {
    page: "1",
    page_size: "1",
  },
});

export default function SellerLayoutRoute() {
  return <Outlet />;
}
