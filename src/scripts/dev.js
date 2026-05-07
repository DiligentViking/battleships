export const DEV = {
  enabled: true,

  startAt: "setup", // "menu" | "setup" | "battle"
  defaultAI: 1, // 0 Drift, 1 Hunter, 2 Sentinel

  skipMenuIntro: true,
  skipGameDescent: true,

  autoRandomizeFleet: false,
  autoDeployFleet: false,

  delays: {
    hit: 0,
    computer: 0,
    autoplay: 80,
  },
};
