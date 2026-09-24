import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AdminRoute,
});
function AdminRoute() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return path === "/admin/login" ? (
    <Outlet />
  ) : (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
