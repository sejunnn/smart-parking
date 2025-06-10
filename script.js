// script.js

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
    wrapper.innerHTML = ""; // 기존 내용 지우기

    zones.forEach(z => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-6"; // 각 구역 박스를 col-6으로 감쌈

      const div = document.createElement("div");
      div.className = "zone-box " + getZoneStateClass(z.status, z.charging);
      
      let desc1 = "";
      let desc2 = "";

      if (z.charging) {
        // 충전중 상태
        if (z.timeElapsed !== undefined) {
          desc1 = `${z.timeElapsed}분 경과`;
          desc2 = `${z.battery}% 진행중`;
        } else {
          // timeElapsed가 없는 경우 battery만 표시
          desc1 = `${z.battery}% 진행중`;
        }
      } else if (z.status === "대기중") {
        // 대기중 상태
        desc1 = "이 구역에 차량이";
        desc2 = "인식되었습니다.";
      } else if (z.status === "충전가능") {
        // 충전가능 상태
        if (z.lastUsedHoursAgo !== undefined) {
          desc1 = `${z.lastUsedHoursAgo}시간 전 사용`;
        }
      }

      div.innerHTML = `
        <h5 class="zone-number">구역${z.zone}</h5>
        <h5 class="status-text">${z.status} <span class="icon">${statusIcon(getZoneStateClass(z.status, z.charging))}</span></h5>
        <p class="description-line">${desc1 || ""}</p>
        <p class="description-line">${desc2 || ""}</p>
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

// 상태에 따라 CSS 클래스를 반환하는 함수
function getZoneStateClass(status, charging) {
    if (charging) return "charging";
    if (status === "충전가능") return "available";
    if (status === "대기중") return "waiting";
    return "";
}

// SVG 이미지 태그를 반환하도록 수정
function statusIcon(stateClass) {
  if (stateClass === "charging") {
    return '<img src="images/cg.svg" alt="충전중" class="status-img-icon">';
  }
  if (stateClass === "available") {
    return '<img src="images/co.svg" alt="충전가능" class="status-img-icon">';
  }
  if (stateClass === "waiting") {
    // 대기중 아이콘이 필요하면 images/waiting.svg 등을 추가하고 경로를 지정
    return ''; // 현재는 대기중 아이콘 없음
  }
  return '';
}

// 초기 호출
updateTime();
loadRealTimeData();

// 새로고침 버튼 이벤트 리스너 추가
document.getElementById("refresh-button").addEventListener("click", function(event) {
  event.preventDefault(); // 기본 새로고침 동작 방지
  updateTime();
  loadRealTimeData();
});

// 데이터를 주기적으로 업데이트하려면 다음 줄의 주석을 해제하세요.
// setInterval(loadRealTimeData, 30000);