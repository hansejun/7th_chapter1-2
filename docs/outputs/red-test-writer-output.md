# RED 단계 테스트 작업 내역

> **메타데이터**
>
> - Agent: red-test-writer
> - Status: in_progress
> - Timestamp: 2025-01-30T12:00:00Z
> - Input Source: docs/outputs/spec-analyzer-output.md
> - Total Tests: 37개
> - Completed Tests: 1개
> - Progress: 1/37 (3%)

## 전체 작업 범위 체크리스트

spec-analyzer-output.md 기반 (TS-001 ~ TS-037):

### A. 기본 반복 유형 생성 (dateUtils) - 1/4 완료

- [x] A-1: TS-001 매일 반복 일정 생성 → [#a-1](#a-1)
- [ ] A-2: TS-002 매주 반복 일정 생성 (수요일 기준)
- [ ] A-3: TS-003 매월 반복 일정 생성 (15일 기준)
- [ ] A-4: TS-004 매년 반복 일정 생성

### B. 반복 간격 처리 (dateUtils) - 0/3 완료

- [ ] B-1: TS-005 2일마다 반복
- [ ] B-2: TS-006 3주마다 반복
- [ ] B-3: TS-007 2개월마다 반복

### C. 엣지케이스: 31일 월간 반복 (dateUtils) - 0/3 완료

- [ ] C-1: TS-008 31일 월간 반복 - 기본 케이스
- [ ] C-2: TS-009 31일 2개월마다 반복
- [ ] C-3: TS-010 윤년 31일 월간 반복

### D. 엣지케이스: 30일/29일 월간 반복 (dateUtils) - 0/3 완료

- [ ] D-1: TS-011 30일 월간 반복
- [ ] D-2: TS-012 29일 월간 반복 (평년)
- [ ] D-3: TS-013 29일 월간 반복 (윤년)

### E. 엣지케이스: 2월 29일 연간 반복 (dateUtils) - 0/1 완료

- [ ] E-1: TS-014 2월 29일 연간 반복

### F. 종료 날짜 경계 처리 (dateUtils) - 0/3 완료

- [ ] F-1: TS-015 종료 날짜 포함 확인
- [ ] F-2: TS-016 종료 날짜 경계 (주간 반복)
- [ ] F-3: TS-017 기본 종료 날짜 설정

### G. 반복 일정 수정 (통합) - 0/3 완료

- [ ] G-1: TS-018 단일 수정 - 독립된 일정으로 변환
- [ ] G-2: TS-019 전체 수정 - 모든 인스턴스 변경
- [ ] G-3: TS-020 단일 수정 후 일반 일정 재수정

### H. 반복 일정 삭제 (통합) - 0/3 완료

- [ ] H-1: TS-021 단일 삭제 - 예외 목록에 추가
- [ ] H-2: TS-022 전체 삭제 - 모든 인스턴스 제거
- [ ] H-3: TS-023 여러 날짜 단일 삭제

### I. 반복 아이콘 표시 (통합) - 0/3 완료

- [ ] I-1: TS-024 반복 일정 아이콘 표시
- [ ] I-2: TS-025 단일 수정 후 아이콘 제거
- [ ] I-3: TS-026 일반 일정 아이콘 없음

### J. 동적 생성 유틸리티 함수 (dateUtils) - 0/6 완료

- [ ] J-1: TS-027 generateRepeatInstances() - 기본 동작
- [ ] J-2: TS-028 generateRepeatInstancesInRange() - 범위 제한
- [ ] J-3: TS-029 isDateExcluded() - 예외 날짜 확인
- [ ] J-4: TS-030 isValidDayInMonth() - 31일 검증
- [ ] J-5: TS-031 isValidDayInMonth() - 2월 29일 검증
- [ ] J-6: TS-032 isLeapYear() - 윤년 확인

### K. 통합 테스트 (전체 플로우) - 0/5 완료

- [ ] K-1: TS-033 반복 일정 생성 및 표시 (전체 플로우)
- [ ] K-2: TS-034 반복 일정 단일 수정 및 표시 (전체 플로우)
- [ ] K-3: TS-035 반복 일정 단일 삭제 및 표시 (전체 플로우)
- [ ] K-4: TS-036 31일 월간 반복 생성 및 표시 (전체 플로우)
- [ ] K-5: TS-037 2월 29일 연간 반복 생성 및 표시 (전체 플로우)

**진행 상황**: 1/37 완료 (3%)

---

<a id="a-1"></a>

## A-1: TS-001 매일 반복 일정 생성

> **메타데이터**
>
> - Status: ✅ completed
> - Timestamp: 2025-01-30T12:15:00Z
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts

### 테스트 개요

- **테스트 대상**: generateRepeatInstances() 함수 - 매일 반복 기본 기능
- **테스트 파일**: src/__tests__/unit/easy.repeatUtils.spec.ts
- **테스트 이름**: "매일 반복 일정의 모든 인스턴스를 생성한다 (10일간)"

### 검증하는 요구사항

**spec-analyzer-output.md TS-001**:
- Given: 2025-01-01에 일정 생성, 반복 유형: 매일, 종료 날짜: 2025-01-10
- When: `generateRepeatInstances()` 호출
- Then: 2025-01-01 ~ 2025-01-10까지 10개의 인스턴스 생성

이는 FR-006 (반복 일정 동적 생성)의 가장 기본적인 기능을 테스트합니다.

### 테스트 코드

```typescript
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
```

### 실행 결과

```
FAIL  src/__tests__/unit/easy.repeatUtils.spec.ts
Error: Failed to resolve import "../../utils/repeatUtils" from "src/__tests__/unit/easy.repeatUtils.spec.ts".
Does the file exist?
```

### 실패 이유

`src/utils/repeatUtils.ts` 파일이 존재하지 않습니다.
- `generateRepeatInstances()` 함수가 구현되지 않았습니다.
- 파일 자체가 생성되지 않았습니다.

이는 **의도된 실패**입니다. 테스트가 명확히 무엇이 필요한지를 보여줍니다:
1. `src/utils/repeatUtils.ts` 파일 생성
2. `generateRepeatInstances(event: Event): Event[]` 함수 구현
3. 매일 반복 로직 구현 (시작 날짜부터 종료 날짜까지 1일 간격으로 인스턴스 생성)

### 다음 단계 (GREEN)

**GREEN 단계에서 구현할 내용**:

1. **파일 생성**: `src/utils/repeatUtils.ts`

2. **함수 시그니처**:
   ```typescript
   export function generateRepeatInstances(event: Event): Event[]
   ```

3. **최소 구현 요구사항**:
   - `event.repeat.type`이 'daily'일 때 처리
   - `event.date`부터 `event.repeat.endDate`까지 1일 간격으로 날짜 생성
   - 각 날짜마다 event 객체 복사본 생성 (date 필드만 변경)
   - 배열로 반환

4. **검증**:
   - 반환 배열의 길이가 10개
   - 첫 번째 인스턴스의 날짜가 '2025-01-01'
   - 마지막 인스턴스의 날짜가 '2025-01-10'

---
