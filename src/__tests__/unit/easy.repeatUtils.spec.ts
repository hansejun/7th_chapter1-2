import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import {
  generateRepeatInstances,
  formatDate,
  getDayOfWeek,
  isLeapYear,
} from '../../utils/repeatUtils';

describe('generateRepeatInstances', () => {
  it('매일 반복 일정의 모든 인스턴스를 생성한다 (10일간)', () => {
    // Arrange
    const event: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '매일 반복되는 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-10',
      },
      notificationTime: 10,
    };

    // Act
    const instances = generateRepeatInstances(event);

    // Assert
    expect(instances).toHaveLength(10);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[9].date).toBe('2025-01-10');
  });
});

describe('formatDate', () => {
  it('Date 객체를 YYYY-MM-DD 형식 문자열로 변환한다', () => {
    // Arrange
    const date = new Date('2025-01-01');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-01-01');
  });

  it('월과 일이 한 자리수일 때 0 패딩을 추가한다', () => {
    // Arrange
    const date = new Date('2025-01-05');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-01-05');
  });

  it('연말 날짜를 올바르게 변환한다', () => {
    // Arrange
    const date = new Date('2025-12-31');

    // Act
    const formatted = formatDate(date);

    // Assert
    expect(formatted).toBe('2025-12-31');
  });
});

describe('getDayOfWeek', () => {
  it('2025-01-06(월요일)의 요일을 1로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-06');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(1);
  });

  it('2025-01-05(일요일)의 요일을 0으로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-05');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(0);
  });

  it('2025-01-11(토요일)의 요일을 6으로 반환한다', () => {
    // Arrange
    const date = new Date('2025-01-11');

    // Act
    const dayOfWeek = getDayOfWeek(date);

    // Assert
    expect(dayOfWeek).toBe(6);
  });
});

describe('isLeapYear', () => {
  it('2024년은 윤년이므로 true를 반환한다', () => {
    // Act
    const result = isLeapYear(2024);

    // Assert
    expect(result).toBe(true);
  });

  it('2025년은 평년이므로 false를 반환한다', () => {
    // Act
    const result = isLeapYear(2025);

    // Assert
    expect(result).toBe(false);
  });

  it('2000년은 400으로 나누어떨어지므로 윤년(true)이다', () => {
    // Act
    const result = isLeapYear(2000);

    // Assert
    expect(result).toBe(true);
  });

  it('1900년은 100으로 나누어떨어지지만 400으로는 안되므로 평년(false)이다', () => {
    // Act
    const result = isLeapYear(1900);

    // Assert
    expect(result).toBe(false);
  });
});
