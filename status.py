import json
import os
from datetime import datetime, timedelta

# 현재 시간 (테스트용)
now = datetime.now()

# 예시 데이터 생성
data = {
    "zones": [
        {
            "zone": 1,
            "status": "충전중",
            "battery": 76,
            "charging": True,
            "timeElapsed": 53
        },
        {
            "zone": 2,
            "status": "대기중",
            "battery": 42,
            "charging": False
        },
        {
            "zone": 3,
            "status": "충전가능",
            "battery": 0,
            "charging": False,
            "lastUsedHoursAgo": 6
        },
        {
            "zone": 4,
            "status": "충전중",
            "battery": 88,
            "charging": True,
            "timeElapsed": 120
        }
    ]
}

# 웹 서버의 문서 루트 디렉토리 (예: Apache의 경우 /var/www/html)
# 실제 경로로 변경해주세요!
output_dir = ""
output_file_path = os.path.join(output_dir, "status.json")

try:
    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"'{output_file_path}' 파일이 성공적으로 생성/업데이트되었습니다.")
except Exception as e:
    print(f"파일 저장 중 오류 발생: {e}")