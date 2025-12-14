// script.js

// 1. 초기 데이터
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

// 로컬 스토리지 데이터 로드
let zonesData = JSON.parse(localStorage.getItem('parkingData')) || initialZones;
let isAdminMode = false;
let adminModeClicks = 0;
const ADMIN_CLICK_THRESHOLD = 5;

// 실시간 동기화 채널
const updateChannel = new BroadcastChannel('parking_updates');

updateChannel.onmessage = (event) => {
  if (event.data.type === 'UPDATE_ZONES') {
    zonesData = event.data.payload;
    renderZones();
  }
};

function updateTime() {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const timeEl = document.getElementById("time-now");
  if(timeEl) timeEl.textContent = hour + ":" + min;
}

function loadRealTimeData() {
  renderZones();
}

function renderZones() {
  const wrapper = document.querySelector(".zone-wrapper");
  if(!wrapper) return;
  wrapper.innerHTML = "";

  zonesData.forEach(z => {
    const colDiv = document.createElement("div");
    colDiv.className = "col-6"; // 레이아웃 유지

    const div = document.createElement("div");
    div.className = "zone-box " + getZoneStateClass(z.status, z.charging);
    
    // UI 표시용 텍스트 생성
    let desc1 = "";
    let desc2 = "";

    if (z.charging) {
        // 충전중일 때: 시간과 배터리 표시
        desc1 = `${z.timeElapsed !== undefined ? z.timeElapsed : 0}분 경과`;
        desc2 = `${z.battery !== undefined ? z.battery : 0}% 진행중`;
    } else if (z.status === "대기중") {
        desc1 = "이 구역에 차량이";
        desc2 = "인식되었습니다.";
    } else if (z.status === "충전가능") {
        // 충전가능일 때: 몇 시간 전 사용 표시
        desc1 = `${z.lastUsedHoursAgo !== undefined ? z.lastUsedHoursAgo : 0}시간 전 사용`;
    }

    div.innerHTML = `
      <h5 class="zone-number">구역${z.zone}</h5>
      <h5 class="status-text">${z.status} <span class="icon">${statusIcon(getZoneStateClass(z.status, z.charging))}</span></h5>
      <p class="description-line">${desc1 || ""}</p>
      <p class="description-line">${desc2 || ""}</p>
    `;

    // ⭐ [관리자 모드] 디테일 수정 패널
    if (isAdminMode) {
        const adminPanel = document.createElement("div");
        adminPanel.className = "mt-3 pt-2 border-top border-secondary";
        adminPanel.style.fontSize = "12px";

        // 입력 필드 현재값 세팅 (없으면 0)
        const currentBat = z.battery || 50;
        const currentTime = z.timeElapsed || 0;
        const currentAgo = z.lastUsedHoursAgo || 2;

        adminPanel.innerHTML = `
            <div class="d-flex gap-1 mb-2 align-items-center">
                <input type="number" class="form-control form-control-sm px-1 inp-bat" placeholder="%" value="${currentBat}" style="width:40px">
                <span class="text-white">%</span>
                <input type="number" class="form-control form-control-sm px-1 inp-time" placeholder="분" value="${currentTime}" style="width:40px">
                <span class="text-white">분</span>
                <button class="btn btn-sm btn-danger py-0 btn-set-charging" style="font-size:12px; height: 31px;">충전</button>
            </div>

            <div class="d-flex gap-1 mb-2 align-items-center">
                <input type="number" class="form-control form-control-sm px-1 inp-ago" placeholder="시간" value="${currentAgo}" style="width:40px">
                <span class="text-white">전</span>
                <button class="btn btn-sm btn-primary py-0 btn-set-available flex-grow-1" style="font-size:12px; height: 31px;">가능 적용</button>
            </div>

            <button class="btn btn-sm btn-warning w-100 py-1 btn-set-waiting" style="font-size:12px;">대기중 (차량인식)</button>
        `;

        // 버튼 이벤트 리스너 연결
        const inpBat = adminPanel.querySelector('.inp-bat');
        const inpTime = adminPanel.querySelector('.inp-time');
        const inpAgo = adminPanel.querySelector('.inp-ago');

        // [충전 버튼] 클릭 시
        adminPanel.querySelector('.btn-set-charging').addEventListener('click', () => {
            updateZoneData(z.zone, {
                status: "충전중",
                charging: true,
                battery: parseInt(inpBat.value),
                timeElapsed: parseInt(inpTime.value),
                lastUsedHoursAgo: 0
            });
        });

        // [가능 버튼] 클릭 시
        adminPanel.querySelector('.btn-set-available').addEventListener('click', () => {
            updateZoneData(z.zone, {
                status: "충전가능",
                charging: false,
                lastUsedHoursAgo: parseInt(inpAgo.value),
                battery: 0,
                timeElapsed: 0
            });
        });

        // [대기 버튼] 클릭 시
        adminPanel.querySelector('.btn-set-waiting').addEventListener('click', () => {
            updateZoneData(z.zone, {
                status: "대기중",
                charging: false,
                lastUsedHoursAgo: 0,
                battery: 0,
                timeElapsed: 0
            });
        });

        div.appendChild(adminPanel);
    }

    colDiv.appendChild(div);
    wrapper.appendChild(colDiv);
  });
}

// 데이터 업데이트 및 전파 헬퍼 함수
function updateZoneData(zoneId, newData) {
    const target = zonesData.find(z => z.zone === zoneId);
    if (target) {
        Object.assign(target, newData);
        saveAndBroadcast();
    }
}

function saveAndBroadcast() {
    localStorage.setItem('parkingData', JSON.stringify(zonesData));
    renderZones(); 
    updateChannel.postMessage({ type: 'UPDATE_ZONES', payload: zonesData });
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
  //if (stateClass === "waiting") return '<img src="images/waiting.svg" alt="대기중" class="status-img-icon">';
  return '';
}

updateTime();
loadRealTimeData();
setInterval(updateTime, 1000);

const refreshBtn = document.getElementById("refresh-button");
if(refreshBtn){
    refreshBtn.addEventListener("click", function(event) {
        event.preventDefault();
        loadRealTimeData();
    });
}

// 관리자 모드 진입 로직
const adminTrigger = document.getElementById("admin-trigger");
if(adminTrigger){
    adminTrigger.addEventListener("click", function() {
        adminModeClicks++;
        if (adminModeClicks >= ADMIN_CLICK_THRESHOLD) {
            isAdminMode = !isAdminMode;
            if (isAdminMode) {
                alert("🛠️ 관리자 모드 ON: 상세 수치를 입력하고 버튼을 누르세요.");
            } else {
                alert("관리자 모드 OFF");
            }
            renderZones();
            adminModeClicks = 0;
        }
    });
}