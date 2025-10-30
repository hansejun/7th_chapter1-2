import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import { generateRepeatInstances } from '../../utils/repeatUtils';

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
