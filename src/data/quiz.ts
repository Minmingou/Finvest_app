import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '주식이란 무엇인가?',
    options: [
      '기업의 소유권을 나타내는 증권',
      '은행에서 빌린 돈',
      '정부가 발행하는 화폐',
      '보험 상품',
    ],
    correctIndex: 0,
  },
  {
    id: 'q2',
    question: '시가총액을 구하는 방법은?',
    options: [
      '매출액에서 비용을 뺀 값',
      '주가 × 발행 주식 수',
      '순이익을 주식 수로 나눈 값',
      '자산에서 부채를 뺀 값',
    ],
    correctIndex: 1,
  },
  {
    id: 'q3',
    question: 'ETF에 대한 설명으로 옳은 것은?',
    options: [
      '한 회사에만 투자하는 상품이다',
      '여러 종목에 분산 투자할 수 있는 펀드이다',
      '정부가 원금을 보장하는 예금이다',
      '주식 거래를 금지하는 규제이다',
    ],
    correctIndex: 1,
  },
];
