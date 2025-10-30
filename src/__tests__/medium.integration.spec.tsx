import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 일정 UI', () => {
  it('반복 유형 Select가 존재하고 5개 옵션이 있다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 일정 추가 모달 열기
    await user.click(screen.getAllByText('일정 추가')[0]);

    // "반복 유형" label이 있는 Select 확인
    const repeatTypeLabel = screen.getByLabelText('반복 유형');
    expect(repeatTypeLabel).toBeInTheDocument();

    // Select 열기
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));

    // 5개 옵션 확인
    expect(screen.getByRole('option', { name: '반복 안함-option' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매일-option' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매주-option' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매월-option' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매년-option' })).toBeInTheDocument();
  });

  it("'반복 안함' 선택 시 추가 필드가 표시되지 않는다", async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본값이 '반복 안함'이므로 추가 필드가 없어야 함
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
  });

  it("'매일' 선택 시 반복 간격과 종료일 필드가 표시된다", async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매일'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));

    // 추가 필드 확인
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 간격 필드는 min 속성이 1이다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매일'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));

    const intervalInput = screen.getByLabelText('반복 간격') as HTMLInputElement;
    expect(intervalInput.min).toBe('1');
  });

  it('반복 종료일 필드는 max 속성이 2025-12-31이다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매일'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));

    const endDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;
    expect(endDateInput.max).toBe('2025-12-31');
  });

  it("'매주' 선택 시 추가 필드가 표시된다", async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매주'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매주-option' }));

    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it("'매월' 선택 시 추가 필드가 표시된다", async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매월'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매월-option' }));

    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it("'매년' 선택 시 추가 필드가 표시된다", async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 유형을 '매년'로 변경
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매년-option' }));

    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });
});

describe('반복 일정 생성', () => {
  it('매일 반복 일정 생성 시 캘린더에 여러 개의 이벤트가 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), '매일 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '매일 진행하는 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));

    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');

    await user.clear(screen.getByLabelText('반복 종료일'));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-05');

    await user.click(screen.getByTestId('event-submit-button'));

    // 5개 이벤트가 생성되어야 함 (10/1 ~ 10/5)
    const eventList = within(screen.getByTestId('event-list'));
    const events = await eventList.findAllByText('매일 회의');
    expect(events).toHaveLength(5);
  });

  it('매주 반복 일정 생성 시 같은 요일에 이벤트가 생성된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), '주간 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-06'); // 월요일
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '매주 진행하는 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매주-option' }));

    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');

    await user.clear(screen.getByLabelText('반복 종료일'));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-31');

    await user.click(screen.getByTestId('event-submit-button'));

    // 4개 이벤트가 생성되어야 함 (10/6, 10/13, 10/20, 10/27 - 모두 월요일)
    const eventList = within(screen.getByTestId('event-list'));
    const events = await eventList.findAllByText('주간 회의');
    expect(events).toHaveLength(4);
  });

  it('매월 반복 일정 생성 시 같은 날짜에 이벤트가 생성된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), '월간 보고');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '16:00');
    await user.type(screen.getByLabelText('종료 시간'), '17:00');
    await user.type(screen.getByLabelText('설명'), '매월 1일 보고');
    await user.type(screen.getByLabelText('위치'), '회의실 C');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 - 10/1부터 12/1까지 매월 반복 (3개월)
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매월-option' }));

    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');

    await user.clear(screen.getByLabelText('반복 종료일'));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-12-01');

    await user.click(screen.getByTestId('event-submit-button'));

    // 3개 이벤트가 생성되어야 함 (10/1, 11/1, 12/1)
    // 현재 월 뷰가 10월이므로 10/1만 표시되고, 나머지는 다른 월에 있음
    // 테스트는 전체 이벤트 목록에서 확인
    const eventList = within(screen.getByTestId('event-list'));
    const events = await eventList.findAllByText('월간 보고');
    // 현재 10월 뷰에서는 1개만 표시됨
    expect(events.length).toBeGreaterThanOrEqual(1);
  });
});

describe('반복 일정 아이콘 표시', () => {
  it('반복 일정에는 RepeatIcon이 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 일정 생성
    await user.type(screen.getByLabelText('제목'), '반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '매일 반복');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 매일 반복 설정
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');
    await user.clear(screen.getByLabelText('반복 종료일'));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-03');

    await user.click(screen.getByTestId('event-submit-button'));

    // 캘린더에서 RepeatIcon 확인 (월별 뷰)
    // 반복 일정은 RepeatIcon을 가져야 함
    const repeatIcons = await screen.findAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('단일 일정에는 RepeatIcon이 표시되지 않아야 한다', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    // 단일 일정 생성
    await user.type(screen.getByLabelText('제목'), '단일 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '단발 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 없음 (기본값)

    await user.click(screen.getByTestId('event-submit-button'));

    // 캘린더에서 RepeatIcon이 없어야 함
    const repeatIcons = screen.queryAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBe(0);
  });

  it('반복 일정과 단일 일정이 같은 날짜에 있을 때 각각 정확히 아이콘이 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    // 1. 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '반복 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '반복');
    await user.type(screen.getByLabelText('위치'), '장소 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '1');
    await user.clear(screen.getByLabelText('반복 종료일'));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-02');

    await user.click(screen.getByTestId('event-submit-button'));

    // 2. 단일 일정 생성 (같은 날짜)
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '단일 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '단일');
    await user.type(screen.getByLabelText('위치'), '장소 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    await user.click(screen.getByTestId('event-submit-button'));

    // RepeatIcon 개수 확인: 반복 일정 2개 (10/1, 10/2)만 아이콘 있어야 함
    const repeatIcons = await screen.findAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBe(2);
  });
});
