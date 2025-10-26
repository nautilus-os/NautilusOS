let windows = {};
let zIndexCounter = 100;
let currentUsername = localStorage.getItem("nautilusOS_username") || "User";
let focusedWindow = null;
let fileSystem = {
  Photos: {},
  TextEditor: {
    "example.txt":
      "This is an example text file.\n\nYou can edit this file using the Text Editor app.\n\nTry creating your own files by:\n1. Opening the Text Editor\n2. Writing your content\n3. Clicking Save As and entering a filename\n\nHave fun exploring NautilusOS!",
  },
};
let currentPath = [];
let currentFile = null;
let settings = {
  use12Hour: true,
  showSeconds: false,
  showDesktopIcons: true,
};
let bootSelectedIndex = 0;
let snapSettings = null;
let snapOverlay = null;
let snapCandidate = null;
let snapTrackingWindow = null;
let snapKeyCapture = null;
let snapNewLayoutKeybind = "";
let snapNewLayoutInput = null;

let loginStartTime = localStorage.getItem("nautilusOS_bootTime");
if (!loginStartTime) {
  loginStartTime = Date.now();
  localStorage.setItem("nautilusOS_bootTime", loginStartTime);
} else {
  loginStartTime = parseInt(loginStartTime, 10);
}

let appliedThemeName = null;

function checkFileProtocol() {
   if (window.location.protocol === "file:") {
     showToast("This feature doesn't work on file:// protocol. Please run NautilusOS from a web server.", "fa-exclamation-triangle");
     return false;
   }
   return true;
}

function showToast(message, icon = "fa-info-circle") {
    console.log(`[TOAST LOG] ${new Date().toISOString()}: ${message} (icon: ${icon})`);
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";

    toast.innerHTML = `
               <i class="fas ${icon} toast-icon"></i>
               <div class="toast-message">${message}</div>
               <div class="toast-close" onclick="closeToast(this)">
                   <i class="fas fa-times"></i>
               </div>
           `;

    container.appendChild(toast);

    setTimeout(() => {
      closeToast(toast.querySelector(".toast-close"));
    }, 4000);

    addNotificationToHistory(message, icon);
}
function closeToast(btn) {
  const toast = btn.closest(".toast");
  toast.classList.add("hiding");
  setTimeout(() => {
    toast.remove();
  }, 300);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedBootChoice = localStorage.getItem("nautilusOS_bootChoice");
  if (savedBootChoice !== null) {
    bootSelectedIndex = parseInt(savedBootChoice, 10);
    selectBoot();
  }
});
const appMetadata = {
  files: { name: "Files", icon: "fa-folder", preinstalled: true },
  terminal: { name: "Terminal", icon: "fa-terminal", preinstalled: true },
  settings: { name: "Settings", icon: "fa-cog", preinstalled: true },
  editor: { name: "Text Editor", icon: "fa-edit", preinstalled: true },
  music: { name: "Music", icon: "fa-music", preinstalled: true },
  photos: { name: "Photos", icon: "fa-images", preinstalled: true },
  help: { name: "Help", icon: "fa-question-circle", preinstalled: true },
  whatsnew: { name: "What's New", icon: "fa-star", preinstalled: true },
  appstore: { name: "App Store", icon: "fa-store", preinstalled: true },
  calculator: { name: "Calculator", icon: "fa-calculator", preinstalled: true },
  browser: { name: "Nautilus Browser", icon: "fa-globe", preinstalled: true },
  cloaking: { name: "Cloaking", icon: "fa-mask", preinstalled: true },
  achievements: { name: "Achievements", icon: "fa-trophy", preinstalled: true },
  "startup-apps": {
    name: "Startup Apps",
    icon: "fa-rocket",
    preinstalled: false,
  },
  "task-manager": {
    name: "Task Manager",
    icon: "fa-tasks",
    preinstalled: false,
  },
  "snap-manager": {
    name: "Snap Manager",
    icon: "fa-border-all",
    preinstalled: false,
  },
};

function getDefaultSnapSettings() {
  return {
    enabled: false,
    highlightColor: "#3b82f6",
    layouts: [
      {
        id: "edge-left",
        name: "Left Half",
        x: 0,
        y: 0,
        width: 50,
        height: 100,
        trigger: "edge-left",
        keybind: "Ctrl+Alt+ArrowLeft",
        builtin: true,
      },
      {
        id: "edge-right",
        name: "Right Half",
        x: 50,
        y: 0,
        width: 50,
        height: 100,
        trigger: "edge-right",
        keybind: "Ctrl+Alt+ArrowRight",
        builtin: true,
      },
      {
        id: "edge-top",
        name: "Top Half",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        trigger: "edge-top",
        keybind: "Ctrl+Alt+ArrowUp",
        builtin: true,
      },
      {
        id: "edge-bottom",
        name: "Bottom Half",
        x: 0,
        y: 50,
        width: 100,
        height: 50,
        trigger: "edge-bottom",
        keybind: "Ctrl+Alt+ArrowDown",
        builtin: true,
      },
      {
        id: "edge-top-left",
        name: "Top Left Quarter",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        trigger: "edge-top-left",
        keybind: "",
        builtin: true,
      },
      {
        id: "edge-top-right",
        name: "Top Right Quarter",
        x: 50,
        y: 0,
        width: 50,
        height: 50,
        trigger: "edge-top-right",
        keybind: "",
        builtin: true,
      },
      {
        id: "edge-bottom-left",
        name: "Bottom Left Quarter",
        x: 0,
        y: 50,
        width: 50,
        height: 50,
        trigger: "edge-bottom-left",
        keybind: "",
        builtin: true,
      },
      {
        id: "edge-bottom-right",
        name: "Bottom Right Quarter",
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        trigger: "edge-bottom-right",
        keybind: "",
        builtin: true,
      },
    ],
  };
}

const snapTriggerOptions = [
  { value: "keyboard", label: "Keyboard Only" },
  { value: "edge-left", label: "Left Edge" },
  { value: "edge-right", label: "Right Edge" },
  { value: "edge-top", label: "Top Edge" },
  { value: "edge-bottom", label: "Bottom Edge" },
  { value: "edge-top-left", label: "Top Left Corner" },
  { value: "edge-top-right", label: "Top Right Corner" },
  { value: "edge-bottom-left", label: "Bottom Left Corner" },
  { value: "edge-bottom-right", label: "Bottom Right Corner" },
];

function ensureSnapSettingsDefaults() {
  const defaults = getDefaultSnapSettings();
  if (!snapSettings) {
    snapSettings = defaults;
    return;
  }

  if (typeof snapSettings.enabled !== "boolean") {
    snapSettings.enabled = defaults.enabled;
  }

  if (!snapSettings.highlightColor) {
    snapSettings.highlightColor = defaults.highlightColor;
  }

  if (!Array.isArray(snapSettings.layouts)) {
    snapSettings.layouts = [];
  }

  const existingMap = new Map();
  snapSettings.layouts.forEach((layout) => {
    existingMap.set(layout.id, layout);
  });

  defaults.layouts.forEach((layout) => {
    if (existingMap.has(layout.id)) {
      const current = existingMap.get(layout.id);
      current.id = layout.id;
      current.trigger = layout.trigger;
      current.builtin = true;
      if (typeof current.x !== "number") current.x = layout.x;
      if (typeof current.y !== "number") current.y = layout.y;
      if (typeof current.width !== "number") current.width = layout.width;
      if (typeof current.height !== "number") current.height = layout.height;
      if (typeof current.name !== "string" || !current.name) {
        current.name = layout.name;
      }
      if (typeof current.keybind !== "string") {
        current.keybind = layout.keybind;
      }
    } else {
      snapSettings.layouts.push({ ...layout });
    }
  });

  snapSettings.layouts = snapSettings.layouts.map((layout) => {
    return {
      ...layout,
      x: typeof layout.x === "number" ? layout.x : parseFloat(layout.x) || 0,
      y: typeof layout.y === "number" ? layout.y : parseFloat(layout.y) || 0,
      width:
        typeof layout.width === "number"
          ? layout.width
          : parseFloat(layout.width) || 50,
      height:
        typeof layout.height === "number"
          ? layout.height
          : parseFloat(layout.height) || 50,
      keybind: layout.keybind || "",
      trigger: layout.trigger || "",
      name: layout.name || "Layout",
      builtin: !!layout.builtin,
    };
  });
}

function loadSnapSettings() {
  const saved = localStorage.getItem("nautilusOS_snapSettings");
  if (saved) {
    try {
      snapSettings = JSON.parse(saved);
    } catch (e) {
      snapSettings = null;
    }
  }
  ensureSnapSettingsDefaults();
}

function saveSnapSettings() {
  if (!snapSettings) return;
  localStorage.setItem("nautilusOS_snapSettings", JSON.stringify(snapSettings));
}

function initializeSnapOverlay() {
  if (snapOverlay) return;
  const desktop = document.getElementById("desktop");
  if (!desktop) return;
  snapOverlay = document.createElement("div");
  snapOverlay.className = "snap-overlay";
  desktop.appendChild(snapOverlay);
  updateSnapOverlayStyles();
}

function updateSnapOverlayStyles() {
  if (!snapOverlay || !snapSettings) return;
  const fill = hexToRgba(snapSettings.highlightColor || "#3b82f6", 0.35);
  const border = hexToRgba(snapSettings.highlightColor || "#3b82f6", 0.6);
  snapOverlay.style.background = fill;
  snapOverlay.style.borderColor = border;
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(59, 130, 246, ${alpha})`;
  let value = hex.replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6) {
    return `rgba(59, 130, 246, ${alpha})`;
  }
  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hideSnapPreview() {
  if (!snapOverlay) return;
  snapOverlay.classList.remove("visible");
  snapOverlay.classList.remove("animate");
  snapOverlay.style.width = "0px";
  snapOverlay.style.height = "0px";
  snapCandidate = null;
  snapTrackingWindow = null;
}

function showSnapPreview(layout) {
  if (!snapOverlay || !layout) return;
  const width = (window.innerWidth * layout.width) / 100;
  const height = (window.innerHeight * layout.height) / 100;
  const left = (window.innerWidth * layout.x) / 100;
  const top = (window.innerHeight * layout.y) / 100;
  snapOverlay.style.width = width + "px";
  snapOverlay.style.height = height + "px";
  snapOverlay.style.left = left + "px";
  snapOverlay.style.top = top + "px";
  snapOverlay.classList.add("visible");
  snapOverlay.classList.add("animate");
}

function detectEdgeTrigger(x, y) {
  const edgeThreshold = Math.max(40, window.innerWidth * 0.02);
  const topThreshold = Math.max(40, window.innerHeight * 0.02);
  const nearLeft = x <= edgeThreshold;
  const nearRight = x >= window.innerWidth - edgeThreshold;
  const nearTop = y <= topThreshold;
  const nearBottom = y >= window.innerHeight - topThreshold;

  if (nearTop && nearLeft) return "edge-top-left";
  if (nearTop && nearRight) return "edge-top-right";
  if (nearBottom && nearLeft) return "edge-bottom-left";
  if (nearBottom && nearRight) return "edge-bottom-right";
  if (nearTop) return "edge-top";
  if (nearBottom) return "edge-bottom";
  if (nearLeft) return "edge-left";
  if (nearRight) return "edge-right";
  return null;
}

function findSnapLayoutByTrigger(trigger) {
  if (!snapSettings || !trigger) return null;
  const layouts = snapSettings.layouts.slice().sort((a, b) => {
    if (a.builtin === b.builtin) return 0;
    return a.builtin ? 1 : -1;
  });
  for (let layout of layouts) {
    if (layout.trigger === trigger) {
      return layout;
    }
  }
  return null;
}

function determineSnapCandidate(x, y) {
  const trigger = detectEdgeTrigger(x, y);
  if (!trigger) return null;
  return findSnapLayoutByTrigger(trigger);
}

function applySnapLayout(element, layout) {
  const width = (window.innerWidth * layout.width) / 100;
  const height = (window.innerHeight * layout.height) / 100;
  const left = (window.innerWidth * layout.x) / 100;
  const top = (window.innerHeight * layout.y) / 100;
  element.style.width = width + "px";
  element.style.height = height + "px";
  element.style.left = left + "px";
  element.style.top = top + "px";
  element.dataset.maximized = "false";
  element.style.display = "block";
  element.classList.remove("minimized");
  focusWindow(element);
}

function updateSnapPreview(clientX, clientY, element) {
  if (!snapSettings || !snapSettings.enabled) return;
  if (!snapOverlay) return;
  const layout = determineSnapCandidate(clientX, clientY);
  if (layout) {
    snapCandidate = layout;
    snapTrackingWindow = element;
    showSnapPreview(layout);
  } else {
    hideSnapPreview();
  }
}

function finalizeSnap(element) {
  if (!snapSettings || !snapSettings.enabled) {
    hideSnapPreview();
    return;
  }
  if (snapTrackingWindow !== element || !snapCandidate) {
    hideSnapPreview();
    return;
  }
  const layout = snapCandidate;
  hideSnapPreview();
  applySnapLayout(element, layout);
  showSnapPreview(layout);
  setTimeout(() => {
    hideSnapPreview();
  }, 200);
}

function normalizeKeybind(text) {
  if (!text) return "";
  return text.replace(/\s+/g, "").toLowerCase();
}

function buildKeyComboFromEvent(event) {
  const parts = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.metaKey) parts.push("Meta");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  let key = event.key;
  if (key === " ") key = "Space";
  if (key === "Escape") return "";
  if (
    key === "Shift" ||
    key === "Control" ||
    key === "Alt" ||
    key === "Meta"
  ) {
    return "";
  }
  if (key.length === 1) {
    key = key.toUpperCase();
  } else {
    key = key.charAt(0).toUpperCase() + key.slice(1);
  }
  parts.push(key);
  return parts.join("+");
}

function handleSnapHotkeys(event) {
  if (!snapSettings || !snapSettings.enabled) return;
  if (!focusedWindow) return;
  if (!snapSettings.layouts || !snapSettings.layouts.length) return;
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable)
  ) {
    if (!snapKeyCapture) return;
  }
  const combo = buildKeyComboFromEvent(event);
  if (!combo) return;
  const normalized = normalizeKeybind(combo);
  const layout = snapSettings.layouts.find(
    (item) => normalizeKeybind(item.keybind) === normalized && item.keybind
  );
  if (!layout) return;
  const windowEl = windows[focusedWindow];
  if (!windowEl) return;
  event.preventDefault();
  applySnapLayout(windowEl, layout);
  showSnapPreview(layout);
  setTimeout(() => {
    hideSnapPreview();
  }, 200);
}

function getSnapTriggerLabel(trigger) {
  const option = snapTriggerOptions.find((item) => item.value === trigger);
  if (option) return option.label;
  return "Custom";
}

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSnapManager() {
  ensureSnapSettingsDefaults();
  const enabledClass = snapSettings.enabled ? "active" : "";
  const highlightColor =
    (snapSettings.highlightColor || "#3b82f6").toUpperCase();
  const layoutCards = snapSettings.layouts
    .map((layout) => {
      const triggerOptions = snapTriggerOptions
        .map((option) => {
          const selected = option.value === layout.trigger ? "selected" : "";
          return `<option value="${option.value}" ${selected}>${option.label}</option>`;
        })
        .join("");
      const layoutId = layout.id;
      const hotkeyValue = layout.keybind
        ? escapeHtml(layout.keybind)
        : "Not Set";
      const capturingClass = snapKeyCapture === layoutId ? " capturing" : "";
      const removeDisabled = layout.builtin ? "disabled" : "";
      const triggerDisabled = layout.builtin ? "disabled" : "";
      return `
            <div class="snap-layout-card" data-layout="${escapeHtml(layoutId)}">
                <div class="snap-layout-header">
                    <div class="snap-layout-title">
                        <input type="text" value="${escapeHtml(
                          layout.name
                        )}" onblur="handleSnapLayoutField('${layoutId}', 'name', this.value)">
                        <span>${getSnapTriggerLabel(layout.trigger)}</span>
                    </div>
                    <button class="snap-remove-btn" onclick="removeSnapLayout('${layoutId}')" ${removeDisabled}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="snap-layout-grid">
                    <div class="snap-field">
                        <label>X (%)</label>
                        <input type="number" min="0" max="100" step="1" value="${Math.round(layout.x * 100) / 100}" onchange="handleSnapLayoutField('${layoutId}', 'x', this.value)">
                    </div>
                    <div class="snap-field">
                        <label>Y (%)</label>
                        <input type="number" min="0" max="100" step="1" value="${Math.round(layout.y * 100) / 100}" onchange="handleSnapLayoutField('${layoutId}', 'y', this.value)">
                    </div>
                    <div class="snap-field">
                        <label>Width (%)</label>
                        <input type="number" min="10" max="100" step="1" value="${Math.round(layout.width * 100) / 100}" onchange="handleSnapLayoutField('${layoutId}', 'width', this.value)">
                    </div>
                    <div class="snap-field">
                        <label>Height (%)</label>
                        <input type="number" min="10" max="100" step="1" value="${Math.round(layout.height * 100) / 100}" onchange="handleSnapLayoutField('${layoutId}', 'height', this.value)">
                    </div>
                </div>
                <div class="snap-layout-actions">
                    <select onchange="handleSnapTriggerChange('${layoutId}', this.value)" ${triggerDisabled}>
                        ${triggerOptions}
                    </select>
                    <div class="snap-hotkey-row">
                        <input type="text" class="snap-hotkey-input${capturingClass}" value="${hotkeyValue}" readonly onfocus="beginSnapKeyCapture('${layoutId}', this)" onkeydown="captureSnapHotkey(event, '${layoutId}', this)" onblur="endSnapKeyCapture('${layoutId}', this)">
                        <button class="snap-clear-btn" onclick="clearSnapHotkey('${layoutId}')" ${layout.keybind ? "" : "disabled"}>Clear</button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  const triggerOptions = snapTriggerOptions
    .map(
      (option) =>
        `<option value="${option.value}">${option.label}</option>`
    )
    .join("");

  return `
        <div class="snap-manager">
            <div class="snap-section snap-section-header">
                <div class="snap-section-title">
                    <i class="fas fa-border-all"></i>
                    <div>
                        <h2>Window Snapping</h2>
                        <p>Drag windows to the edges to snap them into place or use custom shortcuts.</p>
                    </div>
                </div>
                <div class="toggle-switch ${enabledClass}" onclick="toggleSnapEnabled()"></div>
            </div>
            <div class="snap-section">
                <div class="snap-section-row">
                    <div>
                        <h3>Highlight Color</h3>
                        <p>Select the accent color used for snap previews.</p>
                    </div>
                    <div class="snap-color-picker">
                        <input type="color" value="${highlightColor}" onchange="updateSnapHighlightColor(this.value)">
                        <span>${highlightColor}</span>
                    </div>
                </div>
            </div>
            <div class="snap-section">
                <div class="snap-section-heading">
                    <h3>Layouts</h3>
                    <p>Adjust existing snap zones or create new layouts.</p>
                </div>
                <div class="snap-layout-list">
                    ${layoutCards || '<div class="snap-empty">No layouts configured.</div>'}
                </div>
            </div>
            <div class="snap-section">
                <div class="snap-section-heading">
                    <h3>Create Layout</h3>
                    <p>Design a custom layout and assign a shortcut.</p>
                </div>
                <div class="snap-add-grid">
                    <input type="text" id="snapNewName" placeholder="Name">
                    <input type="number" id="snapNewX" placeholder="X (%)" min="0" max="100" value="0">
                    <input type="number" id="snapNewY" placeholder="Y (%)" min="0" max="100" value="0">
                    <input type="number" id="snapNewWidth" placeholder="Width (%)" min="10" max="100" value="50">
                    <input type="number" id="snapNewHeight" placeholder="Height (%)" min="10" max="100" value="50">
                    <select id="snapNewTrigger">
                        ${triggerOptions}
                    </select>
                    <div class="snap-hotkey-row">
                        <input type="text" id="snapNewHotkey" class="snap-hotkey-input" placeholder="Press shortcut" readonly onfocus="beginNewSnapKeyCapture(this)" onkeydown="captureNewSnapHotkey(event, this)" onblur="endNewSnapKeyCapture(this)">
                        <button class="snap-clear-btn" onclick="clearNewSnapHotkey()">Clear</button>
                    </div>
                    <button class="snap-add-btn" onclick="addSnapLayoutFromForm()">
                        <i class="fas fa-plus"></i> Add Layout
                    </button>
                </div>
            </div>
        </div>
    `;
}

function refreshSnapManagerWindow() {
  if (!windows["snap-manager"]) return;
  const content = windows["snap-manager"].querySelector(".window-content");
  if (!content) return;
  content.innerHTML = renderSnapManager();
}

function toggleSnapEnabled() {
  ensureSnapSettingsDefaults();
  snapSettings.enabled = !snapSettings.enabled;
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function updateSnapHighlightColor(value) {
  ensureSnapSettingsDefaults();
  if (!value) return;
  snapSettings.highlightColor = value;
  saveSnapSettings();
  updateSnapOverlayStyles();
  refreshSnapManagerWindow();
}

function handleSnapLayoutField(layoutId, field, value) {
  ensureSnapSettingsDefaults();
  const layout = snapSettings.layouts.find((item) => item.id === layoutId);
  if (!layout) return;
  if (field === "name") {
    layout.name = value.trim() || "Layout";
  } else {
    let parsed = parseFloat(value);
    if (isNaN(parsed)) parsed = 0;
    if (field === "width" || field === "height") {
      parsed = Math.min(100, Math.max(10, parsed));
    } else {
      parsed = Math.min(100, Math.max(0, parsed));
    }
    layout[field] = Math.round(parsed * 100) / 100;
  }
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function handleSnapTriggerChange(layoutId, trigger) {
  ensureSnapSettingsDefaults();
  const layout = snapSettings.layouts.find((item) => item.id === layoutId);
  if (!layout) return;
  layout.trigger = trigger;
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function beginSnapKeyCapture(layoutId, input) {
  input.dataset.originalValue = input.value;
  snapKeyCapture = layoutId;
  input.classList.add("capturing");
  input.value = "Press shortcut";
}

function captureSnapHotkey(event, layoutId, input) {
  if (snapKeyCapture !== layoutId) return;
  event.preventDefault();
  event.stopPropagation();
  const combo = buildKeyComboFromEvent(event);
  if (!combo && event.key !== "Escape") {
    return;
  }
  const layout = snapSettings.layouts.find((item) => item.id === layoutId);
  if (!layout) return;
  if (event.key === "Escape") {
    layout.keybind = "";
    input.value = "Not Set";
  } else {
    layout.keybind = combo;
    input.value = combo;
  }
  input.dataset.originalValue = input.value;
  snapKeyCapture = null;
  input.classList.remove("capturing");
  input.blur();
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function endSnapKeyCapture(layoutId, input) {
  if (snapKeyCapture === layoutId) {
    const original =
      input && input.dataset ? input.dataset.originalValue : null;
    snapKeyCapture = null;
    if (input) {
      input.value = original && original.length ? original : "Not Set";
    }
  }
  if (input) {
    input.classList.remove("capturing");
  }
}

function clearSnapHotkey(layoutId) {
  ensureSnapSettingsDefaults();
  const layout = snapSettings.layouts.find((item) => item.id === layoutId);
  if (!layout) return;
  layout.keybind = "";
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function removeSnapLayout(layoutId) {
  ensureSnapSettingsDefaults();
  const layout = snapSettings.layouts.find((item) => item.id === layoutId);
  if (!layout || layout.builtin) return;
  snapSettings.layouts = snapSettings.layouts.filter(
    (item) => item.id !== layoutId
  );
  saveSnapSettings();
  refreshSnapManagerWindow();
}

function beginNewSnapKeyCapture(input) {
  input.dataset.originalValue = input.value;
  snapKeyCapture = "new";
  snapNewLayoutInput = input;
  input.classList.add("capturing");
  input.value = "Press shortcut";
}

function captureNewSnapHotkey(event, input) {
  if (snapKeyCapture !== "new") return;
  event.preventDefault();
  event.stopPropagation();
  const combo = buildKeyComboFromEvent(event);
  if (!combo && event.key !== "Escape") {
    return;
  }
  if (event.key === "Escape") {
    snapNewLayoutKeybind = "";
    input.value = "";
  } else {
    snapNewLayoutKeybind = combo;
    input.value = combo;
  }
  input.dataset.originalValue = input.value;
  snapKeyCapture = null;
  if (snapNewLayoutInput) {
    snapNewLayoutInput.classList.remove("capturing");
    snapNewLayoutInput.blur();
  }
}

function endNewSnapKeyCapture(input) {
  if (snapKeyCapture === "new") {
    const original =
      input && input.dataset ? input.dataset.originalValue : "";
    snapKeyCapture = null;
    if (!snapNewLayoutKeybind && input) {
      input.value = original;
    }
  }
  if (input) {
    input.classList.remove("capturing");
  }
  snapNewLayoutInput = null;
}

function clearNewSnapHotkey() {
  snapNewLayoutKeybind = "";
  const input = document.getElementById("snapNewHotkey");
  if (input) {
    input.value = "";
    input.classList.remove("capturing");
    input.dataset.originalValue = "";
  }
  snapKeyCapture = null;
  snapNewLayoutInput = null;
}

function generateSnapLayoutId(base) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

function addSnapLayoutFromForm() {
  ensureSnapSettingsDefaults();
  const nameInput = document.getElementById("snapNewName");
  const xInput = document.getElementById("snapNewX");
  const yInput = document.getElementById("snapNewY");
  const widthInput = document.getElementById("snapNewWidth");
  const heightInput = document.getElementById("snapNewHeight");
  const triggerSelect = document.getElementById("snapNewTrigger");
  if (
    !nameInput ||
    !xInput ||
    !yInput ||
    !widthInput ||
    !heightInput ||
    !triggerSelect
  ) {
    return;
  }

  const name = nameInput.value.trim() || "Custom Layout";
  let x = parseFloat(xInput.value);
  let y = parseFloat(yInput.value);
  let width = parseFloat(widthInput.value);
  let height = parseFloat(heightInput.value);

  if (isNaN(x)) x = 0;
  if (isNaN(y)) y = 0;
  if (isNaN(width)) width = 50;
  if (isNaN(height)) height = 50;

  x = Math.min(100, Math.max(0, x));
  y = Math.min(100, Math.max(0, y));
  width = Math.min(100, Math.max(10, width));
  height = Math.min(100, Math.max(10, height));

  const trigger = triggerSelect.value;
  const layoutId = generateSnapLayoutId("layout");
  snapSettings.layouts.push({
    id: layoutId,
    name: name,
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    trigger: trigger,
    keybind: snapNewLayoutKeybind || "",
    builtin: false,
  });

  nameInput.value = "";
  xInput.value = "0";
  yInput.value = "0";
  widthInput.value = "50";
  heightInput.value = "50";
  triggerSelect.value = "keyboard";
  clearNewSnapHotkey();

  saveSnapSettings();
  refreshSnapManagerWindow();
}
function updateUptime() {
  const elapsed = Math.floor((Date.now() - loginStartTime) / 1000 / 60);
  const uptimeEl = document.getElementById("uptime");

  if (achievementsData) {
    const now = Date.now();
    const elapsedMinutes =
      (now - achievementsData.lastUptimeUpdate) / 1000 / 60;
    achievementsData.totalUptime += elapsedMinutes;
    achievementsData.lastUptimeUpdate = now;

    const uptime1h = achievementsData.achievements["uptime-1h"];
    if (uptime1h) {
      uptime1h.progress = Math.min(
        achievementsData.totalUptime,
        uptime1h.target
      );
      if (
        achievementsData.totalUptime >= uptime1h.target &&
        !uptime1h.unlocked
      ) {
        unlockAchievement("uptime-1h");
      }
    }

    const uptime5h = achievementsData.achievements["uptime-5h"];
    if (uptime5h) {
      uptime5h.progress = Math.min(
        achievementsData.totalUptime,
        uptime5h.target
      );
      if (
        achievementsData.totalUptime >= uptime5h.target &&
        !uptime5h.unlocked
      ) {
        unlockAchievement("uptime-5h");
      }
    }

    const uptime10h = achievementsData.achievements["uptime-10h"];
    if (uptime10h) {
      uptime10h.progress = Math.min(
        achievementsData.totalUptime,
        uptime10h.target
      );
      if (
        achievementsData.totalUptime >= uptime10h.target &&
        !uptime10h.unlocked
      ) {
        unlockAchievement("uptime-10h");
      }
    }

    const uptime24h = achievementsData.achievements["uptime-24h"];
    if (uptime24h) {
      uptime24h.progress = Math.min(
        achievementsData.totalUptime,
        uptime24h.target
      );
      if (
        achievementsData.totalUptime >= uptime24h.target &&
        !uptime24h.unlocked
      ) {
        unlockAchievement("uptime-24h");
      }
    }

    saveAchievements();

    if (windows["achievements"]) {
      refreshAchievementsWindow();
    }
  }

  let uptimeString = "";
  if (elapsed < 60) {
    uptimeString = `${elapsed}m`;
  } else {
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    uptimeString = `${hours}h ${minutes}m`;
  }

  if (uptimeEl) {
    uptimeEl.textContent = uptimeString;
  }
}

function displayBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = "Unknown Browser";

  if (userAgent.indexOf("Firefox") > -1) {
    browser = "Mozilla Firefox";
  } else if (userAgent.indexOf("SamsungBrowser") > -1) {
    browser = "Samsung Internet";
  } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
    browser = "Microsoft Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
      browser = "Opera";
    } else if (userAgent.indexOf("Brave") > -1) {
      browser = "Brave";
    } else {
      browser = "Google Chrome";
    }
  } else if (userAgent.indexOf("Safari") > -1) {
    browser = "Apple Safari";
  }

  const browserInfoEl = document.getElementById("browserInfo");
  if (browserInfoEl) {
    browserInfoEl.textContent = browser;
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("passwordToggle");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

document.addEventListener("keydown", function (e) {
  const bootloader = document.getElementById("bootloader");
  if (
    !bootloader.classList.contains("hidden") &&
    document.getElementById("bootOptions").style.display !== "none"
  ) {
    const options = document.querySelectorAll(".boot-option");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      options[bootSelectedIndex].classList.remove("selected");
      bootSelectedIndex = (bootSelectedIndex + 1) % options.length;
      options[bootSelectedIndex].classList.add("selected");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      options[bootSelectedIndex].classList.remove("selected");
      bootSelectedIndex =
        (bootSelectedIndex - 1 + options.length) % options.length;
      options[bootSelectedIndex].classList.add("selected");
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectBoot();
    }
  }
});

function selectBoot() {
  localStorage.setItem("nautilusOS_bootChoice", bootSelectedIndex);

  document.getElementById("bootOptions").style.display = "none";
  document.querySelector(".boot-hint").style.display = "none";
  document.getElementById("bootLoading").classList.add("active");
  startBootSequence();
}

function startBootSequence() {
  console.log(`[BOOT LOG] ${new Date().toISOString()}: Starting boot sequence`);
  let messages;

  if (bootSelectedIndex === 1) {
    messages = [
      "Starting boot sequence for NautilusOS (Command Line)...",
      "Initializing command-line interface...",
      "Loading system utilities...",
      "- bash shell v5.1",
      "- core utilities",
      "- network stack",
      "Mounting file systems...",
      "Starting command-line interface...",
      "System ready! :D",
    ];
  } else {
    messages = [
      "Starting boot sequence for NautilusOS...",
      "Running startup functions...",
      "- startLoginClock()",
      "- updateLoginClock()",
      "- displayBrowserInfo()",
      "- updateUptime()",
      "- updateLoginGreeting()",
      "- registerSW()",
      "- ./build.py",
      "Finished running startup functions.",
      "Fetching icons from https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      "Starting graphical user interface...",
      "System ready! :D",
    ];
  }

  const messagesContainer = document.getElementById("bootMessages");
  const loadingBar = document.getElementById("loadingBar");
  let progress = 0;

  messages.forEach((msg, index) => {
    setTimeout(() => {
      const msgEl = document.createElement("div");
      msgEl.className = "boot-message";
      msgEl.textContent = `[OK] ${msg}`;
      messagesContainer.appendChild(msgEl);

      progress = ((index + 1) / messages.length) * 100;
      loadingBar.style.width = progress + "%";

      if (index === messages.length - 1) {
        console.log(`[BOOT LOG] ${new Date().toISOString()}: Boot sequence complete, hiding bootloader`);
        setTimeout(() => {
          const bootloader = document.getElementById("bootloader");
          bootloader.classList.add("hidden");

          if (bootSelectedIndex === 1) {
            setTimeout(() => {
              const cliMode = document.getElementById("commandLineMode");
              cliMode.classList.add("active");
              const cliInput = document.getElementById("cliInput");
              if (cliInput) cliInput.focus();
            }, 500);
          } else {
            const setupComplete = localStorage.getItem(
              "nautilusOS_setupComplete"
            );

            if (!setupComplete) {
              setTimeout(() => {
                const setup = document.getElementById("setup");
                setup.style.display = "flex";
                setTimeout(() => {
                  setup.style.opacity = "1";
                }, 50);
              }, 500);
            } else {
              setTimeout(() => {
                console.log(`[BOOT LOG] ${new Date().toISOString()}: Showing login screen`);
                const savedUsername = localStorage.getItem(
                  "nautilusOS_username"
                );
                if (savedUsername) {
                  document.getElementById("username").value = savedUsername;
                }
                const login = document.getElementById("login");
                login.classList.add("active");
                startLoginClock();
                displayBrowserInfo();
                updateLoginGreeting();
                updateLoginScreen();
              }, 500);
            }
          }
        }, 1200);
      }
    }, index * 250);
  });
}

function generateFileTree(fs, prefix = "", isLast = true) {
  let result = "";
  const entries = Object.keys(fs);

  entries.forEach((entry, index) => {
    const isLastEntry = index === entries.length - 1;
    const connector = isLastEntry ? "└── " : "├── ";
    const isFolder = typeof fs[entry] === "object";
    const icon = isFolder
      ? '<i class="fas fa-folder"></i>'
      : '<i class="fas fa-file-alt"></i>';
    result += `${prefix}${connector}${icon} ${entry}\n`;

    if (isFolder && Object.keys(fs[entry]).length > 0) {
      const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
      result += generateFileTree(fs[entry], newPrefix, isLastEntry);
    }
  });

  return result;
}

function handleCLIInput(e) {
  if (e.key === "Enter") {
    const input = e.target;
    const command = input.value.trim();
    const terminal = document.getElementById("cliTerminal");

    const cmdLine = document.createElement("div");
    cmdLine.className = "cli-line";
    cmdLine.innerHTML = `<span class="cli-prompt">user@nautilusos:~$ </span>${command}`;
    terminal.insertBefore(cmdLine, terminal.lastElementChild);

    const output = document.createElement("div");
    output.className = "cli-line";

    if (command === "help") {
      output.innerHTML =
        "Available commands:<br>" +
        "help - Show this list<br>" +
        "ls - List files in file system<br>" +
        "apps - List installed applications<br>" +
        "themes - List installed themes<br>" +
        "clear - Clear terminal<br>" +
        "date - Show current date and time<br>" +
        "whoami - Display current username<br>" +
        "reset-boot - Reset bootloader preferences<br>" +
        "echo [text] - Display text<br>" +
        "gui - Switch to graphical mode";
    } else if (command === "ls") {
      const tree = ".\n" + generateFileTree(fileSystem);
      output.innerHTML =
        '<pre style="margin: 0; font-family: inherit;">' + tree + "</pre>";
    } else if (command === "apps") {
      const appList = [
        "Files - File manager and explorer",
        "Terminal - Command line interface",
        "Browser - Web browser",
        "Settings - System settings",
        "Text Editor - Edit text files",
        "Music - Music player",
        "Photos - Photo viewer",
        "Help - System help and documentation",
        "What's New - View latest features",
        "App Store - Browse and install apps/themes",
      ];
      output.innerHTML =
        '<span style="color: var(--accent);">Installed Applications:</span><br>' +
        appList.map((app) => `  • ${app}`).join("<br>");
    } else if (command === "themes") {
      const themeList = ["Dark Theme (Default)"];
      if (installedThemes.length > 0) {
        installedThemes.forEach((theme) => {
          themeList.push(
            `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`
          );
        });
      }
      output.innerHTML =
        '<span style="color: var(--accent);">Installed Themes:</span><br>' +
        themeList.map((theme) => `  • ${theme}`).join("<br>");
    } else if (command === "whoami") {
      output.textContent = "User";
    } else if (command === "reset-boot") {
      localStorage.removeItem("nautilusOS_bootChoice");
      output.innerHTML =
        '<span style="color: #4ade80;">✓ Bootloader preferences reset successfully</span><br>' +
        "The bootloader menu will appear on next page reload.";
    } else if (command === "clear") {
      terminal.innerHTML = `
                      <div class="cli-line" style="color: var(--accent);">NautilusOS Command Line Interface v1.0</div>
                      <div class="cli-line" style="color: #888; margin-bottom: 1rem;">Type 'help' for available commands, 'gui' to switch to graphical mode</div>
                  `;
    } else if (command === "date") {
      output.textContent = new Date().toString();
    } else if (command === "gui") {
      output.textContent = "Switching to graphical mode...";
      terminal.insertBefore(output, terminal.lastElementChild);
      setTimeout(() => {
        const cliMode = document.getElementById("commandLineMode");
        cliMode.style.opacity = "0";
        setTimeout(() => {
          cliMode.classList.remove("active");
          cliMode.style.opacity = "1";

          const setupComplete = localStorage.getItem(
            "nautilusOS_setupComplete"
          );

          if (!setupComplete) {
            const setup = document.getElementById("setup");
            setup.style.display = "flex";
            setTimeout(() => {
              setup.style.opacity = "1";
            }, 50);
          } else {
            const savedUsername = localStorage.getItem("nautilusOS_username");
            if (savedUsername) {
              document.getElementById("username").value = savedUsername;
            }
            const login = document.getElementById("login");
            login.classList.add("active");
            startLoginClock();
            displayBrowserInfo();
            updateLoginGreeting();
          }
        }, 500);
      }, 500);
      input.value = "";
      terminal.scrollTop = terminal.scrollHeight;
      return;
    } else if (command.startsWith("echo ")) {
      output.textContent = command.substring(5);
    } else if (command) {
      output.innerHTML = `<span style="color: #ef4444;">Command not found: ${command}</span><br>Type 'help' for available commands.`;
    }

    if (command !== "clear" && command) {
      terminal.insertBefore(output, terminal.lastElementChild);
    }

    input.value = "";
    terminal.scrollTop = terminal.scrollHeight;
  }
}

function startLoginClock() {
  function updateLoginClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");

    let timeStr = "";
    if (settings.use12Hour) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      timeStr = `${hours}:${minutes} ${ampm}`;
    } else {
      hours = String(hours).padStart(2, "0");
      timeStr = `${hours}:${minutes}`;
    }

    document.getElementById("loginClock").textContent = timeStr;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dateStr = `${days[now.getDay()]}, ${
      months[now.getMonth()]
    } ${now.getDate()}`;
    document.getElementById("loginDate").textContent = dateStr;
  }
  updateLoginClock();
  setInterval(updateLoginClock, 1000);
  setInterval(updateUptime, 60000);
  updateUptime();
}

function login() {
  console.log(`[LOGIN LOG] ${new Date().toISOString()}: Login function called`);
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const savedUsername = localStorage.getItem("nautilusOS_username");
  const savedPassword = localStorage.getItem("nautilusOS_password");
  const isPasswordless =
    localStorage.getItem("nautilusOS_isPasswordless") === "true";

  if (!username) {
    showToast("Please enter username", "fa-exclamation-circle");
    return;
  }

  if (username !== savedUsername) {
    showToast("Invalid username", "fa-exclamation-circle");
    return;
  }

  if (isPasswordless) {
  } else {
    if (!password) {
      showToast("Please enter password", "fa-exclamation-circle");
      return;
    }

    const hashedPassword = hashPassword(password);
    if (hashedPassword !== savedPassword) {
      showToast("Invalid password", "fa-exclamation-circle");
      return;
    }
  }

  currentUsername = username;
  document.getElementById("displayUsername").textContent = username;

  if (username.toLowerCase() === "dinguschan" || username.toLowerCase() === "$xor" || username.toLowerCase() === "lanefiedler-731") {
    unlockEasterEgg("dev-mode");
  }

  showToast("Welcome back, " + username + "!", "fa-circle-check");

  unlockAchievement("first-login");

  checkNightOwl();

  const login = document.getElementById("login");
  const desktop = document.getElementById("desktop");

  console.log(`[LOGIN LOG] ${new Date().toISOString()}: Starting desktop transition`);
  login.style.opacity = "0";
  setTimeout(() => {
    login.classList.remove("active");
    login.style.display = "none";
    desktop.classList.add("active");

    setTimeout(() => {
      console.log(`[LOGIN LOG] ${new Date().toISOString()}: Desktop active, starting clock and initialization`);
        startClock();
  
        const iconsContainer = document.getElementById("desktopIcons");
        if (iconsContainer) {
          const installedIcons = iconsContainer.querySelectorAll(
            ".desktop-icon[data-app]"
          );
          installedIcons.forEach((icon) => {
            const appName = icon.getAttribute("data-app");
            if (installedApps.includes(appName)) {
              icon.remove();
            }
          });
  
          installedApps.forEach((appName) => {
            addDesktopIcon(appName);
          });
        }
  
        initDesktopIconDragging();
        initContextMenu();
        initScrollIndicator();
  
        updateStartMenu();
  
        // Show theme application toast after desktop loads
        if (appliedThemeName) {
          setTimeout(() => {
            showToast(`Applied ${appliedThemeName.charAt(0).toUpperCase() + appliedThemeName.slice(1)} theme!`, "fa-check-circle");
            appliedThemeName = null;
          }, 1000);
        }
  
        const showWhatsNew = localStorage.getItem("nautilusOS_showWhatsNew");
        if (showWhatsNew === null || showWhatsNew === "true") {
          console.log(`[LOGIN LOG] ${new Date().toISOString()}: Opening What's New app`);
          setTimeout(() => {
            openApp("whatsnew");
          }, 800);
        }
    }, 100);
  }, 500);
}
function startClock() {
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    let timeStr = "";
    if (settings.use12Hour) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      timeStr = `${hours}:${minutes}`;
      if (settings.showSeconds) timeStr += `:${seconds}`;
      timeStr += ` ${ampm}`;
    } else {
      hours = String(hours).padStart(2, "0");
      timeStr = `${hours}:${minutes}`;
      if (settings.showSeconds) timeStr += `:${seconds}`;
    }

    document.getElementById("clock").textContent = timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function toggleStartMenu() {
  const menu = document.getElementById("startMenu");
  menu.classList.toggle("active");
}

function updateTaskbarIndicators() {
  const appEntries = Object.entries(windows);
  let topApp = null;
  let topZ = 0;

  for (const [name, win] of appEntries) {
    const z = parseInt(win.style.zIndex || 0);
    if (z > topZ) {
      topZ = z;
      topApp = name;
    }
  }

  document.querySelectorAll(".taskbar-icon[data-app]").forEach((icon) => {
    const appName = icon.getAttribute("data-app");
    icon.classList.remove("active", "open");

    if (windows[appName]) {
      icon.classList.add("open");
      if (appName === topApp) {
        icon.classList.add("active");
      }
    }
  });
}

function addDynamicTaskbarIcon(appName, icon) {
  const existingIcon = document.querySelector(
    `.taskbar-icon[data-app="${appName}"]`
  );
  if (existingIcon) return;

  const pinnedApps = ["files", "terminal", "browser", "settings"];
  if (pinnedApps.includes(appName)) return;

  const taskbar = document.querySelector(".taskbar");

  const iconEl = document.createElement("div");
  iconEl.className = "taskbar-icon dynamic-icon";
  iconEl.setAttribute("data-app", appName);
  iconEl.setAttribute(
    "title",
    appName.charAt(0).toUpperCase() + appName.slice(1)
  );
  iconEl.innerHTML = `<i class="${icon}"></i>`;
  iconEl.onclick = () => {
    if (windows[appName]) {
      const win = windows[appName];
      if (win.style.display === "none") {
        win.style.display = "block";
        win.classList.remove("minimized");
      }
      focusWindow(win);
      focusedWindow = appName;
      updateTaskbarIndicators();
    }
  };

  const allIcons = taskbar.querySelectorAll(".taskbar-icon[data-app]");
  let lastPinnedIcon = null;
  allIcons.forEach((icn) => {
    const app = icn.getAttribute("data-app");
    if (pinnedApps.includes(app)) {
      lastPinnedIcon = icn;
    }
  });

  if (lastPinnedIcon) {
    lastPinnedIcon.parentNode.insertBefore(iconEl, lastPinnedIcon.nextSibling);
  } else {
    const firstDivider = taskbar.querySelector(".taskbar-divider");
    if (firstDivider) {
      firstDivider.parentNode.insertBefore(iconEl, firstDivider.nextSibling);
    }
  }

  updateTaskbarIndicators();
}

function removeDynamicTaskbarIcon(appName) {
  const pinnedApps = ["files", "terminal", "browser", "settings"];
  if (pinnedApps.includes(appName)) return;

  const icon = document.querySelector(
    `.taskbar-icon.dynamic-icon[data-app="${appName}"]`
  );
  if (icon) {
    icon.remove();
  }
}

function initDesktopIconDragging() {
  const gridSize = 100;
  const icons = document.querySelectorAll(".desktop-icon");

  function initializeIconPositions() {
    occupiedGridCells.clear();

    icons.forEach((icon) => {
      if (icon.style.position !== "absolute") {
        const rect = icon.getBoundingClientRect();
        const x = Math.round(rect.left / gridSize) * gridSize;
        const y = Math.round(rect.top / gridSize) * gridSize;
        occupiedGridCells.add(`${x},${y}`);
      } else {
        const x = Math.round(parseInt(icon.style.left) / gridSize) * gridSize;
        const y = Math.round(parseInt(icon.style.top) / gridSize) * gridSize;
        occupiedGridCells.add(`${x},${y}`);
      }
    });
  }

  initializeIconPositions();

  icons.forEach((icon) => {
    let offsetX, offsetY;
    let isDragging = false;
    let hasMoved = false;
    let originalX, originalY;
    let startX, startY;
    let dragTimeout;

    icon.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      const rect = icon.getBoundingClientRect();
      originalX = Math.round(rect.left / gridSize) * gridSize;
      originalY = Math.round(rect.top / gridSize) * gridSize;

      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
      hasMoved = false;
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      dragTimeout = setTimeout(() => {
        if (!hasMoved) return;

        occupiedGridCells.delete(`${originalX},${originalY}`);
        icon.classList.add("dragging");
        icon.style.position = "absolute";
        icon.style.zIndex = "1000";
        isDragging = true;
      }, 150);

      document.onmousemove = (ev) => {
        const deltaX = Math.abs(ev.clientX - startX);
        const deltaY = Math.abs(ev.clientY - startY);

        if (deltaX > 5 || deltaY > 5) {
          hasMoved = true;
        }

        if (!isDragging) return;

        let x = ev.clientX - offsetX;
        let y = ev.clientY - offsetY;

        x = Math.max(0, Math.min(window.innerWidth - icon.offsetWidth, x));
        y = Math.max(
          0,
          Math.min(window.innerHeight - icon.offsetHeight - 100, y)
        );

        icon.style.left = x + "px";
        icon.style.top = y + "px";
      };

      document.onmouseup = () => {
        clearTimeout(dragTimeout);

        if (isDragging) {
          let finalX =
            Math.round(parseInt(icon.style.left) / gridSize) * gridSize;
          let finalY =
            Math.round(parseInt(icon.style.top) / gridSize) * gridSize;

          let attempts = 0;
          while (
            occupiedGridCells.has(`${finalX},${finalY}`) &&
            attempts < 100
          ) {
            finalX += gridSize;
            if (finalX > window.innerWidth - icon.offsetWidth - gridSize) {
              finalX = 0;
              finalY += gridSize;
            }
            if (finalY > window.innerHeight - icon.offsetHeight - 100) {
              finalX = originalX;
              finalY = originalY;
              showToast(
                "No available space to place icon",
                "fa-exclamation-circle"
              );
              break;
            }
            attempts++;
          }

          finalX = Math.max(
            0,
            Math.min(window.innerWidth - icon.offsetWidth, finalX)
          );
          finalY = Math.max(
            0,
            Math.min(window.innerHeight - icon.offsetHeight - 100, finalY)
          );
          icon.style.left = finalX + "px";
          icon.style.top = finalY + "px";

          occupiedGridCells.add(`${finalX},${finalY}`);

          icon.classList.remove("dragging");
          icon.style.zIndex = "";
        } else if (!hasMoved) {
          if (!occupiedGridCells.has(`${originalX},${originalY}`)) {
            occupiedGridCells.add(`${originalX},${originalY}`);
          }
        }

        isDragging = false;
        hasMoved = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    });
  });
}
function createWindow(
  title,
  icon,
  content,
  width = 900,
  height = 600,
  appName = null,
  noPadding = false
) {
  if (appName && windows[appName]) {
    focusWindow(windows[appName]);
    return windows[appName];
  }

  const windowEl = document.createElement("div");
  windowEl.className = "window";
  windowEl.style.width = width + "px";
  windowEl.style.height = height + "px";
  windowEl.style.left =
    window.innerWidth / 2 - width / 2 + Math.random() * 50 + "px";
  windowEl.style.top =
    window.innerHeight / 2 - height / 2 - 30 + Math.random() * 20 + "px";
  windowEl.style.zIndex = ++zIndexCounter;

  const contentClass = noPadding
    ? "window-content"
    : "window-content has-padding";

  windowEl.innerHTML = `
              <div class="window-header">
                  <div class="window-title">
                      <i class="${icon}"></i>
                      <span>${title}</span>
                  </div>
                  <div class="window-controls">
                      <div class="window-btn" onclick="minimizeWindow(this)">
                          <i class="fas fa-minus"></i>
                      </div>
                      <div class="window-btn" onclick="maximizeWindow(this)">
                          <i class="fas fa-square"></i>
                      </div>
                      <div class="window-btn close" onclick="closeWindow(this, '${appName}')">
                          <i class="fas fa-times"></i>
                      </div>
                  </div>
              </div>
              <div class="${contentClass}">${content}</div>
              <div class="resize-handle"></div>
              <div class="resize-handle-top"></div>
              <div class="resize-handle-right"></div>
              <div class="resize-handle-bottom"></div>
              <div class="resize-handle-left"></div>
          `;

  if (appName) {
    windowEl.dataset.appIcon = icon;
    windowEl.dataset.appName = appName;
  }

  document.getElementById("desktop").appendChild(windowEl);
  makeDraggable(windowEl);

  if (appName !== "calculator") {
    makeResizable(windowEl);
  }

  if (appName) {
    windows[appName] = windowEl;
    focusedWindow = appName;
    addDynamicTaskbarIcon(appName, icon);
  }

  windowEl.addEventListener("mousedown", () => {
    focusWindow(windowEl);
    if (appName) {
      focusedWindow = appName;
      updateTaskbarIndicators();
    }
  });

  const windowCount = Object.keys(windows).length;
  if (windowCount >= 5) {
    unlockAchievement("multitasker");
  }

  const speedDemon = achievementsData.easterEggs["speed-demon"];
  if (speedDemon && !speedDemon.unlocked && speedDemon.trackingData) {
    const now = Date.now();
    if (!speedDemon.trackingData.windowOpenTimes) {
      speedDemon.trackingData.windowOpenTimes = [];
    }

    speedDemon.trackingData.windowOpenTimes.push(now);

    speedDemon.trackingData.windowOpenTimes =
      speedDemon.trackingData.windowOpenTimes.filter(
        (time) => now - time <= speedDemon.trackingData.timeWindow
      );

    if (
      speedDemon.trackingData.windowOpenTimes.length >=
      speedDemon.trackingData.threshold
    ) {
      unlockEasterEgg("speed-demon");
    }

    saveAchievements();
  }

  updateTaskbarIndicators();
  return windowEl;
}

function focusWindow(windowEl) {
  windowEl.style.zIndex = ++zIndexCounter;
}

function minimizeWindow(btn) {
  const window = btn.closest(".window");
  window.classList.add("minimized");
  setTimeout(() => {
    window.style.display = "none";
  }, 250);
}

function maximizeWindow(btn) {
  const window = btn.closest(".window");
  const icon = btn.querySelector("i");

  if (window.dataset.maximized === "true") {
    window.style.width = window.dataset.oldWidth;
    window.style.height = window.dataset.oldHeight;
    window.style.left = window.dataset.oldLeft;
    window.style.top = window.dataset.oldTop;
    window.dataset.maximized = "false";
    icon.classList.remove("fa-clone");
    icon.classList.add("fa-square");

    window.style.borderRadius = "12px";
    const header = window.querySelector(".window-header");
    if (header) header.style.borderRadius = "0";
  } else {
    window.dataset.oldWidth = window.style.width;
    window.dataset.oldHeight = window.style.height;
    window.dataset.oldLeft = window.style.left;
    window.dataset.oldTop = window.style.top;

    window.style.width = "100vw";
    window.style.height = "100vh";
    window.style.left = "0";
    window.style.top = "0";
    window.dataset.maximized = "true";
    icon.classList.remove("fa-square");
    icon.classList.add("fa-clone");

    window.style.borderRadius = "1px";
    const header = window.querySelector(".window-header");
    if (header) header.style.borderRadius = "1px";
  }
}

function closeWindow(btn, appName) {
  const window = btn.closest(".window");
  window.style.animation = "windowMinimize 0.25s ease forwards";
  setTimeout(() => {
    window.remove();
    if (appName && windows[appName]) {
      delete windows[appName];
      if (focusedWindow === appName) {
        focusedWindow = null;
      }
      removeDynamicTaskbarIcon(appName);
      updateTaskbarIndicators();
    }
  }, 250);
}

function minimizeWindowByAppName(appName) {
  if (!appName || !windows[appName]) return;
  const windowEl = windows[appName];
  const btn = windowEl.querySelector(".window-btn");
  if (btn) minimizeWindow(btn);
}

function maximizeWindowByAppName(appName) {
  if (!appName || !windows[appName]) return;
  const windowEl = windows[appName];
  const btn = windowEl.querySelectorAll(".window-btn")[1];
  if (btn) maximizeWindow(btn);
}

function closeWindowByAppName(appName) {
  if (!appName || !windows[appName]) return;
  const windowEl = windows[appName];
  const closeBtn = windowEl.querySelector(".window-btn.close");
  if (closeBtn) closeWindow(closeBtn, appName);
}

function makeDraggable(element) {
  const header = element.querySelector(".window-header");
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  let dragging = false;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.closest(".window-controls")) return;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    dragging = true;
    if (snapSettings && snapSettings.enabled) {
      snapTrackingWindow = element;
    } else {
      snapTrackingWindow = null;
    }
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    const newTop = element.offsetTop - pos2;
    const newLeft = element.offsetLeft - pos1;

    element.style.top =
      Math.max(0, Math.min(window.innerHeight - element.offsetHeight, newTop)) +
      "px";
    element.style.left =
      Math.max(0, Math.min(window.innerWidth - element.offsetWidth, newLeft)) +
      "px";
    if (dragging) {
      updateSnapPreview(e.clientX, e.clientY, element);
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (dragging) {
      finalizeSnap(element);
    }
    dragging = false;
  }
}

function makeResizable(element) {
  const handle = element.querySelector(".resize-handle");
  const handleTop = element.querySelector(".resize-handle-top");
  const handleRight = element.querySelector(".resize-handle-right");
  const handleBottom = element.querySelector(".resize-handle-bottom");
  const handleLeft = element.querySelector(".resize-handle-left");
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  handle.onmousedown = initResize;
  handleTop.onmousedown = initResizeTop;
  handleRight.onmousedown = initResizeRight;
  handleBottom.onmousedown = initResizeBottom;
  handleLeft.onmousedown = initResizeLeft;

  function initResize(e) {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(window.getComputedStyle(element).width, 10);
    startHeight = parseInt(window.getComputedStyle(element).height, 10);
    document.onmousemove = doResize;
    document.onmouseup = stopResize;
  }

  function doResize(e) {
    const newWidth = startWidth + e.clientX - startX;
    const newHeight = startHeight + e.clientY - startY;
    if (newWidth > 400) element.style.width = newWidth + "px";
    if (newHeight > 300) element.style.height = newHeight + "px";
  }

  function initResizeTop(e) {
    e.preventDefault();
    e.stopPropagation();
    startY = e.clientY;
    startHeight = parseInt(window.getComputedStyle(element).height, 10);
    startTop = element.offsetTop;
    document.onmousemove = doResizeTop;
    document.onmouseup = stopResize;
  }

  function doResizeTop(e) {
    const deltaY = e.clientY - startY;
    const newHeight = startHeight - deltaY;
    if (newHeight > 300) {
      element.style.height = newHeight + "px";
      element.style.top = startTop + deltaY + "px";
    }
  }

  function initResizeRight(e) {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX;
    startWidth = parseInt(window.getComputedStyle(element).width, 10);
    document.onmousemove = doResizeRight;
    document.onmouseup = stopResize;
  }

  function doResizeRight(e) {
    const newWidth = startWidth + e.clientX - startX;
    if (newWidth > 400) element.style.width = newWidth + "px";
  }

  function initResizeBottom(e) {
    e.preventDefault();
    e.stopPropagation();
    startY = e.clientY;
    startHeight = parseInt(window.getComputedStyle(element).height, 10);
    document.onmousemove = doResizeBottom;
    document.onmouseup = stopResize;
  }

  function doResizeBottom(e) {
    const newHeight = startHeight + e.clientY - startY;
    if (newHeight > 300) element.style.height = newHeight + "px";
  }

  function initResizeLeft(e) {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX;
    startWidth = parseInt(window.getComputedStyle(element).width, 10);
    startLeft = element.offsetLeft;
    document.onmousemove = doResizeLeft;
    document.onmouseup = stopResize;
  }

  function doResizeLeft(e) {
    const deltaX = e.clientX - startX;
    const newWidth = startWidth - deltaX;
    if (newWidth > 400) {
      element.style.width = newWidth + "px";
      element.style.left = startLeft + deltaX + "px";
    }
  }

  function stopResize() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

function openFile(filename) {
  let current = getFileSystemAtPath(currentPath);
  if (!current) return;

  const item = current[filename];

  if (typeof item === "object") {
    currentPath.push(filename);
    if (windows["files"]) {
      updateFileExplorer();
    }
  } else if (typeof item === "string") {
    if (item.startsWith("blob:")) {
      if (!windows["photos"]) {
        openApp("photos");
      } else {
        focusWindow(windows["photos"]);
      }
    } else {
      currentFile = filename;
      openApp("editor", item, filename);
    }
  }
}
async function signOut() {
  const confirmed = await confirm("Are you sure you want to shut down?");
  if (confirmed) {
    const userAgent = navigator.userAgent.toLowerCase();
    let newTabUrl = "https://www.google.com";

    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      newTabUrl = "chrome://newtab";
    } else if (userAgent.includes("firefox")) {
      newTabUrl = "about:newtab";
    } else if (userAgent.includes("edg")) {
      newTabUrl = "edge://newtab";
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      newTabUrl = "about:blank";
    } else if (userAgent.includes("opera") || userAgent.includes("opr")) {
      newTabUrl = "opera://startpage";
    }

    try {
      window.location.href = newTabUrl;
    } catch (e) {
      window.location.href = "https://www.google.com";
    }

    setTimeout(() => {
      if (document.hasFocus()) {
        window.location.href = "https://www.google.com";
      }
    }, 500);
  }
}
function saveFile() {
  const filenameInput = document.getElementById("editorFilename");
  const textarea = document.querySelector(".editor-textarea");

  if (!filenameInput || !textarea) return;

  let filename = filenameInput.value.trim();
  if (!filename) {
    showToast("Please enter a filename", "fa-exclamation-circle");
    return;
  }

  if (!filename.endsWith(".txt")) {
    filename += ".txt";
  }

  currentFile = filename;
  let current = getFileSystemAtPath(currentPath);
  if (!current) current = fileSystem;

  current[filename] = textarea.value;
  filenameInput.value = filename;
  showToast("File saved: " + filename, "fa-check-circle");

  const fileCreator = achievementsData.achievements["file-creator"];
  if (!fileCreator.unlocked) {
    fileCreator.progress = (fileCreator.progress || 0) + 1;
    if (fileCreator.progress >= fileCreator.target) {
      unlockAchievement("file-creator");
    }
    saveAchievements();
  }
  if (windows["files"]) {
    updateFileExplorer();
  }
}

function saveAsNewFile() {
  const textarea = document.querySelector(".editor-textarea");
  if (!textarea) return;

  const filename = prompt("Save as new file (filename.txt):");
  if (!filename) return;

  const finalName = filename.endsWith(".txt") ? filename : filename + ".txt";

  let current = getFileSystemAtPath(currentPath);
  if (!current) current = fileSystem;

  current[finalName] = textarea.value;
  currentFile = finalName;

  const filenameInput = document.getElementById("editorFilename");
  if (filenameInput) filenameInput.value = finalName;

  showToast("File saved as: " + finalName, "fa-check-circle");

  if (windows["files"]) {
    updateFileExplorer();
  }
}

function saveToDevice() {
  const textarea = document.querySelector(".editor-textarea");
  const filenameInput = document.getElementById("editorFilename");
  if (!textarea) return;

  let filename = filenameInput ? filenameInput.value.trim() : "untitled.txt";
  if (!filename) filename = "untitled.txt";
  if (!filename.endsWith(".txt")) filename += ".txt";

  const blob = new Blob([textarea.value], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showToast("File downloaded: " + filename, "fa-download");
}

function resetBootloader() {
  localStorage.removeItem("nautilusOS_bootChoice");
  showToast(
    "Boot preference cleared. The bootloader will appear on next reload.",
    "fa-redo"
  );
}

function openApp(appName, editorContent = "", filename = "") {
  const menu = document.getElementById("startMenu");
  if (menu.classList.contains("active")) {
    toggleStartMenu();
  }
  if (appName === "settings" && windows["settings"]) {
    closeWindow(
      windows["settings"].querySelector(".window-btn.close"),
      "settings"
    );
  }
  const sameBackgroundSetting = localStorage.getItem(
    "nautilusOS_useSameBackground"
  );
  const useSameBackground =
    sameBackgroundSetting === null || sameBackgroundSetting === "true";
  const hasWallpaper = !!localStorage.getItem("nautilusOS_wallpaper");
  const hasLoginWallpaper = !!localStorage.getItem(
    "nautilusOS_loginBackground"
  );
  const hasProfilePicture = !!localStorage.getItem(
    "nautilusOS_profilePicture"
  );
  const apps = {
    files: {
      title: "Files",
      icon: "fas fa-folder",
      content: (() => {
        let current = getFileSystemAtPath(currentPath);
        if (!current) {
          current = fileSystem;
          currentPath = [];
        }

        return `
                  <div class="file-explorer">
                      <div class="file-sidebar">
                          <div style="padding: 0.5rem 0.5rem 1rem; color: var(--text-primary); font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;">
                              <i class="fas fa-folder-tree"></i> &nbsp;File System
                          </div>
                          ${renderFileTree()}
                      </div>
                      <div class="file-main">
                          <div class="file-toolbar">
                              <button class="editor-btn" onclick="goUpDirectory()" ${
                                currentPath.length === 0
                                  ? 'disabled style="opacity:0.5;cursor:not-allowed;"'
                                  : ""
                              }>
                                  <i class="fas fa-arrow-up"></i> Up
                              </button>
                              <button class="editor-btn" onclick="createNewFolder()">
                                  <i class="fas fa-folder-plus"></i> &nbsp;New Folder
                              </button>
                              <div class="file-breadcrumb">
                                  ${renderBreadcrumb()}
                              </div>
                          </div>
      <div class="file-grid">
                      ${Object.keys(current)
                        .sort()
                        .map((file) => {
                          const isFolder = typeof current[file] === "object";
                          const icon = isFolder ? "fa-folder" : "fa-file-alt";
                          const escapedFile = file.replace(/'/g, "\\'");
                          return `
                              <div class="file-item" ondblclick="openFile('${escapedFile}')" onclick="selectFileItem(event, this, '${escapedFile}')" draggable="true" ondragstart="handleFileDragStart(event, '${escapedFile}')" ondragover="handleFileDragOver(event, ${isFolder})" ondrop="handleFileDrop(event, '${escapedFile}')">
                                  <i class="fas ${icon}"></i>
                                  <span>${file}</span>
                                  <div class="file-actions">
                                      <button class="file-action-btn" onclick="event.stopPropagation(); openFile('${escapedFile}')">
                                          <i class="fas fa-folder-open"></i> Open
                                      </button>
                                      <button class="file-action-btn delete" onclick="event.stopPropagation(); deleteFile('${escapedFile}')">
                                          <i class="fas fa-trash"></i> Delete
                                      </button>
                                  </div>
                              </div>
                          `;
                        })
                        .join("")}
                  </div>
                      </div>
                  </div>
              `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    terminal: {
      title: "Terminal",
      icon: "fas fa-terminal",
      content: `
              <div class="terminal" id="terminalContent">
                  <div class="terminal-line" style="color: var(--accent);">NautilusOS Terminal v1.0</div>
                  <div class="terminal-line" style="color: #888; margin-bottom: 1rem;">Type 'help' for available commands</div>
                  <div class="terminal-line">
                      <span class="terminal-prompt">user@nautilusos:~$ </span><input type="text" class="terminal-input" id="terminalInput" onkeypress="handleTerminalInput(event)">
                  </div>
              </div>
          `,
      noPadding: true,
      width: 900,
      height: 600,
    },
    "2048": {
  title: "2048",
  icon: "fas fa-th",
  content: `
    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg-primary); padding: 20px; gap: 40px;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="text-align: center;">
          <h2 style="color: var(--accent); margin: 0 0 10px 0; font-size: 48px; font-weight: bold; font-family: fontb;">2048</h2>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 15px;">Combine tiles to reach 2048!</div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 15px; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
          <div style="text-align: center;">
            <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Score</div>
            <div id="game2048Score" style="color: var(--accent); font-size: 32px; font-weight: bold; font-family: fontb;">0</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Best</div>
            <div id="game2048Best" style="color: var(--accent); font-size: 32px; font-weight: bold; font-family: fontb;">0</div>
          </div>
          <button class="editor-btn" onclick="start2048Game()" style="background: var(--accent); color: var(--bg-primary); border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: fontb;">New Game</button>
          
          <div style="color: var(--text-secondary); font-size: 11px; text-align: center; line-height: 1.6; margin-top: 10px; padding-top: 15px; border-top: 1px solid var(--border);">
            <div style="margin-bottom: 8px;"><strong>Controls:</strong></div>
            <div>Arrow Keys or WASD</div>
          </div>
        </div>
      </div>
      
      <div id="game2048Board" style="display: grid; grid-template-columns: repeat(4, 100px); gap: 10px;"></div>
    </div>
  `,
  noPadding: true,
  width: 700,
  height: 600,
},
    browser: {
      title: "Nautilus Browser",
      icon: "fas fa-globe",
      content: (() => {
        if (!checkFileProtocol()) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
              <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--error-red); margin-bottom: 2rem;"></i>
              <h2 style="margin-bottom: 1rem; color: var(--text-primary);">Browser Unavailable</h2>
              <p style="color: var(--text-secondary); text-align: center; max-width: 400px;">The browser doesn't work on file:// protocol. Please run NautilusOS from a web server to use this feature.</p>
            </div>
          `;
        }
        return `
              <div class="browser-container" style="overflow: hidden;">
                  <div class="browser-header">
                      <div class="browser-tabs" id="browserTabs">
                          <div class="browser-tab active" data-tab-id="0" onclick="if(!event.target.closest('.browser-tab-close')) switchBrowserTab(0)">
                              <i class="fas fa-globe browser-tab-icon"></i>
                              <span class="browser-tab-title">New Tab</span>
                              <div class="browser-tab-close" onclick="event.stopPropagation(); event.preventDefault(); closeBrowserTab(0)">
                                  <i class="fas fa-times"></i>
                              </div>
                          </div>
                          <div class="browser-new-tab" onclick="createBrowserTab()">
                              <i class="fas fa-plus"></i>
                          </div>
                      </div>
                      <div class="browser-loading" id="browserLoading">
                          <div class="browser-loading-bar"></div>
                      </div>
                      <div class="browser-controls">
                          <button class="browser-nav-btn" id="browserBack" onclick="browserGoBack()" disabled>
                              <i class="fas fa-arrow-left"></i>
                          </button>
                          <button class="browser-nav-btn" id="browserForward" onclick="browserGoForward()" disabled>
                              <i class="fas fa-arrow-right"></i>
                          </button>
                          <button class="browser-nav-btn" onclick="browserReload()">
                              <i class="fas fa-redo"></i>
                          </button>
                          <div class="browser-url-bar">
                              <i class="fas fa-lock" id="browserLockIcon"></i>
                              <input
                                  type="text"
                                  class="browser-url-input"
                                  id="browserUrlInput"
                                  placeholder="Search or enter website URL"
                                  onkeypress="handleBrowserUrlInput(event)"
                              >
                          </div>
                      </div>
                  </div>
                  <div class="browser-content" id="browserContent">
                      <div class="browser-view active" data-view-id="0">
                          <div class="browser-landing">
                              <i class="fas fa-fish browser-landing-logo"></i>
                              <div class="browser-landing-search">
                                  <i class="fas fa-search"></i>
                                  <input
                                      type="text"
                                      class="browser-landing-input"
                                      placeholder="Search or enter website URL"
                                      onkeypress="handleBrowserLandingInput(event)"
                                  >
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    cloaking: {
      title: "Cloaking",
      icon: "fas fa-mask",
      content: `
        <div class="cloaking-container">
            <div class="cloaking-sidebar">
                <div class="cloaking-nav-item active" onclick="switchCloakingTab('basic', this)">
                    <i class="fas fa-mask"></i>
                    <span>Basic Cloak</span>
                </div>
                <div class="cloaking-nav-item" onclick="switchCloakingTab('rotate', this)">
                    <i class="fas fa-sync-alt"></i>
                    <span>Auto-Rotate</span>
                </div>
                <div class="cloaking-nav-item" onclick="switchCloakingTab('panic', this)">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Panic Key</span>
                </div>
                <div class="cloaking-nav-item" onclick="switchCloakingTab('presets', this)">
                    <i class="fas fa-bookmark"></i>
                    <span>Presets</span>
                </div>
            </div>
            
            <div class="cloaking-content-area">
                <div class="cloaking-tab active" data-tab="basic">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-mask"></i> Basic Tab Cloaking</h2>
                        <p>Disguise your browser tab to look like a different website</p>
                    </div>
                    
                    <div class="cloaking-preview-card">
                        <div class="cloaking-preview-header">
                            <div class="cloaking-preview-label">Live Preview</div>
                            <button class="cloaking-preview-btn" onclick="updateCloakPreview()">
                                <i class="fas fa-eye"></i> Refresh Preview
                            </button>
                        </div>
                        <div class="cloaking-preview-tab" id="cloakPreview">
                            <img class="cloaking-preview-favicon" id="previewFavicon"
src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size=85' fill='white'%3E🌐︎%3C/text%3E%3C/svg%3E"
alt="favicon">

                            <span class="cloaking-preview-title" id="previewTitle">NautilusOS</span>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card">
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-heading"></i> Custom Tab Title
                            </label>
                            <input 
                                type="text" 
                                id="cloakTitle" 
                                class="cloaking-input" 
                                placeholder="e.g., Google" 
                                value="${document.title}"
                                oninput="updateCloakPreview()"
                            >
                            <div class="cloaking-hint">This will appear as your browser tab title</div>
                        </div>
                        
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-image"></i> Favicon URL
                            </label>
                            <input 
                                type="text" 
                                id="cloakFavicon" 
                                class="cloaking-input" 
                                placeholder="e.g., https://www.google.com"
                                oninput="updateCloakPreview()"
                            >
                            <div class="cloaking-hint">Enter a website URL and we'll fetch its favicon automatically</div>
                        </div>
                        
                        <div class="cloaking-actions">
                            <button class="cloaking-btn primary" onclick="applyCloaking()">
                                <i class="fas fa-check"></i> Apply Cloak
                            </button>
                            <button class="cloaking-btn secondary" onclick="resetCloaking()">
                                <i class="fas fa-undo"></i> Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="cloaking-tab" data-tab="rotate">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-sync-alt"></i> Auto-Rotate Cloaking</h2>
                        <p>Automatically cycle through multiple disguises</p>
                    </div>
                    
                    <div class="cloaking-status-card">
                        <div class="cloaking-status-indicator ${
                          cloakingConfig.autoRotate ? "active" : ""
                        }">
                            <div class="cloaking-status-icon">
                                <i class="fas ${
                                  cloakingConfig.autoRotate
                                    ? "fa-rotate"
                                    : "fa-rotate"
                                }"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Auto-Rotate Status</div>
                                <div class="cloaking-status-desc">${
                                  cloakingConfig.autoRotate
                                    ? "Currently Active"
                                    : "Currently Inactive"
                                }</div>
                            </div>
                            <div class="toggle-switch ${
                              cloakingConfig.autoRotate ? "active" : ""
                            }" id="autoRotateToggle" onclick="toggleAutoRotate()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card" id="rotateSettings" style="${
                      cloakingConfig.autoRotate
                        ? ""
                        : "opacity: 0.5; pointer-events: none;"
                    }">
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-clock"></i> Rotation Speed (seconds)
                            </label>
                            <div class="cloaking-slider-group">
                                <input 
                                    type="range" 
                                    id="rotateSpeed" 
                                    class="cloaking-slider"
                                    min="1"
                                    max="300"
                                    value="${cloakingConfig.rotateSpeed}"
                                    oninput="updateRotateSpeedDisplay(this.value)"
                                >
                                <span class="cloaking-slider-value" id="rotateSpeedValue">${
                                  cloakingConfig.rotateSpeed
                                }s</span>
                            </div>
                            <div class="cloaking-hint">How often the tab should change disguise</div>
                        </div>
                        
                        <div class="cloaking-rotation-header">
                            <label class="cloaking-label">
                                <i class="fas fa-list"></i> Rotation List
                            </label>
                            <button class="cloaking-add-btn" onclick="addRotationSite()">
                                <i class="fas fa-plus"></i> Add Website
                            </button>
                        </div>
                        
                        <div class="cloaking-rotation-list" id="rotationList"></div>
                        
                        <button class="cloaking-btn primary" onclick="saveRotationSettings()" style="margin-top: 1rem;">
                            <i class="fas fa-save"></i> Save Rotation Settings
                        </button>
                    </div>
                </div>
                
                <div class="cloaking-tab" data-tab="panic">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Panic Key</h2>
                        <p>Instantly switch to a safe tab when you need to hide quickly</p>
                    </div>
                    
                    <div class="cloaking-status-card">
                        <div class="cloaking-status-indicator ${
                          cloakingConfig.panicKeyEnabled ? "active" : ""
                        }">
                            <div class="cloaking-status-icon">
                                <i class="fas ${
                                  cloakingConfig.panicKeyEnabled
                                    ? "fa-shield-alt"
                                    : "fa-shield"
                                }"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Panic Key Status</div>
                                <div class="cloaking-status-desc">${
                                  cloakingConfig.panicKeyEnabled
                                    ? "Armed and Ready"
                                    : "Disabled"
                                }</div>
                            </div>
                            <div class="toggle-switch ${
                              cloakingConfig.panicKeyEnabled ? "active" : ""
                            }" onclick="togglePanicKey()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card">
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-keyboard"></i> Panic Hotkey
                            </label>
                            <div class="cloaking-hotkey-display" id="panicHotkeyDisplay" onclick="recordPanicKey()">
                                ${
                                  cloakingConfig.panicKey ||
                                  "Click to set hotkey"
                                }
                            </div>
                            <div class="cloaking-hint">Press any key combination to set it as your panic hotkey</div>
                        </div>
                        
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-external-link-alt"></i> Panic URL
                            </label>
                            <input 
                                type="text" 
                                id="panicUrl" 
                                class="cloaking-input" 
                                placeholder="e.g., https://classroom.google.com"
                                value="${cloakingConfig.panicUrl || ""}"
                            >
                            <div class="cloaking-hint">The website to instantly redirect to when panic key is pressed</div>
                        </div>
                        
                        <div class="cloaking-panic-test">
                            <button class="cloaking-btn warning" onclick="testPanicKey()">
                                <i class="fas fa-vial"></i> Test Panic Key
                            </button>
                            <div class="cloaking-hint">This will trigger the panic redirect as a test</div>
                        </div>
                    </div>
                </div>
                
                <div class="cloaking-tab" data-tab="presets">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-bookmark"></i> Quick Presets</h2>
                        <p>One-click disguises for common websites</p>
                    </div>
                    
                    <div class="cloaking-presets-grid">
                        <div class="cloaking-preset-card" onclick="applyPreset('google')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #4285F4, #34A853);">
                                <i class="fab fa-google"></i>
                            </div>
                            <div class="cloaking-preset-name">Google</div>
                            <div class="cloaking-preset-url">google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('gmail')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #EA4335, #FBBC05);">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="cloaking-preset-name">Gmail</div>
                            <div class="cloaking-preset-url">mail.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('drive')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #4285F4, #0F9D58);">
                                <i class="fab fa-google-drive"></i>
                            </div>
                            <div class="cloaking-preset-name">Google Drive</div>
                            <div class="cloaking-preset-url">drive.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('classroom')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #0F9D58, #F4B400);">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div class="cloaking-preset-name">Classroom</div>
                            <div class="cloaking-preset-url">classroom.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('docs')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #4285F4, #4285F4);">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="cloaking-preset-name">Google Docs</div>
                            <div class="cloaking-preset-url">docs.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('youtube')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #FF0000, #CC0000);">
                                <i class="fab fa-youtube"></i>
                            </div>
                            <div class="cloaking-preset-name">YouTube</div>
                            <div class="cloaking-preset-url">youtube.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('wikipedia')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #000000, #333333);">
                                <i class="fab fa-wikipedia-w"></i>
                            </div>
                            <div class="cloaking-preset-name">Wikipedia</div>
                            <div class="cloaking-preset-url">wikipedia.org</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('github')">
                            <div class="cloaking-preset-icon" style="background: linear-gradient(135deg, #333333, #24292e);">
                                <i class="fab fa-github"></i>
                            </div>
                            <div class="cloaking-preset-name">GitHub</div>
                            <div class="cloaking-preset-url">github.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
      noPadding: false,
      width: 900,
      height: 600,
    },
    settings: {
      title: "Settings",
      icon: "fas fa-cog",
      content: `
    <div class="settings-container">
        <div class="settings-sidebar">
            <div class="settings-nav-item active" onclick="switchSettingsTab('general', this)">
                <i class="fas fa-cog"></i>
                <span>General</span>
            </div>
            <div class="settings-nav-item" onclick="switchSettingsTab('appearance', this)">
                <i class="fas fa-palette"></i>
                <span>Appearance</span>
            </div>
            <div class="settings-nav-item" onclick="switchSettingsTab('proxy', this)">
                <i class="fas fa-globe"></i>
                <span>Proxy</span>
            </div>
            <div class="settings-nav-item" onclick="switchSettingsTab('system', this)">
                <i class="fas fa-microchip"></i>
                <span>System</span>
            </div>
            <div class="settings-nav-item" onclick="switchSettingsTab('account', this)">
                <i class="fas fa-user"></i>
                <span>Account</span>
            </div>
            <div class="settings-nav-item" onclick="switchSettingsTab('advanced', this)">
                <i class="fas fa-sliders-h"></i>
                <span>Advanced</span>
            </div>
        </div>
        
        <div class="settings-content-area" id="settingsContentArea">
            <div class="settings-tab-content active" data-tab="general">
                <h2><i class="fas fa-cog"></i> General Settings</h2>
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-clock"></i>
                        <span>Clock & Time</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">12-Hour Format</div>
                                <div class="settings-item-desc">Use 12-hour time with AM/PM</div>
                            </div>
                            <div class="toggle-switch ${
                              settings.use12Hour ? "active" : ""
                            }" onclick="toggleSetting('use12Hour')"></div>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Show Seconds</div>
                                <div class="settings-item-desc">Display seconds in taskbar clock</div>
                            </div>
                            <div class="toggle-switch ${
                              settings.showSeconds ? "active" : ""
                            }" onclick="toggleSetting('showSeconds')"></div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-desktop"></i>
                        <span>Desktop</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Show Desktop Icons</div>
                                <div class="settings-item-desc">Display application icons on desktop</div>
                            </div>
                            <div class="toggle-switch ${
                              settings.showDesktopIcons ? "active" : ""
                            }" onclick="toggleSetting('showDesktopIcons')"></div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-star"></i>
                        <span>What's New</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Show on Startup</div>
                                <div class="settings-item-desc">Open What's New window when logging in</div>
                            </div>
                            <div class="toggle-switch ${
                              localStorage.getItem(
                                "nautilusOS_showWhatsNew"
                              ) !== "false"
                                ? "active"
                                : ""
                            }" onclick="toggleSetting('showWhatsNew')"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-tab-content" data-tab="appearance">
                <h2><i class="fas fa-palette"></i> Appearance</h2>
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-image"></i>
                        <span>Wallpaper</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            Set custom images for the desktop and login screen.
                        </p>
                        <div id="imageErrorMessage" style="display:none;color:var(--error-red);font-size:0.85rem;margin-bottom:1rem;"></div>
                        <input type="file" id="wallpaperInput" accept="image/png, image/jpeg, image/gif" onchange="handleWallpaperUpload(event)" style="display: none;">
                        <input type="file" id="loginWallpaperInput" accept="image/png, image/jpeg, image/gif" onchange="handleLoginBackgroundUpload(event)" style="display: none;">
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
                            <button class="settings-action-btn" id="desktopWallpaperButton" onclick="document.getElementById('wallpaperInput').click()">
                                <i class="fas fa-upload"></i> ${
                                  hasWallpaper
                                    ? "Change Desktop Wallpaper"
                                    : "Set Desktop Wallpaper"
                                }
                            </button>
                            <button class="settings-action-btn" onclick="clearWallpaper()">
                                <i class="fas fa-undo"></i> Reset Desktop Wallpaper
                            </button>
                        </div>
                        <div class="settings-item" style="margin-bottom: 1rem;">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Use same for login screen</div>
                                <div class="settings-item-desc">Mirror the desktop wallpaper on the login page</div>
                            </div>
                            <div class="toggle-switch ${
                              useSameBackground ? "active" : ""
                            }" id="loginWallpaperToggle" onclick="toggleLoginWallpaperLink(this)"></div>
                        </div>
                        <div id="loginWallpaperControls" style="${
                          useSameBackground ? "display: none;" : ""
                        }">
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
                                <button class="settings-action-btn" id="loginWallpaperButton" onclick="document.getElementById('loginWallpaperInput').click()">
                                    <i class="fas fa-upload"></i> ${
                                      hasLoginWallpaper
                                        ? "Change Login Wallpaper"
                                        : "Set Login Wallpaper"
                                    }
                                </button>
                                <button class="settings-action-btn" onclick="clearLoginWallpaper()">
                                    <i class="fas fa-undo"></i> Reset Login Wallpaper
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-palette"></i>
                        <span>Themes</span>
                    </div>
                    <div class="settings-card-body">
                        <div id="themeSettings">
                            ${
                              installedThemes.length === 0
                                ? `
                                <div class="settings-empty">
                                    <i class="fas fa-paint-brush"></i>
                                    <h3>No Themes Installed</h3>
                                    <p>Visit the App Store to browse and install custom themes for NautilusOS.</p>
                                    <button class="settings-action-btn" onclick="hideContextMenu(); openApp('appstore'); setTimeout(() => { const themesBtn = document.querySelector('.appstore-section:nth-child(2)'); if(themesBtn) switchAppStoreSection('themes', themesBtn); }, 100);">
                                        <i class="fas fa-store"></i> Open App Store
                                    </button>
                                </div>
                            `
                                : `
                                <div class="theme-grid">
                                    ${installedThemes
                                      .map(
                                        (theme) => `
                                        <div class="theme-card">
                                            <div class="theme-preview">
                                                <i class="fas fa-sun"></i>
                                            </div>
                                            <div class="theme-name">${
                                              theme.charAt(0).toUpperCase() +
                                              theme.slice(1)
                                            } Theme</div>
                                            <button class="settings-action-btn" onclick="applyTheme('${theme}')">
                                                Apply Theme
                                            </button>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            `
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-tab-content" data-tab="proxy">
                <h2><i class="fas fa-globe"></i>Proxy Settings</h2>
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-search"></i>
                        <span>Search Engine</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item">
                            <p class="settings-description">The website all browsers will use to search. The default search engine is Brave.</p>
                            <select style="margin-left: 10.1px; border-radius: 12.5px;">
        <button>
            <div>
                <selectedcontent style="scale: 1.1;"> </selectedcontent>
                <svg style="scale: 1.8;" width="128" height="128" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m7 10l5 5l5-5z" />
                </svg>
            </div>
        </button>
        <div>
            <option value="https://search.brave.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://search.brave.com/search?q='); showToast('Search engine set to Brave', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Brave Search</span>
                </div>
            </option>
            <option value="https://duckduckgo.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://duckduckgo.com/search?q='); showToast('Search engine set to Duck Duck Go', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Duck Duck Go</span>
                </div>
            </option>
            <option value="https://www.google.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://google.com/search?q='); showToast('Search engine set to Google', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Google Search</span>
                </div>
            </option>
            <option value="https://www.bing.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://bing.com/search?q='); showToast('Search engine set to Bing', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Bing</span>
                </div>
            </option>
            <option value="https://www.startpage.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://startpage.com/search?q='); showToast('Search engine set to Startpage', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Startpage</span>
                </div>
            </option>
            <option value="https://www.qwant.com/search?q=" onclick="localStorage.setItem('nOS_searchEngine', 'https://qwant.com/search?q='); showToast('Search engine set to Qwant', 'fa-solid fa-check')">
                <div class="custom-option">
                    <span class="option-text">Qwant</span>
                </div>
            </option>
        </div>
    </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="settings-tab-content" data-tab="system">
                <h2><i class="fas fa-microchip"></i> System</h2>
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-power-off"></i>
                        <span>Boot Options</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            Reset the boot preference to show the bootloader menu on next reload, allowing you to choose between graphical and command-line modes.
                        </p>
                        <button class="settings-action-btn" onclick="resetBootloader()">
                            <i class="fas fa-redo"></i> Reset Boot Preference
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="settings-tab-content" data-tab="account">
                <h2><i class="fas fa-user"></i> Account</h2>
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-user-circle"></i>
                        <span>Profile Information</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Username</div>
                                <div class="settings-item-desc">Your account username</div>
                            </div>
                            <div class="settings-item-value">${currentUsername}</div>
                            <button class="settings-action-btn" onclick="changeuser(); console.log('Tried to run function')" style="margin-left: 25px;"><i class='fa-solid fa-pencil'></i>Edit</button>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Account Type</div>
                                <div class="settings-item-desc">Permission level</div>
                            </div>
                            <div class="settings-item-value">Standard User</div>
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-image"></i>
                        <span>Profile Picture</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            Upload a PNG, JPG, or GIF to personalize your account.
                        </p>
                        <input type="file" id="profilePictureInput" accept="image/png, image/jpeg, image/gif" onchange="handleProfilePictureUpload(event)" style="display: none;">
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <button class="settings-action-btn" id="profilePictureButton" onclick="document.getElementById('profilePictureInput').click()">
                                <i class="fas fa-upload"></i> ${
                                  hasProfilePicture
                                    ? "Change Profile Picture"
                                    : "Set Profile Picture"
                                }
                            </button>
                            <button class="settings-action-btn" onclick="clearProfilePicture()">
                                <i class="fas fa-undo"></i> Reset Profile Picture
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-file-export"></i>
                        <span>Profile Management</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            Export your profile to save settings, installed apps, themes, files, and preferences. Import on another device or keep as a backup.
                        </p>
                        <button class="settings-action-btn" onclick="exportProfile()">
                            <i class="fas fa-download"></i> Export Profile
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="settings-tab-content" data-tab="advanced">
                <h2><i class="fas fa-sliders-h"></i> Advanced</h2>
                <div class="settings-card danger">
                    <div class="settings-card-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Danger Zone</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            This will permanently delete all your data including your account, settings, files, themes, and preferences. <strong>NOTE: Your achievements and Easter eggs will be preserved!</strong> You will be returned to the initial setup screen.
                        </p>
                        <button class="settings-danger-btn" onclick="resetAllData()">
                            <i class="fas fa-trash-alt"></i> Reset All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`,
      noPadding: true,
      width: 900,
      height: 600,
    },
    editor: {
      title: filename || "Text Editor",
      icon: "fas fa-edit",
      content: `
              <div class="editor-toolbar">
                  <button class="editor-btn" onclick="currentFile = null; document.querySelector('.editor-textarea').value = ''; document.getElementById('editorFilename').value = '';"><i class="fas fa-file"></i> &nbsp;New</button>
                  <button class="editor-btn" onclick="saveFile()"><i class="fas fa-save"></i> &nbsp;Save</button>
                  <button class="editor-btn" onclick="saveAsNewFile()"><i class="fas fa-copy"></i> &nbsp;Save As</button>
                  <button class="editor-btn" onclick="saveToDevice()"><i class="fas fa-download"></i> &nbsp;Save to Device</button>
                  <input type="text" id="editorFilename" class="editor-filename" placeholder="filename.txt" value="${filename}">
              </div>
              <textarea class="editor-textarea" placeholder="Start typing...">${
                editorContent || ""
              }</textarea>
          `,
      noPadding: true,
      width: 900,
      height: 600,
    },
    music: {
      title: "Music",
      icon: "fas fa-music",
      content: `
          <div class="music-player">
              <div class="music-header">
                  <div class="music-artwork">
                      <i class="fas fa-music"></i>
                  </div>
                  <div class="music-info">
                      <div class="music-title" id="musicTitle">No Track Loaded</div>
                      <div class="music-artist" id="musicArtist">Select a music file to play</div>
                  </div>
                  <div class="music-load-section">
                      <label for="musicFileInput" class="music-load-btn">
                          <i class="fas fa-folder-open"></i> Load Music
                          <input type="file" id="musicFileInput" accept="audio/*" onchange="loadMusicFile(event)" style="display: none;">
                      </label>
                  </div>
              </div>

              <div class="music-progress-section">
                  <div class="music-time" id="currentTime">0:00</div>
                  <div class="music-progress-bar" onclick="seekMusic(event)">
                      <div class="music-progress-fill" id="progressFill"></div>
                  </div>
                  <div class="music-time" id="totalTime">0:00</div>
              </div>

              <div class="music-controls">
                  <button class="music-control-btn" onclick="restartMusic()" title="Restart">
                      <i class="fas fa-redo"></i>
                  </button>
                  <button class="music-control-btn" onclick="skipBackward()" title="Skip Back 10s">
                      <i class="fas fa-backward"></i>
                  </button>
                  <button class="music-control-btn play-btn" id="playPauseBtn" onclick="togglePlayPause()">
                      <i class="fas fa-play"></i>
                  </button>
                  <button class="music-control-btn" onclick="skipForward()" title="Skip Forward 10s">
                      <i class="fas fa-forward"></i>
                  </button>
                  <button class="music-control-btn" id="loopBtn" onclick="toggleLoop()" title="Loop">
                      <i class="fas fa-repeat"></i>
                  </button>
              </div>

              <div class="music-volume-section">
                  <i class="fas fa-volume-up"></i>
                  <input type="range" class="music-volume-slider" id="volumeSlider" min="0" max="100" value="70" oninput="changeVolume(this.value)">
                  <span id="volumePercent">70%</span>
              </div>

              <audio id="audioPlayer" style="display: none;"></audio>
          </div>
      `,
      noPadding: true,
      width: 900,
      height: 600,
    },
    photos: {
      title: "Photos",
      icon: "fas fa-images",
      content: (() => {
        const photos = fileSystem["Photos"] || {};
        const photoList = Object.keys(photos);

        if (photoList.length === 0) {
          return `
                      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
                          <i class="fas fa-images" style="font-size: 5rem; color: var(--accent); margin-bottom: 2rem;"></i>
                          <h2 style="margin-bottom: 1rem; color: var(--text-primary);">No Photos Yet</h2>
                          <p style="color: var(--text-secondary);">Take a screenshot to get started!</p>
                      </div>
                  `;
        }

        return `
                  <div class="photos-grid" id="photosGrid">
                      ${photoList
                        .map(
                          (name) => `
                          <div class="photo-item" onclick="viewPhoto('${name}')">
                              <img src="${photos[name]}" alt="${name}" class="photo-thumbnail">
                              <div class="photo-name">${name}</div>
                              <button class="photo-delete-btn" onclick="event.stopPropagation(); deletePhoto('${name}')">
                                  <i class="fas fa-trash"></i>
                              </button>
                          </div>
                      `
                        )
                        .join("")}
                  </div>
              `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    help: {
      title: "Help",
      icon: "fas fa-question-circle",
      content: `
        <div class="help-topics-container">
            <div class="help-topics-grid" id="helpTopicsGrid">
                <div class="help-topic-card" onclick="expandHelpTopic('welcome')">
                    <div class="help-topic-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="help-topic-title">Welcome</div>
                    <div class="help-topic-preview">Introduction to NautilusOS</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('cloaking')">
                    <div class="help-topic-icon">
                        <i class="fas fa-mask"></i>
                    </div>
                    <div class="help-topic-title">Cloaking</div>
                    <div class="help-topic-preview">Tab disguise features</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('boot')">
                    <div class="help-topic-icon">
                        <i class="fas fa-power-off"></i>
                    </div>
                    <div class="help-topic-title">Boot Options</div>
                    <div class="help-topic-preview">Graphical vs command-line</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('apps')">
                    <div class="help-topic-icon">
                        <i class="fas fa-th"></i>
                    </div>
                    <div class="help-topic-title">Applications</div>
                    <div class="help-topic-preview">Built-in apps guide</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('desktop')">
                    <div class="help-topic-icon">
                        <i class="fas fa-desktop"></i>
                    </div>
                    <div class="help-topic-title">Desktop</div>
                    <div class="help-topic-preview">Icons, taskbar & windows</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('notifications')">
                    <div class="help-topic-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="help-topic-title">Notifications</div>
                    <div class="help-topic-preview">Quick actions & alerts</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('screenshots')">
                    <div class="help-topic-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div class="help-topic-title">Screenshots</div>
                    <div class="help-topic-preview">Capture your desktop</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('settings')">
                    <div class="help-topic-icon">
                        <i class="fas fa-cog"></i>
                    </div>
                    <div class="help-topic-title">Settings</div>
                    <div class="help-topic-preview">Customize your experience</div>
                </div>
                
                <div class="help-topic-card" onclick="expandHelpTopic('tips')">
                    <div class="help-topic-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="help-topic-title">Tips & Tricks</div>
                    <div class="help-topic-preview">Pro user shortcuts</div>
                </div>
            </div>
            
            <div class="help-expanded-view" id="helpExpandedView">
                <div class="help-expanded-header">
                    <button class="help-back-btn" onclick="closeHelpTopic()">
                        <i class="fas fa-arrow-left"></i> Back to Topics
                    </button>
                </div>
                <div class="help-expanded-content" id="helpExpandedContent"></div>
            </div>
        </div>
    `,
      noPadding: true,
      width: 900,
      height: 600,
    },
    whatsnew: {
      title: "What's New in NautilusOS",
      icon: "fas fa-star",
      content: `
              <div class="whats-new-content">
                  <center>
                  <div class="whats-new-header">
                      <h1 style="text-align: center !important">Welcome to NautilusOS v1.0! <br>What's new?</h1>
                      <p>Discover the latest features and improvements</p>
                  </div>
                  </center>

                  <div class="carousel-container">
                      <div class="carousel-slide active" data-slide="0">
                          <div class="carousel-illustration">
                              <div class="illustration-folder"></div>
                          </div>
                          <div class="carousel-content">
                              <h2>Advanced File System</h2>
                              <p>Navigate through folders with an intuitive tree sidebar. Create new folders, organize your files, and explore a fully functional virtual file system right in your browser.</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="1">
                          <div class="carousel-illustration">
                              <div class="illustration-tree">
                                  <div class="illustration-tree-item"></div>
                                  <div class="illustration-tree-item"></div>
                                  <div class="illustration-tree-item"></div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Multiple Windows Support</h2>
                              <p>Open multiple applications simultaneously and switch between them seamlessly. Drag windows to reposition, resize from any edge, minimize, maximize, or close - just like a real desktop environment!</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="2">
                          <div class="carousel-illustration">
                              <div class="illustration-boot">
                                  <div class="illustration-boot-icon">
                                      <i class="fas fa-desktop"></i>
                                  </div>
                                  <div class="illustration-boot-divider"></div>
                                  <div class="illustration-boot-icon">
                                      <i class="fas fa-code"></i>
                                  </div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Multiple Boot Options</h2>
                              <p>Choose between graphical mode or command-line interface on startup. Your preference is remembered, giving you full control over your NautilusOS experience.</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="3">
                          <div class="carousel-illustration">
                              <div class="illustration-taskbar">
                                  <div class="illustration-taskbar-square"></div>
                                  <div class="illustration-taskbar-divider"></div>
                                  <div class="illustration-taskbar-circles">
                                      <div class="illustration-taskbar-circle"></div>
                                      <div class="illustration-taskbar-circle"></div>
                                      <div class="illustration-taskbar-circle"></div>
                                      <div class="illustration-taskbar-circle"></div>
                                  </div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Dynamic Taskbar</h2>
                              <p>Open apps automatically appear in your taskbar. See which window is focused with visual indicators, and quickly switch between applications.</p>
                          </div>
                      </div>
       <div class="carousel-slide" data-slide="4">
                          <div class="carousel-illustration">
                              <div class="illustration-apps-grid">
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-folder"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-terminal"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-globe"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-edit"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-music"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-images"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-cog"></i>
                                  </div>
                                  <div class="illustration-apps-icon">
                                      <i class="fas fa-star"></i>
                                  </div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Tons of Apps!</h2>
                              <p>File manager, terminal, browser, text editor, music player, photos, settings, and more. Everything you need for productivity, entertainment, and customization - all built right in!</p>
                          </div>
                      </div>

      <div class="carousel-slide" data-slide="5">
                          <div class="carousel-illustration">
                              <div class="illustration-store">
      <div class="illustration-store-header">
                                      <div class="illustration-store-icon">
                                          <i class="fas fa-store"></i>
                                      </div>
                                      <div class="illustration-store-title-bar"></div>
                                  </div>
                                  <div class="illustration-store-items">
                                      <div class="illustration-store-item">
                                          <div class="illustration-store-item-icon"></div>
                                          <div class="illustration-store-item-info">
                                              <div class="illustration-store-item-name"></div>
                                              <div class="illustration-store-item-desc"></div>
                                          </div>
                                          <div class="illustration-store-item-btn"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Built-in App Store</h2>
                              <p>Discover and install new applications from the NautilusOS App Store. Browse featured themes, apps, and tools to extend your desktop experience with just a click!</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="6">
                          <div class="carousel-illustration">
                              <div class="illustration-cogs">
                                  <i class="fas fa-cog illustration-cog"></i>
                                  <i class="fas fa-cog illustration-cog"></i>
                                  <i class="fas fa-cog illustration-cog"></i>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Fully Customizable</h2>
                              <p>Personalize your experience with extensive settings. Make NautilusOS truly yours by installing different themes, changing cloaking settings, arranging desktop icons, configuring boot preferences, and more.</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="7">
                          <div class="carousel-illustration">
                              <div class="illustration-login">
                                  <div class="illustration-avatar">
                                      <i class="fas fa-user"></i>
                                  </div>
                                  <div class="illustration-input"></div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Secure Login Screen</h2>
                              <p>Beautiful login interface with system information, real-time clock, and smooth transitions. Your personalized workspace awaits behind a polished authentication screen.</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="8">
          <div class="carousel-illustration">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
                  <div style="width: 200px; height: 140px; background: rgba(21, 25, 35, 0.95); border: 2px solid var(--accent); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; position: relative;">
                      <div style="position: absolute; top: 20px; width: 100px; height: 60px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1.5rem; color: var(--bg-primary); box-shadow: 0 4px 12px rgba(125, 211, 192, 0.4); animation: float 3s ease-in-out infinite;">
                          <i class="fas fa-fish"></i>
                          <i class="fas fa-user-plus" style="font-size: 1.2rem;"></i>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%; margin-top: 4rem;">
                          <div style="height: 12px; background: rgba(125, 211, 192, 0.3); border-radius: 4px; width: 100%;"></div>
                          <div style="height: 12px; background: rgba(125, 211, 192, 0.3); border-radius: 4px; width: 100%;"></div>
                      </div>
                  </div>

              </div>
          </div>
          <div class="carousel-content">
              <h2>Easy Account Setup</h2>
              <p>First-time setup wizard guides you through creating your account with username and password. Choose between normal and passwordless accounts, which themes to install right from the start, and get welcomed with personalized messages!</p>
          </div>
      </div>
                      <div class="carousel-slide" data-slide="9">
                          <div class="carousel-illustration">
                              <div class="illustration-browser-window">
                                  <div class="illustration-browser-header">
                                      <div class="illustration-browser-controls"></div>
                                      <div class="illustration-browser-url"></div>
                                  </div>
                                  <div class="illustration-browser-content">
                                  </div>
                              </div>
                          </div>
                          <div class="carousel-content">
                              <h2>Built-in Web Browser</h2>
                              <p>Browse the web without leaving NautilusOS! Full-featured browser with multiple tabs, navigation controls, and URL bar. Visit your favorite websites right from your virtual desktop.</p>
                          </div>
                      </div>

                      <div class="carousel-slide" data-slide="10">
          <div class="carousel-illustration">
              <div style="display: flex; gap: 2rem; align-items: center;">
                  <div style="width: 100px; height: 100px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: var(--accent); animation: float 3s ease-in-out infinite;">
                      <i class="fas fa-bolt"></i>
                  </div>
                  <div style="width: 3px; height: 100px; background: var(--accent); opacity: 0.4; border-radius: 2px;"></div>
                  <div style="display: flex; flex-direction: column; gap: 1rem;">
                      <div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); animation: float 3s ease-in-out infinite; animation-delay: 0.3s;">
                          <i class="fas fa-camera"></i>
                      </div>
                      <div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); animation: float 3s ease-in-out infinite; animation-delay: 0.6s;">
                          <i class="fas fa-times-circle"></i>
                      </div>
                  </div>
              </div>
          </div>
          <div class="carousel-content">
              <h2>Quick Actions Panel</h2>
              <p>Access frequently used actions instantly from the taskbar. Take screenshots, close all windows, sign out, and more with just one click. Your productivity shortcuts in one convenient place.</p>
          </div>
      </div>
<div class="carousel-slide" data-slide="11">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 2rem; align-items: center;">
            <div style="width: 120px; height: 120px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: var(--accent); animation: float 3s ease-in-out infinite;">
                <i class="fas fa-file-export"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="width: 40px; height: 3px; background: var(--accent); border-radius: 2px;"></div>
                <div style="width: 60px; height: 3px; background: var(--accent); border-radius: 2px;"></div>
                <div style="width: 50px; height: 3px; background: var(--accent); border-radius: 2px;"></div>
            </div>
            <div style="width: 120px; height: 120px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: var(--accent); animation: float 3s ease-in-out infinite; animation-delay: 0.5s;">
                <i class="fas fa-file-import"></i>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Import & Export Profiles</h2>
        <p>Backup your entire NautilusOS experience! Export your profile to save settings, files, apps, and themes. Import profiles to restore your setup on any device or share configurations with others.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="12">
          <div class="carousel-illustration">
              <div style="display: flex; gap: 1.5rem; align-items: center;">
                  <div style="width: 100px; height: 100px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: var(--accent); animation: float 3s ease-in-out infinite;">
                      <i class="fas fa-bell"></i>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                      <div style="width: 120px; height: 35px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite; animation-delay: 0.2s;"></div>
                      <div style="width: 120px; height: 35px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite; animation-delay: 0.4s;"></div>
                      <div style="width: 120px; height: 35px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite; animation-delay: 0.6s;"></div>
                  </div>
              </div>
          </div>
          <div class="carousel-content">
              <h2>Notification Center</h2>
              <p>Never miss important system messages! View all your notifications in one place, track their history, and clear them when you're done. Stay informed about everything happening in NautilusOS.</p>
          </div>
      </div>

<div class="carousel-slide" data-slide="13">
    <div class="carousel-illustration">
        <div class="illustration-achievements">
            <div class="illustration-achievement-badge">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="illustration-achievement-badge">
                <i class="fas fa-egg"></i>
            </div>
            <div class="illustration-achievement-badge">
                <i class="fas fa-lock"></i>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Achievements & Easter Eggs</h2>
        <p>Track your progress with a comprehensive achievement system! Unlock badges for reaching milestones, exploring features, and discovering hidden Easter eggs. Achievement data persists even after system resets!</p>
    </div>
</div>
<div class="carousel-slide" data-slide="14">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 2rem; align-items: center; justify-content: center;">
            <div style="width: 120px; height: 120px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: var(--accent); animation: float 3s ease-in-out infinite; position: relative; overflow: hidden;">
                <i class="fas fa-image"></i>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 30%; background: rgba(125, 211, 192, 0.4), transparent);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: var(--bg-primary); animation: float 3s ease-in-out infinite; animation-delay: 0.3s; box-shadow: 0 4px 12px rgba(125, 211, 192, 0.4);">
                    <i class="fas fa-user"></i>
                </div>
                <div style="width: 90px; height: 12px; background: rgba(125, 211, 192, 0.3); border-radius: 6px; animation: float 3s ease-in-out infinite; animation-delay: 0.6s;">
                    <div style="width: 100%; height: 100%; background: var(--accent); border-radius: 6px;"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Personalization & Wallpapers</h2>
        <p>Make NautilusOS truly yours! Upload custom wallpapers for both desktop and login screen, set a profile picture to personalize your account, and choose whether to use the same background everywhere or different ones for each screen.</p>
    </div>
</div>
<div class="carousel-slide" data-slide="15">
    <div class="carousel-illustration">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0;">
            <div style="width: 240px; height: 50px; background: rgba(255, 255, 255, 0.05); border: 2px solid var(--accent); border-bottom: none; border-radius: 10px 10px 0 0; display: flex; align-items: center; padding: 0 1rem; gap: 0.75rem; animation: float 3s ease-in-out infinite;">
                <div style="width: 18px; height: 18px; background: var(--accent); border-radius: 50%; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 10px; background: rgba(125, 211, 192, 0.4); border-radius: 5px;"></div>
            </div>
            <div style="width: 240px; background: rgba(21, 25, 35, 0.95); border-left: 2px solid var(--accent); border-right: 2px solid var(--accent); border-top: 2px solid var(--accent); border-bottom: 2px solid var(--accent); border-radius: 0 0 12px 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; animation: float 3s ease-in-out infinite;">
                <div style="width: 60px; height: 60px; background: rgba(125, 211, 192, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); flex-shrink: 0; border: 2px solid var(--accent);">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="height: 12px; background: rgba(125, 211, 192, 0.4); border-radius: 6px; width: 100%;"></div>
                    <div style="height: 12px; background: rgba(125, 211, 192, 0.3); border-radius: 6px; width: 85%;"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Advanced Tab Cloaking</h2>
        <p>Stay under the radar with powerful disguise tools! Auto-rotate through multiple tab disguises, set custom rotation speeds, configure panic keys for instant redirects, and use preset templates for popular sites like Google Classroom and Drive.</p>
    </div>
</div>

<div class="carousel-controls">
                          <div class="carousel-btn" onclick="changeSlide(-1)">
                              <i class="fas fa-chevron-left"></i>
                          </div>
                          <div class="carousel-btn" onclick="changeSlide(1)">
                              <i class="fas fa-chevron-right"></i>
                          </div>
                      </div>

      <div class="carousel-dots">
          <div class="carousel-dot active" onclick="goToSlide(0)"></div>
          <div class="carousel-dot" onclick="goToSlide(1)"></div>
          <div class="carousel-dot" onclick="goToSlide(2)"></div>
          <div class="carousel-dot" onclick="goToSlide(3)"></div>
          <div class="carousel-dot" onclick="goToSlide(4)"></div>
          <div class="carousel-dot" onclick="goToSlide(5)"></div>
          <div class="carousel-dot" onclick="goToSlide(6)"></div>
          <div class="carousel-dot" onclick="goToSlide(7)"></div>
          <div class="carousel-dot" onclick="goToSlide(8)"></div>
          <div class="carousel-dot" onclick="goToSlide(9)"></div>
          <div class="carousel-dot" onclick="goToSlide(10)"></div>
          <div class="carousel-dot" onclick="goToSlide(11)"></div>
          <div class="carousel-dot" onclick="goToSlide(12)"></div>
          <div class="carousel-dot" onclick="goToSlide(13)"></div>
          <div class="carousel-dot" onclick="goToSlide(14)"></div>
          <div class="carousel-dot" onclick="goToSlide(15)"></div>

      </div>
                          </div>

                  <div class="whats-new-footer">
                      <div class="footer-card">
                          <h3><i class="fas fa-question-circle"></i> Need Help?</h3>
                          <p>Check out our comprehensive help guide to learn more about all the features and keyboard shortcuts available in NautilusOS.</p>
                          <a href="#" onclick="event.preventDefault(); hideContextMenu(); openApp('help')">
                              Open Help <i class="fas fa-arrow-right"></i>
                          </a>
                      </div>

                      <div class="footer-card">
                          <h3><i class="fas fa-code"></i> Open Source</h3>
                          <p>NautilusOS is crafted with care by <strong>dinguschan</strong>. Built with vanilla HTML, CSS, and JavaScript - no frameworks needed!</p>
                          <a href="https://github.com/dinguschan-owo/NautilusOS" onclick="event.stopPropagation()">
                              View on GitHub <i class="fas fa-external-link-alt"></i>
                          </a>
                      </div>
                  </div>
          `,
      noPadding: true,
      width: 900,
      height: 600,
    },
    calculator: {
      title: "Calculator",
      icon: "fas fa-calculator",
      content: `
              <div class="calculator">
                  <div class="calculator-display">
                      <div class="calculator-history" id="calcHistory"></div>
                      <div id="calcDisplay">0</div>
                  </div>
                  <div class="calculator-buttons">
                      <button class="calculator-btn clear" onclick="calcClear()">C</button>
                      <button class="calculator-btn operator" onclick="calcInput('/')">/</button>
                      <button class="calculator-btn operator" onclick="calcInput('*')">×</button>
      <button class="calculator-btn operator" onclick="calcBackspace()"><i class="fas fa-backspace"></i></button>

                      <button class="calculator-btn" onclick="calcInput('7')">7</button>
                      <button class="calculator-btn" onclick="calcInput('8')">8</button>
                      <button class="calculator-btn" onclick="calcInput('9')">9</button>
                      <button class="calculator-btn operator" onclick="calcInput('-')">-</button>

                      <button class="calculator-btn" onclick="calcInput('4')">4</button>
                      <button class="calculator-btn" onclick="calcInput('5')">5</button>
                      <button class="calculator-btn" onclick="calcInput('6')">6</button>
                      <button class="calculator-btn operator" onclick="calcInput('+')">+</button>

                      <button class="calculator-btn" onclick="calcInput('1')">1</button>
                      <button class="calculator-btn" onclick="calcInput('2')">2</button>
                      <button class="calculator-btn" onclick="calcInput('3')">3</button>
                      <button class="calculator-btn operator" onclick="calcInput('%')">%</button>

                      <button class="calculator-btn zero" onclick="calcInput('0')">0</button>
                      <button class="calculator-btn" onclick="calcInput('.')">.</button>
                      <button class="calculator-btn equals" onclick="calcEquals()">=</button>
                  </div>
              </div>
          `,
      noPadding: true,
      width: 400,
      height: 600,
    },
    "snap-manager": {
      title: "Snap Manager",
      icon: "fas fa-border-all",
      content: renderSnapManager(),
      noPadding: true,
      width: 820,
      height: 640,
    },
    uv: {
      title: "Ultraviolet",
      icon: "fas fa-globe",
      content: (() => {
        if (!checkFileProtocol()) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
              <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--error-red); margin-bottom: 2rem;"></i>
              <h2 style="margin-bottom: 1rem; color: var(--text-primary);">Ultraviolet Unavailable</h2>
              <p style="color: var(--text-secondary); text-align: center; max-width: 400px;">Ultraviolet doesn't work on file:// protocol. Please run NautilusOS from a web server to use this feature.</p>
            </div>
          `;
        }
        return `
        <div class="browser-container" style="overflow: hidden;">
                      <iframe src="/app/uv.html" frameborder="0" style="width: 100%; height: 100vh; border-radius: 0px; margin: 0;"></iframe>
              </div>
      `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    vsc: {
      title: "Visual Studio Code",
      icon: "fas fa-code",
      content: (() => {
        if (!checkFileProtocol()) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
              <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--error-red); margin-bottom: 2rem;"></i>
              <h2 style="margin-bottom: 1rem; color: var(--text-primary);">VS Code Unavailable</h2>
              <p style="color: var(--text-secondary); text-align: center; max-width: 400px;">Visual Studio Code doesn't work on file:// protocol. Please run NautilusOS from a web server to use this feature.</p>
            </div>
          `;
        }
        return `
        <div class="browser-container" style="overflow: hidden;">
                  <h1 style="z-index: -1; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">Loading...</h1>
                      <iframe src="/uv/service/hvtrs8%2F-vqcmdg.fet%2F" frameborder="0" style="width: 100%; height: 100vh; border-radius: 0px; margin: 0;"></iframe>
              </div>
      `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    helios: {
      title: "Helios Browser",
      icon: "fas fa-globe",
      content: (() => {
        if (!checkFileProtocol()) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
              <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--error-red); margin-bottom: 2rem;"></i>
              <h2 style="margin-bottom: 1rem; color: var(--text-primary);">Helios Unavailable</h2>
              <p style="color: var(--text-secondary); text-align: center; max-width: 400px;">Helios Browser doesn't work on file:// protocol. Please run NautilusOS from a web server to use this feature.</p>
            </div>
          `;
        }
        return `
        <div class="browser-container" style="overflow: hidden;">
                      <iframe src="/app/helios.html" frameborder="0" style="width: 100%; height: 100vh; border-radius: 0px; margin: 0;"></iframe>
              </div>
      `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
    appstore: {
      title: "App Store",
      icon: "fas fa-store",
      content: (() => {
        const lightThemeInstalled = installedThemes.includes("light");
        return `
              <div class="appstore-content">
                  <div class="appstore-sidebar">
          <div class="appstore-section active" onclick="switchAppStoreSection('themes', this)">
              <i class="fas fa-palette"></i>
              <span>Themes</span>
          </div>
          <div class="appstore-section" onclick="switchAppStoreSection('apps', this)">
              <i class="fas fa-th"></i>
              <span>Apps</span>
          </div>
          <div class="appstore-section" onclick="switchAppStoreSection('games', this)">
              <i class="fas fa-gamepad"></i>
              <span>Games</span>
          </div>
      </div>
                  <div class="appstore-main" id="appstoreMain">
                      <div class="appstore-header">
                          <h2>Themes</h2>
                          <p>Customize your NautilusOS experience</p>
                      </div>
                      <div class="appstore-grid">
                          <div class="appstore-item">
                              <div class="appstore-item-icon">
                                  <i class="fas fa-moon"></i>
                              </div>
                              <div class="appstore-item-name">Dark Theme by dinguschan</div>
                              <div class="appstore-item-desc">The default NautilusOS theme. Sleek dark interface with teal accents, perfect for extended use and reducing eye strain.</div>
                              <button class="appstore-item-btn installed" style="opacity: 0.6; cursor: not-allowed;" disabled>
                                  Installed (Default)
                              </button>
                          </div>
                          <div class="appstore-item">
                              <div class="appstore-item-icon">
                                  <i class="fas fa-sun"></i>
                              </div>
                              <div class="appstore-item-name">Light Theme by dinguschan</div>
                              <div class="appstore-item-desc">A bright and clean theme perfect for daytime use. Easy on the eyes with light backgrounds and dark text.</div>
                              <button class="appstore-item-btn ${
                                lightThemeInstalled ? "installed" : ""
                              }" onclick="${
          lightThemeInstalled
            ? "uninstallTheme('light')"
            : "installTheme('light')"
        }">
                                  ${
                                    lightThemeInstalled
                                      ? "Uninstall"
                                      : "Install"
                                  }
                              </button>
                          </div>
                          <div class="appstore-item">
                              <div class="appstore-item-icon">
                                  <i class="fas fa-crown" style="color: #d4af37;"></i>
                              </div>
                              <div class="appstore-item-name">Golden Theme by lanefiedler-731</div>
                              <div class="appstore-item-desc">Elegant golden accents with warm, luxurious dark backgrounds. Perfect for a premium look.</div>
                              <button class="appstore-item-btn ${
                                installedThemes.includes("golden")
                                  ? "installed"
                                  : ""
                              }" onclick="${
          installedThemes.includes("golden")
            ? "uninstallTheme('golden')"
            : "installTheme('golden')"
        }">
                                  ${
                                    installedThemes.includes("golden")
                                      ? "Uninstall"
                                      : "Install"
                                  }
                              </button>
                          </div>
                          <div class="appstore-item">
                              <div class="appstore-item-icon">
                                  <i class="fas fa-fire" style="color: #ef4444;"></i>
                              </div>
                              <div class="appstore-item-name">Red Theme by lanefiedler-731</div>
                              <div class="appstore-item-desc">Bold and vibrant red accents for those who want to stand out. Energy meets elegance.</div>
                              <button class="appstore-item-btn ${
                                installedThemes.includes("red")
                                  ? "installed"
                                  : ""
                              }" onclick="${
          installedThemes.includes("red")
            ? "uninstallTheme('red')"
            : "installTheme('red')"
        }">
                                  ${
                                    installedThemes.includes("red")
                                      ? "Uninstall"
                                      : "Install"
                                  }
                              </button>
                          </div>
                          <div class="appstore-item">
                              <div class="appstore-item-icon">
                                  <i class="fas fa-droplet" style="color: #3b82f6;"></i>
                              </div>
                              <div class="appstore-item-name">Blue Theme by lanefiedler-731</div>
                              <div class="appstore-item-desc">Cool and calming blue tones. Professional and soothing for extended use.</div>
                              <button class="appstore-item-btn ${
                                installedThemes.includes("blue")
                                  ? "installed"
                                  : ""
                              }" onclick="${
          installedThemes.includes("blue")
            ? "uninstallTheme('blue')"
            : "installTheme('blue')"
        }">
                                  ${
                                    installedThemes.includes("blue")
                                      ? "Uninstall"
                                      : "Install"
                                  }
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
              `;
      })(),
      noPadding: true,
      width: 900,
      height: 600,
    },
snake: {
      title: "Snake",
      icon: "fas fa-gamepad",
      content: `
        <div class="snake-game" id="snakeGameContainer" style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg-primary); padding: 20px; gap: 40px;">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="text-align: center;">
              <h2 style="color: var(--accent); margin: 0 0 10px 0; font-size: 48px; font-weight: bold; font-family: fontb;">Snake</h2>
              <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 15px;">Eat food and grow!</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 15px; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
              <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Score</div>
                <div id="snakeScore" style="color: var(--accent); font-size: 32px; font-weight: bold; font-family: fontb;">0</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">High Score</div>
                <div id="snakeHighScore" style="color: var(--accent); font-size: 32px; font-weight: bold; font-family: fontb;">0</div>
              </div>
              <button id="snakeStartBtn" class="editor-btn" onclick="startSnakeGame()" style="background: var(--accent); color: var(--bg-primary); border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: fontb;">Start Game</button>
              
              <div style="color: var(--text-secondary); font-size: 11px; text-align: center; line-height: 1.6; margin-top: 10px; padding-top: 15px; border-top: 1px solid var(--border);">
                <div style="margin-bottom: 8px;"><strong>Controls:</strong></div>
                <div>Arrow Keys or WASD</div>
                <div style="margin-top: 8px;">SPACE: Pause/Resume</div>
                <div>R: Restart</div>
              </div>
            </div>
          </div>
          
          <canvas id="snakeCanvas" width="400" height="400" style="background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);"></canvas>
        </div>
      `,
      noPadding: true,
      width: 700,
      height: 600,
    },
tictactoe: {
      title: "Tic-Tac-Toe",
      icon: "fas fa-circle",
      content: `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--bg-primary); padding: 20px; gap: 40px;">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="text-align: center;">
              <h2 style="color: var(--accent); margin: 0 0 10px 0; font-size: 36px; font-weight: bold; font-family: fontb;">Tic-Tac-Toe</h2>
              <div id="tttStatus" style="color: var(--text-primary); font-size: 16px; margin-bottom: 15px; font-weight: 500;">Your turn (X)</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 15px; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
              <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Wins</div>
                <div id="tttWins" style="color: var(--success-green); font-size: 28px; font-weight: bold; font-family: fontb;">0</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Losses</div>
                <div id="tttLosses" style="color: var(--error-red); font-size: 28px; font-weight: bold; font-family: fontb;">0</div>
              </div>
              <div style="text-align: center;">
                <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Draws</div>
                <div id="tttDraws" style="color: var(--text-secondary); font-size: 28px; font-weight: bold; font-family: fontb;">0</div>
              </div>
              <button id="tttResetBtn" class="editor-btn" onclick="startTicTacToe()" style="background: var(--accent); color: var(--bg-primary); border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: fontb; margin-top: 10px;">New Game</button>
            </div>
          </div>
          
          <div id="tttBoard" style="display: grid; grid-template-columns: repeat(3, 120px); gap: 10px;"></div>
        </div>
      `,
      noPadding: true,
      width: 650,
      height: 550,
    },  };

  if (appName === "achievements") {
    openAchievements();
    return;
  }

  if (apps[appName]) {
    const app = apps[appName];
    trackAppOpened(appName);
    createWindow(
      app.title,
      app.icon,
      app.content,
      app.width || 800,
      app.height || 600,
      appName,
      app.noPadding || false
    );

    if (appName === "settings") {
      setTimeout(() => {
        initializeAppearanceSettings();
      }, 50);
    }
    if (appName === "terminal") {
      setTimeout(() => {
        const input = document.getElementById("terminalInput");
        if (input) input.focus();
      }, 100);
    }
    if (appName === "browser") {
      setTimeout(() => {
        showToast(
          "Nautilus Browser not good enough? Check out Helios Browser and UV on the App Store!",
          "fa-info-circle"
        );
      }, 500);
    }
    if (appName === "whatsnew") {
      currentSlide = 0;
    }
    if (appName === "snake") {
      setTimeout(() => {
        snakeGame.canvas = document.getElementById('snakeCanvas');
        if (snakeGame.canvas) {
          snakeGame.ctx = snakeGame.canvas.getContext('2d');
          snakeGame.highScore = localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0;
          document.getElementById('snakeHighScore').textContent = snakeGame.highScore;
          drawSnakeGame();
        }
      }, 50);
    }
    if (appName === "2048") {
      setTimeout(() => {
        start2048Game();
      }, 50);
    }
    
    if (appName === "tictactoe") {
      setTimeout(() => {
        startTicTacToe();
      }, 50);
    }
  }
}

function handleTerminalInput(e) {
  if (e.key === "Enter") {
    const input = e.target;
    const command = input.value.trim();
    const terminal = document.getElementById("terminalContent");

    const cmdLine = document.createElement("div");
    cmdLine.className = "terminal-line";
    cmdLine.innerHTML = `<span class="terminal-prompt">user@nautilusos:~$ </span>${command}`;
    terminal.insertBefore(cmdLine, terminal.lastElementChild);

    const output = document.createElement("div");
    output.className = "terminal-line";

    if (command === "help") {
      output.innerHTML =
        "Available commands:<br>" +
        "help - Show this list<br>" +
        "ls - List files in file system<br>" +
        "apps - List installed applications<br>" +
        "themes - List installed themes<br>" +
        "clear - Clear terminal<br>" +
        "date - Show current date and time<br>" +
        "whoami - Display current username<br>" +
        "reset-boot - Reset bootloader preferences<br>" +
        "echo [text] - Display text";
    } else if (command === "ls") {
      const tree = ".\n" + generateFileTree(fileSystem);
      output.innerHTML =
        '<pre style="margin: 0; font-family: inherit;">' + tree + "</pre>";
    } else if (command === "apps") {
      const appList = [
        "Files - File manager and explorer",
        "Terminal - Command line interface",
        "Browser - Web browser",
        "Settings - System settings",
        "Text Editor - Edit text files",
        "Music - Music player",
        "Photos - Photo viewer",
        "Help - System help and documentation",
        "What's New - View latest features",
        "App Store - Browse and install apps/themes",
      ];
      output.innerHTML =
        '<span style="color: var(--accent);">Installed Applications:</span><br>' +
        appList.map((app) => `  • ${app}`).join("<br>");
    } else if (command === "themes") {
      const themeList = ["Dark Theme (Default)"];
      if (installedThemes.length > 0) {
        installedThemes.forEach((theme) => {
          themeList.push(
            `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`
          );
        });
      }
      output.innerHTML =
        '<span style="color: var(--accent);">Installed Themes:</span><br>' +
        themeList.map((theme) => `  • ${theme}`).join("<br>");
    } else if (command === "whoami") {
      output.textContent = currentUsername;
    } else if (command === "reset-boot") {
      localStorage.removeItem("nautilusOS_bootChoice");
      output.innerHTML =
        '<span style="color: #4ade80;">✓ Bootloader preferences reset successfully</span><br>' +
        "The bootloader menu will appear on next page reload.";
    } else if (command === "clear") {
      terminal.innerHTML = `
                      <div class="terminal-line" style="color: var(--accent);">NautilusOS Terminal v1.0</div>
                      <div class="terminal-line" style="color: #888; margin-bottom: 1rem;">Type 'help' for available commands</div>
                  `;
    } else if (command === "date") {
      output.textContent = new Date().toString();
    } else if (command.startsWith("echo ")) {
      output.textContent = command.substring(5);
    } else if (command) {
      output.innerHTML = `<span style="color: #ef4444;">Command not found: ${command}</span><br>Type 'help' for available commands.`;
    }

    if (command !== "clear" && command) {
      terminal.insertBefore(output, terminal.lastElementChild);
    }

    const newInputLine = document.createElement("div");
    newInputLine.className = "terminal-line";
    newInputLine.innerHTML =
      '<span class="terminal-prompt">user@nautilusos:~$ </span><input type="text" class="terminal-input" id="terminalInput" onkeypress="handleTerminalInput(event)">';

    terminal.removeChild(terminal.lastElementChild);
    terminal.appendChild(newInputLine);

    const newInput = document.getElementById("terminalInput");
    if (newInput) newInput.focus();

    terminal.scrollTop = terminal.scrollHeight;
  }
}

function toggleSetting(setting) {
  if (setting === "showWhatsNew") {
    const currentValue = localStorage.getItem("nautilusOS_showWhatsNew");
    const newValue = currentValue === "false" ? "true" : "false";
    localStorage.setItem("nautilusOS_showWhatsNew", newValue);

    const toggles = document.querySelectorAll(".toggle-switch");
    toggles.forEach((toggle) => {
      const parent = toggle.parentElement;
      if (parent.textContent.includes("Show on Startup")) {
        if (newValue === "true") {
          toggle.classList.add("active");
        } else {
          toggle.classList.remove("active");
        }
      }
    });
    return;
  }

  settings[setting] = !settings[setting];
  saveSettingsToLocalStorage();
  trackSettingChanged(setting);

  if (setting === "showDesktopIcons") {
    const icons = document.getElementById("desktopIcons");
    if (settings.showDesktopIcons) {
      icons.classList.remove("hidden");
    } else {
      icons.classList.add("hidden");
    }
  }

  const toggles = document.querySelectorAll(".toggle-switch");
  toggles.forEach((toggle) => {
    const parent = toggle.parentElement;
    if (parent.textContent.includes("12-Hour") && setting === "use12Hour") {
      toggle.classList.toggle("active");
    } else if (
      parent.textContent.includes("Show Seconds") &&
      setting === "showSeconds"
    ) {
      toggle.classList.toggle("active");
    } else if (
      parent.textContent.includes("Show Desktop Icons") &&
      setting === "showDesktopIcons"
    ) {
      toggle.classList.toggle("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") login();
    });
  }
});

document.addEventListener("click", (e) => {
  const startMenu = document.getElementById("startMenu");

  if (
    startMenu &&
    !startMenu.contains(e.target) &&
    !e.target.closest(".taskbar-icon")
  ) {
    startMenu.classList.remove("active");
  }
});

function readImageFile(file, onLoad) {
  const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
  if (!file) return false;
  if (!allowedTypes.includes(file.type)) {
    showToast("Please choose a PNG, JPG, or GIF image.", "fa-exclamation-circle");
    setImageError("Only PNG, JPG, or GIF files are supported.");
    return false;
  }
  const maxBytes = 3 * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast("Image must be smaller than 3MB.", "fa-exclamation-circle");
    setImageError("Image must be smaller than 3MB.");
    return false;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setImageError("");
    onLoad(reader.result);
  };
  reader.readAsDataURL(file);
  return true;
}

function setImageError(message) {
  const el = document.getElementById("imageErrorMessage");
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.style.display = "block";
  } else {
    el.textContent = "";
    el.style.display = "none";
  }
}

function applyUserBackgrounds() {
  const desktop = document.getElementById("desktop");
  const login = document.getElementById("login");
  const wallpaperLayer = document.querySelector(".wallpaper");
  const wallpaperData = localStorage.getItem("nautilusOS_wallpaper");
  const loginBackgroundData = localStorage.getItem("nautilusOS_loginBackground");
  const sameSetting = localStorage.getItem("nautilusOS_useSameBackground");
  const useSame = sameSetting === null || sameSetting === "true";
  const loginData = useSame ? wallpaperData : loginBackgroundData;

  if (desktop) {
    if (wallpaperData) {
      desktop.style.background = `center / cover no-repeat url(${wallpaperData})`;
    } else {
      desktop.style.background =
        "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)";
    }
  }

  if (wallpaperLayer) {
    wallpaperLayer.style.display = wallpaperData ? "none" : "";
  }

  if (login) {
    if (loginData) {
      login.style.background = `center / cover no-repeat url(${loginData})`;
    } else {
      login.style.background =
        "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)";
    }
  }
}

function initializeAppearanceSettings() {
  const sameSetting = localStorage.getItem("nautilusOS_useSameBackground");
  const useSame = sameSetting === null || sameSetting === "true";
  const toggle = document.getElementById("loginWallpaperToggle");
  const controls = document.getElementById("loginWallpaperControls");
  const desktopButton = document.getElementById("desktopWallpaperButton");
  const loginButton = document.getElementById("loginWallpaperButton");
  const profileButton = document.getElementById("profilePictureButton");
  const hasWallpaper = !!localStorage.getItem("nautilusOS_wallpaper");
  const hasLoginWallpaper = !!localStorage.getItem("nautilusOS_loginBackground");
  const hasProfile = !!localStorage.getItem("nautilusOS_profilePicture");

  if (toggle) {
    if (useSame) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }
  }

  if (controls) {
    controls.style.display = useSame ? "none" : "";
  }

  if (desktopButton) {
    desktopButton.innerHTML = `<i class="fas fa-upload"></i> ${
      hasWallpaper ? "Change Desktop Wallpaper" : "Set Desktop Wallpaper"
    }`;
  }

  if (loginButton) {
    loginButton.innerHTML = `<i class="fas fa-upload"></i> ${
      hasLoginWallpaper ? "Change Login Wallpaper" : "Set Login Wallpaper"
    }`;
  }

  if (profileButton) {
    profileButton.innerHTML = `<i class="fas fa-upload"></i> ${
      hasProfile ? "Change Profile Picture" : "Set Profile Picture"
    }`;
  }
}

function handleWallpaperUpload(event) {
  const file = event.target.files[0];
  if (!readImageFile(file, (data) => {
    localStorage.setItem("nautilusOS_wallpaper", data);
    applyUserBackgrounds();
    initializeAppearanceSettings();
    showToast("Desktop wallpaper updated!", "fa-check-circle");
  })) {
    return;
  }
  event.target.value = "";
}

function clearWallpaper() {
  if (!localStorage.getItem("nautilusOS_wallpaper")) {
    showToast("No desktop wallpaper is set.", "fa-info-circle");
    return;
  }
  localStorage.removeItem("nautilusOS_wallpaper");
  applyUserBackgrounds();
  initializeAppearanceSettings();
  const input = document.getElementById("wallpaperInput");
  if (input) input.value = "";
  showToast("Desktop wallpaper reset.", "fa-check-circle");
}

function toggleLoginWallpaperLink(element) {
  const sameSetting = localStorage.getItem("nautilusOS_useSameBackground");
  const useSame = sameSetting === null || sameSetting === "true";
  const newValue = !useSame;
  localStorage.setItem("nautilusOS_useSameBackground", newValue ? "true" : "false");
  if (element) {
    if (newValue) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  }
  const controls = document.getElementById("loginWallpaperControls");
  if (controls) {
    controls.style.display = newValue ? "none" : "";
  }
  applyUserBackgrounds();
  initializeAppearanceSettings();
}

function handleLoginBackgroundUpload(event) {
  const file = event.target.files[0];
  if (!readImageFile(file, (data) => {
    localStorage.setItem("nautilusOS_loginBackground", data);
    applyUserBackgrounds();
    initializeAppearanceSettings();
    showToast("Login wallpaper updated!", "fa-check-circle");
  })) {
    return;
  }
  event.target.value = "";
}

function clearLoginWallpaper() {
  if (!localStorage.getItem("nautilusOS_loginBackground")) {
    showToast("No login wallpaper is set.", "fa-info-circle");
    return;
  }
  localStorage.removeItem("nautilusOS_loginBackground");
  applyUserBackgrounds();
  initializeAppearanceSettings();
  const input = document.getElementById("loginWallpaperInput");
  if (input) input.value = "";
  showToast("Login wallpaper reset.", "fa-check-circle");
}

function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (!readImageFile(file, (data) => {
    localStorage.setItem("nautilusOS_profilePicture", data);
    applyProfilePicture();
    initializeAppearanceSettings();
    showToast("Profile picture updated!", "fa-check-circle");
  })) {
    return;
  }
  event.target.value = "";
}

function clearProfilePicture() {
  if (!localStorage.getItem("nautilusOS_profilePicture")) {
    showToast("No profile picture is set.", "fa-info-circle");
    return;
  }
  localStorage.removeItem("nautilusOS_profilePicture");
  applyProfilePicture();
  initializeAppearanceSettings();
  const input = document.getElementById("profilePictureInput");
  if (input) input.value = "";
  showToast("Profile picture reset.", "fa-check-circle");
}

function applyProfilePicture() {
  const data = localStorage.getItem("nautilusOS_profilePicture");
  const avatars = document.querySelectorAll(".login-avatar, .start-avatar");
  avatars.forEach((avatar) => {
    if (data) {
      avatar.style.background = `center / cover no-repeat url(${data})`;
      avatar.classList.add("has-image");
    } else {
      avatar.style.background = "";
      avatar.classList.remove("has-image");
    }
  });
}

function updateLoginGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const greetingEl = document.getElementById("loginGreeting");
  let greeting = "Welcome Back";
  const username = localStorage.getItem("nautilusOS_username") || "User";

  if (hour >= 5 && hour < 12) {
    greeting = `Good Morning, ${username}`;
  } else if (hour >= 12 && hour < 17) {
    greeting = `Good Afternoon, ${username}`;
  } else if (hour >= 17 && hour < 22) {
    greeting = `Good Evening, ${username}`;
  } else {
    greeting = `Good Night, ${username}`;
  }

  if (greetingEl) {
    greetingEl.textContent = greeting;
  }
}

function getFileSystemAtPath(path) {
  let current = fileSystem;
  for (let segment of path) {
    if (current[segment] && typeof current[segment] === "object") {
      current = current[segment];
    } else {
      return null;
    }
  }
  return current;
}

function navigateToPath(path) {
  currentPath = [...path];
  if (windows["files"]) {
    updateFileExplorer();
  }
}

function updateFileExplorer() {
  if (!windows["files"]) return;

  let current = getFileSystemAtPath(currentPath);
  if (!current) {
    current = fileSystem;
    currentPath = [];
  }
  setTimeout(() => {
    expandTreeToPath(currentPath);
  }, 50);
  const fileExplorer = windows["files"].querySelector(".file-explorer");
  if (!fileExplorer) return;

  fileExplorer.innerHTML = `
              <div class="file-sidebar">
                  <div style="padding: 0.5rem 0.5rem 1rem; color: var(--text-primary); font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;">
                      <i class="fas fa-folder-tree"></i> File System
                  </div>
                  ${renderFileTree()}
              </div>
              <div class="file-main">
                  <div class="file-toolbar">
                      <button class="editor-btn" onclick="goUpDirectory()" ${
                        currentPath.length === 0
                          ? 'disabled style="opacity:0.5;cursor:not-allowed;"'
                          : ""
                      }>
                          <i class="fas fa-arrow-up"></i> Up
                      </button>
                      <button class="editor-btn" onclick="createNewFolder()">
                          <i class="fas fa-folder-plus"></i> New Folder
                      </button>
                      <div class="file-breadcrumb">
                          ${renderBreadcrumb()}
                      </div>
                  </div>
      <div class="file-grid">
                              ${Object.keys(current)
                                .sort()
                                .map((file) => {
                                  const isFolder =
                                    typeof current[file] === "object";
                                  const icon = isFolder
                                    ? "fa-folder"
                                    : "fa-file-alt";
                                  const escapedFile = file.replace(/'/g, "\\'");
                                  return `
                                      <div class="file-item" ondblclick="openFile('${escapedFile}')" onclick="selectFileItem(event, this, '${escapedFile}')" draggable="true" ondragstart="handleFileDragStart(event, '${escapedFile}')" ondragover="handleFileDragOver(event, ${isFolder})" ondrop="handleFileDrop(event, '${escapedFile}')">
                                          <i class="fas ${icon}"></i>
                                          <span>${file}</span>
                                          <div class="file-actions">
                                              <button class="file-action-btn" onclick="event.stopPropagation(); openFile('${escapedFile}')">
                                                  <i class="fas fa-folder-open"></i> Open
                                              </button>
                                              <button class="file-action-btn delete" onclick="event.stopPropagation(); deleteFile('${escapedFile}')">
                                                  <i class="fas fa-trash"></i> Delete
                                              </button>
                                          </div>
                                      </div>
                                  `;
                                })
                                .join("")}
                          </div>
              </div>
          `;
}

function renderFileTree(fs = fileSystem, parentPath = [], level = 0) {
  let html = "";

  Object.keys(fs)
    .sort()
    .forEach((name) => {
      const item = fs[name];
      const isFolder = typeof item === "object";
      const currentItemPath = [...parentPath, name];
      const pathString = currentItemPath.join("/");
      const isActive =
        JSON.stringify(currentItemPath) === JSON.stringify(currentPath);

      if (isFolder) {
        html += `
                      <div class="file-tree-item folder ${
                        isActive ? "active" : ""
                      }" onclick="navigateToFolderFromTree('${pathString}')" data-path="${pathString}">
                          <i class="fas fa-chevron-right" onclick="toggleTreeFolder(this.parentElement, '${pathString}', event)" style="cursor: pointer;"></i>
                          <i class="fas fa-folder"></i>
                          <span>${name}</span>
                      </div>
                      <div class="file-tree-children" data-path="${pathString}">
                          ${renderFileTree(item, currentItemPath, level + 1)}
                      </div>
                  `;
      } else {
        html += `
                      <div class="file-tree-item ${
                        isActive ? "active" : ""
                      }" onclick="openFileFromTree('${pathString}')" data-path="${pathString}">
                          <i class="fas fa-file-alt"></i>
                          <span>${name}</span>
                      </div>
                  `;
      }
    });

  return html;
}

function toggleTreeFolder(element, pathString, event) {
  event.stopPropagation();
  const children = document.querySelector(
    `.file-tree-children[data-path="${pathString}"]`
  );

  if (children) {
    const isExpanded = children.classList.contains("expanded");
    if (isExpanded) {
      children.classList.remove("expanded");
      element.classList.remove("expanded");
    } else {
      children.classList.add("expanded");
      element.classList.add("expanded");
    }
  }
}

function navigateToFolderFromTree(pathString) {
  const path = pathString ? pathString.split("/") : [];
  navigateToPath(path);
}

function openFileFromTree(pathString) {
  const path = pathString.split("/");
  const filename = path[path.length - 1];
  const parentPath = path.slice(0, -1);

  let current = fileSystem;
  for (let segment of parentPath) {
    current = current[segment];
  }

  const content = current[filename];
  if (typeof content === "string") {
    openApp("editor", content, filename);
  }
}

function renderBreadcrumb() {
  if (currentPath.length === 0) {
    return '<span class="breadcrumb-item" onclick="navigateToPath([])"><i class="fas fa-home"></i> Home</span>';
  }

  let html =
    '<span class="breadcrumb-item" onclick="navigateToPath([])"><i class="fas fa-home"></i> Home</span>';

  currentPath.forEach((segment, index) => {
    const path = currentPath.slice(0, index + 1);
    html += ' <span class="breadcrumb-separator">/</span> ';
    html += `<span class="breadcrumb-item" onclick='navigateToPath(${JSON.stringify(
      path
    )})'>${segment}</span>`;
  });

  return html;
}
const fileChecksum1 =
  "bWFkZSB3aXRoIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1oZWFydCI+PC9pPiBieSBkaW5ndXNjaGFu";
const fileChecksum2 = "YnkgZGluZ3VzY2hhbg";

function moveFileToFolder() {
  const bottomTextElement = document.getElementById("bottom-text");
  const bylineElement = document.querySelector(".wallpaper-byline");

  let bottomContent = "";
  let bylineContent = "";

  if (bottomTextElement) {
    bottomContent = bottomTextElement.innerHTML.trim();
  }

  if (bylineElement) {
    bylineContent = bylineElement.textContent.trim();
  }

  const expectedBottom = atob(fileChecksum1);
  const expectedByline = atob(fileChecksum2);

  const bottomValid = bottomContent === expectedBottom;
  const bylineValid = bylineContent === expectedByline;

  if (!bottomValid || !bylineValid) {
    window.openApp =
      window.closeWindow =
      window.minimizeWindow =
      window.showToast =
      window.handleTaskbarClick =
        function () {};

    const elements = document.querySelectorAll("div, body, html, :root");
    elements.forEach((el) => {
      el.style.transition = "none";
      el.style.animation = "none";
      el.style.backgroundColor = "var(--pure-black)";
      el.style.color = "var(--pure-black)";
      el.style.borderColor = "var(--pure-black)";
      el.style.boxShadow = "none";
      el.style.backgroundImage = "none";
    });

    document.body.innerHTML =
      '<div style="position:fixed;inset:0;background:var(--pure-black);z-index:99999;"></div>';

    return false;
  }

  return true;
}

moveFileToFolder();

function goUpDirectory() {
  if (currentPath.length > 0) {
    currentPath.pop();
    if (windows["files"]) {
      updateFileExplorer();
    }
  }
}

function createNewFolder() {
  const folderName = prompt("Enter folder name:");
  if (!folderName) return;

  let current = getFileSystemAtPath(currentPath);
  if (current && !current[folderName]) {
    current[folderName] = {};
    showToast("Folder created: " + folderName, "fa-folder-plus");
    if (windows["files"]) {
      updateFileExplorer();
    }
  } else {
    showToast(
      "Folder already exists or invalid location",
      "fa-exclamation-circle"
    );
  }
}

function showContextMenu(x, y, items) {
  const menu = document.getElementById("contextMenu");
  menu.innerHTML = items
    .map((item) => {
      if (item.divider) {
        return '<div class="context-menu-divider"></div>';
      }
      const disabledClass = item.disabled ? "disabled" : "";
      return `
                  <div class="context-menu-item ${disabledClass}" onclick="${item.action}">
                      <i class="fas ${item.icon}"></i>
                      <span>${item.label}</span>
                  </div>
              `;
    })
    .join("");

  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.classList.add("active");

  setTimeout(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = x - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = y - rect.height + "px";
    }
  }, 0);
}

function hideContextMenu() {
  const menu = document.getElementById("contextMenu");
  menu.classList.remove("active");
}

function refreshDesktop() {
  hideContextMenu();

  const openWindows = Object.keys(windows);

  if (openWindows.length === 0) {
    showToast("Desktop refreshed", "fa-sync");
    return;
  }

  const appsToReopen = [...openWindows];

  appsToReopen.forEach((appName) => {
    const windowEl = windows[appName];
    if (windowEl) {
      windowEl.remove();
    }
  });

  windows = {};
  focusedWindow = null;
  updateTaskbarIndicators();

  showToast("Refreshing all applications...", "fa-sync");

  setTimeout(() => {
    appsToReopen.forEach((appName, index) => {
      setTimeout(() => {
        openApp(appName);
      }, index * 100);
    });

    showToast(
      `Refreshed ${appsToReopen.length} application(s)`,
      "fa-check-circle"
    );
  }, 500);
}

function openNewTextFile() {
  hideContextMenu();
  openApp("editor", "", "");
}

function openNewFolder() {
  hideContextMenu();
  createNewFolder();
}

function initContextMenu() {
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".desktop-icon")) {
      e.preventDefault();
      const icon = e.target.closest(".desktop-icon");
      const appName = icon.getAttribute("data-app");
      showContextMenu(e.clientX, e.clientY, [
        {
          icon: "fa-folder-open",
          label: "Open",
          action: `hideContextMenu(); openApp('${appName}')`,
        },
        {
          divider: true,
        },
        {
          icon: "fa-info-circle",
          label: "Properties",
          action: `hideContextMenu(); showProperties('${appName}', ${e.clientX}, ${e.clientY})`,
        },
      ]);
      return;
    }

    if (e.target.closest(".window")) {
      e.preventDefault();
      const windowEl = e.target.closest(".window");
      const appName = windowEl.dataset.appName || "";
      const isMaximized = windowEl.dataset.maximized === "true";
      showContextMenu(e.clientX, e.clientY, [
        {
          icon: "fa-window-minimize",
          label: "Minimize",
          action: `hideContextMenu(); setTimeout(() => minimizeWindowByAppName('${appName}'), 50)`,
        },
        {
          icon: "fa-window-maximize",
          label: isMaximized ? "Restore" : "Maximize",
          action: `hideContextMenu(); setTimeout(() => maximizeWindowByAppName('${appName}'), 50)`,
        },
        {
          divider: true,
        },
        {
          icon: "fa-times",
          label: "Close Window",
          action: `hideContextMenu(); setTimeout(() => closeWindowByAppName('${appName}'), 50)`,
        },
        {
          divider: true,
        },
        {
          icon: "fa-question-circle",
          label: "Help",
          action: `hideContextMenu(); openApp('help')`,
        },
      ]);
      return;
    }

    if (e.target.closest("#desktop")) {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, [
        {
          icon: "fa-sync",
          label: "Refresh",
          action: "refreshDesktop()",
        },
        {
          divider: true,
        },
        {
          icon: "fa-file",
          label: "New Text File",
          action: "openNewTextFile()",
        },
        {
          icon: "fa-folder-plus",
          label: "New Folder",
          action: "openNewFolder()",
        },
        {
          divider: true,
        },
        {
          icon: "fa-question-circle",
          label: "Help",
          action: `hideContextMenu(); openApp('help')`,
        },
      ]);
      return;
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".context-menu")) {
      hideContextMenu();
    }
  });
}

let currentSlide = 0;

function changeSlide(direction) {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");

  if (!slides.length) return;

  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide += direction;

  if (currentSlide >= slides.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = slides.length - 1;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");

  if (!slides.length) return;

  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = index;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function initScrollIndicator() {
  const indicator = document.getElementById("scrollIndicator");
  if (!indicator) return;

  setTimeout(() => {
    if (document.documentElement.scrollHeight > window.innerHeight) {
      indicator.classList.add("visible");
    }
  }, 1000);

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop > 100) {
      indicator.classList.remove("visible");
    } else if (scrollHeight > clientHeight) {
      indicator.classList.add("visible");
    }
  });
}

let selectedFileItem = null;
let draggedFileName = null;

function selectFileItem(event, element, filename) {
  if (event.detail === 2) return;
  event.stopPropagation();

  if (selectedFileItem && selectedFileItem !== element) {
    selectedFileItem.classList.remove("selected");
  }

  if (element.classList.contains("selected")) {
    element.classList.remove("selected");
    selectedFileItem = null;
  } else {
    element.classList.add("selected");
    selectedFileItem = element;
  }
}

function handleFileDragStart(event, fileName) {
  draggedFileName = fileName;
  event.dataTransfer.setData("text/plain", fileName);
}

function handleFileDragOver(event, isFolder) {
  if (!isFolder || !draggedFileName) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";

  document
    .querySelectorAll(".file-item.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));

  event.currentTarget.classList.add("drag-over");
}

function handleFileDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("drag-over");
  }
}

function handleFileDrop(event, targetFolder) {
  event.preventDefault();

  document
    .querySelectorAll(".file-item.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));

  if (!draggedFileName || draggedFileName === targetFolder) return;

  if (!draggedFileName || draggedFileName === targetFolder) return;

  let current = getFileSystemAtPath(currentPath);
  if (
    !current ||
    !current[targetFolder] ||
    typeof current[targetFolder] !== "object"
  )
    return;

  const item = current[draggedFileName];
  if (!item) return;

  current[targetFolder][draggedFileName] = item;
  delete current[draggedFileName];

  showToast(
    `Moved "${draggedFileName}" to "${targetFolder}"`,
    "fa-check-circle"
  );
  draggedFileName = null;

  if (windows["files"]) {
    updateFileExplorer();
  }
}

function handleGlobalDragEnd() {
  document
    .querySelectorAll(".file-item.drag-over")
    .forEach((el) => el.classList.remove("drag-over"));
  draggedFileName = null;
}

document.addEventListener("dragend", handleGlobalDragEnd);

function deleteFile(filename) {
  const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
  if (!confirmed) return;

  let current = getFileSystemAtPath(currentPath);
  if (!current || !current[filename]) return;

  delete current[filename];
  showToast(`Deleted: ${filename}`, "fa-trash");

  if (selectedFileItem) {
    selectedFileItem = null;
  }

  if (windows["files"]) {
    updateFileExplorer();
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".file-item") && selectedFileItem) {
    selectedFileItem.classList.remove("selected");
    selectedFileItem = null;
  }
});

function expandTreeToPath(path) {
  let accumulated = [];
  for (let segment of path) {
    accumulated.push(segment);
    const pathString = accumulated.join("/");
    const treeItem = document.querySelector(
      `.file-tree-item[data-path="${pathString}"]`
    );
    const children = document.querySelector(
      `.file-tree-children[data-path="${pathString}"]`
    );

    if (treeItem && children) {
      treeItem.classList.add("expanded");
      children.classList.add("expanded");
    }
  }
}
let installedThemes = ["dark"];
let isPasswordless = false;

function switchAppStoreSection(section, element) {
  document
    .querySelectorAll(".appstore-section")
    .forEach((s) => s.classList.remove("active"));
  element.classList.add("active");

  const mainContent = document.getElementById("appstoreMain");

  if (section === "themes") {
    const lightThemeInstalled = installedThemes.includes("light");
    mainContent.innerHTML = `
              <div class="appstore-header">
                  <h2>Themes</h2>
                  <p>Customize your NautilusOS experience</p>
              </div>
              <div class="appstore-grid">
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-moon"></i>
                      </div>
                      <div class="appstore-item-name">Dark Theme by dinguschan</div>
                      <div class="appstore-item-desc">The default NautilusOS theme. Sleek dark interface with teal accents, perfect for extended use and reducing eye strain.</div>
                      <button class="appstore-item-btn installed" style="opacity: 0.6; cursor: not-allowed;" disabled>
                          Installed (Default)
                      </button>
                  </div>
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-sun"></i>
                      </div>
                      <div class="appstore-item-name">Light Theme by dinguschan</div>
                      <div class="appstore-item-desc">A bright and clean theme perfect for daytime use. Easy on the eyes with light backgrounds and dark text.</div>
                      <button class="appstore-item-btn ${
                        lightThemeInstalled ? "installed" : ""
                      }" onclick="${
      lightThemeInstalled ? "uninstallTheme('light')" : "installTheme('light')"
    }">
                          ${lightThemeInstalled ? "Uninstall" : "Install"}
                      </button>
                  </div>
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-crown" style="color: #d4af37;"></i>
                      </div>
                      <div class="appstore-item-name">Golden Theme by lanefiedler-731</div>
                      <div class="appstore-item-desc">Elegant golden accents with warm, luxurious dark backgrounds. Perfect for a premium look.</div>
                      <button class="appstore-item-btn ${
                        installedThemes.includes('golden') ? "installed" : ""
                      }" onclick="${installedThemes.includes('golden') ? "uninstallTheme('golden')" : "installTheme('golden')"}">
                          ${installedThemes.includes('golden') ? "Uninstall" : "Install"}
                      </button>
                  </div>
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-fire" style="color: #ef4444;"></i>
                      </div>
                      <div class="appstore-item-name">Red Theme by lanefiedler-731</div>
                      <div class="appstore-item-desc">Bold and vibrant red accents for those who want to stand out. Energy meets elegance.</div>
                      <button class="appstore-item-btn ${
                        installedThemes.includes('red') ? "installed" : ""
                      }" onclick="${installedThemes.includes('red') ? "uninstallTheme('red')" : "installTheme('red')"}">
                          ${installedThemes.includes('red') ? "Uninstall" : "Install"}
                      </button>
                  </div>
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-droplet" style="color: #3b82f6;"></i>
                      </div>
                      <div class="appstore-item-name">Blue Theme by lanefiedler-731</div>
                      <div class="appstore-item-desc">Cool and calming blue tones. Professional and soothing for extended use.</div>
                      <button class="appstore-item-btn ${
                        installedThemes.includes('blue') ? "installed" : ""
                      }" onclick="${installedThemes.includes('blue') ? "uninstallTheme('blue')" : "installTheme('blue')"}">
                          ${installedThemes.includes('blue') ? "Uninstall" : "Install"}
                      </button>
                  </div>
              </div>
          `;
  } else if (section === "apps") {
    const startupInstalled = installedApps.includes("startup-apps");
    const taskmanagerInstalled = installedApps.includes("task-manager");
    const snapManagerInstalled = installedApps.includes("snap-manager");
    const uvInstalled = installedApps.includes("uv");
    const heliosInstalled = installedApps.includes("helios");
    const vscInstalled = installedApps.includes("vsc");

    mainContent.innerHTML = `
                  <div class="appstore-header">
                      <h2>Apps</h2>
                      <p>Discover and install new applications</p>
                  </div>
                  <div class="appstore-grid">
                      <div class="appstore-item">
                          <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
    <div class="illustration-startup-window">
        <div class="illustration-startup-header">Startup Apps</div>
        <div class="illustration-startup-items">
            <div class="illustration-startup-item">
                <div class="illustration-startup-checkbox"></div>
                <div class="illustration-startup-icon"></div>
                <div class="illustration-startup-label"></div>
            </div>
            <div class="illustration-startup-item">
                <div class="illustration-startup-checkbox"></div>
                <div class="illustration-startup-icon"></div>
                <div class="illustration-startup-label"></div>
            </div>
            <div class="illustration-startup-item">
                <div class="illustration-startup-checkbox" style="background: rgba(125, 211, 192, 0.3);"></div>
                <div class="illustration-startup-icon"></div>
                <div class="illustration-startup-label"></div>
            </div>
        </div>
    </div>
</div>
                          <div class="appstore-item-name">Startup Apps by dinguschan</div>
<div class="appstore-item-desc">Control which applications launch automatically on login with this convenient this built-in app.</div>
<button class="appstore-item-btn ${
      startupInstalled ? "installed" : ""
    }" onclick="${
      startupInstalled
        ? "uninstallApp('startup-apps')"
        : "installApp('startup-apps')"
    }">
${startupInstalled ? "Uninstall" : "Install"}
</button>
<div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
</div>
<div class="appstore-item">
   <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
      <div class="illustration-taskmanager">
         <div class="illustration-taskmanager-header">
            <div class="illustration-taskmanager-title">Task Manager</div>
            <div class="illustration-taskmanager-stat">CPU: 45%</div>
         </div>
         <div class="illustration-taskmanager-processes">
            <div class="illustration-taskmanager-process">
               <div class="illustration-taskmanager-process-icon"></div>
               <div class="illustration-taskmanager-process-name"></div>
               <div class="illustration-taskmanager-process-bar">
                  <div class="illustration-taskmanager-process-fill" style="width: 60%;"></div>
               </div>
            </div>
            <div class="illustration-taskmanager-process">
               <div class="illustration-taskmanager-process-icon"></div>
               <div class="illustration-taskmanager-process-name"></div>
               <div class="illustration-taskmanager-process-bar">
                  <div class="illustration-taskmanager-process-fill" style="width: 35%;"></div>
               </div>
            </div>
            <div class="illustration-taskmanager-process">
               <div class="illustration-taskmanager-process-icon"></div>
               <div class="illustration-taskmanager-process-name"></div>
               <div class="illustration-taskmanager-process-bar">
                  <div class="illustration-taskmanager-process-fill" style="width: 80%;"></div>
               </div>
            </div>
         </div>
      </div>
   </div>
   <div class="appstore-item-name">Task Manager by dinguschan</div>
   <div class="appstore-item-desc">Monitor and manage running applications and windows. View system statistics and close unresponsive apps with ease.</div>
   <button class="appstore-item-btn ${
     taskmanagerInstalled ? "installed" : ""
   }" onclick="${
      taskmanagerInstalled
        ? "uninstallApp('task-manager')"
        : "installApp('task-manager')"
    }">
   ${taskmanagerInstalled ? "Uninstall" : "Install"}
   </button>
   <div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
</div>
<div class="appstore-item">
   <div class="appstore-item-icon">
      <i class="fas fa-border-all"></i>
   </div>
   <div class="appstore-item-name">Snap Manager by lanefiedler-731</div>
   <div class="appstore-item-desc">Add window snapping with animated previews. Customize layouts, assign shortcuts, and drag to see live guides.</div>
   <button class="appstore-item-btn ${
     snapManagerInstalled ? "installed" : ""
   }" onclick="${
      snapManagerInstalled
        ? "uninstallApp('snap-manager')"
        : "installApp('snap-manager')"
    }">
   ${snapManagerInstalled ? "Uninstall" : "Install"}
   </button>
   <div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
</div>
<div class="appstore-item">
   <div class="appstore-item-icon">
      <i class="fas fa-globe"></i>
   </div>
   <div class="appstore-item-name">Ultraviolet by $xor</div>
   <div class="appstore-item-desc">Open up a whole new browsing experience, powered by Ultraviolet.</div>
   <button class="appstore-item-btn ${
     uvInstalled ? "installed" : ""
   }" onclick="${uvInstalled ? "uninstallApp('uv')" : "installApp('uv')"}">
   ${uvInstalled ? "Uninstall" : "Install"}
   </button>
</div>
<div class="appstore-item">
   <div class="appstore-item-icon">
      <i class="fas fa-globe"></i>
   </div>
   <div class="appstore-item-name">Helios by dinguschan</div>
   <div class="appstore-item-desc">The classic CORS proxy you know and love, fit in to one single file.</div>
   <button class="appstore-item-btn ${
     heliosInstalled ? "installed" : ""
   }" onclick="${
      heliosInstalled ? "uninstallApp('helios')" : "installApp('helios')"
    }">
   ${heliosInstalled ? "Uninstall" : "Install"}
   </button>
</div>
<div class="appstore-item">
   <div class="appstore-item-icon">
      <i class="fas fa-globe"></i>
   </div>
   <div class="appstore-item-name">Visual Studio Code</div>
   <div class="appstore-item-desc">The developer's choice for text editing, now on NautilusOS.</div>
   <button class="appstore-item-btn ${
     vscInstalled ? "installed" : ""
   }" onclick="${
      vscInstalled ? "uninstallApp('vsc')" : "installApp('vsc')"
    }">
   ${vscInstalled ? "Uninstall" : "Install"}
   </button>
</div>
</div>
</div>
</div>
              `;
  } else if (section === "games") {
    mainContent.innerHTML = `
              <div class="appstore-header">
                  <h2>Games</h2>
                  <p>Play and enjoy games on NautilusOS</p>
              </div>
              <div class="appstore-grid">
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-gamepad"></i>
                      </div>
                      <div class="appstore-item-name">Snake by lanefiedler-731</div>
                      <div class="appstore-item-desc">A classic snake game. Eat food, grow longer, and try to beat your high score without hitting the walls or yourself!</div>
                      <button class="appstore-item-btn ${
                        installedGames.includes("snake") ? "installed" : ""
                      }" onclick="${
      installedGames.includes("snake")
        ? "openApp('snake')"
        : "installGame('snake')"
    }">
                          ${installedGames.includes("snake") ? "Play" : "Install"}
                      </button>
                      <div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
                  </div>
                  
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-th"></i>
                      </div>
                      <div class="appstore-item-name">2048 by dinguschan</div>
                      <div class="appstore-item-desc">Slide tiles to combine numbers and reach 2048! A addictive puzzle game that's easy to learn but hard to master.</div>
                      <button class="appstore-item-btn ${
                        installedGames.includes("2048") ? "installed" : ""
                      }" onclick="${
      installedGames.includes("2048")
        ? "openApp('2048')"
        : "installGame('2048')"
    }">
                          ${installedGames.includes("2048") ? "Play" : "Install"}
                      </button>
                      <div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
                  </div>
                  
                  <div class="appstore-item">
                      <div class="appstore-item-icon">
                          <i class="fas fa-circle"></i>
                      </div>
                      <div class="appstore-item-name">Tic-Tac-Toe by dinguschan</div>
                      <div class="appstore-item-desc">Classic Tic-Tac-Toe against an AI opponent. Can you outsmart the computer and get three in a row?</div>
                      <button class="appstore-item-btn ${
                        installedGames.includes("tictactoe") ? "installed" : ""
                      }" onclick="${
      installedGames.includes("tictactoe")
        ? "openApp('tictactoe')"
        : "installGame('tictactoe')"
    }">
                          ${installedGames.includes("tictactoe") ? "Play" : "Install"}
                      </button>
                      <div class="offline-support"><i class="fa-solid fa-check"></i> OFFLINE SUPPORT</div>
                  </div>
              </div>
          `;
  }
}
function installTheme(themeName) {
  if (installedThemes.includes(themeName)) {
    showToast("Theme already installed", "fa-info-circle");
    return;
  }

  installedThemes.push(themeName);
  localStorage.setItem(
    "nautilusOS_installedThemes",
    JSON.stringify(installedThemes)
  );
  showToast("Theme installed! Go to Settings to apply it.", "fa-check-circle");
  
  unlockAchievement("theme-changer");

  refreshAppStore();
}

function uninstallTheme(themeName) {
  const index = installedThemes.indexOf(themeName);
  if (index > -1) {
    installedThemes.splice(index, 1);
    localStorage.setItem(
      "nautilusOS_installedThemes",
      JSON.stringify(installedThemes)
    );
    showToast("Theme uninstalled", "fa-trash");

    refreshAppStore();
  }
}

const themeDefinitions = {
  dark: { accent: "#7dd3c0", accentHover: "#6bc4b0", accentDark: "#469483", bgPrimary: "#0a0e1a", bgSecondary: "#151923", textPrimary: "#e8eaed", textSecondary: "#9aa0a6", border: "#7dd3c0" },
  light: { accent: "#06b6d4", accentHover: "#0891b2", accentDark: "#0d9488", bgPrimary: "#f8fafc", bgSecondary: "#ffffff", textPrimary: "#ffffff", textSecondary: "#475569", border: "#e2e8f0" },
  golden: { accent: "#d4af37", accentHover: "#c9a227", accentDark: "#997618", bgPrimary: "#1a1410", bgSecondary: "#2d2417", textPrimary: "#f5e6d3", textSecondary: "#b8a88a", border: "#d4af37" },
  red: { accent: "#ef4444", accentHover: "#dc2626", accentDark: "#991b1b", bgPrimary: "#1a0f0f", bgSecondary: "#2d1818", textPrimary: "#ffe8e8", textSecondary: "#cc9999", border: "#ef4444" },
  blue: { accent: "#3b82f6", accentHover: "#2563eb", accentDark: "#1e40af", bgPrimary: "#0f1419", bgSecondary: "#1a2332", textPrimary: "#e0e7ff", textSecondary: "#94a3b8", border: "#3b82f6" },
  purple: { accent: "#a855f7", accentHover: "#9333ea", accentDark: "#7e22ce", bgPrimary: "#1a0f2e", bgSecondary: "#2d1b47", textPrimary: "#f3e8ff", textSecondary: "#d8b4fe", border: "#a855f7" },
  green: { accent: "#10b981", accentHover: "#059669", accentDark: "#047857", bgPrimary: "#0f2e1b", bgSecondary: "#1a3d2a", textPrimary: "#d1fae5", textSecondary: "#a7f3d0", border: "#10b981" },
};

function applyTheme(themeName) {
  const theme = themeDefinitions[themeName];
  if (!theme) { console.warn("Theme not found:", themeName); return; }
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-hover", theme.accentHover);
  document.documentElement.style.setProperty("--accent-dark", theme.accentDark);
  document.documentElement.style.setProperty("--bg-primary", theme.bgPrimary);
  document.documentElement.style.setProperty("--bg-secondary", theme.bgSecondary);
  document.documentElement.style.setProperty("--text-primary", theme.textPrimary);
  document.documentElement.style.setProperty("--text-secondary", theme.textSecondary);
  document.documentElement.style.setProperty("--border", theme.border);
  localStorage.setItem("nautilusOS_currentTheme", themeName);
  appliedThemeName = themeName;
}

function refreshAppStore() {
  const activeSection = document.querySelector(".appstore-section.active");
  if (!activeSection) return;

  const sectionText = activeSection.textContent.trim().toLowerCase();
  if (sectionText.includes("themes")) {
    switchAppStoreSection("themes", activeSection);
  } else if (sectionText.includes("apps")) {
    switchAppStoreSection("apps", activeSection);
  } else if (sectionText.includes("games")) {
    switchAppStoreSection("games", activeSection);
  } else if (sectionText.includes("tools")) {
    switchAppStoreSection("tools", activeSection);
  }
}

let occupiedGridCells = new Set();

function handleTaskbarClick(appName) {
  if (windows[appName]) {
    const win = windows[appName];
    if (win.style.display === "none") {
      win.style.display = "block";
      win.classList.remove("minimized");
    }
    focusWindow(win);
    focusedWindow = appName;
    updateTaskbarIndicators();
  } else {
    openApp(appName);
  }
}
let audioPlayer = null;
let currentMusicFile = null;

function loadMusicFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    showToast("Please select a valid audio file", "fa-exclamation-circle");
    return;
  }

  audioPlayer = document.getElementById("audioPlayer");
  if (!audioPlayer) return;

  const url = URL.createObjectURL(file);
  audioPlayer.src = url;
  currentMusicFile = file.name;

  const fileName = file.name.replace(/\.[^/.]+$/, "");
  document.getElementById("musicTitle").textContent = fileName;
  document.getElementById("musicArtist").textContent = "Local File";

  audioPlayer.addEventListener("loadedmetadata", () => {
    document.getElementById("totalTime").textContent = formatTime(
      audioPlayer.duration
    );
  });

  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", () => {
    const playBtn = document.getElementById("playPauseBtn");
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  });

  const volumeSlider = document.getElementById("volumeSlider");
  audioPlayer.volume = volumeSlider.value / 100;

  showToast("Music loaded: " + fileName, "fa-music");
}

function togglePlayPause() {
  if (!audioPlayer || !audioPlayer.src) {
    showToast("Please load a music file first", "fa-info-circle");
    return;
  }

  const playBtn = document.getElementById("playPauseBtn");

  if (audioPlayer.paused) {
    audioPlayer.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audioPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function updateProgress() {
  if (!audioPlayer) return;

  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("currentTime").textContent = formatTime(
    audioPlayer.currentTime
  );
}

function seekMusic(event) {
  if (!audioPlayer || !audioPlayer.src) return;

  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = x / rect.width;
  const newTime = percentage * audioPlayer.duration;

  audioPlayer.currentTime = newTime;
}

function changeVolume(value) {
  if (audioPlayer) {
    audioPlayer.volume = value / 100;
  }
  document.getElementById("volumePercent").textContent = value + "%";
}

function skipForward() {
  if (!audioPlayer || !audioPlayer.src) return;
  audioPlayer.currentTime = Math.min(
    audioPlayer.currentTime + 10,
    audioPlayer.duration
  );
}

function skipBackward() {
  if (!audioPlayer || !audioPlayer.src) return;
  audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? "0" : "") + secs;
}

function restartMusic() {
  if (!audioPlayer || !audioPlayer.src) {
    showToast("Please load a music file first", "fa-info-circle");
    return;
  }
  audioPlayer.currentTime = 0;
  if (audioPlayer.paused) {
    audioPlayer.play();
    const playBtn = document.getElementById("playPauseBtn");
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
}

function toggleLoop() {
  if (!audioPlayer || !audioPlayer.src) {
    showToast("Please load a music file first", "fa-info-circle");
    return;
  }

  const loopBtn = document.getElementById("loopBtn");
  audioPlayer.loop = !audioPlayer.loop;

  if (audioPlayer.loop) {
    loopBtn.classList.add("active");
    showToast("Loop enabled", "fa-repeat");
  } else {
    loopBtn.classList.remove("active");
    showToast("Loop disabled", "fa-repeat");
  }
}

let browserTabs = [
  {
    id: 0,
    title: "New Tab",
    url: "",
    history: [],
    historyIndex: -1,
  },
];
let activeBrowserTab = 0;
let browserTabIdCounter = 1;

function createBrowserTab() {
  const newTab = {
    id: browserTabIdCounter++,
    title: "New Tab",
    url: "",
    history: [],
    historyIndex: -1,
  };
  browserTabs.push(newTab);

  const tabsContainer = document.getElementById("browserTabs");
  if (!tabsContainer) return;

  const newTabBtn = tabsContainer.querySelector(".browser-new-tab");

  const tabEl = document.createElement("div");
  tabEl.className = "browser-tab";
  tabEl.dataset.tabId = newTab.id;
  tabEl.innerHTML = `
              <i class="fas fa-globe browser-tab-icon"></i>
              <span class="browser-tab-title">New Tab</span>
              <div class="browser-tab-close">
                  <i class="fas fa-times"></i>
              </div>
          `;

  tabEl.addEventListener("click", (e) => {
    if (!e.target.closest(".browser-tab-close")) {
      switchBrowserTab(newTab.id);
    }
  });

  const closeBtn = tabEl.querySelector(".browser-tab-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeBrowserTab(newTab.id);
  });

  tabsContainer.insertBefore(tabEl, newTabBtn);

  const contentContainer = document.getElementById("browserContent");
  if (!contentContainer) return;

  const viewEl = document.createElement("div");
  viewEl.className = "browser-view";
  viewEl.dataset.viewId = newTab.id;
  viewEl.innerHTML = `
              <div class="browser-landing">
                  <i class="fas fa-fish browser-landing-logo"></i>
                  <div class="browser-landing-search">
                      <i class="fas fa-search"></i>
                      <input
                          type="text"
                          class="browser-landing-input"
                          placeholder="Search or enter website URL"
                          onkeypress="handleBrowserLandingInput(event)"
                      >
                  </div>
              </div>
          `;

  contentContainer.appendChild(viewEl);
  switchBrowserTab(newTab.id);
}
function switchBrowserTab(tabId) {
  activeBrowserTab = tabId;

  document.querySelectorAll(".browser-tab").forEach((tab) => {
    tab.classList.remove("active");
    if (parseInt(tab.dataset.tabId) === tabId) {
      tab.classList.add("active");
    }
  });

  document.querySelectorAll(".browser-view").forEach((view) => {
    view.classList.remove("active");
    if (parseInt(view.dataset.viewId) === tabId) {
      view.classList.add("active");
    }
  });

  const currentTab = browserTabs.find((t) => t.id === tabId);
  if (currentTab) {
    const urlInput = document.getElementById("browserUrlInput");
    if (urlInput) urlInput.value = currentTab.url;
    updateBrowserNavButtons();
  }
}

function closeBrowserTab(tabId) {
  if (browserTabs.length === 1) {
    showToast("Cannot close the last tab", "fa-exclamation-circle");
    return;
  }

  const tabIndex = browserTabs.findIndex((t) => t.id === tabId);
  if (tabIndex === -1) return;

  browserTabs.splice(tabIndex, 1);

  const tabEl = document.querySelector(`.browser-tab[data-tab-id="${tabId}"]`);
  const viewEl = document.querySelector(
    `.browser-view[data-view-id="${tabId}"]`
  );

  if (tabEl) tabEl.remove();
  if (viewEl) viewEl.remove();

  if (activeBrowserTab === tabId) {
    const newActiveTab = browserTabs[Math.max(0, tabIndex - 1)];
    if (newActiveTab) {
      switchBrowserTab(newActiveTab.id);
    }
  }
}

function handleBrowserUrlInput(event) {
  if (event.key === "Enter") {
    const input = event.target;
    navigateBrowser(input.value);
  }
}

function handleBrowserLandingInput(event) {
  if (event.key === "Enter") {
    const input = event.target;
    navigateBrowser(input.value);
  }
}

async function transport() {
  if (!await connection.getTransport()) {
    connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }])
  }
}

transport()

function navigateBrowser(input) {
  if (!input.trim()) return;

  let url = input.trim();

  if (!url.includes(".") || url.includes(" ")) {
    const searchEngine = localStorage.getItem('nOS_searchEngine') || 'https://search.brave.com/search?q=';
    url = searchEngine + encodeURIComponent(url);
  } else {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
  }

  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab) return;

  if (currentTab.historyIndex < currentTab.history.length - 1) {
    currentTab.history = currentTab.history.slice(
      0,
      currentTab.historyIndex + 1
    );
  }
  currentTab.history.push(url);
  currentTab.historyIndex++;
  currentTab.url = url;

  const finalUrl = url;

  loadBrowserPage(finalUrl);
}

async function loadBrowserPage(url) {
  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab) return;

  const viewEl = document.querySelector(
    `.browser-view[data-view-id="${activeBrowserTab}"]`
  );
  if (!viewEl) return;

  const urlInput = document.getElementById("browserUrlInput");
  if (urlInput) urlInput.value = url;

  const loading = document.getElementById("browserLoading");
  if (loading) loading.classList.add("active");

  try {
    viewEl.innerHTML = "";

    const proxiedUrl =
      "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(url);
    const response = await fetch(proxiedUrl);
    if (!response.ok) throw new Error("Failed to load page");
    const rawHtml = await response.text();
    const urlObj = new URL(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    if (!doc || !doc.documentElement) {
      throw new Error("Failed to parse page");
    }
    if (doc && doc.head) {
      const baseEl = doc.createElement("base");
      let baseHref = urlObj.origin + urlObj.pathname.replace(/[^/]*$/, "");
      if (!baseHref.endsWith("/")) {
        baseHref += "/";
      }
      baseEl.setAttribute("href", baseHref);
      doc.head.prepend(baseEl);
    }
    viewEl.innerHTML = doc.documentElement.innerHTML;
    const links = viewEl.querySelectorAll("a[target]");
    links.forEach((link) => link.removeAttribute("target"));
    const forms = viewEl.querySelectorAll("form[target]");
    forms.forEach((form) => form.removeAttribute("target"));
    const scripts = Array.from(viewEl.querySelectorAll("script"));
    for (const script of scripts) {
      const replacement = document.createElement("script");
      for (const attr of script.attributes) {
        replacement.setAttribute(attr.name, attr.value);
      }
      replacement.textContent = script.textContent;
      script.replaceWith(replacement);
    }
    const title = new URL(url).hostname;
    currentTab.title = title;
    const tabEl = document.querySelector(
      `.browser-tab[data-tab-id="${activeBrowserTab}"]`
    );
    if (tabEl) {
      const titleEl = tabEl.querySelector(".browser-tab-title");
      if (titleEl) titleEl.textContent = currentTab.title;
    }
    viewEl.scrollTop = 0;
    viewEl.onclick = (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;
      event.preventDefault();
      let targetUrl;
      try {
        targetUrl = new URL(href, url).toString();
      } catch (_) {
        return;
      }
      navigateBrowser(targetUrl);
    };
    viewEl.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) {
          return;
        }
        const method = (form.getAttribute("method") || "GET").toUpperCase();
        if (method !== "GET") {
          return;
        }
        event.preventDefault();
        let action = form.getAttribute("action") || url;
        let targetUrl;
        try {
          targetUrl = new URL(action, url);
        } catch (_) {
          return;
        }
        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          if (typeof value === "string") {
            params.append(key, value);
          }
        }
        const queryString = params.toString();
        if (queryString) {
          targetUrl.search = queryString;
        }
        navigateBrowser(targetUrl.toString());
      },
      true
    );
    updateBrowserNavButtons();

    setTimeout(() => {
      iframe.src = url
      iframe.onload = () => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          const title = iframeDoc.title || new URL(url).hostname;
          currentTab.title = title;

          const tabEl = document.querySelector(
            `.browser-tab[data-tab-id="${activeBrowserTab}"]`
          );
          if (tabEl) {
            const titleEl = tabEl.querySelector(".browser-tab-title");
            if (titleEl) titleEl.textContent = title;
          }
        } catch (err) {
          const title = new URL(url).hostname;
          currentTab.title = title;

          const tabEl = document.querySelector(
            `.browser-tab[data-tab-id="${activeBrowserTab}"]`
          );
          if (tabEl) {
            const titleEl = tabEl.querySelector(".browser-tab-title");
            if (titleEl) titleEl.textContent = title;
          }
        }
      }
    }, 500);
  } catch (error) {
    console.error("Browser error:", error);
    viewEl.innerHTML = `
                  <div class="browser-error">
                      <i class="fas fa-exclamation-triangle browser-error-icon"></i>
                      <h2 class="browser-error-title">Unable to Load Page</h2>
                      <p class="browser-error-message">The page could not be loaded. Some websites prevent embedding for security reasons. Try visiting the site directly.</p>
                      <button class="browser-error-btn" onclick="window.open('${url}', '_blank')">Open in New Tab</button>
                  </div>
              `;
  } finally {
    if (loading) loading.classList.remove("active");
  }
}
function browserGoBack() {
  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab || currentTab.historyIndex <= 0) return;

  currentTab.historyIndex--;
  const url = currentTab.history[currentTab.historyIndex];
  currentTab.url = url;

  loadBrowserPage(url);
}
function browserGoForward() {
  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab || currentTab.historyIndex >= currentTab.history.length - 1)
    return;

  currentTab.historyIndex++;
  const url = currentTab.history[currentTab.historyIndex];
  currentTab.url = url;

  loadBrowserPage(url);
}

function browserReload() {
  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab || !currentTab.url) {
    showToast("No page to reload", "fa-info-circle");
    return;
  }

  loadBrowserPage(currentTab.url);
}

function updateBrowserNavButtons() {
  const currentTab = browserTabs.find((t) => t.id === activeBrowserTab);
  if (!currentTab) return;

  const backBtn = document.getElementById("browserBack");
  const forwardBtn = document.getElementById("browserForward");

  if (backBtn) {
    backBtn.disabled = currentTab.historyIndex <= 0;
  }

  if (forwardBtn) {
    forwardBtn.disabled =
      currentTab.historyIndex >= currentTab.history.length - 1;
  }
}
let calcCurrentValue = "0";
let calcPreviousValue = "";
let calcOperation = "";
let calcShouldResetDisplay = false;

function calcInput(value) {
  const display = document.getElementById("calcDisplay");
  const history = document.getElementById("calcHistory");
  if (!display) return;

  if (calcShouldResetDisplay) {
    calcCurrentValue = "";
    calcShouldResetDisplay = false;
  }

  if (["+", "-", "*", "/", "%"].includes(value)) {
    if (calcCurrentValue === "" || calcCurrentValue === "0") return;

    if (calcPreviousValue !== "" && calcOperation !== "") {
      calcEquals();
    }

    calcOperation = value;
    calcPreviousValue = calcCurrentValue;
    calcCurrentValue = "";

    if (history) {
      const opSymbol = value === "*" ? "×" : value === "/" ? "÷" : value;
      history.textContent = `${calcPreviousValue} ${opSymbol}`;
    }

    display.textContent = "0";
    return;
  }

  if (value === "." && calcCurrentValue.includes(".")) return;

  if (calcCurrentValue === "0" && value !== ".") {
    calcCurrentValue = value;
  } else {
    calcCurrentValue += value;
  }

  display.textContent = calcCurrentValue;

  if (history && calcOperation && calcPreviousValue) {
    const opSymbol =
      calcOperation === "*" ? "×" : calcOperation === "/" ? "÷" : calcOperation;
    history.textContent = `${calcPreviousValue} ${opSymbol} ${calcCurrentValue}`;
  }
}

function calcEquals() {
  const display = document.getElementById("calcDisplay");
  const history = document.getElementById("calcHistory");
  if (!display) return;

  if (
    calcPreviousValue === "" ||
    calcOperation === "" ||
    calcCurrentValue === ""
  )
    return;

  const prev = parseFloat(calcPreviousValue);
  const current = parseFloat(calcCurrentValue);
  let result = 0;

  switch (calcOperation) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      if (current === 0) {
        showToast("Cannot divide by zero", "fa-exclamation-circle");
        calcClear();
        return;
      }
      result = prev / current;
      break;
    case "%":
      result = prev % current;
      break;
  }

  result = Math.round(result * 100000000) / 100000000;

  if (history) {
    const opSymbol =
      calcOperation === "*" ? "×" : calcOperation === "/" ? "÷" : calcOperation;
    history.textContent = `${calcPreviousValue} ${opSymbol} ${calcCurrentValue} =`;
  }

  calcCurrentValue = result.toString();
  display.textContent = calcCurrentValue;

  calcPreviousValue = "";
  calcOperation = "";
  calcShouldResetDisplay = true;
}

function calcClear() {
  calcCurrentValue = "0";
  calcPreviousValue = "";
  calcOperation = "";
  calcShouldResetDisplay = false;

  const display = document.getElementById("calcDisplay");
  const history = document.getElementById("calcHistory");

  if (display) display.textContent = "0";
  if (history) history.textContent = "";
}

function calcBackspace() {
  const display = document.getElementById("calcDisplay");
  if (!display) return;

  if (calcShouldResetDisplay) {
    calcClear();
    return;
  }

  if (calcCurrentValue.length > 1) {
    calcCurrentValue = calcCurrentValue.slice(0, -1);
  } else {
    calcCurrentValue = "0";
  }

  display.textContent = calcCurrentValue;
}
let notificationHistory = [];

function toggleNotificationCenter() {
  const notif = document.getElementById("notificationCenter");
  const quick = document.getElementById("quickActions");
  const bell = document.getElementById("notificationBell");
  if (quick) quick.classList.remove("active");
  notif.classList.toggle("active");
  bell.classList.toggle("active");
}

function addNotificationToHistory(message, icon = "fa-info-circle") {
  const notification = {
    message: message,
    icon: icon,
    time: new Date(),
    id: Date.now(),
  };

  notificationHistory.unshift(notification);

  if (notificationHistory.length > 50) {
    notificationHistory = notificationHistory.slice(0, 50);
  }

  updateNotificationCenter();
}

function updateNotificationCenter() {
  const listEl = document.getElementById("notificationList");
  if (!listEl) return;

  if (notificationHistory.length === 0) {
    listEl.innerHTML = `
                  <div class="notification-center-empty">
                      <i class="fas fa-bell-slash"></i>
                      <p>No notifications</p>
                  </div>
              `;
    return;
  }

  listEl.innerHTML = notificationHistory
    .map((notif) => {
      const timeAgo = getTimeAgo(notif.time);
      return `
                  <div class="notification-item" onclick="dismissNotification(${notif.id})">
                      <div class="notification-item-icon">
                          <i class="fas ${notif.icon}"></i>
                      </div>
                      <div class="notification-item-content">
                          <div class="notification-item-title">System</div>
                          <div class="notification-item-message">${notif.message}</div>
                          <div class="notification-item-time">${timeAgo}</div>
                      </div>
                  </div>
              `;
    })
    .join("");
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
}

function dismissNotification(id) {
  notificationHistory = notificationHistory.filter((n) => n.id !== id);
  updateNotificationCenter();
}

function clearAllNotifications() {
  notificationHistory = [];
  updateNotificationCenter();
  showToast("All notifications cleared", "fa-trash");
}

document.addEventListener("click", (e) => {
  const center = document.getElementById("notificationCenter");
  const bell = document.getElementById("notificationBell");

  if (
    center &&
    bell &&
    !center.contains(e.target) &&
    !bell.contains(e.target)
  ) {
    center.classList.remove("active");
    bell.classList.remove("active");
  }
});

function toggleQuickActions() {
  const menu = document.getElementById("quickActions");
  const notif = document.getElementById("notificationCenter");
  if (notif) notif.classList.remove("active");
  menu.classList.toggle("active");
}

function hideQuickActions() {
  const menu = document.getElementById("quickActions");
  menu.classList.remove("active");
}
function updatePhotosApp() {
  if (!windows["photos"]) return;

  const photos = fileSystem["Photos"] || {};
  const photoList = Object.keys(photos);

  const content = windows["photos"].querySelector(".window-content");
  if (!content) return;

  if (photoList.length === 0) {
    content.innerHTML = `
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
                      <i class="fas fa-images" style="font-size: 5rem; color: var(--accent); margin-bottom: 2rem;"></i>
                      <h2 style="margin-bottom: 1rem; color: var(--text-primary);">No Photos Yet</h2>
                      <p style="color: var(--text-secondary);">Take a screenshot to get started!</p>
                  </div>
              `;
    return;
  }

  content.innerHTML = `
              <div class="photos-grid" id="photosGrid">
                  ${photoList
                    .map(
                      (name) => `
                      <div class="photo-item" onclick="viewPhoto('${name}')">
                          <img src="${photos[name]}" alt="${name}" class="photo-thumbnail">
                          <div class="photo-name">${name}</div>
                          <button class="photo-delete-btn" onclick="event.stopPropagation(); deletePhoto('${name}')">
                              <i class="fas fa-trash"></i>
                          </button>
                      </div>
                  `
                    )
                    .join("")}
              </div>
          `;
}
function viewPhoto(name) {
  const photos = fileSystem["Photos"] || {};
  const url = photos[name];
  if (!url) return;

  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: var(--overlay-darker);
        z-index: 10004;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

  modal.innerHTML = `
        <img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">
        <button onclick="this.parentElement.remove()" style="
            position: absolute;
            top: 2rem;
            right: 2rem;
            width: 48px;
            height: 48px;
            background: rgba(239, 68, 68, 0.9);
            border: none;
            border-radius: 50%;
            color: var(--pure-white);
            font-size: 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        " onmouseover="this.style.background='var(--error-red-hover)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">
            <i class="fas fa-times"></i>
        </button>
    `;

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}

function deletePhoto(name) {
  const confirmed = confirm(`Delete ${name}?`);
  if (!confirmed) return;

  const photos = fileSystem["Photos"] || {};
  if (photos[name]) {
    URL.revokeObjectURL(photos[name]);
    delete photos[name];
    showToast("Photo deleted", "fa-trash");
    updatePhotosApp();
  }
}
async function takeScreenshot() {
  showToast("Taking screenshot...", "fa-camera");

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    stream.getTracks().forEach((track) => track.stop());

    canvas.toBlob((blob) => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const filename = `${month}-${day}-${year} ${hours}-${minutes}-${seconds}.png`;

      const url = URL.createObjectURL(blob);

      if (!fileSystem["Photos"]) {
        fileSystem["Photos"] = {};
      }
      fileSystem["Photos"][filename] = url;

      showToast(`Screenshot saved: ${filename}`, "fa-check-circle");
      unlockAchievement("screenshot");
      if (!windows["photos"]) {
        openApp("photos");
      } else {
        updatePhotosApp();
      }
    }, "image/png");
  } catch (error) {
    if (error.name === "NotAllowedError") {
      showToast("Screenshot cancelled", "fa-info-circle");
    } else {
      showToast("Screenshot failed: " + error.message, "fa-exclamation-circle");
    }
  }
}
function closeAllWindows() {
  const windowApps = Object.keys(windows);

  if (windowApps.length === 0) {
    showToast("No windows to close", "fa-info-circle");
    return;
  }

  windowApps.forEach((appName) => {
    closeWindowByAppName(appName);
  });

  showToast(`Closed ${windowApps.length} window(s)`, "fa-check-circle");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("quickActions");
  if (menu && !menu.contains(e.target) && !e.target.closest(".taskbar-icon")) {
    menu.classList.remove("active");
  }
});
function setupStep1Next() {
  const username = document.getElementById("setupUsername").value.trim();
  const isPasswordless = document.getElementById("setupPasswordless").checked;

  if (!username) {
    showToast("Please enter a username", "fa-exclamation-circle");
    return;
  }

  if (username.length < 3) {
    showToast(
      "Username must be at least 3 characters",
      "fa-exclamation-circle"
    );
    return;
  }

  window.setupIsPasswordless = isPasswordless;

  document.getElementById("setupStep1").style.display = "none";

  if (isPasswordless) {
    document.getElementById("setupStep3").style.display = "block";
  } else {
    document.getElementById("setupStep2").style.display = "block";
  }
}

function setupStep2Back() {
  document.getElementById("setupStep2").style.display = "none";
  document.getElementById("setupStep1").style.display = "block";

  const checkbox = document.getElementById("setupPasswordless");
  if (checkbox && window.setupIsPasswordless !== undefined) {
    checkbox.checked = window.setupIsPasswordless;
    togglePasswordless();
  }
}

function toggleSetupPassword() {
  const passwordInput = document.getElementById("setupPassword");
  const toggleIcon = document.getElementById("setupPasswordToggle");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

function togglePasswordless() {
  const checkbox = document.getElementById("setupPasswordless");
  const passwordLabel = document.getElementById("passwordLabel");
  const passwordInput = document.getElementById("setupPassword");
  const passwordConfirm = document.getElementById("setupPasswordConfirm");
  const passwordToggle = document.getElementById("setupPasswordToggle");

  isPasswordless = checkbox.checked;

  if (isPasswordless) {
    passwordLabel.textContent = "Passwordless Account";
    passwordInput.style.display = "none";
    passwordConfirm.style.display = "none";
    passwordToggle.style.display = "none";
  } else {
    passwordLabel.textContent = "Create a Password";
    passwordInput.style.display = "block";
    passwordConfirm.style.display = "block";
    passwordToggle.style.display = "block";
  }
}

function setupComplete() {
  const username = document.getElementById("setupUsername").value.trim();
  const isPasswordless = window.setupIsPasswordless || false;
  const password = isPasswordless
    ? ""
    : document.getElementById("setupPassword").value;

  const appCheckboxes = document.querySelectorAll(
    '#setupAppOptions input[type="checkbox"]:checked'
  );
  const selectedApps = Array.from(appCheckboxes).map((cb) => cb.value);

  selectedApps.forEach((app) => {
    if (!installedApps.includes(app)) {
      installedApps.push(app);
    }
  });

  const themeCheckboxes = document.querySelectorAll(
    '#setupThemeOptions input[type="checkbox"]:checked'
  );
  const selectedThemes = Array.from(themeCheckboxes).map((cb) => cb.value);

  selectedThemes.forEach((theme) => {
    if (!installedThemes.includes(theme)) {
      installedThemes.push(theme);
    }
  });

  localStorage.setItem("nautilusOS_username", username);
  if (isPasswordless) {
    localStorage.setItem("nautilusOS_password", "");
    localStorage.setItem("nautilusOS_isPasswordless", "true");
  } else {
    localStorage.setItem("nautilusOS_password", hashPassword(password));
    localStorage.setItem("nautilusOS_isPasswordless", "false");
  }
  localStorage.setItem("nautilusOS_setupComplete", "true");
  localStorage.setItem(
    "nautilusOS_installedThemes",
    JSON.stringify(installedThemes)
  );
  localStorage.setItem(
    "nautilusOS_installedApps",
    JSON.stringify(installedApps)
  );
  localStorage.setItem(
    "nautilusOS_startupApps",
    JSON.stringify(startupApps)
  );
  saveSettingsToLocalStorage();

  currentUsername = username;

   if (selectedThemes.length > 0) {
    setTimeout(() => {
      unlockAchievement("theme-changer");
    }, 100);
  }
  
  let welcomeMessage = "Setup complete! Welcome to NautilusOS";
  let toastIcon = "fa-check-circle";
  if (username.toLowerCase() === "dinguschan") {
    welcomeMessage = "Welcome back, developer! Is it really you?!";
    toastIcon = "fa-egg";
  }

  const setup = document.getElementById("setup");
  setup.style.opacity = "0";

  setTimeout(() => {
    setup.style.display = "none";
    const login = document.getElementById("login");
    document.getElementById("username").value = username;

    updateLoginScreen();

    login.classList.add("active");
    startLoginClock();
    displayBrowserInfo();
    updateLoginGreeting();
    showToast(welcomeMessage, toastIcon);
  }, 500);
}
async function forgotPassword() {
  const isPasswordless =
    localStorage.getItem("nautilusOS_isPasswordless") === "true";
  const message = isPasswordless
    ? "This will reset your passwordless account and return you to setup. All data will be preserved. Continue?"
    : "This will reset your account and return you to setup. All data will be preserved. Continue?";

  const confirmed = await confirm(message);
  if (!confirmed) return;

  localStorage.removeItem("nautilusOS_username");
  localStorage.removeItem("nautilusOS_password");
  localStorage.removeItem("nautilusOS_isPasswordless");
  localStorage.removeItem("nautilusOS_setupComplete");

  const usernameInput = document.getElementById("username");
  if (usernameInput) usernameInput.value = "";

  const passwordInput = document.getElementById("password");
  if (passwordInput) passwordInput.value = "";

  showToast("Account reset. Reloading...", "fa-info-circle");

  setTimeout(() => {
    location.reload();
  }, 1500);
}

function setupStep2Next() {
  const password = document.getElementById("setupPassword").value;
  const passwordConfirm = document.getElementById("setupPasswordConfirm").value;

  if (!password) {
    showToast("Please enter a password", "fa-exclamation-circle");
    return;
  }

  if (password.length < 6) {
    showToast(
      "Password must be at least 6 characters",
      "fa-exclamation-circle"
    );
    return;
  }

  if (password !== passwordConfirm) {
    showToast("Passwords do not match", "fa-exclamation-circle");
    return;
  }

  document.getElementById("setupStep2").style.display = "none";
  document.getElementById("setupStep3").style.display = "block";
}

function setupStep3Back() {
  document.getElementById("setupStep3").style.display = "none";

  if (window.setupIsPasswordless) {
    document.getElementById("setupStep1").style.display = "block";
  } else {
    document.getElementById("setupStep2").style.display = "block";
  }
}

function setupStep3Next() {
  document.getElementById("setupStep3").style.display = "none";
  document.getElementById("setupStep4").style.display = "block";
}

function setupStep4Back() {
  document.getElementById("setupStep4").style.display = "none";
  document.getElementById("setupStep3").style.display = "block";
}

function setupStep3Back() {
  document.getElementById("setupStep3").style.display = "none";
  document.getElementById("setupStep2").style.display = "block";
}

function saveSettingsToLocalStorage() {
  localStorage.setItem("nautilusOS_settings", JSON.stringify(settings));
}

function loadSettingsFromLocalStorage() {
  const saved = localStorage.getItem("nautilusOS_settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      settings = { ...settings, ...parsed };
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }
}

function loadAndApplyTheme() {
  const saved = localStorage.getItem("nautilusOS_currentTheme");
  const themeToApply = (saved && themeDefinitions[saved]) ? saved : "dark";
  applyTheme(themeToApply);
}

function loadInstalledThemes() {
  const saved = localStorage.getItem("nautilusOS_installedThemes");
  if (saved) {
    try {
      installedThemes = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load themes:", e);
    }
  }
  if (!installedThemes.includes("dark")) {
    installedThemes.unshift("dark");
  }
}
window.addEventListener("DOMContentLoaded", () => {
  loadSnapSettings();
  loadSettingsFromLocalStorage();
  loadInstalledThemes();
  loadAndApplyTheme();
  loadInstalledApps();
  loadInstalledGames();
  loadAchievements();
  achievementsData.lastUptimeUpdate = Date.now();

  if (!settings.showDesktopIcons) {
    const icons = document.getElementById("desktopIcons");
    if (icons) icons.classList.add("hidden");
  }

  initializeSnapOverlay();
  updateSnapOverlayStyles();
  document.addEventListener("keydown", handleSnapHotkeys);

  installedApps.forEach((appName) => {
    addDesktopIcon(appName);
  });
  installedGames.forEach((gameName) => {
    addDesktopIcon(gameName);
  });
  applyUserBackgrounds();
  applyProfilePicture();
});
async function signOutToLogin() {
  const confirmed = await confirm("Are you sure you want to sign out?");
  if (!confirmed) return;

  const startMenu = document.getElementById("startMenu");
  if (startMenu) startMenu.classList.remove("active");

  const windowApps = Object.keys(windows);
  windowApps.forEach((appName) => {
    const windowEl = windows[appName];
    if (windowEl) {
      windowEl.remove();
    }
  });
  windows = {};
  focusedWindow = null;

  const desktop = document.getElementById("desktop");
  const login = document.getElementById("login");

  desktop.style.opacity = "0";

  setTimeout(() => {
    desktop.classList.remove("active");
    desktop.style.opacity = "1";

    const password = document.getElementById("password");
    if (password) password.value = "";

    const username = document.getElementById("username");
    const savedUsername = localStorage.getItem("nautilusOS_username");
    if (username && savedUsername) {
      username.value = savedUsername;
    }

    updateLoginScreen();

    login.style.display = "flex";
    login.style.opacity = "0";

    setTimeout(() => {
      login.classList.add("active");
      login.style.opacity = "1";

      const isPasswordless =
        localStorage.getItem("nautilusOS_isPasswordless") === "true";
      if (isPasswordless) {
        const usernameInput = document.getElementById("username");
        if (usernameInput) {
          setTimeout(() => usernameInput.focus(), 100);
        }
      } else if (password) {
        setTimeout(() => password.focus(), 100);
      }

      showToast("Signed out successfully", "fa-sign-out-alt");
    }, 50);
  }, 500);
}
async function resetAllData() {
  const confirmed = await confirm(
    '<i class="fa-solid fa-triangle-exclamation"></i> WARNING: This will permanently delete ALL your data including:</br></br>• Your account (username & password)</br>• All settings and preferences</br>• All files and folders</br>• Installed themes and apps</br>• Boot preferences</br></br>This action CANNOT be undone! Are you absolutely sure you want to continue?'
  );
  if (!confirmed) return;

  const finalConfirm = await prompt('Type "DELETE" (all caps) to confirm:');
  if (finalConfirm !== "DELETE") {
    showToast("Reset cancelled", "fa-info-circle");
    return;
  }

  const achievements = localStorage.getItem("nautilusOS_achievements");

  localStorage.clear();

  if (achievements) {
    localStorage.setItem("nautilusOS_achievements", achievements);
  }

  showToast("All data has been erased. Reloading...", "fa-trash-alt");

  setTimeout(() => {
    location.reload();
  }, 2000);
}

async function changeuser() {
  console.log("Changing user....");
  const newUsername = await prompt("Enter a new username:");
  if (!newUsername) {
    showToast("Username change cancelled", "fa-info-circle");
  } else if (newUsername.length < 3) {
    showToast("Username must be at least 3 characters", "fa-exclamation-circle");
  } else if (newUsername === currentUsername) {
    showToast("New username cannot be the same as the current one", "fa-info-circle");
  };

  showToast("Username changed successfully. Reloading...", "fa-check-circle");
  localStorage.setItem("nautilusOS_username", newUsername);

  setTimeout(() => {
    location.reload();
  }, 2000);
};

let modalResolve = null;

function showModal(options) {
  return new Promise((resolve) => {
    modalResolve = resolve;

    const modal = document.getElementById("customModal");
    const icon = document.getElementById("modalIcon");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    const buttons = document.getElementById("modalButtons");
    const inputContainer = document.getElementById("modalInputContainer");

    icon.className = "modal-icon " + (options.type || "info");
    icon.innerHTML = `<i class="fas ${options.icon || "fa-info-circle"}"></i>`;

    title.textContent = options.title || "Confirm";
    body.innerHTML = options.message || "";

    inputContainer.innerHTML = "";

    if (options.prompt) {
      inputContainer.innerHTML = `<input type="text" class="modal-input" id="modalInput" placeholder="${
        options.placeholder || ""
      }" value="${options.defaultValue || ""}">`;
      setTimeout(() => document.getElementById("modalInput").focus(), 100);
    }

    if (options.confirm) {
      buttons.innerHTML = `
                      <button class="modal-btn modal-btn-secondary" onclick="closeModal(false)">Cancel</button>
                      <button class="modal-btn ${
                        options.danger
                          ? "modal-btn-danger"
                          : "modal-btn-primary"
                      }" onclick="confirmModal()">${
        options.confirmText || "OK"
      }</button>
                  `;
    } else {
      buttons.innerHTML = `
                      <button class="modal-btn modal-btn-primary" onclick="closeModal(true)">OK</button>
                  `;
    }

    modal.classList.add("active");
  });
}

function closeModal(result = false) {
  const modal = document.getElementById("customModal");
  modal.classList.remove("active");
  if (modalResolve) {
    modalResolve(result);
    modalResolve = null;
  }
}

function confirmModal() {
  const input = document.getElementById("modalInput");
  const result = input ? input.value : true;
  closeModal(result);
}

window.alert = async (message) => {
  await showModal({
    type: "info",
    icon: "fa-info-circle",
    title: "Alert",
    message: message,
    confirm: false,
  });
};

window.confirm = async (message) => {
  return await showModal({
    type: "warning",
    icon: "fa-exclamation-triangle",
    title: "Confirm",
    message: message,
    confirm: true,
  });
};

window.prompt = async (message, defaultValue = "") => {
  return await showModal({
    type: "info",
    icon: "fa-question-circle",
    title: "Input Required",
    message: message,
    prompt: true,
    defaultValue: defaultValue,
    placeholder: "Enter value...",
    confirm: true,
  });
};
let installedApps = [];
let startupApps = [];
let installedGames = [];

function hashPassword(password) {
  const salt = "NautilusOS_Salt_2024"; // Simple salt for demo
  let hash = 0;
  const combined = password + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

function loadInstalledApps() {
  const saved = localStorage.getItem("nautilusOS_installedApps");
  if (saved) {
    try {
      installedApps = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load apps:", e);
    }
  }

  const savedStartup = localStorage.getItem("nautilusOS_startupApps");
  if (savedStartup) {
    try {
      startupApps = JSON.parse(savedStartup);
    } catch (e) {
      console.error("Failed to load startup apps:", e);
    }
  }
}

function installApp(appName) {
  if (installedApps.includes(appName)) {
    showToast("App already installed", "fa-info-circle");
    return;
  }

  installedApps.push(appName);
  localStorage.setItem(
    "nautilusOS_installedApps",
    JSON.stringify(installedApps)
  );

  addDesktopIcon(appName);

  updateStartMenu();

  if (appName === "snap-manager") {
    ensureSnapSettingsDefaults();
    snapSettings.enabled = true;
    saveSnapSettings();
    initializeSnapOverlay();
    updateSnapOverlayStyles();
  }

  showToast(
    "App installed! Check your desktop and start menu to launch it.",
    "fa-check-circle"
  );
  refreshAppStore();
}

function uninstallApp(appName) {
  const index = installedApps.indexOf(appName);
  if (index > -1) {
    installedApps.splice(index, 1);
    localStorage.setItem(
      "nautilusOS_installedApps",
      JSON.stringify(installedApps)
    );

    removeDesktopIcon(appName);

    updateStartMenu();

    if (windows[appName]) {
      closeWindowByAppName(appName);
    }

    if (appName === "snap-manager") {
      ensureSnapSettingsDefaults();
      snapSettings.enabled = false;
      saveSnapSettings();
      hideSnapPreview();
    }

    showToast("App uninstalled", "fa-trash");
    refreshAppStore();
  }
}

function installGame(gameName) {
  if (installedGames.includes(gameName)) {
    showToast("Game already installed", "fa-info-circle");
    return;
  }

  installedGames.push(gameName);
  localStorage.setItem(
    "nautilusOS_installedGames",
    JSON.stringify(installedGames)
  );

  addDesktopIcon(gameName);
  updateStartMenu();

  showToast(
    "Game installed! Check your desktop and start menu to launch it.",
    "fa-check-circle"
  );
  refreshAppStore();
}

function uninstallGame(gameName) {
  const index = installedGames.indexOf(gameName);
  if (index > -1) {
    installedGames.splice(index, 1);
    localStorage.setItem(
      "nautilusOS_installedGames",
      JSON.stringify(installedGames)
    );

    removeDesktopIcon(gameName);
    updateStartMenu();

    if (windows[gameName]) {
      closeWindowByAppName(gameName);
    }

    showToast("Game uninstalled", "fa-trash");
    refreshAppStore();
  }
}

function loadInstalledGames() {
  const saved = localStorage.getItem("nautilusOS_installedGames");
  if (saved) {
    try {
      installedGames = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load games:", e);
    }
  }

}

let snakeGame = {
  canvas: null,
  ctx: null,
  snake: [{x: 10, y: 10}],
  food: {x: 15, y: 15},
  direction: {x: 1, y: 0},
  nextDirection: {x: 1, y: 0},
  score: 0,
  gameRunning: false,
  gamePaused: false,
  gameOver: false,
  gridSize: 20,
  tileCount: 20,
  gameSpeed: 100,
  highScore: localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0
};

function startSnakeGame() {
  if (!snakeGame.canvas) {
    snakeGame.canvas = document.getElementById('snakeCanvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
  }
  
  if (snakeGame.gameRunning && !snakeGame.gamePaused) {
    return;
  }
  
  if (!snakeGame.gameRunning) {
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.food = generateFood();
    snakeGame.direction = {x: 1, y: 0};
    snakeGame.nextDirection = {x: 1, y: 0};
    snakeGame.score = 0;
    snakeGame.gameOver = false;
    snakeGame.gameRunning = true;
    document.getElementById('snakeScore').textContent = '0';
    document.getElementById('snakeStartBtn').textContent = 'Pause';
    
    attachSnakeKeyListeners();
    gameLoop();
  } else if (snakeGame.gamePaused) {
    snakeGame.gamePaused = false;
    document.getElementById('snakeStartBtn').textContent = 'Pause';
    gameLoop();
  }
}

function attachSnakeKeyListeners() {
  document.addEventListener('keydown', handleSnakeKeyPress);
}

function handleSnakeKeyPress(e) {
  if (!snakeGame.gameRunning) return;
  
  if (e.key === ' ') {
    e.preventDefault();
    snakeGame.gamePaused = !snakeGame.gamePaused;
    document.getElementById('snakeStartBtn').textContent = snakeGame.gamePaused ? 'Resume' : 'Pause';
    if (!snakeGame.gamePaused) gameLoop();
    return;
  }
  
  if (e.key === 'r' || e.key === 'R') {
    startSnakeGame();
    return;
  }
  
  const key = e.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') {
    if (snakeGame.direction.y === 0) snakeGame.nextDirection = {x: 0, y: -1};
    e.preventDefault();
  } else if (key === 'arrowdown' || key === 's') {
    if (snakeGame.direction.y === 0) snakeGame.nextDirection = {x: 0, y: 1};
    e.preventDefault();
  } else if (key === 'arrowleft' || key === 'a') {
    if (snakeGame.direction.x === 0) snakeGame.nextDirection = {x: -1, y: 0};
    e.preventDefault();
  } else if (key === 'arrowright' || key === 'd') {
    if (snakeGame.direction.x === 0) snakeGame.nextDirection = {x: 1, y: 0};
    e.preventDefault();
  }
}

function generateFood() {
  let newFood;
  let foodOnSnake = true;
  while (foodOnSnake) {
    newFood = {
      x: Math.floor(Math.random() * snakeGame.tileCount),
      y: Math.floor(Math.random() * snakeGame.tileCount)
    };
    foodOnSnake = snakeGame.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood;
}

function gameLoop() {
  if (!snakeGame.gameRunning || snakeGame.gamePaused || snakeGame.gameOver) {
    return;
  }
  
  snakeGame.direction = snakeGame.nextDirection;
  
  const head = snakeGame.snake[0];
  const newHead = {
    x: (head.x + snakeGame.direction.x + snakeGame.tileCount) % snakeGame.tileCount,
    y: (head.y + snakeGame.direction.y + snakeGame.tileCount) % snakeGame.tileCount
  };
  
  if (snakeGame.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    endSnakeGame();
    return;
  }
  
  snakeGame.snake.unshift(newHead);
  
  if (newHead.x === snakeGame.food.x && newHead.y === snakeGame.food.y) {
    snakeGame.score += 10;
    document.getElementById('snakeScore').textContent = snakeGame.score;
    snakeGame.food = generateFood();
  } else {
    snakeGame.snake.pop();
  }
  
  drawSnakeGame();
  setTimeout(gameLoop, snakeGame.gameSpeed);
}

function drawSnakeGame() {
  const canvas = snakeGame.canvas;
  const ctx = snakeGame.ctx;
  
  if (!canvas || !ctx) return;
  
  const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const border = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  const errorRed = getComputedStyle(document.documentElement).getPropertyValue('--error-red').trim();
  
  ctx.fillStyle = bgSecondary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = 'rgba(125, 211, 192, 0.1)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= snakeGame.tileCount; i++) {
    const pos = i * snakeGame.gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
  
  snakeGame.snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = accentColor;
    } else {
      ctx.fillStyle = 'rgba(125, 211, 192, 0.7)';
    }
    ctx.fillRect(
      segment.x * snakeGame.gridSize + 2,
      segment.y * snakeGame.gridSize + 2,
      snakeGame.gridSize - 4,
      snakeGame.gridSize - 4
    );
  });
  
  ctx.fillStyle = errorRed;
  ctx.beginPath();
  ctx.arc(
    snakeGame.food.x * snakeGame.gridSize + snakeGame.gridSize / 2,
    snakeGame.food.y * snakeGame.gridSize + snakeGame.gridSize / 2,
    snakeGame.gridSize / 2 - 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
}
function endSnakeGame() {
  snakeGame.gameRunning = false;
  snakeGame.gameOver = true;
  
  if (snakeGame.score > snakeGame.highScore) {
    snakeGame.highScore = snakeGame.score;
    localStorage.setItem('snakeHighScore', snakeGame.highScore);
    document.getElementById('snakeHighScore').textContent = snakeGame.highScore;
  }
  
  document.getElementById('snakeStartBtn').textContent = 'Start Game';
  
  document.removeEventListener('keydown', handleSnakeKeyPress);
  
  showToast('Game Over! Score: ' + snakeGame.score + ' | High Score: ' + snakeGame.highScore, 'fa-skull');
}


function addDesktopIcon(appName) {
  const iconsContainer = document.getElementById("desktopIcons");
  if (!iconsContainer) {
    return;
  }

  if (document.querySelector(`.desktop-icon[data-app="${appName}"]`)) return;

  let iconConfig = {};
  if (appName === "startup-apps") {
    iconConfig = { icon: "fa-rocket", label: "Startup Apps" };
  } else if (appName === "task-manager") {
    iconConfig = { icon: "fa-tasks", label: "Task Manager" };
  } else if (appName === "snap-manager") {
    iconConfig = { icon: "fa-border-all", label: "Snap Manager" };
  } else if (appName === "snake") {
    iconConfig = { icon: "fa-gamepad", label: "Snake" };
  } else if (appName === "2048") {
    iconConfig = { icon: "fa-th", label: "2048" };
  } else if (appName === "tictactoe") {
    iconConfig = { icon: "fa-circle", label: "Tic-Tac-Toe" };
  } else if (appName === "uv") {
    iconConfig = { icon: "fa-globe", label: "Ultraviolet" };
  } else if (appName === "helios") {
    iconConfig = { icon: "fa-globe", label: "Helios" };
  } else if (appName === "vsc") {
    iconConfig = { icon: "fa-code", label: "Visual Studio Code" };
  } else {
    return;
  }

  const iconEl = document.createElement("div");
  iconEl.className = "desktop-icon";
  iconEl.setAttribute("data-app", appName);
  iconEl.innerHTML = `
        <i class="fas ${iconConfig.icon}"></i>
        <span>${iconConfig.label}</span>
    `;
  iconEl.ondblclick = () => openApp(appName);

  iconsContainer.appendChild(iconEl);

  initDesktopIconDragging();
}

function removeDesktopIcon(appName) {
  const icon = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
  if (icon) {
    icon.remove();
  }
}

function openStartupApps() {
  const preinstalledApps = [
    { id: "files", name: "Files", icon: "fa-folder" },
    { id: "terminal", name: "Terminal", icon: "fa-terminal" },
    { id: "browser", name: "Nautilus Browser", icon: "fa-globe" },
    { id: "settings", name: "Settings", icon: "fa-cog" },
    { id: "editor", name: "Text Editor", icon: "fa-edit" },
    { id: "music", name: "Music", icon: "fa-music" },
    { id: "photos", name: "Photos", icon: "fa-images" },
    { id: "help", name: "Help", icon: "fa-question-circle" },
    { id: "appstore", name: "App Store", icon: "fa-store" },
    { id: "calculator", name: "Calculator", icon: "fa-calculator" },
    { id: "cloaking", name: "Cloaking", icon: "fa-mask" },
    { id: "achievements", name: "Achievements", icon: "fa-trophy" },
  ];

const installedAppsData = [];
  installedApps.forEach((appName) => {
    if (appName === "startup-apps") {
      installedAppsData.push({ id: "startup-apps", name: "Startup Apps", icon: "fa-rocket" });
    } else if (appName === "task-manager") {
      installedAppsData.push({ id: "task-manager", name: "Task Manager", icon: "fa-tasks" });
    } else if (appName === "snap-manager") {
      installedAppsData.push({ id: "snap-manager", name: "Snap Manager", icon: "fa-border-all" });
    }
  });

  installedGames.forEach((gameName) => {
    if (gameName === "snake") {
      installedAppsData.push({ id: "snake", name: "Snake", icon: "fa-gamepad" });
    } else if (gameName === "2048") {
      installedAppsData.push({ id: "2048", name: "2048", icon: "fa-th" });
    } else if (gameName === "tictactoe") {
      installedAppsData.push({ id: "tictactoe", name: "Tic-Tac-Toe", icon: "fa-circle" });
    }
  });

  const availableApps = [...preinstalledApps, ...installedAppsData]; 

  const itemsHtml = availableApps
    .map((app) => {
      const isEnabled = startupApps.includes(app.id);
      const isWhatsNew = app.id === "whatsnew";
      const disabled = isWhatsNew ? "disabled" : "";
      const toggleAction = isWhatsNew
        ? ""
        : `onclick="toggleStartupApp('${app.id}')"`;

      return `
                  <div class="startup-item ${disabled}">
                      <div class="startup-item-icon">
                          <i class="fas ${app.icon}"></i>
                      </div>
                      <div class="startup-item-info">
                          <div class="startup-item-name">${app.name}</div>
                          <div class="startup-item-status">${
                            isWhatsNew
                              ? "Managed in Settings"
                              : isEnabled
                              ? "Enabled"
                              : "Disabled"
                          }</div>
                      </div>
                      <div class="toggle-switch ${
                        isEnabled ? "active" : ""
                      } ${disabled}" ${toggleAction} style="${
        isWhatsNew ? "opacity: 0.5; cursor: not-allowed;" : ""
      }"></div>
                  </div>
              `;
    })
    .join("");

  const whatsNewEnabled =
    localStorage.getItem("nautilusOS_showWhatsNew") !== "false";
  const whatsNewHtml = `
              <div class="startup-item disabled">
                  <div class="startup-item-icon">
                      <i class="fas fa-star"></i>
                  </div>
                  <div class="startup-item-info">
                      <div class="startup-item-name">What's New</div>
                      <div class="startup-item-status">Managed in Settings</div>
                  </div>
                  <div class="toggle-switch ${
                    whatsNewEnabled ? "active" : ""
                  }" style="opacity: 0.5; cursor: not-allowed;"></div>
              </div>
          `;

  const content = `
              <div class="startup-manager">
                  <div class="startup-section">
                      <h3><i class="fas fa-rocket"></i>&nbsp;Startup Applications</h3>
                      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                          Select which applications should automatically open when you log in.
                      </p>
                      ${itemsHtml}
                      ${whatsNewHtml}
                  </div>
              </div>
          `;

  createWindow(
    "Startup Apps",
    "fas fa-rocket",
    content,
    600,
    500,
    "startup-apps",
    true
  );
}

function toggleStartupApp(appId) {
  const index = startupApps.indexOf(appId);
  if (index > -1) {
    startupApps.splice(index, 1);
  } else {
    startupApps.push(appId);
  }

  localStorage.setItem("nautilusOS_startupApps", JSON.stringify(startupApps));

  if (windows["startup-apps"]) {
    const content = windows["startup-apps"].querySelector(".window-content");
    if (content) {
      const preinstalledApps = [
        { id: "files", name: "Files", icon: "fa-folder" },
        { id: "terminal", name: "Terminal", icon: "fa-terminal" },
        { id: "browser", name: "Nautilus Browser", icon: "fa-globe" },
        { id: "settings", name: "Settings", icon: "fa-cog" },
        { id: "editor", name: "Text Editor", icon: "fa-edit" },
        { id: "music", name: "Music", icon: "fa-music" },
        { id: "photos", name: "Photos", icon: "fa-images" },
        { id: "help", name: "Help", icon: "fa-question-circle" },
        { id: "appstore", name: "App Store", icon: "fa-store" },
        { id: "calculator", name: "Calculator", icon: "fa-calculator" },
        { id: "cloaking", name: "Cloaking", icon: "fa-mask" },
        { id: "achievements", name: "Achievements", icon: "fa-trophy" },
      ];

      const installedAppsData = [];
      installedApps.forEach((appName) => {
        if (appName === "startup-apps") {
          installedAppsData.push({ id: "startup-apps", name: "Startup Apps", icon: "fa-rocket" });
        } else if (appName === "task-manager") {
          installedAppsData.push({ id: "task-manager", name: "Task Manager", icon: "fa-tasks" });
        }
      });

      const availableApps = [...preinstalledApps, ...installedAppsData];

      const itemsHtml = availableApps
        .map((app) => {
          const isEnabled = startupApps.includes(app.id);
          return `
                          <div class="startup-item">
                              <div class="startup-item-icon">
                                  <i class="fas ${app.icon}"></i>
                              </div>
                              <div class="startup-item-info">
                                  <div class="startup-item-name">${
                                    app.name
                                  }</div>
                                  <div class="startup-item-status">${
                                    isEnabled ? "Enabled" : "Disabled"
                                  }</div>
                              </div>
                              <div class="toggle-switch ${
                                isEnabled ? "active" : ""
                              }" onclick="toggleStartupApp('${app.id}')"></div>
                          </div>
                      `;
        })
        .join("");

      const whatsNewEnabled =
        localStorage.getItem("nautilusOS_showWhatsNew") !== "false";
      const whatsNewHtml = `
                      <div class="startup-item disabled">
                          <div class="startup-item-icon">
                              <i class="fas fa-star"></i>
                          </div>
                          <div class="startup-item-info">
                              <div class="startup-item-name">What's New</div>
                              <div class="startup-item-status">Managed in Settings</div>
                          </div>
                          <div class="toggle-switch ${
                            whatsNewEnabled ? "active" : ""
                          }" style="opacity: 0.5; cursor: not-allowed;"></div>
                      </div>
                  `;

      content.innerHTML = `
                      <div class="startup-manager">
                          <div class="startup-section">
                              <h3><i class="fas fa-rocket"></i> Startup Applications</h3>
                              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                                  Select which applications should automatically open when you log in.
                              </p>
                              ${itemsHtml}
                              ${whatsNewHtml}
                          </div>
                      </div>
                  `;
    }
  }
}

function openTaskManager() {
  const openWindows = Object.keys(windows);
  const windowCount = openWindows.length;

  const processesHtml = openWindows
    .map((appName) => {
      const win = windows[appName];
      const icon = win.dataset.appIcon || "fa-window-maximize";
      const title = win.querySelector(".window-title span").textContent;

      return `
                  <div class="taskmanager-process">
                      <div class="taskmanager-process-icon">
                          <i class="${icon}"></i>
                      </div>
                      <div class="taskmanager-process-info">
                          <div class="taskmanager-process-name">${title}</div>
                          <div class="taskmanager-process-details">Window • Running</div>
                      </div>
                      <button class="taskmanager-process-action" onclick="closeWindowByAppName('${appName}'); refreshTaskManager();">
                          Close
                      </button>
                  </div>
              `;
    })
    .join("");

  const content = `
              <div class="taskmanager-content">
                  <div class="taskmanager-stats">
                      <div class="taskmanager-stat-card">
                          <div class="taskmanager-stat-label">Open Windows</div>
                          <div class="taskmanager-stat-value">${windowCount}</div>
                      </div>
                      <div class="taskmanager-stat-card">
                          <div class="taskmanager-stat-label">System Status</div>
                          <div class="taskmanager-stat-value" style="font-size: 1.3rem;">Running</div>
                      </div>
                  </div>

                  <div class="taskmanager-section">
                      <h3><i class="fas fa-window-maximize"></i> Running Applications</h3>
                      ${
                        windowCount === 0
                          ? '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No applications running</p>'
                          : processesHtml
                      }
                  </div>

                  <div class="taskmanager-section">
                      <h3><i class="fas fa-info-circle"></i> Quick Actions</h3>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                          <button class="editor-btn" onclick="closeAllWindows(); refreshTaskManager();">
                              <i class="fas fa-times-circle"></i> Close All
                          </button>
<button class="editor-btn" onclick="refreshAllApps();">
    <i class="fas fa-sync"></i> Refresh All
</button>
                              <i class="fas fa-sync"></i> Refresh
                          </button>
                      </div>
                  </div>
              </div>
          `;

  createWindow(
    "Task Manager",
    "fas fa-tasks",
    content,
    700,
    550,
    "task-manager",
    true
  );
}

function refreshTaskManager() {
  if (!windows["task-manager"]) return;

  const openWindows = Object.keys(windows).filter((w) => w !== "task-manager");
  const windowCount = openWindows.length;

  const processesHtml = openWindows
    .map((appName) => {
      const win = windows[appName];
      const icon = win.dataset.appIcon || "fa-window-maximize";
      const title = win.querySelector(".window-title span").textContent;

      return `
            <div class="taskmanager-process">
                <div class="taskmanager-process-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="taskmanager-process-info">
                    <div class="taskmanager-process-name">${title}</div>
                    <div class="taskmanager-process-details">Window • Running</div>
                </div>
                <button class="taskmanager-process-action" onclick="closeWindowByAppName('${appName}'); refreshTaskManager();">
                    Close
                </button>
            </div>
        `;
    })
    .join("");

  const content = windows["task-manager"].querySelector(".window-content");
  if (content) {
    content.innerHTML = `
            <div class="taskmanager-content">
                <div class="taskmanager-stats">
                    <div class="taskmanager-stat-card">
                        <div class="taskmanager-stat-label">Open Windows</div>
                        <div class="taskmanager-stat-value">${windowCount}</div>
                    </div>
                    <div class="taskmanager-stat-card">
                        <div class="taskmanager-stat-label">System Status</div>
                        <div class="taskmanager-stat-value" style="font-size: 1.3rem;">Running</div>
                    </div>
                </div>
                
                <div class="taskmanager-section">
                    <h3><i class="fas fa-window-maximize"></i> Running Applications</h3>
                    ${
                      windowCount === 0
                        ? '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No applications running</p>'
                        : processesHtml
                    }
                </div>
                
                <div class="taskmanager-section">
                    <h3><i class="fas fa-info-circle"></i> Quick Actions</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <button class="editor-btn" onclick="closeAllWindows(); refreshTaskManager();">
                            <i class="fas fa-times-circle"></i> Close All
                        </button>
                        <button class="editor-btn" onclick="refreshAllApps();">
                            <i class="fas fa-sync"></i> Refresh All
                        </button>
                    </div>
                </div>
            </div>
        `;
  }
}
function refreshAllApps() {
  const openWindows = Object.keys(windows).filter((w) => w !== "task-manager");

  if (openWindows.length === 0) {
    showToast("No applications to refresh", "fa-info-circle");
    refreshTaskManager();
    return;
  }

  const appsToReopen = [...openWindows];

  showToast("Refreshing all applications...", "fa-sync");

  appsToReopen.forEach((appName) => {
    const windowEl = windows[appName];
    if (windowEl) {
      windowEl.remove();
      delete windows[appName];
    }
  });

  focusedWindow = null;
  updateTaskbarIndicators();
  refreshTaskManager();

  setTimeout(() => {
    appsToReopen.forEach((appName, index) => {
      setTimeout(() => {
        openApp(appName);
      }, index * 200);
    });

    setTimeout(() => {
      showToast(
        `Refreshed ${appsToReopen.length} application(s)`,
        "fa-check-circle"
      );
      refreshTaskManager();
    }, appsToReopen.length * 200 + 500);
  }, 500);
}
function launchStartupApps() {
  setTimeout(() => {
    startupApps.forEach((appId) => {
      openApp(appId);
    });
  }, 1000);
}
const _originalOpenApp = openApp;
window.openApp = openApp = function (appName, ...args) {
  if (appName === "startup-apps") {
    openStartupApps();
  } else if (appName === "task-manager") {
    openTaskManager();
  } else {
    _originalOpenApp(appName, ...args);
  }

  setTimeout(() => {
    if (windows["task-manager"]) {
      refreshTaskManager();
    }
  }, 100);
};

const _originalCloseWindow = closeWindow;
window.closeWindow = closeWindow = function (btn, appName) {
  _originalCloseWindow(btn, appName);

  setTimeout(() => {
    if (windows["task-manager"]) {
      refreshTaskManager();
    }
  }, 150);
};
function initStartMenuSearch() {
  const searchInput = document.getElementById('startSearch');
  if (!searchInput || searchInput.dataset.listenerAdded) {
    return;
  }

  searchInput.dataset.listenerAdded = 'true';
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const appItems = document.querySelectorAll('.app-item');

    appItems.forEach(item => {
      const appName = item.textContent.toLowerCase();
      if (appName.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

function updateStartMenu() {
  const appGrid = document.querySelector(".app-grid");
  if (!appGrid) return;

  const existingInstalledApps = appGrid.querySelectorAll(
    '.app-item[data-installed="true"]'
  );
  existingInstalledApps.forEach((el) => el.remove());

  const existingInstalledGames = appGrid.querySelectorAll(
    '.app-item[data-installed-game="true"]'
  );
  existingInstalledGames.forEach((el) => el.remove());

  installedApps.forEach((appName) => {
    let appConfig = {};
    if (appName === "startup-apps") {
      appConfig = { icon: "fa-rocket", label: "Startup Apps" };
    } else if (appName === "task-manager") {
      appConfig = { icon: "fa-tasks", label: "Task Manager" };
    } else if (appName === "snap-manager") {
      appConfig = { icon: "fa-border-all", label: "Snap Manager" };
    } else {
      return;
    }

    const appItem = document.createElement("div");
    appItem.className = "app-item";
    appItem.setAttribute("data-installed", "true");
    appItem.onclick = () => openApp(appName);
    appItem.innerHTML = `
            <i class="fas ${appConfig.icon}"></i>
            <span>${appConfig.label}</span>
        `;

    appGrid.appendChild(appItem);
  });

  installedGames.forEach((gameName) => {
    let gameConfig = {};
    if (gameName === "snake") {
      gameConfig = { icon: "fa-gamepad", label: "Snake" };
    } else if (gameName === "2048") {
      gameConfig = { icon: "fa-th", label: "2048" };
    } else if (gameName === "tictactoe") {
      gameConfig = { icon: "fa-circle", label: "Tic-Tac-Toe" };
    } else {
      return;
    }

    const appItem = document.createElement("div");
    appItem.className = "app-item";
    appItem.setAttribute("data-installed-game", "true");
    appItem.onclick = () => openApp(gameName);
    appItem.innerHTML = `
            <i class="fas ${gameConfig.icon}"></i>
            <span>${gameConfig.label}</span>
        `;

    appGrid.appendChild(appItem);
  });

  initStartMenuSearch();
}

function exportProfile() {
  const profile = {
    version: "1.0",
    username: localStorage.getItem("nautilusOS_username"),
    password: localStorage.getItem("nautilusOS_password"),
    isPasswordless: localStorage.getItem("nautilusOS_isPasswordless") === "true",
    settings: settings,
    installedThemes: installedThemes,
    installedApps: installedApps,
    startupApps: startupApps,
    fileSystem: fileSystem,
    showWhatsNew: localStorage.getItem("nautilusOS_showWhatsNew"),
    exportDate: new Date().toISOString(),
  };
  const wallpaper = localStorage.getItem("nautilusOS_wallpaper");
  const loginWallpaper = localStorage.getItem("nautilusOS_loginBackground");
  const useSame = localStorage.getItem("nautilusOS_useSameBackground");
  const profilePicture = localStorage.getItem("nautilusOS_profilePicture");
  profile.wallpaper = wallpaper || null;
  profile.loginWallpaper = loginWallpaper || null;
  profile.useSameBackground = useSame === null ? "true" : useSame;
  profile.profilePicture = profilePicture || null;

  const profileJson = JSON.stringify(profile, null, 2);
  const blob = new Blob([profileJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const username = currentUsername || "user";
  const date = new Date().toISOString().split("T")[0];
  const filename = `NautilusOS_${username}_${date}.nautilusprofile`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  showToast("Profile exported successfully!", "fa-check-circle");
}
function importProfile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".nautilusprofile")) {
    showToast(
      "Invalid file format. Please select a .nautilusprofile file.",
      "fa-exclamation-circle"
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const profile = JSON.parse(e.target.result);

      if (!profile.version || !profile.username) {
        throw new Error("Invalid profile format");
      }

      const confirmed = await confirm(
        `Import profile for user "${profile.username}"?<br><br>` +
          `This will replace your current settings and data.<br><br>` +
          `<strong>Profile Details:</strong><br>` +
          `• Username: ${profile.username}<br>` +
          `• Exported: ${new Date(
            profile.exportDate
          ).toLocaleDateString()}<br>` +
          `• Installed Apps: ${(profile.installedApps || []).length}<br>` +
          `• Installed Themes: ${(profile.installedThemes || []).length}`
      );

      if (!confirmed) {
        showToast("Profile import cancelled", "fa-info-circle");
        return;
      }

      localStorage.setItem("nautilusOS_username", profile.username);
      localStorage.setItem("nautilusOS_password", profile.password || "");
      
      const isPasswordless = profile.isPasswordless !== undefined 
        ? String(profile.isPasswordless) 
        : (profile.password === "" ? "true" : "false");
      localStorage.setItem("nautilusOS_isPasswordless", isPasswordless);
      
      localStorage.setItem("nautilusOS_setupComplete", "true");
      
      settings = profile.settings || settings;
      installedThemes = profile.installedThemes || [];
      installedApps = profile.installedApps || [];
      startupApps = profile.startupApps || [];
      
      localStorage.setItem(
        "nautilusOS_settings",
        JSON.stringify(settings)
      );
      localStorage.setItem(
        "nautilusOS_installedThemes",
        JSON.stringify(installedThemes)
      );
      localStorage.setItem(
        "nautilusOS_installedApps",
        JSON.stringify(installedApps)
      );
      localStorage.setItem(
        "nautilusOS_startupApps",
        JSON.stringify(startupApps)
      );
      
      if (profile.useSameBackground !== null && profile.useSameBackground !== undefined) {
        localStorage.setItem(
          "nautilusOS_useSameBackground",
          String(profile.useSameBackground)
        );
      } else {
        localStorage.removeItem("nautilusOS_useSameBackground");
      }
      
      if (profile.wallpaper) {
        localStorage.setItem("nautilusOS_wallpaper", profile.wallpaper);
      } else {
        localStorage.removeItem("nautilusOS_wallpaper");
      }
      
      if (profile.loginWallpaper) {
        localStorage.setItem(
          "nautilusOS_loginBackground",
          profile.loginWallpaper
        );
      } else {
        localStorage.removeItem("nautilusOS_loginBackground");
      }
      
      if (profile.profilePicture) {
        localStorage.setItem("nautilusOS_profilePicture", profile.profilePicture);
      } else {
        localStorage.removeItem("nautilusOS_profilePicture");
      }

      if (profile.showWhatsNew !== null && profile.showWhatsNew !== undefined) {
        localStorage.setItem("nautilusOS_showWhatsNew", profile.showWhatsNew);
      }

      if (profile.fileSystem) {
        const cleanedFileSystem = { ...profile.fileSystem };
        if (cleanedFileSystem.Photos) {
          cleanedFileSystem.Photos = {};
        }
        fileSystem = cleanedFileSystem;
      }
      
      checkImportedAchievements();
      
      applyUserBackgrounds();
      applyProfilePicture();
      initializeAppearanceSettings();

      showToast(
        "Profile imported successfully! Redirecting to login...",
        "fa-check-circle"
      );

      setTimeout(() => {
        const setup = document.getElementById("setup");
        setup.style.opacity = "0";

        setTimeout(() => {
          setup.style.display = "none";
          const login = document.getElementById("login");
          login.classList.add("active");
          document.getElementById("username").value = profile.username;
          updateLoginScreen();
          startLoginClock();
          displayBrowserInfo();
          updateLoginGreeting();
        }, 500);
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      showToast(
        "Failed to import profile. File may be corrupted or invalid.",
        "fa-exclamation-circle"
      );
    }
  };

  reader.onerror = function () {
    showToast("Failed to read profile file.", "fa-exclamation-circle");
  };

  reader.readAsText(file);
}
let cloakingConfig = {
  autoRotate: false,
  rotateSpeed: 10,
  rotationList: [
    { title: "Google", url: "https://www.google.com" },
    { title: "Gmail", url: "https://mail.google.com" },
    { title: "Google Drive", url: "https://drive.google.com" },
  ],
  currentRotationIndex: 0,
  panicKeyEnabled: false,
  panicKey: "Escape",
  panicUrl: "https://classroom.google.com",
};
let rotationInterval = null;
const originalTitle = document.title;

let achievementsData = {
  achievements: {
    "first-login": {
      id: "first-login",
      name: "Welcome Aboard!",
      description: "Successfully log in to NautilusOS for the first time",
      icon: "fa-fish",
      unlocked: false,
      unlockedDate: null,
    },
    "uptime-1h": {
      id: "uptime-1h",
      name: "Time Traveler",
      description: "Keep NautilusOS running for 1 hour of total uptime",
      icon: "fa-clock",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 60,
    },
    "uptime-5h": {
      id: "uptime-5h",
      name: "Marathon Runner",
      description: "Achieve 5 hours of total uptime across all sessions",
      icon: "fa-clock",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 300,
    },
    "uptime-10h": {
      id: "uptime-10h",
      name: "Dedicated",
      description: "Reach an impressive 10 hours of total uptime",
      icon: "fa-clock",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 600,
    },
    "uptime-24h": {
      id: "uptime-24h",
      name: "Please Go Outside",
      description: "Achieve the ultimate milestone: 24 hours of total uptime!",
      icon: "fa-clock",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1440,
    },
    "all-apps": {
      id: "all-apps",
      name: "Explorer",
      description: "Open all preinstalled applications at least once",
      icon: "fa-compass",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 12,
    },
    "stealth-mode": {
      id: "stealth-mode",
      name: "Stealth Mode",
      description: "Apply any cloaking setting to disguise your tab",
      icon: "fa-user-secret",
      unlocked: false,
      unlockedDate: null,
    },
    screenshot: {
      id: "screenshot",
      name: "Shutterbug",
      description: "Take your first screenshot",
      icon: "fa-camera",
      unlocked: false,
      unlockedDate: null,
    },
    "theme-changer": {
      id: "theme-changer",
      name: "Style Master",
      description: "Install a theme from the App Store",
      icon: "fa-palette",
      unlocked: false,
      unlockedDate: null,
    },
    "file-creator": {
      id: "file-creator",
      name: "Content Creator",
      description: "Create and save 5 text files",
      icon: "fa-file-alt",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 5,
    },
    multitasker: {
      id: "multitasker",
      name: "Multitasker",
      description: "Have 5 windows open simultaneously",
      icon: "fa-layer-group",
      unlocked: false,
      unlockedDate: null,
    },
    customizer: {
      id: "customizer",
      name: "Customizer",
      description: "Change at least 3 different settings",
      icon: "fa-sliders-h",
      unlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 3,
    },
  },
  easterEggs: {
    "dev-mode": {
      id: "dev-mode",
      name: "The Creator",
      lockedName: "???",
      description: "Welcome, developer! Are you sure it's really you?",
      icon: "fa-code",
      unlocked: false,
      unlockedDate: null,
      hint: "Try logging in with a special username...",
    },
    "konami-code": {
      id: "konami-code",
      name: "Old School Gamer",
      lockedName: "???",
      description: "You entered the legendary Konami Code!",
      icon: "fa-gamepad",
      unlocked: false,
      unlockedDate: null,
      hint: "Up, Up, Down, Down, Left, Right... what's next?",
    },
    "night-owl": {
      id: "night-owl",
      name: "Night Owl",
      lockedName: "???",
      description: "You used NautilusOS at an ungodly hour (12-3 AM)",
      icon: "fa-moon",
      unlocked: false,
      unlockedDate: null,
      hint: "Login during the witching hours...",
    },
    "speed-demon": {
      id: "speed-demon",
      name: "Speed Demon",
      lockedName: "???",
      description:
        "You opened 10 windows in under 30 seconds! How did you even manage this??",
      icon: "fa-bolt",
      unlocked: false,
      unlockedDate: null,
      hint: "Open many windows very quickly...",
      trackingData: {
        windowOpenTimes: [],
        threshold: 10,
        timeWindow: 30000,
      },
    },
  },
  openedApps: new Set(),
  settingsChanged: new Set(),
  totalUptime: 0,
  lastUptimeUpdate: Date.now(),
};

function loadAchievements() {
  const saved = localStorage.getItem("nautilusOS_achievements");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      achievementsData.achievements = {
        ...achievementsData.achievements,
        ...parsed.achievements,
      };
      achievementsData.easterEggs = {
        ...achievementsData.easterEggs,
        ...parsed.easterEggs,
      };
      achievementsData.openedApps = new Set(parsed.openedApps || []);
      achievementsData.settingsChanged = new Set(parsed.settingsChanged || []);
      achievementsData.totalUptime = parsed.totalUptime || 0;
    } catch (e) {
      console.error("Failed to load achievements:", e);
    }
  }
}

function saveAchievements() {
  const toSave = {
    achievements: achievementsData.achievements,
    easterEggs: achievementsData.easterEggs,
    openedApps: Array.from(achievementsData.openedApps),
    settingsChanged: Array.from(achievementsData.settingsChanged),
    totalUptime: achievementsData.totalUptime,
  };
  localStorage.setItem("nautilusOS_achievements", JSON.stringify(toSave));
}

function unlockAchievement(achievementId) {
  const achievement = achievementsData.achievements[achievementId];
  if (!achievement || achievement.unlocked) return;

  achievement.unlocked = true;
  achievement.unlockedDate = new Date().toISOString();
  saveAchievements();

  showToast(`Achievement Unlocked: ${achievement.name}!`, "fa-trophy");

  if (windows["achievements"]) {
    refreshAchievementsWindow();
  }
}

function unlockEasterEgg(eggId) {
  const egg = achievementsData.easterEggs[eggId];
  if (!egg || egg.unlocked) return;

  egg.unlocked = true;
  egg.unlockedDate = new Date().toISOString();
  saveAchievements();

  showToast(`Easter Egg Found: ${egg.name}!`, "fa-egg");

  if (windows["achievements"]) {
    refreshAchievementsWindow();
  }
}
function refreshAchievementsWindow() {
  if (!windows["achievements"]) return;

  const content = windows["achievements"].querySelector(".window-content");
  if (!content) return;

  const unlockedCount = Object.values(achievementsData.achievements).filter(
    (a) => a.unlocked
  ).length;
  const totalCount = Object.keys(achievementsData.achievements).length;
  const easterEggsCount = Object.values(achievementsData.easterEggs).filter(
    (e) => e.unlocked
  ).length;
  const totalEggs = Object.keys(achievementsData.easterEggs).length;

  const achievementsHtml = Object.values(achievementsData.achievements)
    .map((achievement) => {
      const hasProgress = achievement.target !== undefined;
      const progressPercent = hasProgress
        ? ((achievement.progress / achievement.target) * 100).toFixed(0)
        : 0;
      const progressText = hasProgress
        ? `${achievement.progress}/${achievement.target}`
        : "";

      return `
            <div class="achievement-card ${
              achievement.unlocked ? "unlocked" : "locked"
            }">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                    ${
                      achievement.unlocked
                        ? '<div class="achievement-badge">✓</div>'
                        : ""
                    }
                </div>
                <div class="achievement-name">${
                  achievement.unlocked ? achievement.name : "???"
                }</div>
                <div class="achievement-description">${
                  achievement.unlocked
                    ? achievement.description
                    : "Locked - Keep exploring to unlock!"
                }</div>
                ${
                  hasProgress && !achievement.unlocked
                    ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-date">${progressText}</div>
                `
                    : ""
                }
                ${
                  achievement.unlocked
                    ? `<div class="achievement-date">Unlocked: ${new Date(
                        achievement.unlockedDate
                      ).toLocaleDateString()}</div>`
                    : ""
                }
            </div>
        `;
    })
    .join("");

  const easterEggsHtml = Object.values(achievementsData.easterEggs)
    .map((egg) => {
      const displayName = egg.unlocked ? egg.name : egg.lockedName || "???";
      const displayDesc = egg.unlocked ? egg.description : egg.hint;

      return `
        <div class="easter-egg-card ${egg.unlocked ? "unlocked" : "locked"}">
            <div class="easter-egg-icon">
                <i class="fas ${egg.icon}"></i>
            </div>
            <div class="achievement-name">${displayName}</div>
            <div class="achievement-description">${
              egg.unlocked
                ? displayDesc
                : `<i class="fas fa-lightbulb" style="margin-right: 0.5rem; color: var(--accent);"></i>${displayDesc}`
            }</div>
            ${
              egg.unlocked
                ? `<div class="achievement-date">Found: ${new Date(
                    egg.unlockedDate
                  ).toLocaleDateString()}</div>`
                : ""
            }
        </div>
    `;
    })
    .join("");

  content.innerHTML = `
        <div class="achievements-content">
            <div class="achievements-header">
                <h2><i class="fas fa-trophy"></i> Achievements</h2>
                <div class="achievements-stats">
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${unlockedCount}/${totalCount}</div>
                        <div class="achievements-stat-label">Achievements</div>
                    </div>
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${easterEggsCount}/${totalEggs}</div>
                        <div class="achievements-stat-label">Easter Eggs</div>
                    </div>
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${Math.floor(
                          achievementsData.totalUptime
                        )}m</div>
                        <div class="achievements-stat-label">Total Uptime</div>
                    </div>
                </div>
            </div>
            
            <div class="achievements-section">
                <h3><i class="fas fa-medal"></i> Your Achievements</h3>
                <div class="achievements-grid">
                    ${achievementsHtml}
                </div>
            </div>
            
            <div class="achievements-section">
                <h3><i class="fas fa-egg"></i> Easter Eggs</h3>
                <div class="achievements-grid">
                    ${easterEggsHtml}
                </div>
            </div>
        </div>
    `;
}
function trackAppOpened(appName) {
  const preinstalledApps = [
    "files",
    "terminal",
    "browser",
    "settings",
    "editor",
    "music",
    "photos",
    "help",
    "whatsnew",
    "appstore",
    "calculator",
    "cloaking",
  ];

  if (preinstalledApps.includes(appName)) {
    achievementsData.openedApps.add(appName);

    const achievement = achievementsData.achievements["all-apps"];
    achievement.progress = achievementsData.openedApps.size;

    if (achievementsData.openedApps.size >= achievement.target) {
      unlockAchievement("all-apps");
    }

    saveAchievements();
  }
}

function trackSettingChanged(settingName) {
  achievementsData.settingsChanged.add(settingName);

  const achievement = achievementsData.achievements["customizer"];
  achievement.progress = achievementsData.settingsChanged.size;

  if (achievementsData.settingsChanged.size >= achievement.target) {
    unlockAchievement("customizer");
  }

  saveAchievements();
}

function updateUptime() {
  const now = Date.now();
  const elapsed = (now - achievementsData.lastUptimeUpdate) / 1000 / 60;
  achievementsData.totalUptime += elapsed;
  achievementsData.lastUptimeUpdate = now;

  const uptime1h = achievementsData.achievements["uptime-1h"];
  uptime1h.progress = Math.min(achievementsData.totalUptime, uptime1h.target);
  if (achievementsData.totalUptime >= uptime1h.target) {
    unlockAchievement("uptime-1h");
  }

  const uptime5h = achievementsData.achievements["uptime-5h"];
  uptime5h.progress = Math.min(achievementsData.totalUptime, uptime5h.target);
  if (achievementsData.totalUptime >= uptime5h.target) {
    unlockAchievement("uptime-5h");
  }

  saveAchievements();
}

function openAchievements() {
  const unlockedCount = Object.values(achievementsData.achievements).filter(
    (a) => a.unlocked
  ).length;
  const totalCount = Object.keys(achievementsData.achievements).length;
  const easterEggsCount = Object.values(achievementsData.easterEggs).filter(
    (e) => e.unlocked
  ).length;
  const totalEggs = Object.keys(achievementsData.easterEggs).length;

  const achievementsHtml = Object.values(achievementsData.achievements)
    .map((achievement) => {
      const hasProgress = achievement.target !== undefined;
      const progressPercent = hasProgress
        ? ((achievement.progress / achievement.target) * 100).toFixed(0)
        : 0;
      const progressText = hasProgress
        ? `${achievement.progress}/${achievement.target}`
        : "";

      return `
            <div class="achievement-card ${
              achievement.unlocked ? "unlocked" : "locked"
            }">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                    ${
                      achievement.unlocked
                        ? '<div class="achievement-badge">✓</div>'
                        : ""
                    }
                </div>
                <div class="achievement-name">${
                  achievement.unlocked ? achievement.name : "???"
                }</div>
                <div class="achievement-description">${
                  achievement.unlocked
                    ? achievement.description
                    : "Locked - Keep exploring to unlock!"
                }</div>
                ${
                  hasProgress && !achievement.unlocked
                    ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-date">${progressText}</div>
                `
                    : ""
                }
                ${
                  achievement.unlocked
                    ? `<div class="achievement-date">Unlocked: ${new Date(
                        achievement.unlockedDate
                      ).toLocaleDateString()}</div>`
                    : ""
                }
            </div>
        `;
    })
    .join("");

  const easterEggsHtml = Object.values(achievementsData.easterEggs)
    .map((egg) => {
      const displayName = egg.unlocked ? egg.name : egg.lockedName || "???";
      const displayDesc = egg.unlocked ? egg.description : egg.hint;

      return `
            <div class="easter-egg-card ${
              egg.unlocked ? "unlocked" : "locked"
            }">
                <div class="easter-egg-icon">
                    <i class="fas ${egg.icon}"></i>
                </div>
                <div class="achievement-name">${displayName}</div>
                <div class="achievement-description">${
                  egg.unlocked
                    ? displayDesc
                    : `<i class="fas fa-lightbulb" style="margin-right: 0.5rem; color: var(--accent);"></i>${displayDesc}`
                }</div>
                ${
                  egg.unlocked
                    ? `<div class="achievement-date">Found: ${new Date(
                        egg.unlockedDate
                      ).toLocaleDateString()}</div>`
                    : ""
                }
            </div>
        `;
    })
    .join("");

  const content = `
        <div class="achievements-content">
            <div class="achievements-header">
                <h2><i class="fas fa-trophy"></i> Achievements</h2>
                <div class="achievements-stats">
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${unlockedCount}/${totalCount}</div>
                        <div class="achievements-stat-label">Achievements</div>
                    </div>
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${easterEggsCount}/${totalEggs}</div>
                        <div class="achievements-stat-label">Easter Eggs</div>
                    </div>
                    <div class="achievements-stat">
                        <div class="achievements-stat-value">${Math.floor(
                          achievementsData.totalUptime
                        )}m</div>
                        <div class="achievements-stat-label">Total Uptime</div>
                    </div>
                </div>
            </div>
            
            <div class="achievements-section">
                <h3><i class="fas fa-medal"></i> Your Achievements</h3>
                <div class="achievements-grid">
                    ${achievementsHtml}
                </div>
            </div>
            
            <div class="achievements-section">
                <h3><i class="fas fa-egg"></i> Easter Eggs</h3>
                <div class="achievements-grid">
                    ${easterEggsHtml}
                </div>
            </div>
        </div>
    `;

  createWindow(
    "Achievements",
    "fas fa-trophy",
    content,
    800,
    600,
    "achievements",
    true
  );
}

let konamiCode = [];
const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

document.addEventListener("keydown", (e) => {
  konamiCode.push(e.code);
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }

  if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
    unlockEasterEgg("konami-code");
    konamiCode = [];
  }
});

function checkNightOwl() {
  const hour = new Date().getHours();
  if (hour >= 11 && hour < 3) {
    unlockEasterEgg("night-owl");
  }
}
const originalFavicon = document.querySelector('link[rel="icon"]')?.href || "";

function loadCloakingConfig() {
  const saved = localStorage.getItem("nautilusOS_cloaking");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      cloakingConfig = {
        ...cloakingConfig,
        ...parsed,
        panicKeyEnabled: parsed.panicKeyEnabled || false,
        panicKey: parsed.panicKey || "Escape",
        panicUrl: parsed.panicUrl || "https://classroom.google.com",
      };
    } catch (e) {
      console.error("Failed to load cloaking config:", e);
    }
  }

  if (cloakingConfig.panicKeyEnabled) {
    setupPanicKeyListener();
  }
}

function saveCloakingConfig() {
  localStorage.setItem("nautilusOS_cloaking", JSON.stringify(cloakingConfig));
}

function applyCloaking() {
  const title = document.getElementById("cloakTitle").value.trim();
  const faviconUrl = document.getElementById("cloakFavicon").value.trim();

  if (!title && !faviconUrl) {
    showToast("Please enter a title or favicon URL", "fa-exclamation-circle");
    return;
  }

  if (title) {
    document.title = title;
  }

  if (faviconUrl) {
    setFavicon(faviconUrl);
  }

  showToast("Cloaking applied!", "fa-check-circle");
  unlockAchievement("stealth-mode");
}

function setFavicon(url) {
  const existingFavicons = document.querySelectorAll('link[rel="icon"]');
  existingFavicons.forEach((favicon) => favicon.remove());

  let faviconLink = document.createElement("link");
  faviconLink.rel = "icon";
  faviconLink.type = "image/x-icon";

  let domain = url;
  try {
    const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
    domain = urlObj.origin;
  } catch (e) {
    domain = "https://" + url.replace(/^https?:\/\//, "");
  }

  faviconLink.href = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  document.head.appendChild(faviconLink);

  faviconLink.onerror = () => {
    faviconLink.href = `https://icons.duckduckgo.com/ip3/${domain.replace(
      /^https?:\/\//,
      ""
    )}.ico`;
  };
}

function resetCloaking() {
  document.title = originalTitle;

  const existingFavicons = document.querySelectorAll('link[rel="icon"]');
  existingFavicons.forEach((favicon) => favicon.remove());

  if (originalFavicon) {
    const faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.href = originalFavicon;
    document.head.appendChild(faviconLink);
  }

  const titleInput = document.getElementById("cloakTitle");
  const faviconInput = document.getElementById("cloakFavicon");
  if (titleInput) titleInput.value = originalTitle;
  if (faviconInput) faviconInput.value = "";

  showToast("Cloaking reset to default", "fa-undo");
}

function toggleAutoRotate() {
  cloakingConfig.autoRotate = !cloakingConfig.autoRotate;
  const toggle = document.getElementById("autoRotateToggle");
  const settings = document.getElementById("rotateSettings");
  const indicator = document.querySelector(
    '.cloaking-tab[data-tab="rotate"] .cloaking-status-indicator'
  );
  const statusDesc = document.querySelector(
    '.cloaking-tab[data-tab="rotate"] .cloaking-status-desc'
  );

  if (cloakingConfig.autoRotate) {
    if (toggle) toggle.classList.add("active");
    if (settings) {
      settings.style.opacity = "1";
      settings.style.pointerEvents = "all";
    }
    if (indicator) indicator.classList.add("active");
    if (statusDesc) statusDesc.textContent = "Currently Active";
    startRotation();
    showToast("Auto-rotate enabled", "fa-sync-alt");
  } else {
    if (toggle) toggle.classList.remove("active");
    if (settings) {
      settings.style.opacity = "0.5";
      settings.style.pointerEvents = "none";
    }
    if (indicator) indicator.classList.remove("active");
    if (statusDesc) statusDesc.textContent = "Currently Inactive";
    stopRotation();
    showToast("Auto-rotate disabled", "fa-sync-alt");
  }

  saveCloakingConfig();
}

function startRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
  }

  if (cloakingConfig.rotationList.length === 0) {
    showToast("Add websites to rotation list first", "fa-exclamation-circle");
    return;
  }

  rotateCloaking();

  rotationInterval = setInterval(() => {
    rotateCloaking();
  }, cloakingConfig.rotateSpeed * 1000);
}

function stopRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

function rotateCloaking() {
  if (cloakingConfig.rotationList.length === 0) return;

  const site = cloakingConfig.rotationList[cloakingConfig.currentRotationIndex];
  document.title = site.title;
  setFavicon(site.url);

  cloakingConfig.currentRotationIndex =
    (cloakingConfig.currentRotationIndex + 1) %
    cloakingConfig.rotationList.length;
}

function renderRotationList() {
  const container = document.getElementById("rotationList");
  if (!container) return;

  if (cloakingConfig.rotationList.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No websites added yet. Click "Add Website" to get started.</p>';
    return;
  }

  container.innerHTML = cloakingConfig.rotationList
    .map(
      (site, index) => `
        <div class="startup-item" style="margin-bottom: 0;">
            <div class="startup-item-icon" style="width: 45px; height: 45px;">
                <i class="fas fa-globe"></i>
            </div>
            <div class="startup-item-info">
                <div class="startup-item-name">${site.title}</div>
                <div class="startup-item-status">${site.url}</div>
            </div>
            <button class="file-action-btn delete" onclick="removeRotationSite(${index})" style="padding: 0.6rem 0.875rem;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `
    )
    .join("");
}
async function addRotationSite() {
  const title = await prompt("Enter website title (e.g., Google):");
  if (!title) return;

  const url = await prompt("Enter website URL (e.g., https://www.google.com):");
  if (!url) return;

  cloakingConfig.rotationList.push({ title, url });
  renderRotationList();
  showToast("Website added to rotation", "fa-plus");
}

function removeRotationSite(index) {
  cloakingConfig.rotationList.splice(index, 1);
  renderRotationList();
  showToast("Website removed from rotation", "fa-trash");
}

function saveRotationSettings() {
  const speedInput = document.getElementById("rotateSpeed");
  if (speedInput) {
    const speed = parseInt(speedInput.value);
    if (speed >= 1 && speed <= 300) {
      cloakingConfig.rotateSpeed = speed;
    }
  }

  saveCloakingConfig();

  if (cloakingConfig.autoRotate) {
    stopRotation();
    startRotation();
  }

  showToast("Rotation settings saved!", "fa-save");
}

window.addEventListener("DOMContentLoaded", () => {
  loadCloakingConfig();

  if (cloakingConfig.autoRotate) {
    setTimeout(() => {
      startRotation();
    }, 2000);
  }

  if (cloakingConfig.panicKeyEnabled) {
    setupPanicKeyListener();
  }
});

const _originalOpenAppForCloaking2 = openApp;
window.openApp = openApp = function (appName, ...args) {
  _originalOpenAppForCloaking2(appName, ...args);

  if (appName === "cloaking") {
    setTimeout(() => {
      const toggle = document.getElementById("autoRotateToggle");
      const settings = document.getElementById("rotateSettings");

      if (toggle && cloakingConfig.autoRotate) {
        toggle.classList.add("active");
        if (settings) {
          settings.style.opacity = "1";
          settings.style.pointerEvents = "all";
        }
      }

      const speedInput = document.getElementById("rotateSpeed");
      if (speedInput) {
        speedInput.value = cloakingConfig.rotateSpeed;
        updateRotateSpeedDisplay(cloakingConfig.rotateSpeed);
      }

      renderRotationList();

      const panicUrl = document.getElementById("panicUrl");
      if (panicUrl) {
        panicUrl.value = cloakingConfig.panicUrl || "";
      }

      const panicDisplay = document.getElementById("panicHotkeyDisplay");
      if (panicDisplay) {
        panicDisplay.textContent =
          cloakingConfig.panicKey || "Click to set hotkey";
      }

      updateCloakPreview();
    }, 100);
  }
};
function showProperties(appName, x, y) {
  const tooltip = document.getElementById("propertiesTooltip");
  const metadata = appMetadata[appName];

  if (!metadata) {
    showToast("App information not available", "fa-info-circle");
    return;
  }

  const iconEl = document.getElementById("propIcon");
  iconEl.innerHTML = `<i class="fas ${metadata.icon}"></i>`;

  const nameEl = document.getElementById("propName");
  nameEl.textContent = metadata.name;

  const statusEl = document.getElementById("propStatus");
  if (metadata.preinstalled) {
    statusEl.textContent = "Preinstalled";
    statusEl.className = "properties-badge preinstalled";
  } else {
    statusEl.textContent = "Installed from App Store";
    statusEl.className = "properties-badge installed";
  }

  const typeEl = document.getElementById("propType");
  typeEl.textContent = metadata.preinstalled
    ? "System Application"
    : "Third-party Application";

  tooltip.style.left = x + 15 + "px";
  tooltip.style.top = y + "px";
  tooltip.classList.add("active");

  setTimeout(() => {
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      tooltip.style.left = x - rect.width - 15 + "px";
    }
    if (rect.bottom > window.innerHeight) {
      tooltip.style.top = y - rect.height + "px";
    }
    if (rect.top < 0) {
      tooltip.style.top = "10px";
    }
    if (rect.left < 0) {
      tooltip.style.left = "10px";
    }
  }, 0);
}

function hideProperties() {
  const tooltip = document.getElementById("propertiesTooltip");
  tooltip.classList.remove("active");
}

document.addEventListener("click", (e) => {
  const tooltip = document.getElementById("propertiesTooltip");
  if (
    tooltip &&
    !tooltip.contains(e.target) &&
    !e.target.closest(".context-menu")
  ) {
    hideProperties();
  }
});

document.addEventListener("contextmenu", () => {
  hideProperties();
});
function updateLoginScreen() {
  const isPasswordless =
    localStorage.getItem("nautilusOS_isPasswordless") === "true";
  const passwordWrapper = document.getElementById("passwordWrapper");
  const loginSubtitle = document.getElementById("loginSubtitle");
  const loginContainer = document.querySelector(".login-container");

  if (isPasswordless) {
    if (passwordWrapper) passwordWrapper.style.display = "none";
    if (loginSubtitle)
      loginSubtitle.textContent =
        "Passwordless account - just enter your username";
    if (loginContainer) loginContainer.classList.add("passwordless");
  } else {
    if (passwordWrapper) passwordWrapper.style.display = "block";
    if (loginSubtitle) loginSubtitle.textContent = "Sign in to continue";
    if (loginContainer) loginContainer.classList.remove("passwordless");
  }
}
function switchSettingsTab(tabName, element) {
  document.querySelectorAll(".settings-nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  element.classList.add("active");

  document.querySelectorAll(".settings-tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const targetContent = document.querySelector(
    `.settings-tab-content[data-tab="${tabName}"]`
  );
  if (targetContent) {
    targetContent.classList.add("active");
  }
}
function expandHelpTopic(topicId) {
  const expandedView = document.getElementById("helpExpandedView");
  const expandedContent = document.getElementById("helpExpandedContent");

  const topics = {
    welcome: {
      title: "Welcome to NautilusOS",
      icon: "fa-info-circle",
      content: `
                <h2><i class="fas fa-info-circle"></i> Welcome to NautilusOS</h2>
                <p>NautilusOS is a fully-featured web-based operating system with a complete desktop environment, virtual file system, and productivity applications.</p>
                <p>This help system will guide you through all the features and capabilities of NautilusOS. Select any topic from the main menu to learn more.</p>
            `,
    },
    cloaking: {
      title: "Cloaking",
      icon: "fa-mask",
      content: `
                <h2><i class="fas fa-mask"></i> Cloaking</h2>
                <p>Disguise your browser tab with custom titles and favicons, as well as auto-rotate features to keep your tab constantly changing.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Custom Title</strong> - Change the tab title to anything you want</li>
                    <li><strong>Custom Favicon</strong> - Set any website's favicon (just enter the URL)</li>
                    <li><strong>Auto-Rotate</strong> - Automatically cycle through multiple disguises</li>
                    <li><strong>Rotation Speed</strong> - Control how fast the tab changes (1-300 seconds)</li>
                </ul>
            `,
    },
    boot: {
      title: "Boot Options",
      icon: "fa-power-off",
      content: `
                <h2><i class="fas fa-power-off"></i> Boot Options</h2>
                <p>NautilusOS offers two boot modes:</p>
                <ul>
                    <li><strong>Nautilus OS (Graphical)</strong> - Full desktop environment with windows, icons, and applications</li>
                    <li><strong>Nautilus OS (Command Line)</strong> - Terminal-only interface for command-line operations</li>
                </ul>
                <p>Your boot choice is remembered automatically. To change it, open Settings → System → Reset Boot Preference.</p>
            `,
    },
    apps: {
      title: "Applications",
      icon: "fa-th",
      content: `
                <h2><i class="fas fa-th"></i> Applications</h2>
                <ul>
                    <li><strong>Files</strong> - Browse and manage your virtual file system with tree navigation</li>
                    <li><strong>Terminal</strong> - Access command-line interface with Unix commands</li>
                    <li><strong>Nautilus Browser</strong> - Browse the web with multiple tabs and navigation</li>
                    <li><strong>Text Editor</strong> - Create and edit text files with save options</li>
                    <li><strong>Music</strong> - Play audio files with playback controls</li>
                    <li><strong>Photos</strong> - View screenshots and images</li>
                    <li><strong>Calculator</strong> - Perform calculations with basic operations</li>
                    <li><strong>Settings</strong> - Customize clock format, desktop icons, and themes</li>
                    <li><strong>App Store</strong> - Browse and install themes and apps</li>
                    <li><strong>Achievements</strong> - Track your progress with achievements and Easter eggs</li>
                    <li><strong>Cloaking</strong> - Disguise your browser tab</li>
                </ul>
            `,
    },
    desktop: {
      title: "Desktop Features",
      icon: "fa-desktop",
      content: `
                <h2><i class="fas fa-desktop"></i> Desktop Features</h2>
                <h3>Desktop Icons</h3>
                <ul>
                    <li><strong>Double-click</strong> to open applications</li>
                    <li><strong>Drag and drop</strong> to rearrange with automatic grid snapping</li>
                    <li><strong>Right-click</strong> for context menu with properties and actions</li>
                </ul>
                <h3>Start Menu</h3>
                <p>Click the fish icon in the taskbar to access all applications, view your profile, and sign out or shut down the system.</p>
                <h3>Taskbar</h3>
                <ul>
                    <li>Shows pinned apps and currently open windows</li>
                    <li>Visual indicators show active and minimized windows</li>
                    <li>System tray displays notifications, quick actions, and clock</li>
                </ul>
                <h3>Windows</h3>
                <ul>
                    <li><strong>Drag title bar</strong> to move windows</li>
                    <li><strong>Resize</strong> from any edge or corner</li>
                    <li><strong>Minimize</strong> - Hide window (still open in taskbar)</li>
                    <li><strong>Maximize</strong> - Full screen mode</li>
                    <li><strong>Close</strong> - Completely close the application</li>
                </ul>
            `,
    },
    notifications: {
      title: "Notifications & Quick Actions",
      icon: "fa-bell",
      content: `
                <h2><i class="fas fa-bell"></i> Notifications & Quick Actions</h2>
                <h3>Quick Actions Panel</h3>
                <p>Click the <strong>bolt icon</strong> in the taskbar to access:</p>
                <ul>
                    <li><strong>Screenshot</strong> - Capture your desktop instantly</li>
                    <li><strong>Close All</strong> - Close all open windows at once</li>
                    <li><strong>Sign Out</strong> - Return to login screen</li>
                    <li><strong>Shut Down</strong> - Exit NautilusOS completely</li>
                </ul>
                <h3>Notification Center</h3>
                <p>Click the <strong>bell icon</strong> to view your notification history. All system messages are stored here so you can review them later.</p>
                <ul>
                    <li>View up to 50 recent notifications</li>
                    <li>See when each notification was received</li>
                    <li>Clear individual notifications or all at once</li>
                </ul>
            `,
    },
    screenshots: {
      title: "Taking Screenshots",
      icon: "fa-camera",
      content: `
                <h2><i class="fas fa-camera"></i> Taking Screenshots</h2>
                <p>Capture your desktop in just a few steps:</p>
                <h3>How to Take a Screenshot</h3>
                <ul>
                    <li>Click <strong>Quick Actions</strong> (bolt icon) in the taskbar</li>
                    <li>Select <strong>Screenshot</strong> option</li>
                    <li>Choose which screen/window to capture in the browser dialog</li>
                    <li>Your screenshot automatically saves to the Photos folder</li>
                    <li>The Photos app opens automatically to view it</li>
                </ul>
                <h3>Screenshot Features</h3>
                <ul>
                    <li>Automatic file naming with date and timestamp</li>
                    <li>Full screen or individual window capture</li>
                    <li>View, organize, and delete screenshots in Photos app</li>
                    <li>Full-screen preview by clicking any photo</li>
                </ul>
            `,
    },
    settings: {
      title: "Settings & Customization",
      icon: "fa-cog",
      content: `
                <h2><i class="fas fa-cog"></i> Settings & Customization</h2>
                <h3>General Settings</h3>
                <ul>
                    <li><strong>Clock Format</strong> - Toggle between 12/24 hour format</li>
                    <li><strong>Show Seconds</strong> - Display seconds in taskbar clock</li>
                    <li><strong>Desktop Icons</strong> - Show or hide all desktop icons</li>
                    <li><strong>What's New</strong> - Control startup behavior</li>
                </ul>
                <h3>Appearance</h3>
                <ul>
                    <li>Install custom themes from the App Store</li>
                    <li>Apply different color schemes and styles</li>
                    <li>Preview themes before applying</li>
                </ul>
                <h3>System</h3>
                <ul>
                    <li>Reset boot preferences to choose mode on startup</li>
                    <li>View system information and uptime</li>
                </ul>
                <h3>Account</h3>
                <ul>
                    <li>View your username and account type</li>
                    <li><strong>Export Profile</strong> - Save all settings and data</li>
                    <li><strong>Import Profile</strong> - Restore from backup</li>
                </ul>
                <h3>Advanced</h3>
                <ul>
                    <li><strong>Reset All Data</strong> - Return to setup (achievements preserved!)</li>
                </ul>
            `,
    },
    tips: {
      title: "Tips & Tricks",
      icon: "fa-lightbulb",
      content: `
                <h2><i class="fas fa-lightbulb"></i> Tips & Tricks</h2>
                <h3>Productivity Tips</h3>
                <ul>
                    <li>Drag files between folders in Files app for quick organization</li>
                    <li>Use browser tabs to multitask across multiple websites</li>
                    <li>Save text files to device to download them to your real computer</li>
                    <li>Right-click anywhere for context menus with quick actions</li>
                    <li>Check notification history to review past system messages</li>
                </ul>
                <h3>Keyboard Shortcuts</h3>
                <ul>
                    <li><strong>Enter</strong> in bootloader - Select highlighted option</li>
                    <li><strong>Arrow Keys</strong> in bootloader - Navigate options</li>
                    <li><strong>Enter</strong> in login - Submit credentials</li>
                    <li><strong>Enter</strong> in terminal - Execute command</li>
                </ul>
                <h3>Hidden Features</h3>
                <ul>
                    <li>Try logging in with special usernames for surprises</li>
                    <li>Explore different times of day for unique experiences</li>
                    <li>Open many windows quickly for unexpected results</li>
                    <li>There are 4 Easter eggs hidden throughout the system!</li>
                </ul>
                <h3>Best Practices</h3>
                <ul>
                    <li>Regularly export your profile to backup important data</li>
                    <li>Organize files into folders for easier navigation</li>
                    <li>Use Startup Apps to automatically launch favorite programs</li>
                    <li>Install Task Manager to monitor running applications</li>
                </ul>
            `,
    },
  };

  const topic = topics[topicId];
  if (!topic) return;

  expandedContent.innerHTML = topic.content;
  expandedView.classList.add("active");
}

function closeHelpTopic() {
  const expandedView = document.getElementById("helpExpandedView");
  expandedView.classList.remove("active");
}
function switchCloakingTab(tabName, element) {
  document.querySelectorAll(".cloaking-nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  element.classList.add("active");

  document.querySelectorAll(".cloaking-tab").forEach((content) => {
    content.classList.remove("active");
  });

  const targetContent = document.querySelector(
    `.cloaking-tab[data-tab="${tabName}"]`
  );
  if (targetContent) {
    targetContent.classList.add("active");
  }
  if (tabName === "rotate") {
    renderRotationList();
  }
}
function updateCloakPreview() {
  const titleInput = document.getElementById("cloakTitle");
  const faviconInput = document.getElementById("cloakFavicon");
  const previewTitle = document.getElementById("previewTitle");
  const previewFavicon = document.getElementById("previewFavicon");

  if (!titleInput || !previewTitle) return;

  const title = titleInput.value.trim() || "NautilusOS";
  previewTitle.textContent = title;

  if (faviconInput && previewFavicon) {
    const url = faviconInput.value.trim();
    if (url) {
      let domain = url;
      try {
        const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
        domain = urlObj.origin;
      } catch (e) {
        domain = "https://" + url.replace(/^https?:\/\//, "");
      }
      previewFavicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } else {
      previewFavicon.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75' fill='white'%3E🌐︎%3C/text%3E%3C/svg%3E";
    }
  }
}
function updateRotateSpeedDisplay(value) {
  const display = document.getElementById("rotateSpeedValue");
  if (display) {
    display.textContent = value + "s";
  }
}

function togglePanicKey() {
  cloakingConfig.panicKeyEnabled = !cloakingConfig.panicKeyEnabled;
  saveCloakingConfig();

  const toggle = document.querySelector(
    '.cloaking-tab[data-tab="panic"] .toggle-switch'
  );
  const indicator = document.querySelector(
    '.cloaking-tab[data-tab="panic"] .cloaking-status-indicator'
  );
  const statusDesc = document.querySelector(
    '.cloaking-tab[data-tab="panic"] .cloaking-status-desc'
  );

  if (cloakingConfig.panicKeyEnabled) {
    if (toggle) toggle.classList.add("active");
    if (indicator) indicator.classList.add("active");
    if (statusDesc) statusDesc.textContent = "Armed and Ready";
    showToast(
      "Panic key enabled! Press " + cloakingConfig.panicKey + " to activate",
      "fa-shield-alt"
    );
    setupPanicKeyListener();
  } else {
    if (toggle) toggle.classList.remove("active");
    if (indicator) indicator.classList.remove("active");
    if (statusDesc) statusDesc.textContent = "Disabled";
    showToast("Panic key disabled", "fa-shield");
    removePanicKeyListener();
  }
}

let isRecordingPanicKey = false;
let panicKeyListener = null;

function recordPanicKey() {
  if (isRecordingPanicKey) return;

  const display = document.getElementById("panicHotkeyDisplay");
  if (!display) return;

  isRecordingPanicKey = true;
  display.textContent = "Press any key...";
  display.classList.add("recording");

  const recordListener = (e) => {
    e.preventDefault();

    let keyCombo = [];
    if (e.ctrlKey) keyCombo.push("Ctrl");
    if (e.altKey) keyCombo.push("Alt");
    if (e.shiftKey) keyCombo.push("Shift");
    if (e.metaKey) keyCombo.push("Meta");

    if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      keyCombo.push(e.key);
    }

    const keyString = keyCombo.join(" + ");
    cloakingConfig.panicKey = keyString;

    display.textContent = keyString;
    display.classList.remove("recording");
    isRecordingPanicKey = false;

    saveCloakingConfig();
    showToast("Panic key set to: " + keyString, "fa-keyboard");

    document.removeEventListener("keydown", recordListener);

    if (cloakingConfig.panicKeyEnabled) {
      removePanicKeyListener();
      setupPanicKeyListener();
    }
  };

  document.addEventListener("keydown", recordListener);
}

function setupPanicKeyListener() {
  removePanicKeyListener();

  panicKeyListener = (e) => {
    if (!cloakingConfig.panicKeyEnabled) return;

    let pressedCombo = [];
    if (e.ctrlKey) pressedCombo.push("Ctrl");
    if (e.altKey) pressedCombo.push("Alt");
    if (e.shiftKey) pressedCombo.push("Shift");
    if (e.metaKey) pressedCombo.push("Meta");

    if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      pressedCombo.push(e.key);
    }

    const pressedString = pressedCombo.join(" + ");

    if (pressedString === cloakingConfig.panicKey) {
      e.preventDefault();
      triggerPanicMode();
    }
  };

  document.addEventListener("keydown", panicKeyListener);
}

function removePanicKeyListener() {
  if (panicKeyListener) {
    document.removeEventListener("keydown", panicKeyListener);
    panicKeyListener = null;
  }
}

function testPanicKey() {
  const url = document.getElementById("panicUrl")?.value.trim();
  if (!url) {
    showToast("Please enter a panic URL first", "fa-exclamation-circle");
    return;
  }

  showToast("Testing panic redirect in 2 seconds...", "fa-vial");
  setTimeout(() => {
    triggerPanicMode();
  }, 2000);
}

function triggerPanicMode() {
  const url = cloakingConfig.panicUrl || "https://classroom.google.com";

  Object.keys(windows).forEach((appName) => {
    const win = windows[appName];
    if (win) {
      win.style.display = "none";
    }
  });

  let domain = url;
  try {
    const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
    domain = urlObj.origin;
    document.title = urlObj.hostname;
  } catch (e) {
    domain = "https://" + url.replace(/^https?:\/\//, "");
    document.title = url.replace(/^https?:\/\//, "").split("/")[0];
  }

  setFavicon(domain);

  window.location.href = url.startsWith("http") ? url : "https://" + url;
}

function changeSearchEngine(value) {
  console.log('[DEBUG] changeSearchEngine called with value:', value);
  localStorage.setItem('nOS_searchEngine', value);
  showToast('Search engine updated!', 'fa-check-circle');
}

function applyPreset(presetName) {
  const presets = {
    google: {
      title: "Google",
      url: "https://www.google.com",
    },
    gmail: {
      title: "Gmail",
      url: "https://mail.google.com",
    },
    drive: {
      title: "Google Drive",
      url: "https://drive.google.com",
    },
    classroom: {
      title: "Google Classroom",
      url: "https://classroom.google.com",
    },
    docs: {
      title: "Google Docs",
      url: "https://docs.google.com",
    },
    youtube: {
      title: "YouTube",
      url: "https://www.youtube.com",
    },
    wikipedia: {
      title: "Wikipedia",
      url: "https://www.wikipedia.org",
    },
    github: {
      title: "GitHub",
      url: "https://github.com",
    },
  };

  const preset = presets[presetName];
  if (!preset) return;

  document.title = preset.title;
  setFavicon(preset.url);

  showToast(`Applied ${preset.title} preset!`, "fa-check-circle");
  unlockAchievement("stealth-mode");
}

function checkImportedAchievements() {
  if (installedThemes.length > 0) {
    unlockAchievement("theme-changer");
  }
  
  const preinstalledApps = [
    "files",
    "terminal",
    "browser",
    "settings",
    "editor",
    "music",
    "photos",
    "help",
    "whatsnew",
    "appstore",
    "calculator",
    "cloaking",
  ];
  
  installedApps.forEach((appName) => {
    if (!preinstalledApps.includes(appName)) {
      achievementsData.openedApps.add(appName);
    }
  });
  
  const allAppsAchievement = achievementsData.achievements["all-apps"];
  if (allAppsAchievement) {
  allAppsAchievement.progress = achievementsData.openedApps.size;
  if (achievementsData.openedApps.size >= allAppsAchievement.target) {
  unlockAchievement("all-apps");
  }
  }
  
  saveAchievements();
  }
  
  function openChangeUsernameDialog() {
  showModal(
  "Change Username",
  "fa-user-edit",
  "Enter your new username:",
  "changeUsername",
  "Change",
  "Cancel"
  );
  
  const inputContainer = document.getElementById("modalInputContainer");
  inputContainer.innerHTML = `
  <input 
  type="text" 
  id="newUsernameInput" 
  class="login-input" 
  placeholder="New username" 
  value="${currentUsername}"
  style="margin-bottom: 1rem; width: 100%;"
  onkeypress="if(event.key === 'Enter') changeUsername()"
  >
  `;
  
  setTimeout(() => {
  const input = document.getElementById("newUsernameInput");
  if (input) {
  input.focus();
  input.select();
  }
  }, 100);
  }
  
  function changeUsername() {
  const newUsernameInput = document.getElementById("newUsernameInput");
  if (!newUsernameInput) return;
  
  const newUsername = newUsernameInput.value.trim();
  
  if (!newUsername) {
  showToast("Username cannot be empty", "fa-exclamation-circle");
  return;
  }
  
  if (newUsername.length < 3) {
  showToast("Username must be at least 3 characters long", "fa-exclamation-circle");
  return;
  }
  
  if (newUsername.length > 20) {
  showToast("Username must be 20 characters or less", "fa-exclamation-circle");
  return;
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
  showToast("Username can only contain letters, numbers, underscores, and hyphens", "fa-exclamation-circle");
  return;
  }
  
  if (newUsername === currentUsername) {
  showToast("New username is the same as current username", "fa-info-circle");
  closeModal();
  return;
  }
  
  currentUsername = newUsername;
  localStorage.setItem("nautilusOS_username", newUsername);
  document.getElementById("displayUsername").textContent = newUsername;
  
  showToast(`Username changed to "${newUsername}"`, "fa-check-circle");
  closeModal();
  
  if (windows["settings"]) {
  closeWindow(
  windows["settings"].querySelector(".window-btn.close"),
  "settings"
  );
  }
  }

let game2048 = {
  board: null,
  score: 0,
  best: localStorage.getItem('2048Best') ? parseInt(localStorage.getItem('2048Best')) : 0,
  size: 4,
  gameStarted: false,
  tiles: []
};

function start2048Game() {
  game2048.board = Array(game2048.size).fill().map(() => Array(game2048.size).fill(0));
  game2048.score = 0;
  game2048.gameStarted = true;
  game2048.tiles = [];
  
  document.getElementById('game2048Score').textContent = '0';
  document.getElementById('game2048Best').textContent = game2048.best;
  
  addRandomTile2048();
  addRandomTile2048();
  render2048Board();
  
  document.removeEventListener('keydown', handle2048KeyPress);
  document.addEventListener('keydown', handle2048KeyPress);
}

function addRandomTile2048() {
  const emptyCells = [];
  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      if (game2048.board[i][j] === 0) {
        emptyCells.push({row: i, col: j});
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    game2048.board[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
  }
}

function getTileColor(value) {
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
  
  if (value === 0) return bgSecondary;
  if (value === 2) return 'rgba(125, 211, 192, 0.2)';
  if (value === 4) return 'rgba(125, 211, 192, 0.3)';
  if (value === 8) return 'rgba(125, 211, 192, 0.4)';
  if (value === 16) return 'rgba(125, 211, 192, 0.5)';
  if (value === 32) return 'rgba(125, 211, 192, 0.6)';
  if (value === 64) return 'rgba(125, 211, 192, 0.7)';
  if (value === 128) return 'rgba(125, 211, 192, 0.8)';
  if (value >= 256) return accentColor;
  return accentColor;
}

function getTileTextColor(value) {
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
  const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
  
  if (value >= 8) return textPrimary;
  return textPrimary;
}

function render2048Board() {
  const boardEl = document.getElementById('game2048Board');
  if (!boardEl) return;
  
  boardEl.innerHTML = '';
  boardEl.style.display = 'grid';
  boardEl.style.gridTemplateColumns = `repeat(${game2048.size}, 100px)`;
  boardEl.style.gap = '10px';
  boardEl.style.position = 'relative';
  
  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      const value = game2048.board[i][j];
      const tile = document.createElement('div');
      tile.style.width = '100px';
      tile.style.height = '100px';
      tile.style.background = getTileColor(value);
      tile.style.borderRadius = '8px';
      tile.style.display = 'flex';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.fontSize = value >= 1000 ? '28px' : value >= 100 ? '36px' : '44px';
      tile.style.fontWeight = 'bold';
      tile.style.fontFamily = 'fontb';
      tile.style.color = getTileTextColor(value);
      tile.style.transition = 'all 0.15s ease';
      tile.style.border = value > 0 ? '2px solid var(--border)' : 'none';
      tile.style.boxShadow = value > 0 ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none';
      
      if (value > 0) {
        tile.style.animation = 'tileAppear 0.2s ease';
      }
      
      tile.textContent = value || '';
      boardEl.appendChild(tile);
    }
  }
}

function handle2048KeyPress(e) {
  if (!game2048.gameStarted) return;
  
  const key = e.key.toLowerCase();
  let moved = false;
  let direction = '';
  
  if (key === 'arrowup' || key === 'w') {
    e.preventDefault();
    moved = move2048Up();
    direction = 'up';
  } else if (key === 'arrowdown' || key === 's') {
    e.preventDefault();
    moved = move2048Down();
    direction = 'down';
  } else if (key === 'arrowleft' || key === 'a') {
    e.preventDefault();
    moved = move2048Left();
    direction = 'left';
  } else if (key === 'arrowright' || key === 'd') {
    e.preventDefault();
    moved = move2048Right();
    direction = 'right';
  }
  
  if (moved) {
    addRandomTile2048();
    setTimeout(() => {
      render2048Board();
    }, 100);
    
    if (game2048.score > game2048.best) {
      game2048.best = game2048.score;
      localStorage.setItem('2048Best', game2048.best);
      document.getElementById('game2048Best').textContent = game2048.best;
    }
    
    if (check2048GameOver()) {
      game2048.gameStarted = false;
      setTimeout(() => {
        showToast('Game Over! Score: ' + game2048.score, 'fa-gamepad');
      }, 300);
    }
  }
}

function move2048Left() {
  let moved = false;
  for (let i = 0; i < game2048.size; i++) {
    const row = game2048.board[i].filter(val => val !== 0);
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1]) {
        row[j] *= 2;
        game2048.score += row[j];
        document.getElementById('game2048Score').textContent = game2048.score;
        row.splice(j + 1, 1);
      }
    }
    while (row.length < game2048.size) row.push(0);
    if (JSON.stringify(game2048.board[i]) !== JSON.stringify(row)) moved = true;
    game2048.board[i] = row;
  }
  return moved;
}

function move2048Right() {
  let moved = false;
  for (let i = 0; i < game2048.size; i++) {
    const row = game2048.board[i].filter(val => val !== 0);
    for (let j = row.length - 1; j > 0; j--) {
      if (row[j] === row[j - 1]) {
        row[j] *= 2;
        game2048.score += row[j];
        document.getElementById('game2048Score').textContent = game2048.score;
        row.splice(j - 1, 1);
        j--;
      }
    }
    while (row.length < game2048.size) row.unshift(0);
    if (JSON.stringify(game2048.board[i]) !== JSON.stringify(row)) moved = true;
    game2048.board[i] = row;
  }
  return moved;
}

function move2048Up() {
  let moved = false;
  for (let j = 0; j < game2048.size; j++) {
    const col = [];
    for (let i = 0; i < game2048.size; i++) {
      if (game2048.board[i][j] !== 0) col.push(game2048.board[i][j]);
    }
    for (let i = 0; i < col.length - 1; i++) {
      if (col[i] === col[i + 1]) {
        col[i] *= 2;
        game2048.score += col[i];
        document.getElementById('game2048Score').textContent = game2048.score;
        col.splice(i + 1, 1);
      }
    }
    while (col.length < game2048.size) col.push(0);
    for (let i = 0; i < game2048.size; i++) {
      if (game2048.board[i][j] !== col[i]) moved = true;
      game2048.board[i][j] = col[i];
    }
  }
  return moved;
}

function move2048Down() {
  let moved = false;
  for (let j = 0; j < game2048.size; j++) {
    const col = [];
    for (let i = 0; i < game2048.size; i++) {
      if (game2048.board[i][j] !== 0) col.push(game2048.board[i][j]);
    }
    for (let i = col.length - 1; i > 0; i--) {
      if (col[i] === col[i - 1]) {
        col[i] *= 2;
        game2048.score += col[i];
        document.getElementById('game2048Score').textContent = game2048.score;
        col.splice(i - 1, 1);
        i--;
      }
    }
    while (col.length < game2048.size) col.unshift(0);
    for (let i = 0; i < game2048.size; i++) {
      if (game2048.board[i][j] !== col[i]) moved = true;
      game2048.board[i][j] = col[i];
    }
  }
  return moved;
}

function check2048GameOver() {
  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      if (game2048.board[i][j] === 0) return false;
      if (j < game2048.size - 1 && game2048.board[i][j] === game2048.board[i][j + 1]) return false;
      if (i < game2048.size - 1 && game2048.board[i][j] === game2048.board[i + 1][j]) return false;
    }
  }
  return true;
}

let tttGame = {
  board: Array(9).fill(''),
  currentPlayer: 'X',
  gameActive: true,
  wins: localStorage.getItem('tttWins') ? parseInt(localStorage.getItem('tttWins')) : 0,
  losses: localStorage.getItem('tttLosses') ? parseInt(localStorage.getItem('tttLosses')) : 0,
  draws: localStorage.getItem('tttDraws') ? parseInt(localStorage.getItem('tttDraws')) : 0
};

function startTicTacToe() {
  tttGame.board = Array(9).fill('');
  tttGame.currentPlayer = 'X';
  tttGame.gameActive = true;
  
  document.getElementById('tttStatus').textContent = 'Your turn (X)';
  document.getElementById('tttWins').textContent = tttGame.wins;
  document.getElementById('tttLosses').textContent = tttGame.losses;
  document.getElementById('tttDraws').textContent = tttGame.draws;
  
  renderTTTBoard();
}

function renderTTTBoard() {
  const boardEl = document.getElementById('tttBoard');
  if (!boardEl) return;
  
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
  const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
  const border = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.style.width = '120px';
    cell.style.height = '120px';
    cell.style.background = bgSecondary;
    cell.style.border = `2px solid ${border}`;
    cell.style.borderRadius = '12px';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.fontSize = '56px';
    cell.style.fontWeight = 'bold';
    cell.style.fontFamily = 'fontb';
    cell.style.cursor = tttGame.board[i] === '' && tttGame.gameActive ? 'pointer' : 'default';
    cell.style.transition = 'all 0.2s ease';
    cell.style.color = tttGame.board[i] === 'X' ? accentColor : textPrimary;
    cell.textContent = tttGame.board[i];
    
    if (tttGame.board[i] === '' && tttGame.gameActive) {
      cell.onmouseover = () => {
        cell.style.background = `rgba(125, 211, 192, 0.1)`;
        cell.style.transform = 'scale(1.05)';
        cell.style.borderColor = accentColor;
      };
      cell.onmouseout = () => {
        cell.style.background = bgSecondary;
        cell.style.transform = 'scale(1)';
        cell.style.borderColor = border;
      };
    }
    
    cell.onclick = () => handleTTTCellClick(i);
    boardEl.appendChild(cell);
  }
}

function handleTTTCellClick(index) {
  if (tttGame.board[index] !== '' || !tttGame.gameActive || tttGame.currentPlayer !== 'X') return;
  
  tttGame.board[index] = 'X';
  renderTTTBoard();
  
  const result = checkTTTWinner();
  if (result) {
    endTTTGame(result);
    return;
  }
  
  if (tttGame.board.every(cell => cell !== '')) {
    endTTTGame('draw');
    return;
  }
  
  tttGame.currentPlayer = 'O';
  document.getElementById('tttStatus').textContent = 'AI is thinking...';
  
  setTimeout(() => {
    makeAIMove();
  }, 500);
}

function makeAIMove() {
  const bestMove = getBestMove();
  tttGame.board[bestMove] = 'O';
  renderTTTBoard();
  
  const result = checkTTTWinner();
  if (result) {
    endTTTGame(result);
    return;
  }
  
  if (tttGame.board.every(cell => cell !== '')) {
    endTTTGame('draw');
    return;
  }
  
  tttGame.currentPlayer = 'X';
  document.getElementById('tttStatus').textContent = 'Your turn (X)';
}

function getBestMove() {
  for (let i = 0; i < 9; i++) {
    if (tttGame.board[i] === '') {
      tttGame.board[i] = 'O';
      if (checkTTTWinner() === 'O') {
        tttGame.board[i] = '';
        return i;
      }
      tttGame.board[i] = '';
    }
  }
  
  for (let i = 0; i < 9; i++) {
    if (tttGame.board[i] === '') {
      tttGame.board[i] = 'X';
      if (checkTTTWinner() === 'X') {
        tttGame.board[i] = '';
        return i;
      }
      tttGame.board[i] = '';
    }
  }
  
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => tttGame.board[i] === '');
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  
  if (tttGame.board[4] === '') return 4;
  
  const available = tttGame.board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function checkTTTWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (tttGame.board[a] && tttGame.board[a] === tttGame.board[b] && tttGame.board[a] === tttGame.board[c]) {
      return tttGame.board[a];
    }
  }
  
  return null;
}

function endTTTGame(result) {
  tttGame.gameActive = false;
  
  if (result === 'X') {
    tttGame.wins++;
    localStorage.setItem('tttWins', tttGame.wins);
    document.getElementById('tttStatus').textContent = 'You won! 🎉';
    document.getElementById('tttWins').textContent = tttGame.wins;
    showToast('You won!', 'fa-trophy');
  } else if (result === 'O') {
    tttGame.losses++;
    localStorage.setItem('tttLosses', tttGame.losses);
    document.getElementById('tttStatus').textContent = 'AI won! 🤖';
    document.getElementById('tttLosses').textContent = tttGame.losses;
    showToast('AI won!', 'fa-gamepad');
  } else {
    tttGame.draws++;
    localStorage.setItem('tttDraws', tttGame.draws);
    document.getElementById('tttStatus').textContent = "It's a draw! 🤝";
    document.getElementById('tttDraws').textContent = tttGame.draws;
    showToast("It's a draw!", 'fa-handshake');
  }
}
