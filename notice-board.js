(() => {
  const BASE_URL = "https://meow-service-test.flutterclone.com";
  const SITE_SLUG = "le-meow-1788966188";
  const API_KEY = "site_9ab595eb4bb5d2266b875ef8f22c1f366b63486baaaa253e";
  const STORAGE_KEY = "dismissed_notices";
  const ENDPOINT = `${BASE_URL}/api/sites/${SITE_SLUG}/notice-board?nopaginate=1`;
  const CSS = `
    body.notice-board-open {
      overflow: hidden;
    }
    .notice-board-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: rgba(20, 14, 6, 0.78);
      overflow: hidden;
      height:100svh;
      width:100svw;
    }
    .notice-board-overlay,
    .notice-board-overlay * {
      box-sizing: border-box;
    }
    .notice-board-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 70vw;
      max-width: 70vw;
      max-height: 90dvh;
      min-width: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      overflow: hidden;
      border: 1px solid rgba(198, 145, 46, 0.34);
      border-radius: clamp(16px, 3vw, 32px);
      background: #ffffff;
      color: #1e160e;
      box-shadow: 0 28px 90px rgba(20, 14, 6, 0.34);
      font-family: "Jost", sans-serif;
      cursor: default;
    }
    .notice-board-full-layout {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
      flex-direction: column;
    }
    .notice-board-full {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      padding: clamp(24px, 4vw, 40px); 
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .notice-board-full-layout:not(.has-image) .notice-board-full {
      padding-top: 64px;
    }
    .notice-board-title {
      margin: 0;
      color: #1e160e;
      font-family: "Cormorant Garamond", serif;
      font-size: clamp(34px, 5vw, 64px);
      font-weight: 600;
      line-height: 1.05;
      letter-spacing: -0.02em;
    }
    .notice-board-description {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }
    .notice-board-subtitle,
    .notice-board-date,
    .notice-board-message {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .notice-board-subtitle {
      color: #75685a;
      font-size: clamp(17px, 2vw, 22px);
      font-weight: 300;
      line-height: 1.5;
    }
    .notice-board-date {
      color: #a87418;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.16em;
      line-height: 1.4;
      text-transform: uppercase;
    }
    .notice-board-message {
      color: #4f4335;
      font-size: clamp(16px, 1.8vw, 19px);
      font-weight: 300;
      line-height: 1.75;
      white-space: pre-wrap;
    }
    .notice-board-image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .notice-board-full-image {
      flex: 0 0 auto;
      width: 100%;
      max-height: 40dvh;
      aspect-ratio: 16 / 9;
      overflow: hidden;
    }
    .notice-board-image-only {
      flex: 0 1 auto;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      padding: 0;
      aspect-ratio: 16 / 9;
      max-height: 90dvh;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .notice-board-banner-picture {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
    }
    .notice-board-banner {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .notice-board-close {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 2;
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      padding: 0;
      border: 1px solid rgba(198, 145, 46, 0.42);
      border-radius: 50%;
      background: #ffffff;
      color: #a87418;
      font: 400 28px/1 Arial, sans-serif;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(30, 22, 14, 0.14);
    }
    .notice-board-close:hover {
      background: #e3c77f;
      color: #1e160e;
    }
    .notice-board-close:focus-visible {
      outline: 2px solid #a87418;
      outline-offset: 3px;
    }
    @media (max-width: 767px) {
      .notice-board-panel {
        width: auto;
        max-width: calc(100vw - 24px);
        // min-height: 80svh;
        max-height: 80svh;
        // height: 80svh;
      }
      .notice-board-image-only {
        aspect-ratio: 4 / 5;
        min-height: 80svh;
        max-height: 80svh;
        height: 80svh;
      }
      .notice-board-full-image {
        max-height: 34dvh;
      }
    }
  `;
  let initialized = false;
  let queue = [];
  let queueIndex = 0;
  let overlay = null;
  let panel = null;
  let currentNotice = null;
  let previousFocus = null;
  let dismissed = [];
  let dismissedKeys = new Set();

  function init() {
    if (initialized) return;
    initialized = true;
    dismissed = readDismissed();
    dismissedKeys = new Set();
    dismissed.forEach((id) => {
      const key = idKey(id);
      if (key) dismissedKeys.add(key);
    });
    loadNotices();
  }

  async function loadNotices() {
    try {
      const response = await fetch(ENDPOINT, {
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "X-Site-Api-Key": API_KEY,
        },
      });
      if (!response.ok) return;
      const payload = await response.json();
      const notices = extractNotices(payload)
        .filter(isRenderable)
        .filter(isNotDismissed);
      if (!notices.length || !document.body) return;
      queue = notices;
      queueIndex = 0;
      previousFocus = document.activeElement;
      document.body.classList.add("notice-board-open");
      if (!createOverlay()) {
        document.body.classList.remove("notice-board-open");
        return;
      }
      renderCurrent();
    } catch {
      return;
    }
  }

  function extractNotices(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || payload.success === false) return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data;
    }
    return [];
  }

  function isRenderable(notice) {
    if (!notice || typeof notice !== "object") return false;
    if (notice.type === "full") return true;
    if (notice.type === "image_only") {
      const { desktop, mobile } = getWebImageUrls(notice);
      return Boolean(desktop || mobile);
    }
    return false;
  }

  function isNotDismissed(notice) {
    const key = idKey(notice && notice.id);
    return Boolean(key) && !dismissedKeys.has(key);
  }

  function getText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(getText).filter(Boolean).join("\n");
    }
    if (typeof value === "object") {
      if (value.start_date || value.end_date) {
        return [value.start_date, value.end_date]
          .map(getText)
          .filter(Boolean)
          .join(" – ");
      }
      return getText(value.label || value.text || value.value || "");
    }
    return "";
  }

  function getWebImageUrls(notice) {
    return {
      desktop:
        resolveImageUrl(notice.web_banner_image_url) ||
        resolveImageUrl(notice.web_banner_image),
      mobile:
        resolveImageUrl(notice.web_mobile_banner_image_url) ||
        resolveImageUrl(notice.web_mobile_banner_image),
    };
  }

  function resolveImageUrl(value) {
    const path = getText(value);
    if (!path) return "";
    try {
      const url = new URL(path, BASE_URL);
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function idKey(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function isDismissible(value) {
    return value === true || value === 1 || value === "1" || value === "true";
  }

  function readDismissed() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function recordDismissed(id) {
    const key = idKey(id);
    if (!key || dismissedKeys.has(key)) return;
    dismissed.push(id);
    dismissedKeys.add(key);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    } catch {
      return;
    }
  }

  function createOverlay() {
    if (!document.body || !document.head) return;
    if (!document.getElementById("notice-board-styles")) {
      const style = document.createElement("style");
      style.id = "notice-board-styles";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    overlay = document.createElement("div");
    overlay.className = "notice-board-overlay";
    overlay.setAttribute("role", "presentation");
    panel = document.createElement("section");
    panel.className = "notice-board-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("tabindex", "-1");
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.addEventListener("keydown", handleKeydown, true);
    return true;
  }

  function renderCurrent() {
    currentNotice = queue[queueIndex];
    if (!currentNotice || !panel) return;
    panel.textContent = "";
    panel.className =
      currentNotice.type === "image_only"
        ? "notice-board-panel notice-board-image-only-panel"
        : "notice-board-panel notice-board-full-panel";
    panel.removeAttribute("aria-label");
    panel.removeAttribute("aria-labelledby");
    panel.removeAttribute("aria-describedby");
    panel.setAttribute("tabindex", "-1");
    const dismissible = isDismissible(currentNotice.is_dismissible);
    if (currentNotice.type === "image_only") {
      renderImageNotice(currentNotice);
    } else {
      renderFullNotice(currentNotice);
    }
    if (dismissible) {
      panel.classList.add("has-close");
      const button = createCloseButton();
      panel.appendChild(button);
      button.focus();
    } else {
      panel.focus();
    }
  }

  function renderFullNotice(notice) {
    const layout = document.createElement("div");
    layout.className = "notice-board-full-layout";
    const imageUrl =
      resolveImageUrl(notice.image_url) || resolveImageUrl(notice.image);
    const hasTextContent = Boolean(
      getText(notice.title) ||
      getText(notice.subtitle) ||
      getText(notice.display_date_range) ||
      getText(notice.message),
    );
    if (imageUrl && !hasTextContent) {
      const content = document.createElement("div");
      content.className = "notice-board-image-only";
      const image = document.createElement("img");
      image.className = "notice-board-banner";
      image.src = imageUrl;
      image.alt = "Notice";
      image.loading = "eager";
      image.decoding = "async";
      content.appendChild(image);
      panel.appendChild(content);
      panel.setAttribute("aria-label", "Notice");
      return;
    }
    if (imageUrl) {
      layout.classList.add("has-image");
      const media = document.createElement("div");
      media.className = "notice-board-full-image";
      const image = document.createElement("img");
      image.className = "notice-board-image";
      image.src = imageUrl;
      image.alt = getText(notice.title);
      image.loading = "eager";
      image.decoding = "async";
      media.appendChild(image);
      layout.appendChild(media);
    }
    const content = document.createElement("div");
    content.className = "notice-board-full";
    const title = document.createElement("h2");
    title.id = "notice-board-title";
    title.className = "notice-board-title";
    title.textContent = getText(notice.title) || "Notice";
    content.appendChild(title);
    panel.setAttribute("aria-labelledby", title.id);
    const description = document.createElement("div");
    description.className = "notice-board-description";
    const subtitle = getText(notice.subtitle);
    const date = getText(notice.display_date_range);
    const message = getText(notice.message);
    if (subtitle) {
      const subtitleElement = document.createElement("p");
      subtitleElement.className = "notice-board-subtitle";
      subtitleElement.textContent = subtitle;
      description.appendChild(subtitleElement);
    }
    if (date) {
      const dateElement = document.createElement("p");
      dateElement.className = "notice-board-date";
      dateElement.textContent = date;
      description.appendChild(dateElement);
    }
    if (message) {
      const messageElement = document.createElement("p");
      messageElement.className = "notice-board-message";
      messageElement.textContent = message;
      description.appendChild(messageElement);
    }
    if (description.childNodes.length) {
      description.id = "notice-board-description";
      content.appendChild(description);
      panel.setAttribute("aria-describedby", description.id);
    }
    layout.appendChild(content);
    panel.appendChild(layout);
  }

  function renderImageNotice(notice) {
    const content = document.createElement("div");
    content.className = "notice-board-image-only";
    const { desktop, mobile } = getWebImageUrls(notice);
    const picture = document.createElement("picture");
    picture.className = "notice-board-banner-picture";
    if (mobile) {
      const source = document.createElement("source");
      source.setAttribute("media", "(max-width: 767px)");
      source.setAttribute("srcset", mobile);
      picture.appendChild(source);
    }
    const image = document.createElement("img");
    image.className = "notice-board-banner";
    image.src = desktop || mobile;
    image.alt = getText(notice.title) || "Notice";
    image.loading = "eager";
    image.decoding = "async";
    picture.appendChild(image);
    content.appendChild(picture);
    panel.appendChild(content);
    panel.setAttribute("aria-label", getText(notice.title) || "Notice");
  }

  function createCloseButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "notice-board-close";
    button.setAttribute("aria-label", "Dismiss notice");
    button.textContent = "×";
    button.addEventListener("click", dismissCurrent);
    return button;
  }

  function dismissCurrent() {
    if (!currentNotice || !isDismissible(currentNotice.is_dismissible)) {
      return;
    }
    recordDismissed(currentNotice.id);
    queueIndex += 1;
    if (queueIndex < queue.length) {
      renderCurrent();
      return;
    }
    destroyOverlay();
  }

  function destroyOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (document.body) document.body.classList.remove("notice-board-open");
    document.removeEventListener("keydown", handleKeydown, true);
    overlay = null;
    panel = null;
    currentNotice = null;
    queue = [];
    queueIndex = 0;
    const focusTarget = previousFocus;
    previousFocus = null;
    if (
      focusTarget &&
      typeof focusTarget.focus === "function" &&
      document.contains(focusTarget)
    ) {
      focusTarget.focus();
    }
  }

  function handleKeydown(event) {
    if (!panel) return;
    if (
      event.key === "Escape" &&
      currentNotice &&
      isDismissible(currentNotice.is_dismissible)
    ) {
      event.preventDefault();
      dismissCurrent();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.prototype.slice.call(
      panel.querySelectorAll(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ),
    );
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === panel)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
