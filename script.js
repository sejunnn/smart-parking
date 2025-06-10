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
      // col-6 클래스를 추가하여 2열 그리드에 맞춤
      const colDiv = document.createElement("div");
      colDiv.className = "col-6";

      const div = document.createElement("div");
      div.className = "zone-box " + getZoneStateClass(z.status, z.charging); // 상태에 따른 클래스 결정 함수 호출
      
      let desc1 = "";
      let desc2 = "";

      // 상태에 따른 desc1, desc2 설정
      if (z.charging) {
        if (z.timeElapsed !== undefined) {
          desc1 = `${z.timeElapsed}분 경과`;
          desc2 = `${z.battery}% 진행중`;
        } else {
          desc1 = `${z.battery}% 진행중`;
        }
      } else if (z.status === "대기중") {
        desc1 = "이 구역에 차량이";
        desc2 = "인식되었습니다.";
      } else if (z.status === "충전가능") {
        if (z.lastUsedHoursAgo !== undefined) {
          desc1 = `${z.lastUsedHoursAgo}시간 전 사용`;
        }
      }

      // 사진2와 유사한 레이아웃을 위해 <h5> 내부 구조 변경
      div.innerHTML = `
        <h5>구역${z.zone}</h5>
        <h5 class="status-line">${z.status} ${statusIcon(getZoneStateClass(z.status, z.charging))}</h5>
        <p>${desc1 || ""}</p>
        <p>${desc2 || ""}</p>
      `;
      colDiv.appendChild(div);
      wrapper.appendChild(colDiv);
    });
  } catch (error) {
    console.error("실시간 데이터를 불러오는 중 오류 발생:", error);
    const wrapper = document.querySelector(".zone-wrapper");
    wrapper.innerHTML = "<p>실시간 데이터를 불러오는데 실패했습니다.</p>";
  }
}

// 상태에 따라 CSS 클래스를 반환하는 함수 (중복 로직 제거)
function getZoneStateClass(status, charging) {
    if (charging) return "charging";
    if (status === "충전가능") return "available";
    if (status === "대기중") return "waiting";
    return ""; // 기본값
}

function statusIcon(stateClass) { // stateClass를 인수로 받도록 변경
  if (stateClass === "charging") return "⚡";
  if (stateClass === "available") return "🔌";
  if (stateClass === "waiting") return "⏳";
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