async function loadStatus() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/your-username/smart-parking/main/status.json');
    const data = await res.json();

    const container = document.getElementById("status-container");
    container.innerHTML = "";

    data.zones.forEach(zone => {
      const box = document.createElement("div");
      box.className = "zone-box";
      box.innerHTML = `
        <h3>구역 ${zone.zone}</h3>
        <p><strong>상태:</strong> ${zone.status}</p>
        <p><strong>배터리:</strong> ${zone.battery}%</p>
      `;
      container.appendChild(box);
    });

    document.getElementById("last-updated").innerText = new Date().toLocaleString();
  } catch (err) {
    console.error("데이터 불러오기 실패:", err);
    document.getElementById("status-container").innerText = "데이터를 불러올 수 없습니다.";
  }
}
loadStatus();
setInterval(loadStatus, 10000);
