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
    wrapper.innerHTML = ""; // 기존 목업 데이터 지우기

    zones.forEach(z => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-6";

      const div = document.createElement("div");
      div.className = "zone-box " + getZoneStateClass(z.status, z.charging);
      
      let desc1 = "";
      let desc2 = "";

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

      // Figma 코드의 레이아웃과 유사하도록 HTML 구조 변경
      // 아이콘을 위한 <span> 태그 안에 <img>를 넣도록 변경
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

// 이모지 대신 이미지 태그를 반환하도록 수정
function statusIcon(stateClass) {
  if (stateClass === "charging") {
    return '<img src="images/cg.png" alt="충전중" class="status-img-icon">';
  }
  if (stateClass === "available") {
    return '<img src="images/co.png" alt="충전가능" class="status-img-icon">';
  }
  if (stateClass === "waiting") {
    // 대기중 상태에 대한 아이콘 파일이 없다면, 빈 문자열 또는 다른 기본 아이콘을 반환
    return ''; // 또는 '<img src="images/waiting.png" alt="대기중" class="status-img-icon">';
  }
  return '';
}

// 초기 호출
updateTime();
loadRealTimeData();

// 새로고침 버튼 이벤트 리스너 추가
document.getElementById("refresh-button").addEventListener("click", function(event) {
  event.preventDefault();
  updateTime();
  loadRealTimeData();
});

// 데이터를 주기적으로 업데이트하려면 다음 줄의 주석을 해제하세요.
// setInterval(loadRealTimeData, 30000);