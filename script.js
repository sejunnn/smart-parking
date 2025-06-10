async function loadStatus() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/sejunnn/smart-parking/main/status.json');
    const data = await res.json();

    const container = document.getElementById("status-container");
    container.innerHTML = "";

    data.zones.forEach(zone => {
      const color = zone.status === "충전중" ? "success" :
                    zone.status === "대기중" ? "warning" : "secondary";

      const box = document.createElement("div");
      box.className = "col-md-6 col-lg-4";
      box.innerHTML = `
        <div class="zone-box border border-${color} bg-white">
          <h4>🚗 구역 ${zone.zone}</h4>
          <p><strong>상태:</strong> <span class="text-${color} fw-bold">${zone.status}</span></p>
          <p><strong>배터리:</strong> ${zone.battery}%</p>
          ${zone.charging ? `<p><strong>⚡ 충전 중입니다</strong></p>` : ""}
        </div>
      `;
      container.appendChild(box);
    });

    document.getElementById("last-updated").innerText = new Date().toLocaleString();
  } catch (err) {
    console.error("데이터 불러오기 실패:", err);
    const container = document.getElementById("status-container");
    container.innerHTML = "<p class='text-danger text-center'>데이터를 불러올 수 없습니다.</p>";
  }
}
loadStatus();
setInterval(loadStatus, 10000);
