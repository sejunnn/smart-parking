
function updateTime() {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  document.getElementById("time-now").textContent = hour + ":" + min;
}

function loadMockData() {
  const zones = [
    { zone: "구역1", status: "충전중", state: "charging", desc1: "53분 경과", desc2: "87% 진행중" },
    { zone: "구역2", status: "충전가능", state: "available", desc1: "12시간 전 사용" },
    { zone: "구역3", status: "충전가능", state: "available", desc1: "6시간 전 사용" },
    { zone: "구역4", status: "대기중 ...", state: "waiting", desc1: "이 구역에 차량이", desc2: "인식되었습니다." }
  ];

  const wrapper = document.querySelector(".zone-wrapper");
  wrapper.innerHTML = "";

  zones.forEach(z => {
    const div = document.createElement("div");
    div.className = "zone-box " + z.state;
    div.innerHTML = `
      <h5>${z.zone} ${statusIcon(z.state)} ${z.status}</h5>
      <p>${z.desc1 || ""}</p>
      <p>${z.desc2 || ""}</p>
    `;
    wrapper.appendChild(div);
  });
}

function statusIcon(state) {
  if (state === "charging") return "⚡";
  if (state === "available") return "🔌";
  if (state === "waiting") return "⏳";
  return "";
}

updateTime();
loadMockData();
