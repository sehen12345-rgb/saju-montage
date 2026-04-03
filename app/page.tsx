import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 헤더 */}
        <div className="space-y-3">
          <div className="text-6xl mb-4">☯️</div>
          <h1 className="text-4xl font-bold text-amber-900 leading-tight">
            사주 배우자 몽타주
          </h1>
          <p className="text-amber-700 text-lg">
            사주팔자로 알아보는 운명의 상대
          </p>
        </div>

        {/* 설명 카드들 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "📅", title: "생년월일 입력", desc: "사주를 분석합니다" },
            { icon: "🔮", title: "AI 해석", desc: "배우자 특징 도출" },
            { icon: "🎨", title: "몽타주 생성", desc: "외모를 그려드려요" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-amber-100 shadow-sm"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-semibold text-amber-800">{item.title}</div>
              <div className="text-xs text-amber-600 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 메인 CTA */}
        <Link
          href="/input"
          className="block w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105"
        >
          ✨ 내 배우자 보러가기
        </Link>

        {/* 부가 설명 */}
        <div className="space-y-2">
          <p className="text-sm text-amber-600">
            🕐 약 20~30초 소요 · 무료 체험
          </p>
          <p className="text-xs text-gray-400">
            * 오락 및 참고 목적으로만 제공됩니다
          </p>
        </div>

        {/* 샘플 이미지 힌트 */}
        <div className="bg-white/50 rounded-2xl p-5 border border-amber-100">
          <p className="text-sm text-amber-700 font-medium mb-3">💬 이런 결과를 받아보세요</p>
          <div className="space-y-2 text-left">
            {[
              '"온화하고 단아한 눈매에 지적인 분위기..."',
              '"활발하고 밝은 미소를 가진 활기찬..."',
              '"차분하고 우아한 인상으로 신뢰감이..."',
            ].map((text, i) => (
              <p key={i} className="text-xs text-gray-500 bg-amber-50 rounded-lg px-3 py-2">
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
