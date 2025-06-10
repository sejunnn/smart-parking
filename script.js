// script.js

let zonesData = []; // ⭐ zones 데이터를 전역 변수로 관리

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
    zonesData = data.zones; // ⭐ 가져온 데이터를 전역 변수에 저장

    renderZones(); // ⭐ 데이터 렌더링 함수 호출
  } catch (error) {
    console.error("실시간 데이터를 불러오는 중 오류 발생:", error);
    const wrapper = document.querySelector(".zone-wrapper");
    wrapper.innerHTML = "<p>실시간 데이터를 불러오는데 실패했습니다.</p>";
  }
}

// ⭐ zonesData를 기반으로 UI를 렌더링하는 함수 (관리자 모드 로직 포함)
let isAdminMode = false; // ⭐ 관리자 모드 상태 변수

function renderZones() {
  const wrapper = document.querySelector(".zone-wrapper");
  wrapper.innerHTML = ""; // 기존 내용 지우기

  zonesData.forEach(z => { // ⭐ 전역 변수 zonesData 사용
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

    // ⭐ 관리자 모드일 경우 상태 변경 컨트롤 추가
    if (isAdminMode) {
        const adminControls = document.createElement("div");
        adminControls.className = "admin-box-controls mt-2";
        adminControls.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-1" data-zone="${z.zone}" data-status="충전가능" data-charging="false">가능</button>
            <button class="btn btn-sm btn-outline-warning me-1" data-zone="${z.zone}" data-status="대기중" data-charging="false">대기</button>
            <button class="btn btn-sm btn-outline-danger" data-zone="${z.zone}" data-status="충전중" data-charging="true">충전</button>
        `;
        div.appendChild(adminControls);

        // 이벤트 리스너 추가
        adminControls.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetZone = parseInt(e.target.dataset.zone);
                const newStatus = e.target.dataset.status;
                const newCharging = e.target.dataset.charging === 'true'; // 문자열을 boolean으로 변환

                // 해당 구역의 데이터 업데이트
                const zoneToUpdate = zonesData.find(zone => zone.zone === targetZone);
                if (zoneToUpdate) {
                    zoneToUpdate.status = newStatus;
                    zoneToUpdate.charging = newCharging;
                    
                    // 추가 데이터 초기화 (상태 변경 시 이전 충전 시간 등은 무의미해질 수 있음)
                    zoneToUpdate.timeElapsed = undefined;
                    zoneToUpdate.battery = undefined;
                    zoneToUpdate.lastUsedHoursAgo = undefined;

                    // 업데이트된 데이터로 UI 다시 렌더링
                    renderZones();
                }
            });
        });
    }

    colDiv.appendChild(div);
    wrapper.appendChild(colDiv);
  });
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
    return '<img src="images/waiting.svg" alt="대기중" class="status-img-icon">'; // images/waiting.svg가 있다고 가정
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
  loadRealTimeData(); // ⭐ 새로고침 시 status.json 원본 데이터 다시 로드
});

// ⭐ 관리자 모드 토글 버튼 이벤트 리스너
document.getElementById("admin-mode-toggle").addEventListener("click", function() {
    isAdminMode = !isAdminMode; // 상태 토글
    this.textContent = isAdminMode ? "관리자 모드 끄기" : "관리자 모드 켜기";
    
    // 관리자 모드 변경 시 UI 다시 렌더링
    renderZones(); 

    // 관리자 모드 켤 때 status.json 원본 데이터를 다시 로드하는 것이 좋을 수 있음
    if (isAdminMode) {
        loadRealTimeData(); 
    }
});

// 데이터를 주기적으로 업데이트하려면 다음 줄의 주석을 해제하세요.
// setInterval(loadRealTimeData, 30000);