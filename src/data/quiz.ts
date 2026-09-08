import { QuizQuestion } from '../types';

// 각 문제는 lessonId를 통해 동일한 id의 Lesson과 1:1로 연결됩니다.
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    lessonId: '1',
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
    lessonId: '2',
    question: '주가를 움직이는 가장 직접적인 요인은?',
    options: [
      '회사가 설립된 연도',
      '주식을 사려는 사람과 팔려는 사람의 균형 변화',
      '회사 로고의 색상',
      '대표이사의 나이',
    ],
    correctIndex: 1,
  },
  {
    id: 'q3',
    lessonId: '3',
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
    id: 'q4',
    lessonId: '4',
    question: '거래량에 대한 설명으로 옳은 것은?',
    options: [
      '일정 기간 동안 사고 팔린 주식의 수량이다',
      '회사의 연간 매출액이다',
      '주식 1주의 액면가이다',
      '주주에게 지급되는 배당금 총액이다',
    ],
    correctIndex: 0,
  },
  {
    id: 'q5',
    lessonId: '5',
    question: 'ETF에 대한 설명으로 옳은 것은?',
    options: [
      '한 회사에만 투자하는 상품이다',
      '여러 종목에 분산 투자할 수 있는 펀드이다',
      '정부가 원금을 보장하는 예금이다',
      '주식 거래를 금지하는 규제이다',
    ],
    correctIndex: 1,
  },
  {
    id: 'q6',
    lessonId: '6',
    question: '배당에 대한 설명으로 옳은 것은?',
    options: [
      '회사 이익의 일부를 주주에게 나눠주는 것이다',
      '주식을 빌려주고 받는 이자다',
      '정부에 내는 세금이다',
      '주식을 살 때 내는 수수료다',
    ],
    correctIndex: 0,
  },
  {
    id: 'q7',
    lessonId: '7',
    question: 'PER이 낮다는 것은 일반적으로 무엇을 의미하나?',
    options: [
      '회사가 적자 상태라는 뜻이다',
      '이익에 비해 주가가 저평가되어 있다는 뜻이다',
      '배당을 많이 준다는 뜻이다',
      '거래량이 많다는 뜻이다',
    ],
    correctIndex: 1,
  },
  {
    id: 'q8',
    lessonId: '8',
    question: 'PBR이 1보다 낮다는 것은 무엇을 의미하나?',
    options: [
      '회사가 상장폐지된다는 뜻이다',
      '배당이 없다는 뜻이다',
      '회사의 자산 가치보다 주가가 낮게 평가되고 있다는 뜻이다',
      '거래가 정지된다는 뜻이다',
    ],
    correctIndex: 2,
  },
  {
    id: 'q9',
    lessonId: '9',
    question: 'ROE가 높다는 것은 일반적으로 무엇을 의미하나?',
    options: [
      '자기자본을 효율적으로 활용해 이익을 낸다는 뜻이다',
      '부채가 전혀 없다는 뜻이다',
      '주가가 반드시 오른다는 뜻이다',
      '배당을 지급하지 않는다는 뜻이다',
    ],
    correctIndex: 0,
  },
  {
    id: 'q10',
    lessonId: '10',
    question: '분산투자를 하는 주된 목적은?',
    options: [
      '세금을 줄이기 위해',
      '거래 수수료를 없애기 위해',
      '투자 위험을 줄이기 위해',
      '배당을 더 받기 위해',
    ],
    correctIndex: 2,
  },
];
