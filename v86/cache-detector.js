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
        // Notification disabled - no longer showing V86 emulator update message
        return;
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
