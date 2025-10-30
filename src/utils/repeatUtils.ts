import { Event } from '../types';

/**
 * Date 객체를 ISO 8601 형식(YYYY-MM-DD)의 문자열로 변환합니다.
 * @param date - 변환할 Date 객체
 * @returns ISO 8601 형식의 날짜 문자열
 */
function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환합니다.
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatDate(date: Date): string {
  // TODO: GREEN 단계에서 구현
  return '';
}

/**
 * 날짜의 요일을 반환합니다.
 * @param date - 확인할 날짜
 * @returns 0(일요일)부터 6(토요일)까지의 숫자
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDayOfWeek(date: Date): number {
  // TODO: GREEN 단계에서 구현
  return -1;
}

/**
 * 주어진 연도가 윤년인지 판단합니다.
 * @param year - 확인할 연도
 * @returns 윤년이면 true, 평년이면 false
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isLeapYear(year: number): boolean {
  // TODO: GREEN 단계에서 구현
  return false;
}

/**
 * 반복 일정의 모든 인스턴스를 생성합니다.
 * @param event - 원본 Event (반복 정보 포함)
 * @returns 생성된 모든 인스턴스 배열
 */
export function generateRepeatInstances(event: Event): Event[] {
  const instances: Event[] = [];

  // 반복이 없는 경우 원본 이벤트만 반환
  if (event.repeat.type === 'none' || !event.repeat.endDate) {
    return [event];
  }

  const startDate = new Date(event.date);
  const endDate = new Date(event.repeat.endDate);
  const interval = event.repeat.interval || 1;

  // 매일 반복 처리
  if (event.repeat.type === 'daily') {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      instances.push({
        ...event,
        date: formatDateToISO(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }
  }

  return instances;
}
