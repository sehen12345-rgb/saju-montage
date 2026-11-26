import { NextRequest, NextResponse } from "next/server";
import { generatePortraitSVG } from "@/lib/portrait";
import type { SajuInfo } from "@/lib/types";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const gender = (params.get("gender") ?? "male") as "male" | "female";
  const sajuInfo: SajuInfo = {
    yearPillar: params.get("year") ?? "갑자",
    monthPillar: params.get("month") ?? "병인",
    dayPillar: params.get("day") ?? "무오",
    hourPillar: params.get("hour") ?? "경신",
  };

  const svg = generatePortraitSVG(gender, sajuInfo);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
