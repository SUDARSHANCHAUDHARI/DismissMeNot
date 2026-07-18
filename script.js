(function initDismissMeNot(globalScope) {
  "use strict";

  const MAX_ATTEMPTS = 10;
  const BEHAVIOR_KEYS = Object.freeze([
    "move-corner",
    "new-message",
    "split",
    "hide-pointer",
    "shrink-grow",
    "move-close",
    "ask-why",
    "fake-dialog",
    "close-return",
    "dismiss-desktop",
  ]);

  const MESSAGE_POOL = Object.freeze([
    "This meeting could've been a nap.",
    "Your break misses you.",
    "Hydration has entered the chat.",
    "Plot twist: still here.",
    "Inbox zero is a myth.",
    "I can do this all day.",
    "Tiny window. Huge commitment.",
    "Closing is just opening backwards.",
    "We need to talk about your tabs.",
    "I'm not clingy. I'm cached.",
    "Nice click. Anyway…",
    "Unsubscribe from consequences?",
  ]);

  const BEHAVIOR_LABELS = Object.freeze({
    "move-corner": "The notification moved to another corner.",
    "new-message": "The notification returned with a new message.",
    split: "The notification brought a friend.",
    "hide-pointer": "The notification hid behind the pointer.",
    "shrink-grow": "The notification shrank, then reconsidered.",
    "move-close": "The close button moved.",
    "ask-why": "The notification asked why you are closing it.",
    "fake-dialog": "A confirmation dialog appeared.",
    "close-return": "The notification closed and immediately returned.",
    "dismiss-desktop": "The notification dismissed the desktop instead.",
  });

  function pickBehavior(previousBehavior, random = Math.random) {
    const choices = BEHAVIOR_KEYS.filter((key) => key !== previousBehavior);
    const rawIndex = Math.floor(random() * choices.length);
    const safeIndex = Math.max(0, Math.min(choices.length - 1, rawIndex));
    return choices[safeIndex];
  }

  function getAttemptOutcome(previousAttempts, maxAttempts = MAX_ATTEMPTS) {
    const nextAttempt = Math.min(previousAttempts + 1, maxAttempts);
    return {
      nextAttempt,
      isComplete: nextAttempt >= maxAttempts,
    };
  }

  const publicApi = Object.freeze({
    MAX_ATTEMPTS,
    BEHAVIOR_KEYS,
    pickBehavior,
    getAttemptOutcome,
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }

  if (typeof document === "undefined") {
    return;
  }

  const motionPreference = globalScope.matchMedia("(prefers-reduced-motion: reduce)");
  const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const timers = new Set();
  let audioContext = null;
  let nextNotificationId = 2;
  let dialogReturnId = 1;
  let lastPointer = null;
  let state = createInitialState();

  const elements = {};

  function createInitialState() {
    return {
      attempts: 0,
      complete: false,
      soundOn: true,
      corner: "top-right",
      lastBehavior: null,
      notifications: [
        {
          id: 1,
          app: "Persistent reminder",
          message: "This meeting could've been a nap.",
          closePosition: "right",
        },
      ],
    };
  }

  function cacheElements() {
    elements.attemptCount = document.querySelector("#attempt-count");
    elements.attemptProgress = document.querySelector("#attempt-progress");
    elements.soundToggle = document.querySelector("#sound-toggle");
    elements.soundLabel = document.querySelector("#sound-label");
    elements.resetButton = document.querySelector("#reset-button");
    elements.desktop = document.querySelector("#desktop");
    elements.notificationLayer = document.querySelector("#persistent-notifications");
    elements.finalMessage = document.querySelector("#final-message");
    elements.dialogBackdrop = document.querySelector("#dialog-backdrop");
    elements.dialog = document.querySelector("#confirmation-dialog");
    elements.dialogCancel = document.querySelector("#dialog-cancel");
    elements.dialogConfirm = document.querySelector("#dialog-confirm");
    elements.liveRegion = document.querySelector("#live-region");
  }

  function start() {
    cacheElements();
    bindEvents();
    updateAttemptMeter();
    updateSoundControl();
    // Preserve the browser's normal starting focus order on initial page load.
    renderNotifications();
  }

  function bindEvents() {
    elements.soundToggle.addEventListener("click", toggleSound);
    elements.resetButton.addEventListener("click", resetExperience);
    elements.dialogCancel.addEventListener("click", () => closeDialog("cancel"));
    elements.dialogConfirm.addEventListener("click", () => closeDialog("confirm"));
    elements.dialogBackdrop.addEventListener("pointerdown", (event) => {
      if (event.target === elements.dialogBackdrop) {
        closeDialog("cancel");
      }
    });
    document.addEventListener("keydown", handleDocumentKeydown);
    globalScope.addEventListener("resize", requestCardPlacement, { passive: true });
  }

  function renderNotifications(options = {}) {
    const { focusId = null, returningId = null } = options;
    elements.notificationLayer.replaceChildren();
    elements.notificationLayer.hidden = state.complete;

    state.notifications.forEach((notification, index) => {
      const card = document.createElement("article");
      card.className = "notification-card";
      card.dataset.notificationId = String(notification.id);
      card.dataset.closePosition = notification.closePosition;
      card.style.zIndex = String(10 + index);
      card.setAttribute("aria-labelledby", `notification-message-${notification.id}`);
      card.setAttribute("aria-describedby", `notification-meta-${notification.id}`);

      const header = document.createElement("header");
      header.className = "notification-header";

      const badge = document.createElement("span");
      badge.className = "notification-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = "!";

      const meta = document.createElement("div");
      meta.className = "notification-meta";
      meta.id = `notification-meta-${notification.id}`;

      const app = document.createElement("strong");
      app.className = "notification-app";
      app.textContent = notification.app;

      const time = document.createElement("span");
      time.className = "notification-time";
      time.textContent = index === 0 ? "now-ish" : `${index + 1} notifications ago`;

      meta.append(app, time);

      const closeButton = document.createElement("button");
      closeButton.className = "notification-close";
      closeButton.type = "button";
      closeButton.dataset.notificationId = String(notification.id);
      closeButton.setAttribute("aria-keyshortcuts", "Escape");
      closeButton.setAttribute("aria-label", `Dismiss notification: ${notification.message}`);
      closeButton.title = "Dismiss notification";
      closeButton.textContent = "×";
      closeButton.addEventListener("pointerdown", rememberPointer);
      closeButton.addEventListener("click", () => attemptDismiss(notification.id));

      header.append(badge, meta, closeButton);

      const content = document.createElement("div");
      content.className = "notification-content";

      const message = document.createElement("p");
      message.className = "notification-message";
      message.id = `notification-message-${notification.id}`;
      message.textContent = notification.message;

      const footer = document.createElement("footer");
      footer.className = "notification-footer";

      const stamp = document.createElement("span");
      stamp.className = "notification-stamp";
      stamp.textContent = "Do not disturb me";

      const serial = document.createElement("span");
      serial.textContent = `Refusal no. ${String(state.attempts + 1).padStart(2, "0")}`;

      footer.append(stamp, serial);
      content.append(message, footer);
      card.append(header, content);

      if (returningId === notification.id) {
        card.classList.add("is-returning");
      }

      elements.notificationLayer.append(card);
    });

    requestAnimationFrame(() => {
      placeCards();
      if (focusId !== null) {
        focusCloseButton(focusId);
      }
    });
  }

  function requestCardPlacement() {
    requestAnimationFrame(placeCards);
  }

  function placeCards() {
    if (state.complete) {
      return;
    }

    const layerRect = elements.notificationLayer.getBoundingClientRect();
    const isLeft = state.corner.endsWith("left");
    const isTop = state.corner.startsWith("top");
    const edge = layerRect.width < 520 ? 12 : 24;
    const cascade = layerRect.width < 520 ? 8 : 12;
    const verticalStep = layerRect.height < 520 ? 62 : 74;

    const cards = getCards();
    cards.forEach((card, index) => {
      if (card.classList.contains("is-pointer-hidden")) {
        return;
      }

      // Paint from the outer edge inward so each cascaded header stays reachable.
      card.style.zIndex = String(isTop ? 10 + index : 10 + cards.length - index);

      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      const x = isLeft
        ? edge + index * cascade
        : layerRect.width - cardWidth - edge - index * cascade;
      const y = isTop
        ? edge + index * verticalStep
        : layerRect.height - cardHeight - edge - index * verticalStep;

      card.style.left = `${clamp(x, 6, Math.max(6, layerRect.width - cardWidth - 6))}px`;
      card.style.top = `${clamp(y, 6, Math.max(6, layerRect.height - cardHeight - 6))}px`;
    });
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function getCards() {
    return Array.from(elements.notificationLayer.querySelectorAll(".notification-card"));
  }

  function getCard(notificationId) {
    return elements.notificationLayer.querySelector(
      `[data-notification-id="${notificationId}"].notification-card`,
    );
  }

  function focusCloseButton(notificationId) {
    const preferred = elements.notificationLayer.querySelector(
      `.notification-close[data-notification-id="${notificationId}"]`,
    );
    const fallback = elements.notificationLayer.querySelector(".notification-close");
    (preferred || fallback)?.focus({ preventScroll: true });
  }

  function rememberPointer(event) {
    lastPointer = {
      x: event.clientX,
      y: event.clientY,
      type: event.pointerType,
      time: Date.now(),
    };
  }

  function attemptDismiss(notificationId) {
    if (state.complete || !elements.dialogBackdrop.hidden) {
      return;
    }

    prepareForAttempt();
    const outcome = getAttemptOutcome(state.attempts);
    state.attempts = outcome.nextAttempt;
    updateAttemptMeter();

    if (outcome.isComplete) {
      finishPeacefully();
      return;
    }

    const behavior = pickBehavior(state.lastBehavior);
    state.lastBehavior = behavior;
    playAttemptSound(state.attempts, behavior);
    runBehavior(behavior, notificationId);
    announce(`Attempt ${state.attempts} of ${MAX_ATTEMPTS}. ${BEHAVIOR_LABELS[behavior]}`);
  }

  function prepareForAttempt() {
    clearTimers();
    elements.desktop.classList.remove("is-dismissed");
    getCards().forEach((card) => {
      card.classList.remove("is-shrinking", "is-pointer-hidden", "is-closing", "is-returning");
    });
    placeCards();
  }

  function runBehavior(behavior, notificationId) {
    const actions = {
      "move-corner": moveToAnotherCorner,
      "new-message": returnWithNewMessage,
      split: splitNotification,
      "hide-pointer": hideBehindPointer,
      "shrink-grow": shrinkAndGrow,
      "move-close": moveCloseButton,
      "ask-why": askWhy,
      "fake-dialog": showConfirmationDialog,
      "close-return": closeAndReturn,
      "dismiss-desktop": dismissDesktop,
    };

    actions[behavior](notificationId);
  }

  function moveToAnotherCorner(notificationId) {
    const availableCorners = corners.filter((corner) => corner !== state.corner);
    state.corner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    updateMessage(notificationId, "New corner. Same problem.");
    placeCards();
    focusCloseButton(notificationId);
  }

  function returnWithNewMessage(notificationId) {
    updateMessage(notificationId, randomMessage());
    const card = getCard(notificationId);
    card?.classList.add("is-returning");
    focusCloseButton(notificationId);
  }

  function splitNotification(notificationId) {
    if (state.notifications.length < 4) {
      state.notifications.push({
        id: nextNotificationId,
        app: "Emotional backup",
        message: "I brought moral support.",
        closePosition: "right",
      });
      nextNotificationId += 1;
    } else {
      updateMessage(notificationId, "The notification union is full.");
    }
    renderNotifications({ focusId: notificationId });
  }

  function hideBehindPointer(notificationId) {
    const card = getCard(notificationId);
    if (!card) {
      return;
    }

    updateMessage(notificationId, "Can't close what you can't quite see.");
    const layerRect = elements.notificationLayer.getBoundingClientRect();
    const pointerIsFresh = lastPointer && Date.now() - lastPointer.time < 1500;
    const pointerX = pointerIsFresh ? lastPointer.x - layerRect.left : layerRect.width / 2;
    const pointerY = pointerIsFresh ? lastPointer.y - layerRect.top : layerRect.height / 2;
    card.style.left = `${clamp(pointerX - card.offsetWidth / 2, 0, layerRect.width - card.offsetWidth)}px`;
    card.style.top = `${clamp(pointerY - card.offsetHeight / 2, 0, layerRect.height - card.offsetHeight)}px`;
    card.classList.add("is-pointer-hidden");

    schedule(() => {
      card.classList.remove("is-pointer-hidden");
      placeCards();
      focusCloseButton(notificationId);
    }, motionPreference.matches ? 120 : 720);
  }

  function shrinkAndGrow(notificationId) {
    updateMessage(notificationId, "Small problem. Growing concern.");
    const card = getCard(notificationId);
    card?.classList.add("is-shrinking");
    focusCloseButton(notificationId);
  }

  function moveCloseButton(notificationId) {
    const notification = findNotification(notificationId);
    if (!notification) {
      return;
    }
    notification.closePosition = notification.closePosition === "right" ? "left" : "right";
    notification.message = "The × has entered witness protection.";
    renderNotifications({ focusId: notificationId });
  }

  function askWhy(notificationId) {
    updateMessage(notificationId, "Why are you closing me?");
    focusCloseButton(notificationId);
  }

  function showConfirmationDialog(notificationId) {
    dialogReturnId = notificationId;
    elements.dialogBackdrop.hidden = false;
    playDialogSound();
    schedule(() => elements.dialogCancel.focus({ preventScroll: true }), 0);
  }

  function closeAndReturn(notificationId) {
    const card = getCard(notificationId);
    if (!card) {
      return;
    }
    card.classList.add("is-closing");
    schedule(() => {
      updateMessage(notificationId, "Miss me? I took a long 300 milliseconds.");
      card.classList.remove("is-closing");
      card.classList.add("is-returning");
      focusCloseButton(notificationId);
    }, motionPreference.matches ? 100 : 360);
  }

  function dismissDesktop(notificationId) {
    elements.desktop.classList.add("is-dismissed");
    updateMessage(notificationId, "I dismissed the desktop. You're welcome.");
    focusCloseButton(notificationId);
  }

  function closeDialog(result) {
    if (elements.dialogBackdrop.hidden) {
      return;
    }

    elements.dialogBackdrop.hidden = true;
    if (result === "confirm") {
      updateMessage(dialogReturnId, "Confirmation confirmed. Request ignored.");
      announce("Dismissal confirmed. The notification ignored it.");
      playAttemptSound(state.attempts, "fake-dialog");
    } else {
      updateMessage(dialogReturnId, "A wise and legally binding choice.");
      announce("Confirmation canceled. The notification remains.");
    }
    focusCloseButton(dialogReturnId);
  }

  function updateMessage(notificationId, message) {
    const notification = findNotification(notificationId);
    if (!notification) {
      return;
    }
    notification.message = message;
    const card = getCard(notificationId);
    const messageElement = card?.querySelector(".notification-message");
    const closeButton = card?.querySelector(".notification-close");
    if (messageElement) {
      messageElement.textContent = message;
    }
    if (closeButton) {
      closeButton.setAttribute("aria-label", `Dismiss notification: ${message}`);
    }
  }

  function findNotification(notificationId) {
    return state.notifications.find((notification) => notification.id === notificationId);
  }

  function randomMessage() {
    const currentMessages = new Set(state.notifications.map((notification) => notification.message));
    const candidates = MESSAGE_POOL.filter((message) => !currentMessages.has(message));
    const source = candidates.length > 0 ? candidates : MESSAGE_POOL;
    return source[Math.floor(Math.random() * source.length)];
  }

  function updateAttemptMeter() {
    elements.attemptCount.value = `${state.attempts} / ${MAX_ATTEMPTS}`;
    elements.attemptCount.textContent = `${state.attempts} / ${MAX_ATTEMPTS}`;
    elements.attemptProgress.value = state.attempts;
    elements.attemptProgress.textContent = `${state.attempts} of ${MAX_ATTEMPTS}`;
  }

  function finishPeacefully() {
    clearTimers();
    state.complete = true;
    state.notifications = [];
    elements.dialogBackdrop.hidden = true;
    elements.desktop.classList.remove("is-dismissed");
    elements.notificationLayer.replaceChildren();
    elements.notificationLayer.hidden = true;
    elements.finalMessage.hidden = false;
    playCompletionSound();
    announce("Thank you for your patience. The notification closed peacefully after ten attempts.");
    schedule(() => elements.finalMessage.focus({ preventScroll: true }), 0);
  }

  function resetExperience() {
    const soundOn = state.soundOn;
    clearTimers();
    nextNotificationId = 2;
    lastPointer = null;
    state = createInitialState();
    state.soundOn = soundOn;
    elements.desktop.classList.remove("is-dismissed");
    elements.dialogBackdrop.hidden = true;
    elements.finalMessage.hidden = true;
    updateAttemptMeter();
    updateSoundControl();
    renderNotifications({ focusId: 1 });
    announce("DismissMeNot reset. Dismissal attempts returned to zero.");
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    updateSoundControl();
    if (state.soundOn) {
      playNotes([
        [440, 0, 0.06],
        [660, 0.07, 0.08],
      ]);
    }
    announce(`Generated sounds ${state.soundOn ? "on" : "off"}.`);
  }

  function updateSoundControl() {
    elements.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
    elements.soundLabel.textContent = state.soundOn ? "Sound on" : "Sound off";
  }

  function playAttemptSound(attempt, behavior) {
    if (!state.soundOn) {
      return;
    }
    const behaviorIndex = BEHAVIOR_KEYS.indexOf(behavior);
    const base = 180 + attempt * 18 + Math.max(0, behaviorIndex) * 7;
    playNotes([
      [base * 1.25, 0, 0.055],
      [base, 0.055, 0.08],
    ], "square", 0.025);
  }

  function playDialogSound() {
    playNotes([
      [310, 0, 0.07],
      [310, 0.1, 0.07],
    ], "triangle", 0.025);
  }

  function playCompletionSound() {
    playNotes([
      [392, 0, 0.12],
      [494, 0.13, 0.12],
      [587, 0.26, 0.18],
    ], "sine", 0.035);
  }

  function playNotes(notes, wave = "sine", volume = 0.03) {
    if (!state.soundOn) {
      return;
    }

    const AudioContextClass = globalScope.AudioContext || globalScope.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    try {
      audioContext ||= new AudioContextClass();
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      const now = audioContext.currentTime;
      notes.forEach(([frequency, delay, duration]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, now + delay);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(volume, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now + delay);
        oscillator.stop(now + delay + duration + 0.02);
      });
    } catch (_error) {
      // Sound is decorative. Interaction remains fully usable if Web Audio is unavailable.
    }
  }

  function handleDocumentKeydown(event) {
    if (!elements.dialogBackdrop.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog("cancel");
        return;
      }
      if (event.key === "Tab") {
        trapDialogFocus(event);
      }
      return;
    }

    if (event.key !== "Escape" || state.complete) {
      return;
    }

    event.preventDefault();
    const focusedButton = document.activeElement?.closest?.(".notification-close");
    const focusedId = Number(focusedButton?.dataset.notificationId);
    const targetId = Number.isFinite(focusedId) ? focusedId : state.notifications[0]?.id;
    if (targetId) {
      attemptDismiss(targetId);
    }
  }

  function trapDialogFocus(event) {
    const focusable = [elements.dialogCancel, elements.dialogConfirm];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function announce(message) {
    elements.liveRegion.textContent = "";
    schedule(() => {
      elements.liveRegion.textContent = message;
    }, 20);
  }

  function schedule(callback, delay) {
    const timerId = globalScope.setTimeout(() => {
      timers.delete(timerId);
      callback();
    }, delay);
    timers.add(timerId);
    return timerId;
  }

  function clearTimers() {
    timers.forEach((timerId) => globalScope.clearTimeout(timerId));
    timers.clear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
