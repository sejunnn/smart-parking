// script.js

let zonesData = [];
let isAdminMode = false;
let adminModeClicks = 0; // ⭐ 관리자 모드 활성화를 위한 클릭 횟수 카운터
const ADMIN_CLICK_THRESHOLD = 5; // ⭐ 관리자 모드 활성화에 필요한 클릭 횟수

function updateTime() {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  document.getElementById("time-now").textContent = hour + ":" + min;
}

async function loadRealTimeData() {
  try {
    const response = await fetch('status.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    zonesData = data.zones;
    renderZones();
  } catch (error) {
    console.error("실시간 데이터를 불러오는 중 오류 발생:", error);
    const wrapper = document.querySelector(".zone-wrapper");
    wrapper.innerHTML = "<p>실시간 데이터를 불러오는데 실패했습니다.</p>";
  }
}

function renderZones() {
  const wrapper = document.querySelector(".zone-wrapper");
  wrapper.innerHTML = "";

  zonesData.forEach(z => {
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

    div.innerHTML = `
      <h5 class="zone-number">구역${z.zone}</h5>
      <h5 class="status-text">${z.status} <span class="icon">${statusIcon(getZoneStateClass(z.status, z.charging))}</span></h5>
      <p class="description-line">${desc1 || ""}</p>
      <p class="description-line">${desc2 || ""}</p>
    `;

    // 관리자 모드일 경우 상태 변경 컨트롤 추가
    if (isAdminMode) {
        const adminControls = document.createElement("div");
        adminControls.className = "admin-box-controls mt-2";
        adminControls.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-1" data-zone="${z.zone}" data-status="충전가능" data-charging="false">가능</button>
            <button class="btn btn-sm btn-outline-warning me-1" data-zone="${z.zone}" data-status="대기중" data-charging="false">대기</button>
            <button class="btn btn-sm btn-outline-danger" data-zone="${z.zone}" data-status="충전중" data-charging="true">충전</button>
        `;
        div.appendChild(adminControls);

        adminControls.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetZone = parseInt(e.target.dataset.zone);
                const newStatus = e.target.dataset.status;
                const newCharging = e.target.dataset.charging === 'true';

                const zoneToUpdate = zonesData.find(zone => zone.zone === targetZone);
                if (zoneToUpdate) {
                    zoneToUpdate.status = newStatus;
                    zoneToUpdate.charging = newCharging;
                    
                    zoneToUpdate.timeElapsed = undefined;
                    zoneToUpdate.battery = undefined;
                    zoneToUpdate.lastUsedHoursAgo = undefined;

                    renderZones();
                }
            });
        });
    }

    colDiv.appendChild(div);
    wrapper.appendChild(colDiv);
  });
}

function getZoneStateClass(status, charging) {
    if (charging) return "charging";
    if (status === "충전가능") return "available";
    if (status === "대기중") return "waiting";
    return "";
}

function statusIcon(stateClass) {
  if (stateClass === "charging") {
    return '<img src="images/cg.svg" alt="충전중" class="status-img-icon">';
  }
  if (stateClass === "available") {
    return '<img src="images/co.svg" alt="충전가능" class="status-img-icon">';
  }
  if (stateClass === "waiting") {
    return '<img src="images/waiting.svg" alt="대기중" class="status-img-icon">';
  }
  return '';
}

// 초기 호출
updateTime();
loadRealTimeData();

// 새로고침 버튼 이벤트 리스너
document.getElementById("refresh-button").addEventListener("click", function(event) {
  event.preventDefault();
  updateTime();
  loadRealTimeData();
});

// ⭐ 관리자 모드 숨겨진 활성화 로직
document.getElementById("admin-trigger").addEventListener("click", function() {
    adminModeClicks++;
    console.log("Admin clicks:", adminModeClicks); // 개발자 도구에서 클릭 횟수 확인용

    if (adminModeClicks >= ADMIN_CLICK_THRESHOLD) {
        isAdminMode = !isAdminMode; // 관리자 모드 토글
        if (isAdminMode) {
            alert("관리자 모드 활성화됨!"); // 사용자에게 알림
            loadRealTimeData(); // 관리자 모드 진입 시 최신 상태로 재로드
        } else {
            alert("관리자 모드 비활성화됨.");
        }
        renderZones(); // UI 다시 렌더링
        adminModeClicks = 0; // 클릭 횟수 초기화
    }
});

// 데이터를 주기적으로 업데이트하려면 다음 줄의 주석을 해제하세요.
// setInterval(loadRealTimeData, 30000);