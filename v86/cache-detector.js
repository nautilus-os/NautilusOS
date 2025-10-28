/**
 * V86 Cache Detector
 * Detects when old cached V86 files might be causing issues
 */

(function() {
    'use strict';
    
    // Version of the current V86 implementation
    const CURRENT_V86_VERSION = '2.0.0';
    const VERSION_KEY = 'v86_implementation_version';
    
    /**
     * Check if V86 implementation has been updated
     */
    function checkV86Version() {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        
        if (!storedVersion || storedVersion !== CURRENT_V86_VERSION) {
            console.log(`V86 version mismatch: stored=${storedVersion}, current=${CURRENT_V86_VERSION}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Update stored V86 version
     */
    function updateV86Version() {
        localStorage.setItem(VERSION_KEY, CURRENT_V86_VERSION);
        console.log(`V86 version updated to ${CURRENT_V86_VERSION}`);
    }
    
    /**
     * Show cache clear notification
     */
    function showCacheClearNotification() {
        // Check if we've already shown this notification
        const notificationShown = sessionStorage.getItem('v86_cache_notification_shown');
        if (notificationShown) {
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'v86-cache-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <style>
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                #v86-cache-notification h3 {
                    margin: 0 0 10px 0;
                    color: #856404;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #v86-cache-notification p {
                    margin: 0 0 15px 0;
                    color: #856404;
                    font-size: 14px;
                    line-height: 1.5;
                }
                #v86-cache-notification .buttons {
                    display: flex;
                    gap: 10px;
                }
                #v86-cache-notification button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                #v86-cache-notification .btn-primary {
                    background: #ffc107;
                    color: #000;
                }
                #v86-cache-notification .btn-primary:hover {
                    background: #e0a800;
                }
                #v86-cache-notification .btn-secondary {
                    background: #6c757d;
                    color: #fff;
                }
                #v86-cache-notification .btn-secondary:hover {
                    background: #5a6268;
                }
                #v86-cache-notification .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #856404;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    line-height: 1;
                }
            </style>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
            <h3>
                <span style="font-size: 20px;">⚠️</span>
                V86 Emulator Updated
            </h3>
            <p>
                The V86 emulator has been updated. If you experience errors like 
                <strong>"run is not a function"</strong>, please clear your browser cache.
            </p>
            <div class="buttons">
                <button class="btn-primary" onclick="v86CacheDetector.hardRefresh()">
                    Refresh Now
                </button>
                <button class="btn-secondary" onclick="v86CacheDetector.openClearCachePage()">
                    Clear Cache
                </button>
                <button class="btn-secondary" onclick="v86CacheDetector.dismissNotification()">
                    Dismiss
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mark notification as shown
        sessionStorage.setItem('v86_cache_notification_shown', 'true');
    }
    
    /**
     * Hard refresh the page
     */
    function hardRefresh() {
        window.location.reload(true);
    }
    
    /**
     * Open clear cache page
     */
    function openClearCachePage() {
        window.open('v86/clear-cache.html', '_blank');
    }
    
    /**
     * Dismiss notification and update version
     */
    function dismissNotification() {
        const notification = document.getElementById('v86-cache-notification');
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
        updateV86Version();
    }
    
    /**
     * Detect if old V86 files are loaded
     */
    function detectOldV86Files() {
        // Check for old global variables that shouldn't exist
        const oldGlobals = [
            'V86Loader',
            'V86EmulatorInstance'
        ];
        
        for (const globalName of oldGlobals) {
            if (typeof window[globalName] !== 'undefined') {
                console.warn(`Detected old V86 global: ${globalName}`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Initialize cache detector
     */
    function initialize() {
        // Check version on page load
        const versionMatch = checkV86Version();
        const oldFilesDetected = detectOldV86Files();
        
        if (!versionMatch || oldFilesDetected) {
            console.log('V86 cache issue detected, showing notification...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showCacheClearNotification);
            } else {
                showCacheClearNotification();
            }
        } else {
            console.log('V86 version check passed');
        }
        
        // Listen for V86 errors
        window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('run is not a function')) {
                console.error('Detected V86 cache error:', event.message);
                showCacheClearNotification();
            }
        });
    }
    
    // Export public API
    window.v86CacheDetector = {
        checkVersion: checkV86Version,
        updateVersion: updateV86Version,
        hardRefresh: hardRefresh,
        openClearCachePage: openClearCachePage,
        dismissNotification: dismissNotification,
        showNotification: showCacheClearNotification
    };
    
    // Auto-initialize
    initialize();
    
})();
