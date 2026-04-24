export function Menu(onStart) {
  const root = document.getElementById("mainMenu");
  const bg = document.getElementById("menuBg");

  let running = true;

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

  function spawnStreak() {
    const el = document.createElement("div");
    el.className = "streak";

    const y = Math.random() * 100;
    const duration = 4 + Math.random() * 6;
    const delay = Math.random() * 2;
    const angle = (Math.random() - 0.5) * 20;

    el.style.top = `${y}%`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.transform = `rotate(${angle}deg)`;

    bg.appendChild(el);

    setTimeout(() => el.remove(), (duration + delay) * 1000);
  }

  function spawnLoop() {
    if (!running) return;

    spawnStreak();

    const next = 200 + Math.random() * 400;
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
