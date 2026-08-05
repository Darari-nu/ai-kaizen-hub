import { defineCollection, z } from 'astro:content';

// 記事は別レーンで執筆中。このスキーマのfrontmatterを付けたMarkdownを
// src/content/articles/ に置けば公開される（draft: trueなら一覧に「準備中」表示・ページ非公開）。
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    series: z.string().optional(), // 例: 「○○にお金払ってません？」
    number: z.number(), // 整理番号（No.001…帳票風リストの表示順）
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
