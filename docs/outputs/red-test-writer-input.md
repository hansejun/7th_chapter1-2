# RED Test Writer Input - Cycle 2

> **메타데이터**
> - Cycle: 2/10
> - Feature: shouldSkipDate 함수
> - Agent: tdd-orchestrator → red-test-writer
> - Timestamp: 2025-10-31T04:30:00Z

## 작업 지시

다음 함수에 대한 **의도적으로 실패하는 테스트**를 작성하세요.

### 구현 대상 함수

```typescript
function shouldSkipDate(
  date: Date,
  repeatType: RepeatType,
  baseDay: number,
  baseMonth?: number
): boolean
```

### 함수 목적

특정 날짜가 반복 규칙에 따라 건너뛰어야 하는지 판단합니다.

### 로직 명세

```typescript
if (repeatType === 'monthly' && baseDay === 31) {
  return date.getDate() !== 31;
}

if (repeatType === 'yearly' && baseMonth === 1 && baseDay === 29) {
  return !isLeapYear(date.getFullYear()) || date.getDate() !== 29;
}

return false;
```

### 테스트 시나리오 (spec-analyzer-output.md 기반)

1. **2월 28일은 건너뜀 (매월 31일 반복)**
   - Input: `new Date('2025-02-28'), 'monthly', 31`
   - Expected: `true`

2. **3월 31일은 생성 (매월 31일 반복)**
   - Input: `new Date('2025-03-31'), 'monthly', 31`
   - Expected: `false`

3. **평년 2/28은 건너뜀 (매년 2/29 반복)**
   - Input: `new Date('2025-02-28'), 'yearly', 29, 1`
   - Expected: `true`

4. **윤년 2/29는 생성 (매년 2/29 반복)**
   - Input: `new Date('2024-02-29'), 'yearly', 29, 1`
   - Expected: `false`

5. **일반 날짜는 건너뛰지 않음**
   - Input: `new Date('2025-01-15'), 'daily', 15`
   - Expected: `false`

### 파일 위치

- 테스트 파일: `src/__tests__/unit/easy.repeatUtils.spec.ts`
- 구현 파일: `src/utils/repeatUtils.ts` (아직 함수 미구현)

### 요구사항

- ✅ 테스트는 Assertion 기반 실패여야 함 (미구현으로 인한)
- ✅ Baseline(126) 대비 실패 수 +1 이상 증가
- ✅ 모든 시나리오를 단일 describe 블록에 작성
- ✅ 의존성 함수: `isLeapYear` (이미 구현됨)

### 베이스라인

- 현재 통과 테스트: 126개
- 현재 실패 테스트: 0개
