import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/blog/new")({ component: PostEditor });
