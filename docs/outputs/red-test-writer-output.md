# RED 단계 테스트 작업 내역 - Cycle 1

> **메타데이터**
>
> - Agent: red-test-writer
> - Status: completed
> - Timestamp: 2025-10-31T10:20:00Z
> - Input Source: docs/outputs/spec-analyzer-output.md (Cycle 1)
> - Total Tests: 3개 (formatDate, getDayOfWeek, isLeapYear)
> - Completed Tests: 3개
> - Progress: 3/3 (100%)
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts
> - Implementation File: src/utils/repeatUtils.ts (함수 stub 추가)

---

## 전체 작업 범위 체크리스트

Cycle 1 기준: 날짜 유틸리티 함수

### A. 날짜 유틸리티 함수 (repeatUtils) - 3/3 완료 ✅

- [x] A-1: formatDate - Date 객체를 YYYY-MM-DD 형식으로 변환 → `#a-1`
- [x] A-2: getDayOfWeek - 날짜의 요일 반환 (0=일요일, 6=토요일) → `#a-2`
- [x] A-3: isLeapYear - 윤년 판단 (4/100/400 규칙) → `#a-3`

**진행 상황**: 3/3 완료 (100%) ✅

---

<a id="a-1"></a>

## A-1: formatDate

> **메타데이터**
>
> - Status: ✅ completed
> - Timestamp: 2025-10-31T10:18:00Z
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts
> - Function: formatDate(date: Date): string

### 작성한 테스트

#### 테스트 개요

- 테스트 대상: formatDate 함수 - Date 객체를 YYYY-MM-DD 형식으로 변환
- 테스트 파일: src/__tests__/unit/easy.repeatUtils.spec.ts
- 테스트 이름:
  1. "Date 객체를 YYYY-MM-DD 형식 문자열로 변환한다"
  2. "월과 일이 한 자리수일 때 0 패딩을 추가한다"
  3. "연말 날짜를 올바르게 변환한다"

#### 검증하는 요구사항

spec-analyzer-output.md의 "6.6 formatDate" 섹션:
- Date 객체를 YYYY-MM-DD 형식 문자열로 변환
- 월/일이 한 자리수일 때 0 패딩 필요 (예: 2025-01-05)

#### 테스트 코드

```typescript
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
```

### 실행 결과

```
FAIL  src/__tests__/unit/easy.repeatUtils.spec.ts > formatDate > Date 객체를 YYYY-MM-DD 형식 문자열로 변환한다
AssertionError: expected '' to be '2025-01-01' // Object.is equality

Expected: "2025-01-01"
Received: ""
```

### 실패 이유

formatDate 함수가 빈 문자열을 반환합니다 (미구현 상태).

### 다음 단계 (GREEN)

`src/utils/repeatUtils.ts`에서 formatDate 함수 구현 필요:

```typescript
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

---

<a id="a-2"></a>

## A-2: getDayOfWeek

> **메타데이터**
>
> - Status: ✅ completed
> - Timestamp: 2025-10-31T10:18:00Z
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts
> - Function: getDayOfWeek(date: Date): number

### 작성한 테스트

#### 테스트 개요

- 테스트 대상: getDayOfWeek 함수 - 날짜의 요일 반환 (0=일요일, 6=토요일)
- 테스트 파일: src/__tests__/unit/easy.repeatUtils.spec.ts
- 테스트 이름:
  1. "2025-01-06(월요일)의 요일을 1로 반환한다"
  2. "2025-01-05(일요일)의 요일을 0으로 반환한다"
  3. "2025-01-11(토요일)의 요일을 6으로 반환한다"

#### 검증하는 요구사항

spec-analyzer-output.md의 "6.5 getDayOfWeek" 섹션:
- 날짜의 요일을 반환 (0=일요일, 6=토요일)
- 매주 반복 시 요일 고정에 사용

#### 테스트 코드

```typescript
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
```

### 실행 결과

```
FAIL  src/__tests__/unit/easy.repeatUtils.spec.ts > getDayOfWeek > 2025-01-06(월요일)의 요일을 1로 반환한다
AssertionError: expected -1 to be 1 // Object.is equality

Expected: 1
Received: -1
```

### 실패 이유

getDayOfWeek 함수가 항상 -1을 반환합니다 (미구현 상태).

### 다음 단계 (GREEN)

`src/utils/repeatUtils.ts`에서 getDayOfWeek 함수 구현 필요:

```typescript
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}
```

---

<a id="a-3"></a>

## A-3: isLeapYear

> **메타데이터**
>
> - Status: ✅ completed
> - Timestamp: 2025-10-31T10:18:00Z
> - Test File: src/__tests__/unit/easy.repeatUtils.spec.ts
> - Function: isLeapYear(year: number): boolean

### 작성한 테스트

#### 테스트 개요

- 테스트 대상: isLeapYear 함수 - 윤년 판단
- 테스트 파일: src/__tests__/unit/easy.repeatUtils.spec.ts
- 테스트 이름:
  1. "2024년은 윤년이므로 true를 반환한다"
  2. "2025년은 평년이므로 false를 반환한다"
  3. "2000년은 400으로 나누어떨어지므로 윤년(true)이다"
  4. "1900년은 100으로 나누어떨어지지만 400으로는 안되므로 평년(false)이다"

#### 검증하는 요구사항

spec-analyzer-output.md의 "6.4 isLeapYear" 섹션:
- 윤년 판단 로직 (4/100/400 규칙)
- 2/29 매년 반복 시 윤년 체크에 사용

#### 테스트 코드

```typescript
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
```

### 실행 결과

```
FAIL  src/__tests__/unit/easy.repeatUtils.spec.ts > isLeapYear > 2024년은 윤년이므로 true를 반환한다
AssertionError: expected false to be true // Object.is equality

Expected: true
Received: false
```

### 실패 이유

isLeapYear 함수가 항상 false를 반환합니다 (미구현 상태).

### 다음 단계 (GREEN)

`src/utils/repeatUtils.ts`에서 isLeapYear 함수 구현 필요:

```typescript
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
```

---

## 최종 검증 결과

### 테스트 실행 결과

- 총 테스트: 126개
- 통과: 118개
- 실패: 8개 (formatDate 3개 + getDayOfWeek 3개 + isLeapYear 2개)
- Baseline 대비: +8 실패 (Baseline: 116 passed, 0 failed)

### 실패 유형

- ✅ 모든 실패가 Assertion 기반 (타입/런타임 에러 없음)
- ✅ 각 테스트가 단일 원인으로만 실패
- ✅ 실패 메시지가 요구사항을 명확히 설명

### 린트 검사

- ✅ 통과 (errors: 0, warnings: 4)

### 파일 인코딩

- ✅ UTF-8 확인

---

## 다음 단계 (GREEN Phase)

green-implementer 에이전트가 다음을 구현합니다:

1. formatDate 함수 구현
2. getDayOfWeek 함수 구현
3. isLeapYear 함수 구현

모든 테스트가 통과하도록 구현 후 GREEN Phase 완료.
