// 스마트주차장 충전소 데이터
const chargingStations = [
    {
        id: 1,
        name: "A구역 충전소",
        status: "charging",
        batteryLevel: 65,
        chargingTime: "1시간 25분",
        icon: "fas fa-bolt"
    },
    {
        id: 2,
        name: "B구역 충전소",
        status: "available",
        batteryLevel: 0,
        chargingTime: "대기 중",
        icon: "fas fa-plug"
    },
    {
        id: 3,
        name: "C구역 충전소",
        status: "charging",
        batteryLevel: 89,
        chargingTime: "30분",
        icon: "fas fa-bolt"
    },
    {
        id: 4,
        name: "D구역 충전소",
        status: "offline",
        batteryLevel: 0,
        chargingTime: "점검 중",
        icon: "fas fa-tools"
    }
];

// 상태별 한글 라벨
const statusLabels = {
    available: "이용 가능",
    charging: "충전 중",
    offline: "점검 중"
};

// 상태별 색상
const statusColors = {
    available: "#28a745",
    charging: "#ffc107",
    offline: "#dc3545"
};

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();

    // 실시간 업데이트 시뮬레이션 (30초마다)
    setInterval(updateChargingProgress, 30000);
});

// 앱 초기화
function initializeApp() {
    renderStations();
    updateSummary();

    // 부드러운 페이드인 효과
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
    }, 100);
}

// 충전소 카드 렌더링
function renderStations() {
    const container = document.getElementById('charging-stations-container');
    container.innerHTML = '';

    chargingStations.forEach(station => {
        const stationCard = createStationCard(station);
        container.appendChild(stationCard);
    });
}

// 충전소 카드 생성
function createStationCard(station) {
    const col = document.createElement('div');
    col.className = 'col-lg-6 col-md-6 col-12 mb-4';

    const card = document.createElement('div');
    card.className = `station-card ${station.status}`;
    card.setAttribute('data-station-id', station.id);

    // 배터리 아이콘 선택
    let batteryIcon = 'fas fa-battery-empty';
    if (station.batteryLevel > 75) batteryIcon = 'fas fa-battery-full';
    else if (station.batteryLevel > 50) batteryIcon = 'fas fa-battery-three-quarters';
    else if (station.batteryLevel > 25) batteryIcon = 'fas fa-battery-half';
    else if (station.batteryLevel > 0) batteryIcon = 'fas fa-battery-quarter';

    card.innerHTML = `
        <div class="station-header">
            <h3 class="station-name">
                <i class="${station.icon} me-2"></i>
                ${station.name}
            </h3>
            <span class="status-badge ${station.status}">
                ${statusLabels[station.status]}
            </span>
        </div>
        <div class="station-info">
            <div class="battery-info">
                <i class="${batteryIcon} battery-icon"></i>
                <span class="battery-level">${station.batteryLevel}%</span>
            </div>
            <div class="time-info">
                <i class="fas fa-clock me-1"></i>
                ${station.chargingTime}
            </div>
        </div>
        ${station.status === 'charging' ? `
        <div class="progress mt-3" style="height: 8px;">
            <div class="progress-bar progress-bar-animated" 
                 role="progressbar" 
                 style="width: ${station.batteryLevel}%; background-color: #ffc107;"
                 aria-valuenow="${station.batteryLevel}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
            </div>
        </div>
        ` : ''}
    `;

    // 카드 클릭 이벤트
    card.addEventListener('click', () => {
        showStationDetails(station);
    });

    // 호버 효과 강화
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });

    col.appendChild(card);
    return col;
}

// 요약 정보 업데이트
function updateSummary() {
    const totalStations = chargingStations.length;
    const availableStations = chargingStations.filter(s => s.status === 'available').length;
    const chargingStationsCount = chargingStations.filter(s => s.status === 'charging').length;
    const offlineStations = chargingStations.filter(s => s.status === 'offline').length;

    // 카운터 애니메이션과 함께 업데이트
    animateCounter('total-stations', totalStations);
    animateCounter('available-stations', availableStations);
    animateCounter('charging-stations', chargingStationsCount);
    animateCounter('offline-stations', offlineStations);
}

// 카운터 애니메이션
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000; // 1초
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// 충전 진행률 업데이트 시뮬레이션
function updateChargingProgress() {
    let updated = false;

    chargingStations.forEach(station => {
        if (station.status === 'charging') {
            // 충전 중인 경우 배터리 레벨 증가
            const increment = Math.floor(Math.random() * 5) + 1; // 1-5% 증가
            station.batteryLevel = Math.min(station.batteryLevel + increment, 100);

            // 충전 시간 업데이트
            const minutes = Math.max(0, parseInt(station.chargingTime) - 30);
            station.chargingTime = minutes > 0 ? `${minutes}분` : "완료 예정";

            // 100% 충전 시 상태 변경
            if (station.batteryLevel >= 100) {
                station.status = 'available';
                station.chargingTime = '대기 중';
                showNotification(`${station.name} 충전이 완료되었습니다!`, 'success');
            }

            updated = true;
        }
    });

    if (updated) {
        renderStations();
        updateSummary();
    }
}

// 충전소 상세 정보 모달
function showStationDetails(station) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'stationModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border-radius: 20px; border: none;">
                <div class="modal-header" style="background: linear-gradient(135deg, #2aafbb, #4ab7c1); color: white; border-radius: 20px 20px 0 0;">
                    <h5 class="modal-title">
                        <i class="${station.icon} me-2"></i>
                        ${station.name}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row">
                        <div class="col-6">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-info-circle me-2" style="color: #2aafbb; font-size: 1.2rem;"></i>
                                <span><strong>상태:</strong> ${statusLabels[station.status]}</span>
                            </div>
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-battery-half me-2" style="color: #2aafbb; font-size: 1.2rem;"></i>
                                <span><strong>배터리:</strong> ${station.batteryLevel}%</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-clock me-2" style="color: #2aafbb; font-size: 1.2rem;"></i>
                                <span><strong>시간:</strong> ${station.chargingTime}</span>
                            </div>
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-map-marker-alt me-2" style="color: #2aafbb; font-size: 1.2rem;"></i>
                                <span><strong>위치:</strong> ${station.name}</span>
                            </div>
                        </div>
                    </div>
                    ${station.status === 'charging' ? `
                    <div class="mt-4">
                        <label class="form-label"><strong>충전 진행률</strong></label>
                        <div class="progress" style="height: 15px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" 
                                 style="width: ${station.batteryLevel}%; background-color: #ffc107;"
                                 aria-valuenow="${station.batteryLevel}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${station.batteryLevel}%
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    ${station.status === 'available' ? `
                    <button type="button" class="btn" style="background-color: #2aafbb; color: white;" onclick="startCharging(${station.id})">
                        <i class="fas fa-bolt me-1"></i>충전 시작
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // 모달 닫힌 후 제거
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 충전 시작 함수
function startCharging(stationId) {
    const station = chargingStations.find(s => s.id === stationId);
    if (station && station.status === 'available') {
        station.status = 'charging';
        station.batteryLevel = 5; // 충전 시작
        station.chargingTime = '2시간 30분';

        renderStations();
        updateSummary();

        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(document.getElementById('stationModal'));
        modal.hide();

        showNotification(`${station.name}에서 충전을 시작합니다!`, 'info');
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const colors = {
        success: '#28a745',
        info: '#2aafbb',
        warning: '#ffc107',
        error: '#dc3545'
    };

    const toast = document.createElement('div');
    toast.className = 'toast show position-fixed';
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: white;
        border-left: 4px solid ${colors[type]};
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        min-width: 300px;
    `;

    toast.innerHTML = `
        <div class="toast-header" style="background: ${colors[type]}; color: white;">
            <i class="fas fa-info-circle me-2"></i>
            <strong class="me-auto">스마트주차장</strong>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    document.body.appendChild(toast);

    // 5초 후 자동 제거
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// 페이지 가시성 변경 시 업데이트 일시정지/재개
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 페이지가 보이지 않을 때 업데이트 일시정지
        console.log('업데이트 일시정지');
    } else {
        // 페이지가 다시 보일 때 즉시 업데이트
        console.log('업데이트 재개');
        renderStations();
        updateSummary();
    }
});

// 터치 디바이스 지원
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {
        // 터치 이벤트 최적화
    });
}

// 키보드 접근성 지원
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('station-card')) {
            focusedElement.click();
        }
    }
});

// PWA 지원을 위한 서비스 워커 등록 (선택사항)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// 초기 로딩 완료 로그
console.log('🚗 스마트주차장 시스템이 시작되었습니다!');
console.log('💡 실시간 업데이트: 30초마다');
console.log('🔋 충전소 개수:', chargingStations.length);