# GREEN 단계 구현 작업 내역

> **메타데이터**
>
> - Agent: green-implementer
> - Status: in_progress
> - Timestamp: 2025-10-30T13:40:00Z
> - Input Source: docs/outputs/red-test-writer-output.md
> - Total Implementations: 37개
> - Completed Implementations: 1개
> - Progress: 1/37 (3%)

## 전체 작업 범위

RED 단계에서 작성된 37개 테스트에 대한 최소 구현.

---

## 완료된 구현

### Cycle 1: TS-001 매일 반복 일정 생성

> **메타데이터**
>
> - Status: ✅ completed
> - Timestamp: 2025-10-30T13:40:00Z
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts
> - Implementation File: src/utils/repeatUtils.ts

#### 테스트 요구사항

- **Given**: 2025-01-01에 일정 생성, 반복 유형: 매일, 종료 날짜: 2025-01-10
- **When**: `generateRepeatInstances()` 호출
- **Then**: 2025-01-01 ~ 2025-01-10까지 10개의 인스턴스 생성

#### 구현 내용

**파일**: `src/utils/repeatUtils.ts`

```typescript
import { Event } from '../types';

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
        date: currentDate.toISOString().split('T')[0],
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }
  }

  return instances;
}
```

#### 구현 결정 사항

1. **함수 시그니처**: `generateRepeatInstances(event: Event): Event[]`
   - 입력: 반복 정보를 포함한 Event 객체
   - 출력: 생성된 인스턴스 배열

2. **반복 없는 경우 처리**: `type === 'none'` 또는 `endDate` 없으면 원본 반환

3. **날짜 생성 로직**:
   - `Date` 객체로 시작/종료 날짜 파싱
   - while 루프로 종료 날짜까지 반복
   - `setDate()`로 interval만큼 날짜 증가
   - `toISOString().split('T')[0]`로 'YYYY-MM-DD' 형식 변환

4. **인스턴스 객체**: spread operator로 원본 이벤트 복사, date만 변경

#### 검증 결과

✅ **테스트 통과**:
```
✓ src/__tests__/unit/easy.repeatUtils.spec.ts (1 test) 3ms
  ✓ 매일 반복 일정의 모든 인스턴스를 생성한다 (10일간)
```

✅ **전체 테스트 통과**:
```
Test Files  12 passed (12)
Tests  116 passed (116)
```
- 기존 115개 + 신규 1개 = 116개

✅ **린트 검사 통과**:
```
> pnpm lint:eslint && pnpm lint:tsc
✓ (1 pre-existing warning in useNotifications.ts)
```

✅ **타입 검사 통과**: TypeScript 컴파일 오류 없음

#### 다음 단계 (REFACTOR)

REFACTOR 단계에서 고려할 사항:
1. 함수 복잡도 확인
2. 매직 넘버 제거
3. 코드 가독성 개선
4. 테스트 커버리지 확인

---

## 대기 중인 구현

- Cycle 2: TS-002 매주 반복 일정 생성
- Cycle 3: TS-003 매월 반복 일정 생성
- ... (36개 대기)
