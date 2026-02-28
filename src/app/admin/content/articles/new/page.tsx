import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/ui/app-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "@/lib/actions/admin";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New Article"
        description="Create a new content article"
      />
      <ArticleForm action={createArticle} />
    </>
  );
}
