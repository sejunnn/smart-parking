function updateTime() {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  document.getElementById("time-now").textContent = hour + ":" + min;
}

// status.json에서 데이터를 가져와 표시하는 함수
async function loadRealTimeData() {
  try {
    const response = await fetch('status.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const zones = data.zones;

    const wrapper = document.querySelector(".zone-wrapper");
    wrapper.innerHTML = ""; // 기존 목업 데이터 지우기

    zones.forEach(z => {
      const div = document.createElement("div");
      let stateClass = "";
      let desc1 = ""; // 첫 번째 설명줄
      let desc2 = ""; // 두 번째 설명줄

      // status.json의 데이터를 기반으로 상태 및 설명 설정
      if (z.charging) {
        stateClass = "charging";
        if (z.timeElapsed !== undefined) { // 충전 경과 시간 필드가 있다면
          desc1 = `${z.timeElapsed}분 경과`;
          desc2 = `${z.battery}% 진행중`;
        } else { // 필드가 없다면 기본값
          desc1 = `${z.battery}% 진행중`;
        }
      } else if (z.status === "대기중") {
        stateClass = "waiting";
        desc1 = "이 구역에 차량이";
        desc2 = "인식되었습니다.";
      } else if (z.status === "충전가능") {
        stateClass = "available";
        if (z.lastUsedHoursAgo !== undefined) { // 마지막 사용 시간 필드가 있다면
          desc1 = `${z.lastUsedHoursAgo}시간 전 사용`;
        } else { // 필드가 없다면 기본값
          // desc1 = "사용 기록 없음"; // 필요시 기본 메시지
        }
      }

      div.className = `zone-box ${stateClass}`;
      div.innerHTML = `
        <h5>구역${z.zone} ${statusIcon(stateClass)} ${z.status}</h5>
        <p>${desc1 || ""}</p> <p>${desc2 || ""}</p> `;
      wrapper.appendChild(div);
    });
  } catch (error) {
    console.error("실시간 데이터를 불러오는 중 오류 발생:", error);
    const wrapper = document.querySelector(".zone-wrapper");
    wrapper.innerHTML = "<p>실시간 데이터를 불러오는데 실패했습니다.</p>";
  }
}

function statusIcon(state) {
  if (state === "charging") return "⚡";
  if (state === "available") return "🔌";
  if (state === "waiting") return "⏳";
  return "";
}

// 초기 호출
updateTime();
loadRealTimeData();

// 새로고침 버튼 이벤트 리스너 추가
document.getElementById("refresh-button").addEventListener("click", function(event) {
  event.preventDefault(); // 기본 링크 동작 방지
  updateTime(); // 시간 업데이트
  loadRealTimeData(); // 데이터 새로고침
});

// 데이터를 주기적으로 업데이트하려면 다음 줄의 주석을 해제하세요.
// setInterval(loadRealTimeData, 30000); // 예: 30초마다 업데이트