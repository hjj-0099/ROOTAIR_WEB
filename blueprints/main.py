from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from datetime import datetime 
from blueprints.utils import get_db_connection
import uuid

# '/main'하에 모든 라우트가 위치
main_bp = Blueprint('main', __name__, url_prefix='/main')

# 메인 페이지 라우트
@main_bp.route('/')
def main():
    # 템플릿 경로를 수정하여 templates 폴더 내의 "main.html"을 사용
    return render_template('main/main.html')

# 항공권 조회 페이지 라우트
@main_bp.route('/list', methods=['GET'])
def search_results():
    # URL 쿼리승트링에서 검색 조건을 가져옴
    departure_airport = request.args.get('departure_airport')
    arrival_airport = request.args.get('arrival_airport')
    departure_date_raw = request.args.get('departure_date')
    seat_class = request.args.get('seat_class', '이코노미')
    passenger_count = request.args.get('passenger_count', 1, type=int)

    # 필수 항목 누락 검사
    if not departure_airport or not arrival_airport or not departure_date_raw:
        return "필수 선택값이 누락되었습니다.", 400

    try:
        # 입력받은 날짜 문자열을 날짜 객체로 변환 (YYYY-MM-DD 형식)
        departure_date = datetime.strptime(departure_date_raw, "%Y-%m-%d").date()
    except ValueError:
        return "잘못된 날짜 형식입니다.", 400

    # 데이터베이스 연결 및 커서 생성
    conn = get_db_connection()
    cursor = conn.cursor()


    # Flights 테이블에서 조건에 맞는 항공편을 조회하는 SQL 쿼리
    query = """
        SELECT flight_id, departure_airport, arrival_airport, DATE(departure_time) as departure_time,
               seat_class, price, passenger_count
        FROM Flights
        WHERE departure_airport = %s
          AND arrival_airport = %s
          AND DATE(departure_time) = %s
          AND seat_class = %s
          AND passenger_count >= %s
    """
    cursor.execute(query, (departure_airport, arrival_airport, departure_date, seat_class, passenger_count))
    flights = cursor.fetchall()

    # 사용 후 커서와 연결 종료
    cursor.close()
    conn.close()

    return render_template('main/main_list.html', results=flights)
    

# 항공편 상세정보 및 예약 폼 페이지 라우트
@main_bp.route('/list/detail/<int:flight_id>', methods=['GET'])
def flight_detail(flight_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # 선택한 flight_id에 해당하는 항공편 정보를 조회
    cursor.execute("SELECT * FROM Flights WHERE flight_id = %s", (flight_id,))
    flight = cursor.fetchone()

    if not flight:
        return "해당 항공편이 존재하지 않습니다.", 404

    # URL 쿼리 파라미터에서 탑승객 수 가져옴
    passenger_count = request.args.get('passengers', 1, type=int)

    return render_template('main/main_list_detail.html', flight=flight, passenger_count=passenger_count)

# 예약(구매) 처리 라우트
@main_bp.route('/book', methods=['POST'])
def book_flight():
    # POST 데이터에서 flight_id와 탑승객들의 영문 이름 리스트를 가져옴
    flight_id = request.form.get('flight_id', type=int)
    eng_names = request.form.getlist('eng_name[]')

    if not flight_id or not eng_names:
        return "필수 예약 정보가 누락되었습니다.", 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # 예약 대상 항공편 정보를 조회
    cursor.execute("SELECT * FROM Flights WHERE flight_id = %s", (flight_id,))
    flight = cursor.fetchone()
    if not flight:
        return "해당 항공편이 존재하지 않습니다.", 404

    # 예약 가능한 좌석 수 확인
    available_seats = flight["passenger_count"]
    if available_seats < len(eng_names):
        return "예약 가능한 좌석이 부족합니다.", 400

    # ★ 단일 예약 ID를 미리 생성 (모든 탑승객 예약에 동일하게 사용)
    booking_id = str(uuid.uuid4())[:20]

    # 각 탑승객에 대해 예약 정보를 Bookings 테이블에 삽입 (모두 동일한 booking_id 사용)
    for eng_name in eng_names:
        cursor.execute("""
            INSERT INTO Bookings (booking_id, username, eng_name, airplan_name, payment_status,
                                  departure_airport, arrival_airport, departure_time, arrival_time, price)
            VALUES (%s, %s, %s, %s, 'Unpaid', %s, %s, %s, %s, %s)
        """, (
            booking_id,
            "default_user",  # 실제로는 로그인한 사용자의 user_id나 username을 사용해야 함
            eng_name,
            flight["airplane_name"],
            flight["departure_airport"],
            flight["arrival_airport"],
            flight["departure_time"],
            flight["arrival_time"],
            flight["price"]
        ))

    # 예약 후 해당 항공편의 남은 좌석 수 업데이트
    cursor.execute("""
        UPDATE Flights SET passenger_count = passenger_count - %s WHERE flight_id = %s
    """, (len(eng_names), flight_id))
    conn.commit()

    # ★ 사용자 정보 조회 (여기서는 'default_user'를 사용; 실제 환경에서는 세션 등에서 가져옴)
    cursor.execute("SELECT mileage FROM users WHERE user_id = %s", ("default_user",))
    user_data = cursor.fetchone()
    if user_data:
        total_mileage = user_data["mileage"]
    else:
        total_mileage = 0

    # 총 결제 금액 계산 (각 탑승객 운임 × 탑승객 수)
    total_price = flight["price"] * len(eng_names)
    # 적립 마일리지는 총 결제 금액의 10% (정수로 변환)
    earned_mileage = int(total_price * 0.1)

    cursor.close()
    conn.close()

    # payment.html 템플릿에 예약 ID, total_mileage, earned_mileage, 총 결제 금액 등을 전달
    return render_template(
        'pay/payment.html',
        booking_id=booking_id,
        total_mileage=total_mileage,
        earned_mileage=earned_mileage,
        total_price=total_price
    )

