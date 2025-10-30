# RED 단계 테스트 작성 결과 - Cycle 5

> **메타데이터**
>
> - Agent: tdd-orchestrator (direct)
> - Status: success
> - Timestamp: 2025-10-31T05:21:00Z
> - Cycle: 5/10
> - Feature: 반복 설정 UI 컴포넌트
> - Input Source: docs/outputs/red-test-writer-input.md

## 작성된 테스트

### 파일: src/__tests__/medium.integration.spec.tsx

새로운 describe 블록 "반복 일정 UI" 추가 (총 8개 테스트)

## 테스트 목록

1. **반복 유형 Select가 존재하고 5개 옵션이 있다**
   - 일정 추가 모달에서 "반복 유형" label 확인
   - 5개 옵션 확인: 반복 안함, 매일, 매주, 매월, 매년

2. **'반복 안함' 선택 시 추가 필드가 표시되지 않는다**
   - 기본값이 '반복 안함'일 때
   - "반복 간격", "반복 종료일" 필드가 DOM에 없음

3. **'매일' 선택 시 반복 간격과 종료일 필드가 표시된다**
   - 반복 유형을 '매일'로 변경
   - 추가 필드 표시 확인

4. **반복 간격 필드는 min 속성이 1이다**
   - '매일' 선택 후
   - input의 min 속성 확인

5. **반복 종료일 필드는 max 속성이 2025-12-31이다**
   - '매일' 선택 후
   - input의 max 속성 확인

6. **'매주' 선택 시 추가 필드가 표시된다**
   - 반복 유형을 '매주'로 변경
   - 추가 필드 표시 확인

7. **'매월' 선택 시 추가 필드가 표시된다**
   - 반복 유형을 '매월'로 변경
   - 추가 필드 표시 확인

8. **'매년' 선택 시 추가 필드가 표시된다**
   - 반복 유형을 '매년'로 변경
   - 추가 필드 표시 확인

## 실행 결과

### Baseline 비교

- **Before**: 152 passed, 0 failed
- **After**: 153 passed, 7 failed
- **증가**: +7 failed ✅ (Baseline+7)

### 전체 테스트 실행

```
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > 반복 유형 Select가 존재하고 5개 옵션이 있다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > '매일' 선택 시 반복 간격과 종료일 필드가 표시된다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > 반복 간격 필드는 min 속성이 1이다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > 반복 종료일 필드는 max 속성이 2025-12-31이다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > '매주' 선택 시 추가 필드가 표시된다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > '매월' 선택 시 추가 필드가 표시된다
 FAIL  src/__tests__/medium.integration.spec.tsx > 반복 일정 UI > '매년' 선택 시 추가 필드가 표시된다

 Test Files  1 failed | 11 passed (12)
      Tests  7 failed | 153 passed (160)
```

### 단일 테스트 실행 (실패 유형 확인)

```bash
pnpm test -t "반복 유형 Select가 존재하고 5개 옵션이 있다"
```

**실패 메시지**:
```
TestingLibraryElementError: Unable to find a label with the text of: 반복 유형
```

**실패 유형**: ✅ **Assertion 기반** (UI 미구현으로 인한 getByLabelText 실패)

## 린트 검사

```bash
pnpm run lint
```

**결과**: ✅ **통과** (warning 1개만 있음, error 없음)

## 다음 단계 (GREEN Phase)

### 구현 파일

- `src/App.tsx` 또는 `src/hooks/useEventForm.ts`

### 구현할 UI 요소

1. **반복 유형 Select**
   - FormControl + InputLabel + Select
   - label: "반복 유형"
   - 옵션: none(반복 안함), daily(매일), weekly(매주), monthly(매월), yearly(매년)

2. **반복 간격 TextField** (조건부 렌더링)
   - type="number"
   - min="1"
   - label="반복 간격"
   - 표시 조건: repeat.type !== 'none'

3. **반복 종료일 TextField** (조건부 렌더링)
   - type="date"
   - max="2025-12-31"
   - label="반복 종료일"
   - 표시 조건: repeat.type !== 'none'

### 상태 관리

useEventForm.ts에 다음 상태 추가:
- `repeatType: RepeatType` (기본값: 'none')
- `repeatInterval: number` (기본값: 1)
- `repeatEndDate: string` (기본값: '2025-12-31')

### 검증 기준 (GREEN Gate)

- ✅ 모든 테스트 통과 (160개 → 모두 통과)
- ✅ 린트 검사 통과
- ✅ 타입 오류 없음

## 체크리스트

- [x] Baseline 수집 (152 passed, 0 failed)
- [x] 테스트 작성 (8개)
- [x] Baseline+1 이상 실패 확인 (Baseline+7) ✅
- [x] 신규 실패 항목에 추가한 테스트 포함 ✅
- [x] 실패 유형 Assertion 기반 확인 ✅
- [x] 린트 검사 통과 ✅
- [x] 출력 문서 작성

## 요약

Cycle 5 RED Phase 완료:
- 8개의 의도적으로 실패하는 UI 테스트 작성
- Baseline 대비 +7 실패 (성공)
- 실패 유형: Assertion 기반 (UI 미구현)
- 다음 단계: GREEN Phase로 이동하여 UI 구현
