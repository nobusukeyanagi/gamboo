(() => {
  "use strict";

  const LIVE_STATE_KEY = "gamboo:vote:live-video-visible";
  const desktopMedia = window.matchMedia("(min-width:900px)");
  let observer = null;

  const readLiveState = () => {
    try {
      return window.sessionStorage.getItem(LIVE_STATE_KEY) === "true";
    } catch (_error) {
      return false;
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
    if (desktopMedia.matches) return true;
    const elements = getLiveElements();
    if (!elements) return false;

    const { button, video } = elements;
    const shouldOpen = readLiveState();
    const isOpen = !video.hidden;
    if (shouldOpen !== isOpen) button.click();
    return true;
  };

  const bindLiveState = () => {
    if (desktopMedia.matches) {
      observer?.disconnect();
      observer = null;
      return true;
    }
    const elements = getLiveElements();
    if (!elements) return false;

    const { button, video } = elements;
    if (button.dataset.liveStateBound !== "true") {
      button.dataset.liveStateBound = "true";
      button.addEventListener("click", () => {
        queueMicrotask(() => writeLiveState(!video.hidden));
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
  if (desktopMedia.addEventListener) desktopMedia.addEventListener("change", waitForRaceInfo);
  else desktopMedia.addListener(waitForRaceInfo);
})();
