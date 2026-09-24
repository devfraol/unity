import { createFileRoute } from "@tanstack/react-router";
import { Comments } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms/comments")({ component: Comments });
