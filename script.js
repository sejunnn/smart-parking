document.addEventListener("DOMContentLoaded", function () {
  fetch("status.json")
    .then(response => response.json())
    .then(data => {
      data.zones.forEach(zone => {
        const zoneEl = document.getElementById(`zone-${zone.zone}`);
        const statusEl = zoneEl.querySelector(".status");
        const batteryEl = zoneEl.querySelector(".battery");
        const iconEl = zoneEl.querySelector(".icon");

        let statusText = "상태: 없음";
        let batteryText = "배터리: -";
        let iconSrc = "";
        let iconAlt = "";

        if (zone.status === "충전중") {
          statusText = "상태: 충전중";
          batteryText = `배터리: ${zone.battery}%`;
          iconSrc = "charging.svg";
          iconAlt = "충전중";
        } else if (zone.status === "대기중") {
          statusText = "상태: 대기중";
          batteryText = `배터리: ${zone.battery}%`;
          iconSrc = "";
        } else if (zone.status === "충전가능") {
          statusText = "상태: 충전가능";
          batteryText = `배터리: ${zone.battery}%`;
          iconSrc = "ok.svg";
          iconAlt = "충전가능";
        }

        statusEl.textContent = statusText;
        batteryEl.textContent = batteryText;

        if (iconSrc) {
          iconEl.src = iconSrc;
          iconEl.alt = iconAlt;
          iconEl.style.display = "block";
        } else {
          iconEl.style.display = "none";
        }
      });
    })
    .catch(error => {
      console.error("Error loading status.json:", error);
    });

  document.getElementById("refreshBtn").addEventListener("click", () => {
    location.reload();
  });
});
