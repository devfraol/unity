import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AdminRoute,
});
function AdminRoute() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return path === "/uw-cms/login" ? (
    <Outlet />
  ) : (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
