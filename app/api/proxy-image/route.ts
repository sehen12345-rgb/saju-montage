import { NextRequest, NextResponse } from "next/server";

const RETRY_COUNT = 5;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url 파라미터가 없습니다." }, { status: 400 });
  }

  for (let attempt = 0; attempt < RETRY_COUNT; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(60000),
      });

      if (res.status === 429) {
        // 레이트 리밋: 대기 후 재시도
        if (attempt < RETRY_COUNT - 1) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        return NextResponse.json({ error: "이미지 서비스가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
      }

      if (!res.ok) {
        return NextResponse.json({ error: `이미지 요청 실패: ${res.status}` }, { status: 502 });
      }

      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buffer = await res.arrayBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (err) {
      if (attempt < RETRY_COUNT - 1) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      console.error("proxy-image error:", err);
      return NextResponse.json({ error: "이미지를 가져오지 못했습니다." }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "재시도 횟수를 초과했습니다." }, { status: 504 });
}
