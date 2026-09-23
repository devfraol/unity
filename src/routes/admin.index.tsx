import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/")({ component: Dashboard });
