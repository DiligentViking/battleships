export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");

  let running = true;

  let particleHorizontal = true;

  function init() {
    spawnLoop();
    bindButtons();
  }

  function bindButtons() {
    root.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;

        if (action === "start" || action === "ai") {
          exitMenu();
          onStart(action);
        }

        if (action === "settings") {
          console.log("Settings not implemented yet");
        }
      });
    });
  }

  function spawnParticle() {
    const el = document.createElement("div");
    el.className = "particle";

    const isHorizontal = particleHorizontal;
    particleHorizontal = !particleHorizontal;

    const duration = 1.4 + Math.random() * 0.6;
    const travel = 2000;

    if (isHorizontal) {
      el.classList.add("h");

      const y = Math.random() * 100;
      el.style.top = `${y}%`;
      el.style.left = `-50px`;

      el.style.setProperty("--dx", `${travel}px`);
      el.style.setProperty("--dy", `0px`);
    } else {
      el.classList.add("v");

      const x = Math.random() * 100;
      el.style.left = `${x}%`;
      el.style.top = `-50px`;

      el.style.setProperty("--dx", `0px`);
      el.style.setProperty("--dy", `${travel}px`);
    }

    el.style.opacity = 0.1 + Math.random() * 0.1;

    el.style.animationDuration = `${duration}s`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), duration * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnParticle();

    const next = 200 + Math.random() * 200;
    setTimeout(spawnLoop, next);
  }

  function exitMenu() {
    running = false;

    root.style.transition = "opacity 0.6s ease";
    root.style.opacity = "0";

    setTimeout(() => {
      root.remove();
    }, 600);
  }

  return { init };
}
