"use client";

const STEPS = [
  { icon: "☯️", text: "사주팔자를 분석하는 중..." },
  { icon: "🔮", text: "배우자의 인연을 찾는 중..." },
  { icon: "🎨", text: "몽타주를 그리는 중..." },
];

export default function LoadingScreen({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* 회전하는 팔괘 심볼 */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
        <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {STEPS[Math.min(step, STEPS.length - 1)].icon}
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="space-y-3 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              i === step
                ? "bg-amber-100 border-2 border-amber-400 text-amber-800 font-semibold"
                : i < step
                ? "bg-green-50 border-2 border-green-300 text-green-700"
                : "bg-gray-50 border-2 border-gray-200 text-gray-400"
            }`}
          >
            <span className="text-lg">{i < step ? "✅" : s.icon}</span>
            <span className="text-sm">{s.text}</span>
          </div>
        ))}
      </div>

      <p className="text-amber-600 text-sm animate-pulse">
        약 20~30초 정도 소요됩니다
      </p>
    </div>
  );
}
