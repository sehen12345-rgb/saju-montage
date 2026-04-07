import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "내 배우자 얼굴봤다 - 사주로 보는 운명의 상대";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #78350f 0%, #b45309 30%, #d97706 60%, #f59e0b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 원형 장식 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        {/* 육각형 패턴 배경 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            fontSize: 48,
            display: "flex",
            flexWrap: "wrap",
            gap: 40,
            padding: 20,
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i}>☯</span>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            zIndex: 10,
          }}
        >
          {/* 아이콘 뱃지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "3px solid rgba(255,255,255,0.3)",
              fontSize: 64,
            }}
          >
            🔮
          </div>

          {/* 타이틀 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-2px",
                lineHeight: 1,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              내 배우자 얼굴봤다
            </span>
            <span
              style={{
                fontSize: 34,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                letterSpacing: "1px",
              }}
            >
              사주팔자로 그려진 운명의 상대 ✨
            </span>
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: 80,
              height: 3,
              background: "rgba(255,255,255,0.4)",
              borderRadius: 2,
            }}
          />

          {/* 기능 태그들 */}
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["🎨 AI 몽타주 생성", "🔮 사주 심층 분석", "💫 무료 체험"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "10px 22px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 100,
                  color: "white",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            color: "rgba(255,255,255,0.5)",
            fontSize: 22,
            letterSpacing: "1px",
          }}
        >
          saju-montage.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
