/* 헤더 관련 코드 */
const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', () => {
    menu.classList.toggle('active');
    member.classList.toggle('active');
});

/* 탑승객 정보 입력 필드 동적 생성 */
document.addEventListener("DOMContentLoaded", function () {
    const passengerCountInput = document.getElementById("passengerCount");
    // URL 쿼리스트링에서 passenger_count 값을 읽어 hidden input에 적용
    const urlParams = new URLSearchParams(window.location.search);
    const passengerCountParam = urlParams.get('passenger_count');
    if (passengerCountParam) {
        passengerCountInput.value = passengerCountParam;
    }

    const passengerTableBody = document.getElementById("passengerTableBody");

    function updatePassengerFields(count) {
        passengerTableBody.innerHTML = ""; // 기존 입력 필드 초기화

        for (let i = 0; i < count; i++) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" name="eng_name[]" placeholder="여권 영문명을 입력하세요" required></td>
                <td>
                    <select name="gender[]">
                        <option value="남">남</option>
                        <option value="여">여</option>
                    </select>
                </td>
                <td><input type="text" name="birthdate[]" placeholder="YYYYMMDD"></td>
            `;
            passengerTableBody.appendChild(row);
        }
    }

    // 🚀 탑승객 수를 가져와 동적으로 입력칸 생성
    let passengerCount = parseInt(passengerCountInput.value) || 1;
    updatePassengerFields(passengerCount);
});