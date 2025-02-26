// 현재 선택된 항공편 번호
let currentFlight = 1;

// 항공편 제목 변경하는 함수
function updateFlightTitle() {
    document.getElementById("flightTitle").textContent = `FLIGHT_0${currentFlight}`;
}

// 항공권 목록을 추가할 컨테이너
const flightList = document.querySelector(".flight-list");

// 기존 flights 변수를 서버에서 전달받은 데이터로 대체
function renderFlights() {
    flightList.innerHTML = ""; // 기존 목록 초기화

    flights.forEach((flight, index) => {
        const flightItem = document.createElement("div");
        flightItem.classList.add("flight-item");

        flightItem.innerHTML = `
            <div class="flight-info">
                <div>
                    <p>${flight.departure_time}</p>
                    <p class="flight-time">${flight.departure_airport} ✈ ${flight.arrival_airport}</p>
                </div>
                <div>
                    <p>${flight.seat_class}</p>
                    <p class="flight-price">${flight.price}원</p>
                </div>
            </div>
            <input type="checkbox" class="flight-checkbox" data-flight-id="${flight.flight_id}">
        `;

        flightList.appendChild(flightItem);
    });
}


// 화살표 버튼 클릭 이벤트
document.querySelector(".arrow-btn.right").addEventListener("click", () => {
    if (currentFlight < 5) {
        currentFlight++;
    } else {
        currentFlight = 1; // 다시 FLIGHT_01로 되돌아감
    }
    updateFlightTitle();
    renderFlights();
});

document.querySelector(".arrow-btn.left").addEventListener("click", () => {
    if (currentFlight > 1) {
        currentFlight--;
    } else {
        currentFlight = 5; // 마지막 FLIGHT로 되돌아감
    }
    updateFlightTitle();
    renderFlights();
});

// 페이지 로드 시 항공권 목록 표시
document.addEventListener("DOMContentLoaded", () => {
    updateFlightTitle();
    renderFlights();
});

document.querySelector(".submit-btn").addEventListener("click", function () {
    const selectedCheckbox = document.querySelector(".flight-checkbox:checked");
    if (selectedCheckbox) {
        const flightId = selectedCheckbox.getAttribute("data-flight-id");
        // 현재 페이지의 URL 쿼리스트링에서 passenger_count 값을 가져옴 (없으면 기본값 1)
        const urlParams = new URLSearchParams(window.location.search);
        const passengerCount = urlParams.get('passenger_count') || 1;
        window.location.href = `/main/list/detail/${flightId}?passenger_count=${passengerCount}`;
    } else {
        alert("항공편을 선택해 주세요.");
    }
});