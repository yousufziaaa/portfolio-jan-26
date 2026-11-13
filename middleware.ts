import { NextResponse, type NextRequest } from "next/server";

/**
 * LinkedIn files a page that has og:video as a video and then shows no
 * image, while iMessage plays the same tag inline. So LinkedIn's crawler
 * alone gets each page with its og:video tags taken out; everyone else is
 * passed straight through to the static page.
 */
const LINKEDIN = /LinkedInBot/i;
const SKIP = "x-skip-og-video";

export async function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!LINKEDIN.test(ua) || req.headers.has(SKIP)) return NextResponse.next();

  // Fetch the page as it's normally served (the header stops this running
  // again), then strip the video tags.
  const page = await fetch(req.url, { headers: { "user-agent": ua, [SKIP]: "1" } });
  const type = page.headers.get("content-type") ?? "";
  if (!page.ok || !type.includes("text/html")) return NextResponse.next();
  const html = (await page.text()).replace(/<meta property="og:video[^>]*>/g, "");
  return new NextResponse(html, { status: page.status, headers: { "content-type": type } });
}

// Pages only: not Next's assets, API routes or files like og.png.
export const config = {
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
