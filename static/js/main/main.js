document.addEventListener('DOMContentLoaded', () => {
    // ✅ 공항 데이터 배열
const airports = [
    { code: 'ICN', name: '서울/인천', country: '대한민국' },
    { code: 'GMP', name: '서울/김포', country: '대한민국' },
    { code: 'CJU', name: '제주', country: '대한민국' },
    { code: 'NRT', name: '도쿄/나리타', country: '일본' },
    { code: 'HND', name: '도쿄/하네다', country: '일본' },
    { code: 'LAX', name: '로스앤젤레스', country: '미국' },
    { code: 'JFK', name: '뉴욕/존 F. 케네디', country: '미국' },
    { code: 'CDG', name: '파리/샤를 드골', country: '프랑스' },
    { code: 'LHR', name: '런던/히드로', country: '영국' },
    { code: 'SYD', name: '시드니', country: '호주' }
];

const departureBtn = document.getElementById('departureBtn29a913db9a6a5790649931aea921e6af');
const departureModal = document.getElementById('departureModal');
const closeDepartureModal = document.getElementById('closeDepartureModal');
const departureSearchInput = document.getElementById("departureSearchInput");
const departureResults = document.getElementById('departureResults');    
const departureCodeDisplay = document.querySelector('.quickbookings__code'); // ✅ 코드 표시 (FROM이 CODE로 바뀜)
const departureInfoDisplay = document.querySelector('.quickbookings__airport');

const arrivalBtn = document.getElementById('destinationBtn29a913db9a6a5790649931aea921e6af');
const arrivalModal = document.getElementById('arrivalModal');
const closeArrivalModal = document.getElementById('closeArrivalModal');
const arrivalSearchInput = document.getElementById("arrivalSearchInput");
const arrivalResults = document.getElementById('arrivalResults');
const arrivalDisplayCode = document.querySelector('.quickbookings__location._has-dialog.-to .quickbookings__code'); // TO -> CODE로 변경됨
const arrivalDisplayAirport = document.querySelector('.quickbookings__location._has-dialog.-to .quickbookings__airport');


const switchBtn = document.querySelector('.quickbookings__swap');
const dateBtn = document.getElementById('date29a913db9a6a5790649931aea921e6af');
const dateModal = document.getElementById('dateModal');
const closeDateModal = document.getElementById('closeDateModal');

const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const departureDateSpan = document.querySelector('.departure-date');
const arrivalDateSpan = document.querySelector('.arrival-date');

const passengerBtn = document.getElementById('passengerBtn');
const passengerModal = document.getElementById('passengerModal');
const closePassengerModal = document.getElementById('closePassengerModal');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const countDisplay = document.getElementById('count');
const passengerCountDisplay = document.getElementById('passengerCount');

const seatClassBtn = document.getElementById('seatClassBtn');
const seatClassModal = document.getElementById('seatClassModal');
const closeSeatClassModal = document.getElementById('closeSeatClassModal');
const seatClassDisplay = document.getElementById('seatClassDisplay');
const seatOptions = document.querySelectorAll('.seat-option');

const confirmButton = document.getElementById('calendarConfirmBtn');

const searchButton = document.getElementById('quickbookingOnSearch');


let count = 1;
let isSelectingDeparture = true;
let currentDate = new Date();
let departureDate = null;
let arrivalDate = null;

const tabsContainer = document.querySelector('.booking-widget__list');
const addReservationButton = document.getElementById('addReservationButton');

tabsContainer.addEventListener('click', (event) => {
    const clickedTab = event.target.closest('.booking-widget__itm');
    if (clickedTab && clickedTab !== addReservationButton.parentElement) {
        // 모든 탭에서 -active 클래스 제거
        tabsContainer.querySelectorAll('.booking-widget__itm').forEach(tab => {
            tab.classList.remove('-active');
        });
        // 클릭한 탭에 -active 클래스 추가
        clickedTab.classList.add('-active');
    }
});

// 최대 예약 개수 설정
const maxReservations = 5;
let reservationCount = 1; // 기본적으로 1개의 예약이 있음

// 기본 선택된 탭 (항공권 예매)
const defaultTab = document.querySelector('.default-tab'); // 기본 탭 선택

// + 버튼 클릭 이벤트
addReservationButton.addEventListener('click', () => {
    if (reservationCount < maxReservations) {
        reservationCount++;

        // 새로운 li 요소 생성
        const newTab = document.createElement('li');
        newTab.className = 'booking-widget__itm';
        newTab.style.marginTop = '-10px';

        // 새로운 버튼 생성
        const newButton = document.createElement('button');
        newButton.type = 'button';
        newButton.className = 'booking-widget__button';
        newButton.setAttribute('role', 'tab');
        newButton.setAttribute('aria-controls', `panel_${reservationCount}`);
        newButton.setAttribute('aria-selected', 'false');
        newButton.tabIndex = -1;

        // 버튼 텍스트 생성
        const buttonText = document.createElement('span');
        buttonText.className = 'booking-widget__txt';
        buttonText.textContent = `항공권 추가 ${reservationCount}`;

        // 삭제 버튼 추가 (내부 배치)
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-reservation';
        deleteButton.textContent = 'X';

        deleteButton.addEventListener('click', () => {
            if (reservationCount > 1) {
                newTab.remove(); // 해당 항공권 삭제
                reservationCount--; // 예약 개수 감소
            } else {
                alert('최소 하나의 예약은 유지해야 합니다.');
            }
        });

        // 요소 조립 (삭제 버튼을 내부로 이동)
        newButton.appendChild(buttonText);
        newButton.appendChild(deleteButton);
        newTab.appendChild(newButton);

        // + 버튼 앞에 새로운 탭 추가
        tabsContainer.insertBefore(newTab, addReservationButton.parentElement);

        // 새로 추가된 탭을 선택된 상태로 만들기
        newButton.click();
    } else {
        alert('최대 5개의 예약만 추가할 수 있습니다.');
    }
});


function formatDateToISO(dateString) {
    // "2025년 3월 1일" → "2025-03-01" 변환
    const regex = /(\d{4})년 (\d{1,2})월 (\d{1,2})일/;
    const match = dateString.match(regex);
    if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return dateString;  // 변환 실패 시 원본 반환
}

if (searchButton) {
    searchButton.onclick = () => {
        // 검색 조건 값 가져오기
        const departure = document.querySelector('.quickbookings__location.-from .quickbookings__code').textContent.trim();
        const arrival = document.querySelector('.quickbookings__location.-to .quickbookings__code').textContent.trim();
        const departureDateRaw = document.querySelector('.departure-date').textContent.trim();
        const departureDate = formatDateToISO(departureDateRaw);
        const seatClass = document.getElementById('seatClassDisplay').textContent.trim();
        const passengerCount = document.getElementById('count').textContent.trim();


        // URL에 쿼리스트링 추가
        const queryParams = new URLSearchParams({
            departure_airport: departure,
            arrival_airport: arrival,
            departure_date: departureDate,
            seat_class: seatClass,
            passenger_count: passengerCount
        });

        // 검색 페이지로 이동
        window.location.href = `/main/list?${queryParams.toString()}`;
    };
}

seatClassBtn.addEventListener('click', () => {
    seatClassModal.classList.add('show');
});

closeSeatClassModal.addEventListener('click', () => {
    seatClassModal.classList.remove('show');
});

seatOptions.forEach(option => {
    option.addEventListener('click', () => {
        seatClassDisplay.textContent = option.dataset.seat;
        seatClassModal.classList.remove('show');
    });
});

passengerBtn.addEventListener('click', () => {
    passengerModal.classList.add('show');
});

closePassengerModal.addEventListener('click', () => {
    passengerModal.classList.remove('show');
});

incrementBtn.addEventListener('click', () => {
    count++;
    updateDisplay();
});

decrementBtn.addEventListener('click', () => {
    if (count > 1) {
        count--;
        updateDisplay();
    }
});

const updateDisplay = () => {
    countDisplay.textContent = count;
    passengerCountDisplay.textContent = `성인 ${count}명`;
};

updateDisplay();

const renderCalendars = () => {
    renderCalendar(document.getElementById('calendar1'), currentDate);
    renderCalendar(document.getElementById('calendar2'), addMonths(currentDate, 1));
};

// JavaScript - Fully Functional renderCalendar with Selection and Reflection
const renderCalendar = (container, date) => {
const daysContainer = container?.querySelector('.calendar-days');
const weekHeader = container.querySelector('.calendar-week-header');
let monthHeader = container.querySelector('.calendar-month-header');

if (!monthHeader) {
    monthHeader = document.createElement('div');
    monthHeader.classList.add('calendar-month-header');
    container.insertBefore(monthHeader, weekHeader);
}

monthHeader.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
daysContainer.innerHTML = '';

Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }).forEach(() => {
    daysContainer.appendChild(document.createElement('div'));
});

Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, day) => day + 1).forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.textContent = day;

    const fullDate = new Date(date.getFullYear(), date.getMonth(), day);

    if (departureDate && fullDate.getTime() === departureDate.getTime()) {
        dayDiv.classList.add('calendar-start');
        dayDiv.innerHTML = `<div class="calendar-circle">${day}</div><div class="calendar-label">가는 날</div>`;
    }

    // ✅ 클릭 시 가는날 선택
    dayDiv.onclick = () => {
        departureDate = fullDate;  // 가는날만 선택 가능
        updateDateDisplay();
        renderCalendars();
    };

    daysContainer.appendChild(dayDiv);
});

const updateDateDisplay = () => {
    if (departureDate) {
        document.querySelector('.departure-date').textContent = 
            `${departureDate.getFullYear()}년 ${departureDate.getMonth() + 1}월 ${departureDate.getDate()}일`;
    } else {
        document.querySelector('.departure-date').textContent = '가는날';
    }
};

// ✅ 확인 버튼이 클릭되었을 때
if (confirmButton) {
    confirmButton.onclick = () => {
        updateDateDisplay();
        toggleModal(dateModal, false);
    };
}
};

const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
};

prevMonthBtn?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendars();
});

nextMonthBtn?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendars();
});

dateBtn?.addEventListener('click', () => {
    toggleModal(dateModal, true);
    renderCalendars();
});

closeDateModal?.addEventListener('click', () => toggleModal(dateModal, false));

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        [departureModal, arrivalModal, dateModal].forEach(modal => {
            if (modal?.classList.contains('show')) toggleModal(modal, false);
        });
    }
});

renderCalendars();


if (switchBtn && departureBtn && arrivalBtn) {
    switchBtn.addEventListener('click', () => {
        const departureText = departureBtn.querySelector('.quickbookings__airport').textContent;
        const arrivalText = arrivalBtn.querySelector('.quickbookings__airport').textContent;

        departureBtn.querySelector('.quickbookings__airport').textContent = arrivalText;
        arrivalBtn.querySelector('.quickbookings__airport').textContent = departureText;
    });
}

// ✅ 모달 열기 및 닫기
departureBtn?.addEventListener('click', () => toggleModal(departureModal, true));
closeDepartureModal?.addEventListener('click', () => toggleModal(departureModal, false));

arrivalBtn?.addEventListener('click', () => toggleModal(arrivalModal, true));
closeArrivalModal?.addEventListener('click', () => toggleModal(arrivalModal, false));

// ✅ 검색어 입력 시 연관된 공항 표시
departureSearchInput.addEventListener("input", () => {
    const query = departureSearchInput.value.trim().toLowerCase();
    departureResults.innerHTML = "";

    if (query) {
        const filteredAirports = airports.filter(airport =>
            airport.name.toLowerCase().includes(query) ||
            airport.country.toLowerCase().includes(query) ||
            airport.code.toLowerCase().includes(query)
        );

        filteredAirports.forEach(airport => {
            const item = document.createElement("div");
            item.classList.add("departure-item");
            item.innerHTML = `<strong>${airport.code}</strong> ${airport.name}, ${airport.country}`;
            item.onclick = () => selectDeparture(airport);  // ✅ 클릭 시 함수 호출
            departureResults.appendChild(item);
        });
    }
});

// ✅ 출발지 선택 함수
const selectDeparture = (airport) => {
    departureCodeDisplay.textContent = `${airport.code}`; // ✅ FROM이 CODE로 바뀜
    departureInfoDisplay.textContent = `${airport.name}, ${airport.country}`; // ✅ 공항 이름과 국가 표시
    toggleModal(departureModal, false); // ✅ 모달 닫기
};

// ✅ 검색어 입력 시 연관된 공항 표시
arrivalSearchInput.addEventListener("input", () => {
const query = arrivalSearchInput.value.trim().toLowerCase();
arrivalResults.innerHTML = "";

if (query) {
    const filteredAirports = airports.filter(airport =>
        airport.name.includes(query) || airport.country.includes(query) || airport.code.includes(query.toUpperCase())
    );

    filteredAirports.forEach(airport => {
        const item = document.createElement("div");
        item.classList.add("arrival-item");
        item.innerHTML = `<strong>${airport.code}</strong> ${airport.name}, ${airport.country}`;
        item.onclick = () => selectArrival(airport);
        arrivalResults.appendChild(item);
    });
}
});

// ✅ 도착지 선택 함수
const selectArrival = (airport) => {
arrivalDisplayCode.textContent = airport.code; // CODE 표시
arrivalDisplayAirport.textContent = `${airport.name}, ${airport.country}`; // 이름과 국가 표시
toggleModal(arrivalModal, false);
};


// ✅ 모달 토글 함수
const toggleModal = (modal, show) => modal.classList[show ? 'add' : 'remove']('show');
});
