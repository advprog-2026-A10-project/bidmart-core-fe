import { Outlet } from "react-router";

import { Footer } from "~/shared/components/elements/Footer/Footer";
import { Navbar } from "~/shared/components/elements/Navbar/Navbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
