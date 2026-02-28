import { prisma } from "@/lib/db";
import type { ContentArticleType, Prisma } from "@/generated/prisma";

export async function searchArticles(params: {
  type?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}) {
  const { type, tag, page = 1, pageSize = 12 } = params;

  const where: Prisma.ContentArticleWhereInput = {
    publishedAt: { not: null },
  };

  if (type) {
    where.type = type as ContentArticleType;
  }

  if (tag) {
    where.tags = { contains: tag, mode: "insensitive" };
  }

  const [articles, total] = await Promise.all([
    prisma.contentArticle.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contentArticle.count({ where }),
  ]);

  return { articles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getArticleBySlug(slug: string) {
  return prisma.contentArticle.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function getRelatedArticles(articleId: string, tags: string | null, limit = 4) {
  const where: Prisma.ContentArticleWhereInput = {
    id: { not: articleId },
    publishedAt: { not: null },
  };

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length > 0) {
      where.OR = tagList.map((t) => ({ tags: { contains: t, mode: "insensitive" as const } }));
    }
  }

  return prisma.contentArticle.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}
