import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "내님은누구 · 귀인은누구 · 웬수는누구 — 사주팔자 AI 운명 분석";
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
          background: "#0a0a10",
          position: "relative",
          overflow: "hidden",
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {/* ── 배경 글로우 ── */}
        <div style={{
          position: "absolute", top: -200, left: "30%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -150, right: 80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* ── 배경 별 ── */}
        {[
          { top: 48, left: 90, size: 3, opacity: 0.5 },
          { top: 120, left: 220, size: 2, opacity: 0.3 },
          { top: 72, left: 440, size: 2, opacity: 0.4 },
          { top: 200, left: 30, size: 3, opacity: 0.35 },
          { top: 320, left: 160, size: 2, opacity: 0.25 },
          { top: 500, left: 80, size: 3, opacity: 0.4 },
          { top: 560, left: 280, size: 2, opacity: 0.3 },
          { top: 440, left: 340, size: 3, opacity: 0.2 },
          { top: 60, left: 560, size: 2, opacity: 0.35 },
          { top: 580, left: 460, size: 2, opacity: 0.3 },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", top: s.top, left: s.left,
            width: s.size, height: s.size, borderRadius: "50%",
            background: "#ffffff", opacity: s.opacity, display: "flex",
          }} />
        ))}

        {/* ── 좌측 콘텐츠 ── */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 0 60px 72px",
          width: 640, gap: 0, zIndex: 10,
        }}>

          {/* 브랜드 배지 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 28,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(124,58,237,0.25)",
              border: "1px solid rgba(124,58,237,0.4)",
              fontSize: 22,
            }}>🔮</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 100,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                4,200년 사주 × AI 분석
              </span>
            </div>
          </div>

          {/* 메인 타이틀 */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 4, marginBottom: 20,
          }}>
            <span style={{
              fontSize: 68, fontWeight: 900, color: "#ffffff",
              lineHeight: 1.05, letterSpacing: "-2px",
            }}>
              내님은누구
            </span>
            <span style={{
              fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.45)",
              letterSpacing: "4px", marginTop: 4,
            }}>
              내귀인은누구 · 내웬수는누구
            </span>
          </div>

          {/* 훅 카피 */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 2, marginBottom: 36,
          }}>
            <span style={{
              fontSize: 30, fontWeight: 700,
              color: "#fbbf24",
              lineHeight: 1.4,
            }}>
              당신의 사주팔자 안에
            </span>
            <span style={{
              fontSize: 30, fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.4,
            }}>
              이미 그 사람이 있습니다
            </span>
          </div>

          {/* 구분선 */}
          <div style={{
            width: 48, height: 2,
            background: "linear-gradient(to right, #fbbf24, transparent)",
            marginBottom: 28, display: "flex",
          }} />

          {/* 통계 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 24,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>41,200+</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>분석 완료</span>
            </div>
            <div style={{
              width: 1, height: 36,
              background: "rgba(255,255,255,0.1)", display: "flex",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>97%</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>만족도</span>
            </div>
            <div style={{
              width: 1, height: 36,
              background: "rgba(255,255,255,0.1)", display: "flex",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>2,000원~</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>1회 분석</span>
            </div>
          </div>
        </div>

        {/* ── 우측 상품 카드 ── */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", gap: 16,
          flex: 1, padding: "60px 60px 60px 20px", zIndex: 10,
        }}>

          {/* 배우자 카드 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "20px 24px", borderRadius: 20,
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.25)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #f43f5e, #ec4899)",
              fontSize: 26, flexShrink: 0,
            }}>💑</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>내님은누구</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
                운명의 배우자 AI 몽타주 · 이름 힌트 · 궁합 분석
              </span>
            </div>
          </div>

          {/* 귀인 카드 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "20px 24px", borderRadius: 20,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #f59e0b, #fcd34d)",
              fontSize: 26, flexShrink: 0,
            }}>🌟</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>내귀인은누구</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
                인생을 바꿀 귀인 프로필 · 만남 시기 · 귀인운 차트
              </span>
            </div>
          </div>

          {/* 웬수 카드 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "20px 24px", borderRadius: 20,
            background: "rgba(100,116,139,0.08)",
            border: "1px solid rgba(100,116,139,0.25)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #64748b, #94a3b8)",
              fontSize: 26, flexShrink: 0,
            }}>😤</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>내웬수는누구</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
                조심해야 할 악연 분석 · 접근 패턴 · 자기보호 가이드
              </span>
            </div>
          </div>

          {/* URL */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginTop: 4, padding: "10px 18px", borderRadius: 100,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            alignSelf: "flex-start",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4ade80", display: "flex",
            }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5 }}>
              saju-montage.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
