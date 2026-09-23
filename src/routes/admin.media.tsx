import { createFileRoute } from "@tanstack/react-router";
import { Media } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/media")({ component: Media });
