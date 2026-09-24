import { createFileRoute } from "@tanstack/react-router";
import { Categories } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms/categories")({ component: Categories });
