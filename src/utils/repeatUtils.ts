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
