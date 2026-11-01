import Link from "next/link";

export const metadata = {
  title: "환불 정책 | 내님은누구",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← 홈으로
          </Link>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">환불 정책</h1>
        <p className="text-gray-500 text-sm mb-8">최종 수정일: 2026년 11월 1일</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">제1조 (서비스 특성)</h2>
            <p className="text-gray-400">
              내님은누구(이하 &apos;서비스&apos;)는 AI 기반 사주팔자 분석 결과를 즉시 제공하는 디지털 콘텐츠 서비스입니다.
              결제 완료 즉시 분석 결과가 제공되는 특성상, 콘텐츠 열람 이후에는 환불이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제2조 (환불 가능 기준)</h2>
            <div className="space-y-3 text-gray-400">
              <p>다음의 경우 결제일로부터 <strong className="text-white">7일 이내</strong> 전액 환불이 가능합니다:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>결제 후 콘텐츠(분석 결과)를 열람하지 않은 경우</li>
                <li>서비스 오류로 인해 분석 결과가 정상적으로 제공되지 않은 경우</li>
                <li>중복 결제가 발생한 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제3조 (환불 불가 기준)</h2>
            <div className="space-y-3 text-gray-400">
              <p>다음의 경우 환불이 불가합니다:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>결제 후 분석 결과(유료 콘텐츠)를 이미 열람한 경우</li>
                <li>AI 분석 결과의 내용이 마음에 들지 않는 경우 (서비스 특성상 결과의 주관적 만족도는 환불 사유에 해당하지 않음)</li>
                <li>결제일로부터 7일이 경과한 경우</li>
                <li>본인 외 타인의 정보를 이용하여 결제한 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제4조 (환불 신청 방법)</h2>
            <div className="space-y-3 text-gray-400">
              <p>환불을 원하시는 경우 아래 이메일로 문의해 주세요:</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-white font-bold">고객센터 이메일</p>
                <p className="text-indigo-400 mt-1">support@naenim.com</p>
                <p className="text-gray-500 text-xs mt-2">문의 시 결제 시 사용한 이름, 결제일, 주문번호를 함께 보내주세요.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제5조 (환불 처리 기간)</h2>
            <p className="text-gray-400">
              환불 요청이 확인된 후 영업일 기준 <strong className="text-white">3~5일 이내</strong>에 결제 수단으로 환불 처리됩니다.
              카드 결제의 경우 카드사 정책에 따라 취소 처리 기간이 다를 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">제6조 (디지털 콘텐츠 관련 법령)</h2>
            <p className="text-gray-400">
              본 환불 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에 따릅니다.
              디지털 콘텐츠의 특성상 즉시 제공 및 열람이 시작된 경우 청약철회가 제한될 수 있으며,
              이는 동법 제17조 제2항 제5호에 근거합니다.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-600 text-xs">내님은누구 · 환불 관련 문의: support@naenim.com</p>
        </div>
      </div>
    </div>
  );
}
