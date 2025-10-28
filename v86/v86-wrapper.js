/**
 * V86 Wrapper - Helper utilities for V86
 * Provides additional functionality on top of the real V86Starter
 */

// Don't redefine V86Starter - it comes from libv86.js
// This wrapper provides additional utilities

class V86StarterWrapper {
    constructor(options = {}) {
        this.options = options;
        this.backend = null;
        this.frontend = null;
        this.isInitialized = false;
        this.isRunning = false;
        
        // Event listeners
        this.listeners = new Map();
        
        // Configuration with defaults
        this.config = {
            memory_size: options.memory_size || 128 * 1024 * 1024,
            vga_memory_size: options.vga_memory_size || 8 * 1024 * 1024,
            screen_container: options.screen_container,
            bios: options.bios,
            vga_bios: options.vga_bios,
            cdrom: options.cdrom,
            hda: options.hda,
            fda: options.fda,
            boot_order: options.boot_order || 0x213,
            autostart: options.autostart || false,
            wasm_path: options.wasm_path,
            wasm_fn: options.wasm_fn
        };
        
        // Initialize if autostart is enabled
        if (this.config.autostart) {
            this.initialize();
        }
    }

    /**
     * Initialize the emulator
     */
    async initialize() {
        if (this.isInitialized) {
            return Promise.resolve();
        }

        try {
            console.log('Initializing V86Starter with options:', this.options);
            
            // Create backend instance
            this.backend = new V86Backend();
            
            // Set up event callbacks
            this.backend.setCallbacks({
                onScreenUpdate: (imageData) => this.handleScreenUpdate(imageData),
                onStateChange: (state) => this.handleStateChange(state),
                onError: (type, message) => this.handleError(type, message)
            });
            
            // Load WASM core
            await this.backend.loadWASMCore();
            
            // Initialize emulator with configuration
            await this.backend.initializeEmulator(this.config);
            
            this.isInitialized = true;
            
            // Auto-start if configured
            if (this.config.autostart) {
                await this.run();
            }
            
            console.log('V86Starter initialized successfully');
            return Promise.resolve();
            
        } catch (error) {
            console.error('Failed to initialize V86Starter:', error);
            throw error;
        }
    }

    /**
     * Start/resume emulation
     */
    async run() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isRunning) {
            return Promise.resolve();
        }

        try {
            await this.backend.start();
            this.isRunning = true;
            this.emit('emulator-started');
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to start emulation:', error);
            throw error;
        }
    }

    /**
     * Stop/pause emulation
     */
    async stop() {
        if (!this.isRunning) {
            return Promise.resolve();
        }

        try {
            await this.backend.stop();
            this.isRunning = false;
            this.emit('emulator-stopped');
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to stop emulation:', error);
            throw error;
        }
    }

    /**
     * Restart emulation
     */
    async restart() {
        try {
            await this.backend.reset();
            this.emit('emulator-restarted');
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to restart emulation:', error);
            throw error;
        }
    }

    /**
     * Save emulator state
     */
    async save_state() {
        if (!this.backend || !this.isInitialized) {
            throw new Error('Emulator not initialized');
        }

        try {
            const state = await this.backend.saveState();
            return state;
        } catch (error) {
            console.error('Failed to save state:', error);
            throw error;
        }
    }

    /**
     * Restore emulator state
     */
    async restore_state(state) {
        if (!this.backend || !this.isInitialized) {
            throw new Error('Emulator not initialized');
        }

        try {
            await this.backend.restoreState(state);
            this.emit('state-restored');
            return Promise.resolve();
        } catch (error) {
            console.error('Failed to restore state:', error);
            throw error;
        }
    }

    /**
     * Send keyboard scancodes
     */
    keyboard_send_scancodes(scancodes) {
        if (!this.backend || !this.isRunning) {
            return;
        }

        try {
            // Convert scancodes to key events
            scancodes.forEach(scancode => {
                const isKeyDown = (scancode & 0x80) === 0;
                const keyCode = this.scancodeToKeyCode(scancode & 0x7F);
                if (keyCode) {
                    this.backend.sendKeyboardEvent(keyCode, isKeyDown);
                }
            });
        } catch (error) {
            console.error('Failed to send keyboard scancodes:', error);
        }
    }

    /**
     * Send mouse click
     */
    mouse_send_click(x, y, button) {
        if (!this.backend || !this.isRunning) {
            return;
        }

        try {
            const buttons = 1 << button;
            this.backend.sendMouseEvent(x, y, buttons);
            
            // Send release event after a short delay
            setTimeout(() => {
                this.backend.sendMouseEvent(x, y, 0);
            }, 50);
        } catch (error) {
            console.error('Failed to send mouse click:', error);
        }
    }

    /**
     * Send data to serial port
     */
    serial0_send(data) {
        if (!this.backend || !this.isRunning) {
            return;
        }

        try {
            this.backend.serialSend(0, data);
            this.emit('serial0-output-char', data);
        } catch (error) {
            console.error('Failed to send serial data:', error);
        }
    }

    /**
     * Add event listener
     */
    add_listener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    remove_listener(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Handle screen updates from backend
     */
    handleScreenUpdate(imageData) {
        if (this.config.screen_container && imageData) {
            try {
                const canvas = this.config.screen_container;
                const ctx = canvas.getContext('2d');
                
                // Update canvas dimensions if needed
                if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
                    canvas.width = imageData.width;
                    canvas.height = imageData.height;
                }
                
                // Draw the image data
                ctx.putImageData(imageData, 0, 0);
                
                this.emit('screen-put-pixel', imageData);
            } catch (error) {
                console.error('Failed to update screen:', error);
            }
        }
    }

    /**
     * Handle state changes from backend
     */
    handleStateChange(state) {
        console.log('V86Starter state change:', state);
        
        switch (state) {
            case 'running':
                this.isRunning = true;
                this.emit('emulator-started');
                break;
            case 'stopped':
                this.isRunning = false;
                this.emit('emulator-stopped');
                break;
            case 'reset':
                this.emit('emulator-restarted');
                break;
        }
    }

    /**
     * Handle errors from backend
     */
    handleError(type, message) {
        console.error(`V86Starter error [${type}]:`, message);
        this.emit('emulator-error', { type, message });
    }

    /**
     * Convert scancode to JavaScript keyCode
     */
    scancodeToKeyCode(scancode) {
        const keycodeMap = {
            0x01: 27,  // Escape
            0x0E: 8,   // Backspace
            0x0F: 9,   // Tab
            0x1C: 13,  // Enter
            0x2A: 16,  // Shift
            0x1D: 17,  // Ctrl
            0x38: 18,  // Alt
            0x39: 32,  // Space
            0x4B: 37,  // Left Arrow
            0x48: 38,  // Up Arrow
            0x4D: 39,  // Right Arrow
            0x50: 40,  // Down Arrow
            0x1E: 65,  // A
            0x30: 66,  // B
            0x2E: 67,  // C
            0x20: 68,  // D
            0x12: 69,  // E
            0x21: 70,  // F
            0x22: 71,  // G
            0x23: 72,  // H
            0x17: 73,  // I
            0x24: 74,  // J
            0x25: 75,  // K
            0x26: 76,  // L
            0x32: 77,  // M
            0x31: 78,  // N
            0x18: 79,  // O
            0x19: 80,  // P
            0x10: 81,  // Q
            0x13: 82,  // R
            0x1F: 83,  // S
            0x14: 84,  // T
            0x16: 85,  // U
            0x2F: 86,  // V
            0x11: 87,  // W
            0x2D: 88,  // X
            0x15: 89,  // Y
            0x2C: 90   // Z
        };
        
        return keycodeMap[scancode] || null;
    }

    /**
     * Get current emulator state
     */
    get_state() {
        return {
            running: this.isRunning,
            initialized: this.isInitialized,
            config: this.config
        };
    }

    /**
     * Destroy the emulator instance
     */
    destroy() {
        try {
            console.log('Destroying V86Starter instance...');
            
            // Stop emulation
            if (this.isRunning) {
                this.stop();
            }
            
            // Cleanup backend
            if (this.backend) {
                this.backend.cleanup();
                this.backend = null;
            }
            
            // Clear listeners
            this.listeners.clear();
            
            // Reset state
            this.isInitialized = false;
            this.isRunning = false;
            
            console.log('V86Starter instance destroyed');
            
        } catch (error) {
            console.error('Error destroying V86Starter:', error);
        }
    }
}

/**
 * V86 Wrapper class for additional compatibility
 */
class V86Wrapper {
    constructor() {
        this.instances = new Map();
        this.resourceCache = new Map();
    }

    /**
     * Create a new V86 instance
     */
    createInstance(containerId, options = {}) {
        if (this.instances.has(containerId)) {
            console.warn(`V86 instance already exists for container: ${containerId}`);
            return this.instances.get(containerId);
        }

        try {
            const instance = new V86Starter(options);
            this.instances.set(containerId, instance);
            
            console.log(`Created V86 instance for container: ${containerId}`);
            return instance;
            
        } catch (error) {
            console.error(`Failed to create V86 instance for ${containerId}:`, error);
            throw error;
        }
    }

    /**
     * Get existing V86 instance
     */
    getInstance(containerId) {
        return this.instances.get(containerId) || null;
    }

    /**
     * Destroy V86 instance
     */
    destroyInstance(containerId) {
        const instance = this.instances.get(containerId);
        if (instance) {
            try {
                instance.destroy();
                this.instances.delete(containerId);
                console.log(`Destroyed V86 instance for container: ${containerId}`);
            } catch (error) {
                console.error(`Error destroying V86 instance for ${containerId}:`, error);
            }
        }
    }

    /**
     * Destroy all instances
     */
    destroyAllInstances() {
        for (const [containerId, instance] of this.instances) {
            try {
                instance.destroy();
            } catch (error) {
                console.error(`Error destroying instance ${containerId}:`, error);
            }
        }
        this.instances.clear();
        console.log('All V86 instances destroyed');
    }

    /**
     * Get resource from cache or load it
     */
    async getResource(url, type = 'arraybuffer') {
        const cacheKey = `${url}:${type}`;
        
        if (this.resourceCache.has(cacheKey)) {
            return this.resourceCache.get(cacheKey);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load resource: ${response.status}`);
            }

            let resource;
            switch (type) {
                case 'arraybuffer':
                    resource = await response.arrayBuffer();
                    break;
                case 'text':
                    resource = await response.text();
                    break;
                case 'json':
                    resource = await response.json();
                    break;
                default:
                    resource = await response.arrayBuffer();
            }

            this.resourceCache.set(cacheKey, resource);
            return resource;

        } catch (error) {
            console.error(`Failed to load resource ${url}:`, error);
            throw error;
        }
    }

    /**
     * Clear resource cache
     */
    clearResourceCache() {
        this.resourceCache.clear();
        console.log('V86 resource cache cleared');
    }

    /**
     * Get memory usage statistics
     */
    getMemoryUsage() {
        const stats = {
            instances: this.instances.size,
            totalMemory: 0,
            cacheSize: this.resourceCache.size
        };

        for (const instance of this.instances.values()) {
            if (instance.config && instance.config.memory_size) {
                stats.totalMemory += instance.config.memory_size;
            }
        }

        return stats;
    }
}

// Create global wrapper instance
const v86Wrapper = new V86Wrapper();

// Export classes and global instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { V86StarterWrapper, V86Wrapper, v86Wrapper };
} else if (typeof window !== 'undefined') {
    window.V86StarterWrapper = V86StarterWrapper;
    window.V86Wrapper = V86Wrapper;
    window.v86Wrapper = v86Wrapper;
}