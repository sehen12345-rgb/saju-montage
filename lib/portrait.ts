import type { SajuInfo } from "./types";

// 천간별 오행 색상
const GAN_COLORS: Record<string, { bg: string; accent: string; element: string }> = {
  갑: { bg: "#e8f5e9", accent: "#43a047", element: "木" },
  을: { bg: "#f1f8e9", accent: "#7cb342", element: "木" },
  병: { bg: "#fff3e0", accent: "#ef6c00", element: "火" },
  정: { bg: "#fce4ec", accent: "#e91e63", element: "火" },
  무: { bg: "#fff8e1", accent: "#f9a825", element: "土" },
  기: { bg: "#fdf3e1", accent: "#e67e22", element: "土" },
  경: { bg: "#e8eaf6", accent: "#5c6bc0", element: "金" },
  신: { bg: "#f3e5f5", accent: "#8e24aa", element: "金" },
  임: { bg: "#e3f2fd", accent: "#1565c0", element: "水" },
  계: { bg: "#e0f7fa", accent: "#00838f", element: "水" },
};

// 시드 기반 난수
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashSaju(sajuInfo: SajuInfo): number {
  const str = `${sajuInfo.yearPillar}${sajuInfo.monthPillar}${sajuInfo.dayPillar}${sajuInfo.hourPillar}`;
  return str.split("").reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
}

// 피부색 팔레트
const SKIN_TONES = ["#fde3c0", "#f5c99e", "#e8b98a", "#d4a574", "#c89060"];
// 헤어 색상
const HAIR_COLORS = ["#1a0a00", "#2c1b0e", "#3d2514", "#0d0d0d", "#1f1a14"];
// 입술 색상
const LIP_COLORS = ["#c97b7b", "#b56a6a", "#d4908a", "#a85555", "#c07070"];

export function generatePortraitSVG(
  gender: "male" | "female",
  sajuInfo: SajuInfo
): string {
  const seed = Math.abs(hashSaju(sajuInfo));
  const rng = seededRandom(seed + (gender === "female" ? 100000 : 0));

  const yearGan = sajuInfo.yearPillar.charAt(0);
  const colors = GAN_COLORS[yearGan] ?? { bg: "#fff8e7", accent: "#c8954a", element: "土" };
  const spouseGender = gender === "male" ? "female" : "male"; // 배우자 성별

  const skinColor = SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)];
  const hairColor = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
  const lipColor = LIP_COLORS[Math.floor(rng() * LIP_COLORS.length)];
  const eyeVariant = Math.floor(rng() * 3); // 0:단안, 1:쌍꺼풀, 2:아몬드

  // 얼굴 비율 변화
  const faceW = 150 + Math.floor(rng() * 20);
  const faceH = 190 + Math.floor(rng() * 20);
  const cx = 256;
  const cy = 290;

  const shadowColor = darken(skinColor, 0.12);
  const highlightColor = lighten(skinColor, 0.15);
  const bgAccentLight = lighten(colors.accent, 0.55);

  const hairBack = spouseGender === "female"
    ? renderFemaleHairBack(cx, cy, faceW, faceH, hairColor, rng)
    : renderMaleHairBack(cx, cy, faceW, faceH, hairColor);

  const hairFront = spouseGender === "female"
    ? renderFemaleHairFront(cx, cy, faceW, faceH, hairColor, rng)
    : renderMaleHairFront(cx, cy, faceW, faceH, hairColor);

  const eyes = renderEyes(cx, cy, faceW, faceH, hairColor, skinColor, eyeVariant);
  const eyebrows = renderEyebrows(cx, cy, faceW, faceH, hairColor, spouseGender, rng);
  const nose = renderNose(cx, cy, faceH, skinColor, rng);
  const lips = renderLips(cx, cy, faceH, lipColor, rng);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="${bgAccentLight}"/>
      <stop offset="100%" stop-color="${colors.bg}"/>
    </radialGradient>
    <radialGradient id="faceGrad" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${highlightColor}"/>
      <stop offset="55%" stop-color="${skinColor}"/>
      <stop offset="100%" stop-color="${shadowColor}"/>
    </radialGradient>
    <radialGradient id="cheekL" cx="30%" cy="60%" r="40%">
      <stop offset="0%" stop-color="#ffb5b5" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffb5b5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cheekR" cx="70%" cy="60%" r="40%">
      <stop offset="0%" stop-color="#ffb5b5" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffb5b5" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur2">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
    <filter id="softShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${colors.accent}" flood-opacity="0.15"/>
    </filter>
    <clipPath id="faceClip">
      <ellipse cx="${cx}" cy="${cy}" rx="${faceW / 2}" ry="${faceH / 2}"/>
    </clipPath>
  </defs>

  <!-- 배경 -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- 배경 장식 원 -->
  <circle cx="${cx}" cy="${cy - 20}" r="200" fill="${colors.accent}" opacity="0.06"/>
  <circle cx="${cx - 80}" cy="${cy + 100}" r="120" fill="${colors.accent}" opacity="0.05"/>

  <!-- 오행 심볼 -->
  <text x="30" y="490" font-size="22" fill="${colors.accent}" opacity="0.3" font-family="serif">${colors.element}</text>

  <!-- 어깨/옷 -->
  <ellipse cx="${cx}" cy="520" rx="200" ry="80" fill="${darken(colors.accent, 0.1)}" opacity="0.7"/>
  <ellipse cx="${cx}" cy="510" rx="180" ry="70" fill="${colors.accent}" opacity="0.5"/>

  <!-- 목 -->
  <rect x="${cx - 36}" y="${cy + faceH / 2 - 10}" width="72" height="70" rx="12"
        fill="${shadowColor}" opacity="0.6"/>
  <rect x="${cx - 30}" y="${cy + faceH / 2 - 12}" width="60" height="68" rx="10"
        fill="${skinColor}"/>

  <!-- 귀 -->
  <ellipse cx="${cx - faceW / 2 - 6}" cy="${cy + 18}" rx="13" ry="18" fill="${skinColor}" filter="url(#softShadow)"/>
  <ellipse cx="${cx + faceW / 2 + 6}" cy="${cy + 18}" rx="13" ry="18" fill="${skinColor}" filter="url(#softShadow)"/>
  <ellipse cx="${cx - faceW / 2 - 6}" cy="${cy + 18}" rx="8" ry="12" fill="${shadowColor}" opacity="0.3"/>
  <ellipse cx="${cx + faceW / 2 + 6}" cy="${cy + 18}" rx="8" ry="12" fill="${shadowColor}" opacity="0.3"/>

  <!-- 뒤 머리카락 -->
  ${hairBack}

  <!-- 얼굴 -->
  <ellipse cx="${cx}" cy="${cy}" rx="${faceW / 2}" ry="${faceH / 2}"
           fill="url(#faceGrad)" filter="url(#softShadow)"/>

  <!-- 볼 홍조 -->
  <ellipse cx="${cx - faceW * 0.28}" cy="${cy + faceH * 0.08}" rx="38" ry="22"
           fill="url(#cheekL)"/>
  <ellipse cx="${cx + faceW * 0.28}" cy="${cy + faceH * 0.08}" rx="38" ry="22"
           fill="url(#cheekR)"/>

  <!-- 눈썹 -->
  ${eyebrows}

  <!-- 눈 -->
  ${eyes}

  <!-- 코 -->
  ${nose}

  <!-- 입술 -->
  ${lips}

  <!-- 앞 머리카락 -->
  ${hairFront}

  <!-- 하이라이트 -->
  <ellipse cx="${cx - faceW * 0.12}" cy="${cy - faceH * 0.28}" rx="18" ry="10"
           fill="white" opacity="0.18" transform="rotate(-20 ${cx} ${cy})"/>

  <!-- 테두리 프레임 -->
  <rect x="12" y="12" width="488" height="488" rx="24" ry="24"
        fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.3"/>
</svg>`;
}

// ─── 머리카락 ─────────────────────────────────────

function renderFemaleHairBack(
  cx: number, cy: number, fw: number, fh: number,
  color: string, rng: () => number
): string {
  const style = Math.floor(rng() * 3);
  if (style === 0) {
    // 긴 생머리
    return `<path d="M${cx - fw / 2 - 10},${cy - fh / 2 + 30}
      Q${cx - fw / 2 - 30},${cy + 80} ${cx - fw / 2 - 20},${cy + 200}
      Q${cx},${cy + 240} ${cx + fw / 2 + 20},${cy + 200}
      Q${cx + fw / 2 + 30},${cy + 80} ${cx + fw / 2 + 10},${cy - fh / 2 + 30}
      Q${cx},${cy - fh / 2 - 50} ${cx - fw / 2 - 10},${cy - fh / 2 + 30}Z"
      fill="${color}"/>`;
  } else if (style === 1) {
    // 웨이브
    return `<path d="M${cx - fw / 2 - 8},${cy - fh / 2 + 20}
      Q${cx - fw / 2 - 40},${cy + 60} ${cx - fw / 2 - 15},${cy + 180}
      Q${cx - 20},${cy + 230} ${cx + 20},${cy + 225}
      Q${cx + fw / 2 + 15},${cy + 180} ${cx + fw / 2 + 40},${cy + 60}
      Q${cx + fw / 2 + 8},${cy - fh / 2 + 20} ${cx},${cy - fh / 2 - 45}
      Q${cx - fw / 2 - 8},${cy - fh / 2 + 20} Z"
      fill="${color}" opacity="0.95"/>`;
  } else {
    // 단발
    return `<path d="M${cx - fw / 2 - 5},${cy - fh / 2 + 25}
      Q${cx - fw / 2 - 20},${cy + 40} ${cx - fw / 2},${cy + 90}
      Q${cx},${cy + 110} ${cx + fw / 2},${cy + 90}
      Q${cx + fw / 2 + 20},${cy + 40} ${cx + fw / 2 + 5},${cy - fh / 2 + 25}
      Q${cx},${cy - fh / 2 - 40} Z"
      fill="${color}"/>`;
  }
}

function renderFemaleHairFront(
  cx: number, cy: number, fw: number, fh: number,
  color: string, rng: () => number
): string {
  const hasBangs = rng() > 0.4;
  if (!hasBangs) {
    return `<ellipse cx="${cx}" cy="${cy - fh / 2 - 8}" rx="${fw / 2 + 2}" ry="32"
      fill="${color}"/>`;
  }
  return `
  <ellipse cx="${cx}" cy="${cy - fh / 2 - 8}" rx="${fw / 2 + 2}" ry="32" fill="${color}"/>
  <path d="M${cx - fw / 2 + 10},${cy - fh / 2 + 20}
    Q${cx - 20},${cy - fh / 2 + 45} ${cx + 30},${cy - fh / 2 + 40}
    Q${cx + fw / 4},${cy - fh / 2 + 20} ${cx + fw / 2 - 5},${cy - fh / 2 + 10}
    Q${cx},${cy - fh / 2 - 20} ${cx - fw / 2 + 10},${cy - fh / 2 + 20}Z"
    fill="${color}"/>`;
}

function renderMaleHairBack(
  cx: number, cy: number, fw: number, fh: number, color: string
): string {
  return `<ellipse cx="${cx}" cy="${cy - fh / 2 + 10}" rx="${fw / 2 + 8}" ry="40"
    fill="${color}"/>`;
}

function renderMaleHairFront(
  cx: number, cy: number, fw: number, fh: number, color: string
): string {
  return `
  <ellipse cx="${cx}" cy="${cy - fh / 2 - 5}" rx="${fw / 2 + 4}" ry="28" fill="${color}"/>
  <path d="M${cx - fw / 2 + 15},${cy - fh / 2 + 18}
    Q${cx},${cy - fh / 2 + 32} ${cx + fw / 2 - 15},${cy - fh / 2 + 18}
    Q${cx},${cy - fh / 2 - 5} Z"
    fill="${color}" opacity="0.85"/>`;
}

// ─── 눈썹 ─────────────────────────────────────────

function renderEyebrows(
  cx: number, cy: number, fw: number, fh: number,
  color: string, gender: "male" | "female", rng: () => number
): string {
  const eyeY = cy - fh * 0.12;
  const browY = eyeY - fh * 0.12;
  const spread = fw * 0.22;
  const thick = gender === "female" ? 3.5 : 5;
  const curve = gender === "female" ? -8 : -4;

  return `
  <path d="M${cx - spread - 20},${browY + 2} Q${cx - spread + 5},${browY + curve} ${cx - spread + 28},${browY + 4}"
    stroke="${color}" stroke-width="${thick}" fill="none" stroke-linecap="round"/>
  <path d="M${cx + spread - 28},${browY + 4} Q${cx + spread - 5},${browY + curve} ${cx + spread + 20},${browY + 2}"
    stroke="${color}" stroke-width="${thick}" fill="none" stroke-linecap="round"/>`;
}

// ─── 눈 ───────────────────────────────────────────

function renderEyes(
  cx: number, cy: number, fw: number, fh: number,
  irisColor: string, _skinColor: string, variant: number
): string {
  const eyeY = cy - fh * 0.1;
  const spread = fw * 0.22;
  const ew = 32, eh = variant === 1 ? 18 : variant === 2 ? 14 : 16;

  const eye = (ex: number) => `
    <ellipse cx="${ex}" cy="${eyeY}" rx="${ew}" ry="${eh}" fill="white"/>
    <ellipse cx="${ex}" cy="${eyeY}" rx="${ew}" ry="${eh}"
      fill="none" stroke="#333" stroke-width="1.5"/>
    <ellipse cx="${ex}" cy="${eyeY}" rx="${ew * 0.54}" ry="${eh * 0.82}" fill="${irisColor}"/>
    <ellipse cx="${ex}" cy="${eyeY}" rx="${ew * 0.32}" ry="${eh * 0.55}" fill="#0d0d0d"/>
    <circle cx="${ex - ew * 0.14}" cy="${eyeY - eh * 0.22}" r="${eh * 0.2}" fill="white" opacity="0.85"/>
    <path d="M${ex - ew},${eyeY} Q${ex},${eyeY - eh - 5} ${ex + ew},${eyeY}"
      fill="${irisColor}" opacity="0.35"/>`;

  return `${eye(cx - spread)}${eye(cx + spread)}`;
}

// ─── 코 ───────────────────────────────────────────

function renderNose(
  cx: number, cy: number, fh: number,
  skinColor: string, rng: () => number
): string {
  const noseY = cy + fh * 0.06;
  const nostrilW = 10 + rng() * 5;
  return `
  <path d="M${cx},${noseY - 28} Q${cx - 8},${noseY - 5} ${cx - nostrilW},${noseY + 2}"
    stroke="${darken(skinColor, 0.2)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M${cx},${noseY - 28} Q${cx + 8},${noseY - 5} ${cx + nostrilW},${noseY + 2}"
    stroke="${darken(skinColor, 0.2)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M${cx - nostrilW - 4},${noseY + 6} Q${cx},${noseY + 14} ${cx + nostrilW + 4},${noseY + 6}"
    stroke="${darken(skinColor, 0.25)}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}

// ─── 입술 ─────────────────────────────────────────

function renderLips(
  cx: number, cy: number, fh: number,
  color: string, rng: () => number
): string {
  const lipY = cy + fh * 0.26;
  const lipW = 30 + rng() * 10;
  const dark = darken(color, 0.15);
  return `
  <!-- 아랫입술 -->
  <path d="M${cx - lipW},${lipY + 2} Q${cx},${lipY + 20} ${cx + lipW},${lipY + 2}"
    fill="${color}" stroke="${dark}" stroke-width="0.5"/>
  <!-- 윗입술 -->
  <path d="M${cx - lipW},${lipY + 2}
    Q${cx - lipW / 2},${lipY - 8} ${cx - 8},${lipY - 6}
    Q${cx},${lipY - 12} ${cx + 8},${lipY - 6}
    Q${cx + lipW / 2},${lipY - 8} ${cx + lipW},${lipY + 2}"
    fill="${dark}" stroke="${dark}" stroke-width="0.5"/>
  <!-- 입술 하이라이트 -->
  <path d="M${cx - lipW * 0.4},${lipY + 8} Q${cx},${lipY + 14} ${cx + lipW * 0.4},${lipY + 8}"
    fill="white" opacity="0.2" stroke="none"/>`;
}

// ─── 색상 유틸 ────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + 255 * amt, g + 255 * amt, b + 255 * amt);
}

function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}
