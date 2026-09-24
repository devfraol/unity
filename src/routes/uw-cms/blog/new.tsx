import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/uw-cms/blog/new")({ component: PostEditor });
