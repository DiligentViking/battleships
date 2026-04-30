const SFX = {
  clickButton: "assets/sfx/cyberpunk-bass-impact.mp3",

  hoverButton: "assets/sfx/hover-button.mp3",
  hoverValid: "assets/sfx/hover-valid.mp3",
  hoverInvalid: "assets/sfx/hover-invalid.mp3",
  hoverCell: "assets/sfx/hover-cell.mp3",

  selectShip: "assets/sfx/select-ship-2.mp3",
  placeWoosh: "assets/sfx/place-whoosh.mp3",
  adjustShip: "assets/sfx/adjust-ship.mp3",
  placeRandom: "assets/sfx/place-random.wav",

  hit: "assets/sfx/sci-fi-gun.mp3",
  miss: "assets/sfx/tribecore-kick.mp3",
  sunk: "assets/sfx/metallic-impact.wav",
  fire: "assets/sfx/sci-fi-cannon.mp3",

  floatPulse: "assets/sfx/float-pulse.wav",
  shipPulse: "assets/sfx/ship-pulse.wav",
};

const MUSIC = {
  menu: "assets/music/menu-theme.mp3",
  battle: "assets/music/battle-theme.mp3",
};

export function SoundSystem() {
  const sfx = createAudioMap(SFX);
  const music = createAudioMap(MUSIC);

  const timeouts = new Map();
  const intervals = new Map();

  let currentMusic = null;

  function createAudioMap(sources) {
    return Object.entries(sources).reduce((map, [name, src]) => {
      map[name] = new Audio(src);
      map[name].preload = "auto";
      return map;
    }, {});
  }

  function playSfx(name, { volume = 1, playbackRate = 1 } = {}) {
    const base = sfx[name];
    if (!base) {
      console.warn(`Unknown sfx: ${name}`);
      return;
    }

    const sound = base.cloneNode();
    sound.volume = volume;
    sound.playbackRate = playbackRate;
    sound.play().catch(() => {});
  }

  function playDebouncedSfx(
    key,
    name,
    { delay = 80, volume = 1, playbackRate = 1 } = {},
  ) {
    clearTimeout(timeouts.get(key));

    const timeout = setTimeout(() => {
      playSfx(name, { volume, playbackRate });
      timeouts.delete(key);
    }, delay);

    timeouts.set(key, timeout);
  }

  function clearDebouncedSfx(key) {
    clearTimeout(timeouts.get(key));
    timeouts.delete(key);
  }

  function startRepeatingSfx(
    key,
    name,
    { interval = 1200, volume = 1, playbackRate = 1, playNow = true } = {},
  ) {
    stopRepeatingSfx(key);

    if (playNow) {
      playSfx(name, { volume, playbackRate });
    }

    const intervalID = setInterval(() => {
      playSfx(name, { volume, playbackRate });
    }, interval);

    intervals.set(key, intervalID);
  }

  function stopRepeatingSfx(key) {
    clearInterval(intervals.get(key));
    intervals.delete(key);
  }

  async function playMusic(
    name,
    { volume = 0.35, loop = true, restart = false } = {},
  ) {
    const track = music[name];
    if (!track) {
      console.warn(`Unknown music track: ${name}`);
      return;
    }

    if (currentMusic === track && !restart) return;

    stopMusic();

    currentMusic = track;
    currentMusic.loop = loop;
    currentMusic.volume = volume;
    currentMusic.currentTime = restart ? 0 : currentMusic.currentTime;

    try {
      await currentMusic.play();
    } catch {
      // Browsers block audio until the user interacts with the page.
    }
  }

  function stopMusic() {
    if (!currentMusic) return;

    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }

  function stopAll() {
    timeouts.forEach((timeout) => clearTimeout(timeout));
    intervals.forEach((interval) => clearInterval(interval));

    timeouts.clear();
    intervals.clear();

    stopMusic();
  }

  return {
    playSfx,
    playDebouncedSfx,
    clearDebouncedSfx,
    startRepeatingSfx,
    stopRepeatingSfx,
    playMusic,
    stopMusic,
    stopAll,
  };
}
