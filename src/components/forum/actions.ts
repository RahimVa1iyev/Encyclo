"use server";

import { prisma } from "@/lib/db";

export async function addForumPostAction(productId: string, name: string, content: string, parentId: string | null = null) {
  const newPost = await prisma.forumPost.create({
    data: {
      product_id: productId,
      user_id: null,
      author_name: name,
      content: content,
      is_faq: false,
      parent_id: parentId
    },
    select: {
      id: true,
      author_name: true,
      content: true,
      created_at: true,
      parent_id: true
    }
  });

  return newPost;
}

export async function getForumPostsAction(productId: string) {
  const posts = await prisma.forumPost.findMany({
    where: {
      product_id: productId,
      is_faq: false
    },
    select: {
      id: true,
      author_name: true,
      content: true,
      created_at: true,
      parent_id: true
    },
    orderBy: { created_at: 'asc' }
  });

  return posts;
}
