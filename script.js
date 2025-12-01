// script.js

// 1. 초기 데이터 (2개 구역으로 축소)
const initialZones = [
  {
    "zone": 1,
    "status": "충전중",
    "battery": 62,
    "charging": true,
    "lastUsedHoursAgo": 0,
    "timeElapsed": 30
  },
  {
    "zone": 2,
    "status": "충전가능",
    "battery": 0,
    "charging": false,
    "lastUsedHoursAgo": 6
  }
];

// 로컬 스토리지에서 데이터 불러오기 (없으면 초기값 사용)
let zonesData = JSON.parse(localStorage.getItem('parkingData')) || initialZones;
let isAdminMode = false;
let adminModeClicks = 0;
const ADMIN_CLICK_THRESHOLD = 5;

// ⭐ 브라우저 탭 간 실시간 통신 채널 생성
const updateChannel = new BroadcastChannel('parking_updates');

// 다른 탭에서 신호가 오면 즉시 화면 업데이트
updateChannel.onmessage = (event) => {
  if (event.data.type === 'UPDATE_ZONES') {
    zonesData = event.data.payload;
    renderZones(); // 화면 즉시 갱신
  }
};

function updateTime() {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const timeEl = document.getElementById("time-now");
  if(timeEl) timeEl.textContent = hour + ":" + min;
}

// 초기 로딩 (status.json 대신 로컬 메모리 우선 사용)
function loadRealTimeData() {
  // 영상 촬영용이므로 서버 fetch보다 로컬 데이터 우선 렌더링
  renderZones();
}

function renderZones() {
  const wrapper = document.querySelector(".zone-wrapper");
  if(!wrapper) return;
  wrapper.innerHTML = "";

  zonesData.forEach(z => {
    // ⭐ 레이아웃: 2개 구역을 한 화면에 꽉 차게 보려면 col-12, 나란히 보려면 col-6 유지
    // 모바일 뷰 기준 col-6(가로 배치)가 영상에 예쁘게 나옵니다.
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

    // 관리자 모드 버튼 렌더링
    if (isAdminMode) {
        const adminControls = document.createElement("div");
        adminControls.className = "admin-box-controls mt-2";
        adminControls.style.display = "flex";
        adminControls.style.gap = "4px";
        adminControls.style.flexWrap = "wrap";
        
        // 버튼 스타일 소폭 조정 (터치하기 편하게)
        adminControls.innerHTML = `
            <button class="btn btn-sm btn-light border-primary text-primary" style="flex:1" data-zone="${z.zone}" data-status="충전가능" data-charging="false">가능</button>
            <button class="btn btn-sm btn-light border-warning text-warning" style="flex:1" data-zone="${z.zone}" data-status="대기중" data-charging="false">대기</button>
            <button class="btn btn-sm btn-light border-danger text-danger" style="flex:1" data-zone="${z.zone}" data-status="충전중" data-charging="true">충전</button>
        `;
        div.appendChild(adminControls);

        adminControls.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetZone = parseInt(e.target.dataset.zone);
                const newStatus = e.target.dataset.status;
                const newCharging = e.target.dataset.charging === 'true';

                // 데이터 업데이트
                const zoneToUpdate = zonesData.find(zone => zone.zone === targetZone);
                if (zoneToUpdate) {
                    zoneToUpdate.status = newStatus;
                    zoneToUpdate.charging = newCharging;
                    
                    // 상태 변경 시 부가 정보 초기화 또는 설정 (시연용 더미 데이터)
                    if(newCharging) {
                        zoneToUpdate.battery = 15; // 충전 시작 시 15%로 설정
                        zoneToUpdate.timeElapsed = 5;
                    } else {
                        zoneToUpdate.timeElapsed = undefined;
                        zoneToUpdate.battery = undefined;
                        zoneToUpdate.lastUsedHoursAgo = 0;
                    }

                    // ⭐ 중요: 변경된 데이터를 로컬 스토리지에 저장하고 방송(Broadcast)
                    saveAndBroadcast(); 
                }
            });
        });
    }

    colDiv.appendChild(div);
    wrapper.appendChild(colDiv);
  });
}

// 데이터를 저장하고 모든 탭에 알리는 함수
function saveAndBroadcast() {
    localStorage.setItem('parkingData', JSON.stringify(zonesData)); // 저장
    renderZones(); // 내 화면 갱신
    updateChannel.postMessage({ type: 'UPDATE_ZONES', payload: zonesData }); // 다른 탭 갱신
}

function getZoneStateClass(status, charging) {
    if (charging) return "charging";
    if (status === "충전가능") return "available";
    if (status === "대기중") return "waiting";
    return "";
}

function statusIcon(stateClass) {
  if (stateClass === "charging") return '<img src="images/cg.svg" alt="충전중" class="status-img-icon">';
  if (stateClass === "available") return '<img src="images/co.svg" alt="충전가능" class="status-img-icon">';
  if (stateClass === "waiting") return '<img src="images/waiting.svg" alt="대기중" class="status-img-icon">';
  return '';
}

updateTime();
loadRealTimeData();
setInterval(updateTime, 1000); // 시간은 1초마다 갱신

// 새로고침 버튼 (데이터 리셋 기능 포함)
const refreshBtn = document.getElementById("refresh-button");
if(refreshBtn){
    refreshBtn.addEventListener("click", function(event) {
        event.preventDefault();
        // 시연 중 데이터 꼬이면 로컬 스토리지 초기화용 (더블 클릭 시 초기화 등으로 응용 가능)
        updateTime();
        loadRealTimeData();
    });
}

// 관리자 모드 활성화 로직
const adminTrigger = document.getElementById("admin-trigger");
if(adminTrigger){
    adminTrigger.addEventListener("click", function() {
        adminModeClicks++;
        console.log("Admin clicks:", adminModeClicks);

        if (adminModeClicks >= ADMIN_CLICK_THRESHOLD) {
            isAdminMode = !isAdminMode;
            if (isAdminMode) {
                alert("🔴 관리자 모드 ON: 버튼을 누르면 다른 탭도 즉시 변경됩니다.");
            } else {
                alert("⚪ 관리자 모드 OFF");
            }
            renderZones();
            adminModeClicks = 0;
        }
    });
}