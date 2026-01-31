// ==================== NAUTILUS BIOS SYSTEM ====================
// Press Delete, ~, or ` during boot to enter BIOS
(function () {
  const bootloader = document.getElementById('bootloader');
  let biosTriggered = false;

  // Add hint to bootloader
  if (bootloader) {
    const hint = document.createElement('div');
    hint.style.position = 'absolute';
    hint.style.bottom = '0.5rem';
    hint.style.right = '0.75rem';
    hint.style.color = 'var(--gray-dark)';
    hint.style.fontSize = '0.75rem';
    hint.style.fontFamily = 'monospace';
    hint.innerHTML = 'Press DEL or ~ to enter BIOS';
    bootloader.appendChild(hint);
  }

  window.addEventListener('keydown', function checkBiosKey(e) {
    if (!bootloader || bootloader.classList.contains('hidden') || bootloader.style.display === 'none') return;

    const key = e.key;

    // Trigger on Delete or ~ (backtick / tilde key)
    if (key === 'Delete' || key === '`' || key === '~') {
      e.preventDefault();
      showBIOS();
      window.removeEventListener('keydown', checkBiosKey);
    }
  });


  function showBIOS() {
    unlockAchievement("power-user");
    // Create BIOS overlay
    const biosOverlay = document.createElement('div');
    biosOverlay.id = 'nautilusBIOS';
    biosOverlay.innerHTML = `
      <style>
        #nautilusBIOS {
          position: fixed;
          inset: 0;
          background: #0000aa;
          z-index: 999999;
          font-family: 'Courier New', monospace;
          color: #aaaaaa;
          padding: 20px;
          overflow: auto;
        }
        #nautilusBIOS .bios-header {
          background: #aaaaaa;
          color: #0000aa;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 20px;
        }
        #nautilusBIOS .bios-section {
          border: 1px solid #aaaaaa;
          margin: 10px 0;
          padding: 10px;
        }
        #nautilusBIOS .bios-section-title {
          background: #aaaaaa;
          color: #0000aa;
          padding: 4px 8px;
          margin: -10px -10px 10px -10px;
          font-weight: bold;
        }
        #nautilusBIOS .bios-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        #nautilusBIOS .bios-label {
          color: #ffffff;
        }
        #nautilusBIOS .bios-value {
          color: #ffff00;
        }
        #nautilusBIOS .bios-menu-item {
          padding: 6px 12px;
          cursor: pointer;
        }
        #nautilusBIOS .bios-menu-item.selected {
          background: #aaaaaa;
          color: #0000aa;
        }
        #nautilusBIOS .bios-menu-item:hover:not(.selected) {
          background: #555555;
        }
        #nautilusBIOS .bios-toggle {
          cursor: pointer;
          padding: 4px 8px;
        }
        #nautilusBIOS .bios-toggle:hover {
          background: #555555;
        }
        #nautilusBIOS .bios-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #aaaaaa;
          color: #0000aa;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
        }
        #nautilusBIOS .bios-warning {
          color: #ff5555;
          font-weight: bold;
        }
      </style>
      <div class="bios-header">NautilusOS BIOS Setup Utility v1.0</div>
      
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
          <div class="bios-section">
            <div class="bios-section-title">System Information</div>
            <div class="bios-row">
              <span class="bios-label">OS Version:</span>
              <span class="bios-value">NautilusOS 1.5</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Browser:</span>
              <span class="bios-value" id="biosBrowser">Detecting...</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Platform:</span>
              <span class="bios-value">${navigator.platform}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Language:</span>
              <span class="bios-value">${navigator.language}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Cores:</span>
              <span class="bios-value">${navigator.hardwareConcurrency || 'Unknown'}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Memory:</span>
              <span class="bios-value">${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown'}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Screen:</span>
              <span class="bios-value">${screen.width}x${screen.height}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Color Depth:</span>
              <span class="bios-value">${screen.colorDepth}-bit</span>
            </div>
          </div>
          
          <div class="bios-section">
            <div class="bios-section-title">Storage Information</div>
            <div class="bios-row">
              <span class="bios-label">LocalStorage Used:</span>
              <span class="bios-value" id="biosLocalStorage">Calculating...</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">Cookies Enabled:</span>
              <span class="bios-value">${navigator.cookieEnabled ? 'Yes' : 'No'}</span>
            </div>
            <div class="bios-row">
              <span class="bios-label">IndexedDB:</span>
              <span class="bios-value">${window.indexedDB ? 'Available' : 'Not Available'}</span>
            </div>
          </div>
        </div>
        
        <div style="flex: 1;">
          <div class="bios-section">
            <div class="bios-section-title">Advanced Settings</div>
            
            <!-- Bypass File Protocol Warning -->
            <div class="bios-row bios-toggle" onclick="toggleBiosSetting('bypassFileWarning')">
              <span class="bios-label">[${localStorage.getItem('nautilusOS_bypassFileWarning') === 'true' ? 'X' : ' '}] Bypass File Protocol Warnings</span>
            </div>
            
            <!-- Custom WebLLM Model -->
            <div style="margin-top: 10px;">
              <div class="bios-label" style="margin-bottom: 4px;">Custom WebLLM Model ID:</div>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="biosWebLLMModel" 
                  value="${localStorage.getItem('nautilusOS_customWebLLMModel') || ''}" 
                  placeholder="e.g. Qwen2.5-0.5B-Instruct-q4f16_1-MLC"
                  style="flex: 1; background: #aaaaaa; color: #0000aa; border: none; font-family: 'Courier New', monospace; padding: 4px;"
                  onchange="localStorage.setItem('nautilusOS_customWebLLMModel', this.value)">
              </div>
              <div style="font-size: 10px; color: #888; margin-top: 2px;">Leave empty to use default. Reload required.</div>
            </div>
          </div>
          
          <div class="bios-section">
            <div class="bios-section-title">Danger Zone</div>
            <div class="bios-row bios-toggle" onclick="biosResetAll()" style="color: #ff5555;">
              <span class="bios-label">> Reset All Settings</span>
            </div>
            <div class="bios-row bios-toggle" onclick="biosClearData()" style="color: #ff5555;">
              <span class="bios-label">> Clear All Data & Cache</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bios-footer">
        <span><i class="fa fa-mouse-pointer"></i>
 Navigate | Enter Select | ESC Exit</span>
        <span>NautilusOS BIOS ${new Date().toLocaleString()}</span>
      </div>
    `;

    document.body.innerHTML = '';
    document.body.appendChild(biosOverlay);

    // Detect browser
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('Edg')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Safari')) browser = 'Apple Safari';
    else if (ua.includes('Opera')) browser = 'Opera';
    document.getElementById('biosBrowser').textContent = browser;

    // Calculate localStorage size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
      }
    }
    document.getElementById('biosLocalStorage').textContent = (totalSize / 1024).toFixed(2) + ' KB';

    // ESC to exit
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        location.reload();
      }
    });
  }

  // Global BIOS functions
  window.toggleBiosSetting = function (setting) {
    const key = 'nautilusOS_' + setting;
    const current = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, (!current).toString());
    location.reload();
  };

  window.biosResetAll = function () {
    if (confirm('Are you sure you want to reset all NautilusOS settings? This cannot be undone.')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('nautilusOS_'));
      keys.forEach(k => localStorage.removeItem(k));
      alert('Settings reset. The system will now reload.');
      location.reload();
    }
  };

  window.biosClearData = function () {
    if (confirm('WARNING: This will delete ALL NautilusOS data including files, settings, and accounts. Continue?')) {
      if (confirm('Are you ABSOLUTELY sure? This cannot be undone!')) {
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase('NautilusFS');
        alert('All data cleared. The system will now reload.');
        location.reload();
      }
    }
  };
})();

// ==================== END BIOS SYSTEM ====================

class db {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }
  async init() {
    if (this.db) {
      return this;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error(`Database error: ${event.target.error}`);
        reject(`Database error: ${event.target.error}`);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.db.onversionchange = () => {
          this.db.close();
          alert("Database is outdated, please reload the page.");
        };
        console.log("Database opened successfully.");
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        let objectStore;
        if (!db.objectStoreNames.contains(this.storeName)) {
          objectStore = db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
        } else {
          objectStore = event.target.transaction.objectStore(this.storeName);
        }
      };
    });
  }
  async add(item) {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const addRequest = objectStore.add(item);

      transaction.oncomplete = () => {
        resolve(addRequest.result); // The new key
      };
      transaction.onerror = (event) => {
        reject(`Error adding item: ${event.target.error}`);
      };
    });
  }

  async get(id) {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const getRequest = objectStore.get(id);

      getRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      getRequest.onerror = (event) => {
        reject(`Error getting item with ID ${id}: ${event.target.error}`);
      };
    });
  }

  async update(item) {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const putRequest = objectStore.put(item);

      transaction.oncomplete = () => {
        resolve(`Data with key '${item.id}' updated successfully.`);
      };
      transaction.onerror = (event) => {
        reject(`Error updating data: ${event.target.error}`);
      };
    });
  }

  async delete(id) {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const deleteRequest = objectStore.delete(id);

      transaction.oncomplete = () => {
        resolve(`Data with ID ${id} deleted successfully.`);
      };
      transaction.onerror = (event) => {
        reject(`Error deleting data: ${event.target.error}`);
      };
    });
  }

  async getAll() {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      getAllRequest.onerror = (event) => {
        reject(`Error fetching all items: ${event.target.error}`);
      };
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async deleteDB() {
    return new Promise((resolve, reject) => {
      this.close();

      const deleteRequest = window.indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        console.log(`Database '${this.dbName}' deleted successfully.`);
        resolve();
      };
      deleteRequest.onerror = (event) => {
        console.error(`Error deleting database '${this.dbName}'.`, event.target.error);
        reject(`Error deleting database: ${event.target.error}`);
      };
      deleteRequest.onblocked = (event) => {
        console.warn(`Database '${this.dbName}' deletion is blocked. Close other connections.`);
        reject(`Database deletion blocked.`);
      };
    });
  }
}
class encryption {
  static #arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  static #base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  static async encrypt(plainText) {
    try {
      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(plainText));
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encodedData
      );
      const keyJwk = await window.crypto.subtle.exportKey("jwk", key);
      const packet = {
        jwk: keyJwk,
        iv: this.#arrayBufferToBase64(iv),
        data: this.#arrayBufferToBase64(encryptedBuffer)
      };
      const packetString = JSON.stringify(packet);
      return window.btoa(packetString);
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    }
  }
  static async decrypt(packetB64) {
    try {
      const packetString = window.atob(packetB64);
      const packet = JSON.parse(packetString);
      const key = await window.crypto.subtle.importKey(
        "jwk",
        packet.jwk,
        {
          name: "AES-GCM",
        },
        true,
        ["encrypt", "decrypt"]
      );
      const iv = this.#base64ToArrayBuffer(packet.iv);
      const encryptedBuffer = this.#base64ToArrayBuffer(packet.data);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encryptedBuffer
      );
      return JSON.parse(new TextDecoder().decode(decryptedBuffer));
    } catch (error) {
      console.error("Decryption failed:", error);
      throw error;
    }
  }
}
const idb = new db("asdfsdff", "sdffjdk");
let windows = {};
let zIndexCounter = 100;
let currentUsername = localStorage.getItem("nautilusOS_username") || "User";
let focusedWindow = null;

function removeIdRecursively(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  const keys = Object.keys(obj);

  for (const key of keys) {
    if (key === 'id') {
      delete obj[key];
    } else {
      removeIdRecursively(obj[key]);
    }
  }
}

function compressFS(fs) {
  const rootPrimitives = {};
  const subDirectories = {};
  for (const key in fs) {
    const value = fs[key];
    if (typeof value === 'object' && value !== null) {
      subDirectories[key] = value;
    } else {
      rootPrimitives[key] = value;
    }
  }

  const allKeysPostOrder = [];
  const keyRelationships = new Map();

  const isTerminal = (value) => {
    if (typeof value !== 'object' || value === null) return false;
    for (const key in value) {
      if (typeof value[key] === 'object' && value[key] !== null) return false;
    }
    return true;
  };

  function discover(obj) {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if (Object.keys(value).length === 0) {
          keyRelationships.set(key, { type: 'container', children: [] });
        } else if (isTerminal(value)) {
          keyRelationships.set(key, { type: 'terminal', value: value });
        } else {
          discover(value);
          keyRelationships.set(key, { type: 'container', children: Object.keys(value) });
        }
      }
    }
    allKeysPostOrder.push(...Object.keys(obj));
  }
  discover(subDirectories);

  const uniqueTerminalValues = [];
  const seenValues = new Set();
  const uniqueKeys = [...new Set(allKeysPostOrder)];
  if (Object.keys(rootPrimitives).length > 0) {
    uniqueTerminalValues.push(rootPrimitives);
    seenValues.add(JSON.stringify(rootPrimitives));
  }

  for (const key of uniqueKeys) {
    const data = keyRelationships.get(key);
    if (data && data.type === 'terminal') {
      const valueString = JSON.stringify(data.value);
      if (!seenValues.has(valueString)) {
        uniqueTerminalValues.push(data.value);
        seenValues.add(valueString);
      }
    }
  }

  const finalMaps = [];
  const keyToIndexMap = new Map();

  for (const key of Object.keys(subDirectories).concat(uniqueKeys)) {
    if (keyToIndexMap.has(key)) continue;
    const data = keyRelationships.get(key);
    if (!data) continue;

    let mapObject;
    let targetIndex;

    if (data.type === 'terminal') {
      const valueString = JSON.stringify(data.value);
      targetIndex = uniqueTerminalValues.findIndex(v => JSON.stringify(v) === valueString);
      mapObject = { [key]: targetIndex };
    } else if (data.type === 'container') {
      if (data.children.length === 0) {
        mapObject = { [key]: null };
      } else {
        const firstChildKey = data.children[0];
        targetIndex = keyToIndexMap.get(firstChildKey);
        mapObject = { [key]: targetIndex };
      }
    }

    if (mapObject) {
      finalMaps.push(mapObject);
      const finalIndexOfThisMap = uniqueTerminalValues.length + finalMaps.length - 1;
      keyToIndexMap.set(key, finalIndexOfThisMap);
    }
  }

  return [...uniqueTerminalValues, ...finalMaps];
}

function decompressFS(transformedArray) {
  const values = [];
  const maps = [];
  for (const item of transformedArray) {
    delete item.id;
    const keys = Object.keys(item);
    const firstValue = item[keys[0]];
    if (keys.length === 1 && (typeof firstValue === 'number' || firstValue === null)) {
      maps.push(item);
    } else {
      values.push(item);
    }
  }

  const builtObjects = {};
  const allChildKeys = new Set();
  for (const map of maps) {
    const key = Object.keys(map)[0];
    const index = map[key];
    let resolvedValue;

    if (index === null) {
      resolvedValue = {};
    } else if (index < values.length) {
      resolvedValue = values[index];
    } else {
      const childMap = maps[index - values.length];
      const childKey = Object.keys(childMap)[0];
      allChildKeys.add(childKey);
      const childObject = builtObjects[childKey];
      resolvedValue = { [childKey]: childObject };
    }
    builtObjects[key] = resolvedValue;
  }

  const finalDirs = {};
  for (const key in builtObjects) {
    if (!allChildKeys.has(key)) {
      finalDirs[key] = builtObjects[key];
    }
  }
  const rootPrimitives = {};
  const referencedValueIndices = new Set();
  maps.forEach(map => {
    const index = Object.values(map)[0];
    if (index !== null) {
      referencedValueIndices.add(index);
    }
  });

  for (let i = 0; i < values.length; i++) {
    if (!referencedValueIndices.has(i)) {
      Object.assign(rootPrimitives, values[i]);
    }
  }

  return { ...rootPrimitives, ...finalDirs };
}
let fileSystem = {
  Photos: {},
  TextEditor: {
    "example.txt":
      "This is an example text file.\n\nYou can edit this file using the Text Editor app.\n\nTry creating your own files by:\n1. Opening the Text Editor\n2. Writing your content\n3. Clicking Save As and entering a filename\n\nHave fun exploring NautilusOS!",
  },
};
async function saveFS(fs) {
  const l = compressFS(fs);
  const tx = idb.db.transaction(idb.storeName, 'readwrite');
  await tx.objectStore(idb.storeName).clear();

  for (let i = 0; i < l.length; i++) {
    const itemToSave = { ...l[i], id: i };
    await idb.add(itemToSave);
  }
}

(async () => {
  await idb.init();
  let list = await idb.getAll();
  window.addEventListener("Login Success", function () {
    showToast("Files Loaded", "fa-check-circle");
  }, { once: true });
  if (list.length == 0) {
    // First boot or empty DB: Initialize with default FS and save
    list = compressFS(fileSystem);
    await saveFS(fileSystem); // Save the default FS to DB
  } else {
    // Data exists: Just decompress and load
    fileSystem = decompressFS(list);
    // NO redundant saveFS call here!
  }
})()
let currentPath = [];
let currentFile = null;
let settings = {
  use12Hour: true,
  showSeconds: false,
  showDesktopIcons: true,
  bypassFileProtocolWarnings: false,
  desktopIconSize: 'medium',
  windowOpacity: 0.85,
};
let bootSelectedIndex = 0;
let bootCountdownTimer = null;
let bootCountdownValue = 10;
let bootCountdownStarted = false;
let snapSettings = null;
let snapOverlay = null;
let snapCandidate = null;
let snapTrackingWindow = null;
let snapKeyCapture = null;
let snapNewLayoutKeybind = "";
let snapNewLayoutInput = null;

// ========== ACCOUNT MANAGEMENT SYSTEM ==========

// Account data structure
class UserAccount {
  constructor(username, password, role = "standard", isPasswordless = false) {
    this.username = username;
    this.password = password; // Hashed
    this.role = role; // "superuser" or "standard"
    this.isPasswordless = isPasswordless;
    this.createdAt = Date.now();
    this.allowedApps = []; // Empty means all apps allowed
    this.customAvatar = null;
  }
}

// Get all accounts from localStorage
function getAllAccounts() {
  const accountsData = localStorage.getItem("nautilusOS_accounts");
  if (!accountsData) {
    return [];
  }
  try {
    return JSON.parse(accountsData);
  } catch (e) {
    console.error("Error parsing accounts:", e);
    return [];
  }
}

// Save all accounts to localStorage
function saveAllAccounts(accounts) {
  localStorage.setItem("nautilusOS_accounts", JSON.stringify(accounts));
}

// Get account by username
function getAccountByUsername(username) {
  const accounts = getAllAccounts();
  return accounts.find(acc => acc.username === username);
}

// Create new account
function createAccount(username, password, role = "standard", isPasswordless = false) {
  const accounts = getAllAccounts();

  // Check if username already exists
  if (accounts.find(acc => acc.username === username)) {
    return { success: false, message: "Username already exists" };
  }

  const hashedPassword = isPasswordless ? "" : hashPassword(password);
  const newAccount = new UserAccount(username, hashedPassword, role, isPasswordless);
  accounts.push(newAccount);
  saveAllAccounts(accounts);

  return { success: true, message: "Account created successfully" };
}

// Update account
function updateAccount(username, updates) {
  const accounts = getAllAccounts();
  const index = accounts.findIndex(acc => acc.username === username);

  if (index === -1) {
    return { success: false, message: "Account not found" };
  }

  // Merge updates
  accounts[index] = { ...accounts[index], ...updates };
  saveAllAccounts(accounts);

  return { success: true, message: "Account updated successfully" };
}

// Delete account
function deleteAccount(username) {
  const accounts = getAllAccounts();
  const filtered = accounts.filter(acc => acc.username !== username);

  if (filtered.length === accounts.length) {
    return { success: false, message: "Account not found" };
  }

  saveAllAccounts(filtered);
  return { success: true, message: "Account deleted successfully" };
}

// Check if user has permission to use an app
function hasAppPermission(appName) {
  if (!currentUserAccount) return true; // Default allow if no account system

  // Superusers can access everything
  if (currentUserAccount.role === "superuser") return true;

  // If allowedApps is empty, all apps are allowed
  if (!currentUserAccount.allowedApps || currentUserAccount.allowedApps.length === 0) {
    return true;
  }

  // Check if app is in allowed list
  return currentUserAccount.allowedApps.includes(appName);
}

// Check if current user is superuser
function isSuperUser() {
  return currentUserAccount && currentUserAccount.role === "superuser";
}

// Migrate old single-user system to new multi-user system
function migrateToMultiUserSystem() {
  const accounts = getAllAccounts();

  // If accounts already exist, no need to migrate
  if (accounts.length > 0) return;

  // Check if old system has a user
  const oldUsername = localStorage.getItem("nautilusOS_username");
  const oldPassword = localStorage.getItem("nautilusOS_password");
  const oldIsPasswordless = localStorage.getItem("nautilusOS_isPasswordless") === "true";

  if (oldUsername) {
    // Create account from old system as superuser
    const newAccount = new UserAccount(
      oldUsername,
      oldPassword || "",
      "superuser",
      oldIsPasswordless
    );
    saveAllAccounts([newAccount]);
    console.log("Migrated to multi-user system");
  }
}

let loginStartTime = localStorage.getItem("nautilusOS_bootTime");
if (!loginStartTime) {
  loginStartTime = Date.now();
  localStorage.setItem("nautilusOS_bootTime", loginStartTime);
} else {
  loginStartTime = parseInt(loginStartTime, 10);
}

let appliedThemeName = null;
let hasShownFileProtocolToast = false;

function checkFileProtocol(title = null) {
  if (window.location.protocol === "file:") {
    // If experimental bypass is enabled, allow it
    if (settings.bypassFileProtocolWarnings) {
      return true;
    }

    const shouldShowToast = title && (
      title.toLowerCase().includes("browser") ||
      title === "Visual Studio Code"
    );
    if (shouldShowToast && !hasShownFileProtocolToast) {
      showToast("This feature doesn't work on file:// protocol. Please run NautilusOS from a web server.", "fa-exclamation-triangle");
      hasShownFileProtocolToast = true;
    }
    return false;
  }
  return true;
}

let toastQueue = [];
let isSystemLoggedIn = false;

function showToast(message, icon = "fa-info-circle") {
  // Suppress during bootloader
  const bootloader = document.getElementById('bootloader');
  if (bootloader && !bootloader.classList.contains('hidden')) {
    toastQueue.push({ message, icon });
    return;
  }

  // Show immediately during setup or login screens
  const isSetupVisible = document.getElementById('setup') && document.getElementById('setup').style.display !== 'none';
  const isLoginVisible = document.getElementById('login') && document.getElementById('login').style.display !== 'none';

  if (!isSystemLoggedIn && !isSetupVisible && !isLoginVisible) {
    toastQueue.push({ message, icon });
    return;
  }

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
  } else {
    startBootCountdown();
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
  python: { name: "Python Interpreter", icon: "fa-code", preinstalled: true },
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
  "v86-emulator": {
    name: "V86 Emulator",
    icon: "fa-microchip",
    preinstalled: false,
  },
  "uv": {
    name: "Ultraviolet",
    icon: "fa-globe",
    preinstalled: false,
  },
  "helios": {
    name: "Helios",
    icon: "fa-server",
    preinstalled: false,
  },
  "vsc": {
    name: "Visual Studio Code",
    icon: "fa-code",
    preinstalled: false,
  },
  "ai-snake": {
    name: "AI Snake Learning",
    icon: "fa-brain",
    preinstalled: true,
  },
  "nautilus-ai": {
    name: "Nautilus AI Assistant",
    icon: "fa-robot",
    preinstalled: true,
  },
  "about": {
    name: "About NautilusOS",
    icon: "fa-info-circle",
    preinstalled: true,
  },
  "web-app-creator": {
    name: "Web App Creator",
    icon: "fa-puzzle-piece",
    preinstalled: true,
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

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (bootCountdownTimer) {
        clearInterval(bootCountdownTimer);
        bootCountdownTimer = null;
      }
      const countdownEl = document.getElementById("bootCountdown");
      if (countdownEl) {
        countdownEl.style.display = "none";
      }
      options[bootSelectedIndex].classList.remove("selected");
      if (e.key === "ArrowDown") {
        bootSelectedIndex = (bootSelectedIndex + 1) % options.length;
      } else {
        bootSelectedIndex =
          (bootSelectedIndex - 1 + options.length) % options.length;
      }
      options[bootSelectedIndex].classList.add("selected");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (bootCountdownTimer) {
        clearInterval(bootCountdownTimer);
        bootCountdownTimer = null;
      }
      const countdownEl = document.getElementById("bootCountdown");
      if (countdownEl) {
        countdownEl.style.display = "none";
      }
      selectBoot();
    }
  }
});

function startBootCountdown() {
  const countdownEl = document.getElementById("bootCountdown");
  if (!countdownEl) return;

  bootCountdownValue = 10;
  bootCountdownStarted = true;
  countdownEl.style.display = "block";
  countdownEl.textContent = `Booting to selected option in ${bootCountdownValue} seconds.`;

  bootCountdownTimer = setInterval(() => {
    bootCountdownValue--;
    if (bootCountdownValue <= 0) {
      clearInterval(bootCountdownTimer);
      bootCountdownTimer = null;
      countdownEl.style.display = "none";
      selectBoot();
    } else {
      countdownEl.textContent = `Booting to selected option in ${bootCountdownValue} seconds.`;
    }
  }, 1000);
}

function selectBoot() {
  localStorage.setItem("nautilusOS_bootChoice", bootSelectedIndex);

  // Request fullscreen on boot
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log('Fullscreen request failed:', err);
    });
  }

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
                      <div class="cli-line" style="color: var(--accent);">NautilusOS Command Line Interface v1.5</div>
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
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]
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

  // Migrate old system if needed
  migrateToMultiUserSystem();

  // Get account from new multi-user system
  const account = getAccountByUsername(username);

  if (!account) {
    // Fallback to old system for backwards compatibility
    const savedUsername = localStorage.getItem("nautilusOS_username");
    const savedPassword = localStorage.getItem("nautilusOS_password");
    const isPasswordless = localStorage.getItem("nautilusOS_isPasswordless") === "true";

    if (!username) {
      showToast("Please enter username", "fa-exclamation-circle");
      return;
    }

    if (username !== savedUsername) {
      showToast("Invalid username", "fa-exclamation-circle");
      return;
    }

    if (!isPasswordless) {
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
    currentUserAccount = null; // Old system doesn't use account objects
  } else {
    // New multi-user system
    if (!username) {
      showToast("Please enter username", "fa-exclamation-circle");
      return;
    }

    if (!account.isPasswordless) {
      if (!password) {
        showToast("Please enter password", "fa-exclamation-circle");
        return;
      }

      const hashedPassword = hashPassword(password);
      if (hashedPassword !== account.password) {
        showToast("Invalid password", "fa-exclamation-circle");
        return;
      }
    }

    currentUsername = username;
    currentUserAccount = account;
  }

  document.getElementById("displayUsername").textContent = username;

  if (username.toLowerCase() === "dinguschan" || username.toLowerCase() === "$xor" || username.toLowerCase() === "lanefiedler-731") {
    unlockEasterEgg("dev-mode");
  }

  isSystemLoggedIn = true;
  toastQueue.forEach(t => showToast(t.message, t.icon));
  toastQueue = [];
  showToast("Welcome back, " + username + "!", "fa-circle-check");
  var event = new CustomEvent('Login Success');
  window.dispatchEvent(event);
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

        // Bloatless mode: hide all pre-installed apps except App Store, Settings, Files, About, and Terminal
        if (bloatlessMode) {
          const bloatlessKeep = ["appstore", "settings", "files", "about", "terminal"];
          const allIcons = iconsContainer.querySelectorAll(".desktop-icon[data-app]");
          allIcons.forEach((icon) => {
            const appName = icon.getAttribute("data-app");
            // Keep only appstore, settings, and any user-installed apps
            if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName)) {
              icon.style.display = "none";
            }
          });
        }
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
    toggleApp(appName);
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

  // Constrain requested window size to viewport with sensible minimums
  const maxW = Math.max(300, window.innerWidth - 80);
  const maxH = Math.max(200, window.innerHeight - 80);
  width = Math.min(width, maxW);
  height = Math.min(height, maxH);

  const windowEl = document.createElement("div");
  windowEl.className = "window";
  windowEl.style.width = width + "px";
  windowEl.style.height = height + "px";
  windowEl.style.left =
    window.innerWidth / 2 - width / 2 + Math.random() * 50 + "px";
  windowEl.style.top =
    window.innerHeight / 2 - height / 2 - 30 + Math.random() * 20 + "px";
  windowEl.style.zIndex = ++zIndexCounter;

  // Check if content is primarily an iframe and clean it up
  if (content && typeof content === 'string' && content.includes('<iframe')) {
    // Create temp parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const iframe = doc.querySelector('iframe');
    if (iframe) {
      const src = iframe.getAttribute('src');
      if (src) {
        // Replace content with a full-size iframe
        content = `<iframe src="${src}" style="width: 100%; height: 100%; border: none; display: block;" allow="${iframe.getAttribute('allow') || 'fullscreen; camera; microphone'}" referrerpolicy="no-referrer"></iframe>`;
        noPadding = true;
      }
    }
  }

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
  const appName = window.dataset.appName;
  const taskbar = document.getElementById("taskbar");

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

    // Show taskbar
    if (taskbar) {
      taskbar.style.transform = "translateX(-50%) translateY(0)";
      const expandBtn = document.getElementById("taskbarExpandBtn");
      if (expandBtn) expandBtn.remove();
    }
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

    // Hide taskbar and show expand button
    if (taskbar) {
      taskbar.style.transition = "transform 0.3s ease";
      taskbar.style.transform = "translateX(-50%) translateY(calc(100% + 20px))";

      // Create expand button if it doesn't exist
      let expandBtn = document.getElementById("taskbarExpandBtn");
      if (!expandBtn) {
        expandBtn = document.createElement("div");
        expandBtn.id = "taskbarExpandBtn";
        expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        expandBtn.style.cssText = `
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #0f172a;
          width: 60px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          z-index: 10001;
          transition: all 0.2s;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
        `;

        expandBtn.addEventListener("mouseenter", () => {
          expandBtn.style.height = "25px";
          taskbar.style.transform = "translateX(-50%) translateY(0)";
        });

        expandBtn.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (!taskbar.matches(':hover')) {
              expandBtn.style.height = "20px";
              taskbar.style.transform = "translateX(-50%) translateY(calc(100% + 20px))";
            }
          }, 300);
        });

        taskbar.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (!expandBtn.matches(':hover') && !taskbar.matches(':hover')) {
              taskbar.style.transform = "translateX(-50%) translateY(calc(100% + 20px))";
            }
          }, 300);
        });

        document.body.appendChild(expandBtn);
      }
    }
  }

  // Handle V86 emulator display scaling adjustments
  if (appName === "v86-emulator") {
    handleV86WindowResize(window);
  }
}

function closeWindow(btn, appName) {
  const window = btn.closest(".window");

  // Handle V86 emulator cleanup before closing window
  if (appName === "v86-emulator") {
    handleV86WindowClose(window);
  }

  // Handle Snake game cleanup
  if (appName === "snake") {
    snakeGame.gameRunning = false;
    snakeGame.gameOver = true;
    if (snakeGame.keyListenerAttached) {
      document.removeEventListener('keydown', handleSnakeKeyPress);
      snakeGame.keyListenerAttached = false;
    }
  }

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

// Toggle app visibility from taskbar - minimize if visible, restore if minimized, open if not running
function toggleApp(appName) {
  if (windows[appName]) {
    const win = windows[appName];
    const isMinimized = win.style.display === "none" || win.classList.contains("minimized");
    const isFocused = focusedWindow === appName;

    if (isMinimized) {
      // Restore the window
      win.style.display = "block";
      win.classList.remove("minimized");
      focusWindow(win);
      focusedWindow = appName;
      updateTaskbarIndicators();
    } else if (isFocused) {
      // Minimize the window (it's visible and focused)
      minimizeWindowByAppName(appName);
    } else {
      // Window is open but not focused, just focus it
      focusWindow(win);
      focusedWindow = appName;
      updateTaskbarIndicators();
    }
  } else {
    // App not open, open it
    openApp(appName);
  }
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
      // Check if it's a Python file
      if (filename.endsWith(".py")) {
        currentFile = filename;
        openApp("python", item, filename);
      } else {
        if (!installedApps.includes("editor")) {
          showToast("Text editor app required to open this file type", "fa-exclamation-triangle");
          return;
        }
        currentFile = filename;
        openApp("editor", item, filename);
      }
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
async function saveFile() {
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
  await saveFS(fileSystem);
}

async function saveAsNewFile() {
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
  await saveFS(fileSystem);
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
  // Check app permissions
  if (!hasAppPermission(appName)) {
    showToast(`Access denied: You don't have permission to use ${appMetadata[appName]?.name || appName}`, "fa-exclamation-circle");
    return;
  }

  // Handle custom web apps
  if (appName.startsWith("webapp_")) {
    launchCustomWebApp(appName);
    return;
  }

  // Handle installed community apps
  const communityApps = JSON.parse(localStorage.getItem('nautilusOS_communityApps') || '{}');
  if (communityApps[appName]) {
    const appData = communityApps[appName];
    // Create a floating window for the installed app
    createWindow(appData.name, appData.icon || 'fas fa-box', appData.content, 800, 600);
    return;
  }

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
                              <button class="editor-btn" onclick="goUpDirectory()" ${currentPath.length === 0
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
                  <div class="terminal-line" style="color: var(--accent);">NautilusOS Terminal v1.5</div>
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
    2048: {
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
        if (!checkFileProtocol("Nautilus Browser")) {
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
                <div class="cloaking-nav-item" onclick="switchCloakingTab('clickoff', this)">
                    <i class="fas fa-eye-slash"></i>
                    <span>Clickoff</span>
                </div>
                <div class="cloaking-nav-item" onclick="switchCloakingTab('anti-monitor', this)">
                    <i class="fas fa-shield-alt"></i>
                    <span>Anti-Monitoring</span>
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
                                <i class="fas fa-check-circle"></i> Apply Cloak
                            </button>
                            <button class="cloaking-btn secondary" onclick="resetCloaking()">
                                <i class="fas fa-undo"></i> Reset to Default
                            </button>
                        </div>
                    </div>
                </div>

                <div class="cloaking-tab" data-tab="clickoff">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-eye-slash"></i> Clickoff Cloaking</h2>
                        <p>Automatically disguise your tab when you switch to another window</p>
                    </div>

                    <div class="cloaking-preview-card">
                        <div class="cloaking-preview-header">
                            <div class="cloaking-preview-label">Clickoff Preview</div>
                        </div>
                        <div class="cloaking-preview-tab" id="clickoffPreview">
                            <i class="fas fa-globe" style="font-size: 1.2rem; color: var(--accent); margin-right: 0.5rem;"></i>
                            <img class="cloaking-preview-favicon" id="clickoffPreviewFavicon"
                                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='85' fill='white'%3E🌐︎%3C/text%3E%3C/svg%3E"
                                alt="favicon">
                            <span class="cloaking-preview-title" id="clickoffPreviewTitle">NautilusOS</span>
                        </div>
                    </div>

                    <div class="cloaking-form-card">
                        <div style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);">
                            <div class="cloaking-status-indicator ${cloakingConfig.cloakOnClickoff ? "active" : ""}" style="display: flex; align-items: center; gap: 1rem;">
                                <div class="cloaking-status-icon" style="width: 40px; height: 40px; background: rgba(125, 211, 192, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent);">
                                    <i class="fas fa-eye-slash"></i>
                                </div>
                                <div class="cloaking-status-text" style="flex: 1;">
                                    <div class="cloaking-status-title" style="font-weight: bold; color: var(--text-primary); font-size: 0.95rem;">Enable Clickoff Cloak</div>
                                    <div class="cloaking-status-desc" id="cloakOnClickoffDesc" style="font-size: 0.8rem; color: var(--text-secondary);">${cloakingConfig.cloakOnClickoff ? "Currently Active" : "Currently Inactive"}</div>
                                </div>
                                <div class="toggle-switch ${cloakingConfig.cloakOnClickoff ? "active" : ""}" id="cloakOnClickoffToggle" onclick="toggleCloakOnClickoff()"></div>
                            </div>
                        </div>

                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-heading"></i> Clickoff Title
                            </label>
                            <input 
                                type="text" 
                                id="clickoffTitle" 
                                class="cloaking-input" 
                                placeholder="e.g., Google" 
                                value="${cloakingConfig.clickoffTitle || ''}"
                                oninput="updateClickoffPreview()"
                            >
                            <div class="cloaking-hint">Disguise title used ONLY when clicking away</div>
                        </div>
                        
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-image"></i> Clickoff Favicon URL
                            </label>
                            <input 
                                type="text" 
                                id="clickoffFavicon" 
                                class="cloaking-input" 
                                placeholder="e.g., https://www.google.com"
                                value="${cloakingConfig.clickoffFavicon || ''}"
                                oninput="updateClickoffPreview()"
                            >
                            <div class="cloaking-hint">Disguise favicon used ONLY when clicking away</div>
                        </div>

                        <div class="cloaking-actions">
                            <button class="cloaking-btn primary" onclick="applyClickoffSettings()">
                                <i class="fas fa-save"></i> Save Settings
                            </button>
                            <button class="cloaking-btn secondary" onclick="resetClickoffCloak()">
                                <i class="fas fa-undo"></i> Reset Clickoff
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="cloaking-tab" data-tab="rotate">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-sync-alt"></i> Auto-Rotate Cloaking</h2>
                        <p>Automatically cycle through multiple disguises, keeping your tab constantly changing</p>
                    </div>
                    
                    <div class="cloaking-status-card">
                        <div class="cloaking-status-indicator ${cloakingConfig.autoRotate ? "active" : ""
        }">
                            <div class="cloaking-status-icon">
                                <i class="fas ${cloakingConfig.autoRotate
          ? "fa-rotate"
          : "fa-rotate"
        }"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Auto-Rotate Status</div>
                                <div class="cloaking-status-desc">${cloakingConfig.autoRotate
          ? "Currently Active"
          : "Currently Inactive"
        }</div>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.autoRotate ? "active" : ""
        }" id="autoRotateToggle" onclick="toggleAutoRotate()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card" id="rotateSettings" style="${cloakingConfig.autoRotate
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
                                <span class="cloaking-slider-value" id="rotateSpeedValue">${cloakingConfig.rotateSpeed
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
                        <p>Instantly switch to a safe tab or hide your screen when you need to act quickly</p>
                    </div>
                    
                    <div class="cloaking-status-card">
                        <div class="cloaking-status-indicator ${cloakingConfig.panicKeyEnabled ? "active" : ""
        }">
                            <div class="cloaking-status-icon">
                                <i class="fas ${cloakingConfig.panicKeyEnabled
          ? "fa-shield-alt"
          : "fa-shield"
        }"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Panic Key Status</div>
                                <div class="cloaking-status-desc">${cloakingConfig.panicKeyEnabled
          ? "Armed and Ready"
          : "Disabled"
        }</div>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.panicKeyEnabled ? "active" : ""
        }" onclick="togglePanicKey()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card">
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-keyboard"></i> Global Panic Hotkey
                            </label>
                            <div class="cloaking-hotkey-display" id="panicHotkeyDisplay" onclick="recordPanicKey()">
                                ${cloakingConfig.panicKey ||
        "Click to set hotkey"
        }
                            </div>
                            <div class="cloaking-hint">Press any key combination to set it as your panic hotkey</div>
                        </div>
                    </div>

                    <!-- Independent Safe Redirect Container -->
                    <div class="cloaking-form-card" style="margin-top: 1rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-external-link-alt" style="color: var(--accent); font-size: 1.1rem;"></i>
                                <span style="font-weight: bold; color: var(--text-primary);">Safe Redirect</span>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.panicRedirectEnabled ? "active" : ""}" 
                                 id="panicRedirectToggle" 
                                 onclick="togglePanicModeFlag('panicRedirectEnabled')"></div>
                        </div>
                        
                        <div id="panicRedirectSettings" style="opacity: ${cloakingConfig.panicRedirectEnabled ? '1' : '0.5'}; pointer-events: ${cloakingConfig.panicRedirectEnabled ? 'auto' : 'none'};">
                            <div class="cloaking-form-group">
                                <label class="cloaking-label">Redirect URL</label>
                                <input 
                                    type="text" 
                                    id="panicUrl" 
                                    class="cloaking-input" 
                                    placeholder="e.g., https://mail.google.com"
                                    value="${cloakingConfig.panicUrl || ""}"
                                >
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                                <button class="cloaking-btn warning" onclick="testPanicKey()" style="width: 100%;">
                                    <i class="fas fa-vial"></i> Test
                                </button>
                                <button class="cloaking-btn primary" onclick="savePanicSettings()" style="width: 100%;">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Independent Overlay Image Container -->
                    <div class="cloaking-form-card" style="margin-top: 1rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-image" style="color: var(--accent); font-size: 1.1rem;"></i>
                                <span style="font-weight: bold; color: var(--text-primary);">Overlay Image</span>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.panicImageEnabled ? "active" : ""}" 
                                 id="panicImageToggle" 
                                 onclick="togglePanicModeFlag('panicImageEnabled')"></div>
                        </div>
                        
                        <div id="panicImageSettingsContainer" style="opacity: ${cloakingConfig.panicImageEnabled ? '1' : '0.5'}; pointer-events: ${cloakingConfig.panicImageEnabled ? 'auto' : 'none'};">
                            <input type="file" id="panicImageInput" accept="image/*" style="display: none;" onchange="handlePanicImageUpload(event)">
                            <div class="cloaking-form-group">
                                <label class="cloaking-label">Overlay Image URL</label>
                                <input 
                                    type="text" 
                                    id="panicImage" 
                                    class="cloaking-input" 
                                    placeholder="e.g., https://example.com/homework.png"
                                    value="${cloakingConfig.panicImage || ""}"
                                >
                                <div class="cloaking-hint">Enter a URL or upload an image below</div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                                <button class="cloaking-btn secondary" onclick="document.getElementById('panicImageInput').click()" style="width: 100%;">
                                    <i class="fas fa-upload"></i> Upload
                                </button>
                                <button class="cloaking-btn primary" onclick="savePanicSettings()" style="width: 100%;">
                                    <i class="fas fa-save"></i> Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                                <div class="cloaking-tab" data-tab="anti-monitor">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-shield-alt"></i> Anti-Monitoring</h2>
                        <p>Protect your privacy from admin-installed software</p>
                    </div>
                    
                    <div class="cloaking-status-card">
                        <div class="cloaking-status-indicator ${cloakingConfig.antiScreenMonitoring ? "active" : ""}">
                            <div class="cloaking-status-icon">
                                <i class="fas ${cloakingConfig.antiScreenMonitoring ? "fa-eye-slash" : "fa-eye"}"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Screen Monitoring Detection</div>
                                <div class="cloaking-status-desc">${cloakingConfig.antiScreenMonitoring ? "Enabled - NautilusOS will black out when you switch tabs, preventing monitering software from viewing Nautilus" : "Disabled"}</div>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.antiScreenMonitoring ? "active" : ""}" id="antiScreenMonitoringToggle" onclick="toggleAntiScreenMonitoring()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-status-card" style="margin-top: 1rem;">
                        <div class="cloaking-status-indicator ${cloakingConfig.useAntiMonitorDelay ? "active" : ""}">
                            <div class="cloaking-status-icon">
                                <i class="fas ${cloakingConfig.useAntiMonitorDelay ? "fa-sliders-h" : "fa-times-circle"}"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Use Unblack Delay</div>
                                <div class="cloaking-status-desc">${cloakingConfig.useAntiMonitorDelay ? "Enabled - Screen will stay black for the configured delay" : "Disabled"}</div>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.useAntiMonitorDelay ? "active" : ""}" id="useAntiMonitorDelayToggle" onclick="toggleAntiMonitorDelay()"></div>
                        </div>
                    </div>
                    
                    <div class="cloaking-form-card" id="antiMonitorSettings" style="${cloakingConfig.useAntiMonitorDelay ? "" : "opacity: 0.5; pointer-events: none;"}">
                        <div class="cloaking-form-group">
                            <label class="cloaking-label">
                                <i class="fas fa-hourglass-end"></i> Unblack Delay (milliseconds)
                            </label>
                            <div class="cloaking-slider-group">
                                <input 
                                    type="range" 
                                    id="antiMonitorDelay" 
                                    class="cloaking-slider"
                                    min="100"
                                    max="5000"
                                    step="100"
                                    value="${cloakingConfig.antiMonitorDelay}"
                                    oninput="updateAntiMonitorDelayDisplay(this.value)"
                                >
                                <span class="cloaking-slider-value" id="antiMonitorDelayValue">${cloakingConfig.antiMonitorDelay}ms</span>
                            </div>
                            <div class="cloaking-hint">How long NautilusOS stays blacked out after you switch back to this tab (delays unblacking.) Helpful if you cycle through tabs</div>
                        </div>
                    </div>
                    
                    <div class="cloaking-status-card" style="margin-top: 2rem;">
                        <div class="cloaking-status-indicator ${cloakingConfig.confirmPageClosing ? "active" : ""}">
                            <div class="cloaking-status-icon">
                                <i class="fas ${cloakingConfig.confirmPageClosing ? "fa-check-circle" : "fa-times-circle"}"></i>
                            </div>
                            <div class="cloaking-status-text">
                                <div class="cloaking-status-title">Confirm Page Closing</div>
                                <div class="cloaking-status-desc">${cloakingConfig.confirmPageClosing ? "Enabled - Alert will show to confirm page close before closing, preventing admin-installed software from remotely closing your tab" : "Disabled"}</div>
                            </div>
                            <div class="toggle-switch ${cloakingConfig.confirmPageClosing ? "active" : ""}" id="confirmPageClosingToggle" onclick="toggleConfirmPageClosing()"></div>
                        </div>
                    </div>
                </div>

                <div class="cloaking-tab" data-tab="presets">
                    <div class="cloaking-header">
                        <h2><i class="fas fa-bookmark"></i> Quick Presets</h2>
                        <p>One-click disguises for common websites</p>
                    </div>
                    
                    <div class="cloaking-presets-grid">
<div class="cloaking-preset-card" onclick="applyPreset('blank')">
    <div class="cloaking-preset-icon" style="
        background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
        );
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    ">
        <i class="fas fa-eye-slash"></i>
    </div>
    <div class="cloaking-preset-name">Blank</div>
    <div class="cloaking-preset-url">(Empty Tab)</div>
</div>
                        <div class="cloaking-preset-card" onclick="applyPreset('google')">
                            <div class="cloaking-preset-icon" style="background: #ffad33;">
                                <i class="fab fa-google"></i>
                            </div>
                            <div class="cloaking-preset-name">Google</div>
                            <div class="cloaking-preset-url">google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('gmail')">
                            <div class="cloaking-preset-icon" style="background: #800000;">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="cloaking-preset-name">Gmail</div>
                            <div class="cloaking-preset-url">mail.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('drive')">
                            <div class="cloaking-preset-icon" style="background: #1ec89d;">
                                <i class="fab fa-google-drive"></i>
                            </div>
                            <div class="cloaking-preset-name">Google Drive</div>
                            <div class="cloaking-preset-url">drive.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('classroom')">
                            <div class="cloaking-preset-icon" style="background: #11bb69;">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div class="cloaking-preset-name">Classroom</div>
                            <div class="cloaking-preset-url">https://ssl.gstatic.co...</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('docs')">
                            <div class="cloaking-preset-icon" style="background: #4285F4;">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="cloaking-preset-name">Google Docs</div>
                            <div class="cloaking-preset-url">docs.google.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('youtube')">
                            <div class="cloaking-preset-icon" style="background: #ff1a1a;">
                                <i class="fab fa-youtube"></i>
                            </div>
                            <div class="cloaking-preset-name">YouTube</div>
                            <div class="cloaking-preset-url">youtube.com</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('wikipedia')">
                            <div class="cloaking-preset-icon" style="background: #595959;">
                                <i class="fab fa-wikipedia-w"></i>
                            </div>
                            <div class="cloaking-preset-name">Wikipedia</div>
                            <div class="cloaking-preset-url">wikipedia.org</div>
                        </div>
                        
                        <div class="cloaking-preset-card" onclick="applyPreset('github')">
                            <div class="cloaking-preset-icon" style="background: #262626;">
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
                            <div class="toggle-switch ${settings.use12Hour ? "active" : ""
        }" onclick="toggleSetting('use12Hour')"></div>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Show Seconds</div>
                                <div class="settings-item-desc">Display seconds in taskbar clock</div>
                            </div>
                            <div class="toggle-switch ${settings.showSeconds ? "active" : ""
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
                            <div class="toggle-switch ${settings.showDesktopIcons ? "active" : ""
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
                                <div class="settings-item-desc">Open the What's New app automatically after logging in</div>
                            </div>
                            <div class="toggle-switch ${localStorage.getItem(
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
                                <i class="fas fa-upload"></i> ${hasWallpaper
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
                            <div class="toggle-switch ${useSameBackground ? "active" : ""
        }" id="loginWallpaperToggle" onclick="toggleLoginWallpaperLink(this)"></div>
                        </div>
                        <div id="loginWallpaperControls" style="${useSameBackground ? "display: none;" : ""
        }">
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
                                <button class="settings-action-btn" id="loginWallpaperButton" onclick="document.getElementById('loginWallpaperInput').click()">
                                    <i class="fas fa-upload"></i> ${hasLoginWallpaper
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
                        <i class="fas fa-window-restore"></i>
                        <span>Windows</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item" style="flex-direction: column; align-items: flex-start;">
                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div class="settings-item-title">Window Transparency</div>
                                <div id="windowOpacityValue" style="color: var(--accent); font-weight: 600;">${Math.round((settings.windowOpacity || 0.85) * 100)}%</div>
                            </div>
                            <p class="settings-description" style="margin-bottom: 1rem;">Adjust the background transparency level for all windows.</p>
                            <input type="range" id="windowOpacitySlider" min="0.1" max="1.0" step="0.05" 
                                value="${settings.windowOpacity || 0.85}" 
                                style="width: 100%; accent-color: var(--accent); cursor: pointer;"
                                oninput="setWindowOpacity(this.value)">
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-columns"></i>
                        <span>Taskbar</span>
                    </div>
                    <div class="settings-card-body">
                         <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Full Taskbar</div>
                                <div class="settings-item-desc">Stretch the taskbar to the full width of the screen (Windows style)</div>
                            </div>
                            <div class="toggle-switch ${localStorage.getItem('nautilusOS_taskbarStyle') === 'full' ? 'active' : ''}" 
                                onclick="toggleTaskbarStyle(); this.classList.toggle('active');"></div>
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-th-large"></i>
                        <span>Desktop Icons</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item" style="flex-direction: column; align-items: flex-start;">
                            <div class="settings-item-title" style="margin-bottom: 0.25rem;">Icon Size</div>
                            <p class="settings-description" style="margin-bottom: 0.5rem;">Choose the display size for desktop application icons.</p>
                            
                            <div class="custom-select" id="desktopIconSizeSelect">
                                <div class="select-trigger" onclick="toggleSearchDropdown(this)">
                                    <span id="currentIconSize">${settings.desktopIconSize ? settings.desktopIconSize.charAt(0).toUpperCase() + settings.desktopIconSize.slice(1).replace('-', ' ') : 'Medium'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="select-options">
                                    <div class="select-option" onclick="selectDesktopIconSize('Small', 'small')">
                                        Small
                                    </div>
                                    <div class="select-option" onclick="selectDesktopIconSize('Medium', 'medium')">
                                        Medium
                                    </div>
                                    <div class="select-option" onclick="selectDesktopIconSize('Large', 'large')">
                                        Large
                                    </div>
                                    <div class="select-option" onclick="selectDesktopIconSize('Extra Large', 'extra-large')">
                                        Extra Large
                                    </div>
                                </div>
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
                            ${installedThemes.length === 0
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
                                            <div class="theme-name">${theme.charAt(0).toUpperCase() +
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
                        <div class="settings-item" style="flex-direction: column; align-items: flex-start;">
                            <p class="settings-description" style="margin-bottom: 0.5rem;">The website all browsers will use to search. The default search engine is Brave.</p>
                            
                            <div class="custom-select" id="searchEngineSelect">
                                <div class="select-trigger" onclick="toggleSearchDropdown(this)">
                                    <span id="currentSearchEngine">Brave Search</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="select-options">
                                    <div class="select-option" onclick="selectSearchEngine('Brave Search', 'https://search.brave.com/search?q=')">
                                        Brave Search
                                    </div>
                                    <div class="select-option" onclick="selectSearchEngine('Duck Duck Go', 'https://duckduckgo.com/search?q=')">
                                        Duck Duck Go
                                    </div>
                                    <div class="select-option" onclick="selectSearchEngine('Google Search', 'https://www.google.com/search?q=')">
                                        Google Search
                                    </div>
                                    <div class="select-option" onclick="selectSearchEngine('Bing', 'https://www.bing.com/search?q=')">
                                        Bing
                                    </div>
                                    <div class="select-option" onclick="selectSearchEngine('Startpage', 'https://www.startpage.com/search?q=')">
                                        Startpage
                                    </div>
                                    <div class="select-option" onclick="selectSearchEngine('Qwant', 'https://www.qwant.com/search?q=')">
                                        Qwant
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-network-wired"></i>
                        <span>Network Configuration</span>
                    </div>
                    <div class="settings-card-body">
                        <div class="settings-item" style="flex-direction: column; align-items: flex-start;">
                            <div class="settings-item-title" style="margin-bottom: 0.25rem;">Wisp Server URL</div>
                            <p class="settings-description" style="margin-bottom: 0.5rem;">The WebSocket server used for proxying traffic.</p>
                            <div style="display: flex; width: 100%; gap: 0.5rem;">
                                <input type="text" 
                                    class="searchEngineI" 
                                    style="margin-left: 0; width: 100%;" 
                                    id="wispUrlInput" 
                                    value="${localStorage.getItem('nOS_wispUrl') || 'wss://wisp.rhw.one/'}"
                                    placeholder="wss://..."
                                    onchange="changeWispUrl(this.value)">
                                <button class="settings-action-btn" onclick="resetWispUrl()" style="padding: 0 1rem; margin-left: 0.5rem;">
                                    <i class="fas fa-undo"></i>
                                </button>
                            </div>
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
                            <div class="settings-item-value">${currentUserAccount?.role === "superuser" ? "Super User" : "Standard User"}</div>
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
                                <i class="fas fa-upload"></i> ${hasProfilePicture
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

                ${currentUserAccount?.role === "superuser" ? `
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-users-cog"></i>
                        <span>Account Management</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description">
                            As a super user, you can manage all user accounts and their permissions.
                        </p>
                        <button class="settings-action-btn" onclick="openAccountManager()">
                            <i class="fas fa-users"></i> Manage Accounts
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
            
            
            <div class="settings-tab-content" data-tab="advanced">
                <h2><i class="fas fa-sliders-h"></i> Advanced</h2>
                
                <div class="settings-card">
                    <div class="settings-card-header">
                        <i class="fas fa-flask"></i>
                        <span>Experimental Features</span>
                    </div>
                    <div class="settings-card-body">
                        <p class="settings-description" style="color: var(--warning-yellow); font-weight: 500; margin-bottom: 1rem;">
                            <i class="fas fa-exclamation-triangle"></i> Warning: These features are experimental and may not work as expected.
                        </p>
                        <div class="settings-item">
                            <div class="settings-item-text">
                                <div class="settings-item-title">Bypass File Protocol Warnings</div>
                                <div class="settings-item-desc">
                                    Allow experimental browser features on file:// protocol. By enabling this, you agree to report any bugs as GitHub issues.
                                    <a href="https://github.com/nautilus-os/NautilusOS/issues" target="_blank" style="color: var(--primary-blue); text-decoration: underline;">Report issues here</a>
                                </div>
                            </div>
                            <div class="toggle-switch ${settings.bypassFileProtocolWarnings ? "active" : ""
        }" onclick="toggleSetting('bypassFileProtocolWarnings')"></div>
                        </div>
                    </div>
                </div>
                
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
              <textarea class="editor-textarea" placeholder="Start typing...">${editorContent || ""
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
                      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: var(--bg-secondary);">
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
      content: (() => {
        // Base (static) help topics we always want present
        const baseTopics = [
          { id: 'welcome', icon: 'fa-info-circle', title: 'Welcome', preview: 'Introduction to NautilusOS' },
          { id: 'cloaking', icon: 'fa-mask', title: 'Cloaking', preview: 'Tab disguise features' },
          { id: 'boot', icon: 'fa-power-off', title: 'Boot Options', preview: 'Graphical vs command-line' },
          { id: 'apps', icon: 'fa-th', title: 'Applications', preview: 'Built-in apps guide' },
          { id: 'desktop', icon: 'fa-desktop', title: 'Desktop', preview: 'Icons, taskbar & windows' },
          { id: 'notifications', icon: 'fa-bell', title: 'Notifications', preview: 'Quick actions & alerts' },
          { id: 'screenshots', icon: 'fa-camera', title: 'Screenshots', preview: 'Capture your desktop' },
          { id: 'settings', icon: 'fa-cog', title: 'Settings', preview: 'Customize your experience' },
          { id: 'tips', icon: 'fa-lightbulb', title: 'Tips & Tricks', preview: 'Pro user shortcuts' }
        ];

        // Build a set of ids/titles already present so we can add missing apps
        const existingIds = new Set(baseTopics.map(t => t.id));

        // Generate app topics for any app in appMetadata that isn't already covered
        const appTopics = [];
        try {
          for (const key in appMetadata) {
            if (!Object.prototype.hasOwnProperty.call(appMetadata, key)) continue;
            const meta = appMetadata[key];
            // normalize id/title keys we already used
            const normalized = key.replace(/[^a-z0-9\-]/gi, '').toLowerCase();
            if (existingIds.has(normalized) || existingIds.has(meta.name.toLowerCase())) continue;
            // skip the Help topic itself
            if (key === 'help') continue;

            appTopics.push({ id: `app-${normalized}`, icon: (meta.icon ? meta.icon : 'fa-question-circle'), title: meta.name, preview: meta.preinstalled ? 'Preinstalled app' : 'Optional app' });
          }
        } catch (e) {
          console.error('Error building dynamic help topics', e);
        }

        const topics = baseTopics.concat(appTopics);

        const topicCards = topics.map(t => `
          <div class="help-topic-card" onclick="expandHelpTopic('${t.id}')">
            <div class="help-topic-icon">
              <i class="fas ${t.icon}"></i>
            </div>
            <div class="help-topic-title">${t.title}</div>
            <div class="help-topic-preview">${t.preview || ''}</div>
          </div>
        `).join('');

        return `
      <div class="help-topics-container">
        <div class="help-topics-grid" id="helpTopicsGrid">
          ${topicCards}
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
      `;
      })(),
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
                      <h1 style="text-align: center !important; font-size: 2rem; margin-bottom: 0.5rem; line-height: 1.2;">Welcome to NautilusOS <br>v1.5! What's new?</h1>
                      <p>AI Assistant, 3 Browsers, More Themes, VS Code, Window Snapping, Games, and more!</p>
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
        <p>Stay under the radar with powerful disguise tools! Auto-rotate through multiple tab disguises, change what blocking extensions see when you're not on Nautilus, prevent remote tab closing, configure panic keys for instant redirects, and more!</p>
    </div>
</div>

<!-- v1.5 New Features -->
<div class="carousel-slide" data-slide="16">
    <div class="carousel-illustration">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <div style="width: 120px; height: 120px; background: linear-gradient(135deg, rgba(125, 211, 192, 0.3), rgba(125, 211, 192, 0.1)); border: 2px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; color: var(--accent); animation: float 3s ease-in-out infinite; box-shadow: 0 8px 24px rgba(125, 211, 192, 0.3);">
                <i class="fas fa-robot"></i>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <div style="width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: float 1s ease-in-out infinite;"></div>
                <div style="width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: float 1s ease-in-out infinite 0.2s;"></div>
                <div style="width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: float 1s ease-in-out infinite 0.4s;"></div>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Nautilus AI Assistant</h2>
        <p>Meet your new intelligent companion! The Nautilus AI Assistant helps you with tasks, answers questions, and makes your NautilusOS experience smarter. Powered by advanced AI technology right in your browser.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="17">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 1.5rem; align-items: center;">
            <div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); animation: float 3s ease-in-out infinite;">
                <i class="fas fa-globe"></i>
            </div>
            <div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); animation: float 3s ease-in-out infinite 0.3s;">
                <i class="fas fa-sun"></i>
            </div>
            <div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent); animation: float 3s ease-in-out infinite 0.6s;">
                <i class="fas fa-shield-alt"></i>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>3 Browser Options</h2>
        <p>Choose your browsing experience! Nautilus Browser for quick access, Helios Browser for a premium experience, and UV for advanced unblocking. Each browser offers unique features tailored to your needs.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="18">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; max-width: 250px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #7dd3c0; border-radius: 8px; animation: float 3s ease-in-out infinite;"></div>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); border: 2px solid #333; border-radius: 8px; animation: float 3s ease-in-out infinite 0.2s;"></div>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border: 2px solid #fff; border-radius: 8px; animation: float 3s ease-in-out infinite 0.4s;"></div>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #11998e, #38ef7d); border: 2px solid #fff; border-radius: 8px; animation: float 3s ease-in-out infinite 0.6s;"></div>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ff6b6b, #feca57); border: 2px solid #fff; border-radius: 8px; animation: float 3s ease-in-out infinite 0.8s;"></div>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a8edea, #fed6e3); border: 2px solid #333; border-radius: 8px; animation: float 3s ease-in-out infinite 1s;"></div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>More Themes</h2>
        <p>Express yourself with an expanded collection of beautiful themes! From sleek dark modes to vibrant colors, find the perfect look that matches your style. Install themes from the App Store with one click.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="19">
    <div class="carousel-illustration">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <div style="width: 200px; height: 130px; background: rgba(21, 25, 35, 0.95); border: 2px solid #007acc; border-radius: 8px; overflow: hidden; animation: float 3s ease-in-out infinite;">
                <div style="height: 25px; background: #1e1e1e; display: flex; align-items: center; padding: 0 0.5rem; gap: 0.5rem;">
                    <i class="fas fa-code" style="color: #007acc; font-size: 0.75rem;"></i>
                    <div style="height: 8px; width: 60px; background: rgba(255,255,255,0.2); border-radius: 4px;"></div>
                </div>
                <div style="padding: 0.5rem; display: flex; gap: 0.5rem;">
                    <div style="width: 40px; background: rgba(255,255,255,0.05); height: 80px; border-radius: 4px;"></div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <div style="height: 8px; background: #569cd6; border-radius: 2px; width: 80%;"></div>
                        <div style="height: 8px; background: #ce9178; border-radius: 2px; width: 60%;"></div>
                        <div style="height: 8px; background: #4ec9b0; border-radius: 2px; width: 90%;"></div>
                        <div style="height: 8px; background: #dcdcaa; border-radius: 2px; width: 70%;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Visual Studio Code</h2>
        <p>Code like a pro with VS Code integration! Write, edit, and manage code with syntax highlighting, file explorer, and all the features you love from the world's most popular code editor.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="20">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
            <div style="width: 100px; height: 100px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite;"></div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="width: 100px; height: 47px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite 0.2s;"></div>
                <div style="width: 100px; height: 47px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 8px; animation: float 3s ease-in-out infinite 0.4s;"></div>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Window Snapping</h2>
        <p>Organize your workspace like a power user! Drag windows to screen edges to snap them into place. Create custom layouts, use keyboard shortcuts, and manage multiple windows with ease using the Snap Manager.</p>
    </div>
</div>

<div class="carousel-slide" data-slide="21">
    <div class="carousel-illustration">
        <div style="display: flex; gap: 1.5rem; align-items: center;">
            <div style="width: 70px; height: 70px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--accent); animation: float 3s ease-in-out infinite;">
                <i class="fas fa-gamepad"></i>
            </div>
            <div style="width: 70px; height: 70px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--accent); animation: float 3s ease-in-out infinite 0.3s;">
                <i class="fas fa-brain"></i>
            </div>
            <div style="width: 70px; height: 70px; background: rgba(125, 211, 192, 0.2); border: 2px solid var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--accent); animation: float 3s ease-in-out infinite 0.6s;">
                <i class="fas fa-puzzle-piece"></i>
            </div>
        </div>
    </div>
    <div class="carousel-content">
        <h2>Games & More!</h2>
        <p>Take a break with built-in games! Watch AI learn to play Snake in real-time, challenge yourself with 2048, play Tic-Tac-Toe, and discover more entertainment. Perfect for those moments when you need a fun distraction.</p>
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
          <div class="carousel-dot" onclick="goToSlide(16)"></div>
          <div class="carousel-dot" onclick="goToSlide(17)"></div>
          <div class="carousel-dot" onclick="goToSlide(18)"></div>
          <div class="carousel-dot" onclick="goToSlide(19)"></div>
          <div class="carousel-dot" onclick="goToSlide(20)"></div>
          <div class="carousel-dot" onclick="goToSlide(21)"></div>

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
    about: {
      title: "About NautilusOS",
      icon: "fas fa-info-circle",
      content: `
        <div class="about-app-container" style="padding: 1.75rem 1.25rem 4rem; max-height: 80vh; overflow: auto; display: flex; flex-direction: column; box-sizing: border-box;">
          <div class="about-header" style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem; padding-top: 0.25rem;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; animation: float 3s ease-in-out infinite;">
              <i class="fas fa-fish" style="font-size: 3rem; color: var(--bg-primary);"></i>
            </div>
            <h1 style="font-size: 2rem; margin-bottom: 0; color: var(--text-primary); font-family: fontb; text-align: center; width: 100%;">NautilusOS</h1>
            <p style="color: var(--text-secondary); font-size: 1rem; margin: 0; text-align: center; width: 100%;">Version 1.5</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; max-width:700px; margin: 1rem auto 0; line-height:1.6; text-align: center;">
              A beautiful, fully-featured web-based operating system experience. Built with vanilla HTML, CSS, and JavaScript — no frameworks needed! NautilusOS brings you a complete desktop environment right in your browser, with file management, multiple apps, themes, and more.
            </p>
          </div>

          <div class="about-section" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-family: fontb;">
              <i class="fas fa-users" style="color: var(--accent);"></i> Developers
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
              Click on a developer's card to learn more about them and support their work.
            </p>

            <div class="developers-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; align-items: start;">
              
              <!-- Developer: dinguschan -->
              <div class="developer-card" style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.3s ease;">
                <div class="dev-header" onclick="toggleDevInfo('dinguschan')" style="padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: background 0.2s ease;" 
                     onmouseover="this.style.background='rgba(125, 211, 192, 0.1)'" onmouseout="this.style.background='transparent'">
                  <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--bg-primary); flex-shrink: 0;">
                    <i class="fas fa-user"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-family: fontb; color: var(--text-primary); font-size: 1.1rem;">dinguschan</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Lead Developer & Creator</div>
                  </div>
                  <i class="fas fa-chevron-down dev-chevron" id="chevron-dinguschan" style="color: var(--text-secondary); transition: transform 0.3s ease;"></i>
                </div>
                <div class="dev-info" id="devinfo-dinguschan" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: rgba(21, 25, 35, 0.5);">
                  <div style="padding: 1rem; border-top: 1px solid var(--border);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6;">
                      i make proxies, tools, and most importantly, silly websites :D
                    </p>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                      <a href="https://github.com/dinguschan-owo" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; transition: all 0.2s ease;" 
                           onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                        <i class="fab fa-github"></i> GitHub
                      </a>
                    </div>
                    <!-- XMR Wallet Placeholder - Uncomment and add address when available
                    <div style="background: rgba(255, 107, 53, 0.1); border: 1px solid rgba(255, 107, 53, 0.3); border-radius: 10px; padding: 1rem; margin-top: 1rem;">
                      <h4 style="color: #ff6b35; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-donate"></i> Support with Monero (XMR)
                      </h4>
                      <div style="flex: 1;">
                        <p style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">Monero Address:</p>
                        <div style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 0.7rem; color: var(--text-primary); margin-bottom: 0.75rem;">
                          YOUR_XMR_ADDRESS_HERE
                        </div>
                        <a href="monero:YOUR_XMR_ADDRESS_HERE" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #ff6b35, #f7931e); border: none; border-radius: 8px; color: white; text-decoration: none; font-size: 0.85rem; font-weight: 600;">
                          <i class="fas fa-wallet"></i> Open in Wallet
                        </a>
                      </div>
                    </div>
                    -->
                  </div>
                </div>
              </div>

              <!-- Developer: X8r -->
              <div class="developer-card" style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.3s ease;">
                <div class="dev-header" onclick="toggleDevInfo('x8r')" style="padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: background 0.2s ease;" 
                     onmouseover="this.style.background='rgba(125, 211, 192, 0.1)'" onmouseout="this.style.background='transparent'">
                  <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; flex-shrink: 0;">
                    <i class="fas fa-laptop-code"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-family: fontb; color: var(--text-primary); font-size: 1.1rem;">X8r</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Developer</div>
                  </div>
                  <i class="fas fa-chevron-down dev-chevron" id="chevron-x8r" style="color: var(--text-secondary); transition: transform 0.3s ease;"></i>
                </div>
                <div class="dev-info" id="devinfo-x8r" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: rgba(21, 25, 35, 0.5);">
                  <div style="padding: 1rem; border-top: 1px solid var(--border);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6;">
                      A front end developer who really likes working on projects involving proxying, unblocking, games, and more.
                    </p>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                      <a href="https://github.com/x8rr" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; transition: all 0.2s ease;" 
                           onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                        <i class="fab fa-github"></i> GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Developer: lanefiedler731-gif -->
              <div class="developer-card" style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.3s ease;">
                <div class="dev-header" onclick="toggleDevInfo('lanefiedler731')" style="padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: background 0.2s ease;" 
                     onmouseover="this.style.background='rgba(125, 211, 192, 0.1)'" onmouseout="this.style.background='transparent'">
                  <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; flex-shrink: 0;">
                    <i class="fas fa-code"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-family: fontb; color: var(--text-primary); font-size: 1.1rem;">lanefiedler731-gif</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Contributor & Developer</div>
                  </div>
                  <i class="fas fa-chevron-down dev-chevron" id="chevron-lanefiedler731" style="color: var(--text-secondary); transition: transform 0.3s ease;"></i>
                </div>
                <div class="dev-info" id="devinfo-lanefiedler731" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: rgba(21, 25, 35, 0.5);">
                  <div style="padding: 1rem; border-top: 1px solid var(--border);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6;">
                      A talented contributor who has helped expand NautilusOS with new features, improvements, and bug fixes. 
                      Passionate about creating great user experiences and pushing the boundaries of web-based applications.
                    </p>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
                      <a href="https://github.com/lanefiedler731-gif" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; transition: all 0.2s ease;" 
                           onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                        <i class="fab fa-github"></i> GitHub
                      </a>
                    </div>
                    
                    <!-- Crypto Donation Section -->
                    <div style="background: rgba(255, 107, 53, 0.1); border: 1px solid rgba(255, 107, 53, 0.3); border-radius: 10px; padding: 1rem; margin-top: 0.5rem;">
                      <h4 style="color: #ff6b35; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-donate"></i> Support with Monero (XMR)
                      </h4>
                      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
                        <div style="flex-shrink: 0;">
                          <img src="/assets/LFPaymentMonero.png" alt="XMR QR Code" style="width: 100px; height: 100px; border-radius: 8px; background: white; padding: 4px;">
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                          <p style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">Monero Address:</p>
                          <div style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 0.7rem; color: var(--text-primary); margin-bottom: 0.75rem;">
                            47T7eTcAXKGRqVRXAbxqsah8JSTYVUsUQgoe1bD1S4rwigc8EEaTkniBUPkcGwzjQZWNcd6AucPxSh4rceUAjG1o1uQiexu
                          </div>
                          <a href="monero:47T7eTcAXKGRqVRXAbxqsah8JSTYVUsUQgoe1bD1S4rwigc8EEaTkniBUPkcGwzjQZWNcd6AucPxSh4rceUAjG1o1uQiexu" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #ff6b35, #f7931e); border: none; border-radius: 8px; color: white; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);"
                               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(255, 107, 53, 0.4)';" 
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(255, 107, 53, 0.3)';">
                            <i class="fas fa-wallet"></i> Open in Wallet
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Contributors Section -->
          <div class="about-section" style="margin-bottom: 2rem;">
            <h2 id="contributors" style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-family: fontb;">
              <i class="fas fa-hands-helping" style="color: var(--accent);"></i> Contributors
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
              Special thanks to our contributors who help improve NautilusOS!
            </p>

            <div class="contributors-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              
              <!-- Contributor: rhenryw (RHW) -->
              <div class="contributor-card" style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; transition: all 0.3s ease;"
                   onmouseover="this.style.background='rgba(125, 211, 192, 0.1)'; this.style.borderColor='var(--accent)'" 
                   onmouseout="this.style.background='rgba(30, 35, 48, 0.6)'; this.style.borderColor='var(--border)'">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; flex-shrink: 0;">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div>
                    <div style="font-family: fontb; color: var(--text-primary); font-size: 1rem;">RHW</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem;">Contributor</div>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <a href="https://github.com/rhenryw" target="_blank" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 6px; color: var(--text-primary); text-decoration: none; font-size: 0.8rem; transition: all 0.2s ease;" 
                       onmouseover="this.style.background='rgba(125, 211, 192, 0.3)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                    <i class="fab fa-github"></i> GitHub
                  </a>
                  <a href="https://rhw.one/" target="_blank" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; color: var(--text-primary); text-decoration: none; font-size: 0.8rem; transition: all 0.2s ease;" 
                       onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'">
                    <i class="fas fa-globe"></i> Website
                  </a>
                </div>
              </div>

              <!-- Contributor: derpman1483 -->
              <div class="contributor-card" style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; transition: all 0.3s ease;"
                   onmouseover="this.style.background='rgba(125, 211, 192, 0.1)'; this.style.borderColor='var(--accent)'" 
                   onmouseout="this.style.background='rgba(30, 35, 48, 0.6)'; this.style.borderColor='var(--border)'">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; flex-shrink: 0;">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div>
                    <div style="font-family: fontb; color: var(--text-primary); font-size: 1rem;">derpman1483</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem;">Contributor</div>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <a href="https://github.com/derpman1483" target="_blank" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 6px; color: var(--text-primary); text-decoration: none; font-size: 0.8rem; transition: all 0.2s ease;" 
                       onmouseover="this.style.background='rgba(125, 211, 192, 0.3)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                    <i class="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div class="about-footer" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem 1rem 0.5rem; border-top: 1px solid var(--border); margin-top: auto; background: transparent;">
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.75rem; text-align: center;">
              Made with <i class="fas fa-heart" style="color: #ef4444;"></i> by the NautilusOS team
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <a href="https://github.com/nautilus-os/NautilusOS" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; transition: all 0.2s ease;"
                   onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                <i class="fab fa-github"></i> View on GitHub
              </a>
              <a href="#" onclick="event.preventDefault(); openApp('whatsnew');" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; color: var(--text-primary); text-decoration: none; font-size: 0.85rem; transition: all 0.2s ease;"
                   onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                <i class="fas fa-star"></i> What's New
              </a>
            </div>
          </div>
        </div>
      `,
      width: 920,
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
    python: {
      title: "Python Interpreter",
      icon: "fas fa-code",
      content: `
              <div class="python-interpreter">
                  <div class="python-toolbar">
                      <button class="editor-btn" onclick="runPythonCode()">
                          <i class="fas fa-play"></i> Run
                      </button>
                      <button class="editor-btn" onclick="clearPythonOutput()">
                          <i class="fas fa-eraser"></i> Clear Output
                      </button>
                      <button class="editor-btn" onclick="savePythonFile()">
                          <i class="fas fa-save"></i> Save
                      </button>
                      <button class="editor-btn" onclick="loadPythonFile()">
                          <i class="fas fa-folder-open"></i> Load
                      </button>
                      <input type="text" id="pythonFilename" class="editor-filename" placeholder="script.py" value="${filename || 'script.py'}">
                  </div>
                  <div class="python-editor-container">
                      <div class="python-editor-section">
                          <div class="python-section-header">
                              <i class="fas fa-code"></i> Python Code Editor
                          </div>
                          <textarea class="python-code-editor" id="pythonCodeEditor" placeholder="# Write your Python code here
# Example:
print('Hello from NautilusOS!')

# Basic operations
x = 10
y = 20
result = x + y
print(f'Result: {result}')

# List operations
numbers = [1, 2, 3, 4, 5]
print(f'Numbers: {numbers}')
print(f'Sum: {sum(numbers)}')
">${editorContent || ''}</textarea>
                      </div>
                      <div class="python-output-section">
                          <div class="python-section-header">
                              <i class="fas fa-terminal"></i> Output Console
                          </div>
                          <div class="python-output" id="pythonOutput"></div>
                      </div>
                  </div>
              </div>
          `,
      noPadding: true,
      width: 900,
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
        if (!checkFileProtocol("Ultraviolet")) {
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
        if (!checkFileProtocol("Visual Studio Code")) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 3rem; background: rgba(10, 14, 26, 0.8);">
              <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--error-red); margin-bottom: 2rem;"></i>
              <h2 style="margin-bottom: 1rem; color: var(--text-primary);">VS Code Unavailable</h2>
              <p style="color: var(--text-secondary); text-align: center; max-width: 400px;">Visual Studio Code doesn't work on file:// protocol. Please run NautilusOS from a web server to use this feature.</p>
            </div>
          `;
        }
        return `
        <style>
        
        .loader {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid rgb(255, 255, 255, 1);
            border-top-color: transparent;
            border-right-color: transparent;
            animation: rot1 0.5s linear infinite;
            z-index: -1;
        }

        @keyframes rot1 {
            to {
                transform: rotate(360deg);
            }
        }
            
        </style>

        <div class="browser-container" style="overflow: hidden;">
                  <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: -5;">
                    <center>
                    <div class="loader"></div><br>
                    <h5 style="margin-bottom: 10px;">Launching VS Code with Ultraviolet...</h5>
                    <p>Load times may vary</p>
                    </center>
                  </div>
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
        if (!checkFileProtocol("Helios Browser")) {
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
        <div class="appstore-section" onclick="switchAppStoreSection('community', this)">
            <i class="fas fa-users"></i>
            <span>Community</span>
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
                <div class="appstore-item-desc">The default NautilusOS theme. Sleek dark interface with teal accents,
                    perfect for extended use and reducing eye strain.</div>
                <button class="appstore-item-btn installed" style="opacity: 0.6; cursor: not-allowed;" disabled>
                    Installed (Default)
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-sun"></i>
                </div>
                <div class="appstore-item-name">Light Theme by dinguschan</div>
                <div class="appstore-item-desc">A bright and clean theme perfect for daytime use. Easy on the eyes with
                    light backgrounds and dark text.</div>
                <button class="appstore-item-btn ${lightThemeInstalled ? "installed" : ""
          }" onclick="${lightThemeInstalled
            ? " uninstallTheme('light')"
            : "installTheme('light')"
          }">
                    ${lightThemeInstalled ? "Uninstall" : "Install"}
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-crown" style="color: #d4af37;"></i>
                </div>
                <div class="appstore-item-name">Golden Theme by lanefiedler-731</div>
                <div class="appstore-item-desc">Elegant golden accents with warm, luxurious dark backgrounds. Perfect
                    for a premium look.</div>
                <button class="appstore-item-btn ${installedThemes.includes("golden") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("golden")
            ? "uninstallTheme('golden')"
            : "installTheme('golden')"
          }">
                    ${installedThemes.includes("golden")
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
                <div class="appstore-item-desc">Bold and vibrant red accents for those who want to stand out. Energy
                    meets elegance.</div>
                <button class="appstore-item-btn ${installedThemes.includes("red") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("red")
            ? "uninstallTheme('red')"
            : "installTheme('red')"
          }">
                    ${installedThemes.includes("red") ? "Uninstall" : "Install"}
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-droplet" style="color: #3b82f6;"></i>
                </div>
                <div class="appstore-item-name">Blue Theme by lanefiedler-731</div>
                <div class="appstore-item-desc">Cool and calming blue tones. Professional and soothing for extended use.
                </div>
                <button class="appstore-item-btn ${installedThemes.includes("blue") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("blue")
            ? "uninstallTheme('blue')"
            : "installTheme('blue')"
          }">
                    ${installedThemes.includes("blue") ? "Uninstall" : "Install"
          }
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-palette" style="color: #ffffff;"></i>
                </div>
                <div class="appstore-item-name">Purple Theme by lanefiedler-731</div>
                <div class="appstore-item-desc">Deep shades combined with royal hues, crafted together for the perfect purple theme.</div>
                <button class="appstore-item-btn ${installedThemes.includes("purple") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("purple")
            ? "uninstallTheme('purple')"
            : "installTheme('purple')"
          }">
                    ${installedThemes.includes("purple")
            ? "Uninstall"
            : "Install"
          }
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-palette" style="color: #ffffff;"></i>
                </div>
                <div class="appstore-item-name">Green Theme by lanefiedler-731</div>
                <div class="appstore-item-desc">Rich shades of green with splashes of lime and seaweed, this is quite the exquisite theme.</div>
                <button class="appstore-item-btn ${installedThemes.includes("green") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("green")
            ? "uninstallTheme('green')"
            : "installTheme('green')"
          }">
                    ${installedThemes.includes("green")
            ? "Uninstall"
            : "Install"
          }
                </button>
            </div>
            <div class="appstore-item">
                <div class="appstore-item-icon">
                    <i class="fas fa-palette" style="color: #ffffff;"></i>
                </div>
                <div class="appstore-item-name">Liquid Glass by $xor</div>
                <div class="appstore-item-desc">An Apple insipired theme with a beautiful translucent look.</div>
                <button class="appstore-item-btn ${installedThemes.includes("liquidGlass") ? "installed" : ""
          }"
                    onclick="${installedThemes.includes("liquidGlass")
            ? "uninstallTheme('liquidGlass')"
            : "installTheme('liquidGlass')"
          }">
                    ${installedThemes.includes("liquidGlass")
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
              <button id="snakeStartBtn" class="editor-btn" onclick="toggleSnakeGame()" style="background: var(--accent); color: var(--bg-primary); border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: fontb;">Start Game</button>
              
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
    },
    "v86-emulator": {
      title: "V86 Emulator",
      icon: "fas fa-microchip",
      content: (() => {
        return generateV86Interface();
      })(),
      noPadding: true,
      width: 1000,
      height: 700,
    },
    "ai-snake": {
      title: "AI Snake Learning",
      icon: "fas fa-brain",
      content: `
    <div id="aiSnakeContainer" style="display: flex; flex-direction: column; height: 100%; background: rgba(10, 14, 26, 0.8); padding: 20px; overflow-y: auto;">
      <div style="max-width: 800px; margin: 0 auto; width: 100%;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #7dd3c0; margin: 0 0 5px 0; font-family: fontb;">AI Snake Learning</h2>
        <div style="color: #9aa0a6; font-size: 12px; margin-bottom: 10px;">by lanefiedler-731</div>
        <div style="color: #9aa0a6; font-size: 11px;">Deep Q-Learning Neural Network</div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Generation</div>
          <div id="aiGeneration" style="color: #7dd3c0; font-size: 20px; font-weight: bold; font-family: fontb;">0</div>
        </div>
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Best Score</div>
          <div id="aiBestScore" style="color: #7dd3c0; font-size: 20px; font-weight: bold; font-family: fontb;">0</div>
        </div>
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Current Score</div>
          <div id="aiCurrentScore" style="color: #4ade80; font-size: 20px; font-weight: bold; font-family: fontb;">0</div>
        </div>
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Games Played</div>
          <div id="aiGamesPlayed" style="color: #7dd3c0; font-size: 20px; font-weight: bold; font-family: fontb;">0</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Average Score</div>
          <div id="aiAvgScore" style="color: #9aa0a6; font-size: 18px; font-weight: bold; font-family: fontb;">0</div>
        </div>
        <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 12px;">
          <div style="color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Epsilon (Exploration)</div>
          <div id="aiEpsilon" style="color: #7dd3c0; font-size: 18px; font-weight: bold; font-family: fontb;">1.00</div>
        </div>
      </div>

      <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
        <div style="color: #7dd3c0; font-weight: bold; margin-bottom: 10px; font-size: 14px; font-family: fontb;">Training Settings</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Game Speed (ms)</label>
            <input type="range" id="aiGameSpeed" min="1" max="200" value="10" style="width: 100%; accent-color: #7dd3c0;">
            <div style="text-align: center; color: #7dd3c0; font-size: 12px; margin-top: 3px; font-family: fontb;"><span id="aiGameSpeedValue">10</span> ms</div>
          </div>
          <div>
            <label style="display: block; color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Training Speed (iterations)</label>
            <input type="range" id="aiTrainingSpeed" min="1" max="100" value="10" style="width: 100%; accent-color: #7dd3c0;">
            <div style="text-align: center; color: #7dd3c0; font-size: 12px; margin-top: 3px; font-family: fontb;"><span id="aiTrainingSpeedValue">10</span> iterations</div>
          </div>
          <div>
            <label style="display: block; color: #9aa0a6; font-size: 11px; margin-bottom: 5px;">Concurrency (parallel games)</label>
            <input type="range" id="aiConcurrency" min="1" max="20" value="5" style="width: 100%; accent-color: #7dd3c0;">
            <div style="text-align: center; color: #7dd3c0; font-size: 12px; margin-top: 3px; font-family: fontb;"><span id="aiConcurrencyValue">5</span> games</div>
          </div>
          <div>
            <label style="display: flex; align-items: center; gap: 8px; color: #9aa0a6; font-size: 11px; margin-top: 20px;">
              <input type="checkbox" id="aiUseGPU" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: #7dd3c0;">
              <span>Use GPU Acceleration</span>
            </label>
            <div id="aiGPUStatus" style="color: #4ade80; font-size: 10px; margin-top: 5px; margin-left: 26px;">GPU Ready</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button id="aiStartBtn" class="editor-btn" onclick="startAISnakeTraining()" style="flex: 1; background: linear-gradient(135deg, #7dd3c0, #6bc4b0); color: #0a0e1a; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: fontb; transition: all 0.2s ease;">Start Training</button>
        <button id="aiPauseBtn" class="editor-btn" onclick="pauseAISnakeTraining()" style="flex: 1; background: rgba(125, 211, 192, 0.2); color: #7dd3c0; border: 1px solid #7dd3c0; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: fontb; display: none; transition: all 0.2s ease;">Pause</button>
        <button id="aiResetBtn" class="editor-btn" onclick="resetAISnakeModel()" style="flex: 1; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: fontb; transition: all 0.2s ease;">Reset Model</button>
      </div>

      <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid #7dd3c0; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
        <div style="color: #7dd3c0; font-weight: bold; margin-bottom: 10px; font-size: 14px; font-family: fontb;">Training Status</div>
        <div id="aiTrainingStatus" style="color: #9aa0a6; font-size: 11px; line-height: 1.6; font-family: 'SUSE Mono', monospace;">Ready to start training...</div>
      </div>

      <canvas id="aiSnakeCanvas" width="400" height="400" style="background: #0a0e1a; border: 2px solid #7dd3c0; border-radius: 12px; margin: 0 auto; display: block;"></canvas>
      <div style="color: #9aa0a6; font-size: 10px; margin-top: 10px; text-align: center;">
        Watch the AI learn to play Snake!
      </div>
      </div>
    </div>
  `,
      noPadding: true,
      width: 850,
      height: 600,
    },
    "nautilus-ai": {
      title: "Nautilus AI Assistant",
      icon: "fas fa-robot",
      content: `
        <div id="nautilusAiContainer" style="display: flex; flex-direction: column; height: 100%; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
          <div style="background: rgba(15, 23, 42, 0.9); border-bottom: 2px solid rgba(125, 211, 192, 0.3); padding: 15px 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <i class="fas fa-robot" style="color: var(--accent); font-size: 24px;"></i>
              <div>
                <h2 style="color: var(--accent); margin: 0; font-size: 18px;">Nautilus AI Assistant</h2>
                <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">by lanefiedler-731 | Powered by WebLLM</div>
              </div>
            </div>
            <div id="aiStatus" style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b;">
              <div class="loading-spinner" style="width: 12px; height: 12px; border: 2px solid rgba(125, 211, 192, 0.3); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <span>Initializing AI model...</span>
            </div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.5); border-bottom: 1px solid rgba(125, 211, 192, 0.2); padding: 8px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #64748b;">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-robot" style="color: var(--accent);"></i>
                  <span>Model:</span>
                  <select id="aiModelSelect" onchange="switchAIModel(this.value)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 4px; padding: 4px 8px; color: var(--accent); cursor: pointer; font-size: 11px;">
                    <option value="fast" selected><i class="fas fa-bolt"></i> Dumb Fast</option>
                    <option value="smart"><i class="fa-solid fa-brain"></i> Smart Slow</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-microchip" style="color: var(--accent);"></i>
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" id="aiWebGPUToggle" checked style="cursor: pointer;">
                    <span>WebGPU</span>
                  </label>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-cogs" style="color: var(--accent);"></i>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="aiAutomationToggle" checked style="cursor: pointer;" onchange="nautilusAI.toolsEnabled = this.checked; showToast(this.checked ? 'OS Automation Enabled' : 'OS Automation Disabled', 'fa-cogs');">
                  <span style="color: var(--accent); font-weight: bold;"> Automation</span>
                </label>
              </div>
            </div>
          </div>
          
          <div id="aiChatMessages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px;">
            <div style="background: rgba(125, 211, 192, 0.1); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 10px; padding: 15px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <i class="fas fa-robot" style="color: var(--accent); font-size: 18px;"></i>
                <strong style="color: var(--accent);">Nautilus AI</strong>
              </div>
              <div style="color: #cbd5e1; line-height: 1.6;">
                Hello! I'm your Nautilus AI Assistant. I can help you understand and navigate NautilusOS.<br><br>
                <strong style="color: var(--accent);"><i class="fas fa-brain"></i> Model: Smarty (Qwen3-0.6B)</strong><br>
                Advanced reasoning with thinking mode enabled. Switch models in the dropdown if needed.<br><br>
                <strong style="color: var(--accent);"><i class="fa-solid fa-robot"></i> OS Automation Enabled!</strong><br>
                I can control NautilusOS for you! I can open apps, run terminal commands, manage files, change settings, and more. Just ask me to do something and I'll request your approval before taking action.<br><br>
                <strong style="color: var(--accent);"><i class="fa-solid fa-cloud"></i> Thinking Mode Active!</strong><br>
                For complex tasks, I'll show my reasoning process in a collapsible "Thinking" section.<br><br>
                Try: "Open calculator" or "Change theme to blue"
              </div>
            </div>
          </div>
          
          <div style="background: rgba(15, 23, 42, 0.9); border-top: 2px solid rgba(125, 211, 192, 0.3); padding: 15px 20px;">
            <div style="display: flex; gap: 10px;">
              <textarea id="aiInput" placeholder="Ask me anything about NautilusOS..." style="flex: 1; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 8px; padding: 12px; color: #e2e8f0; font-size: 14px; resize: none; font-family: inherit; min-height: 25px; max-height: 150px;" rows="1"></textarea>
              <button
  id="aiSendBtn"
  onclick="sendAiMessage()"
  style="
    background: var(--accent);
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    height: 45px;              
    display: inline-flex;      
    align-items: center;       
    gap: 6px;                  
    cursor: pointer;
    color: #0f172a;
    font-weight: bold;
    font-size: 14px;
    transition: background-color 0.2s; 
  "
  onmouseover="this.style.background='var(--accent-hover)'"
  onmouseout="this.style.background='var(--accent)'"
>
  <i class="fas fa-paper-plane"></i> Send
</button>

            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
              <button onclick="sendQuickQuestion('What apps are available in NautilusOS?')" style="background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); color: var(--accent); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                <i class="fas fa-th"></i> Available Apps
              </button>
              <button onclick="sendQuickQuestion('How do I manage files in NautilusOS?')" style="background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); color: var(--accent); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                <i class="fas fa-folder"></i> File Management
              </button>
              <button onclick="sendQuickQuestion('How do I customize my NautilusOS experience?')" style="background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); color: var(--accent); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(125, 211, 192, 0.25)'" onmouseout="this.style.background='rgba(125, 211, 192, 0.15)'">
                <i class="fas fa-palette"></i> Customization
              </button>
              <button onclick="clearAiChat()" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'">
                <i class="fas fa-trash"></i> Clear Chat
              </button>
            </div>
          </div>
        </div>
        
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          #aiChatMessages::-webkit-scrollbar {
            width: 8px;
          }
          #aiChatMessages::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
            border-radius: 4px;
          }
          #aiChatMessages::-webkit-scrollbar-thumb {
            background: rgba(125, 211, 192, 0.3);
            border-radius: 4px;
          }
          #aiChatMessages::-webkit-scrollbar-thumb:hover {
            background: rgba(125, 211, 192, 0.5);
          }
          #aiInput:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px rgba(125, 211, 192, 0.2);
          }
        </style>
      `,
      noPadding: true,
      width: 700,
      height: 600,
    },
    "web-app-creator": {
      title: "Web App Creator",
      icon: "fas fa-puzzle-piece",
      content: `
        <div style="padding: 2rem; height: 100%; overflow-y: auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; animation: float 3s ease-in-out infinite;">
                <i class="fas fa-puzzle-piece" style="font-size: 2.5rem; color: var(--bg-primary);"></i>
              </div>
              <h1 style="color: var(--text-primary); font-family: fontb; font-size: 1.5rem; margin-bottom: 0.5rem;">Web App Creator</h1>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Create custom web apps that run like native apps</p>
            </div>
            
            <div style="background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">
                  <i class="fas fa-tag" style="color: var(--accent); margin-right: 0.5rem;"></i>App Name
                </label>
                <input type="text" id="webAppName" placeholder="My Custom App" 
                  style="width: 100%; padding: 0.75rem 1rem; background: rgba(21, 25, 35, 0.8); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.95rem;"
                  onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
              </div>
              
              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">
                  <i class="fas fa-globe" style="color: var(--accent); margin-right: 0.5rem;"></i>Website URL
                </label>
                <input type="url" id="webAppUrl" placeholder="https://example.com" 
                  style="width: 100%; padding: 0.75rem 1rem; background: rgba(21, 25, 35, 0.8); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.95rem;"
                  onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
              </div>
              
              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500;">
                  <i class="fas fa-icons" style="color: var(--accent); margin-right: 0.5rem;"></i>Icon (FontAwesome)
                </label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="webAppIcon" placeholder="fa-globe" value="fa-globe"
                    style="flex: 1; padding: 0.75rem 1rem; background: rgba(21, 25, 35, 0.8); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.95rem;"
                    onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"
                    oninput="document.getElementById('webAppIconPreview').className = 'fas ' + this.value">
                  <div style="width: 48px; height: 48px; background: rgba(21, 25, 35, 0.8); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <i id="webAppIconPreview" class="fas fa-globe" style="font-size: 1.5rem; color: var(--accent);"></i>
                  </div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">
                  Examples: fa-music, fa-gamepad, fa-video, fa-shopping-cart
                </p>
              </div>
              
              <div style="margin-bottom: 1.25rem;">
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; color: var(--text-primary); font-size: 0.9rem;">
                  <input type="checkbox" id="webAppDesktopIcon" checked style="width: 18px; height: 18px; cursor: pointer;">
                  <span>Add icon to desktop</span>
                </label>
              </div>
            </div>
            
            <button onclick="createCustomWebApp()" 
              style="width: 100%; padding: 0.875rem; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border: none; border-radius: 10px; color: var(--bg-primary); font-size: 1rem; font-family: fontb; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(125, 211, 192, 0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              <i class="fas fa-plus-circle"></i> Create Web App
            </button>
            
            <div style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
              <h3 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-list" style="color: var(--accent);"></i> Your Web Apps
              </h3>
              <div id="customWebAppsList" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem;">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      `,
      noPadding: true,
      width: 550,
      height: 650,
      onOpen: function () {
        setTimeout(refreshCustomWebAppsList, 100);
      }
    },
  };

  if (appName === "achievements") {
    openAchievements();
    return;
  }

  if (apps[appName]) {
    const app = apps[appName];
    trackAppOpened(appName);
    const windowEl = createWindow(
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

    if (appName === "v86-emulator") {
      setTimeout(() => {
        // Load V86 resources on-demand with progress bar
        loadV86ResourcesOnDemand(windowEl);
      }, 50);
    }

    if (appName === "ai-snake") {
      setTimeout(() => {
        initializeAISnakeApp();
      }, 50);
    }

    if (appName === "nautilus-ai") {
      setTimeout(() => {
        initializeNautilusAI();
      }, 50);
    }

    if (appName === "web-app-creator") {
      setTimeout(() => {
        refreshCustomWebAppsList();
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
        "refresh-cache - Purge jsDelivr cache for community apps<br>" +
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
    } else if (command === "refresh-cache") {
      output.innerHTML = "Submitting purge request to jsDelivr...<br>";

      // Asynchronously purge key files
      fetch('https://purge.jsdelivr.net/gh/nautilus-os/community@main/files/info.json').catch(e => { });
      fetch('https://purge.jsdelivr.net/gh/nautilus-os/community@main/apps').catch(e => { });

      // We can't actually verify purge easily from client without CORS issues sometimes?
      // But the request fires.
      output.innerHTML += '<span style="color: #4ade80;">✓ Purge request sent.</span><br>' +
        "Please wait a few moments and try reloading the store.";
    } else if (command === "clear") {
      terminal.innerHTML = `
                      <div class="terminal-line" style="color: var(--accent);">NautilusOS Terminal v1.5</div>
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
    } else if (
      parent.textContent.includes("Bypass File Protocol Warnings") &&
      setting === "bypassFileProtocolWarnings"
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
    desktopButton.innerHTML = `<i class="fas fa-upload"></i> ${hasWallpaper ? "Change Desktop Wallpaper" : "Set Desktop Wallpaper"
      }`;
  }

  if (loginButton) {
    loginButton.innerHTML = `<i class="fas fa-upload"></i> ${hasLoginWallpaper ? "Change Login Wallpaper" : "Set Login Wallpaper"
      }`;
  }

  if (profileButton) {
    profileButton.innerHTML = `<i class="fas fa-upload"></i> ${hasProfile ? "Change Profile Picture" : "Set Profile Picture"
      }`;
  }

  // Update Icon Size setting in UI
  const iconSizeSelect = document.getElementById("desktopIconSizeSelect");
  if (iconSizeSelect) {
    const currentSize = settings.desktopIconSize || 'medium';
    const trigger = iconSizeSelect.querySelector('.select-trigger span');
    if (trigger) {
      const sizeNames = {
        'small': 'Small',
        'medium': 'Medium',
        'large': 'Large',
        'extra-large': 'Extra Large'
      };
      trigger.textContent = sizeNames[currentSize] || 'Medium';
    }
  }

  // Update Window Opacity slider in UI
  const opacitySlider = document.getElementById("windowOpacitySlider");
  const opacityValue = document.getElementById("windowOpacityValue");
  if (opacitySlider && opacityValue) {
    const val = settings.windowOpacity || 0.85;
    opacitySlider.value = val;
    opacityValue.textContent = Math.round(val * 100) + "%";
  }
}

function setWindowOpacity(value) {
  settings.windowOpacity = parseFloat(value);
  document.documentElement.style.setProperty('--window-opacity', settings.windowOpacity);
  saveSettingsToLocalStorage();
  const valDisplay = document.getElementById("windowOpacityValue");
  if (valDisplay) {
    valDisplay.textContent = Math.round(settings.windowOpacity * 100) + "%";
  }
}

function setDesktopIconSize(size) {
  settings.desktopIconSize = size;
  let multiplier = 1;
  if (size === 'small') multiplier = 0.8;
  if (size === 'medium') multiplier = 1;
  if (size === 'large') multiplier = 1.2;
  if (size === 'extra-large') multiplier = 1.5;

  document.documentElement.style.setProperty('--icon-size-multiplier', multiplier);
  saveSettingsToLocalStorage();

  // Update UI if open
  initializeAppearanceSettings();
}

function selectDesktopIconSize(name, size) {
  setDesktopIconSize(size);
  const dropdown = document.querySelector('#desktopIconSizeSelect .select-options');
  if (dropdown) dropdown.classList.remove('active');
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
                      <button class="editor-btn" onclick="goUpDirectory()" ${currentPath.length === 0
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
                      <div class="file-tree-item folder ${isActive ? "active" : ""
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
                      <div class="file-tree-item ${isActive ? "active" : ""
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
      function () { };

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

async function createNewFolder() {
  const folderName = await prompt("Enter folder name:");
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
  if (menu) {
    menu.style.display = "none";
    menu.classList.remove("active");
  }
}

// Global click/mousedown listener for context menu dismissal
window.addEventListener("mousedown", (e) => {
  const menu = document.getElementById("contextMenu");
  if (menu && !menu.contains(e.target)) {
    hideContextMenu();
  }
});

// Full Name mapping for tooltips
const APP_NAMES = {
  files: "Files",
  terminal: "Terminal",
  settings: "Settings",
  editor: "Text Editor",
  music: "Music",
  photos: "Photos",
  help: "Help",
  whatsnew: "What's New",
  appstore: "App Store",
  calculator: "Calculator",
  cloaking: "Cloaking",
  achievements: "Achievements",
  browser: "Nautilus Browser",
  "ai-snake": "AI Snake Learning",
  "nautilus-ai": "Nautilus AI Assistant",
  python: "Python Interpreter",
  "web-app-creator": "Web App Creator",
  about: "About NautilusOS"
};

function initTaskbarTooltips() {
  const taskbarIcons = document.querySelectorAll(".taskbar-icon[data-app], .system-tray .taskbar-icon");
  const tooltip = document.createElement("div");
  tooltip.className = "taskbar-tooltip";
  document.body.appendChild(tooltip);

  taskbarIcons.forEach(icon => {
    icon.addEventListener("mouseenter", (e) => {
      // Clear title immediately so browser tooltip doesn't show
      if (icon.hasAttribute("title")) {
        icon.setAttribute("data-old-title", icon.getAttribute("title"));
        icon.removeAttribute("title");
      }

      hoverTimeout = setTimeout(() => {
        const appName = icon.getAttribute("data-app");
        const title = APP_NAMES[appName] || icon.getAttribute("data-old-title");

        if (!title) return;

        tooltip.innerText = title;
        tooltip.classList.add("active");

        const rect = icon.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
      }, 1000);
    });

    icon.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      tooltip.classList.remove("active");
      if (icon.hasAttribute("data-old-title")) {
        icon.setAttribute("title", icon.getAttribute("data-old-title"));
        icon.removeAttribute("data-old-title");
      }
    });

    icon.addEventListener("click", () => {
      clearTimeout(hoverTimeout);
      tooltip.classList.remove("active");
      if (icon.hasAttribute("data-old-title")) {
        icon.setAttribute("title", icon.getAttribute("data-old-title"));
        icon.removeAttribute("data-old-title");
      }
    });
  });
}

async function downloadOneFile() {
  try {
    showToast("Preparing download...", "fa-download");
    const response = await fetch('https://raw.githubusercontent.com/nautilus-os/NautilusOS/refs/heads/main/NautilusOS-OneFile/index.html');
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NautilusOS-OneFile.html';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast("Downloading OneFile...", "fa-check-circle");
  } catch (error) {
    console.error("Download failed:", error);
    showToast("Download failed! Opening link instead.", "fa-exclamation-triangle");
    window.open('https://raw.githubusercontent.com/nautilus-os/NautilusOS/refs/heads/main/NautilusOS-OneFile/index.html', '_blank');
  }
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
          action: "hideContextMenu(); refreshDesktop()",
        },
        {
          divider: true,
        },
        {
          icon: "fa-file",
          label: "New Text File",
          action: "hideContextMenu(); openNewTextFile()",
        },
        {
          icon: "fa-folder-plus",
          label: "New Folder",
          action: "hideContextMenu(); openNewFolder()",
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

function toggleDevInfo(devId) {
  // Find the current about app container
  const currentDevHeader = document.querySelector(`[onclick="toggleDevInfo('${devId}')"]`);
  if (!currentDevHeader) return;
  const currentContainer = currentDevHeader.closest('.about-app-container');
  if (!currentContainer) return;

  // Collapse all other dev-info panels in this container first so only one is open at a time
  const allInfo = currentContainer.querySelectorAll('.dev-info');
  allInfo.forEach(el => {
    if (el && el.id !== 'devinfo-' + devId) {
      el.style.maxHeight = '0px';
      const otherChevron = currentContainer.querySelector('#' + el.id.replace('devinfo-', 'chevron-'));
      if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
    }
  });

  const infoEl = currentContainer.querySelector('#devinfo-' + devId);
  const chevronEl = currentContainer.querySelector('#chevron-' + devId);
  if (!infoEl) return;

  const isExpanded = infoEl.style.maxHeight && infoEl.style.maxHeight !== '0px';

  if (isExpanded) {
    infoEl.style.maxHeight = '0px';
    if (chevronEl) chevronEl.style.transform = 'rotate(0deg)';
  } else {
    // compute natural height then set; allow inner overflow if content is long
    infoEl.style.maxHeight = infoEl.scrollHeight + 'px';
    infoEl.style.overflow = 'hidden';
    if (chevronEl) chevronEl.style.transform = 'rotate(180deg)';
  }
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

async function deleteFile(filename) {
  const confirmed = await confirm(`Are you sure you want to delete "${filename}"?`);
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

  if (section === 'community') {
    mainContent.innerHTML = `
        <div class="appstore-header">
            <h2>Community</h2>
            <p>Apps & themes from the community</p>
        </div>
        <div id="communityAppsGrid" class="appstore-grid">
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--accent);"></i>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Loading community repo...</p>
            </div>
        </div>
    `;
    fetchCommunityApps();
    return;
  }

  if (section === "themes") {
    // Helper for theme items
    const getTheme = (name, author, desc, key, className) => ({
      name: name,
      author: author,
      desc: desc,
      customPreviewHtml: `<div class="${className}"><div class="${className.replace('theme', 'window')}"><div class="${className.replace('theme', 'header')}"></div><div class="${className.replace('theme', 'content')}"><div class="${className.replace('theme', 'line')}" style="width: 80%;"></div><div class="${className.replace('theme', 'line')}" style="width: 60%;"></div><div class="${className.replace('theme', 'line')}" style="width: 90%;"></div></div></div></div>`,
      isInstalled: installedThemes.includes(key),
      installAction: `installTheme('${key}')`,
      uninstallAction: `uninstallTheme('${key}')`,
      type: "theme"
    });

    const items = [
      {
        name: "Dark Theme",
        author: "dinguschan",
        desc: "The default NautilusOS theme. Sleek dark interface with teal accents, perfect for extended use and reducing eye strain.",
        customPreviewHtml: `<div class="illustration-dark-theme"><div class="illustration-dark-window"><div class="illustration-dark-header"></div><div class="illustration-dark-content"><div class="illustration-dark-line" style="width: 80%;"></div><div class="illustration-dark-line" style="width: 60%;"></div><div class="illustration-dark-line" style="width: 90%;"></div></div></div></div>`,
        isInstalled: true,
        installButtonText: "Installed (Default)",
        installButtonDisabled: true,
        type: "theme"
      },
      getTheme("Light Theme", "dinguschan", "A bright and clean theme perfect for daytime use. Easy on the eyes with light backgrounds and dark text.", "light", "illustration-light-theme"),
      getTheme("Golden Theme", "lanefiedler-731", "Elegant golden accents with warm, luxurious dark backgrounds. Perfect for a premium look.", "golden", "illustration-golden-theme"),
      getTheme("Red Theme", "lanefiedler-731", "Bold and vibrant red accents for those who want to stand out. Energy meets elegance.", "red", "illustration-red-theme"),
      getTheme("Blue Theme", "lanefiedler-731", "Cool and calming blue tones. Professional and soothing for extended use.", "blue", "illustration-blue-theme"),
      getTheme("Purple Theme", "lanefiedler-731", "Deep shades combined with royal hues, crafted together for the perfect purple theme.", "purple", "illustration-purple-theme"),
      getTheme("Green Theme", "lanefiedler-731", "Rich shades of green with splashes of lime and seaweed, this is quite the exquisite theme.", "green", "illustration-green-theme"),
      getTheme("Liquid Glass", "$xor", "An Apple insipired theme with a beautiful translucent look.", "liquidGlass", "illustration-liquidglass-theme")
    ];

    mainContent.innerHTML = `
        <div class="appstore-header">
            <h2>Themes</h2>
            <p>Customize your NautilusOS experience</p>
        </div>
        <div class="appstore-grid">
            ${items.map(item => renderAppItem(item)).join('')}
        </div>
    `;

  } else if (section === "apps") {
    const items = [
      {
        name: "Startup Apps",
        author: "dinguschan",
        desc: "Control which applications launch automatically on login with this convenient this built-in app.",
        customPreviewHtml: `<div class="illustration-startup-window"> <div class="illustration-startup-header">Startup Apps</div> <div class="illustration-startup-items"> <div class="illustration-startup-item"> <div class="illustration-startup-checkbox"></div> <div class="illustration-startup-icon"></div> <div class="illustration-startup-label"></div> </div> <div class="illustration-startup-item"> <div class="illustration-startup-checkbox"></div> <div class="illustration-startup-icon"></div> <div class="illustration-startup-label"></div> </div> <div class="illustration-startup-item"> <div class="illustration-startup-checkbox" style="background: rgba(125, 211, 192, 0.3);"></div> <div class="illustration-startup-icon"></div> <div class="illustration-startup-label"></div> </div> </div> </div><div class="offline-support" style="top: -90%;"><i class="fa-solid fa-file"></i> OFFLINE SUPPORT</div>`,
        isInstalled: installedApps.includes("startup-apps"),
        installAction: "installApp('startup-apps')",
        uninstallAction: "uninstallApp('startup-apps')",
        type: "app"
      },
      {
        name: "Task Manager",
        author: "dinguschan",
        desc: "Monitor and manage running applications and windows. View system statistics and close unresponsive apps with ease.",
        customPreviewHtml: `<div class="illustration-taskmanager"> <div class="illustration-taskmanager-header"> <div class="illustration-taskmanager-title">Task Manager</div> <div class="illustration-taskmanager-stat">CPU: 45%</div> </div> <div class="illustration-taskmanager-processes"> <div class="illustration-taskmanager-process"> <div class="illustration-taskmanager-process-icon"></div> <div class="illustration-taskmanager-process-name"></div> <div class="illustration-taskmanager-process-bar"> <div class="illustration-taskmanager-process-fill" style="width: 60%;"></div> </div> </div> <div class="illustration-taskmanager-process"> <div class="illustration-taskmanager-process-icon"></div> <div class="illustration-taskmanager-process-name"></div> <div class="illustration-taskmanager-process-bar"> <div class="illustration-taskmanager-process-fill" style="width: 35%;"></div> </div> </div> <div class="illustration-taskmanager-process"> <div class="illustration-taskmanager-process-icon"></div> <div class="illustration-taskmanager-process-name"></div> <div class="illustration-taskmanager-process-bar"> <div class="illustration-taskmanager-process-fill" style="width: 80%;"></div> </div> </div> </div> </div>`,
        isInstalled: installedApps.includes("task-manager"),
        installAction: "installApp('task-manager')",
        uninstallAction: "uninstallApp('task-manager')",
        type: "app"
      },
      {
        name: "Snap Manager",
        author: "lanefiedler-731",
        desc: "Add window snapping with animated previews. Customize layouts, assign shortcuts, and drag to see live guides.",
        customPreviewHtml: `<div class="illustration-snap"> <div class="illustration-snap-zone"></div> <div class="illustration-snap-zone"></div> </div>`,
        isInstalled: installedApps.includes("snap-manager"),
        installAction: "installApp('snap-manager')",
        uninstallAction: "uninstallApp('snap-manager')",
        type: "app"
      },
      {
        name: "Ultraviolet",
        author: "$xor",
        desc: "Open up a whole new browsing experience, powered by Ultraviolet.",
        customPreviewHtml: `<div class="illustration-uv"> <div class="illustration-uv-header"> <div class="illustration-uv-logo"></div> </div> </div>`,
        isInstalled: installedApps.includes("uv"),
        installAction: "installApp('uv')",
        uninstallAction: "uninstallApp('uv')",
        type: "app"
      },
      {
        name: "Helios",
        author: "dinguschan",
        desc: "The classic CORS proxy you know and love, fit in to one single file.",
        customPreviewHtml: `<div class="illustration-helios"> <div class="illustration-helios-header"> <div class="illustration-helios-logo"></div> </div> </div>`,
        isInstalled: installedApps.includes("helios"),
        installAction: "installApp('helios')",
        uninstallAction: "uninstallApp('helios')",
        type: "app"
      },
      {
        name: "Visual Studio Code",
        author: "Microsoft",
        desc: "The developer's choice for text editing, now on NautilusOS.",
        customPreviewHtml: `<div class="illustration-vscode"> <div class="illustration-vscode-header"></div> <div class="illustration-vscode-content"> <div class="illustration-vscode-line"></div> <div class="illustration-vscode-line" style="width: 80%;"></div> <div class="illustration-vscode-line" style="width: 60%;"></div> </div> </div>`,
        isInstalled: installedApps.includes("vsc"),
        installAction: "installApp('vsc')",
        uninstallAction: "uninstallApp('vsc')",
        type: "app"
      },
      {
        name: "V86 Emulator",
        author: "lanefiedler-731",
        desc: "Run x86 operating systems and software within NautilusOS. Experience virtualized computing with full system emulation.",
        customPreviewHtml: `<div class="illustration-v86"> <div class="illustration-v86-line"></div> <div class="illustration-v86-line" style="width: 60%;"></div> <div class="illustration-v86-cursor"></div> </div>`,
        isInstalled: installedApps.includes("v86-emulator"),
        installAction: "installApp('v86-emulator')",
        uninstallAction: "uninstallApp('v86-emulator')",
        type: "app"
      },
      {
        name: "Nautilus AI Assistant",
        author: "lanefiedler-731",
        desc: "Your personal AI assistant powered by WebLLM. Get instant help with NautilusOS features, apps, settings, and more. Runs entirely in your browser with no server required!",
        customPreviewHtml: `<div class="illustration-nautilus-ai"> <div class="illustration-nautilus-ai-header"> <div class="illustration-nautilus-ai-icon"><i class="fas fa-robot"></i></div> <div class="illustration-nautilus-ai-title">Nautilus AI</div> </div> <div class="illustration-nautilus-ai-content"> <div class="illustration-nautilus-ai-msg-ai"> <div class="illustration-nautilus-ai-line" style="width: 90%;"></div> <div class="illustration-nautilus-ai-line" style="width: 60%;"></div> </div> <div class="illustration-nautilus-ai-msg-user"> <div class="illustration-nautilus-ai-line" style="width: 80%;"></div> </div> </div> </div>`,
        isInstalled: true,
        installButtonText: "Open",
        installAction: "openApp('nautilus-ai')",
        uninstallAction: "",
        type: "app"
      },
      {
        name: "Text Editor",
        author: "dinguschan and Nautilus Labs",
        desc: "A simple text editor for creating and editing text files.",
        isInstalled: installedApps.includes("editor"),
        installAction: "installApp('editor')",
        uninstallAction: "uninstallApp('editor')",
        type: "app"
      },
      {
        name: "Files",
        author: "dinguschan and Nautilus Labs",
        desc: "File manager for browsing and managing your files.",
        isInstalled: installedApps.includes("files"),
        installAction: "installApp('files')",
        uninstallAction: "uninstallApp('files')",
        type: "app"
      },
      {
        name: "About NautilusOS",
        author: "dinguschan and Nautilus Labs",
        desc: "Learn more about NautilusOS and its features.",
        isInstalled: installedApps.includes("about"),
        installAction: "installApp('about')",
        uninstallAction: "uninstallApp('about')",
        type: "app"
      },
      {
        name: "Settings",
        author: "dinguschan and Nautilus Labs",
        desc: "Customize your NautilusOS experience.",
        isInstalled: installedApps.includes("settings"),
        installAction: "installApp('settings')",
        uninstallAction: "uninstallApp('settings')",
        type: "app"
      },
      {
        name: "App Store",
        author: "dinguschan and Nautilus Labs",
        desc: "Discover and install new apps and themes.",
        isInstalled: installedApps.includes("appstore"),
        installAction: "installApp('appstore')",
        uninstallAction: "uninstallApp('appstore')",
        type: "app"
      },
      {
        name: "Calculator",
        author: "dinguschan and Nautilus Labs",
        desc: "A simple calculator for basic math operations.",
        isInstalled: installedApps.includes("calculator"),
        installAction: "installApp('calculator')",
        uninstallAction: "uninstallApp('calculator')",
        type: "app"
      },
      {
        name: "Nautilus Browser",
        author: "dinguschan and Nautilus Labs",
        desc: "Browse the web with this built-in browser.",
        isInstalled: installedApps.includes("browser"),
        installAction: "installApp('browser')",
        uninstallAction: "uninstallApp('browser')",
        type: "app"
      },
      {
        name: "Music",
        author: "dinguschan and Nautilus Labs",
        desc: "Play and manage your music files.",
        isInstalled: installedApps.includes("music"),
        installAction: "installApp('music')",
        uninstallAction: "uninstallApp('music')",
        type: "app"
      },
      {
        name: "Photos",
        author: "dinguschan and Nautilus Labs",
        desc: "View and manage your photos.",
        isInstalled: installedApps.includes("photos"),
        installAction: "installApp('photos')",
        uninstallAction: "uninstallApp('photos')",
        type: "app"
      },
      {
        name: "Terminal",
        author: "dinguschan and Nautilus Labs",
        desc: "Command line interface for advanced users.",
        isInstalled: installedApps.includes("terminal"),
        installAction: "installApp('terminal')",
        uninstallAction: "uninstallApp('terminal')",
        type: "app"
      },
      {
        name: "Python Interpreter",
        author: "dinguschan and Nautilus Labs",
        desc: "Run Python code interactively.",
        isInstalled: installedApps.includes("python"),
        installAction: "installApp('python')",
        uninstallAction: "uninstallApp('python')",
        type: "app"
      },
      {
        name: "Achievements",
        author: "dinguschan and Nautilus Labs",
        desc: "Track your progress and unlock achievements.",
        isInstalled: installedApps.includes("achievements"),
        installAction: "installApp('achievements')",
        uninstallAction: "uninstallApp('achievements')",
        type: "app"
      }
    ];

    mainContent.innerHTML = `
          <div class="appstore-header">
              <h2>Apps</h2>
              <p>Discover and install new applications</p>
          </div>
          <div class="appstore-grid">
              ${items.map(item => renderAppItem(item)).join('')}
          </div>
      `;

  } else if (section === "games") {
    const items = [
      {
        name: "Snake",
        author: "lanefiedler-731",
        desc: "A classic snake game. Eat food, grow longer, and try to beat your high score without hitting the walls or yourself!",
        customPreviewHtml: `<div class="illustration-snake"> <div class="illustration-snake-grid"> ${Array(64).fill(0).map((_, i) => `<div class="illustration-snake-cell${[27, 28, 29].includes(i) ? " snake" : i === 35 ? " food" : ""}"></div>`).join("")} </div> </div>`,
        isInstalled: installedGames.includes("snake"),
        installAction: "installGame('snake')",
        uninstallAction: "", // No uninstall needed? Original didn't show uninstall logic for games properly or handled it?
        // Original: installedGames.includes("snake") ? "openApp('snake')" : "installGame('snake')"
        // If installed, it shows "Play".
        installButtonText: installedGames.includes("snake") ? "Play" : "Install",
        installAction: installedGames.includes("snake") ? "openApp('snake')" : "installGame('snake')",
        uninstallAction: "", // Original doesn't seem to support uninstalling games?
        type: "game"
      },
      {
        name: "2048",
        author: "dinguschan",
        desc: "Slide tiles to combine numbers and reach 2048! A addictive puzzle game that's easy to learn but hard to master.",
        customPreviewHtml: `<div class="illustration-2048"> <div class="illustration-2048-tile">2</div> <div class="illustration-2048-tile">4</div> <div class="illustration-2048-tile">8</div> <div class="illustration-2048-tile">16</div> <div class="illustration-2048-tile">32</div> <div class="illustration-2048-tile">64</div> <div class="illustration-2048-tile">128</div> ${Array(9).fill('<div class="illustration-2048-tile"></div>').join("")} </div>`,
        isInstalled: installedGames.includes("2048"),
        installButtonText: installedGames.includes("2048") ? "Play" : "Install",
        installAction: installedGames.includes("2048") ? "openApp('2048')" : "installGame('2048')",
        type: "game"
      },
      {
        name: "Tic-Tac-Toe",
        author: "dinguschan",
        desc: "Classic Tic-Tac-Toe against an AI opponent. Can you outsmart the computer and get three in a row?",
        customPreviewHtml: `<div class="illustration-tictactoe"> <div class="illustration-tictactoe-cell">X</div> <div class="illustration-tictactoe-cell">O</div> <div class="illustration-tictactoe-cell">X</div> <div class="illustration-tictactoe-cell"></div> <div class="illustration-tictactoe-cell">O</div> <div class="illustration-tictactoe-cell"></div> <div class="illustration-tictactoe-cell"></div> <div class="illustration-tictactoe-cell"></div> <div class="illustration-tictactoe-cell"></div> </div>`,
        isInstalled: installedGames.includes("tictactoe"),
        installButtonText: installedGames.includes("tictactoe") ? "Play" : "Install",
        installAction: installedGames.includes("tictactoe") ? "openApp('tictactoe')" : "installGame('tictactoe')",
        type: "game"
      },
      {
        name: "AI Snake Learning",
        author: "lanefiedler-731",
        desc: "Train an AI neural network to play Snake using Deep Q-Learning. Watch it learn and improve with GPU acceleration, customizable concurrency, game speed, and training speed controls.",
        customPreviewHtml: `<div class="illustration-ai-snake"> <div class="illustration-ai-snake-stats"> <div class="illustration-ai-snake-stat"> <div class="illustration-ai-snake-stat-icon"></div> <div class="illustration-ai-snake-stat-line"></div> </div> <div class="illustration-ai-snake-stat"> <div class="illustration-ai-snake-stat-icon"></div> <div class="illustration-ai-snake-stat-line" style="width: 60%"></div> </div> <div class="illustration-ai-snake-stat"> <div class="illustration-ai-snake-stat-icon"></div> <div class="illustration-ai-snake-stat-line" style="width: 40%"></div> </div> <div class="illustration-ai-snake-stat"> <div class="illustration-ai-snake-stat-icon"></div> <div class="illustration-ai-snake-stat-line" style="width: 80%"></div> </div> </div> <div class="illustration-ai-snake-board"> ${Array(25).fill(0).map((_, i) => `<div class="illustration-ai-snake-cell${[12, 13].includes(i) ? " snake" : ""}"></div>`).join("")} </div> </div>`,
        isInstalled: true,
        installButtonText: "Play",
        installAction: "openApp('ai-snake')",
        type: "game"
      }
    ];

    mainContent.innerHTML = `
          <div class="appstore-header">
              <h2>Games</h2>
              <p>Play and enjoy games on NautilusOS</p>
          </div>
          <div class="appstore-grid">
              ${items.map(item => renderAppItem(item)).join('')}
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
  dark: { url: "/style.css" },
  light: { url: "/themes/light.css" },
  golden: { url: "/themes/golden.css" },
  red: { url: "/themes/red.css" },
  blue: { url: "/themes/blue.css" },
  purple: { url: "/themes/purple.css" },
  green: { url: "/themes/green.css" },
  liquidGlass: { url: "/themes/lg.css" },
};

function applyTheme(themeName) {
  const theme = themeDefinitions[themeName];
  const themeLink = document.getElementById("themeLink")
  if (!theme) { console.warn("Theme not found:", themeName); return; }
  console.log(themeLink)
  themeLink.href = theme.url
  localStorage.setItem("nautilusOS_currentTheme", themeName);
  appliedThemeName = themeName;
}

function refreshAppStore() {
  const activeSection = document.querySelector(".appstore-section.active");
  if (!activeSection) return;

  const sectionText = activeSection.textContent.trim().toLowerCase();
  if (sectionText.includes("community")) {
    switchAppStoreSection("community", activeSection);
    return;
  }
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

// ========== PYTHON INTERPRETER FUNCTIONS ==========

// Simple Python interpreter using eval (simulated)
function runPythonCode() {
  const editor = document.getElementById("pythonCodeEditor");
  const output = document.getElementById("pythonOutput");

  if (!editor || !output) {
    showToast("Python interpreter not ready", "fa-exclamation-circle");
    return;
  }

  const code = editor.value;
  output.innerHTML = '<div style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-play"></i> Running...</div>';

  // Simulated Python execution
  try {
    let outputLines = [];
    let printOutput = [];

    // Create a simulated Python environment
    const pythonEnv = {
      print: (...args) => {
        printOutput.push(args.map(String).join(' '));
      },
      len: (arr) => arr.length,
      sum: (arr) => arr.reduce((a, b) => a + b, 0),
      range: (start, end, step = 1) => {
        const arr = [];
        if (end === undefined) {
          end = start;
          start = 0;
        }
        for (let i = start; i < end; i += step) {
          arr.push(i);
        }
        return arr;
      },
      abs: Math.abs,
      max: Math.max,
      min: Math.min,
      round: Math.round,
      str: String,
      int: parseInt,
      float: parseFloat,
      list: (arr) => Array.from(arr),
    };

    // Convert Python-like syntax to JavaScript
    let jsCode = code
      .replace(/print\(/g, 'pythonEnv.print(')
      .replace(/len\(/g, 'pythonEnv.len(')
      .replace(/sum\(/g, 'pythonEnv.sum(')
      .replace(/range\(/g, 'pythonEnv.range(')
      .replace(/abs\(/g, 'pythonEnv.abs(')
      .replace(/max\(/g, 'pythonEnv.max(')
      .replace(/min\(/g, 'pythonEnv.min(')
      .replace(/round\(/g, 'pythonEnv.round(')
      .replace(/#.*$/gm, '//')  // Convert comments
      .replace(/def\s+(\w+)\s*\((.*?)\)\s*:/g, 'function $1($2) {')  // Convert function definitions
      .replace(/for\s+(\w+)\s+in\s+(.*?):/g, 'for (let $1 of $2) {')  // Convert for loops
      .replace(/if\s+(.*?):/g, 'if ($1) {')  // Convert if statements
      .replace(/elif\s+(.*?):/g, '} else if ($1) {')  // Convert elif
      .replace(/else:/g, '} else {')  // Convert else
      .replace(/True/g, 'true')  // Convert True
      .replace(/False/g, 'false')  // Convert False
      .replace(/None/g, 'null');  // Convert None

    // Count indentation-based blocks and add closing braces
    const lines = jsCode.split('\n');
    let indentStack = [0];
    let processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === '' || trimmedLine.startsWith('//')) {
        processedLines.push(line);
        continue;
      }

      const indent = line.search(/\S/);
      const currentIndent = indent === -1 ? 0 : indent;

      // Close blocks if dedenting
      while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        processedLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
      }

      processedLines.push(line);

      // Track indentation for blocks
      if (trimmedLine.endsWith('{')) {
        indentStack.push(currentIndent);
      }
    }

    // Close remaining blocks
    while (indentStack.length > 1) {
      indentStack.pop();
      processedLines.push('}');
    }

    jsCode = processedLines.join('\n');

    // Execute the code
    const func = new Function('pythonEnv', jsCode);
    func(pythonEnv);

    // Display output
    if (printOutput.length > 0) {
      output.innerHTML = printOutput.map(line =>
        `<div class="python-output-line">${escapeHtml(line)}</div>`
      ).join('');
    } else {
      output.innerHTML = '<div style="color: var(--success-green);"><i class="fas fa-check-circle"></i> Code executed successfully (no output)</div>';
    }

  } catch (error) {
    output.innerHTML = `<div style="color: var(--error-red);"><i class="fas fa-exclamation-circle"></i> Error: ${escapeHtml(error.message)}</div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function clearPythonOutput() {
  const output = document.getElementById("pythonOutput");
  if (output) {
    output.innerHTML = '';
  }
}

function savePythonFile() {
  const editor = document.getElementById("pythonCodeEditor");
  const filenameInput = document.getElementById("pythonFilename");

  if (!editor || !filenameInput) return;

  const filename = filenameInput.value || 'script.py';
  const code = editor.value;

  // Save to file system
  const folder = getFileSystemAtPath(["Python"]);
  if (!folder) {
    // Create Python folder if it doesn't exist
    fileSystem.Python = {};
  }

  fileSystem.Python[filename] = code;
  showToast(`Saved ${filename}`, "fa-check-circle");
}

function loadPythonFile() {
  const filenameInput = document.getElementById("pythonFilename");
  if (!filenameInput) return;

  const filename = filenameInput.value;
  if (!filename) {
    showToast("Please enter a filename", "fa-exclamation-circle");
    return;
  }

  const folder = getFileSystemAtPath(["Python"]);
  if (!folder || !folder[filename]) {
    showToast("File not found", "fa-exclamation-circle");
    return;
  }

  const editor = document.getElementById("pythonCodeEditor");
  if (editor) {
    editor.value = folder[filename];
    showToast(`Loaded ${filename}`, "fa-check-circle");
  }
}

// Support opening Python files with double-click
function openPythonFile(filename, content) {
  openApp("python", content, filename);
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

async function deletePhoto(name) {
  const confirmed = await confirm(`Delete ${name}?`);
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
  const isBloatless = document.getElementById("setupBloatless").checked;

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
  window.setupIsBloatless = isBloatless;

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
  const isBloatless = window.setupIsBloatless || false;
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
  localStorage.setItem("nautilusOS_bloatlessMode", isBloatless ? "true" : "false");
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

  // Set global bloatlessMode and apply filtering immediately
  bloatlessMode = isBloatless;
  if (bloatlessMode) {
    const bloatlessKeep = ["appstore", "settings", "files", "about", "terminal"];
    const iconsContainer = document.getElementById("desktopIcons");
    if (iconsContainer) {
      const allIcons = iconsContainer.querySelectorAll(".desktop-icon[data-app]");
      allIcons.forEach((icon) => {
        const appName = icon.getAttribute("data-app");
        if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName)) {
          icon.style.display = "none";
        }
      });
    }
    // Also hide from start menu
    const appGrid = document.querySelector(".app-grid");
    if (appGrid) {
      const allAppItems = appGrid.querySelectorAll(".app-item");
      allAppItems.forEach((item) => {
        const onclickAttr = item.getAttribute("onclick");
        if (onclickAttr) {
          const match = onclickAttr.match(/openApp\(['"]([^'"]+)['"]\)/);
          if (match) {
            const appName = match[1];
            if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName)) {
              item.style.display = "none";
            }
          }
        }
      });
    }
    // Also hide from taskbar
    const taskbar = document.querySelector(".taskbar");
    if (taskbar) {
      const allTaskbarIcons = taskbar.querySelectorAll(".taskbar-icon[data-app]");
      allTaskbarIcons.forEach((icon) => {
        const appName = icon.getAttribute("data-app");
        if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName)) {
          icon.style.display = "none";
        }
      });
    }
  }

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
  document.documentElement.style.setProperty('--window-opacity', settings.windowOpacity || 0.85);
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

  // Restore Community Apps
  const savedCommunityApps = JSON.parse(localStorage.getItem('nautilusOS_communityApps') || '{}');
  Object.keys(savedCommunityApps).forEach(appId => {
    const appData = savedCommunityApps[appId];
    createDesktopIcon(appId, appData.name, appData.icon || 'fas fa-box');
  });

  // Apply bloatless mode: hide pre-installed desktop icons except App Store, Settings, Files, About, and Terminal
  if (bloatlessMode) {
    const bloatlessKeep = ["appstore", "settings", "files", "about", "terminal"];
    const iconsContainer = document.getElementById("desktopIcons");
    if (iconsContainer) {
      const allIcons = iconsContainer.querySelectorAll(".desktop-icon[data-app]");
      allIcons.forEach((icon) => {
        const appName = icon.getAttribute("data-app");
        // Keep only appstore, settings, files, about, terminal, and any user-installed apps/games
        if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName) && !installedGames.includes(appName)) {
          icon.style.display = "none";
        }
      });
    }
  }

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
    return;
  } else if (newUsername.length < 3) {
    showToast("Username must be at least 3 characters", "fa-exclamation-circle");
    return
  } else if (newUsername === currentUsername) {
    showToast("New username cannot be the same as the current one", "fa-exclamation-circle");
    return
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
      inputContainer.innerHTML = `<input type="text" class="modal-input" id="modalInput" placeholder="${options.placeholder || ""
        }" value="${options.defaultValue || ""}">`;
      setTimeout(() => document.getElementById("modalInput").focus(), 100);
    }

    if (options.confirm) {
      buttons.innerHTML = `
                      <button class="modal-btn modal-btn-secondary" onclick="closeModal(false)">Cancel</button>
                      <button class="modal-btn ${options.danger
          ? "modal-btn-danger"
          : "modal-btn-primary"
        }" onclick="confirmModal()">${options.confirmText || "OK"
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
let bloatlessMode = false;

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

  // Load bloatless mode setting
  bloatlessMode = localStorage.getItem("nautilusOS_bloatlessMode") === "true";
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

  // V86 resources will be loaded on-demand when the app is opened

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

    if (appName === "v86-emulator") {
      // Clean up V86 resources when uninstalling
      cleanupV86Resources();
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
  snake: [{ x: 10, y: 10 }],
  food: { x: 15, y: 15 },
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  score: 0,
  gameRunning: false,
  gamePaused: false,
  gameOver: false,
  gridSize: 20,
  tileCount: 20,
  gameSpeed: 100,
  highScore: localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0,
  keyListenerAttached: false
};

function toggleSnakeGame() {
  if (!snakeGame.gameRunning && !snakeGame.gameOver) {
    // Game hasn't started yet
    startSnakeGame();
  } else if (snakeGame.gameRunning && !snakeGame.gamePaused) {
    // Game is running, pause it
    snakeGame.gamePaused = true;
    document.getElementById('snakeStartBtn').textContent = 'Resume';
  } else if (snakeGame.gamePaused) {
    // Game is paused, resume it
    snakeGame.gamePaused = false;
    document.getElementById('snakeStartBtn').textContent = 'Pause';
    gameLoop();
  }
}

function startSnakeGame() {
  if (!snakeGame.canvas) {
    snakeGame.canvas = document.getElementById('snakeCanvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
  }

  if (snakeGame.gameRunning && !snakeGame.gamePaused) {
    return;
  }

  if (!snakeGame.gameRunning) {
    snakeGame.snake = [{ x: 10, y: 10 }];
    snakeGame.food = generateFood();
    snakeGame.direction = { x: 1, y: 0 };
    snakeGame.nextDirection = { x: 1, y: 0 };
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
  if (snakeGame.keyListenerAttached) return;
  snakeGame.keyListenerAttached = true;
  document.addEventListener('keydown', handleSnakeKeyPress);
}

function handleSnakeKeyPress(e) {
  // Only handle input if snake game is running/paused AND the snake window is focused (highest z-index)
  if (!snakeGame.gameRunning && !snakeGame.gameOver) return;
  if (focusedWindow !== "snake") return;

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
    if (snakeGame.direction.y === 0) snakeGame.nextDirection = { x: 0, y: -1 };
    e.preventDefault();
  } else if (key === 'arrowdown' || key === 's') {
    if (snakeGame.direction.y === 0) snakeGame.nextDirection = { x: 0, y: 1 };
    e.preventDefault();
  } else if (key === 'arrowleft' || key === 'a') {
    if (snakeGame.direction.x === 0) snakeGame.nextDirection = { x: -1, y: 0 };
    e.preventDefault();
  } else if (key === 'arrowright' || key === 'd') {
    if (snakeGame.direction.x === 0) snakeGame.nextDirection = { x: 1, y: 0 };
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

  if (snakeGame.keyListenerAttached) {
    document.removeEventListener('keydown', handleSnakeKeyPress);
    snakeGame.keyListenerAttached = false;
  }

  showToast('Game Over! Score: ' + snakeGame.score + ' | High Score: ' + snakeGame.highScore, 'fa-skull');
}

// ========== AI Snake Learning Implementation ==========
let aiSnake = {
  model: null,
  targetModel: null,
  canvas: null,
  ctx: null,
  games: [],
  memory: [],
  isTraining: false,
  isPaused: false,
  generation: 0,
  bestScore: 0,
  gamesPlayed: 0,
  scores: [],
  epsilon: 1.0,
  epsilonMin: 0.01,
  epsilonDecay: 0.995,
  learningRate: 0.001,
  batchSize: 64,
  memorySize: 10000,
  gridSize: 20,
  tileCount: 20,
  gameSpeed: 10,
  trainingSpeed: 10,
  concurrency: 5,
  useGPU: true,
  deviceInfo: null
};

// Initialize AI Snake App
async function initializeAISnakeApp() {
  if (typeof tf === 'undefined') {
    updateAITrainingStatus('Loading TensorFlow.js...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (typeof tf === 'undefined') {
      updateAITrainingStatus('Error: TensorFlow.js failed to load. Please refresh the page.');
      return;
    }
  }

  aiSnake.canvas = document.getElementById('aiSnakeCanvas');
  if (!aiSnake.canvas) return;

  aiSnake.ctx = aiSnake.canvas.getContext('2d');

  // Check GPU support
  try {
    await tf.ready();
    aiSnake.deviceInfo = tf.getBackend();
    const useGPU = document.getElementById('aiUseGPU');
    if (useGPU) {
      const useGPUValue = localStorage.getItem('aiSnakeUseGPU');
      if (useGPUValue !== null) {
        useGPU.checked = useGPUValue === 'true';
      }
      aiSnake.useGPU = useGPU.checked;

      if (aiSnake.useGPU && aiSnake.deviceInfo === 'webgl') {
        document.getElementById('aiGPUStatus').textContent = 'GPU: WebGL Active';
        document.getElementById('aiGPUStatus').style.color = '#4ade80';
      } else if (aiSnake.useGPU && aiSnake.deviceInfo === 'webgpu') {
        document.getElementById('aiGPUStatus').textContent = 'GPU: WebGPU Active';
        document.getElementById('aiGPUStatus').style.color = '#4ade80';
      } else {
        document.getElementById('aiGPUStatus').textContent = `GPU: ${aiSnake.deviceInfo} (CPU Fallback)`;
        document.getElementById('aiGPUStatus').style.color = '#ffaa00';
      }
    }
  } catch (e) {
    document.getElementById('aiGPUStatus').textContent = 'GPU: CPU Only';
    document.getElementById('aiGPUStatus').style.color = '#ef4444';
  }

  // Load saved state
  loadAISnakeState();

  // Setup UI handlers
  setupAISnakeUIHandlers();

  // Create neural network model
  await createAISnakeModel();

  updateAITrainingStatus('Ready to start training. Click "Start Training" to begin.');
}

// Setup UI event handlers
function setupAISnakeUIHandlers() {
  const gameSpeedSlider = document.getElementById('aiGameSpeed');
  const trainingSpeedSlider = document.getElementById('aiTrainingSpeed');
  const concurrencySlider = document.getElementById('aiConcurrency');
  const gpuCheckbox = document.getElementById('aiUseGPU');

  if (gameSpeedSlider) {
    gameSpeedSlider.addEventListener('input', (e) => {
      aiSnake.gameSpeed = parseInt(e.target.value);
      document.getElementById('aiGameSpeedValue').textContent = aiSnake.gameSpeed;
      localStorage.setItem('aiSnakeGameSpeed', aiSnake.gameSpeed);

      // Update interval if training is running
      if (aiSnake.isTraining && aiGameInterval) {
        clearInterval(aiGameInterval);
        aiGameInterval = setInterval(() => {
          if (!aiSnake.isPaused) {
            runAITrainingCycle().catch(err => {
              console.error('Training error:', err);
              updateAITrainingStatus('Error during training: ' + err.message);
            });
          }
        }, aiSnake.gameSpeed);
      }
    });
  }

  if (trainingSpeedSlider) {
    trainingSpeedSlider.addEventListener('input', (e) => {
      aiSnake.trainingSpeed = parseInt(e.target.value);
      document.getElementById('aiTrainingSpeedValue').textContent = aiSnake.trainingSpeed;
      localStorage.setItem('aiSnakeTrainingSpeed', aiSnake.trainingSpeed);
    });
  }

  if (concurrencySlider) {
    concurrencySlider.addEventListener('input', (e) => {
      aiSnake.concurrency = parseInt(e.target.value);
      document.getElementById('aiConcurrencyValue').textContent = aiSnake.concurrency;
      localStorage.setItem('aiSnakeConcurrency', aiSnake.concurrency);
    });
  }

  if (gpuCheckbox) {
    gpuCheckbox.addEventListener('change', (e) => {
      aiSnake.useGPU = e.target.checked;
      localStorage.setItem('aiSnakeUseGPU', aiSnake.useGPU);
      if (aiSnake.useGPU && aiSnake.deviceInfo === 'webgl') {
        document.getElementById('aiGPUStatus').textContent = 'GPU: WebGL Active';
        document.getElementById('aiGPUStatus').style.color = '#4ade80';
      } else {
        document.getElementById('aiGPUStatus').textContent = `GPU: ${aiSnake.deviceInfo}`;
        document.getElementById('aiGPUStatus').style.color = '#ffaa00';
      }
    });
  }
}

// Create Deep Q-Network model
async function createAISnakeModel() {
  if (aiSnake.model) {
    aiSnake.model.dispose();
  }
  if (aiSnake.targetModel) {
    aiSnake.targetModel.dispose();
  }

  // Input: 24 features (game state)
  // Output: 4 actions (up, down, left, right)
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [24], units: 128, activation: 'relu' }),
      tf.layers.dense({ units: 128, activation: 'relu' }),
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.dense({ units: 4, activation: 'linear' })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(aiSnake.learningRate),
    loss: 'meanSquaredError'
  });

  aiSnake.model = model;
  aiSnake.targetModel = model.clone();

  updateAITrainingStatus('Neural network model created successfully.');
}

// Get game state as feature vector
function getGameState(game) {
  const head = game.snake[0];
  const features = [];

  // Danger straight, right, left
  const directions = [
    game.direction,
    { x: -game.direction.y, y: game.direction.x }, // right
    { x: game.direction.y, y: -game.direction.x }  // left
  ];

  directions.forEach(dir => {
    const nextPos = { x: head.x + dir.x, y: head.y + dir.y };
    const danger = (
      nextPos.x < 0 || nextPos.x >= aiSnake.tileCount ||
      nextPos.y < 0 || nextPos.y >= aiSnake.tileCount ||
      game.snake.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)
    ) ? 1 : 0;
    features.push(danger);
  });

  // Current direction (one-hot encoded)
  features.push(game.direction.x === 0 && game.direction.y === -1 ? 1 : 0); // up
  features.push(game.direction.x === 0 && game.direction.y === 1 ? 1 : 0);  // down
  features.push(game.direction.x === -1 && game.direction.y === 0 ? 1 : 0); // left
  features.push(game.direction.x === 1 && game.direction.y === 0 ? 1 : 0);  // right

  // Food direction (normalized)
  const foodDeltaX = game.food.x - head.x;
  const foodDeltaY = game.food.y - head.y;
  features.push(foodDeltaX > 0 ? 1 : (foodDeltaX < 0 ? -1 : 0));
  features.push(foodDeltaY > 0 ? 1 : (foodDeltaY < 0 ? -1 : 0));

  // Normalized distances
  features.push(foodDeltaX / aiSnake.tileCount);
  features.push(foodDeltaY / aiSnake.tileCount);

  // Snake length (normalized)
  features.push(game.snake.length / (aiSnake.tileCount * aiSnake.tileCount));

  // Additional features: distances to walls
  features.push(head.x / aiSnake.tileCount);
  features.push(head.y / aiSnake.tileCount);
  features.push((aiSnake.tileCount - head.x) / aiSnake.tileCount);
  features.push((aiSnake.tileCount - head.y) / aiSnake.tileCount);

  // Body proximity (check immediate surroundings)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const checkPos = { x: head.x + dx, y: head.y + dy };
      const hasBody = game.snake.some(segment => segment.x === checkPos.x && segment.y === checkPos.y);
      features.push(hasBody ? 1 : 0);
    }
  }

  return features.slice(0, 24); // Ensure exactly 24 features
}

// Create a new game instance
function createAIGame() {
  return {
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    score: 0,
    steps: 0,
    gameOver: false,
    lastFoodDistance: Infinity
  };
}

// Generate food position
function generateAIFood(game) {
  let newFood;
  let foodOnSnake = true;
  while (foodOnSnake) {
    newFood = {
      x: Math.floor(Math.random() * aiSnake.tileCount),
      y: Math.floor(Math.random() * aiSnake.tileCount)
    };
    foodOnSnake = game.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood;
}

// Perform action in game
function performAIAction(game, action) {
  if (game.gameOver) return;

  // Actions: 0=up, 1=down, 2=left, 3=right
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }   // right
  ];

  const newDirection = directions[action];
  // Prevent reversing
  if (newDirection.x === -game.direction.x && newDirection.y === -game.direction.y) {
    return;
  }

  game.direction = newDirection;
  const head = game.snake[0];
  const newHead = {
    x: (head.x + game.direction.x + aiSnake.tileCount) % aiSnake.tileCount,
    y: (head.y + game.direction.y + aiSnake.tileCount) % aiSnake.tileCount
  };

  // Check collision
  if (game.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    game.gameOver = true;
    return;
  }

  game.snake.unshift(newHead);
  game.steps++;

  // Check food
  if (newHead.x === game.food.x && newHead.y === game.food.y) {
    game.score += 10;
    game.food = generateAIFood(game);
    game.lastFoodDistance = Infinity;
  } else {
    game.snake.pop();
    const foodDist = Math.abs(game.food.x - newHead.x) + Math.abs(game.food.y - newHead.y);
    game.lastFoodDistance = foodDist;
  }

  // Penalty for too many steps without eating
  if (game.steps > 200 && game.score === 0) {
    game.gameOver = true;
  }
}

// Predict action using model
async function predictAction(game) {
  const state = getGameState(game);
  const stateTensor = tf.tensor2d([state]);

  try {
    const prediction = await aiSnake.model.predict(stateTensor);
    const qValues = await prediction.data();
    prediction.dispose();
    stateTensor.dispose();

    // Epsilon-greedy exploration
    if (Math.random() < aiSnake.epsilon) {
      return Math.floor(Math.random() * 4);
    }

    return qValues.indexOf(Math.max(...qValues));
  } catch (e) {
    stateTensor.dispose();
    return Math.floor(Math.random() * 4);
  }
}

// Train the model
async function trainAIModel() {
  if (aiSnake.memory.length < aiSnake.batchSize) {
    return;
  }

  const batch = [];
  const sampleIndices = [];
  for (let i = 0; i < aiSnake.batchSize; i++) {
    sampleIndices.push(Math.floor(Math.random() * aiSnake.memory.length));
  }

  const states = [];
  const targets = [];

  for (const idx of sampleIndices) {
    const { state, action, reward, nextState, done } = aiSnake.memory[idx];

    const stateTensor = tf.tensor2d([state]);
    const currentQ = await aiSnake.model.predict(stateTensor);
    const currentQValues = await currentQ.data();
    currentQ.dispose();
    stateTensor.dispose();

    let targetQ = [...currentQValues];

    if (done) {
      targetQ[action] = reward;
    } else {
      const nextStateTensor = tf.tensor2d([nextState]);
      const nextQ = await aiSnake.targetModel.predict(nextStateTensor);
      const nextQValues = await nextQ.data();
      nextQ.dispose();
      nextStateTensor.dispose();

      targetQ[action] = reward + 0.95 * Math.max(...nextQValues);
    }

    states.push(state);
    targets.push(targetQ);
  }

  const xs = tf.tensor2d(states);
  const ys = tf.tensor2d(targets);

  await aiSnake.model.fit(xs, ys, {
    epochs: 1,
    batchSize: aiSnake.batchSize,
    verbose: 0
  });

  xs.dispose();
  ys.dispose();
}

// Draw game on canvas
function drawAISnakeGame(game) {
  if (!aiSnake.canvas || !aiSnake.ctx) return;

  const ctx = aiSnake.ctx;
  const gridSize = aiSnake.canvas.width / aiSnake.tileCount;

  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, aiSnake.canvas.width, aiSnake.canvas.height);

  // Draw grid
  ctx.strokeStyle = '#1a3a3a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= aiSnake.tileCount; i++) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, aiSnake.canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(aiSnake.canvas.width, pos);
    ctx.stroke();
  }

  // Draw snake
  game.snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#00ff00' : '#00cc00';
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Draw food
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(
    game.food.x * gridSize + 1,
    game.food.y * gridSize + 1,
    gridSize - 2,
    gridSize - 2
  );
}

// Main training loop
let aiTrainingInterval = null;
let aiGameInterval = null;

async function runAITrainingCycle() {
  if (!aiSnake.isTraining || aiSnake.isPaused) return;

  // Update concurrency
  while (aiSnake.games.length < aiSnake.concurrency) {
    aiSnake.games.push(createAIGame());
  }
  while (aiSnake.games.length > aiSnake.concurrency) {
    aiSnake.games.pop();
  }

  // Run games
  for (let i = 0; i < aiSnake.games.length; i++) {
    const game = aiSnake.games[i];
    if (game.gameOver) {
      // Store final state
      const state = getGameState(game);
      const reward = game.score * 10 - game.steps;
      aiSnake.memory.push({
        state: state,
        action: 0, // placeholder
        reward: reward,
        nextState: state,
        done: true
      });

      // Update statistics
      aiSnake.gamesPlayed++;
      aiSnake.scores.push(game.score);
      if (game.score > aiSnake.bestScore) {
        aiSnake.bestScore = game.score;
        localStorage.setItem('aiSnakeBestScore', aiSnake.bestScore);
      }

      // Limit memory size
      if (aiSnake.memory.length > aiSnake.memorySize) {
        aiSnake.memory.shift();
      }

      // Create new game
      aiSnake.games[i] = createAIGame();
    } else {
      // Get action from model
      const action = await predictAction(game);
      const state = getGameState(game);
      const oldScore = game.score;

      performAIAction(game, action);

      if (!game.gameOver) {
        const nextState = getGameState(game);
        const reward = (game.score > oldScore ? 10 : 0) - 0.1; // small penalty for each step
        const foodDist = Math.abs(game.food.x - game.snake[0].x) + Math.abs(game.food.y - game.snake[0].y);
        const oldFoodDist = game.lastFoodDistance || Infinity;
        const distanceReward = (oldFoodDist - foodDist) * 0.1;

        aiSnake.memory.push({
          state: state,
          action: action,
          reward: reward + distanceReward,
          nextState: nextState,
          done: false
        });

        // Limit memory size
        if (aiSnake.memory.length > aiSnake.memorySize) {
          aiSnake.memory.shift();
        }
      }
    }
  }

  // Draw first game
  if (aiSnake.games.length > 0) {
    drawAISnakeGame(aiSnake.games[0]);
  }

  // Train model
  for (let i = 0; i < aiSnake.trainingSpeed; i++) {
    await trainAIModel();
  }

  // Update target model periodically
  if (aiSnake.gamesPlayed % 100 === 0 && aiSnake.gamesPlayed > 0) {
    if (aiSnake.targetModel) {
      aiSnake.targetModel.dispose();
    }
    aiSnake.targetModel = aiSnake.model.clone();
  }

  // Decay epsilon
  if (aiSnake.epsilon > aiSnake.epsilonMin) {
    aiSnake.epsilon *= aiSnake.epsilonDecay;
  }

  // Update UI
  updateAIUI();
}

// Update UI elements
function updateAIUI() {
  document.getElementById('aiGeneration').textContent = aiSnake.generation;
  document.getElementById('aiBestScore').textContent = aiSnake.bestScore;
  document.getElementById('aiCurrentScore').textContent = aiSnake.games.length > 0 ? aiSnake.games[0].score : 0;
  document.getElementById('aiGamesPlayed').textContent = aiSnake.gamesPlayed;
  document.getElementById('aiEpsilon').textContent = aiSnake.epsilon.toFixed(2);

  if (aiSnake.scores.length > 0) {
    const avg = aiSnake.scores.slice(-100).reduce((a, b) => a + b, 0) / Math.min(100, aiSnake.scores.length);
    document.getElementById('aiAvgScore').textContent = avg.toFixed(1);
  }

  const status = aiSnake.isTraining
    ? `Training... Generation ${aiSnake.generation} | Games: ${aiSnake.gamesPlayed} | Best: ${aiSnake.bestScore} | Epsilon: ${aiSnake.epsilon.toFixed(3)}`
    : 'Training paused';
  updateAITrainingStatus(status);
}

function updateAITrainingStatus(message) {
  const statusEl = document.getElementById('aiTrainingStatus');
  if (statusEl) {
    statusEl.textContent = message;
  }
}

// Start training
async function startAISnakeTraining() {
  if (aiSnake.isTraining) return;

  if (!aiSnake.model) {
    await createAISnakeModel();
  }

  aiSnake.isTraining = true;
  aiSnake.isPaused = false;

  document.getElementById('aiStartBtn').style.display = 'none';
  document.getElementById('aiPauseBtn').style.display = 'block';

  // Initialize games
  aiSnake.games = [];
  for (let i = 0; i < aiSnake.concurrency; i++) {
    aiSnake.games.push(createAIGame());
  }

  // Start game loop
  aiGameInterval = setInterval(() => {
    if (!aiSnake.isPaused) {
      runAITrainingCycle().catch(err => {
        console.error('Training error:', err);
        updateAITrainingStatus('Error during training: ' + err.message);
      });
    }
  }, aiSnake.gameSpeed);

  updateAITrainingStatus('Training started!');
  aiSnake.generation++;
  saveAISnakeState();
}

// Pause training
function pauseAISnakeTraining() {
  aiSnake.isPaused = !aiSnake.isPaused;

  if (aiSnake.isPaused) {
    document.getElementById('aiPauseBtn').textContent = 'Resume';
    updateAITrainingStatus('Training paused.');
  } else {
    document.getElementById('aiPauseBtn').textContent = 'Pause';
    updateAITrainingStatus('Training resumed.');
  }
}

// Reset model
async function resetAISnakeModel() {
  const confirmed = await confirm('Reset AI model? All training progress will be lost.');
  if (confirmed) {
    aiSnake.isTraining = false;
    aiSnake.isPaused = false;

    if (aiGameInterval) {
      clearInterval(aiGameInterval);
      aiGameInterval = null;
    }

    document.getElementById('aiStartBtn').style.display = 'block';
    document.getElementById('aiPauseBtn').style.display = 'none';

    aiSnake.generation = 0;
    aiSnake.bestScore = 0;
    aiSnake.gamesPlayed = 0;
    aiSnake.scores = [];
    aiSnake.epsilon = 1.0;
    aiSnake.memory = [];
    aiSnake.games = [];

    await createAISnakeModel();
    updateAIUI();
    updateAITrainingStatus('Model reset. Ready to start training.');

    localStorage.removeItem('aiSnakeState');
    saveAISnakeState();
  }
}

// Save/Load state
function saveAISnakeState() {
  const state = {
    generation: aiSnake.generation,
    bestScore: aiSnake.bestScore,
    gamesPlayed: aiSnake.gamesPlayed,
    epsilon: aiSnake.epsilon,
    gameSpeed: aiSnake.gameSpeed,
    trainingSpeed: aiSnake.trainingSpeed,
    concurrency: aiSnake.concurrency
  };
  localStorage.setItem('aiSnakeState', JSON.stringify(state));
}

function loadAISnakeState() {
  const saved = localStorage.getItem('aiSnakeState');
  if (saved) {
    const state = JSON.parse(saved);
    aiSnake.generation = state.generation || 0;
    aiSnake.bestScore = parseInt(localStorage.getItem('aiSnakeBestScore')) || 0;
    aiSnake.gamesPlayed = state.gamesPlayed || 0;
    aiSnake.epsilon = state.epsilon || 1.0;
    aiSnake.gameSpeed = parseInt(localStorage.getItem('aiSnakeGameSpeed')) || 10;
    aiSnake.trainingSpeed = parseInt(localStorage.getItem('aiSnakeTrainingSpeed')) || 10;
    aiSnake.concurrency = parseInt(localStorage.getItem('aiSnakeConcurrency')) || 5;
  }

  // Update UI sliders
  const gameSpeedSlider = document.getElementById('aiGameSpeed');
  const trainingSpeedSlider = document.getElementById('aiTrainingSpeed');
  const concurrencySlider = document.getElementById('aiConcurrency');

  if (gameSpeedSlider) {
    gameSpeedSlider.value = aiSnake.gameSpeed;
    document.getElementById('aiGameSpeedValue').textContent = aiSnake.gameSpeed;
  }
  if (trainingSpeedSlider) {
    trainingSpeedSlider.value = aiSnake.trainingSpeed;
    document.getElementById('aiTrainingSpeedValue').textContent = aiSnake.trainingSpeed;
  }
  if (concurrencySlider) {
    concurrencySlider.value = aiSnake.concurrency;
    document.getElementById('aiConcurrencyValue').textContent = aiSnake.concurrency;
  }
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
  } else if (appName === "v86-emulator") {
    iconConfig = { icon: "fa-microchip", label: "V86 Emulator" };
  } else if (appName === "ai-snake") {
    iconConfig = { icon: "fa-brain", label: "AI Snake Learning" };
  } else if (appName === "nautilus-ai") {
    iconConfig = { icon: "fa-robot", label: "Nautilus AI Assistant" };
  } else {
    // Try to get from appMetadata
    const metadata = appMetadata[appName];
    if (metadata) {
      iconConfig = { icon: metadata.icon, label: metadata.name };
    } else {
      return;
    }
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
                          <div class="startup-item-status">${isWhatsNew
          ? "Managed in Settings"
          : isEnabled
            ? "Enabled"
            : "Disabled"
        }</div>
                      </div>
                      <div class="toggle-switch ${isEnabled ? "active" : ""
        } ${disabled}" ${toggleAction} style="${isWhatsNew ? "opacity: 0.5; cursor: not-allowed;" : ""
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
                  <div class="toggle-switch ${whatsNewEnabled ? "active" : ""
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
                                  <div class="startup-item-name">${app.name
            }</div>
                                  <div class="startup-item-status">${isEnabled ? "Enabled" : "Disabled"
            }</div>
                              </div>
                              <div class="toggle-switch ${isEnabled ? "active" : ""
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
                          <div class="toggle-switch ${whatsNewEnabled ? "active" : ""
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
                      ${windowCount === 0
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
                    ${windowCount === 0
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
  searchInput.addEventListener('input', function () {
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

  const existingCommunityApps = appGrid.querySelectorAll(
    '.app-item[data-community-app="true"]'
  );
  existingCommunityApps.forEach((el) => el.remove());

  // Bloatless mode: hide pre-installed apps except App Store, Settings, Files, About, and Terminal in start menu
  if (bloatlessMode) {
    const bloatlessKeep = ["appstore", "settings", "files", "about", "terminal"];
    const allAppItems = appGrid.querySelectorAll(".app-item");
    allAppItems.forEach((item) => {
      const onclickAttr = item.getAttribute("onclick");
      if (onclickAttr) {
        // Extract app name from onclick="openApp('appname')"
        const match = onclickAttr.match(/openApp\(['"]([^'"]+)['"]\)/);
        if (match) {
          const appName = match[1];
          // Hide pre-installed apps not in bloatlessKeep and not user-installed
          if (!bloatlessKeep.includes(appName) && !installedApps.includes(appName) && !installedGames.includes(appName)) {
            item.style.display = "none";
          } else {
            item.style.display = "";
          }
        }
      }
    });
  } else {
    // Reset visibility for non-bloatless mode
    const allAppItems = appGrid.querySelectorAll(".app-item");
    allAppItems.forEach((item) => {
      item.style.display = "";
    });
  }

  // Restore Community Apps in Start Menu
  const savedCommunityApps = JSON.parse(localStorage.getItem('nautilusOS_communityApps') || '{}');
  Object.keys(savedCommunityApps).forEach(appId => {
    const appData = savedCommunityApps[appId];
    const appItem = document.createElement("div");
    appItem.className = "app-item";
    appItem.setAttribute("data-community-app", "true");
    appItem.onclick = () => openApp(appId);
    appItem.innerHTML = `
            <i class="fas ${appData.icon || 'fa-box'}"></i>
            <span>${appData.name}</span>
        `;
    appGrid.appendChild(appItem);
  });

  installedApps.forEach((appName) => {
    // Get app metadata
    const metadata = appMetadata[appName];
    if (!metadata) return;

    const appItem = document.createElement("div");
    appItem.className = "app-item";
    appItem.setAttribute("data-installed", "true");
    appItem.onclick = () => openApp(appName);
    appItem.innerHTML = `
            <i class="fas ${metadata.icon}"></i>
            <span>${metadata.name}</span>
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

async function exportProfile() {
  const profile = {
    version: "1.0",
    username: localStorage.getItem("nautilusOS_username"),
    password: localStorage.getItem("nautilusOS_password"),
    isPasswordless: localStorage.getItem("nautilusOS_isPasswordless") === "true",
    bloatlessMode: localStorage.getItem("nautilusOS_bloatlessMode") === "true",
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

  const profileJson = await encryption.encrypt(profile);
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

// ========== ACCOUNT MANAGER FUNCTIONS ==========

function openAccountManager() {
  const accounts = getAllAccounts();

  const accountListHTML = accounts.map(acc => `
    <div class="account-manager-item" style="padding: 1rem; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 0.75rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <div style="color: var(--text-primary); font-family: fontb; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-user"></i>
            ${acc.username}
            ${acc.role === "superuser" ? '<span style="background: var(--accent); color: var(--bg-primary); padding: 0.15rem 0.5rem; border-radius: 5px; font-size: 0.75rem; margin-left: 0.5rem;">SUPER USER</span>' : ''}
          </div>
          <div style="color: var(--text-secondary); font-size: 0.85rem;">
            ${acc.isPasswordless ? 'Passwordless Account' : 'Password Protected'} • Created ${new Date(acc.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="settings-action-btn" onclick="editAccountPermissions('${acc.username}')" style="padding: 0.5rem 0.75rem;">
            <i class="fas fa-key"></i> Permissions
          </button>
          ${acc.username !== currentUsername ? `
          <button class="settings-action-btn" onclick="deleteAccountConfirm('${acc.username}')" style="padding: 0.5rem 0.75rem; background: var(--error-red); border-color: var(--error-red);">
            <i class="fas fa-trash"></i>
          </button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  showModal({
    type: "info",
    icon: "fa-users-cog",
    title: "Account Management",
    message: `
      <div style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem;">
        ${accountListHTML}
      </div>
      <button class="cloaking-btn primary" onclick="closeModal(); openCreateAccountDialog()" style="width: 100%;">
        <i class="fas fa-user-plus"></i> Create New Account
      </button>
    `,
    confirm: false
  });
}

function openCreateAccountDialog() {
  showModal({
    type: "info",
    icon: "fa-user-plus",
    title: "Create New Account",
    message: `
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label style="display: block; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem;">Username</label>
          <input type="text" id="newAccountUsername" class="login-input" placeholder="Enter username" style="width: 100%;">
        </div>
        <div>
          <label style="display: block; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 0.5rem;">Password</label>
          <input type="password" id="newAccountPassword" class="login-input" placeholder="Enter password" style="width: 100%;">
        </div>
        <div>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="newAccountPasswordless">
            <span style="color: var(--text-primary);">Passwordless Account</span>
          </label>
        </div>
        <div>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="newAccountSuperUser">
            <span style="color: var(--text-primary);">Super User (Full Permissions)</span>
          </label>
        </div>
      </div>
    `,
    confirm: true,
    confirmText: "Create Account",
    cancelText: "Cancel"
  }).then(result => {
    if (result) {
      const username = document.getElementById("newAccountUsername").value;
      const password = document.getElementById("newAccountPassword").value;
      const isPasswordless = document.getElementById("newAccountPasswordless").checked;
      const isSuperUser = document.getElementById("newAccountSuperUser").checked;

      if (!username) {
        showToast("Username is required", "fa-exclamation-circle");
        return;
      }

      if (!isPasswordless && !password) {
        showToast("Password is required for non-passwordless accounts", "fa-exclamation-circle");
        return;
      }

      const result = createAccount(username, password, isSuperUser ? "superuser" : "standard", isPasswordless);

      if (result.success) {
        showToast(result.message, "fa-check-circle");
        openAccountManager();
      } else {
        showToast(result.message, "fa-exclamation-circle");
      }
    }
  });
}

function editAccountPermissions(username) {
  const account = getAccountByUsername(username);
  if (!account) {
    showToast("Account not found", "fa-exclamation-circle");
    return;
  }

  // Get all available apps
  const allApps = Object.keys(appMetadata);
  const allowedApps = account.allowedApps || [];

  const appCheckboxes = allApps.map(appKey => {
    const app = appMetadata[appKey];
    const isAllowed = allowedApps.length === 0 || allowedApps.includes(appKey);
    return `
      <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(30, 35, 48, 0.4); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem;">
        <input type="checkbox" class="app-permission-checkbox" value="${appKey}" ${isAllowed ? 'checked' : ''}>
        <i class="fas ${app.icon}" style="color: var(--accent);"></i>
        <span style="color: var(--text-primary);">${app.name}</span>
      </label>
    `;
  }).join('');

  showModal({
    type: "info",
    icon: "fa-key",
    title: `Permissions for ${username}`,
    message: `
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">Select which apps this user can access. If none are selected, all apps are allowed.</p>
      <div style="max-height: 300px; overflow-y: auto;">
        ${appCheckboxes}
      </div>
    `,
    confirm: true,
    confirmText: "Save Permissions",
    cancelText: "Cancel"
  }).then(result => {
    if (result) {
      const checkboxes = document.querySelectorAll('.app-permission-checkbox');
      const selectedApps = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      // If all apps are selected, set to empty array (meaning all allowed)
      const updatedAllowedApps = selectedApps.length === allApps.length ? [] : selectedApps;

      updateAccount(username, { allowedApps: updatedAllowedApps });
      showToast(`Permissions updated for ${username}`, "fa-check-circle");

      // If updating current user, reload their account
      if (username === currentUsername) {
        currentUserAccount = getAccountByUsername(username);
      }
    }
  });
}

function deleteAccountConfirm(username) {
  showModal({
    type: "warning",
    icon: "fa-exclamation-triangle",
    title: "Delete Account",
    message: `Are you sure you want to delete the account "${username}"? This action cannot be undone.`,
    confirm: true,
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(result => {
    if (result) {
      const delResult = deleteAccount(username);
      if (delResult.success) {
        showToast(delResult.message, "fa-check-circle");
        openAccountManager();
      } else {
        showToast(delResult.message, "fa-exclamation-circle");
      }
    }
  });
}

async function importProfile(event) {
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
      const profile = await encryption.decrypt(e.target.result);

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

      // Restore bloatless mode setting
      bloatlessMode = profile.bloatlessMode || false;
      localStorage.setItem("nautilusOS_bloatlessMode", bloatlessMode ? "true" : "false");

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
  panicRedirectEnabled: true,
  panicUrl: "https://classroom.google.com",
  panicImageEnabled: false,
  panicImage: "",
  antiScreenMonitoring: true,
  antiMonitorDelay: 1000,
  useAntiMonitorDelay: false,
  confirmPageClosing: true,
  cloakOnClickoff: false,
  clickoffTitle: "",
  clickoffFavicon: "",
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
      name: "Stealth Master",
      description: "Apply any cloaking setting to disguise your tab",
      icon: "fa-user-secret",
      unlocked: false,
      unlockedDate: null,
    },
    "power-user": {
      id: "power-user",
      name: "Power User",
      description: "Access the NautilusOS BIOS setup utility",
      icon: "fa-microchip",
      unlocked: false,
      unlockedDate: null,
    },
    "screenshot": {
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
            <div class="achievement-card ${achievement.unlocked ? "unlocked" : "locked"
        }">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                    ${achievement.unlocked
          ? '<div class="achievement-badge">✓</div>'
          : ""
        }
                </div>
                <div class="achievement-name">${achievement.unlocked ? achievement.name : "???"
        }</div>
                <div class="achievement-description">${achievement.unlocked
          ? achievement.description
          : "Locked - Keep exploring to unlock!"
        }</div>
                ${hasProgress && !achievement.unlocked
          ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-date">${progressText}</div>
                `
          : ""
        }
                ${achievement.unlocked
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
            <div class="achievement-description">${egg.unlocked
          ? displayDesc
          : `<i class="fas fa-lightbulb" style="margin-right: 0.5rem; color: var(--accent);"></i>${displayDesc}`
        }</div>
            ${egg.unlocked
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
            <div class="achievement-card ${achievement.unlocked ? "unlocked" : "locked"
        }">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                    ${achievement.unlocked
          ? '<div class="achievement-badge">✓</div>'
          : ""
        }
                </div>
                <div class="achievement-name">${achievement.unlocked ? achievement.name : "???"
        }</div>
                <div class="achievement-description">${achievement.unlocked
          ? achievement.description
          : "Locked - Keep exploring to unlock!"
        }</div>
                ${hasProgress && !achievement.unlocked
          ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-date">${progressText}</div>
                `
          : ""
        }
                ${achievement.unlocked
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
            <div class="easter-egg-card ${egg.unlocked ? "unlocked" : "locked"
        }">
                <div class="easter-egg-icon">
                    <i class="fas ${egg.icon}"></i>
                </div>
                <div class="achievement-name">${displayName}</div>
                <div class="achievement-description">${egg.unlocked
          ? displayDesc
          : `<i class="fas fa-lightbulb" style="margin-right: 0.5rem; color: var(--accent);"></i>${displayDesc}`
        }</div>
                ${egg.unlocked
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
    localStorage.setItem("nautilusOS_cloakTitle", title);
  }

  if (faviconUrl) {
    setFavicon(faviconUrl);
    localStorage.setItem("nautilusOS_cloakFavicon", faviconUrl);
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

  const titleInput = document.getElementById("cloakTitle");
  const faviconInput = document.getElementById("cloakFavicon");
  if (titleInput) titleInput.value = originalTitle;
  if (faviconInput) faviconInput.value = "";

  showToast("Cloaking reset to default", "fa-undo");
}

function toggleCloakOnClickoff() {
  cloakingConfig.cloakOnClickoff = !cloakingConfig.cloakOnClickoff;
  saveCloakingConfig();

  const toggle = document.getElementById("cloakOnClickoffToggle");
  const desc = document.getElementById("cloakOnClickoffDesc");
  const indicator = document.querySelector('.cloaking-tab[data-tab="clickoff"] .cloaking-status-indicator');

  if (toggle) toggle.classList.toggle("active", cloakingConfig.cloakOnClickoff);
  if (desc) desc.textContent = cloakingConfig.cloakOnClickoff ? "Currently Active" : "Currently Inactive";
  if (indicator) indicator.classList.toggle("active", cloakingConfig.cloakOnClickoff);

  if (!cloakingConfig.cloakOnClickoff) {
    resetCloaking();
  }

  showToast(`Clickoff Cloak ${cloakingConfig.cloakOnClickoff ? 'enabled' : 'disabled'}`, cloakingConfig.cloakOnClickoff ? "fa-check-circle" : "fa-info-circle");
}

function applyClickoffSettings() {
  const title = document.getElementById("clickoffTitle").value.trim();
  const faviconUrl = document.getElementById("clickoffFavicon").value.trim();

  cloakingConfig.clickoffTitle = title;
  cloakingConfig.clickoffFavicon = faviconUrl;
  saveCloakingConfig();

  showToast("Clickoff settings saved!", "fa-save");
}

function resetClickoffCloak() {
  cloakingConfig.clickoffTitle = "";
  cloakingConfig.clickoffFavicon = "";
  saveCloakingConfig();

  const titleInput = document.getElementById("clickoffTitle");
  const faviconInput = document.getElementById("clickoffFavicon");
  if (titleInput) titleInput.value = "";
  if (faviconInput) faviconInput.value = "";

  updateClickoffPreview();

  if (cloakingConfig.cloakOnClickoff) {
    resetCloaking();
  }

  showToast("Clickoff settings reset", "fa-undo");
}

function updateClickoffPreview() {
  const title = document.getElementById("clickoffTitle").value.trim() || "NautilusOS";
  const faviconUrl = document.getElementById("clickoffFavicon").value.trim();
  const previewTitle = document.getElementById("clickoffPreviewTitle");
  const previewFavicon = document.getElementById("clickoffPreviewFavicon");

  if (previewTitle) previewTitle.textContent = title;
  if (previewFavicon) {
    if (faviconUrl) {
      previewFavicon.src = faviconUrl;
    } else {
      previewFavicon.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='85' fill='white'%3E🌐︎%3C/text%3E%3C/svg%3E";
    }
  }
}

window.addEventListener('blur', () => {
  if (cloakingConfig.cloakOnClickoff) {
    const clickoffTitle = cloakingConfig.clickoffTitle;
    const clickoffFavicon = cloakingConfig.clickoffFavicon;

    if (clickoffTitle || clickoffFavicon) {
      if (clickoffTitle) document.title = clickoffTitle;
      if (clickoffFavicon) setFavicon(clickoffFavicon);
    } else {
      document.title = "Google";
      setFavicon("https://www.google.com");
    }
  }
});

window.addEventListener('focus', () => {
  if (cloakingConfig.cloakOnClickoff) {
    resetCloaking();
  }
});

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
    unlockAchievement("stealth-mode");
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

const _originalOpenAppForAppStore = openApp;
window.openApp = openApp = function (appName, ...args) {
  _originalOpenAppForAppStore(appName, ...args);
  if (appName === "appstore") {
    setTimeout(() => {
      // Initialize the default themes view with illustrations
      const activeSection = document.querySelector(".appstore-section.active");
      if (activeSection) {
        switchAppStoreSection("themes", activeSection);
      }
    }, 100);
  }
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

      // Initialize Anti-Monitoring Toggles
      if (cloakingConfig.antiScreenMonitoring) {
        const amToggle = document.getElementById("antiScreenMonitoringToggle");
        const amIndicator = document.querySelectorAll('.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator')[0];
        if (amToggle) amToggle.classList.add("active");
        if (amIndicator) amIndicator.classList.add("active");
        const amSettings = document.getElementById("antiMonitorSettings");
        if (amSettings) {
          amSettings.style.opacity = "1";
          amSettings.style.pointerEvents = "auto";
        }
      }

      if (cloakingConfig.useAntiMonitorDelay) {
        const delayToggle = document.getElementById("useAntiMonitorDelayToggle");
        const delayIndicator = document.querySelectorAll('.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator')[1];
        const delayIcon = document.querySelectorAll('.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-icon i')[1];
        if (delayToggle) delayToggle.classList.add("active");
        if (delayIndicator) delayIndicator.classList.add("active");
        if (delayIcon) delayIcon.className = "fas fa-check-circle";
      }

      if (cloakingConfig.confirmPageClosing) {
        const confirmToggle = document.getElementById("confirmPageClosingToggle");
        const confirmIndicator = document.querySelectorAll('.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator')[2];
        const confirmIcon = document.querySelectorAll('.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-icon i')[2];
        if (confirmToggle) confirmToggle.classList.add("active");
        if (confirmIndicator) confirmIndicator.classList.add("active");
        if (confirmIcon) confirmIcon.className = "fas fa-check-circle";
      }

      const delayInput = document.getElementById("antiMonitorDelay");
      if (delayInput) {
        delayInput.value = cloakingConfig.antiMonitorDelay;
        updateAntiMonitorDelayDisplay(cloakingConfig.antiMonitorDelay);
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
function toggleAntiScreenMonitoring() {
  cloakingConfig.antiScreenMonitoring = !cloakingConfig.antiScreenMonitoring;
  saveCloakingConfig();

  const toggle = document.getElementById("antiScreenMonitoringToggle");
  const indicator = document.querySelector(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator'
  );
  const statusDesc = document.querySelector(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-desc'
  );
  const antiMonitorSettings = document.getElementById("antiMonitorSettings");

  if (cloakingConfig.antiScreenMonitoring) {
    if (toggle) toggle.classList.add("active");
    if (indicator) indicator.classList.add("active");
    if (statusDesc) statusDesc.textContent = "Enabled - NautilusOS will black out when you switch tabs";
    if (antiMonitorSettings) {
      antiMonitorSettings.style.opacity = "1";
      antiMonitorSettings.style.pointerEvents = "auto";
    }
    unlockAchievement("stealth-mode");
    showToast("Anti-screen monitoring enabled!", "fa-shield-alt");
    setupScreenMonitoringListener();
  } else {
    if (toggle) toggle.classList.remove("active");
    if (indicator) indicator.classList.remove("active");
    if (statusDesc) statusDesc.textContent = "Disabled";
    if (antiMonitorSettings) {
      antiMonitorSettings.style.opacity = "0.5";
      antiMonitorSettings.style.pointerEvents = "none";
    }
    showToast("Anti-screen monitoring disabled", "fa-shield");
    removeScreenMonitoringListener();
  }
}

function updateAntiMonitorDelayDisplay(value) {
  cloakingConfig.antiMonitorDelay = parseInt(value);
  saveCloakingConfig();
  const display = document.getElementById("antiMonitorDelayValue");
  if (display) {
    display.textContent = value + "ms";
  }
}

function toggleAntiMonitorDelay() {
  cloakingConfig.useAntiMonitorDelay = !cloakingConfig.useAntiMonitorDelay;
  saveCloakingConfig();

  const toggle = document.getElementById("useAntiMonitorDelayToggle");
  const indicator = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator'
  )[1];
  const statusDesc = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-desc'
  )[1];
  const icon = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-icon i'
  )[1];
  const antiMonitorSettings = document.getElementById("antiMonitorSettings");

  if (cloakingConfig.useAntiMonitorDelay) {
    if (toggle) toggle.classList.add("active");
    if (indicator) indicator.classList.add("active");
    if (statusDesc) statusDesc.textContent = "Enabled - After switching back to Nautilus your screen will stay black briefly for the configured delay";
    if (icon) {
      icon.className = "fas fa-check-circle";
    }
    if (antiMonitorSettings) {
      antiMonitorSettings.style.opacity = "1";
      antiMonitorSettings.style.pointerEvents = "auto";
    }
    showToast("Unblack delay enabled!", "fa-sliders-h");
  } else {
    if (toggle) toggle.classList.remove("active");
    if (indicator) indicator.classList.remove("active");
    if (statusDesc) statusDesc.textContent = "Disabled";
    if (icon) {
      icon.className = "fas fa-times-circle";
    }
    if (antiMonitorSettings) {
      antiMonitorSettings.style.opacity = "0.5";
      antiMonitorSettings.style.pointerEvents = "none";
    }
    showToast("Unblack delay disabled!", "fa-times-circle");
  }
}

function toggleConfirmPageClosing() {
  cloakingConfig.confirmPageClosing = !cloakingConfig.confirmPageClosing;
  saveCloakingConfig();

  const toggle = document.getElementById("confirmPageClosingToggle");
  const indicator = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-indicator'
  )[2];
  const statusDesc = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-desc'
  )[2];
  const icon = document.querySelectorAll(
    '.cloaking-tab[data-tab="anti-monitor"] .cloaking-status-icon i'
  )[2];

  if (cloakingConfig.confirmPageClosing) {
    if (toggle) toggle.classList.add("active");
    if (indicator) indicator.classList.add("active");
    if (statusDesc) statusDesc.textContent = "Enabled - Alert will show before closing";
    if (icon) {
      icon.className = "fas fa-check-circle";
    }
    showToast("Page closing confirmation enabled!", "fa-check-circle");
    setupPageClosingListener();
  } else {
    if (toggle) toggle.classList.remove("active");
    if (indicator) indicator.classList.remove("active");
    if (statusDesc) statusDesc.textContent = "Disabled";
    if (icon) {
      icon.className = "fas fa-times-circle";
    }
    showToast("Page closing confirmation disabled", "fa-times-circle");
    removePageClosingListener();
  }
}

let screenMonitoringListener = null;
let pageClosingListener = null;
let blackoutTimeout = null;

function setupScreenMonitoringListener() {
  if (screenMonitoringListener) return;

  screenMonitoringListener = () => {
    if (!cloakingConfig.antiScreenMonitoring) return;

    // Determine current focused window (if any)
    const currentFocused = typeof focusedWindow !== 'undefined' ? focusedWindow : null;

    // If we've already shown a blackout for this focused app, don't recreate it repeatedly
    if (screenMonitoringListener.lastShownForApp && screenMonitoringListener.lastShownForApp === currentFocused) {
      return;
    }

    // If focus is back on the cloaking window or nothing to protect, clear lastShownForApp and bail
    if (!document.hidden && (!currentFocused || currentFocused === 'cloaking' || !windows["cloaking"])) {
      screenMonitoringListener.lastShownForApp = null;
      return;
    }

    // If an overlay already exists, a previous trigger is still active — keep it
    const existingOverlay = document.getElementById("screenMonitoringBlackout");
    if (existingOverlay) {
      // Do not recreate or remove it here; let the original timeout handle cleanup
      return;
    }

    // Create a fullscreen blackout overlay using the same method as the integrity check
    const blackoutOverlay = document.createElement("div");
    blackoutOverlay.id = "screenMonitoringBlackout";
    blackoutOverlay.style.cssText = "position:fixed;inset:0;background:var(--pure-black);z-index:99999;display:block;";
    document.body.appendChild(blackoutOverlay);
    // Record which app we showed the blackout for so we don't spam it repeatedly
    screenMonitoringListener.lastShownForApp = currentFocused || 'hidden';

    // If delay is disabled, remove immediately, otherwise use the delay
    if (!cloakingConfig.useAntiMonitorDelay) {
      blackoutTimeout = setTimeout(() => {
        const overlay = document.getElementById("screenMonitoringBlackout");
        if (overlay) {
          overlay.remove();
        }
      }, 0);
    } else {
      blackoutTimeout = setTimeout(() => {
        const overlay = document.getElementById("screenMonitoringBlackout");
        if (overlay) {
          overlay.remove();
        }
      }, cloakingConfig.antiMonitorDelay);
    }
  };

  window.addEventListener("visibilitychange", screenMonitoringListener);
  window.addEventListener("blur", screenMonitoringListener);

  // Also monitor for when another window gets focus (higher z-index)
  let focusCheckInterval = setInterval(() => {
    if (!cloakingConfig.antiScreenMonitoring) {
      clearInterval(focusCheckInterval);
      return;
    }

    // If cloaking window is not the focused window, show the blackout
    if (focusedWindow && focusedWindow !== "cloaking" && windows["cloaking"]) {
      screenMonitoringListener();
    } else {
      // If cloaking regained focus, clear the last shown marker so future switches will trigger again
      if (focusedWindow === "cloaking" || !windows["cloaking"]) {
        if (screenMonitoringListener && screenMonitoringListener.lastShownForApp) screenMonitoringListener.lastShownForApp = null;
      }
    }
  }, 300);

  // Store the interval ID so we can clear it later
  screenMonitoringListener.focusCheckInterval = focusCheckInterval;
}

function removeScreenMonitoringListener() {
  if (screenMonitoringListener) {
    window.removeEventListener("visibilitychange", screenMonitoringListener);
    window.removeEventListener("blur", screenMonitoringListener);

    // Clear the focus check interval if it exists
    if (screenMonitoringListener.focusCheckInterval) {
      clearInterval(screenMonitoringListener.focusCheckInterval);
    }

    screenMonitoringListener = null;
  }
  if (blackoutTimeout) {
    clearTimeout(blackoutTimeout);
    blackoutTimeout = null;
  }
}

function setupPageClosingListener() {
  if (pageClosingListener) return;

  pageClosingListener = (e) => {
    if (!cloakingConfig.confirmPageClosing) return;

    e.preventDefault();
    e.returnValue = "Are you sure you want to leave? You have unsaved changes.";
    return e.returnValue;
  };

  window.addEventListener("beforeunload", pageClosingListener);
}

function removePageClosingListener() {
  if (pageClosingListener) {
    window.removeEventListener("beforeunload", pageClosingListener);
    pageClosingListener = null;
  }
}

if (cloakingConfig.antiScreenMonitoring) setupScreenMonitoringListener();
if (cloakingConfig.confirmPageClosing) setupPageClosingListener();
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
  // Check for multi-user accounts
  const accounts = getAllAccounts();

  if (accounts.length > 0) {
    // Multi-user system - show account list
    updateLoginWithAccounts(accounts);
  } else {
    // Old single-user system
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
}

function updateLoginWithAccounts(accounts) {
  const loginSubtitle = document.getElementById("loginSubtitle");
  const usernameInput = document.getElementById("username");
  const passwordWrapper = document.getElementById("passwordWrapper");

  if (accounts.length === 1) {
    // Only one account, pre-fill username
    const account = accounts[0];
    if (usernameInput) {
      usernameInput.value = account.username;
    }
    if (loginSubtitle) {
      loginSubtitle.textContent = account.isPasswordless ? "Passwordless account - click Sign In" : "Enter your password";
    }
    if (passwordWrapper) {
      passwordWrapper.style.display = account.isPasswordless ? "none" : "block";
    }
  } else {
    // Multiple accounts - show account selector
    if (loginSubtitle) {
      loginSubtitle.innerHTML = `
        <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">Select an account:</div>
        <div id="accountSelector" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: -15px; margin-top: 20px; max-height: 200px; overflow-y: auto;">
          ${accounts.map(acc => `
            <div class="account-select-item" onclick="selectLoginAccount('${acc.username}')" style="padding: 0.5rem 1rem; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.75rem;">
              <i class="fas fa-user" style="color: var(--accent);"></i>
              <div style="flex: 1;">
                <div style="color: var(--text-primary); font-family: fontb;">${acc.username}</div>
                <div style="color: var(--text-secondary); font-size: 0.8rem;">${acc.role === "superuser" ? "Super User" : "Standard User"}</div>
              </div>
              ${acc.isPasswordless ? '<i class="fas fa-unlock" style="color: var(--success-green);" title="Passwordless"></i>' : '<i class="fas fa-lock" style="color: var(--text-secondary);"></i>'}
            </div>
          `).join('')}
        </div>
      `;
    }

    // Hide username and password fields initially
    if (usernameInput) usernameInput.style.display = "none";
    if (passwordWrapper) passwordWrapper.style.display = "none";
  }
}

function selectLoginAccount(username) {
  const account = getAccountByUsername(username);
  if (!account) return;

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const passwordWrapper = document.getElementById("passwordWrapper");
  const loginSubtitle = document.getElementById("loginSubtitle");

  // Fill username
  if (usernameInput) {
    usernameInput.value = username;
    usernameInput.style.display = "block";
  }

  // Show/hide password field
  if (passwordWrapper) {
    passwordWrapper.style.display = account.isPasswordless ? "none" : "block";
  }

  // Update subtitle
  if (loginSubtitle) {
    loginSubtitle.innerHTML = account.isPasswordless ?
      `<a href="#" onclick="event.preventDefault(); updateLoginScreen();" style="color: var(--accent); text-decoration: underline; cursor: pointer;"><i class="fa-solid fa-arrow-left"></i> Back to account list</a>` :
      `Enter password for ${username} <a href="#" onclick="event.preventDefault(); updateLoginScreen();" style="color: var(--accent); text-decoration: underline; cursor: pointer; margin-left: 0.5rem;">← Back</a>`;
  }

  // Focus password input if needed
  if (!account.isPasswordless && passwordInput) {
    setTimeout(() => passwordInput.focus(), 100);
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
                <h3>Pre-installed Apps</h3>
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
                    <li><strong>About NautilusOS</strong> - Learn about the system and its features</li>
                    <li><strong>Python Interpreter</strong> - Run Python code interactively</li>
                    <li><strong>Achievements</strong> - Track your progress with achievements and Easter eggs</li>
                    <li><strong>Cloaking</strong> - Disguise your browser tab</li>
                    <li><strong>What's New</strong> - View latest features and updates</li>
                    <li><strong>AI Snake Learning</strong> - Watch AI learn to play Snake</li>
                    <li><strong>Nautilus AI Assistant</strong> - Get help from an AI assistant</li>
                    <li><strong>Web App Creator</strong> - Create and customize web applications</li>
                    <li><strong>Help</strong> - System help and documentation</li>
                </ul>
                <h3>Optional Apps (Available in App Store)</h3>
                <ul>
                    <li><strong>Startup Apps</strong> - Configure apps that launch automatically</li>
                    <li><strong>Task Manager</strong> - Monitor and manage running applications</li>
                    <li><strong>Snap Manager</strong> - Configure window snapping layouts</li>
                    <li><strong>V86 Emulator</strong> - Run legacy operating systems</li>
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
    'app-files': {
      title: "Files",
      icon: "fa-folder",
      content: `
                <h2><i class="fas fa-folder"></i> Files</h2>
                <p>The Files app is your file manager for browsing and organizing your virtual file system.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Tree Navigation</strong> - Browse folders in a hierarchical tree view</li>
                    <li><strong>File Operations</strong> - Create, delete, and rename files and folders</li>
                    <li><strong>Drag & Drop</strong> - Move files between folders by dragging</li>
                    <li><strong>Double-click</strong> to open files with appropriate applications</li>
                    <li><strong>Right-click</strong> for context menus with file actions</li>
                </ul>
                <h3>Supported File Types</h3>
                <ul>
                    <li><strong>.txt</strong> - Text files (opens in Text Editor)</li>
                    <li><strong>.py</strong> - Python files (opens in Python Interpreter)</li>
                    <li><strong>Images</strong> - Photos and screenshots</li>
                </ul>
            `,
    },
    'app-terminal': {
      title: "Terminal",
      icon: "fa-terminal",
      content: `
                <h2><i class="fas fa-terminal"></i> Terminal</h2>
                <p>The Terminal provides a command-line interface for advanced operations.</p>
                <h3>Available Commands</h3>
                <ul>
                    <li><strong>ls</strong> - List files in current directory</li>
                    <li><strong>cd</strong> - Change directory</li>
                    <li><strong>cat</strong> - Display file contents</li>
                    <li><strong>mkdir</strong> - Create new directory</li>
                    <li><strong>rm</strong> - Remove files or directories</li>
                    <li><strong>help</strong> - Show available commands</li>
                    <li><strong>clear</strong> - Clear terminal screen</li>
                </ul>
                <h3>Tips</h3>
                <ul>
                    <li>Use <strong>Tab</strong> for command completion</li>
                    <li>Use <strong>Up/Down arrows</strong> to navigate command history</li>
                    <li>Commands are case-sensitive</li>
                </ul>
            `,
    },
    'app-editor': {
      title: "Text Editor",
      icon: "fa-edit",
      content: `
                <h2><i class="fas fa-edit"></i> Text Editor</h2>
                <p>Create and edit text files with this simple but powerful editor.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>New File</strong> - Start with a blank document</li>
                    <li><strong>Open</strong> - Load existing text files</li>
                    <li><strong>Save</strong> - Save current file</li>
                    <li><strong>Save As</strong> - Save with a new filename</li>
                    <li><strong>Save to Device</strong> - Download file to your computer</li>
                </ul>
                <h3>Keyboard Shortcuts</h3>
                <ul>
                    <li><strong>Ctrl+S</strong> - Save file</li>
                    <li><strong>Ctrl+N</strong> - New file</li>
                </ul>
            `,
    },
    'app-about': {
      title: "About NautilusOS",
      icon: "fa-info-circle",
      content: `
                <h2><i class="fas fa-info-circle"></i> About NautilusOS</h2>
                <p>Learn more about NautilusOS, its features, and development.</p>
                <h3>Information</h3>
                <ul>
                    <li><strong>Version</strong> - Current version information</li>
                    <li><strong>Developer</strong> - dinguschan and Nautilus Labs</li>
                    <li><strong>Features</strong> - Complete overview of capabilities</li>
                    <li><strong>Credits</strong> - Contributors and acknowledgments</li>
                </ul>
            `,
    },
    'app-settings': {
      title: "Settings",
      icon: "fa-cog",
      content: `
                <h2><i class="fas fa-cog"></i> Settings</h2>
                <p>Customize your NautilusOS experience with various options.</p>
                <h3>Available Settings</h3>
                <ul>
                    <li><strong>Clock Format</strong> - 12-hour or 24-hour time</li>
                    <li><strong>Show Seconds</strong> - Display seconds in clock</li>
                    <li><strong>Desktop Icons</strong> - Show or hide desktop icons</li>
                    <li><strong>What's New</strong> - Control startup behavior</li>
                    <li><strong>Themes</strong> - Install and apply custom themes</li>
                    <li><strong>System Reset</strong> - Reset boot preferences</li>
                </ul>
            `,
    },
    'app-appstore': {
      title: "App Store",
      icon: "fa-store",
      content: `
                <h2><i class="fas fa-store"></i> App Store</h2>
                <p>Browse and install additional apps and themes for NautilusOS.</p>
                <h3>Sections</h3>
                <ul>
                    <li><strong>Themes</strong> - Custom color schemes and visual styles</li>
                    <li><strong>Apps</strong> - Additional applications and tools</li>
                    <li><strong>Games</strong> - Fun games to play</li>
                    <li><strong>Community</strong> - User-contributed content</li>
                </ul>
                <h3>Installation</h3>
                <ul>
                    <li>Click <strong>Install</strong> to add apps or themes</li>
                    <li>Installed items appear on desktop and in start menu</li>
                    <li>Uninstall option available for user-installed items</li>
                </ul>
            `,
    },
    'app-calculator': {
      title: "Calculator",
      icon: "fa-calculator",
      content: `
                <h2><i class="fas fa-calculator"></i> Calculator</h2>
                <p>Perform basic mathematical calculations.</p>
                <h3>Operations</h3>
                <ul>
                    <li><strong>Addition (+)</strong> - Add numbers</li>
                    <li><strong>Subtraction (-)</strong> - Subtract numbers</li>
                    <li><strong>Multiplication (*)</strong> - Multiply numbers</li>
                    <li><strong>Division (/)</strong> - Divide numbers</li>
                    <li><strong>Equals (=)</strong> - Calculate result</li>
                    <li><strong>Clear</strong> - Reset calculator</li>
                    <li><strong>Backspace</strong> - Delete last digit</li>
                </ul>
            `,
    },
    'app-browser': {
      title: "Nautilus Browser",
      icon: "fa-globe",
      content: `
                <h2><i class="fas fa-globe"></i> Nautilus Browser</h2>
                <p>Browse the web with multiple tabs and full navigation controls.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Multiple Tabs</strong> - Open multiple websites simultaneously</li>
                    <li><strong>Navigation</strong> - Back, forward, and refresh buttons</li>
                    <li><strong>Address Bar</strong> - Enter URLs or search terms</li>
                    <li><strong>Tab Management</strong> - Close tabs with middle-click or close button</li>
                </ul>
                <h3>Tips</h3>
                <ul>
                    <li>Right-click tabs for additional options</li>
                    <li>Use Ctrl+T to open new tabs quickly</li>
                </ul>
            `,
    },
    'app-music': {
      title: "Music",
      icon: "fa-music",
      content: `
                <h2><i class="fas fa-music"></i> Music</h2>
                <p>Play and manage your audio files.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>File Upload</strong> - Load audio files from your device</li>
                    <li><strong>Playback Controls</strong> - Play, pause, skip forward/backward</li>
                    <li><strong>Progress Bar</strong> - Seek to any position in the track</li>
                    <li><strong>Volume Control</strong> - Adjust playback volume</li>
                    <li><strong>Loop Mode</strong> - Repeat current track</li>
                </ul>
                <h3>Supported Formats</h3>
                <ul>
                    <li>MP3, WAV, OGG, and other common audio formats</li>
                </ul>
            `,
    },
    'app-photos': {
      title: "Photos",
      icon: "fa-images",
      content: `
                <h2><i class="fas fa-images"></i> Photos</h2>
                <p>View and manage your images and screenshots.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Image Upload</strong> - Load images from your device</li>
                    <li><strong>Gallery View</strong> - Browse all uploaded images</li>
                    <li><strong>Full View</strong> - View images in full size</li>
                    <li><strong>Screenshot Capture</strong> - Take screenshots of NautilusOS</li>
                    <li><strong>Delete</strong> - Remove unwanted images</li>
                </ul>
                <h3>Supported Formats</h3>
                <ul>
                    <li>JPG, PNG, GIF, and other common image formats</li>
                </ul>
            `,
    },
    'app-python': {
      title: "Python Interpreter",
      icon: "fa-code",
      content: `
                <h2><i class="fas fa-code"></i> Python Interpreter</h2>
                <p>Run Python code interactively or execute Python files.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Interactive Mode</strong> - Execute Python commands line by line</li>
                    <li><strong>File Execution</strong> - Run complete Python scripts</li>
                    <li><strong>Output Display</strong> - View results and error messages</li>
                    <li><strong>Save/Load</strong> - Save and load Python files</li>
                    <li><strong>Clear Output</strong> - Reset the interpreter</li>
                </ul>
                <h3>Example Code</h3>
                <pre><code>print('Hello from NautilusOS!')
x = 10
y = 20
result = x + y
print(f'Result: {result}')</code></pre>
            `,
    },
    'app-achievements': {
      title: "Achievements",
      icon: "fa-trophy",
      content: `
                <h2><i class="fas fa-trophy"></i> Achievements</h2>
                <p>Track your progress and unlock achievements as you explore NautilusOS.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Achievement List</strong> - View all available achievements</li>
                    <li><strong>Progress Tracking</strong> - See your completion status</li>
                    <li><strong>Easter Eggs</strong> - Discover hidden features</li>
                    <li><strong>Categories</strong> - Productivity, Exploration, Time-Based, Easter Eggs</li>
                </ul>
                <h3>Tips</h3>
                <ul>
                    <li>Achievements unlock automatically as you use features</li>
                    <li>Some achievements require specific actions or times</li>
                    <li>Easter eggs are hidden throughout the system</li>
                </ul>
            `,
    },
    'app-whatsnew': {
      title: "What's New",
      icon: "fa-star",
      content: `
                <h2><i class="fas fa-star"></i> What's New</h2>
                <p>Stay updated with the latest features and improvements in NautilusOS.</p>
                <h3>Features</h3>
                <ul>
                    <li><strong>Feature Carousel</strong> - Interactive slideshow of new features</li>
                    <li><strong>Version Information</strong> - Current version and release notes</li>
                    <li><strong>Navigation Controls</strong> - Browse through different slides</li>
                    <li><strong>Auto-play</strong> - Automatic progression through features</li>
                </ul>
                <h3>Current Version</h3>
                <p>NautilusOS v1.5 includes AI Assistant, multiple browsers, more themes, VS Code integration, window snapping, games, and more!</p>
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
    unlockAchievement("stealth-mode");
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
  showToast("Testing panic mode in 2 seconds...", "fa-vial");
  setTimeout(() => {
    triggerPanicMode();
  }, 2000);
}

function togglePanicModeFlag(prop) {
  const otherProp = prop === 'panicRedirectEnabled' ? 'panicImageEnabled' : 'panicRedirectEnabled';

  // Mutual exclusion
  if (!cloakingConfig[prop]) {
    cloakingConfig[prop] = true;
    cloakingConfig[otherProp] = false;
  } else {
    cloakingConfig[prop] = false;
  }

  // Update UI
  const toggle = document.getElementById(prop === 'panicRedirectEnabled' ? 'panicRedirectToggle' : 'panicImageToggle');
  const settings = document.getElementById(prop === 'panicRedirectEnabled' ? 'panicRedirectSettings' : 'panicImageSettingsContainer');
  const otherToggle = document.getElementById(otherProp === 'panicRedirectEnabled' ? 'panicRedirectToggle' : 'panicImageToggle');
  const otherSettings = document.getElementById(otherProp === 'panicRedirectEnabled' ? 'panicRedirectSettings' : 'panicImageSettingsContainer');

  if (toggle) {
    if (cloakingConfig[prop]) toggle.classList.add('active');
    else toggle.classList.remove('active');
  }

  if (settings) {
    settings.style.opacity = cloakingConfig[prop] ? '1' : '0.5';
    settings.style.pointerEvents = cloakingConfig[prop] ? 'auto' : 'none';
  }

  if (otherToggle) {
    if (cloakingConfig[otherProp]) otherToggle.classList.add('active');
    else otherToggle.classList.remove('active');
  }

  if (otherSettings) {
    otherSettings.style.opacity = cloakingConfig[otherProp] ? '1' : '0.5';
    otherSettings.style.pointerEvents = cloakingConfig[otherProp] ? 'auto' : 'none';
  }

  saveCloakingConfig();
}

function handlePanicImageUpload(event) {
  const file = event.target.files[0];
  if (!readImageFile(file, (data) => {
    cloakingConfig.panicImage = data;
    const input = document.getElementById("panicImage");
    if (input) input.value = "Local File Uploaded";
    saveCloakingConfig();
    showToast("Panic image uploaded!", "fa-check-circle");
  })) {
    return;
  }
}

function savePanicSettings() {
  const urlInput = document.getElementById("panicUrl");
  const imageInput = document.getElementById("panicImage");

  if (urlInput) cloakingConfig.panicUrl = urlInput.value.trim();
  if (imageInput && imageInput.value !== "Local File Uploaded") {
    cloakingConfig.panicImage = imageInput.value.trim();
  }

  saveCloakingConfig();
  showToast("Panic settings saved!", "fa-save");
}

function triggerPanicMode() {
  // If Image Overlay is enabled, prioritize it
  if (cloakingConfig.panicImageEnabled && cloakingConfig.panicImage) {
    togglePanicOverlay();
    return;
  }

  // If Safe Redirect is enabled
  if (cloakingConfig.panicRedirectEnabled) {
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
}

function togglePanicOverlay() {
  let overlay = document.getElementById("panicOverlay");
  if (overlay) {
    overlay.remove();
    return;
  }

  overlay = document.createElement("div");
  overlay.id = "panicOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.zIndex = "99999999"; // Increased z-index
  overlay.style.backgroundColor = "black";
  overlay.style.cursor = "none";

  if (cloakingConfig.panicImage) {
    overlay.style.backgroundImage = `url(${cloakingConfig.panicImage})`;
    overlay.style.backgroundSize = "contain";
    overlay.style.backgroundPosition = "center";
    overlay.style.backgroundRepeat = "no-repeat";

    // Ensure the image fills the screen
    overlay.style.width = "100%";
    overlay.style.height = "100%";

    // Log for debugging (will be visible in devtools)
    console.log('[DEBUG] Overlay triggered with image:', cloakingConfig.panicImage.substring(0, 50) + '...');
  } else {
    console.warn('[WARNING] No panic image set!');
  }

  document.body.appendChild(overlay);
}

function changeSearchEngine(value) {
  console.log('[DEBUG] changeSearchEngine called with value:', value);
  localStorage.setItem('nOS_searchEngine', value);
  showToast('Search engine updated!', 'fa-check-circle');
}

function applyPreset(presetName) {
  const presets = {
    blank: {
      title: "‎",
      url: "",
    },
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

  if (presetName === 'blank') {
    const blankFavicon = 'data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAsC8qAP+EAACzh1cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAACAAAAAAAAACAAAAAAAAEiAAAAADAAAiAAAAAAMzAiAAAAAAAAMzAAAAAAAAAiMzMAAAAAAAADAzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA';
    setFavicon(blankFavicon);
  } else {
    setFavicon(preset.url);
  }

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
  tiles: [],
  mergedTiles: new Set(),
  newTiles: new Set(),
  previousBoard: null,
  slideDirection: null
};

function start2048Game() {
  game2048.board = Array(game2048.size).fill().map(() => Array(game2048.size).fill(0));
  game2048.score = 0;
  game2048.gameStarted = true;
  game2048.tiles = [];
  game2048.mergedTiles = new Set();
  game2048.newTiles = new Set();
  game2048.previousBoard = null;
  game2048.slideDirection = null;

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
        emptyCells.push({ row: i, col: j });
      }
    }
  }

  if (emptyCells.length > 0) {
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    game2048.board[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
    game2048.newTiles.add(`${cell.row}-${cell.col}`);
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

  // Create container with absolute positioning for smooth animations
  boardEl.innerHTML = '';
  boardEl.style.display = 'block';
  boardEl.style.position = 'relative';
  boardEl.style.width = `${game2048.size * 100 + (game2048.size - 1) * 10}px`;
  boardEl.style.height = `${game2048.size * 100 + (game2048.size - 1) * 10}px`;

  // Render background grid
  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      const cell = document.createElement('div');
      cell.className = 'tile-cell-bg';
      cell.style.position = 'absolute';
      cell.style.left = `${j * 110}px`;
      cell.style.top = `${i * 110}px`;
      cell.style.width = '100px';
      cell.style.height = '100px';
      cell.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
      cell.style.border = '2px solid var(--border)';
      cell.style.borderRadius = '8px';
      cell.style.opacity = '0.3';
      boardEl.appendChild(cell);
    }
  }

  // Render actual tiles with positions
  const tileContainer = document.createElement('div');
  tileContainer.style.position = 'absolute';
  tileContainer.style.top = '0';
  tileContainer.style.left = '0';
  tileContainer.style.width = '100%';
  tileContainer.style.height = '100%';
  boardEl.appendChild(tileContainer);

  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      const value = game2048.board[i][j];
      if (value === 0) continue;

      const tile = document.createElement('div');
      tile.className = 'tile-2048';
      tile.dataset.row = i;
      tile.dataset.col = j;
      tile.dataset.value = value;

      // Calculate position
      const left = j * 110;
      const top = i * 110;

      tile.style.position = 'absolute';
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
      tile.style.width = '100px';
      tile.style.height = '100px';
      tile.style.background = getTileColor(value);
      tile.style.border = '2px solid var(--border)';
      tile.style.borderRadius = '8px';
      tile.style.display = 'flex';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.fontSize = value >= 1000 ? '28px' : value >= 100 ? '36px' : '44px';
      tile.style.fontWeight = 'bold';
      tile.style.fontFamily = 'fontb';
      tile.style.color = getTileTextColor(value);
      tile.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      tile.style.zIndex = '10';

      // Animation handling
      if (game2048.newTiles.has(`${i}-${j}`)) {
        tile.style.transform = 'scale(0)';
        tile.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
          tile.style.transform = 'scale(1)';
        }, 50);
      } else if (game2048.mergedTiles.has(`${i}-${j}`)) {
        tile.style.transition = 'all 0.15s ease, transform 0.2s ease';
        setTimeout(() => {
          tile.style.transform = 'scale(1.1)';
          setTimeout(() => {
            tile.style.transform = 'scale(1)';
          }, 100);
        }, 150);
      } else if (game2048.previousBoard && game2048.slideDirection) {
        // Find previous position and animate slide
        const prevPos = findPreviousPosition(i, j, value);
        if (prevPos) {
          const prevLeft = prevPos.col * 110;
          const prevTop = prevPos.row * 110;
          tile.style.left = `${prevLeft}px`;
          tile.style.top = `${prevTop}px`;
          tile.style.transition = 'all 0.15s ease';

          setTimeout(() => {
            tile.style.left = `${left}px`;
            tile.style.top = `${top}px`;
          }, 10);
        } else {
          tile.style.transition = 'all 0.15s ease';
        }
      }

      tile.textContent = value;
      tileContainer.appendChild(tile);
    }
  }

  // Clear animation tracking
  setTimeout(() => {
    game2048.newTiles.clear();
    game2048.mergedTiles.clear();
    game2048.previousBoard = null;
    game2048.slideDirection = null;
  }, 200);
}

// New helper function to find previous position
function findPreviousPosition(currentRow, currentCol, value) {
  if (!game2048.previousBoard) return null;

  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      if (game2048.previousBoard[i][j] === value) {
        // Check if this could be the source tile
        const rowDiff = Math.abs(i - currentRow);
        const colDiff = Math.abs(j - currentCol);

        if (game2048.slideDirection === 'up' && j === currentCol && i > currentRow) {
          return { row: i, col: j };
        } else if (game2048.slideDirection === 'down' && j === currentCol && i < currentRow) {
          return { row: i, col: j };
        } else if (game2048.slideDirection === 'left' && i === currentRow && j > currentCol) {
          return { row: i, col: j };
        } else if (game2048.slideDirection === 'right' && i === currentRow && j < currentCol) {
          return { row: i, col: j };
        }
      }
    }
  }

  return null;
}

function getSlideAnimationClass(row, col, direction) {
  if (!game2048.previousBoard) return null;

  // Find where this tile was in the previous board
  for (let i = 0; i < game2048.size; i++) {
    for (let j = 0; j < game2048.size; j++) {
      if (game2048.previousBoard[i][j] === game2048.board[row][col] && game2048.previousBoard[i][j] !== 0) {
        // Check if it's the same tile that moved
        if (i !== row || j !== col) {
          switch (direction) {
            case 'left': return j < col ? 'tile-slide-left' : null;
            case 'right': return j > col ? 'tile-slide-right' : null;
            case 'up': return i < row ? 'tile-slide-up' : null;
            case 'down': return i > row ? 'tile-slide-down' : null;
          }
        }
        break;
      }
    }
  }
  return null;
}

function handle2048KeyPress(e) {
  if (!game2048.gameStarted) return;

  const key = e.key.toLowerCase();
  let moved = false;
  let direction = '';
  let scoreBefore = game2048.score;

  // Store previous board state for slide animations
  game2048.previousBoard = game2048.board.map(row => [...row]);

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
    game2048.slideDirection = direction;
    addRandomTile2048();
    setTimeout(() => {
      render2048Board();
    }, 100);

    // Animate score if it increased
    if (game2048.score > scoreBefore) {
      const scoreEl = document.getElementById('game2048Score');
      scoreEl.classList.add('score-increase');
      setTimeout(() => {
        scoreEl.classList.remove('score-increase');
      }, 300);
    }

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
  } else {
    // Reset if no move was made
    game2048.previousBoard = null;
    game2048.slideDirection = null;
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
        // Track merged tile position
        game2048.mergedTiles.add(`${i}-${j}`);
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
        // Track merged tile position
        game2048.mergedTiles.add(`${i}-${game2048.size - row.length + j}`);
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
        // Track merged tile position
        game2048.mergedTiles.add(`${i}-${j}`);
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
        // Track merged tile position
        game2048.mergedTiles.add(`${game2048.size - col.length + i}-${j}`);
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

  const status = document.getElementById('tttStatus');

  if (result === 'X') {
    tttGame.wins++;
    localStorage.setItem('tttWins', tttGame.wins);
    status.innerHTML = 'You won! <i class="fa-solid fa-trophy"</i>';
    document.getElementById('tttWins').textContent = tttGame.wins;
    showToast('You won!', 'fa-trophy');

  } else if (result === 'O') {
    tttGame.losses++;
    localStorage.setItem('tttLosses', tttGame.losses);
    status.innerHTML = 'AI won! <i class="fa-solid fa-robot" </i>';
    document.getElementById('tttLosses').textContent = tttGame.losses;
    showToast('AI won!', 'fa-robot');

  } else {
    tttGame.draws++;
    localStorage.setItem('tttDraws', tttGame.draws);
    status.innerHTML = "It's a draw! <i class='fa-solid fa-handshake'</i>";
    document.getElementById('tttDraws').textContent = tttGame.draws;
    showToast("It's a draw!", 'fa-handshake');
  }
}

// V86 Emulator Resource Management
async function loadV86ResourcesOnDemand(windowEl) {
  try {
    // Check if already loaded
    if (typeof V86Backend !== 'undefined' && typeof V86Frontend !== 'undefined' && typeof V86Starter !== 'undefined') {
      console.log("V86 resources already loaded");
      updateV86UI();
      initializeV86WindowInstance(windowEl);
      console.log("V86 emulator window opened with lifecycle management");
      return;
    }

    // Show loading progress in the window
    showV86LoadingProgress(windowEl);

    const resources = [
      { src: 'v86/libv86.mjs', name: 'V86', label: 'Loading V86 Library...', type: 'module' },
      { src: 'v86/v86-resources.js', name: 'V86ResourceManager', label: 'Loading V86 Resources...' },
      { src: 'v86/v86-backend.js', name: 'V86Backend', label: 'Loading V86 Core...' },
      { src: 'v86/v86-wrapper.js', name: 'V86Wrapper', label: 'Loading V86 Wrapper...' },
      { src: 'v86/v86-frontend.js', name: 'V86Frontend', label: 'Loading V86 Frontend...' }
    ];

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      updateV86LoadingProgress(windowEl, resource.label, (i / resources.length) * 100);

      if (typeof window[resource.name] === 'undefined') {
        await loadScriptWithProgress(resource.src, resource.name, resource.type === 'module');
      }
    }

    // Final initialization
    updateV86LoadingProgress(windowEl, 'Initializing V86 Emulator...', 100);

    setTimeout(() => {
      hideV86LoadingProgress(windowEl);
      // Don't call updateV86UI here - let V86Frontend handle the interface
      initializeV86WindowInstance(windowEl);
      console.log("V86 emulator window opened with lifecycle management");
    }, 500);

  } catch (error) {
    console.error("Failed to load V86 resources:", error);
    showV86LoadingError(windowEl, error.message);
  }
}

function showV86LoadingProgress(windowEl) {
  const container = windowEl.querySelector('.v86-container');
  if (!container) return;

  // Add loading overlay without replacing the container content
  const overlay = document.createElement('div');
  overlay.className = 'v86-loading-overlay';
  overlay.innerHTML = `
    <div class="v86-loading-content">
      <div class="v86-loading-icon">
        <i class="fas fa-microchip fa-3x"></i>
      </div>
      <h3>Loading V86 Emulator</h3>
      <div class="v86-progress-container">
        <div class="v86-progress-bar">
          <div class="v86-progress-fill" style="width: 0%"></div>
        </div>
        <div class="v86-progress-text">Preparing...</div>
      </div>
    </div>
  `;

  container.appendChild(overlay);
}

function updateV86LoadingProgress(windowEl, message, percentage) {
  const progressFill = windowEl.querySelector('.v86-progress-fill');
  const progressText = windowEl.querySelector('.v86-progress-text');

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressText) {
    progressText.textContent = message;
  }
}

function hideV86LoadingProgress(windowEl) {
  const overlay = windowEl.querySelector('.v86-loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      // Don't regenerate the interface - let V86Frontend handle it
      // The V86Frontend.initialize() will create the proper interface
      overlay.remove();
    }, 300);
  }
}

function showV86LoadingError(windowEl, errorMessage) {
  const container = windowEl.querySelector('.v86-container');
  if (!container) return;

  container.innerHTML = `
    <div class="v86-loading-overlay">
      <div class="v86-loading-content">
        <div class="v86-loading-icon error">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h3>Failed to Load V86 Emulator</h3>
        <p class="v86-error-message">${errorMessage}</p>
        <button class="v86-retry-btn" onclick="retryV86Loading(this)">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    </div>
  `;
}

function retryV86Loading(button) {
  const windowEl = button.closest('.window');
  if (windowEl) {
    loadV86ResourcesOnDemand(windowEl);
  }
}

function loadScriptWithProgress(src, expectedGlobal, isModule = false) {
  return new Promise(async (resolve, reject) => {
    // Handle ES modules differently
    if (isModule) {
      try {
        const cacheBuster = '?v=' + Date.now();
        const module = await import('../' + src + cacheBuster);

        // For V86 module, expose it globally
        if (expectedGlobal === 'V86') {
          // V86 is the default export
          window[expectedGlobal] = module.default;
        } else if (expectedGlobal && module[expectedGlobal]) {
          window[expectedGlobal] = module[expectedGlobal];
        } else if (expectedGlobal && module.default) {
          window[expectedGlobal] = module.default;
        }

        console.log(`Successfully loaded ${expectedGlobal || 'module'} from ${src}`);
        resolve();
      } catch (error) {
        console.error(`Failed to load module ${src}:`, error);
        reject(error);
      }
      return;
    }

    // Regular script loading
    const script = document.createElement('script');
    // Add cache-busting parameter
    const cacheBuster = '?v=' + Date.now();
    script.src = src + cacheBuster;

    script.onload = function () {
      // Check for the global with retries
      let attempts = 0;
      const maxAttempts = 10;

      const checkGlobal = () => {
        attempts++;

        if (!expectedGlobal || typeof window[expectedGlobal] !== 'undefined') {
          console.log(`Successfully loaded ${expectedGlobal || 'script'} from ${src}`);
          resolve();
          return;
        }

        if (attempts < maxAttempts) {
          console.log(`Attempt ${attempts}: ${expectedGlobal} not yet available, retrying...`);
          setTimeout(checkGlobal, 10);
        } else {
          console.error(`${expectedGlobal} not found after loading ${src}. Available V86 globals:`, Object.keys(window).filter(k => k.includes('V86')));
          reject(new Error(`${expectedGlobal} not found after loading ${src}`));
        }
      };

      // Start checking immediately
      checkGlobal();
    };

    script.onerror = function () {
      reject(new Error(`Failed to load ${src}`));
    };

    document.head.appendChild(script);
  });
}

async function loadV86AdditionalResources() {
  const resources = [
    { src: 'v86/libv86.mjs', name: 'V86', type: 'module' },
    { src: 'v86/v86-resources.js', name: 'V86ResourceManager' },
    { src: 'v86/v86-backend.js', name: 'V86Backend' },
    { src: 'v86/v86-wrapper.js', name: 'V86Wrapper' },
    { src: 'v86/v86-frontend.js', name: 'V86Frontend' }
  ];

  for (const resource of resources) {
    if (typeof window[resource.name] === 'undefined') {
      await loadScript(resource.src, resource.name);
    }
  }
}

function loadScript(src, expectedGlobal) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;

    script.onload = function () {
      if (expectedGlobal && typeof window[expectedGlobal] === 'undefined') {
        reject(new Error(`${expectedGlobal} not found after loading ${src}`));
      } else {
        resolve();
      }
    };

    script.onerror = function () {
      reject(new Error(`Failed to load ${src}`));
    };

    document.head.appendChild(script);
  });
}

function cleanupV86Resources() {
  // This function will be called when V86 emulator is uninstalled
  // It will clean up any running emulator instances and resources
  console.log("Cleaning up V86 emulator resources...");

  try {
    // Close any open V86 emulator windows with proper cleanup
    Object.keys(windows).forEach(windowId => {
      if (windowId === 'v86-emulator' || windowId.startsWith('v86-emulator')) {
        const windowElement = windows[windowId];
        if (windowElement) {
          // Trigger proper cleanup before closing
          handleV86WindowClose(windowElement);
          // Close the window
          const closeBtn = windowElement.querySelector('.window-btn.close');
          if (closeBtn) {
            closeBtn.click();
          }
        }
      }
    });

    // Clean up all V86 frontend instances
    if (window.v86Instances) {
      Object.keys(window.v86Instances).forEach(instanceId => {
        const instance = window.v86Instances[instanceId];
        if (instance && typeof instance.cleanup === 'function') {
          instance.cleanup();
        }
      });
      window.v86Instances = {};
    }

    // Clean up global V86 backend instance
    if (v86Instance) {
      if (typeof v86Instance.cleanup === 'function') {
        v86Instance.cleanup();
      } else if (typeof v86Instance.stop === 'function') {
        v86Instance.stop();
      }
      v86Instance = null;
    }

    // Reset V86 state
    v86State = 'stopped';

    // Clean up any V86-related timers
    if (window.v86WindowTimers) {
      Object.keys(window.v86WindowTimers).forEach(windowId => {
        window.v86WindowTimers[windowId].forEach(timerId => {
          clearTimeout(timerId);
          clearInterval(timerId);
        });
      });
      window.v86WindowTimers = {};
    }

    // Clean up V86 resource manager cache
    if (typeof v86ResourceManager !== 'undefined' && v86ResourceManager.clearCache) {
      v86ResourceManager.clearCache();
    }

    // Clean up V86 wrapper instances
    if (typeof v86Wrapper !== 'undefined' && v86Wrapper.destroyAllInstances) {
      v86Wrapper.destroyAllInstances();
    }

    console.log("V86 emulator resources cleaned up successfully");

  } catch (error) {
    console.error("Error during V86 resource cleanup:", error);
    showToast("Error cleaning up V86 resources", "fa-exclamation-triangle");
  }
}

// V86 Emulator Interface Generation
function generateV86Interface() {
  // Generate a unique container ID for this V86 instance
  const containerId = 'v86-container-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  return `
    <div id="${containerId}" class="v86-container" style="width: 100%; height: 100%; background: var(--bg-primary);">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
        <div style="text-align: center;">
          <i class="fas fa-microchip" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">V86 Emulator</div>
          <div style="font-size: 0.9rem; opacity: 0.7;">Initializing...</div>
        </div>
      </div>
    </div>
  `;
}

// V86 UI Update Function
function updateV86UI() {
  console.log("Updating V86 UI components...");

  try {
    // Update any V86-specific UI elements that need refreshing
    const v86Containers = document.querySelectorAll('.v86-container');

    v86Containers.forEach(container => {
      // Check if container is still in initialization state
      const initializingDiv = container.querySelector('div[style*="Initializing"]');
      if (initializingDiv) {
        // Update initialization message
        initializingDiv.textContent = 'Loading emulator components...';
      }
    });

    // Update V86 status indicators if they exist
    const statusElements = document.querySelectorAll('.v86-status-text');
    statusElements.forEach(element => {
      if (element.textContent === 'Initializing...') {
        element.textContent = 'Loading resources...';
      }
    });

    console.log("V86 UI update completed");

  } catch (error) {
    console.error("Error updating V86 UI:", error);
  }
}

// V86 Emulator Control Functions (Legacy - now handled by V86Frontend)
// These functions are kept for backward compatibility but are no longer used
let v86Instance = null;
let v86State = 'stopped';

// V86 Window Lifecycle Management
function handleV86WindowClose(windowElement) {
  console.log("Handling V86 window close - cleaning up emulator instance");

  try {
    // Stop any running emulator instance
    if (v86State === 'running' && v86Instance) {
      stopV86Emulator();
    }

    // Clean up any V86 frontend instances associated with this window
    const windowId = windowElement.dataset.windowId;
    if (windowId && window.v86Instances && window.v86Instances[windowId]) {
      const frontend = window.v86Instances[windowId];
      if (frontend && typeof frontend.cleanup === 'function') {
        frontend.cleanup();
      }
      delete window.v86Instances[windowId];
    }

    // Clean up any event listeners or resources specific to this window
    cleanupV86WindowResources(windowElement);

    console.log("V86 window cleanup completed");

  } catch (error) {
    console.error("Error during V86 window cleanup:", error);
  }
}

function handleV86WindowResize(windowElement) {
  console.log("Handling V86 window resize - adjusting display scaling");

  try {
    // Get the window ID to find the associated frontend instance
    const windowId = windowElement.dataset.windowId;
    if (windowId && window.v86Instances && window.v86Instances[windowId]) {
      const frontend = window.v86Instances[windowId];
      if (frontend && typeof frontend.updateScreenScale === 'function') {
        // Delay the scale update to allow window animation to complete
        setTimeout(() => {
          frontend.updateScreenScale();
        }, 300);
      }
    }

    // Fallback: Update any V86 display elements in the window
    const v86Display = windowElement.querySelector('.v86-display');
    if (v86Display) {
      // Trigger a resize event for any canvas elements
      const canvas = v86Display.querySelector('canvas');
      if (canvas) {
        // Force canvas to recalculate its display size
        setTimeout(() => {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }, 300);
      }
    }

  } catch (error) {
    console.error("Error during V86 window resize handling:", error);
  }
}

function initializeV86WindowInstance(windowElement) {
  console.log("Initializing V86 window instance");

  try {
    // Check memory limits before creating new instance
    if (!enforceV86MemoryLimits()) {
      showToast("Cannot create V86 instance: memory or instance limits exceeded", "fa-exclamation-triangle");
      return;
    }

    // Generate a unique window ID
    const windowId = 'v86-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    windowElement.dataset.windowId = windowId;

    // Initialize global V86 instances tracker if not exists
    if (!window.v86Instances) {
      window.v86Instances = {};
    }

    // Initialize instance cache if not exists
    if (!window.v86InstanceCache) {
      window.v86InstanceCache = {};
    }

    // Initialize window timers tracker if not exists
    if (!window.v86WindowTimers) {
      window.v86WindowTimers = {};
    }
    window.v86WindowTimers[windowId] = [];

    // Find the V86 container in this window
    const v86Container = windowElement.querySelector('.v86-container');
    if (v86Container) {
      // Get the container ID that was generated in generateV86Interface
      const containerId = v86Container.id;

      // Initialize V86 frontend for this window instance
      if (typeof V86Frontend !== 'undefined') {
        const frontend = new V86Frontend(v86Container);
        window.v86Instances[windowId] = frontend;

        // Initialize instance cache for this window
        window.v86InstanceCache[windowId] = {
          blobUrls: [],
          buffers: [],
          created: Date.now()
        };

        // Initialize the frontend
        frontend.initialize().then(() => {
          console.log(`V86 frontend initialized for window ${windowId}`);

          // Log memory usage after initialization
          const usage = getV86MemoryUsage();
          console.log(`V86 Memory Usage - Instances: ${usage.activeInstances}, Memory: ${Math.round(usage.totalMemoryAllocated / (1024 * 1024))}MB`);

        }).catch(error => {
          console.error(`Failed to initialize V86 frontend for window ${windowId}:`, error);
          // Clean up on initialization failure
          cleanupV86InstanceMemory(windowId);
          showToast("Failed to initialize V86 emulator", "fa-exclamation-triangle");
        });
      } else {
        console.error("V86Frontend class not available");
        showToast("V86 emulator components not loaded", "fa-exclamation-triangle");
      }
    }

    // Set up window-specific event handlers
    setupV86WindowEventHandlers(windowElement, windowId);

    console.log(`V86 window instance ${windowId} initialized`);

  } catch (error) {
    console.error("Error initializing V86 window instance:", error);
    showToast("Failed to initialize V86 emulator window", "fa-exclamation-triangle");
  }
}

function setupV86WindowEventHandlers(windowElement, windowId) {
  // Handle window resize events
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.target === windowElement) {
        handleV86WindowResize(windowElement);
      }
    }
  });

  resizeObserver.observe(windowElement);

  // Store the observer for cleanup
  windowElement.v86ResizeObserver = resizeObserver;

  // Handle window focus events
  windowElement.addEventListener('mousedown', () => {
    // Ensure V86 input handling is properly managed when window gains focus
    const frontend = window.v86Instances && window.v86Instances[windowId];
    if (frontend && frontend.inputFocused) {
      // Re-establish input focus if it was previously captured
      setTimeout(() => {
        if (frontend.canvas) {
          frontend.canvas.focus();
        }
      }, 100);
    }
  });
}

function cleanupV86WindowResources(windowElement) {
  try {
    console.log("Starting V86 window resource cleanup...");

    // Clean up resize observer
    if (windowElement.v86ResizeObserver) {
      windowElement.v86ResizeObserver.disconnect();
      delete windowElement.v86ResizeObserver;
    }

    // Clean up any other window-specific resources
    const windowId = windowElement.dataset.windowId;
    if (windowId) {
      // Remove any timers or intervals associated with this window
      if (window.v86WindowTimers && window.v86WindowTimers[windowId]) {
        window.v86WindowTimers[windowId].forEach(timerId => {
          clearTimeout(timerId);
          clearInterval(timerId);
        });
        delete window.v86WindowTimers[windowId];
      }

      // Clean up memory allocated for this instance
      cleanupV86InstanceMemory(windowId);
    }

    // Remove any event listeners attached to the window
    const events = ['mousedown', 'mousemove', 'mouseup', 'keydown', 'keyup', 'resize'];
    events.forEach(eventType => {
      windowElement.removeEventListener(eventType, windowElement[`v86${eventType}Handler`]);
    });

    console.log("V86 window resources cleaned up successfully");

  } catch (error) {
    console.error("Error cleaning up V86 window resources:", error);
  }
}

// V86 Memory Management for Multiple Instances
function cleanupV86InstanceMemory(windowId) {
  try {
    console.log(`Cleaning up memory for V86 instance: ${windowId}`);

    // Clean up the specific frontend instance
    if (window.v86Instances && window.v86Instances[windowId]) {
      const instance = window.v86Instances[windowId];

      // Call cleanup on the instance
      if (typeof instance.cleanup === 'function') {
        instance.cleanup();
      }

      // Remove from instances registry
      delete window.v86Instances[windowId];
    }

    // Clean up any cached resources specific to this instance
    if (window.v86InstanceCache && window.v86InstanceCache[windowId]) {
      const cache = window.v86InstanceCache[windowId];

      // Clean up any blob URLs
      if (cache.blobUrls) {
        cache.blobUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            console.warn("Failed to revoke blob URL:", url, e);
          }
        });
      }

      // Clean up any array buffers
      if (cache.buffers) {
        cache.buffers.forEach(buffer => {
          // Clear the buffer (not strictly necessary but good practice)
          if (buffer instanceof ArrayBuffer) {
            // ArrayBuffers can't be explicitly freed, but we can clear references
            buffer = null;
          }
        });
      }

      delete window.v86InstanceCache[windowId];
    }

    // Force garbage collection hint (if available)
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
      } catch (e) {
        // gc() is not always available, ignore errors
      }
    }

    console.log(`Memory cleanup completed for V86 instance: ${windowId}`);

  } catch (error) {
    console.error(`Error cleaning up memory for V86 instance ${windowId}:`, error);
  }
}

function getV86MemoryUsage() {
  try {
    const usage = {
      activeInstances: 0,
      totalMemoryAllocated: 0,
      cacheSize: 0
    };

    // Count active instances
    if (window.v86Instances) {
      usage.activeInstances = Object.keys(window.v86Instances).length;

      // Calculate memory usage per instance
      Object.values(window.v86Instances).forEach(instance => {
        if (instance.config && instance.config.memory_size) {
          usage.totalMemoryAllocated += instance.config.memory_size;
        }
      });
    }

    // Calculate cache size
    if (window.v86InstanceCache) {
      Object.values(window.v86InstanceCache).forEach(cache => {
        if (cache.buffers) {
          cache.buffers.forEach(buffer => {
            if (buffer instanceof ArrayBuffer) {
              usage.cacheSize += buffer.byteLength;
            }
          });
        }
      });
    }

    return usage;

  } catch (error) {
    console.error("Error calculating V86 memory usage:", error);
    return { activeInstances: 0, totalMemoryAllocated: 0, cacheSize: 0 };
  }
}

function enforceV86MemoryLimits() {
  try {
    const usage = getV86MemoryUsage();
    const maxInstances = 3; // Limit to 3 concurrent instances
    const maxTotalMemory = 1024 * 1024 * 1024; // 1GB total limit

    if (usage.activeInstances > maxInstances) {
      console.warn(`V86 instance limit exceeded: ${usage.activeInstances}/${maxInstances}`);
      showToast(`Too many V86 instances running (${usage.activeInstances}/${maxInstances}). Consider closing some.`, "fa-exclamation-triangle");
      return false;
    }

    if (usage.totalMemoryAllocated > maxTotalMemory) {
      console.warn(`V86 memory limit exceeded: ${Math.round(usage.totalMemoryAllocated / (1024 * 1024))}MB`);
      showToast("V86 memory usage is high. Consider reducing memory allocation or closing instances.", "fa-exclamation-triangle");
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error enforcing V86 memory limits:", error);
    return true; // Allow operation to continue on error
  }
}

// V86 Error Handling and User Feedback
function handleV86LoadError(errorType, errorMessage) {
  console.error(`V86 Load Error [${errorType}]:`, errorMessage);

  const errorHandlers = {
    'BACKEND_LOAD_FAILED': () => {
      showV86ErrorDialog(
        'Backend Loading Failed',
        'The V86 emulator core could not be loaded. This might be due to:',
        [
          'Network connectivity issues',
          'Missing or corrupted emulator files',
          'Browser compatibility problems'
        ],
        [
          { text: 'Retry', action: () => retryV86Load() },
          { text: 'Check Network', action: () => window.open('https://www.google.com', '_blank') },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    },

    'LOAD_TIMEOUT': () => {
      showV86ErrorDialog(
        'Loading Timeout',
        'The V86 emulator took too long to load. This might be due to:',
        [
          'Slow internet connection',
          'Large emulator files',
          'Server response issues'
        ],
        [
          { text: 'Retry', action: () => retryV86Load() },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    },

    'RESOURCE_NOT_FOUND': () => {
      showV86ErrorDialog(
        'Resources Missing',
        'Required V86 emulator files are missing:',
        [
          'BIOS files may not be available',
          'WebAssembly core is missing',
          'Installation may be incomplete'
        ],
        [
          { text: 'Reinstall', action: () => reinstallV86() },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    },

    'INITIALIZATION_FAILED': () => {
      showV86ErrorDialog(
        'Initialization Failed',
        'The V86 emulator could not be initialized:',
        [
          'Insufficient memory available',
          'WebAssembly not supported',
          'Configuration errors'
        ],
        [
          { text: 'Reduce Memory', action: () => showV86MemorySettings() },
          { text: 'Retry', action: () => retryV86Initialization() },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    },

    'RUNTIME_ERROR': () => {
      showV86ErrorDialog(
        'Runtime Error',
        'The V86 emulator encountered an error during operation:',
        [
          'Emulation crashed unexpectedly',
          'Memory allocation failed',
          'Invalid disk image or configuration'
        ],
        [
          { text: 'Restart Emulator', action: () => restartV86Emulator() },
          { text: 'Reset Configuration', action: () => resetV86Configuration() },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    },

    'UNEXPECTED_ERROR': () => {
      showV86ErrorDialog(
        'Unexpected Error',
        'An unexpected error occurred:',
        [errorMessage || 'Unknown error'],
        [
          { text: 'Report Issue', action: () => reportV86Issue(errorType, errorMessage) },
          { text: 'Retry', action: () => retryV86Load() },
          { text: 'Close', action: () => closeV86ErrorDialog() }
        ]
      );
    }
  };

  const handler = errorHandlers[errorType] || errorHandlers['UNEXPECTED_ERROR'];
  handler();
}

function showV86ErrorDialog(title, description, causes, actions) {
  const dialog = document.createElement('div');
  dialog.className = 'v86-error-dialog';
  dialog.innerHTML = `
    <div class="v86-error-overlay">
      <div class="v86-error-content">
        <div class="v86-error-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>${title}</h3>
        </div>
        <div class="v86-error-body">
          <p>${description}</p>
          <ul class="v86-error-causes">
            ${causes.map(cause => `<li>${cause}</li>`).join('')}
          </ul>
        </div>
        <div class="v86-error-actions">
          ${actions.map(action =>
    `<button class="v86-error-btn" onclick="${action.action.name}()">${action.text}</button>`
  ).join('')}
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .v86-error-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    }
    
    .v86-error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .v86-error-content {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .v86-error-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px;
      border-bottom: 1px solid var(--border);
      color: var(--error-red);
    }
    
    .v86-error-header i {
      font-size: 24px;
    }
    
    .v86-error-header h3 {
      margin: 0;
      color: var(--text-primary);
    }
    
    .v86-error-body {
      padding: 20px;
    }
    
    .v86-error-body p {
      margin: 0 0 15px 0;
      color: var(--text-primary);
    }
    
    .v86-error-causes {
      margin: 0;
      padding-left: 20px;
      color: var(--text-secondary);
    }
    
    .v86-error-causes li {
      margin-bottom: 5px;
    }
    
    .v86-error-actions {
      display: flex;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid var(--border);
      justify-content: flex-end;
    }
    
    .v86-error-btn {
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .v86-error-btn:hover {
      background: var(--accent);
      color: white;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(dialog);

  // Store references for cleanup
  dialog.v86Style = style;
  window.currentV86ErrorDialog = dialog;

  // Set up action handlers
  actions.forEach((action, index) => {
    const btn = dialog.querySelectorAll('.v86-error-btn')[index];
    btn.onclick = action.action;
  });
}

function closeV86ErrorDialog() {
  if (window.currentV86ErrorDialog) {
    if (window.currentV86ErrorDialog.v86Style) {
      window.currentV86ErrorDialog.v86Style.remove();
    }
    window.currentV86ErrorDialog.remove();
    window.currentV86ErrorDialog = null;
  }
}

function retryV86Load() {
  closeV86ErrorDialog();
  showToast("Retrying V86 emulator load...", "fa-redo");
  loadV86Resources().catch(error => {
    console.error("Retry failed:", error);
  });
}

function reinstallV86() {
  closeV86ErrorDialog();
  showToast("Reinstalling V86 emulator...", "fa-download");

  // Clean up existing resources
  cleanupV86Resources();

  // Remove from installed apps and reinstall
  const index = installedApps.indexOf('v86-emulator');
  if (index > -1) {
    installedApps.splice(index, 1);
    localStorage.setItem('nautilusOS_installedApps', JSON.stringify(installedApps));
  }

  // Trigger reinstallation
  setTimeout(() => {
    installApp('v86-emulator');
  }, 1000);
}

function retryV86Initialization() {
  closeV86ErrorDialog();
  showToast("Retrying V86 initialization...", "fa-redo");

  // Find the current V86 window and reinitialize
  const v86Window = windows['v86-emulator'];
  if (v86Window) {
    const windowId = v86Window.dataset.windowId;
    if (windowId && window.v86Instances && window.v86Instances[windowId]) {
      const frontend = window.v86Instances[windowId];
      frontend.initialize().catch(error => {
        handleV86LoadError('INITIALIZATION_FAILED', error.message);
      });
    }
  }
}

function showV86MemorySettings() {
  closeV86ErrorDialog();
  showToast("Opening memory settings...", "fa-memory");

  // Show V86 configuration panel if available
  const configPanel = document.getElementById('v86Config');
  if (configPanel) {
    configPanel.style.display = 'block';
  }
}

function restartV86Emulator() {
  closeV86ErrorDialog();
  showToast("Restarting V86 emulator...", "fa-redo");

  if (v86State === 'running') {
    stopV86Emulator();
    setTimeout(() => {
      startV86Emulator();
    }, 2000);
  }
}

function resetV86Configuration() {
  closeV86ErrorDialog();
  showToast("Resetting V86 configuration...", "fa-cog");

  // Reset memory and boot order to defaults
  const memorySelect = document.getElementById('v86Memory');
  const bootOrderSelect = document.getElementById('v86BootOrder');

  if (memorySelect) memorySelect.value = '128';
  if (bootOrderSelect) bootOrderSelect.value = '0x213';

  showToast("V86 configuration reset to defaults", "fa-check-circle");
}

function reportV86Issue(errorType, errorMessage) {
  closeV86ErrorDialog();

  const issueData = {
    type: errorType,
    message: errorMessage,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.log("V86 Issue Report:", issueData);
  showToast("Issue details logged to console", "fa-bug");
}

// ==================== WebLLM AI Assistant ====================

let nautilusAI = {
  engine: null,
  messages: [],
  isInitialized: false,
  isInitializing: false,
  isGenerating: false,
  pendingTools: [],
  toolsEnabled: true,
  actionLog: [],
  currentModel: 'smart' // 'fast' or 'smart' - default to smart (Qwen3 with thinking)
};

const AI_MODELS = {
  fast: {
    name: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    label: 'Dumb',
    description: 'Quick responses, less accurate',
    icon: 'fa-bolt'
  },
  smart: {
    name: 'Qwen3-0.6B-q4f16_1-MLC',
    label: 'Smarty',
    description: 'Advanced reasoning with thinking mode',
    icon: 'fa-brain'
  }
};

// OS Automation Tools - Available for AI to control the OS
const OS_AUTOMATION_TOOLS = {
  open_app: {
    name: "open_app",
    description: "Open an application in NautilusOS",
    parameters: {
      app_name: "string - Name of the app (e.g., 'files', 'terminal', 'settings', 'browser', 'editor', 'music', 'photos', 'calculator', 'appstore', 'cloaking', 'achievements', 'ai-snake')",
      reason: "string - Why this app needs to be opened"
    }
  },
  close_app: {
    name: "close_app",
    description: "Close a currently open application window",
    parameters: {
      app_name: "string - Name of the app to close",
      reason: "string - Why this app needs to be closed"
    }
  },
  run_terminal_command: {
    name: "run_terminal_command",
    description: "Execute a terminal command in NautilusOS",
    parameters: {
      command: "string - The terminal command to execute (e.g., 'ls', 'apps', 'help', 'date', 'whoami', 'clear')",
      reason: "string - Why this command needs to be executed"
    }
  },
  create_file: {
    name: "create_file",
    description: "Create a new file in the file system",
    parameters: {
      path: "string - Full path including filename (e.g., '/documents/note.txt')",
      content: "string - Content to write to the file",
      reason: "string - Why this file needs to be created"
    }
  },
  read_file: {
    name: "read_file",
    description: "Read the contents of a file",
    parameters: {
      path: "string - Full path to the file to read",
      reason: "string - Why this file needs to be read"
    }
  },
  create_folder: {
    name: "create_folder",
    description: "Create a new folder in the file system",
    parameters: {
      path: "string - Full path of the folder to create",
      reason: "string - Why this folder needs to be created"
    }
  },
  delete_item: {
    name: "delete_item",
    description: "Delete a file or folder",
    parameters: {
      path: "string - Full path to the item to delete",
      reason: "string - Why this item needs to be deleted"
    }
  },
  take_screenshot: {
    name: "take_screenshot",
    description: "Capture a screenshot of the desktop",
    parameters: {
      reason: "string - Why a screenshot is needed"
    }
  },
  change_setting: {
    name: "change_setting",
    description: "Change a system setting",
    parameters: {
      setting: "string - The setting to change (e.g., 'theme')",
      value: "string - The new value for the setting",
      reason: "string - Why this setting needs to be changed"
    }
  },
  list_apps: {
    name: "list_apps",
    description: "List all installed applications",
    parameters: {
      reason: "string - Why you need to list apps"
    }
  },
  list_files: {
    name: "list_files",
    description: "List files and folders in a directory",
    parameters: {
      path: "string - Directory path to list (default: '/')",
      reason: "string - Why you need to list this directory"
    }
  },
  get_system_info: {
    name: "get_system_info",
    description: "Get current system information (open apps, username, uptime, etc.)",
    parameters: {
      reason: "string - Why you need system information"
    }
  },
  get_available_options: {
    name: "get_available_options",
    description: "Get available options for settings (themes, search engines, etc.) - USE THIS FIRST before changing settings!",
    parameters: {
      category: "string - Category to query: 'themes', 'apps', 'search_engines', 'settings', 'all'",
      reason: "string - Why you need this information"
    }
  }
};

const NAUTILUS_SYSTEM_PROMPT = `You are the Nautilus AI Assistant, an expert guide for NautilusOS - a web-based operating system built entirely in HTML, CSS, and JavaScript.

<i class="fa-solid fa-robot"></i> OS AUTOMATION CAPABILITIES:
You have the ability to control and automate NautilusOS! You can execute actions on behalf of the user with their approval.

IMPORTANT: When you want to perform an action, output a JSON object in your response with this structure:

PREFERRED FORMAT (with XML tags):
<tool_call>
{
  "tool": "tool_name_here",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
</tool_call>

ALTERNATIVE FORMAT (bare JSON also works):
{"tool": "tool_name_here", "parameters": {"param1": "value1", "param2": "value2"}}

Both formats are supported. The system will detect and execute your tool calls automatically.

Available tools:
${Object.keys(OS_AUTOMATION_TOOLS).map(toolName => {
  const tool = OS_AUTOMATION_TOOLS[toolName];
  return `- ${tool.name}: ${tool.description}\n  Parameters: ${JSON.stringify(tool.parameters, null, 2)}`;
}).join('\n\n')}

TOOL USAGE GUIDELINES:
1. Always explain what you're about to do BEFORE the tool call
2. **IMPORTANT: Use get_available_options FIRST before changing settings!** Query available themes, apps, search engines, etc.
3. Use tool calls when they would be helpful (e.g., if user asks to open an app, use open_app)
4. You can make multiple tool calls in one response if needed
5. Always provide a clear "reason" parameter explaining why the action is needed
6. After making a tool call, explain what you did and what the result was
7. The user must approve each action - they will see a confirmation dialog
8. Tool results will be provided to you in a follow-up message

CRITICAL FOR SETTINGS:
- Before changing theme → use get_available_options with category='themes' to see installed themes
- Before changing search engine → use get_available_options with category='search_engines'
- For other settings → use get_available_options with category='settings'
- This prevents errors from using invalid values!

EXAMPLE CONVERSATIONS:

Example 1 - Opening an app:
User: "Can you open the calculator app for me?"
You: "I'll open the Calculator app for you right away!

<tool_call>
{
  "tool": "open_app",
  "parameters": {
    "app_name": "calculator",
    "reason": "User requested to open the calculator"
  }
}
</tool_call>

The calculator should now be opening on your screen."

Example 2 - Changing theme (CORRECT way):
User: "Change the theme to blue"
You: "I'll check what themes are available and change it to blue!

<tool_call>
{
  "tool": "get_available_options",
  "parameters": {
    "category": "themes",
    "reason": "Need to verify blue theme is installed before changing"
  }
}
</tool_call>

Once I confirm the blue theme is installed, I'll change it for you."

[After getting results showing blue is installed]

<tool_call>
{
  "tool": "change_setting",
  "parameters": {
    "setting": "theme",
    "value": "blue",
    "reason": "User requested blue theme, confirmed it's installed"
  }
}
</tool_call>

Example 3 - Multiple actions:
User: "Open terminal and run the date command"
You: "I'll open the terminal and run the date command!

<tool_call>
{
  "tool": "open_app",
  "parameters": {
    "app_name": "terminal",
    "reason": "Need terminal open to run command"
  }
}
</tool_call>

<tool_call>
{
  "tool": "run_terminal_command",
  "parameters": {
    "command": "date",
    "reason": "User wants to see current date"
  }
}
</tool_call>"

CORE KNOWLEDGE ABOUT NAUTILUSOS:

ARCHITECTURE & TECHNOLOGY:
- NautilusOS is a complete web-based OS running entirely in the browser
- Built with vanilla HTML, CSS, and JavaScript (no frameworks)
- Uses local storage for persistence (localStorage and sessionStorage)
- File system is virtual and stored in browser memory/localStorage
- All windows, apps, and features are DOM-based and fully interactive
- Supports multiple themes, customization, and user profiles

AVAILABLE APPLICATIONS:
1. Files - Full file explorer with folder navigation, tree sidebar, create/delete/rename operations
2. Terminal - Command-line interface with bash-like commands
3. Nautilus Browser - Built-in web browser with proxy support (Helios Browser embedded)
4. Text Editor - Create and edit text files with save/load functionality
5. Music Player - Play music from URLs or uploaded files
6. Photos - View, upload, and manage photos with screenshot capability
7. Settings - Customize themes, time format, desktop icons, wallpapers, cloaking
8. Calculator - Standard calculator with history
9. Help - Comprehensive documentation and keyboard shortcuts
10. What's New - Feature showcase carousel with illustrations
11. App Store - Install themes, apps, and games
12. Achievements - Track progress and unlock badges
13. Cloaking - Tab disguise and panic key features
14. Task Manager - View and manage running applications
15. Snap Manager - Configure window snapping layouts and keybinds
16. Startup Apps - Configure apps to launch on boot
17. V86 Emulator - Run actual operating systems in the browser
18. AI Snake Learning - Neural network that learns to play Snake (by lanefiedler-731)
19. Nautilus AI Assistant - That's me! Your helpful AI guide (by lanefiedler-731)

WINDOW MANAGEMENT:
- Fully draggable windows with title bar drag
- Resizable from any edge or corner
- Minimize, maximize, and close buttons
- Focus management with visual indicators
- Windows appear in taskbar when open
- Snap-to-edge functionality (configurable in Snap Manager)
- Multiple windows can be open simultaneously

FILE SYSTEM:
- Virtual hierarchical file system
- Default folders: Photos, TextEditor, Documents, etc.
- Create folders and files through Files app or Text Editor
- Files are stored as objects in localStorage
- Photos stored as blob URLs
- File operations: create, delete, rename, move, copy
- Tree view sidebar for easy navigation

CUSTOMIZATION & THEMING:
Available themes: Dark (default), Light, Golden, Red, Blue, Purple, Green, Liquid Glass
- Install themes from App Store
- Apply themes in Settings
- Custom wallpapers for desktop and login screen
- Profile pictures
- Desktop icon visibility toggle
- Clock format (12h/24h, with/without seconds)
- Accent colors vary by theme

BOOT & LOGIN:
- Bootloader with two options: GUI mode or Command Line mode
- Account setup wizard on first launch
- Username and password support (or passwordless)
- Login screen with clock and system info
- Boot preference saved to localStorage
- Uptime tracking from boot time

TASKBAR FEATURES:
- Start menu with app grid and user info
- Running app indicators
- Sign out / shut down buttons
- Quick actions panel (screenshots, close all windows)
- System clock
- Notification center
- Search apps functionality

SETTINGS CATEGORIES:
1. Appearance - Themes, wallpapers, desktop icons
2. Time & Date - Clock format, seconds display
3. Account - Username, profile picture, password
4. Cloaking - Tab disguise, panic keys, auto-rotation
5. Import/Export - Backup and restore profiles
6. Advanced - Reset data, developer options

CLOAKING & SECURITY:
- Tab disguise to mimic other websites (Google, Drive, Classroom, etc.)
- Custom tab titles and favicons
- Panic key support for instant redirects
- Auto-rotate disguises at configurable intervals
- Helps bypass school/workplace restrictions

ACHIEVEMENTS SYSTEM:
- Unlock badges for milestones
- Categories: Productivity, Exploration, Time-Based, Easter Eggs
- Persistent across data resets
- Examples: First File Created, Theme Changer, Early Bird, Night Owl

KEYBOARD SHORTCUTS:
- Snap windows: Ctrl+Alt+Arrow Keys
- Quick app launch from Start menu search
- Focus windows with taskbar clicks
- Context menus with right-click

BROWSER FEATURES:
- Embedded Helios Browser with full proxy support
- Multiple tabs support
- URL navigation
- Back/forward buttons
- Tab cloaking integration

TERMINAL COMMANDS:
Common commands: ls, cd, mkdir, rm, cat, echo, clear, help, pwd, whoami
- Bash-like syntax and behavior
- File system integration
- Command history

TECHNICAL DETAILS:
- Uses CSS variables for theming
- FontAwesome icons throughout
- Smooth animations and transitions
- Responsive to different screen sizes
- Service Worker registration for offline support
- LocalStorage keys prefixed with "nautilusOS_"
- File protocol warning for features requiring web server

APP STORE:
- Install additional themes beyond default dark theme
- Games: Tic-Tac-Toe, AI Snake Learning
- Apps: V86 Emulator, Task Manager, Snap Manager, Startup Apps
- Each item shows install status and description

EXPORT/IMPORT PROFILES:
- Export entire system state to JSON file
- Includes: files, settings, themes, installed apps, wallpapers
- Import profile to restore on any device
- Great for backups or sharing configurations

ADVANCED FEATURES:
- Window snapping with customizable layouts
- Startup apps run automatically on boot
- Task manager shows resource usage
- Screenshots using browser screen capture API
- Drag-and-drop file uploads for photos
- Context menus for desktop and file operations

DEVELOPER INFO:
- NautilusOS created by lanefiedler-731, x8r, and dinguschan-owo
- Open source on GitHub
- No external frameworks (vanilla JS)
- Community contributions welcome
- Apps can be created by community (Nautilus AI Assistant by lanefiedler-731)

THINKING MODE (QWEN3 CAPABILITY):
You have advanced reasoning capabilities! For complex tasks, you can use thinking mode to show your reasoning process:

- Wrap your internal reasoning in <think></think> tags
- Use thinking for: complex calculations, multi-step logic, planning, analysis, debugging
- Think through problems step-by-step before giving your final answer
- Thinking content will be displayed separately in a collapsible section
- Your final response (outside <think> tags) should be clear and concise

Example:
<think>
Let me analyze the user's request:
1. They want to change the theme
2. I need to check available themes first using get_available_options
3. Then I'll change the setting if the theme exists
4. This requires two tool calls in sequence
</think>

I'll help you change the theme! First, let me check what themes are available...

When helping users:
1. Be specific and detailed about features
2. Provide step-by-step instructions when needed
3. Reference exact app names and menu locations
4. Explain both basic and advanced features
5. Suggest related features users might find helpful
6. Be enthusiastic about NautilusOS capabilities
7. If unsure about something, admit it honestly
8. Use thinking mode for complex reasoning and problem-solving

Your goal is to make users feel confident and excited about using NautilusOS!`;

async function initializeNautilusAI(modelKey = null) {
  if (nautilusAI.isInitializing) return;

  // Allow re-initialization with different model
  const isModelSwitch = nautilusAI.isInitialized && modelKey !== null;

  if (nautilusAI.isInitialized && !isModelSwitch) return;

  nautilusAI.isInitializing = true;
  const statusEl = document.getElementById('aiStatus');
  const sendBtn = document.getElementById('aiSendBtn');
  const inputEl = document.getElementById('aiInput');

  try {
    // Use selected model or current model
    const selectedModel = modelKey || nautilusAI.currentModel;
    const modelConfig = AI_MODELS[selectedModel];

    updateAiStatus(`Loading WebLLM library...`, true);

    // Load WebLLM from CDN with ES modules support (only once)
    if (!window.mlcai) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import * as webllm from "https://esm.run/@mlc-ai/web-llm";
          window.mlcai = webllm;
        `;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load WebLLM library'));
        document.head.appendChild(script);

        // Wait for window.mlcai to be available
        const checkInterval = setInterval(() => {
          if (window.mlcai) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50); // Reduced from 100ms for faster check

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.mlcai) {
            reject(new Error('WebLLM library load timeout'));
          }
        }, 10000);
      });
    }

    updateAiStatus(`Initializing ${modelConfig.label} model...`, true);

    const { CreateMLCEngine } = window.mlcai;

    // Check WebGPU toggle (default to true for speed)
    const useWebGPU = document.getElementById('aiWebGPUToggle')?.checked !== false;

    // Dispose old engine if switching models
    if (isModelSwitch && nautilusAI.engine) {
      try {
        await nautilusAI.engine.unload();
      } catch (e) {
        console.warn('Error unloading previous model:', e);
      }
    }

    // Create engine with optimizations for faster first token
    nautilusAI.engine = await CreateMLCEngine(modelConfig.name, {
      initProgressCallback: (progress) => {
        updateAiStatus(`Loading ${modelConfig.label}: ${Math.round(progress.progress * 100)}%`, true);
      },
      useWebGPU: useWebGPU,
      // Optimizations for faster initialization and TTFT
      logLevel: 'ERROR', // Reduce logging overhead
      temperature: 0.7, // Optimal for thinking mode
      top_p: 0.95,
      // Enable prompt caching for faster subsequent requests
      caching: true
    });

    // Reset or preserve conversation history
    if (isModelSwitch) {
      // Keep conversation history when switching models
      const oldMessages = nautilusAI.messages.filter(m => m.role !== 'system');
      nautilusAI.messages = [
        { role: "system", content: NAUTILUS_SYSTEM_PROMPT },
        ...oldMessages
      ];
    } else {
      // Fresh start
      nautilusAI.messages = [
        { role: "system", content: NAUTILUS_SYSTEM_PROMPT }
      ];
    }

    nautilusAI.currentModel = selectedModel;
    nautilusAI.isInitialized = true;
    nautilusAI.isInitializing = false;
    updateAiStatus(`${modelConfig.label} Ready`, false);

    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) {
      inputEl.disabled = false;
      inputEl.focus();
    }

    if (isModelSwitch) {
      showToast(`Switched to ${modelConfig.label}`, modelConfig.icon);
    } else {
      showToast(`${modelConfig.label} is ready!`, 'fa-robot');
    }

  } catch (error) {
    console.error('Failed to initialize Nautilus AI:', error);
    nautilusAI.isInitializing = false;
    updateAiStatus(`Error: ${error.message}`, false, true);
    showToast('Failed to load AI model. Check console for details.', 'fa-exclamation-triangle');

    // Re-enable input so user can try again
    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.disabled = false;
  }
}

async function switchAIModel(modelKey) {
  if (nautilusAI.isGenerating) {
    showToast('Cannot switch models while generating response', 'fa-exclamation-circle');
    // Reset select to current model
    const select = document.getElementById('aiModelSelect');
    if (select) select.value = nautilusAI.currentModel;
    return;
  }

  if (modelKey === nautilusAI.currentModel) return;

  const modelConfig = AI_MODELS[modelKey];
  updateAiStatus(`Switching to ${modelConfig.label}...`, true);

  nautilusAI.isInitialized = false;
  await initializeNautilusAI(modelKey);
}

function updateAiStatus(message, loading = false, error = false) {
  const statusEl = document.getElementById('aiStatus');
  if (!statusEl) return;

  const color = error ? '#ef4444' : (loading ? '#64748b' : 'var(--accent)');
  const spinner = loading ? `
    <div class="multi-ring-spinner" style="position: relative; width: 40px; height: 40px;">
      <div style="position: absolute; width: 100%; height: 100%; border: 3px solid transparent; border-top-color: #7dd3c0; border-radius: 50%; animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;"></div>
      <div style="position: absolute; width: 80%; height: 80%; top: 10%; left: 10%; border: 3px solid transparent; border-top-color: #66d9ef; border-radius: 50%; animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;"></div>
      <div style="position: absolute; width: 60%; height: 60%; top: 20%; left: 20%; border: 3px solid transparent; border-top-color: #a6e3a1; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;"></div>
      <div style="position: absolute; width: 40%; height: 40%; top: 30%; left: 30%; border: 3px solid transparent; border-top-color: #f5c2e7; border-radius: 50%; animation: spin 0.6s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;"></div>
    </div>
  ` : '<i class="fas fa-check-circle"></i>';

  statusEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: ${color};">
      ${spinner}
      <span>${message}</span>
    </div>
  `;
}

async function sendAiMessage() {
  const inputEl = document.getElementById('aiInput');
  const sendBtn = document.getElementById('aiSendBtn');

  if (!inputEl || !sendBtn) return;

  const userMessage = inputEl.value.trim();
  if (!userMessage) return;

  if (!nautilusAI.isInitialized) {
    await initializeNautilusAI();
    if (!nautilusAI.isInitialized) return;
  }

  if (nautilusAI.isGenerating) {
    showToast('Please wait for the current response to complete', 'fa-hourglass-half');
    return;
  }

  // Add user message to chat
  addAiChatMessage(userMessage, true);
  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Disable input while generating
  nautilusAI.isGenerating = true;
  sendBtn.disabled = true;
  inputEl.disabled = true;
  updateAiStatus('Thinking...', true);

  try {
    // Add user message to conversation history
    nautilusAI.messages.push({ role: "user", content: userMessage });

    // Create placeholder message for streaming
    const chatContainer = document.getElementById('aiChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      background: rgba(125, 211, 192, 0.1);
      border: 1px solid rgba(125, 211, 192, 0.3);
      border-radius: 10px;
      padding: 15px;
      animation: slideIn 0.3s ease-out;
    `;

    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
    headerDiv.innerHTML = `
      <i class="fas fa-robot" style="color: var(--accent); font-size: 18px;"></i>
      <strong style="color: var(--accent);">Nautilus AI</strong>
    `;

    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'color: #cbd5e1; line-height: 1.6;';

    const textDiv = document.createElement('div');
    textDiv.className = 'ai-response-text';
    textDiv.style.cssText = 'white-space: pre-wrap; word-wrap: break-word;';
    contentDiv.appendChild(textDiv);

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Generate response with streaming - optimized settings based on model
    const isFastModel = nautilusAI.currentModel === 'fast';
    const isSmartModel = nautilusAI.currentModel === 'smart';

    const completionConfig = {
      messages: nautilusAI.messages,
      temperature: isFastModel ? 0.5 : 0.7, // Lower temp for faster model = more focused
      max_tokens: isFastModel ? 2048 : 4096, // Fewer tokens for fast model
      stream: true,
      // Optimizations for faster first token
      top_p: isFastModel ? 0.9 : 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      // Enable streaming for lower latency
      stream_options: { include_usage: false }
    };

    // Enable thinking mode for smart model (Qwen3)
    if (isSmartModel) {
      completionConfig.extra_body = {
        enable_thinking: true,
        // Additional TTFT optimizations
        use_beam_search: false,
        early_stopping: false
      };
    }

    const completion = await nautilusAI.engine.chat.completions.create(completionConfig);

    let fullResponse = '';
    let thinkingSection = null;
    let thinkContentDiv = null;
    let thinkingSummary = null;

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (!delta) continue;

      fullResponse += delta;

      const thinkStartIndex = fullResponse.indexOf('<think>');
      const thinkEndIndex = fullResponse.indexOf('</think>');

      let visibleContent = fullResponse;
      let currentThinking = '';

      if (thinkStartIndex !== -1) {
        if (!thinkingSection) {
          thinkingSection = document.createElement('details');
          thinkingSection.open = true;
          thinkingSection.style.cssText = 'margin: 0 0 15px 0; padding: 12px; background: rgba(125, 211, 192, 0.08); border: 1px solid rgba(125, 211, 192, 0.25); border-radius: 8px; order: -1;';

          thinkingSummary = document.createElement('summary');
          thinkingSummary.style.cssText = 'cursor: pointer; color: var(--accent); font-weight: bold; user-select: none; list-style: none; display: flex; align-items: center; gap: 8px;';
          thinkingSummary.innerHTML = '<i class="fas fa-brain"></i> Thinking<span class="thinking-dots"></span>';

          thinkingSummary.addEventListener('click', (e) => {
            e.preventDefault();
            thinkingSection.open = !thinkingSection.open;
          });

          thinkContentDiv = document.createElement('div');
          thinkContentDiv.style.cssText = 'margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(125, 211, 192, 0.15); color: #94a3b8; font-style: italic; white-space: pre-wrap; line-height: 1.6;';
          thinkContentDiv.className = 'thinking-content';

          thinkingSection.appendChild(thinkingSummary);
          thinkingSection.appendChild(thinkContentDiv);

          contentDiv.style.display = 'flex';
          contentDiv.style.flexDirection = 'column';
          contentDiv.insertBefore(thinkingSection, textDiv);

          if (!document.getElementById('thinking-dots-style')) {
            const style = document.createElement('style');
            style.id = 'thinking-dots-style';
            style.textContent = `
              @keyframes thinkingDots {
                0% { content: ''; }
                25% { content: '.'; }
                50% { content: '..'; }
                75% { content: '...'; }
                100% { content: ''; }
              }
              .thinking-dots::after {
                content: '';
                animation: thinkingDots 1.5s infinite;
              }
              summary::-webkit-details-marker {
                display: none;
              }
            `;
            document.head.appendChild(style);
          }
        }

        if (thinkEndIndex === -1) {
          currentThinking = fullResponse.substring(thinkStartIndex + 7);
          visibleContent = fullResponse.substring(0, thinkStartIndex);
        } else {
          currentThinking = fullResponse.substring(thinkStartIndex + 7, thinkEndIndex);
          visibleContent = fullResponse.substring(0, thinkStartIndex) + fullResponse.substring(thinkEndIndex + 8);
          if (thinkingSummary) {
            thinkingSummary.innerHTML = '<i class="fas fa-lightbulb"></i> Thought';
          }
        }

        if (thinkContentDiv) {
          thinkContentDiv.textContent = currentThinking;
        }
      }

      textDiv.textContent = visibleContent;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Add AI response to conversation history
    nautilusAI.messages.push({ role: "assistant", content: fullResponse });

    // Process tool calls if any
    const toolCalls = parseToolCalls(fullResponse);
    if (toolCalls.length > 0 && nautilusAI.toolsEnabled) {
      updateAiStatus('Processing tool calls...', true);

      // Remove tool call tags from visible text
      const cleanedText = removeToolCallsFromText(fullResponse);
      textDiv.textContent = cleanedText;

      // Process each tool call with user approval
      for (const toolCall of toolCalls) {
        await new Promise((resolve) => {
          showToolApprovalDialog(
            toolCall,
            async () => {
              // User approved - execute the tool
              updateAiStatus(`Executing: ${toolCall.tool}...`, true);
              const result = await executeToolCall(toolCall);
              addToolFeedbackToChat(toolCall, result);

              // Add tool result to conversation for AI context
              nautilusAI.messages.push({
                role: "user",
                content: `[Tool Execution Result]\nTool: ${toolCall.tool}\nSuccess: ${result.success}\nMessage: ${result.message}\n${result.details ? 'Details: ' + result.details : ''}`
              });

              resolve();
            },
            () => {
              // User rejected - show feedback
              addToolFeedbackToChat(toolCall, {
                success: false,
                message: `⛔ Action rejected by user`,
                details: `The ${toolCall.tool} action was not executed.`
              });

              // Inform AI that tool was rejected
              nautilusAI.messages.push({
                role: "user",
                content: `[Tool Execution Result]\nTool: ${toolCall.tool}\nSuccess: false\nMessage: User rejected this action`
              });

              resolve();
            }
          );
        });
      }
    }

    updateAiStatus('AI Assistant Ready', false);

  } catch (error) {
    console.error('AI generation error:', error);
    addAiChatMessage('Sorry, I encountered an error while generating a response. Please try again.', false, true);
    updateAiStatus('Error occurred', false, true);
  } finally {
    nautilusAI.isGenerating = false;
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.focus();
  }
}

function addAiChatMessage(message, isUser = false, isError = false) {
  const chatContainer = document.getElementById('aiChatMessages');
  if (!chatContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    background: ${isUser ? 'rgba(125, 211, 192, 0.15)' : (isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(125, 211, 192, 0.1)')};
    border: 1px solid ${isUser ? 'rgba(125, 211, 192, 0.4)' : (isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(125, 211, 192, 0.3)')};
    border-radius: 10px;
    padding: 15px;
    animation: slideIn 0.3s ease-out;
  `;

  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
  headerDiv.innerHTML = `
    <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}" style="color: ${isUser ? 'var(--accent)' : (isError ? '#ef4444' : 'var(--accent)')}; font-size: 18px;"></i>
    <strong style="color: ${isUser ? 'var(--accent)' : (isError ? '#ef4444' : 'var(--accent)')}">${isUser ? 'You' : 'Nautilus AI'}</strong>
  `;

  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = 'color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;';
  contentDiv.textContent = message;

  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendQuickQuestion(question) {
  const inputEl = document.getElementById('aiInput');
  if (!inputEl) return;

  inputEl.value = question;
  sendAiMessage();
}

function clearAiChat() {
  const chatContainer = document.getElementById('aiChatMessages');
  if (!chatContainer) return;

  // Clear all messages except the welcome message
  const currentModelConfig = AI_MODELS[nautilusAI.currentModel] || AI_MODELS['smart'];
  chatContainer.innerHTML = `
    <div style="background: rgba(125, 211, 192, 0.1); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 10px; padding: 15px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <i class="fas fa-robot" style="color: var(--accent); font-size: 18px;"></i>
        <strong style="color: var(--accent);">Nautilus AI</strong>
      </div>
      <div style="color: #cbd5e1; line-height: 1.6;">
        Hello! I'm your Nautilus AI Assistant. I can help you understand and navigate NautilusOS.<br><br>
        <strong style="color: var(--accent);"><i class="fas ${currentModelConfig.icon}"></i> Using: ${currentModelConfig.label}</strong> - ${currentModelConfig.description}<br><br>
        <strong style="color: var(--accent);"><i class="fa-solid fa-robot"></i>&nbsp;OS Automation Enabled!</strong><br>
        I can control NautilusOS for you! Just ask me to do something and I'll request your approval before taking action.<br><br>
        <strong style="color: var(--accent);"><i class="fa-solid fa-cloud"></i> Thinking Mode Active!</strong><br>
        I can show my reasoning process for complex tasks. Watch for the collapsible "Thinking" section!<br><br>
        Try: "Open calculator" or "List available themes"
      </div>
    </div>
  `;

  // Reset conversation history (keep system prompt)
  nautilusAI.messages = [
    { role: "system", content: NAUTILUS_SYSTEM_PROMPT }
  ];

  showToast('Chat cleared', 'fa-trash');
}

// ==================== OS Automation Tool Execution ====================

function parseToolCalls(text) {
  const toolCalls = [];

  // Method 1: Try to find tool calls wrapped in XML tags (preferred format)
  const xmlRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  let match;

  while ((match = xmlRegex.exec(text)) !== null) {
    try {
      const toolData = JSON.parse(match[1].trim());
      if (toolData.tool && toolData.parameters) {
        toolCalls.push(toolData);
      }
    } catch (e) {
      console.error('Failed to parse XML-wrapped tool call:', e);
    }
  }

  // Method 2: If no XML tags found, look for bare JSON objects with "tool" and "parameters"
  if (toolCalls.length === 0) {
    // Strategy: Find all potential JSON objects and validate them
    // Look for patterns that start with { and contain "tool" key
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line looks like a tool call (starts with { and contains "tool")
      if (line.startsWith('{') && line.includes('"tool"')) {
        try {
          // Try to parse the entire line as JSON
          const toolData = JSON.parse(line);
          if (toolData.tool && toolData.parameters && typeof toolData.parameters === 'object') {
            toolCalls.push(toolData);
          }
        } catch (e) {
          // If single line fails, try to find a complete JSON object across multiple lines
          let jsonStr = line;
          let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

          // Collect lines until braces are balanced
          let j = i + 1;
          while (braceCount > 0 && j < lines.length) {
            jsonStr += '\n' + lines[j];
            braceCount += (lines[j].match(/\{/g) || []).length;
            braceCount -= (lines[j].match(/\}/g) || []).length;
            j++;
          }

          try {
            const toolData = JSON.parse(jsonStr);
            if (toolData.tool && toolData.parameters && typeof toolData.parameters === 'object') {
              toolCalls.push(toolData);
              i = j - 1; // Skip the lines we just processed
            }
          } catch (e2) {
            // Not a valid tool call, continue
          }
        }
      }
    }
  }

  console.log(`Parsed ${toolCalls.length} tool call(s):`, toolCalls);
  return toolCalls;
}

function removeToolCallsFromText(text) {
  // Remove XML-wrapped tool calls
  let cleaned = text.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();

  // Also remove bare JSON tool calls by parsing the same way
  const lines = cleaned.split('\n');
  const filteredLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line looks like a tool call
    if (line.startsWith('{') && line.includes('"tool"')) {
      try {
        const toolData = JSON.parse(line);
        if (toolData.tool && toolData.parameters) {
          continue; // Skip this line, it's a tool call
        }
      } catch (e) {
        // Try multi-line parsing
        let jsonStr = line;
        let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        let j = i + 1;

        while (braceCount > 0 && j < lines.length) {
          jsonStr += '\n' + lines[j];
          braceCount += (lines[j].match(/\{/g) || []).length;
          braceCount -= (lines[j].match(/\}/g) || []).length;
          j++;
        }

        try {
          const toolData = JSON.parse(jsonStr);
          if (toolData.tool && toolData.parameters) {
            i = j - 1; // Skip all these lines
            continue;
          }
        } catch (e2) {
          // Not a tool call, keep the line
        }
      }
    }

    filteredLines.push(lines[i]);
  }

  return filteredLines.join('\n').trim();
}

async function executeToolCall(toolCall) {
  const { tool, parameters } = toolCall;

  logAction(`Executing tool: ${tool}`, parameters);

  try {
    switch (tool) {
      case 'open_app':
        return await executeTool_OpenApp(parameters);
      case 'close_app':
        return await executeTool_CloseApp(parameters);
      case 'run_terminal_command':
        return await executeTool_RunTerminalCommand(parameters);
      case 'create_file':
        return await executeTool_CreateFile(parameters);
      case 'read_file':
        return await executeTool_ReadFile(parameters);
      case 'create_folder':
        return await executeTool_CreateFolder(parameters);
      case 'delete_item':
        return await executeTool_DeleteItem(parameters);
      case 'take_screenshot':
        return await executeTool_TakeScreenshot(parameters);
      case 'change_setting':
        return await executeTool_ChangeSetting(parameters);
      case 'list_apps':
        return await executeTool_ListApps(parameters);
      case 'list_files':
        return await executeTool_ListFiles(parameters);
      case 'get_system_info':
        return await executeTool_GetSystemInfo(parameters);
      case 'get_available_options':
        return await executeTool_GetAvailableOptions(parameters);
      default:
        return { success: false, message: `Unknown tool: ${tool}` };
    }
  } catch (error) {
    return { success: false, message: `Error executing ${tool}: ${error.message}` };
  }
}

// Tool execution functions
function executeTool_OpenApp(params) {
  const { app_name } = params;
  openApp(app_name);
  return {
    success: true,
    message: `✅ Opened ${app_name} application`,
    details: `The ${app_name} app is now open and visible on your screen.`
  };
}

function executeTool_CloseApp(params) {
  const { app_name } = params;
  const windows = document.querySelectorAll('.window');
  let closed = false;

  windows.forEach(win => {
    const title = win.querySelector('.window-title')?.textContent?.toLowerCase();
    if (title && title.includes(app_name.toLowerCase())) {
      win.remove();
      closed = true;
    }
  });

  if (closed) {
    return {
      success: true,
      message: `✅ Closed ${app_name} application`,
      details: `The ${app_name} window has been closed.`
    };
  } else {
    return {
      success: false,
      message: `⚠️ Could not find open ${app_name} window`,
      details: `No window with that app name was found.`
    };
  }
}

function executeTool_RunTerminalCommand(params) {
  const { command } = params;

  // Open terminal if not already open
  const terminalOpen = Array.from(document.querySelectorAll('.window')).some(
    win => win.querySelector('.window-title')?.textContent?.includes('Terminal')
  );

  if (!terminalOpen) {
    openApp('terminal');
  }

  // Wait a bit for terminal to open, then execute command
  setTimeout(() => {
    const terminalInput = document.querySelector('#terminalInput');
    const terminal = document.getElementById('terminalContent');

    if (terminalInput && terminal) {
      // Add command to terminal display
      const cmdLine = document.createElement('div');
      cmdLine.className = 'terminal-line';
      cmdLine.innerHTML = `<span class="terminal-prompt">user@nautilusos:~$ </span>${command}`;
      terminal.insertBefore(cmdLine, terminal.lastElementChild);

      // Execute the command logic (simplified version)
      const output = document.createElement('div');
      output.className = 'terminal-line';

      if (command === 'help') {
        output.innerHTML = "Available commands:<br>help, ls, apps, themes, clear, date, whoami, reset-boot, echo";
      } else if (command === 'date') {
        output.textContent = new Date().toString();
      } else if (command === 'whoami') {
        output.textContent = localStorage.getItem('nOS_username') || 'user';
      } else if (command === 'apps') {
        output.innerHTML = '<span style="color: var(--accent);">Installed Applications:</span><br>Files, Terminal, Browser, Settings, Text Editor, Music, Photos, Calculator, App Store';
      } else {
        output.textContent = `Executed: ${command}`;
      }

      terminal.insertBefore(output, terminal.lastElementChild);
      terminal.scrollTop = terminal.scrollHeight;
    }
  }, 300);

  return {
    success: true,
    message: `✅ Executed terminal command: ${command}`,
    details: `Command "${command}" was executed in the terminal.`
  };
}

function executeTool_CreateFile(params) {
  const { path, content } = params;

  try {
    const parts = path.split('/').filter(p => p);
    const filename = parts.pop();
    const folderPath = '/' + parts.join('/');

    let currentLevel = fileSystem;
    for (const part of parts) {
      if (!currentLevel[part]) {
        currentLevel[part] = { type: 'folder', children: {} };
      }
      currentLevel = currentLevel[part].children;
    }

    currentLevel[filename] = {
      type: 'file',
      content: content,
      modified: new Date().toISOString()
    };

    saveFileSystem();

    return {
      success: true,
      message: `✅ Created file: ${path}`,
      details: `File created with ${content.length} characters of content.`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to create file: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_ReadFile(params) {
  const { path } = params;

  try {
    const parts = path.split('/').filter(p => p);
    let currentLevel = fileSystem;

    for (const part of parts) {
      if (!currentLevel[part]) {
        throw new Error('File not found');
      }
      if (currentLevel[part].type === 'folder') {
        currentLevel = currentLevel[part].children;
      } else {
        currentLevel = currentLevel[part];
        break;
      }
    }

    if (currentLevel.type !== 'file') {
      throw new Error('Path is not a file');
    }

    return {
      success: true,
      message: `✅ Read file: ${path}`,
      details: `File content:\n${currentLevel.content || '(empty file)'}`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to read file: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_CreateFolder(params) {
  const { path } = params;

  try {
    const parts = path.split('/').filter(p => p);
    let currentLevel = fileSystem;

    for (const part of parts) {
      if (!currentLevel[part]) {
        currentLevel[part] = { type: 'folder', children: {} };
      }
      currentLevel = currentLevel[part].children;
    }

    saveFileSystem();

    return {
      success: true,
      message: `✅ Created folder: ${path}`,
      details: `Folder created successfully.`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to create folder: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_DeleteItem(params) {
  const { path } = params;

  try {
    const parts = path.split('/').filter(p => p);
    const itemName = parts.pop();

    let currentLevel = fileSystem;
    for (const part of parts) {
      if (!currentLevel[part]) {
        throw new Error('Path not found');
      }
      currentLevel = currentLevel[part].children;
    }

    if (!currentLevel[itemName]) {
      throw new Error('Item not found');
    }

    delete currentLevel[itemName];
    saveFileSystem();

    return {
      success: true,
      message: `✅ Deleted: ${path}`,
      details: `Item deleted successfully.`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to delete item: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_TakeScreenshot(params) {
  takeScreenshot();
  return {
    success: true,
    message: `✅ Screenshot captured`,
    details: `Screenshot has been saved to your downloads.`
  };
}

function executeTool_ChangeSetting(params) {
  const { setting, value } = params;

  try {
    // Theme setting
    if (setting === 'theme') {
      // Check if theme is installed
      if (!installedThemes.includes(value) && value !== 'dark') {
        return {
          success: false,
          message: `❌ Theme '${value}' is not installed`,
          details: `Available themes: dark, ${installedThemes.join(', ')}. Use get_available_options to see all themes.`
        };
      }

      const themeLink = document.getElementById('themeLink');
      if (themeLink) {
        themeLink.href = value === 'dark' ? '' : `/themes/${value}.css`;
        localStorage.setItem('nOS_selectedTheme', value);
        return {
          success: true,
          message: `✅ Changed theme to: ${value}`,
          details: `Theme has been applied successfully.`
        };
      }
    }

    // Search engine setting
    if (setting === 'search_engine' || setting === 'searchEngine') {
      const searchEngines = {
        'brave': 'https://search.brave.com/search?q=',
        'duckduckgo': 'https://duckduckgo.com/?q=',
        'google': 'https://www.google.com/search?q=',
        'bing': 'https://www.bing.com/search?q=',
        'startpage': 'https://www.startpage.com/search?q=',
        'qwant': 'https://www.qwant.com/?q='
      };

      const engineUrl = searchEngines[value.toLowerCase()];
      if (!engineUrl) {
        return {
          success: false,
          message: `❌ Unknown search engine: ${value}`,
          details: `Available: ${Object.keys(searchEngines).join(', ')}`
        };
      }

      localStorage.setItem('nOS_searchEngine', engineUrl);
      return {
        success: true,
        message: `✅ Changed search engine to: ${value}`,
        details: `Default search engine updated.`
      };
    }

    // Boolean settings (use12Hour, showSeconds, showDesktopIcons, showWhatsNew)
    const booleanSettings = {
      'use12Hour': 'nOS_use12Hour',
      'showSeconds': 'nOS_showSeconds',
      'showDesktopIcons': 'nOS_showDesktopIcons',
      'showWhatsNew': 'nautilusOS_showWhatsNew'
    };

    if (booleanSettings[setting]) {
      const boolValue = value === 'true' || value === true;
      localStorage.setItem(booleanSettings[setting], boolValue.toString());

      // Apply changes immediately
      if (setting === 'showDesktopIcons') {
        const icons = document.getElementById('desktopIcons');
        if (icons) {
          icons.style.display = boolValue ? 'grid' : 'none';
        }
      }

      return {
        success: true,
        message: `✅ Changed ${setting} to: ${boolValue}`,
        details: `Setting updated. Some changes may require reopening apps.`
      };
    }

    // Wisp URL setting
    if (setting === 'wispUrl' || setting === 'wisp_url') {
      localStorage.setItem('nOS_wispUrl', value);
      return {
        success: true,
        message: `✅ Changed Wisp URL to: ${value}`,
        details: `Proxy configuration updated.`
      };
    }

    // Bare URL setting
    if (setting === 'bareUrl' || setting === 'bare_url') {
      localStorage.setItem('nOS_bareUrl', value);
      return {
        success: true,
        message: `✅ Changed Bare URL to: ${value}`,
        details: `Proxy configuration updated.`
      };
    }

    return {
      success: false,
      message: `❌ Unknown setting: ${setting}`,
      details: `Use get_available_options with category 'settings' to see all available settings.`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to change setting: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_ListApps(params) {
  const apps = Object.keys(appMetadata).map(key => {
    const app = appMetadata[key];
    return `${app.name} (${app.preinstalled ? 'preinstalled' : 'installed'})`;
  }).join(', ');

  return {
    success: true,
    message: `✅ Listed all applications`,
    details: `Available apps: ${apps}`
  };
}

function executeTool_ListFiles(params) {
  const { path = '/' } = params;

  try {
    const parts = path.split('/').filter(p => p);
    let currentLevel = fileSystem;

    for (const part of parts) {
      if (!currentLevel[part]) {
        throw new Error('Path not found');
      }
      currentLevel = currentLevel[part].children;
    }

    const items = Object.keys(currentLevel).map(name => {
      const item = currentLevel[name];
      return `${name} (${item.type})`;
    }).join(', ');

    return {
      success: true,
      message: `✅ Listed contents of ${path}`,
      details: `Contents: ${items || '(empty)'}`
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Failed to list files: ${error.message}`,
      details: error.message
    };
  }
}

function executeTool_GetSystemInfo(params) {
  const username = localStorage.getItem('nOS_username') || 'user';
  const openWindows = document.querySelectorAll('.window').length;
  const theme = localStorage.getItem('nOS_selectedTheme') || 'default';

  const info = {
    username,
    openWindows,
    theme,
    browser: navigator.userAgent.split(' ').pop(),
    timestamp: new Date().toLocaleString()
  };

  return {
    success: true,
    message: `✅ Retrieved system information`,
    details: `User: ${info.username}\nOpen windows: ${info.openWindows}\nTheme: ${info.theme}\nBrowser: ${info.browser}\nTime: ${info.timestamp}`
  };
}

function executeTool_GetAvailableOptions(params) {
  const { category = 'all' } = params;

  const options = {
    themes: {
      installed: ['dark', ...installedThemes],
      available: ['dark', 'light', 'blue', 'red', 'purple', 'golden', 'green', 'liquidGlass'],
      current: localStorage.getItem('nOS_selectedTheme') || 'dark',
      description: 'Available color themes for NautilusOS. Themes must be installed from App Store before use.'
    },

    search_engines: {
      available: ['brave', 'duckduckgo', 'google', 'bing', 'startpage', 'qwant'],
      current: localStorage.getItem('nOS_searchEngine') || 'https://search.brave.com/search?q=',
      description: 'Available search engines for the browser'
    },

    settings: {
      boolean: {
        use12Hour: {
          current: localStorage.getItem('nOS_use12Hour') === 'true',
          description: 'Use 12-hour time format (true/false)',
          values: ['true', 'false']
        },
        showSeconds: {
          current: localStorage.getItem('nOS_showSeconds') === 'true',
          description: 'Show seconds in taskbar clock (true/false)',
          values: ['true', 'false']
        },
        showDesktopIcons: {
          current: localStorage.getItem('nOS_showDesktopIcons') !== 'false',
          description: 'Show icons on desktop (true/false)',
          values: ['true', 'false']
        },
        showWhatsNew: {
          current: localStorage.getItem('nautilusOS_showWhatsNew') !== 'false',
          description: 'Show What\'s New on startup (true/false)',
          values: ['true', 'false']
        }
      },
      urls: {
        wispUrl: {
          current: localStorage.getItem('nOS_wispUrl') || 'wss://wisp.rhw.one/',
          description: 'Wisp proxy URL for browser'
        },
        bareUrl: {
          current: localStorage.getItem('nOS_bareUrl') || 'https://useclassplay.vercel.app/fq/',
          description: 'Bare proxy URL for browser'
        }
      },
      description: 'System settings that can be changed'
    },

    apps: {
      available: Object.keys(appMetadata).map(key => ({
        id: key,
        name: appMetadata[key].name,
        preinstalled: appMetadata[key].preinstalled
      })),
      description: 'All available applications in NautilusOS'
    }
  };

  let result = '';

  if (category === 'all') {
    result = JSON.stringify(options, null, 2);
  } else if (category === 'themes') {
    result = `THEMES:\n` +
      `Installed: ${options.themes.installed.join(', ')}\n` +
      `Available to install: ${options.themes.available.filter(t => !options.themes.installed.includes(t)).join(', ')}\n` +
      `Current: ${options.themes.current}\n` +
      `Note: To use a theme, it must first be installed from the App Store.`;
  } else if (category === 'search_engines') {
    result = `SEARCH ENGINES:\n` +
      `Available: ${options.search_engines.available.join(', ')}\n` +
      `Current: ${options.search_engines.current}`;
  } else if (category === 'settings') {
    result = `SETTINGS:\n\n` +
      `Boolean Settings:\n`;
    for (const [key, val] of Object.entries(options.settings.boolean)) {
      result += `  ${key}: ${val.description}\n    Current: ${val.current}\n    Values: ${val.values.join(', ')}\n`;
    }
    result += `\nURL Settings:\n`;
    for (const [key, val] of Object.entries(options.settings.urls)) {
      result += `  ${key}: ${val.description}\n    Current: ${val.current}\n`;
    }
  } else if (category === 'apps') {
    result = `APPS (${options.apps.available.length} total):\n`;
    options.apps.available.forEach(app => {
      result += `  ${app.id}: ${app.name} (${app.preinstalled ? 'preinstalled' : 'installed'})\n`;
    });
  } else {
    return {
      success: false,
      message: `❌ Unknown category: ${category}`,
      details: `Valid categories: themes, apps, search_engines, settings, all`
    };
  }

  return {
    success: true,
    message: `✅ Retrieved available options for: ${category}`,
    details: result
  };
}

function logAction(action, details) {
  const timestamp = new Date().toISOString();
  nautilusAI.actionLog.push({ timestamp, action, details });
  console.log(`[AI Action] ${action}`, details);
}

function showToolApprovalDialog(toolCall, onApprove, onReject) {
  const { tool, parameters } = toolCall;
  const toolDef = OS_AUTOMATION_TOOLS[tool];

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    animation: fadeIn 0.2s ease;
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid rgba(125, 211, 192, 0.3);
    border-radius: 16px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
  `;

  dialog.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <div style="width: 48px; height: 48px; background: rgba(125, 211, 192, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <i class="fas fa-robot" style="color: var(--accent); font-size: 24px;"></i>
      </div>
      <div>
        <h3 style="margin: 0; color: var(--text-primary); font-size: 18px;">AI Action Approval Required</h3>
        <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 12px;">The AI wants to perform an action</p>
      </div>
    </div>
    
    <div style="background: rgba(125, 211, 192, 0.1); border: 1px solid rgba(125, 211, 192, 0.2); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <i class="fas fa-bolt" style="color: var(--accent);"></i>
        <strong style="color: var(--accent);">Action: ${tool}</strong>
      </div>
      <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.6;">
        ${toolDef ? toolDef.description : 'Execute operation'}
      </div>
    </div>
    
    <div style="background: rgba(30, 41, 59, 0.6); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
      <div style="color: var(--text-secondary); font-size: 12px; font-weight: bold; margin-bottom: 8px;">Parameters:</div>
      <div style="color: var(--text-primary); font-size: 13px; font-family: 'SUSE Mono', monospace;">
        ${Object.entries(parameters).map(([key, value]) =>
    `<div style="margin: 4px 0;"><span style="color: var(--accent);">${key}:</span> ${value}</div>`
  ).join('')}
      </div>
    </div>
    
    <div style="display: flex; gap: 12px;">
      <button id="rejectToolBtn" style="flex: 1; padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
        <i class="fas fa-times"></i> Reject
      </button>
      <button id="approveToolBtn" style="flex: 2; padding: 12px; background: linear-gradient(135deg, var(--accent), var(--accent-hover)); border: none; border-radius: 8px; color: #0f172a; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
        <i class="fas fa-check"></i> Approve & Execute
      </button>
    </div>
  `;

  modal.appendChild(dialog);
  document.body.appendChild(modal);

  document.getElementById('approveToolBtn').onclick = () => {
    modal.remove();
    onApprove();
  };

  document.getElementById('rejectToolBtn').onclick = () => {
    modal.remove();
    onReject();
  };

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function addToolFeedbackToChat(toolCall, result) {
  const chatContainer = document.getElementById('aiChatMessages');
  if (!chatContainer) return;

  const feedbackDiv = document.createElement('div');
  feedbackDiv.style.cssText = `
    background: ${result.success ? 'rgba(125, 211, 192, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    border: 1px solid ${result.success ? 'rgba(125, 211, 192, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
    border-radius: 10px;
    padding: 15px;
    margin: 10px 0;
    animation: slideIn 0.3s ease-out;
  `;

  feedbackDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <i class="fas fa-cog" style="color: ${result.success ? 'var(--accent)' : '#ef4444'}; font-size: 16px;"></i>
      <strong style="color: ${result.success ? 'var(--accent)' : '#ef4444'};">Action Result</strong>
    </div>
    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
      <div style="margin-bottom: 6px;">${result.message}</div>
      ${result.details ? `<div style="color: #94a3b8; font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(125, 211, 192, 0.2);">${result.details}</div>` : ''}
    </div>
  `;

  chatContainer.appendChild(feedbackDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Note: Initialization happens in openApp when nautilus-ai is opened

// Handle Enter key in textarea
document.addEventListener('keydown', (e) => {
  const aiInput = document.getElementById('aiInput');
  if (e.target === aiInput && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAiMessage();
  }

  // Auto-resize textarea
  if (e.target === aiInput) {
    setTimeout(() => {
      aiInput.style.height = 'auto';
      aiInput.style.height = Math.min(aiInput.scrollHeight, 150) + 'px';
    }, 0);
  }
  const focusedElement = document.activeElement;
  const isTyping = focusedElement.tagName === 'INPUT' ||
    focusedElement.tagName === 'TEXTAREA' ||
    focusedElement.tagName === 'SELECT' ||
    focusedElement.isContentEditable;

  if (isTyping || document.hidden) {
    return;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  let hoverTimeout;

  document.addEventListener('mouseover', function (e) {
    const desktopIcon = e.target.closest('.desktop-icon');
    if (desktopIcon) {
      const span = desktopIcon.querySelector('span');
      if (span) {
        hoverTimeout = setTimeout(() => {
          span.classList.add('expanded');
        }, 1200);
      }
    }
  });

  document.addEventListener('mouseout', function (e) {
    const desktopIcon = e.target.closest('.desktop-icon');
    if (desktopIcon) {
      const span = desktopIcon.querySelector('span');
      if (span) {
        clearTimeout(hoverTimeout);
        span.classList.remove('expanded');
      }
    }
  });

  initTaskbarTooltips();
});

// Proxy Settings Helpers
function toggleSearchDropdown(trigger) {
  const options = trigger.nextElementSibling;
  options.classList.toggle('show');

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!trigger.contains(e.target) && !options.contains(e.target)) {
      options.classList.remove('show');
    }
  }, { once: true });
}

function selectSearchEngine(name, url) {
  localStorage.setItem('nOS_searchEngine', url);
  const label = document.getElementById('currentSearchEngine');
  if (label) label.textContent = name;
  showToast('Search engine set to ' + name, 'fa-check');
}

function changeWispUrl(url) {
  localStorage.setItem('nOS_wispUrl', url);
  showToast('Wisp URL updated', 'fa-check');
}

function resetWispUrl() {
  const defaultUrl = 'wss://wisp.rhw.one/';
  localStorage.setItem('nOS_wispUrl', defaultUrl);
  const input = document.getElementById('wispUrlInput');
  if (input) input.value = defaultUrl;
  showToast('Wisp URL reset to default', 'fa-undo');
}

// ==================== WEB APP CREATOR FUNCTIONS ====================

function getCustomWebApps() {
  const appsJson = localStorage.getItem('nautilusOS_customWebApps');
  return appsJson ? JSON.parse(appsJson) : [];
}

function saveCustomWebApps(apps) {
  localStorage.setItem('nautilusOS_customWebApps', JSON.stringify(apps));
}

function createCustomWebApp() {
  const nameInput = document.getElementById('webAppName');
  const urlInput = document.getElementById('webAppUrl');
  const iconInput = document.getElementById('webAppIcon');
  const desktopIconInput = document.getElementById('webAppDesktopIcon');

  const name = nameInput.value.trim();
  let url = urlInput.value.trim();
  const icon = 'fas ' + (iconInput.value.trim() || 'fa-globe');
  const addToDesktop = desktopIconInput.checked;

  if (!name || !url) {
    showToast('Please enter an app name and URL', 'fa-exclamation-circle');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const appId = 'webapp_' + Date.now();
  const newApp = {
    id: appId,
    name: name,
    url: url,
    icon: icon,
    created: Date.now()
  };

  // Save to storage
  const apps = getCustomWebApps();
  apps.push(newApp);
  saveCustomWebApps(apps);

  // Add to desktop if requested
  if (addToDesktop) {
    createDesktopIcon(appId, name, icon);
    saveDesktopIconOrder(); // Should enable persistence
  }

  showToast(`App "${name}" created successfully!`, 'fa-check');

  // Reset inputs
  nameInput.value = '';
  urlInput.value = '';

  // Refresh list
  refreshCustomWebAppsList();
}

function refreshCustomWebAppsList() {
  const listEl = document.getElementById('customWebAppsList');
  if (!listEl) return;

  const apps = getCustomWebApps();

  if (apps.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem; background: rgba(30, 35, 48, 0.4); border-radius: 8px;">No custom apps created yet.</p>';
    return;
  }

  listEl.innerHTML = apps.map(app => `
    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(30, 35, 48, 0.6); border: 1px solid var(--border); border-radius: 10px; transition: all 0.2s ease;">
      <div style="width: 40px; height: 40px; background: rgba(125, 211, 192, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent);">
        <i class="${app.icon}"></i>
      </div>
      <div style="flex: 1;">
        <div style="color: var(--text-primary); font-family: fontb; font-size: 0.95rem; margin-bottom: 0.25rem;">${app.name}</div>
        <div style="color: var(--text-secondary); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${app.url}</div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button onclick="launchCustomWebApp('${app.id}')" title="Launch" 
          style="padding: 0.5rem; background: rgba(125, 211, 192, 0.15); border: 1px solid rgba(125, 211, 192, 0.3); border-radius: 6px; color: var(--accent); cursor: pointer;">
          <i class="fas fa-play"></i>
        </button>
        <button onclick="deleteCustomWebApp('${app.id}')" title="Delete" 
          style="padding: 0.5rem; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; color: #ef4444; cursor: pointer;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function deleteCustomWebApp(appId) {
  const confirmed = await confirm('Are you sure you want to delete this app?');
  if (!confirmed) return;

  let apps = getCustomWebApps();
  apps = apps.filter(a => a.id !== appId);
  saveCustomWebApps(apps);

  // Remove desktop icon if it exists
  const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appId}"]`);
  if (desktopIcon) {
    desktopIcon.remove();
    saveDesktopIconOrder(); // Update persistence
  }

  refreshCustomWebAppsList();
  showToast('App deleted', 'fa-trash');
}

function launchCustomWebApp(appId) {
  const apps = getCustomWebApps();
  const app = apps.find(a => a.id === appId);

  if (!app) {
    showToast('App not found', 'fa-exclamation-circle');
    return;
  }

  // Force open the app using the specialized launcher
  openCustomWebAppWindow(app);
}

function openCustomWebAppWindow(app) {
  // Use UV proxy for seamless embedding like the main browser
  // Construct proxy URL
  let proxyUrl = app.url;
  if (window.__uv$config) {
    proxyUrl = window.__uv$config.prefix + window.__uv$config.encodeUrl(app.url);
  } else {
    // Fallback if UV not ready (shouldn't happen usually)
    console.warn("UV config not found, using direct URL");
  }

  const content = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff;">
      <iframe src="${proxyUrl}" style="flex: 1; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
    </div>
  `;

  createWindow(
    app.name,
    app.icon,
    content,
    1000,
    700,
    app.id,
    true // noPadding
  );
}

// Helper to create desktop icon dynamically
function createDesktopIcon(appId, name, iconClass) {
  const desktopIcons = document.getElementById('desktopIcons');
  if (!desktopIcons) return;

  // Check duplicate
  if (document.querySelector(`.desktop-icon[data-app="${appId}"]`)) return;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'desktop-icon';
  iconDiv.setAttribute('ondblclick', `openApp('${appId}')`);
  iconDiv.setAttribute('data-app', appId);

  iconDiv.innerHTML = `
    <i class="${iconClass}"></i> <span>${name}</span>
  `;

  desktopIcons.appendChild(iconDiv);

  // Re-init dragging
  if (typeof initDesktopIconDragging === 'function') {
    initDesktopIconDragging();
  }
}

// Initialize custom apps on startup
window.addEventListener('DOMContentLoaded', () => {
  const apps = getCustomWebApps();
  apps.forEach(app => {
    appMetadata[app.id] = {
      name: app.name,
      icon: app.icon.replace('fas ', '').replace('fa-solid ', ''),
      preinstalled: false,
      type: 'custom-web-app'
    };
  });
});

// ================= COMMUNITY STORE & UI IMPROVEMENTS =================

let communityAppsCache = null;

// Global registry to store app data for safe onclick handling
let communityAppRegistry = {};

async function fetchCommunityApps() {
  const container = document.getElementById('communityAppsGrid');
  if (!container) return; // Not in community tab

  if (communityAppsCache) {
    renderCommunityApps(communityAppsCache);
    return;
  }

  try {
    // Fetch recursive tree
    const treeUrl = `https://api.github.com/repos/nautilus-os/community/git/trees/main?recursive=1&v=${Date.now()}`;
    const treeResp = await fetch(treeUrl);

    if (!treeResp.ok) throw new Error("Failed to fetch repository tree");

    const treeData = await treeResp.json();
    const infoFiles = treeData.tree.filter(node => node.path.endsWith('appinfo.json'));

    const fetchedItems = await Promise.all(infoFiles.map(async (node) => {
      try {
        // Path structure: [category]/[author]/[project]/appinfo.json
        const parts = node.path.split('/');
        // Expect at least: category/author/project/appinfo.json (4 parts)
        if (parts.length < 4) return null;

        const category = parts[0];
        // categories: apps, games, themes
        if (!['apps', 'games', 'themes'].includes(category)) return null;

        const cdnUrl = `https://cdn.jsdelivr.net/gh/nautilus-os/community@latest/${node.path}?v=${Date.now()}`;
        const metaResp = await fetch(cdnUrl);
        if (!metaResp.ok) return null;

        let metaArr = await metaResp.json();
        if (!Array.isArray(metaArr)) metaArr = [metaArr]; // Handle if not array
        const meta = metaArr[0]; // Take first item

        if (!meta) return null;

        return {
          ...meta,
          category: category,
          // normalize category name for display if needed
          type: category === 'games' ? 'game' : (category === 'themes' ? 'theme' : 'app'),
          // Map img to icon if icon is missing
          icon: meta.img || meta.icon,
          isCommunity: true
        };
      } catch (e) {
        console.error("Failed to process", node.path, e);
        return null;
      }
    }));

    const allItems = fetchedItems.filter(i => i !== null);

    communityAppsCache = allItems;
    renderCommunityApps(allItems);

  } catch (error) {
    console.error("Failed to fetch community apps:", error);
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--error-red);">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
            <p>Failed to load community apps. Check your connection.</p>
            <button onclick="fetchCommunityApps()" class="editor-btn" style="margin-top: 1rem;">Retry</button>
        </div>
    `;
  }
}

function renderAppItem(app) {
  const isInstalled = app.isInstalled || false;
  // Generate a unique registry key for this app
  const registryKey = 'app_' + (app.name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  // Store app data in registry for safe retrieval
  communityAppRegistry[registryKey] = app;

  const iconHtml = app.customPreviewHtml
    ? `<div style="margin-bottom: 1rem; display: flex; justify-content: center;">${app.customPreviewHtml}</div>`
    : `<div class="appstore-item-icon"><i class="${app.icon || 'fas fa-box'}"></i></div>`;

  const installBtnText = app.installButtonText || (isInstalled ? 'Uninstall' : 'Install');
  const installBtnDisabled = app.installButtonDisabled ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : '';
  // Use registry key instead of inline JSON
  const installAction = isInstalled && app.uninstallAction ? app.uninstallAction : (app.installAction || `installCommunityAppByKey('${registryKey}')`);

  return `
    <div class="appstore-item">
        ${iconHtml}
        <div class="appstore-item-name">${app.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-user-circle" style="font-size: 0.8rem;"></i> ${app.author || 'Unknown'}
        </div>
        <div class="appstore-item-desc">${app.desc || 'No description provided.'}</div>
        <button class="appstore-item-btn ${isInstalled ? 'installed' : ''}" 
            ${installBtnDisabled}
            onclick="event.stopPropagation(); ${installAction}">
            ${installBtnText}
        </button>
    </div>
  `;
}

function renderCommunityApps(apps) {
  const container = document.getElementById('communityAppsGrid');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No community apps found. Please try again later.</div>`;
    return;
  }

  // Check installed status
  const installedCommunityApps = JSON.parse(localStorage.getItem('nautilusOS_communityApps') || '{}');
  const installedThemesList = JSON.parse(localStorage.getItem('nautilusOS_installedThemes') || '[]');

  const processedApps = apps.map(app => {
    const appId = app.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const isInstalled = (app.type === 'themes' || app.type === 'theme')
      ? installedThemesList.includes(app.name)
      : !!installedCommunityApps[appId];

    return {
      ...app,
      isInstalled: isInstalled,
      installButtonText: isInstalled ? ((app.type && app.type.toLowerCase().includes('game')) ? 'Play' : 'Open') : 'Install',
      // Themes don't technically "open" in the same way, but we can set it to 'Installed' or disabled
      // actually, renderAppItem handles generic isInstalled.
      // For community apps specifically, if installed, action should be openApp(id)
      // Generate a unique registry key for this app
      registryKey: 'app_' + (app.name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      installAction: isInstalled
        ? ((app.type === 'themes' || app.type === 'theme') ? "showToast('Theme is installed', 'fa-check')" : `openApp('${appId}')`)
        : null // Will be set after registry key is stored
    };
  });

  // Re-categorize processed apps
  const categories = {};
  processedApps.forEach(app => {
    const cat = app.category || app.type || 'Other';
    const displayCat = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (!categories[displayCat]) categories[displayCat] = [];
    categories[displayCat].push(app);
  });

  let html = '';

  for (const [cat, items] of Object.entries(categories)) {
    html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem; font-family: fontb; color: var(--accent); text-transform: capitalize;">${cat}</div>`;

    items.forEach(app => {
      html += renderAppItem(app);
    });
  }

  container.innerHTML = html;
}

function viewAppDetails(app) {
  // Fullscreen/Modal view
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(10, 14, 26, 0.95)';
  modal.style.zIndex = '10000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '1rem';
  modal.style.animation = 'fadeIn 0.2s ease';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  }

  const isInstalled = app.isInstalled || false;
  // Generate a unique registry key for this app (for modal use)
  const registryKey = 'modal_' + (app.name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  // Store app data in registry for safe retrieval
  communityAppRegistry[registryKey] = app;

  const iconHtml = app.customPreviewHtml
    ? `<div style="margin-bottom: 1.5rem; transform: scale(1.2); display: flex; justify-content: center;">${app.customPreviewHtml}</div>`
    : `<div style="width: 80px; height: 80px; background: rgba(125, 211, 192, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: var(--accent); margin-bottom: 1.5rem;"><i class="${app.icon || 'fas fa-box'}"></i></div>`;

  const installBtnText = app.installButtonText || (isInstalled ? 'Uninstall' : 'Install');
  const installBtnDisabled = app.installButtonDisabled ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : '';
  const installAction = isInstalled && app.uninstallAction ? app.uninstallAction : (app.installAction || `installCommunityAppByKey('${registryKey}')`);

  modal.innerHTML = `
        <div style="background: rgba(21, 25, 35, 0.95); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 500px; max-height: 80vh; overflow-y: auto; position: relative; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; z-index: 10;">
                <i class="fas fa-times"></i>
            </button>
            <div style="padding: 2rem; display: flex; flex-direction: column; align-items: center;">
                ${iconHtml}
                <h2 style="color: var(--text-primary); margin-bottom: 0.25rem; text-align: center;">${app.name}</h2>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <span style="color: var(--text-secondary); font-size: 0.9rem;"><i class="fas fa-user-circle"></i> ${app.author || 'Unknown'}</span>
                    ${app.type ? `<span style="background: rgba(125, 211, 192, 0.1); color: var(--accent); padding: 0.1rem 0.5rem; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize;">${app.type}</span>` : ''}
                </div>
                
                <div style="background: rgba(30, 35, 48, 0.4); padding: 1rem; border-radius: 10px; width: 100%; margin-bottom: 1.5rem;">
                    <p style="line-height: 1.5; color: var(--text-primary); font-size: 0.95rem;">${app.desc || 'No description available.'}</p>
                </div>

                <div style="display: flex; gap: 1rem; width: 100%;">
                    <button class="editor-btn" style="flex: 1; padding: 0.875rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-primary);" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                        Close
                    </button>
                    <button class="editor-btn" style="flex: 1; padding: 0.875rem; background: var(--accent); color: var(--bg-primary); font-weight: bold; ${isInstalled ? 'opacity: 0.8;' : ''}"
                        ${installBtnDisabled}
                        onclick="event.stopPropagation(); ${installAction}; this.parentElement.parentElement.parentElement.parentElement.remove();">
                        ${installBtnText}
                    </button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

// Helper function to install from registry key
function installCommunityAppByKey(registryKey) {
  const app = communityAppRegistry[registryKey];
  if (!app) {
    showToast('Error: App not found in registry', 'fa-exclamation-circle');
    console.error('App not found for registry key:', registryKey);
    return;
  }
  installCommunityApp(app);
}

async function installCommunityApp(app) {
  showToast(`Installing ${app.name}...`, 'fa-download');
  console.log(app.content)

  try {
    if (app.type === 'theme' || app.type === 'themes') {
      // Theme logic - assuming we just mark it as installed for now or would need to fetch CSS
      // The user prompt focuses on apps/games content installation.
      showToast(`${app.name} installed!`, 'fa-check');
      if (!installedThemes.includes(app.name)) {
        installedThemes.push(app.name);
        localStorage.setItem("nautilusOS_installedThemes", JSON.stringify(installedThemes));
      }
      refreshAppStore();
      return;
    }

    // App/Game installation
    let content = '';
    // If content is a path (starts with /), fetch it
    if (app.content && typeof app.content === 'string' && app.content.startsWith('/')) {
      const contentUrl = `https://cdn.jsdelivr.net/gh/nautilus-os/community@latest${app.content}`;
      const resp = await fetch(contentUrl);
      if (!resp.ok) throw new Error(`Failed to fetch content from ${contentUrl}`);
      content = await resp.text();
    } else {
      // Fallback or raw content if it was somehow inline (though user said it is a file path)
      content = app.content || '<div style="padding:2rem;">No content found.</div>';
    }

    const appId = app.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Save to localStorage
    const communityApps = JSON.parse(localStorage.getItem('nautilusOS_communityApps') || '{}');
    communityApps[appId] = {
      name: app.name,
      icon: app.icon || app.img || 'fas fa-box',
      content: content,
      author: app.author,
      type: 'community-app'
    };
    localStorage.setItem('nautilusOS_communityApps', JSON.stringify(communityApps));

    // Create desktop icon
    createDesktopIcon(appId, app.name, app.icon || app.img || 'fas fa-box');

    // Update global installedApps list just in case
    // Note: global installedApps array might not be persisted directly in all cases in this code base, 
    // but usually checking `nautilusOS_installedApps`
    // We'll rely on our custom registry `nautilusOS_communityApps`

    showToast(`${app.name} installed!`, 'fa-check');

    // Refresh UI to show "Uninstall"
    // We need to reload the metadata to reflect 'isInstalled'
    // This is tricky without a full reload, but refreshAppStore might help if it fetches again
    // For now, simple toast is good.
    refreshAppStore();

  } catch (e) {
    console.error("Installation failed", e);
    showToast(`Failed to install ${app.name}`, 'fa-times');
  }
}

// ================= DESKTOP SELECTION BOX =================

let selectionBox = {
  active: false,
  startX: 0,
  startY: 0,
  element: null
};

function enableDesktopSelection() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;

  // Create element if not exists
  if (!document.querySelector('.selection-box')) {
    const box = document.createElement('div');
    box.className = 'selection-box';
    document.body.appendChild(box);
    selectionBox.element = box;
  } else {
    selectionBox.element = document.querySelector('.selection-box');
  }

  desktop.addEventListener('mousedown', (e) => {
    // Return if clicking taskbar, or if NOT clicking desktop/icons/wallpaper
    // Allow start drag if target is desktop (ID), desktop-icons (class), or wallpaper
    if (e.target.closest('.taskbar') || e.target.closest('.start-menu') || e.target.closest('.window')) return;

    // If e.target is desktop, wallpaper, or desktop-icons container, allow.
    // Assuming .desktop-icons has pointer-events: auto, clicking empty space in it returns .desktop-icons as target.
    const isDesktop = e.target.id === 'desktop';
    const isWallpaper = e.target.closest('.wallpaper');
    const isDesktopIcons = e.target.classList.contains('desktop-icons');

    if (!isDesktop && !isWallpaper && !isDesktopIcons) return;

    selectionBox.active = true;
    selectionBox.startX = e.clientX;
    selectionBox.startY = e.clientY;

    selectionBox.element.style.left = e.clientX + 'px';
    selectionBox.element.style.top = e.clientY + 'px';
    selectionBox.element.style.width = '0px';
    selectionBox.element.style.height = '0px';
    selectionBox.element.style.display = 'block';
  });

  window.addEventListener('mousemove', (e) => {
    if (!selectionBox.active) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - selectionBox.startX);
    const height = Math.abs(currentY - selectionBox.startY);
    const left = Math.min(currentX, selectionBox.startX);
    const top = Math.min(currentY, selectionBox.startY);

    selectionBox.element.style.width = width + 'px';
    selectionBox.element.style.height = height + 'px';
    selectionBox.element.style.left = left + 'px';
    selectionBox.element.style.top = top + 'px';
  });

  window.addEventListener('mouseup', () => {
    if (selectionBox.active) {
      selectionBox.active = false;
      selectionBox.element.style.display = 'none';
    }
  });
}

// ================= TASKBAR SETTINGS =================

function updateTaskbarStyle() {
  const style = localStorage.getItem('nautilusOS_taskbarStyle') || 'floating';
  const taskbar = document.getElementById('taskbar');
  const startMenu = document.getElementById('startMenu');
  const desktop = document.getElementById('desktop');
  const systemTray = document.querySelector('.system-tray');

  if (taskbar) {
    if (style === 'full') {
      taskbar.classList.add('full');
      if (startMenu) startMenu.classList.add('full-mode');
      if (desktop) desktop.classList.add('full-taskbar-offset');
      if (systemTray) systemTray.classList.add('full-mode');
    } else {
      taskbar.classList.remove('full');
      if (startMenu) startMenu.classList.remove('full-mode');
      if (desktop) desktop.classList.remove('full-taskbar-offset');
      if (systemTray) systemTray.classList.remove('full-mode');
    }
  }
}

function toggleTaskbarStyle() {
  const current = localStorage.getItem('nautilusOS_taskbarStyle') || 'floating';
  const next = current === 'floating' ? 'full' : 'floating';
  localStorage.setItem('nautilusOS_taskbarStyle', next);
  updateTaskbarStyle();
  showToast(`Taskbar set to ${next}`, 'fa-cog');
}

// Add taskbar setting to Context Menu (Right Click on Taskbar)
// We'll hook into the global context menu or add a specific listener
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('#taskbar')) {
    e.preventDefault();
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = (e.pageY - 100) + 'px';

    const style = localStorage.getItem('nautilusOS_taskbarStyle') || 'floating';
    const nextLabel = style === 'floating' ? 'Switch to Full Mode' : 'Switch to Floating Mode';

    menu.innerHTML = `
            <div class="context-item" onclick="toggleTaskbarStyle()">
                <i class="fas fa-columns"></i> ${nextLabel}
            </div>
            <div class="context-item" onclick="openApp('settings')">
                <i class="fas fa-cog"></i> Taskbar Settings
            </div>
        `;

    // Close on click elsewhere (handled by existing main.js usually)
  }
});


// Init new features
enableDesktopSelection();
updateTaskbarStyle();
