import Link from "next/link";

export const metadata = {
  title: "서비스 이용약관 | 내님은누구",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← 홈으로
          </Link>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">서비스 이용약관</h1>
        <p className="text-gray-500 text-sm mb-8">최종 수정일: 2026년 4월 20일</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">제1조 (목적)</h2>
            <p className="text-gray-400">
              본 약관은 내님은누구(이하 &apos;서비스&apos;)가 제공하는 AI 사주팔자 분석 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무·책임 사항을 규정하는 것을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제2조 (서비스 소개)</h2>
            <p className="text-gray-400 mb-3">서비스는 이용자의 사주팔자(생년월일시, 성별) 정보를 바탕으로 AI가 운명의 배우자·귀인·악연 인물을 분석하고 몽타주 이미지를 생성하는 오락·참고 목적의 서비스입니다.</p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-300 text-xs">
              ⚠️ 본 서비스는 <strong>오락 및 참고 목적</strong>으로 제공되며, 실제 운명·미래를 예측하거나 보장하지 않습니다. 서비스 결과는 개인의 삶에 대한 결정의 근거로 삼아서는 안 됩니다.
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제3조 (이용 계약 및 회원가입)</h2>
            <ul className="space-y-2 text-gray-400 list-disc list-inside">
              <li>서비스는 회원가입 없이도 기본 분석을 이용할 수 있습니다.</li>
              <li>소셜 로그인(카카오·네이버·구글)을 통해 회원가입 가능하며, 결제 내역 영구 보관 등의 혜택이 제공됩니다.</li>
              <li>만 14세 미만은 회원가입 및 유료 서비스 이용이 제한됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제4조 (유료 서비스 및 결제)</h2>
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-4 space-y-3 mb-3">
              <div>
                <p className="font-semibold text-white mb-1">상품 및 가격</p>
                <div className="text-gray-400 space-y-1">
                  <p>· 내님은누구 (배우자 분석): 2,000원</p>
                  <p>· 내귀인은누구 (귀인 분석): 2,000원</p>
                  <p>· 내웬수는누구 (악연 분석): 2,000원</p>
                  <p>· 3종 묶음 (배우자+귀인+웬수): 5,000원</p>
                </div>
              </div>
              <div className="border-t border-white/5 pt-3">
                <p className="font-semibold text-white mb-1">결제 수단</p>
                <p className="text-gray-400">신용카드, 체크카드, 간편결제 (토스페이먼츠 제공)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제5조 (환불 정책)</h2>
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-green-300 text-xs">
                ✅ <strong>결과 제공 전 취소:</strong> 결제 후 분석 결과를 받기 전이라면 전액 환불 가능합니다.
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-300 text-xs">
                ❌ <strong>결과 제공 후 취소:</strong> AI 분석 결과 및 이미지가 생성·제공된 이후에는 디지털 콘텐츠 특성상 환불이 불가합니다. (전자상거래법 제17조 제2항 제5호)
              </div>
              <p className="text-gray-500 text-xs">환불 문의: sehen12345@gmail.com (영업일 기준 3일 이내 처리)</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제6조 (서비스 이용 제한)</h2>
            <p className="text-gray-400 mb-2">다음에 해당하는 경우 서비스 이용이 제한될 수 있습니다.</p>
            <ul className="space-y-1 text-gray-400 list-disc list-inside">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>타인의 개인정보를 무단으로 입력하는 행위</li>
              <li>서비스 결과물을 상업적 목적으로 무단 도용하는 행위</li>
              <li>관련 법령을 위반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제7조 (서비스 중단 및 변경)</h2>
            <p className="text-gray-400">서비스는 시스템 점검, 천재지변, 운영 정책 변경 등으로 서비스를 일시 중단하거나 변경할 수 있습니다. 이 경우 사전 공지를 원칙으로 하되, 긴급한 경우 사후 공지할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제8조 (면책 조항)</h2>
            <ul className="space-y-2 text-gray-400 list-disc list-inside">
              <li>서비스는 AI가 생성한 오락 목적의 콘텐츠를 제공하며, 분석 결과의 정확성·완전성을 보장하지 않습니다.</li>
              <li>이용자가 서비스 결과를 근거로 내린 결정에 대한 책임은 이용자 본인에게 있습니다.</li>
              <li>서비스는 이용자의 기기·네트워크 문제로 발생한 손해에 대해 책임지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제9조 (분쟁 해결)</h2>
            <p className="text-gray-400">본 약관과 관련된 분쟁은 대한민국 법률에 따르며, 관할 법원은 서울중앙지방법원으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제10조 (약관의 변경)</h2>
            <p className="text-gray-400">본 약관은 필요에 따라 개정될 수 있으며, 변경 시 서비스 내 공지를 통해 최소 7일 전 고지합니다.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
