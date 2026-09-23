import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/AdminApp";
export const Route = createFileRoute("/admin/blog/$id/edit")({
  component: () => <PostEditor id={Route.useParams().id} />,
});
