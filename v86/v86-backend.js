/**
 * V86 Backend Implementation
 * Handles the core V86 emulator functionality with real V86 WASM
 */

class V86Backend {
    constructor() {
        this.emulator = null;
        this.isRunning = false;
        this.callbacks = {};
        this.wasmModule = null;
        this.startTime = null;
        this.performanceStats = {
            fps: 0,
            uptime: 0,
            lastFrameTime: 0,
            frameCount: 0
        };

        // Base64 resource cache
        this.resources = {
            wasm: null,
            seabios: null,
            vgabios: null
        };

        // Performance monitoring
        this.performanceInterval = null;
    }

    /**
     * Set callback functions for events
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Load WASM core - V86 library handles WASM loading internally
     */
    async loadWASMCore() {
        try {
            console.log('Preparing V86 WASM core...');

            // The WASM is loaded by libv86.mjs automatically
            // We just need to load the BIOS files
            await this.loadBIOSFiles();

            console.log('V86 resources loaded successfully');

            return true;

        } catch (error) {
            console.error('Failed to load V86 resources:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('RESOURCE_LOAD_FAILED', error.message);
            }
            throw error;
        }
    }

    /**
     * Load BIOS files from real binary files
     */
    async loadBIOSFiles() {
        try {
            console.log('Loading BIOS files from real binary files...');

            // Load SeaBIOS (real binary file)
            const seabiosResponse = await fetch('v86/bios.bin-1.10.0');
            if (seabiosResponse.ok) {
                this.resources.seabios = await seabiosResponse.arrayBuffer();
                console.log(`SeaBIOS loaded: ${this.resources.seabios.byteLength} bytes`);
            } else {
                throw new Error('SeaBIOS not found at v86/bios.bin-1.10.0');
            }

            // Load VGA BIOS (real binary file)
            const vgabiosResponse = await fetch('v86/VGABIOS-lgpl-latest.bin');
            if (vgabiosResponse.ok) {
                this.resources.vgabios = await vgabiosResponse.arrayBuffer();
                console.log(`VGA BIOS loaded: ${this.resources.vgabios.byteLength} bytes`);
            } else {
                throw new Error('VGA BIOS not found at v86/VGABIOS-lgpl-latest.bin');
            }

        } catch (error) {
            console.error('Failed to load BIOS files:', error);
            throw error;
        }
    }

    /**
     * Convert base64 string to ArrayBuffer (kept for compatibility)
     */
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Initialize emulator with configuration
     */
    async initializeEmulator(config) {
        try {
            console.log('Initializing V86 emulator with config:', config);

            if (this.emulator) {
                console.log('Emulator already initialized, skipping...');
                return true;
            }

            // WASM is loaded by libv86.mjs automatically

            // Validate screen container reference
            if (!config.screen_container) {
                throw new Error('screen_container is required but not provided');
            }
            
            // Find the canvas element within the container
            const canvasElement = config.screen_container.querySelector ? 
                config.screen_container.querySelector('canvas') : 
                (config.screen_container.tagName === 'CANVAS' ? config.screen_container : null);
            
            if (!canvasElement) {
                throw new Error('No canvas element found in screen_container');
            }
            
            // Store the canvas element for our own use
            this.screen_container = canvasElement;

            // Debug container and canvas element before passing to V86
            console.log('V86 container details:', {
                container: config.screen_container,
                containerTag: config.screen_container.tagName,
                canvasElement: canvasElement,
                canvasId: canvasElement.id,
                canvasConnected: canvasElement.isConnected,
                hasGetContext: typeof canvasElement.getContext === 'function',
                width: canvasElement.width,
                height: canvasElement.height
            });

            // Create V86 configuration using real binary files
            // IMPORTANT: Pass the canvas container (not screen wrapper) so V86's positioning is contained
            const canvasContainer = config.screen_container.querySelector('.v86-canvas-container') || config.screen_container;
            
            const v86Config = {
                wasm_path: 'v86/v86.wasm',
                memory_size: config.memory_size || 128 * 1024 * 1024,
                vga_memory_size: config.vga_memory_size || 8 * 1024 * 1024,
                screen_container: canvasContainer, // Pass the canvas container so V86's positioning is contained
                bios: {
                    url: 'v86/bios.bin-1.10.0'
                },
                vga_bios: {
                    url: 'v86/VGABIOS-lgpl-latest.bin'
                },
                boot_order: config.boot_order || 0x213,
                autostart: false,
                disable_keyboard: false,
                disable_mouse: false,
                acpi: true,
                load_devices: true,
                fastboot: false,
                // Fix display bounds by setting proper VGA mode
                vga_memory_size: config.vga_memory_size || 16 * 1024 * 1024, // Increase VGA memory for better resolution support
                // Force specific screen dimensions to prevent edge positioning
                screen_dummy: false,
                // Ensure proper VGA initialization
                initial_state: undefined,
                // Enable network access through CORS proxy
                network_relay_url: config.network_relay_url || 'wss://relay.widgetry.org/',
                // Preserve MAC address for consistent networking
                preserve_mac_from_state_image: true
            };
            
            console.log('V86 Network Configuration:', {
                network_relay_url: v86Config.network_relay_url,
                network_enabled: true
            });

            // Add disk image if provided
            if (config.cdrom) {
                v86Config.cdrom = config.cdrom;
            }

            if (config.hda) {
                v86Config.hda = config.hda;
            }

            if (config.fda) {
                v86Config.fda = config.fda;
            }

            // Check if V86 is available (from real V86 library)
            if (typeof window.V86 === 'undefined' && typeof V86 === 'undefined') {
                throw new Error('V86 not found. Make sure libv86.mjs is loaded.');
            }

            // Use the real V86 from libv86.mjs
            const V86Class = window.V86 || V86;
            
            console.log('V86 class details:', {
                V86Class: V86Class,
                type: typeof V86Class,
                windowV86: window.V86,
                globalV86: typeof V86 !== 'undefined' ? V86 : 'undefined'
            });

            // Create the real V86 emulator instance
            console.log('Creating V86 instance with real V86 library...');
            console.log('V86 config:', v86Config);
            this.emulator = new V86Class(v86Config);

            // Wait for V86 to be fully initialized
            await new Promise((resolve, reject) => {
                const checkInitialized = () => {
                    if (this.emulator.v86) {
                        resolve();
                    } else {
                        setTimeout(checkInitialized, 100);
                    }
                };
                
                // Also listen for emulator-loaded event
                this.emulator.add_listener('emulator-loaded', resolve);
                
                // Start checking
                checkInitialized();
                
                // Timeout after 30 seconds
                setTimeout(() => reject(new Error('V86 initialization timeout')), 30000);
            });

            // Set up event listeners
            this.setupEventListeners();

            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('initialized');
            }

            console.log('V86 emulator initialized successfully');
            return true;

        } catch (error) {
            console.error('Failed to initialize V86 emulator:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('INIT_FAILED', error.message);
            }
            throw error;
        }
    }

    /**
     * Setup event listeners for the emulator
     */
    setupEventListeners() {
        if (!this.emulator) return;

        // Screen update events
        this.emulator.add_listener('screen-put-pixel', () => {
            if (this.callbacks.onScreenUpdate) {
                // Get screen data from canvas
                const canvas = this.emulator.screen_container;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    this.callbacks.onScreenUpdate(imageData);
                }
            }
        });

        // Serial output
        this.emulator.add_listener('serial0-output-char', (char) => {
            console.log('Serial output:', String.fromCharCode(char));
        });

        // Emulator ready
        this.emulator.add_listener('emulator-ready', () => {
            console.log('V86 emulator ready');
            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('ready');
            }
        });

        // Emulator started
        this.emulator.add_listener('emulator-started', () => {
            console.log('V86 emulator started');
            this.isRunning = true;
            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('running');
            }
        });

        // Emulator stopped
        this.emulator.add_listener('emulator-stopped', () => {
            console.log('V86 emulator stopped');
            this.isRunning = false;
            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('stopped');
            }
        });
    }

    /**
     * Start emulator execution
     */
    async start() {
        try {
            if (!this.emulator) {
                throw new Error('Emulator not initialized');
            }

            console.log('Starting V86 emulator...');

            this.startTime = Date.now();

            // Start the emulator
            await this.emulator.run();

            this.isRunning = true;

            // Start performance monitoring
            this.startPerformanceMonitoring();

            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('running');
            }

            console.log('V86 emulator started successfully');
            return true;

        } catch (error) {
            console.error('Failed to start V86 emulator:', error);
            this.isRunning = false;
            if (this.callbacks.onError) {
                this.callbacks.onError('START_FAILED', error.message);
            }
            throw error;
        }
    }

    /**
     * Stop emulator execution
     */
    async stop() {
        try {
            if (!this.isRunning) {
                return true;
            }

            console.log('Stopping V86 emulator...');

            this.isRunning = false;

            // Stop performance monitoring
            this.stopPerformanceMonitoring();

            // Stop the emulator
            if (this.emulator && this.emulator.stop) {
                await this.emulator.stop();
            }

            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('stopped');
            }

            console.log('V86 emulator stopped successfully');
            return true;

        } catch (error) {
            console.error('Failed to stop V86 emulator:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('STOP_FAILED', error.message);
            }
            throw error;
        }
    }

    /**
     * Reset emulator
     */
    async reset() {
        try {
            console.log('Resetting V86 emulator...');

            if (this.emulator && this.emulator.restart) {
                await this.emulator.restart();
            }

            // Reset performance stats
            this.performanceStats = {
                fps: 0,
                uptime: 0,
                lastFrameTime: 0,
                frameCount: 0
            };
            this.startTime = Date.now();

            if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('reset');
            }

            console.log('V86 emulator reset successfully');
            return true;

        } catch (error) {
            console.error('Failed to reset V86 emulator:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('RESET_FAILED', error.message);
            }
            throw error;
        }
    }

    /**
     * Send keyboard event to emulator
     */
    sendKeyboardEvent(keyCode, isKeyDown) {
        if (!this.isRunning || !this.emulator) return;

        try {
            // Convert keyCode to scancode
            const scancode = this.keyCodeToScancode(keyCode);
            if (scancode) {
                const scancodes = isKeyDown ? [scancode] : [scancode | 0x80];
                this.emulator.keyboard_send_scancodes(scancodes);
            }
        } catch (error) {
            console.error('Failed to send keyboard event:', error);
        }
    }

    /**
     * Send mouse event to emulator
     */
    sendMouseEvent(x, y, buttons) {
        if (!this.isRunning || !this.emulator) return;

        try {
            // Send mouse event to emulator
            if (this.emulator.mouse_send_click) {
                this.emulator.mouse_send_click(x, y, buttons);
            }
        } catch (error) {
            console.error('Failed to send mouse event:', error);
        }
    }

    /**
     * Get screen data for display
     */
    getScreenData() {
        if (!this.screen_container) return null;

        try {
            // this.screen_container is the canvas element
            const canvas = this.screen_container;
            const ctx = canvas.getContext('2d');

            if (!ctx) return null;

            // Get the current canvas content as ImageData
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return imageData;
        } catch (error) {
            console.error('Failed to get screen data:', error);
            return null;
        }
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        if (this.startTime) {
            this.performanceStats.uptime = Math.floor((Date.now() - this.startTime) / 1000);
        }

        return { ...this.performanceStats };
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceStats();
        }, 1000);
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
            this.performanceInterval = null;
        }
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const now = Date.now();

        // Update frame count and FPS
        this.performanceStats.frameCount++;

        if (this.performanceStats.lastFrameTime) {
            const deltaTime = now - this.performanceStats.lastFrameTime;
            if (deltaTime >= 1000) {
                this.performanceStats.fps = Math.round(
                    (this.performanceStats.frameCount * 1000) / deltaTime
                );
                this.performanceStats.frameCount = 0;
                this.performanceStats.lastFrameTime = now;
            }
        } else {
            this.performanceStats.lastFrameTime = now;
        }

        // Update uptime
        if (this.startTime) {
            this.performanceStats.uptime = Math.floor((now - this.startTime) / 1000);
        }
    }

    /**
     * Convert JavaScript keyCode to PC scancode
     */
    keyCodeToScancode(keyCode) {
        const scancodeMap = {
            8: 0x0E,   // Backspace
            9: 0x0F,   // Tab
            13: 0x1C,  // Enter
            16: 0x2A,  // Shift
            17: 0x1D,  // Ctrl
            18: 0x38,  // Alt
            27: 0x01,  // Escape
            32: 0x39,  // Space
            37: 0x4B,  // Left Arrow
            38: 0x48,  // Up Arrow
            39: 0x4D,  // Right Arrow
            40: 0x50,  // Down Arrow
            65: 0x1E,  // A
            66: 0x30,  // B
            67: 0x2E,  // C
            68: 0x20,  // D
            69: 0x12,  // E
            70: 0x21,  // F
            71: 0x22,  // G
            72: 0x23,  // H
            73: 0x17,  // I
            74: 0x24,  // J
            75: 0x25,  // K
            76: 0x26,  // L
            77: 0x32,  // M
            78: 0x31,  // N
            79: 0x18,  // O
            80: 0x19,  // P
            81: 0x10,  // Q
            82: 0x13,  // R
            83: 0x1F,  // S
            84: 0x14,  // T
            85: 0x16,  // U
            86: 0x2F,  // V
            87: 0x11,  // W
            88: 0x2D,  // X
            89: 0x15,  // Y
            90: 0x2C   // Z
        };

        return scancodeMap[keyCode] || null;
    }

    /**
     * Save emulator state
     */
    async saveState() {
        if (!this.emulator || !this.emulator.save_state) {
            throw new Error('Emulator not initialized or save_state not available');
        }

        try {
            const state = await this.emulator.save_state();
            console.log('Emulator state saved');
            return state;
        } catch (error) {
            console.error('Failed to save state:', error);
            throw error;
        }
    }

    /**
     * Restore emulator state
     */
    async restoreState(state) {
        if (!this.emulator || !this.emulator.restore_state) {
            throw new Error('Emulator not initialized or restore_state not available');
        }

        try {
            await this.emulator.restore_state(state);
            console.log('Emulator state restored');
        } catch (error) {
            console.error('Failed to restore state:', error);
            throw error;
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        try {
            console.log('Starting V86 backend cleanup...');

            // Stop emulator if running
            if (this.isRunning) {
                this.isRunning = false;
            }

            // Stop performance monitoring
            this.stopPerformanceMonitoring();

            // Destroy emulator instance
            if (this.emulator && this.emulator.destroy) {
                this.emulator.destroy();
            }

            // Clear resources
            this.emulator = null;
            this.wasmModule = null;

            // Clear resource cache
            this.resources = {
                wasm: null,
                seabios: null,
                vgabios: null
            };

            // Clear callbacks
            this.callbacks = {};

            console.log('V86 backend cleanup completed');

        } catch (error) {
            console.error('Error during V86 backend cleanup:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = V86Backend;
} else if (typeof window !== 'undefined') {
    window.V86Backend = V86Backend;
}
