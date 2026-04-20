import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | 내님은누구",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← 홈으로
          </Link>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">개인정보처리방침</h1>
        <p className="text-gray-500 text-sm mb-8">최종 수정일: 2026년 4월 20일</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. 개인정보의 수집 항목 및 방법</h2>
            <p className="mb-2">내님은누구(이하 &apos;서비스&apos;)는 AI 사주 분석 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.</p>
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-4 space-y-3">
              <div>
                <p className="font-semibold text-white mb-1">소셜 로그인 시 (선택)</p>
                <p className="text-gray-400">이메일 주소, 닉네임 (카카오·네이버·구글 제공)</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">서비스 이용 시</p>
                <p className="text-gray-400">이름(별칭), 생년월일, 출생 시간, 성별</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">결제 시</p>
                <p className="text-gray-400">결제 수단 정보 (토스페이먼츠에서 직접 처리, 당사 미저장)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="space-y-2 text-gray-400 list-disc list-inside">
              <li>AI 사주팔자 분석 결과 제공</li>
              <li>결제 처리 및 결제 내역 확인</li>
              <li>서비스 이용 관련 고객 문의 대응</li>
              <li>서비스 품질 개선 및 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">사주 분석 입력 데이터</span>
                <span className="text-white font-medium">서버에 저장하지 않음</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-gray-400">결제 기록</span>
                <span className="text-white font-medium">이용자 기기 로컬 저장 (언제든 삭제 가능)</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-gray-400">소셜 로그인 계정 정보</span>
                <span className="text-white font-medium">회원 탈퇴 시 즉시 삭제</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="mb-3 text-gray-400">서비스는 이용자의 개인정보를 아래의 목적으로 제3자에게 제공합니다.</p>
            <div className="bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="border-b border-white/10">
                  <tr className="text-gray-500">
                    <th className="px-4 py-3 text-left">수신자</th>
                    <th className="px-4 py-3 text-left">목적</th>
                    <th className="px-4 py-3 text-left">보유 기간</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400 divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-3">토스페이먼츠</td>
                    <td className="px-4 py-3">결제 처리</td>
                    <td className="px-4 py-3">결제 완료 후 5년</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Anthropic (Claude AI)</td>
                    <td className="px-4 py-3">사주 분석 AI 처리</td>
                    <td className="px-4 py-3">즉시 삭제 (저장 안 함)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">OpenAI / Pollinations</td>
                    <td className="px-4 py-3">AI 이미지 생성</td>
                    <td className="px-4 py-3">즉시 삭제 (저장 안 함)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. 이용자의 권리</h2>
            <p className="text-gray-400 mb-2">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-2 text-gray-400 list-disc list-inside">
              <li>개인정보 열람, 정정, 삭제 요청</li>
              <li>처리 정지 요청</li>
              <li>마이페이지 &gt; 저장된 데이터 초기화로 로컬 데이터 즉시 삭제</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. 쿠키 및 자동 수집 정보</h2>
            <p className="text-gray-400">서비스는 결제 상태 및 분석 결과 임시 저장을 위해 브라우저의 localStorage·sessionStorage를 사용합니다. 이는 서버로 전송되지 않으며 이용자가 직접 삭제할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. 개인정보 보호책임자</h2>
            <div className="bg-[#13131a] border border-white/10 rounded-2xl p-4 text-gray-400">
              <p>이메일: sehen12345@gmail.com</p>
              <p className="text-gray-600 text-xs mt-2">개인정보 관련 문의사항은 이메일로 연락해 주세요. 영업일 기준 3일 이내 답변드립니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. 개인정보처리방침 변경</h2>
            <p className="text-gray-400">본 방침은 법령 및 서비스 변경사항을 반영하기 위해 개정될 수 있습니다. 변경 시 서비스 내 공지사항을 통해 고지합니다.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
