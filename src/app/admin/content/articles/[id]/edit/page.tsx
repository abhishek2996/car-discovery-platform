import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminArticle } from "@/lib/data/admin-dashboard";
import { updateArticle } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { ArticleForm } from "@/components/admin/article-form";

type tParams = Promise<{ id: string }>;

export default async function EditArticlePage({ params }: { params: tParams }) {
  await requireAdmin();
  const { id } = await params;

  const article = await getAdminArticle(id);
  if (!article) notFound();

  const action = updateArticle.bind(null, id);

  return (
    <>
      <PageHeader
        title="Edit Article"
        description={`Editing "${article.title}"`}
      />
      <ArticleForm
        action={action}
        defaultValues={{
          type: article.type,
          title: article.title,
          slug: article.slug,
          body: article.body ?? "",
          heroMediaUrl: article.heroMediaUrl ?? "",
          tags: article.tags ?? "",
          publishedAt: article.publishedAt,
        }}
      />
    </>
  );
}
