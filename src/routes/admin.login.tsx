import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/login")({ component: AdminLogin });
