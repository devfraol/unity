import { createFileRoute } from "@tanstack/react-router";
import { Categories } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/categories")({ component: Categories });
