const SFX = {
  hoverButton: "assets/sfx/hover-button.mp3",
  clickButton: "assets/sfx/cyberpunk-bass-impact.mp3",

  materialize: "assets/sfx/materialize.mp3",
  shimmer1: "assets/sfx/ice-shimmer-1.wav",
  shimmer2: "assets/sfx/ice-shimmer-2.wav",

  hoverValid: "assets/sfx/hover-valid.mp3",
  hoverInvalid: "assets/sfx/hover-invalid.mp3",
  hoverCell: "assets/sfx/hover-cell.mp3",

  selectShip: "assets/sfx/select-ship-2.mp3",
  placeWoosh: "assets/sfx/place-whoosh.mp3",
  adjustShip: "assets/sfx/adjust-ship.mp3",
  placeRandom: "assets/sfx/place-random.wav",

  deploy: "assets/sfx/sci-fi-door.wav",
  lockedIn: "assets/sfx/locked-in.wav",
  cinematicTransition: "assets/sfx/cinematic-transition.wav",

  hit: "assets/sfx/sci-fi-gun.mp3",
  miss: "assets/sfx/tribecore-kick.mp3",
  sunk: "assets/sfx/metallic-impact.wav",
  fire: "assets/sfx/sci-fi-cannon.mp3",

  floatPulse: "assets/sfx/float-pulse.wav",
  shipPulse: "assets/sfx/ship-pulse.wav",
};

const MUSIC = {
  menu: "assets/music/Laser Tournament.mp3",
  setup: "assets/music/New Order.ogg",
  battle: "assets/music/graymist.ogg",
  victory: "assets/music/victory.ogg",
  defeat: "assets/music/defeat.ogg",
};

export function SoundSystem() {
  const sfx = createAudioMap(SFX);
  const musicTracks = createAudioMap(MUSIC);

  const timeouts = new Map();
  const intervals = new Map();
  const musicFadeFrames = new Map();

  const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"];

  let currentMusic = null;
  let currentMusicName = null;
  let desiredMusicRequest = null;
  let musicRequestID = 0;
  let unlockArmed = false;

  function createAudioMap(sources) {
    return Object.entries(sources).reduce((map, [name, src]) => {
      map[name] = new Audio(src);
      map[name].preload = "auto";
      return map;
    }, {});
  }

  // ====================
  // SFX CORE
  // ====================

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

  // ====================
  // MUSIC CORE
  // ====================

  function stopTrackFade(track) {
    const frameID = musicFadeFrames.get(track);

    if (frameID !== undefined) {
      cancelAnimationFrame(frameID);
      musicFadeFrames.delete(track);
    }
  }

  function fadeTrack(track, targetVolume, duration = 1000) {
    if (!track) return Promise.resolve();

    stopTrackFade(track);

    if (duration <= 0) {
      track.volume = targetVolume;
      return Promise.resolve();
    }

    const startVolume = track.volume;
    const startTime = performance.now();

    return new Promise((resolve) => {
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);

        const nextVolume =
          startVolume + (targetVolume - startVolume) * progress;

        track.volume = Math.max(0, Math.min(1, nextVolume));

        if (progress < 1) {
          musicFadeFrames.set(track, requestAnimationFrame(step));
          return;
        }

        musicFadeFrames.delete(track);
        resolve();
      }

      musicFadeFrames.set(track, requestAnimationFrame(step));
    });
  }

  function pauseAndResetTrack(track) {
    track.pause();
    track.volume = 0;

    try {
      track.currentTime = 0;
    } catch {
      // Some browsers can throw if the media is not seekable yet.
    }
  }

  function armMusicUnlock() {
    if (unlockArmed || typeof document === "undefined") return;

    unlockArmed = true;

    UNLOCK_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, retryDesiredMusic, true);
    });
  }

  function disarmMusicUnlock() {
    if (!unlockArmed || typeof document === "undefined") return;

    unlockArmed = false;

    UNLOCK_EVENTS.forEach((eventName) => {
      document.removeEventListener(eventName, retryDesiredMusic, true);
    });
  }

  function retryDesiredMusic() {
    console.log("fired");
    if (!desiredMusicRequest) {
      disarmMusicUnlock();
      return;
    }

    playMusicTrack(desiredMusicRequest.name, desiredMusicRequest.options);
  }

  async function playMusicTrack(
    name,
    { volume = 0.35, loop = true, restart = false, fadeDuration = 1200 } = {},
  ) {
    const nextTrack = musicTracks[name];

    if (!nextTrack) {
      console.warn(`Unknown music track: ${name}`);
      return false;
    }

    const options = { volume, loop, restart, fadeDuration };
    const requestID = ++musicRequestID;

    desiredMusicRequest = { name, options };

    // Same track already active
    if (currentMusicName === name && currentMusic && !restart) {
      currentMusic.loop = loop;
      disarmMusicUnlock();

      await fadeTrack(currentMusic, volume, fadeDuration);

      return true;
    }

    const prevTrack = currentMusic;

    // Fade out previous track first
    if (prevTrack && prevTrack !== nextTrack) {
      await fadeTrack(prevTrack, 0, fadeDuration);

      if (requestID !== musicRequestID) {
        return false;
      }

      pauseAndResetTrack(prevTrack);
    }

    nextTrack.loop = loop;
    nextTrack.volume = 0;

    if (restart) {
      try {
        nextTrack.currentTime = 0;
      } catch {
        // Ignore seek errors before metadata is ready.
      }
    }

    try {
      await nextTrack.play();
    } catch {
      if (requestID === musicRequestID) {
        armMusicUnlock();
      }

      return false;
    }

    if (requestID !== musicRequestID) {
      pauseAndResetTrack(nextTrack);
      return false;
    }

    currentMusic = nextTrack;
    currentMusicName = name;

    disarmMusicUnlock();

    await fadeTrack(nextTrack, volume, fadeDuration);

    return true;
  }

  function stopMusicTrack({ fadeDuration = 2000 } = {}) {
    musicRequestID++;
    desiredMusicRequest = null;
    disarmMusicUnlock();

    if (!currentMusic) return;

    const track = currentMusic;

    currentMusic = null;
    currentMusicName = null;

    fadeTrack(track, 0, fadeDuration).then(() => {
      if (currentMusic !== track) {
        pauseAndResetTrack(track);
      }
    });
  }

  // ====================
  // GLOBAL STOP
  // ====================

  function stopAll() {
    timeouts.forEach((timeout) => clearTimeout(timeout));
    intervals.forEach((interval) => clearInterval(interval));

    timeouts.clear();
    intervals.clear();

    musicFadeFrames.forEach((frameID) => cancelAnimationFrame(frameID));
    musicFadeFrames.clear();

    desiredMusicRequest = null;
    currentMusic = null;
    currentMusicName = null;

    disarmMusicUnlock();

    Object.values(musicTracks).forEach((track) => {
      pauseAndResetTrack(track);
    });
  }

  // ====================
  // PUBLIC SFX API
  // ====================

  const ui = {
    buttonHover() {
      playDebouncedSfx("buttonHover", "hoverButton", {
        delay: 80,
        volume: 0.8,
      });
    },

    clearButtonHover() {
      clearDebouncedSfx("buttonHover");
    },

    buttonClick() {
      playSfx("clickButton", { volume: 0.3 });
    },

    materializeSoft() {
      playSfx("materialize", { volume: 0.05 });
    },

    shimmerHover() {
      playDebouncedSfx("aiCardHover", "shimmer1", {
        delay: 100,
        volume: 0.1,
      });
    },

    clearShimmerHover() {
      clearDebouncedSfx("aiCardHover");
    },

    shimmerLock() {
      playSfx("shimmer2", { volume: 0.2 });
    },

    shimmerTransition() {
      playSfx("shimmer2", { volume: 0.18 });
    },

    deploy() {
      playSfx("deploy", { volume: 0.2 });
    },

    lockedIn() {
      playSfx("lockedIn", { volume: 0.2 });
    },

    cinematicTransition() {
      playSfx("cinematicTransition", { volume: 0.2 });
    },
  };

  const board = {
    cellHover(type) {
      const soundMap = {
        valid: "hoverValid",
        invalid: "hoverInvalid",
        target: "hoverCell",
      };

      const volumeMap = {
        valid: 0.05,
        invalid: 0.14,
        target: 0.1,
      };

      const sfxName = soundMap[type];

      if (!sfxName) {
        throw Error(`"${type}" is not a valid cell hover sound type.`);
      }

      playDebouncedSfx("cellHover", sfxName, {
        delay: 100,
        volume: volumeMap[type],
      });
    },

    clearCellHover() {
      clearDebouncedSfx("cellHover");
    },

    fire(isComputer) {
      const volume = isComputer ? 0.14 : 0.3;
      playSfx("fire", { volume });
    },

    impact(hit) {
      playSfx(hit ? "hit" : "miss", {
        volume: 0.4,
        playbackRate: 0.95 + Math.random() * 0.1,
      });
    },
  };

  const ship = {
    selectSegment() {
      playSfx("selectShip", { volume: 0.1 });
    },

    adjust() {
      playSfx("adjustShip", { volume: 0.04 });
    },

    placeSegment() {
      playSfx("placeWoosh", { volume: 0.25 });
    },

    deployWoosh() {
      playSfx("placeWoosh", { volume: 0.18 });
    },

    placeRandom() {
      playSfx("placeRandom", { volume: 0.25 });
    },

    startFleetPulse() {
      startRepeatingSfx("fleetPulse", "floatPulse", {
        interval: 1200,
        volume: 0.03,
        playbackRate: 0.5,
        playNow: true,
      });
    },

    stopFleetPulse() {
      stopRepeatingSfx("fleetPulse");
    },

    startDamagePulse() {
      startRepeatingSfx("activeDamagePulse", "shipPulse", {
        interval: 1200,
        volume: 0.08,
        playbackRate: 0.5,
        playNow: false,
      });
    },

    stopDamagePulse() {
      stopRepeatingSfx("activeDamagePulse");
    },

    sunk() {
      playSfx("sunk", { volume: 0.7 });
    },
  };

  // ====================
  // PUBLIC MUSIC API
  // ====================

  const music = {
    menu() {
      return playMusicTrack("menu", {
        volume: 0.15,
        fadeDuration: 500,
      });
    },

    setup() {
      return playMusicTrack("setup", {
        volume: 0.15,
        fadeDuration: 500,
      });
    },

    battle() {
      return playMusicTrack("battle", {
        volume: 0.15,
        fadeDuration: 500,
      });
    },

    victory() {
      return playMusicTrack("victory", {
        volume: 0.15,
        fadeDuration: 1600,
        restart: true,
        loop: false,
      });
    },

    defeat() {
      return playMusicTrack("defeat", {
        volume: 0.15,
        fadeDuration: 1600,
        restart: true,
        loop: false,
      });
    },

    play(name, options) {
      return playMusicTrack(name, options);
    },

    stop(options) {
      stopMusicTrack(options);
    },
  };

  return {
    playSfx,
    playDebouncedSfx,
    clearDebouncedSfx,
    startRepeatingSfx,
    stopRepeatingSfx,
    stopAll,

    music,
    ui,
    board,
    ship,
  };
}
