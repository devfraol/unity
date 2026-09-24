import { createFileRoute } from "@tanstack/react-router";
import { Media } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms/media")({ component: Media });
