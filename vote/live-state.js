(() => {
  "use strict";

  const LIVE_STATE_KEY = "gamboo:vote:live-video-visible:v2";
  let observer = null;

  const readLiveState = () => {
    if (window.matchMedia("(min-width: 900px)").matches) return true;
    try {
      const stored = window.sessionStorage.getItem(LIVE_STATE_KEY);
      if (stored === "true") return true;
      if (stored === "false") return false;
      return window.matchMedia("(min-width: 900px)").matches;
    } catch (_error) {
      return window.matchMedia("(min-width: 900px)").matches;
    }
  };

  const writeLiveState = (open) => {
    try {
      window.sessionStorage.setItem(LIVE_STATE_KEY, String(open));
    } catch (_error) {
      // Storage may be unavailable in restrictive browser modes.
    }
  };

  const getLiveElements = () => {
    const raceInfo = document.querySelector("gamboo-race-info");
    if (!raceInfo) return null;

    const button = raceInfo.querySelector(".race-live-button");
    const video = raceInfo.querySelector(".race-info-video");
    if (!button || !video) return null;

    return { button, video };
  };

  const syncLiveState = () => {
    const elements = getLiveElements();
    if (!elements) return false;

    const { button, video } = elements;
    const shouldOpen = readLiveState();
    const isOpen = !video.hidden;
    if (shouldOpen !== isOpen) button.click();
    return true;
  };

  const bindLiveState = () => {
    const elements = getLiveElements();
    if (!elements) return false;

    const { button, video } = elements;
    if (button.dataset.liveStateBound !== "true") {
      button.dataset.liveStateBound = "true";
      button.addEventListener("click", () => {
        if (!window.matchMedia("(min-width: 900px)").matches) {
          queueMicrotask(() => writeLiveState(!video.hidden));
        }
      });
    }

    syncLiveState();
    observer?.disconnect();
    observer = null;
    return true;
  };

  const waitForRaceInfo = () => {
    if (bindLiveState()) return;

    observer = new MutationObserver(() => {
      bindLiveState();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForRaceInfo, { once: true });
  } else {
    waitForRaceInfo();
  }

  window.addEventListener("pageshow", () => {
    bindLiveState();
  });
})();
