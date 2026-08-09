import { defineCollection, z } from 'astro:content';

// 記事は別レーンで執筆中。このスキーマのfrontmatterを付けたMarkdownを
// src/content/articles/ に置けば公開される（draft: trueなら一覧に「準備中」表示・ページ非公開）。
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    series: z.string().optional(), // 記録｜AIカイゼン｜ガバナンス
    number: z.number(), // 整理番号（No.001…帳票風リストの表示順）
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
    // AIカイゼン軸のみ: トップの「できることメニュー」で見せる呼び込み文（2026-08-08 darari発案）。
    // 記事タイトルは正、hookはメニュー用の別ラベル。釣り防止のためメニューには正式タイトルも併記される。
    hook: z.string().optional(),
  }),
});

export const collections = { articles };
