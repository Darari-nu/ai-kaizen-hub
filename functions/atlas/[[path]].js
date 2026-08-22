// darari-nu.com/atlas 配下を、別Cloudflare Pagesプロジェクト(ai-reg-atlas)へ透過的に中継する。
// AI Reg Atlas側はASTRO_BASE=/atlas でビルドしているため、パスはそのまま転送すればよい。
const UPSTREAM_ORIGIN = 'https://ai-reg-atlas.pages.dev';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const upstreamUrl = new URL(url.pathname + url.search, UPSTREAM_ORIGIN);
  const upstreamRequest = new Request(upstreamUrl.toString(), context.request);
  return fetch(upstreamRequest);
}
