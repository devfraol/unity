import { createFileRoute } from "@tanstack/react-router";
import { BlogList } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms/blog/")({ component: BlogList });
