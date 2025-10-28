/**
 * V86 Frontend Interface
 * Provides user interface for emulator control and display
 */

class V86Frontend {
    constructor(container) {
        this.container = container;
        this.containerId = container ? container.id : null;
        this.canvas = null;
        this.controlPanel = null;
        this.statusDisplay = null;
        this.emulatorState = 'stopped'; // stopped, starting, running, error
        this.backend = null;
        this.emulatorInstance = null;
        
        // Input handling
        this.keyboardCaptured = false;
        this.mouseCaptured = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.mouseButtons = 0;
        this.inputFocused = false;
        this.preventNautilusOSConflicts = true;
        
        // Screen update handling
        this.screenUpdateInterval = null;
        this.lastScreenUpdate = 0;
        
        // Configuration
        this.config = {
            memory_size: 128 * 1024 * 1024, // 128MB
            vga_memory_size: 8 * 1024 * 1024, // 8MB
            boot_order: 0x213, // CD, Floppy, HDD
            autostart: false
        };
    }

    /**
     * Initialize the frontend interface
     */
    async initialize() {
        if (!this.container) {
            throw new Error(`Container element not provided`);
        }

        this.createInterface();
        
        // Wait a bit for DOM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify canvas is properly initialized
        if (!this.canvas || !this.canvas.isConnected) {
            throw new Error('Canvas element not properly initialized or connected to DOM');
        }
        
        // Test that the screen wrapper can find the canvas (like V86 library will)
        const testCanvas = this.screenWrapper ? this.screenWrapper.querySelector('canvas') : null;
        if (!testCanvas) {
            throw new Error('Canvas element not found in screen wrapper - V86 library will fail');
        }
        console.log('Canvas accessibility test passed - V86 library should find the canvas');
        
        this.setupEventListeners();
        
        // Load backend resources
        try {
            await this.loadBackend();
        } catch (error) {
            this.showError(typeof V86ResourceManager !== 'undefined' ? V86ResourceManager.handleLoadError(error) : error.message);
        }
    }

    /**
     * Create the user interface elements
     */
    createInterface() {
        this.container.innerHTML = `
            <div class="v86-emulator">
                <div class="v86-toolbar">
                    <div class="v86-controls">
                        <button id="v86-start" class="v86-btn v86-btn-primary" disabled>
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button id="v86-stop" class="v86-btn v86-btn-secondary" disabled>
                            <i class="fas fa-stop"></i> Stop
                        </button>
                        <button id="v86-reset" class="v86-btn v86-btn-warning" disabled>
                            <i class="fas fa-redo"></i> Reset
                        </button>
                        <button id="v86-fullscreen" class="v86-btn v86-btn-secondary">
                            <i class="fas fa-expand"></i> Fullscreen
                        </button>
                    </div>
                    <div class="v86-status" id="v86-status">
                        <div class="v86-status-main">
                            <span class="v86-status-text">Initializing...</span>
                            <div class="v86-status-indicator v86-status-loading"></div>
                        </div>
                        <div class="v86-performance" id="v86-performance" style="display: none;">
                            <span class="v86-perf-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <span id="v86-fps">0</span> FPS
                            </span>
                            <span class="v86-perf-item">
                                <i class="fas fa-clock"></i>
                                <span id="v86-uptime">0s</span>
                            </span>
                            <span class="v86-perf-item">
                                <i class="fas fa-memory"></i>
                                <span id="v86-memory-usage">0</span> MB
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="v86-display-container" id="v86-display-container">
                    <div class="v86-screen-wrapper">
                        <div class="v86-canvas-container">
                            <canvas id="v86-screen" class="v86-screen" width="800" height="600"></canvas>
                            <div class="v86-text-mode"></div>
                        </div>
                        <div class="v86-screen-controls">
                            <button id="v86-scale-fit" class="v86-scale-btn active" title="Fit to window">
                                <i class="fas fa-compress-arrows-alt"></i>
                            </button>
                            <button id="v86-scale-100" class="v86-scale-btn" title="100% scale">
                                <i class="fas fa-search"></i>
                            </button>
                            <button id="v86-scale-200" class="v86-scale-btn" title="200% scale">
                                <i class="fas fa-search-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="v86-overlay" id="v86-overlay">
                        <div class="v86-overlay-content">
                            <i class="fas fa-microchip v86-overlay-icon"></i>
                            <h3>V86 Emulator</h3>
                            <p id="v86-overlay-message">Click Start to begin emulation</p>
                        </div>
                    </div>
                </div>
                
                <div class="v86-config-panel" id="v86-config">
                    <div class="v86-config-header">
                        <h4><i class="fas fa-cog"></i> Configuration</h4>
                        <button id="v86-config-toggle" class="v86-btn v86-btn-small">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                    </div>
                    <div class="v86-config-content">
                        <div class="v86-config-row">
                            <label>Memory (MB):</label>
                            <select id="v86-memory">
                                <option value="64">64 MB</option>
                                <option value="128" selected>128 MB</option>
                                <option value="256">256 MB</option>
                                <option value="512">512 MB</option>
                            </select>
                        </div>
                        <div class="v86-config-row">
                            <label>Boot Order:</label>
                            <select id="v86-boot-order" title="Boot device priority order">
                                <option value="0x213" selected>CD-ROM, Floppy, HDD (Recommended for ISO)</option>
                                <option value="0x123">Floppy, HDD, CD-ROM</option>
                                <option value="0x321">HDD, CD-ROM, Floppy</option>
                            </select>
                        </div>
                        <div class="v86-config-row">
                            <label>ISO/Disk Image:</label>
                            <input type="file" id="v86-disk-file" accept=".iso,.img,.bin" title="Select an ISO file or disk image to boot from">
                            <small class="v86-help-text">Select an ISO file (CD/DVD image) or disk image to boot from</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Get references to elements within the container
        this.canvas = this.container.querySelector('#v86-screen');
        this.statusDisplay = this.container.querySelector('#v86-status');
        this.overlay = this.container.querySelector('#v86-overlay');
        this.configPanel = this.container.querySelector('#v86-config');
        this.displayContainer = this.container.querySelector('#v86-display-container');
        this.screenWrapper = this.displayContainer ? this.displayContainer.querySelector('.v86-screen-wrapper') : null;
        this.canvasContainer = this.displayContainer ? this.displayContainer.querySelector('.v86-canvas-container') : null;
        
        // Validate canvas element
        if (!this.canvas) {
            throw new Error('Canvas element #v86-screen not found in container');
        }
        if (typeof this.canvas.getContext !== 'function') {
            throw new Error('Canvas element does not have getContext method');
        }
        
        // Initialize display scaling
        this.currentScale = 'fit';
        this.aspectRatio = 4/3; // Default 800x600 aspect ratio
        this.resizeTimeout = null;
        
        // Initialize performance monitoring
        this.performanceInterval = null;
        
        // Set initial screen scale and ensure DOM is ready
        setTimeout(() => {
            this.updateScreenScale();
            // Ensure canvas is properly connected to DOM
            if (this.canvas && !this.canvas.isConnected) {
                console.warn('Canvas element not connected to DOM, waiting...');
                setTimeout(() => {
                    if (!this.canvas.isConnected) {
                        console.error('Canvas element still not connected to DOM after delay');
                    }
                }, 500);
            }
        }, 100);
    }

    /**
     * Set up event listeners for controls
     */
    setupEventListeners() {
        // Control buttons
        document.getElementById('v86-start').addEventListener('click', () => this.startEmulation());
        document.getElementById('v86-stop').addEventListener('click', () => this.stopEmulation());
        document.getElementById('v86-reset').addEventListener('click', () => this.resetEmulation());
        document.getElementById('v86-fullscreen').addEventListener('click', () => this.toggleFullscreen());
        
        // Screen scaling controls
        document.getElementById('v86-scale-fit').addEventListener('click', () => this.setScreenScale('fit'));
        document.getElementById('v86-scale-100').addEventListener('click', () => this.setScreenScale('100'));
        document.getElementById('v86-scale-200').addEventListener('click', () => this.setScreenScale('200'));
        
        // Configuration toggle
        document.getElementById('v86-config-toggle').addEventListener('click', () => this.toggleConfig());
        
        // Configuration changes
        document.getElementById('v86-memory').addEventListener('change', (e) => {
            this.config.memory_size = parseInt(e.target.value) * 1024 * 1024;
        });
        
        document.getElementById('v86-boot-order').addEventListener('change', (e) => {
            this.config.boot_order = parseInt(e.target.value);
        });
        
        document.getElementById('v86-disk-file').addEventListener('change', (e) => {
            this.handleDiskImageUpload(e.target.files[0]);
        });
        
        // Canvas input handling
        this.canvas.addEventListener('click', () => this.captureInput());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('blur', () => this.handleFocusLoss());
        
        // Handle window focus loss
        window.addEventListener('blur', () => this.handleFocusLoss());
        
        // Keyboard handling
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        document.addEventListener('keyup', (e) => this.handleKeyboardInput(e));
        
        // Mouse handling
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseInput(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseInput(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseInput(e));
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        
        // Window resize handling for aspect ratio management
        window.addEventListener('resize', () => this.handleWindowResize());
        
        // Fullscreen change handling
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }

    /**
     * Load the V86 backend
     */
    async loadBackend() {
        this.updateStatus('Loading emulator core...', 'loading');
        
        try {
            // Create V86Backend instance
            this.backend = new V86Backend();
            
            // Set up event callbacks for input/output handling
            this.backend.setCallbacks({
                onScreenUpdate: (imageData) => this.handleScreenUpdate(imageData),
                onStateChange: (state) => this.handleStateChange(state),
                onError: (type, message) => this.handleBackendError(type, message)
            });
            
            // Load WASM core and BIOS files
            await this.backend.loadWASMCore();
            
            this.updateStatus('Ready to start', 'ready');
            this.enableControls(['start']);
            this.hideOverlay();
            
        } catch (error) {
            this.updateStatus('Failed to load', 'error');
            throw error;
        }
    }

    /**
     * Start emulation
     */
    async startEmulation() {
        if (this.emulatorState === 'running') return;
        
        this.updateStatus('Starting emulation...', 'starting');
        this.enableControls([]);
        
        try {
            // Configure emulator with current settings if not already initialized
            if (!this.backend.emulator) {
                // Validate canvas before passing to V86
                if (!this.canvas) {
                    throw new Error('Canvas element not found - this.canvas is null/undefined');
                }
                if (typeof this.canvas.getContext !== 'function') {
                    throw new Error(`Canvas element does not have getContext method - type: ${typeof this.canvas}, constructor: ${this.canvas.constructor.name}`);
                }
                if (!this.canvas.isConnected) {
                    throw new Error('Canvas element is not connected to DOM');
                }
                
                // Test canvas context creation
                try {
                    const testCtx = this.canvas.getContext('2d');
                    if (!testCtx) {
                        throw new Error('Failed to get 2D context from canvas');
                    }
                    // Test drawing to ensure canvas is fully functional
                    testCtx.fillStyle = '#000000';
                    testCtx.fillRect(0, 0, 1, 1);
                    console.log('Canvas test successful - context created and drawing works');
                } catch (contextError) {
                    throw new Error(`Canvas context creation failed: ${contextError.message}`);
                }
                
                // Debug canvas before passing to backend
                console.log('Frontend canvas details:', {
                    canvas: this.canvas,
                    tagName: this.canvas.tagName,
                    id: this.canvas.id,
                    isConnected: this.canvas.isConnected,
                    hasGetContext: typeof this.canvas.getContext === 'function',
                    width: this.canvas.width,
                    height: this.canvas.height,
                    parentElement: this.canvas.parentElement,
                    screenWrapper: this.screenWrapper
                });

                // The V86 library expects a container that contains a canvas element
                // Pass the canvas container so V86's positioning is contained within it
                const emulatorConfig = {
                    ...this.config,
                    screen_container: this.canvasContainer || this.canvas.parentElement
                };
                
                // Initialize the backend
                await this.backend.initializeEmulator(emulatorConfig);
            }
            
            // Start the backend
            await this.backend.start();
            
            // Initialize proper screen bounds to prevent edge positioning
            this.initializeScreenBounds();
            
            // Start screen update loop
            this.startScreenUpdateLoop();
            
        } catch (error) {
            console.error('Failed to start emulation:', error);
            this.updateStatus('Start failed', 'error');
            this.handleBackendError('START_FAILED', error.message);
            this.enableControls(['start']);
        }
    }

    /**
     * Initialize proper screen bounds
     */
    initializeScreenBounds() {
        if (!this.canvas || !this.backend) return;
        
        console.log('Initializing screen bounds...');
        
        try {
            // Ensure canvas has proper dimensions
            const minWidth = 800;
            const minHeight = 600;
            
            if (this.canvas.width < minWidth) {
                this.canvas.width = minWidth;
            }
            if (this.canvas.height < minHeight) {
                this.canvas.height = minHeight;
            }
            
            console.log('Screen bounds initialized successfully');
            
        } catch (error) {
            console.error('Error initializing screen bounds:', error);
        }
    }

    /**
     * Start screen update loop for display rendering
     */
    startScreenUpdateLoop() {
        if (this.screenUpdateInterval) {
            clearInterval(this.screenUpdateInterval);
        }
        
        console.log('Starting screen update loop...');
        
        // Setup canvas centering
        setTimeout(() => {
            this.setupCanvasForCentering();
        }, 200);
        
        this.screenUpdateInterval = setInterval(() => {
            if (this.backend && this.backend.isRunning) {
                const imageData = this.backend.getScreenData();
                if (imageData) {
                    this.updateDisplay(imageData);
                }
            }
        }, 1000 / 30); // 30 FPS
    }

    /**
     * Simple canvas setup for centering - let CSS do the work
     */
    setupCanvasForCentering() {
        if (!this.canvas || !this.screenWrapper) return;
        
        console.log('Setting up canvas for proper centering and bounds...');
        
        // Remove any inline positioning that V86 might have added
        this.canvas.style.position = '';
        this.canvas.style.left = '';
        this.canvas.style.top = '';
        this.canvas.style.right = '';
        this.canvas.style.bottom = '';
        this.canvas.style.transform = '';
        this.canvas.style.margin = '';
        this.canvas.style.float = '';
        
        // Ensure canvas has proper dimensions to prevent edge clipping
        if (this.canvas.width < 800) {
            this.canvas.width = 800;
        }
        if (this.canvas.height < 600) {
            this.canvas.height = 600;
        }
        
        // Let CSS handle the centering - just ensure the wrapper is set up
        this.screenWrapper.style.display = 'flex';
        this.screenWrapper.style.justifyContent = 'center';
        this.screenWrapper.style.alignItems = 'center';
        this.screenWrapper.style.overflow = 'hidden'; // Prevent content from going to edges
        this.screenWrapper.style.padding = '10px'; // Add padding to keep content away from edges
        
        // Ensure the canvas has a black background to show the display area clearly
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('Canvas setup complete - proper bounds and centering applied');
    }

    /**
     * Stop emulation
     */
    async stopEmulation() {
        if (this.emulatorState !== 'running') return;
        
        this.updateStatus('Stopping...', 'stopping');
        this.enableControls([]);
        
        try {
            // Stop screen update loop
            if (this.screenUpdateInterval) {
                clearInterval(this.screenUpdateInterval);
                this.screenUpdateInterval = null;
            }
            
            // Stop the backend - this actually stops the emulator
            if (this.backend) {
                await this.backend.stop();
            }
            
            // Release input capture
            if (this.inputFocused) {
                this.releaseInput();
            }
            this.keyboardCaptured = false;
            this.mouseCaptured = false;
            
            // Update state and UI after successful stop
            this.emulatorState = 'stopped';
            this.updateStatus('Stopped', 'stopped');
            this.enableControls(['start', 'reset']);
            
            console.log('V86 emulation stopped successfully');
            
        } catch (error) {
            console.error('Error stopping emulation:', error);
            this.updateStatus('Stop failed', 'error');
            this.enableControls(['start', 'stop']);
        }
    }

    /**
     * Reset emulation
     */
    async resetEmulation() {
        if (this.emulatorState !== 'running') return;
        
        this.updateStatus('Resetting...', 'resetting');
        this.enableControls([]);
        
        try {
            // Reset the backend
            if (this.backend) {
                await this.backend.reset();
            }
            
        } catch (error) {
            console.error('Error resetting emulation:', error);
            this.showError('Failed to reset emulation');
            this.enableControls(['start', 'stop', 'reset']);
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.container.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showToast('Fullscreen not supported', 'fa-exclamation-triangle');
            });
        }
    }

    /**
     * Handle fullscreen change events
     */
    handleFullscreenChange() {
        const fullscreenBtn = document.getElementById('v86-fullscreen');
        const icon = fullscreenBtn.querySelector('i');
        
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = 'Exit Fullscreen';
            this.updateScreenScale();
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Fullscreen';
            this.updateScreenScale();
        }
    }

    /**
     * Set screen scaling mode
     * @param {string} scale - Scale mode: 'fit', '100', '200'
     */
    setScreenScale(scale) {
        this.currentScale = scale;
        
        // Update active button
        document.querySelectorAll('.v86-scale-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`v86-scale-${scale}`).classList.add('active');
        
        this.updateScreenScale();
    }

    /**
     * Update screen scaling based on current mode and container size
     */
    updateScreenScale() {
        if (!this.canvas || !this.screenWrapper) return;
        
        const containerRect = this.displayContainer.getBoundingClientRect();
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate aspect ratio from canvas dimensions
        this.aspectRatio = canvasWidth / canvasHeight;
        
        let targetWidth, targetHeight;
        
        switch (this.currentScale) {
            case 'fit':
                // Scale to fit container while maintaining aspect ratio
                const containerAspect = containerRect.width / containerRect.height;
                
                if (this.aspectRatio > containerAspect) {
                    // Canvas is wider than container
                    targetWidth = Math.min(containerRect.width - 40, canvasWidth * 2); // Leave some margin
                    targetHeight = targetWidth / this.aspectRatio;
                } else {
                    // Canvas is taller than container
                    targetHeight = Math.min(containerRect.height - 40, canvasHeight * 2);
                    targetWidth = targetHeight * this.aspectRatio;
                }
                break;
                
            case '100':
                // 1:1 scale
                targetWidth = canvasWidth;
                targetHeight = canvasHeight;
                break;
                
            case '200':
                // 2:1 scale
                targetWidth = canvasWidth * 2;
                targetHeight = canvasHeight * 2;
                break;
                
            default:
                targetWidth = canvasWidth;
                targetHeight = canvasHeight;
        }
        
        // Apply scaling
        this.canvas.style.width = `${targetWidth}px`;
        this.canvas.style.height = `${targetHeight}px`;
        
        // Reset any existing positioning
        this.canvas.style.position = 'relative';
        this.canvas.style.top = 'auto';
        this.canvas.style.left = 'auto';
        this.canvas.style.right = 'auto';
        this.canvas.style.bottom = 'auto';
        this.canvas.style.transform = 'none';
        
        // Ensure canvas is properly centered using flexbox
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0';
        
        // Force flexbox centering on the wrapper
        this.screenWrapper.style.display = 'flex';
        this.screenWrapper.style.justifyContent = 'center';
        this.screenWrapper.style.alignItems = 'center';
        this.screenWrapper.style.width = '100%';
        this.screenWrapper.style.height = '100%';
        
        // Update cursor based on scale
        if (this.currentScale === 'fit' && (targetWidth < canvasWidth || targetHeight < canvasHeight)) {
            this.canvas.style.cursor = 'zoom-in';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
        
        // Force a reflow to ensure styles are applied
        this.screenWrapper.offsetHeight;
        
        // Debug positioning
        const canvasRect = this.canvas.getBoundingClientRect();
        const wrapperRect = this.screenWrapper.getBoundingClientRect();
        
        console.log('Canvas scaling applied:', {
            canvasWidth,
            canvasHeight,
            targetWidth,
            targetHeight,
            containerRect: {
                width: containerRect.width,
                height: containerRect.height
            },
            canvasRect: {
                width: canvasRect.width,
                height: canvasRect.height,
                left: canvasRect.left,
                top: canvasRect.top
            },
            wrapperRect: {
                width: wrapperRect.width,
                height: wrapperRect.height,
                left: wrapperRect.left,
                top: wrapperRect.top
            },
            scale: this.currentScale,
            aspectRatio: this.aspectRatio,
            canvasComputedStyle: window.getComputedStyle(this.canvas),
            wrapperComputedStyle: window.getComputedStyle(this.screenWrapper)
        });
    }

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.currentScale === 'fit') {
                this.updateScreenScale();
            }
        }, 100);
    }

    /**
     * Maintain aspect ratio when canvas dimensions change
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    updateCanvasDimensions(width, height) {
        if (!this.canvas) return;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.aspectRatio = width / height;
        
        // Update scaling to maintain proper display
        this.updateScreenScale();
    }

    /**
     * Toggle configuration panel
     */
    toggleConfig() {
        const content = this.configPanel.querySelector('.v86-config-content');
        const toggle = document.getElementById('v86-config-toggle');
        const icon = toggle.querySelector('i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            content.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    }

    /**
     * Handle ISO/disk image upload
     */
    handleDiskImageUpload(file) {
        if (!file) return;
        
        // Check file type and provide appropriate feedback
        const fileExt = file.name.toLowerCase().split('.').pop();
        const isISO = fileExt === 'iso';
        const fileType = isISO ? 'ISO file' : 'disk image';
        
        this.updateStatus(`Loading ${fileType}...`, 'loading');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.config.cdrom = { buffer: e.target.result };
            
            // Update status and show success message
            this.updateStatus('Ready to start', 'ready');
            this.showToast(`${fileType} loaded: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`, 'fa-check-circle');
            
            // Enable start button since we now have a bootable image
            this.enableControls(['start']);
        };
        
        reader.onerror = () => {
            this.updateStatus('Ready', 'ready');
            this.showToast(`Failed to load ${fileType}: ${file.name}`, 'fa-exclamation-triangle');
        };
        
        reader.readAsArrayBuffer(file);
    }

    /**
     * Capture input focus with proper state management
     */
    captureInput() {
        if (this.emulatorState !== 'running') {
            this.showToast('Start emulation first to capture input', 'fa-exclamation-triangle');
            return;
        }
        
        // Set focus state
        this.inputFocused = true;
        this.keyboardCaptured = true;
        this.mouseCaptured = true;
        
        // Focus the canvas
        this.canvas.focus();
        this.canvas.setAttribute('tabindex', '0');
        
        // Add visual feedback
        this.canvas.classList.add('v86-input-captured');
        
        // Show capture notification
        this.showInputCaptureNotification(true);
        
        // Prevent NautilusOS shortcuts when input is captured
        if (this.preventNautilusOSConflicts) {
            document.body.classList.add('v86-input-active');
        }
        
        this.showToast('Input captured. Press Ctrl+Alt to release.', 'fa-keyboard');
    }

    /**
     * Release input capture
     */
    releaseInput() {
        this.inputFocused = false;
        this.keyboardCaptured = false;
        this.mouseCaptured = false;
        
        // Remove focus from canvas
        this.canvas.blur();
        this.canvas.removeAttribute('tabindex');
        
        // Remove visual feedback
        this.canvas.classList.remove('v86-input-captured');
        
        // Hide capture notification
        this.showInputCaptureNotification(false);
        
        // Re-enable NautilusOS shortcuts
        if (this.preventNautilusOSConflicts) {
            document.body.classList.remove('v86-input-active');
        }
        
        this.showToast('Input released', 'fa-keyboard');
    }

    /**
     * Show/hide input capture notification
     */
    showInputCaptureNotification(show) {
        let notification = document.getElementById('v86-input-notification');
        
        if (show && !notification) {
            notification = document.createElement('div');
            notification.id = 'v86-input-notification';
            notification.className = 'v86-input-notification';
            notification.innerHTML = `
                <div class="v86-input-notification-content">
                    <i class="fas fa-keyboard"></i>
                    <span>Input Captured</span>
                    <small>Press Ctrl+Alt to release</small>
                </div>
            `;
            this.displayContainer.appendChild(notification);
        } else if (!show && notification) {
            notification.remove();
        }
    }

    /**
     * Handle focus loss events
     */
    handleFocusLoss() {
        if (this.inputFocused) {
            // Automatically release input when focus is lost
            this.releaseInput();
            this.showToast('Input released due to focus loss', 'fa-info-circle');
        }
    }

    /**
     * Handle keyboard input and forward to emulated system
     */
    handleKeyboardInput(event) {
        // Only handle input if we have focus and emulator is running
        if (!this.keyboardCaptured || this.emulatorState !== 'running' || !this.inputFocused) {
            return;
        }
        
        // Release input on Ctrl+Alt combination
        if (event.ctrlKey && event.altKey && event.type === 'keydown') {
            this.releaseInput();
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        
        // Prevent certain key combinations that might conflict with NautilusOS
        if (this.preventNautilusOSConflicts) {
            // Block common NautilusOS shortcuts when input is captured
            const blockedCombinations = [
                // Alt+Tab (window switching)
                event.altKey && event.key === 'Tab',
                // Ctrl+Shift+I (dev tools)
                event.ctrlKey && event.shiftKey && event.key === 'I',
                // F11 (fullscreen)
                event.key === 'F11',
                // Ctrl+R (refresh)
                event.ctrlKey && event.key === 'r',
                // Ctrl+W (close tab)
                event.ctrlKey && event.key === 'w'
            ];
            
            if (blockedCombinations.some(blocked => blocked)) {
                event.preventDefault();
                event.stopPropagation();
                // Still forward to emulator
            }
        }
        
        // Forward keyboard events to backend
        if (this.backend && this.backend.isRunning) {
            const isKeyDown = event.type === 'keydown';
            this.backend.sendKeyboardEvent(event.keyCode, isKeyDown);
        }
        
        // Prevent default behavior and stop propagation
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handle mouse input and coordinate translation
     */
    handleMouseInput(event) {
        if (this.emulatorState !== 'running') return;
        
        // Get accurate coordinates with scaling consideration
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        
        // Ensure coordinates are within canvas bounds
        const clampedX = Math.max(0, Math.min(x, this.canvas.width - 1));
        const clampedY = Math.max(0, Math.min(y, this.canvas.height - 1));
        
        // Handle mouse capture on click
        if (event.type === 'mousedown' && !this.inputFocused) {
            this.captureInput();
        }
        
        // Only process mouse events if input is captured or it's a click to capture
        if (!this.mouseCaptured && event.type !== 'mousedown') {
            return;
        }
        
        // Update mouse button state
        if (event.type === 'mousedown') {
            this.mouseButtons |= (1 << event.button);
        } else if (event.type === 'mouseup') {
            this.mouseButtons &= ~(1 << event.button);
        }
        
        // Forward mouse events to backend with coordinate translation
        if (this.backend && this.backend.isRunning && this.mouseCaptured) {
            if (event.type === 'mousemove') {
                // Send mouse movement with absolute coordinates
                const dx = clampedX - this.lastMousePosition.x;
                const dy = clampedY - this.lastMousePosition.y;
                if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                    this.backend.sendMouseEvent(clampedX, clampedY, this.mouseButtons);
                }
            } else if (event.type === 'mousedown' || event.type === 'mouseup') {
                // Send mouse click events
                this.backend.sendMouseEvent(clampedX, clampedY, this.mouseButtons);
            }
        }
        
        // Update last mouse position
        this.lastMousePosition = { x: clampedX, y: clampedY };
        
        // Prevent default behavior when input is captured
        if (this.mouseCaptured) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /**
     * Handle mouse wheel events
     */
    handleMouseWheel(event) {
        if (this.emulatorState !== 'running' || !this.mouseCaptured) return;
        
        // Get accurate coordinates with scaling
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);
        
        // Clamp coordinates
        const clampedX = Math.max(0, Math.min(x, this.canvas.width - 1));
        const clampedY = Math.max(0, Math.min(y, this.canvas.height - 1));
        
        // Convert wheel delta to mouse button events
        if (this.backend && this.backend.isRunning) {
            // Normalize wheel delta (different browsers have different scales)
            const normalizedDelta = Math.sign(event.deltaY);
            
            // Simulate wheel as button 3 (wheel up) or button 4 (wheel down)
            const wheelButton = normalizedDelta < 0 ? 3 : 4;
            const wheelButtons = this.mouseButtons | (1 << wheelButton);
            
            // Send wheel press and release events
            this.backend.sendMouseEvent(clampedX, clampedY, wheelButtons);
            setTimeout(() => {
                this.backend.sendMouseEvent(clampedX, clampedY, this.mouseButtons);
            }, 10);
        }
        
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Update status display
     */
    updateStatus(text, state) {
        const statusText = this.statusDisplay.querySelector('.v86-status-text');
        const indicator = this.statusDisplay.querySelector('.v86-status-indicator');
        const performanceDiv = document.getElementById('v86-performance');
        
        statusText.textContent = text;
        indicator.className = `v86-status-indicator v86-status-${state}`;
        this.emulatorState = state;
        
        // Show/hide performance display based on state
        if (state === 'running') {
            performanceDiv.style.display = 'flex';
            this.startPerformanceMonitoring();
        } else {
            performanceDiv.style.display = 'none';
            this.stopPerformanceMonitoring();
        }
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceDisplay();
        }, 1000); // Update every second
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
     * Update performance display
     */
    updatePerformanceDisplay() {
        if (!this.backend || this.emulatorState !== 'running') return;
        
        try {
            const stats = this.backend.getPerformanceStats();
            
            // Update FPS
            const fpsElement = document.getElementById('v86-fps');
            if (fpsElement) {
                fpsElement.textContent = stats.fps || '0';
            }
            
            // Update uptime
            const uptimeElement = document.getElementById('v86-uptime');
            if (uptimeElement) {
                const uptime = stats.uptime || 0;
                if (uptime < 60) {
                    uptimeElement.textContent = `${uptime}s`;
                } else if (uptime < 3600) {
                    const minutes = Math.floor(uptime / 60);
                    const seconds = uptime % 60;
                    uptimeElement.textContent = `${minutes}m ${seconds}s`;
                } else {
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    uptimeElement.textContent = `${hours}h ${minutes}m`;
                }
            }
            
            // Update memory usage
            const memoryElement = document.getElementById('v86-memory-usage');
            if (memoryElement) {
                const memoryMB = Math.round((this.config.memory_size || 0) / (1024 * 1024));
                memoryElement.textContent = memoryMB;
            }
            
        } catch (error) {
            console.error('Error updating performance display:', error);
        }
    }

    /**
     * Enable/disable control buttons with visual feedback
     */
    enableControls(enabledButtons) {
        const buttons = ['start', 'stop', 'reset'];
        buttons.forEach(button => {
            const element = document.getElementById(`v86-${button}`);
            const isEnabled = enabledButtons.includes(button);
            
            element.disabled = !isEnabled;
            
            // Add visual feedback for button states
            if (isEnabled) {
                element.classList.remove('v86-btn-disabled');
            } else {
                element.classList.add('v86-btn-disabled');
            }
        });
        
        // Update button text and icons based on state
        this.updateButtonStates();
    }

    /**
     * Update button states with appropriate text and icons
     */
    updateButtonStates() {
        const startBtn = document.getElementById('v86-start');
        const stopBtn = document.getElementById('v86-stop');
        const resetBtn = document.getElementById('v86-reset');
        
        switch (this.emulatorState) {
            case 'loading':
            case 'starting':
                startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
                break;
            case 'running':
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                stopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                resetBtn.innerHTML = '<i class="fas fa-redo"></i> Reset';
                break;
            case 'stopping':
                stopBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Stopping...';
                break;
            case 'resetting':
                resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
                break;
            default:
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                stopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                resetBtn.innerHTML = '<i class="fas fa-redo"></i> Reset';
        }
    }

    /**
     * Show overlay with message
     */
    showOverlay(message = 'Click Start to begin emulation') {
        document.getElementById('v86-overlay-message').textContent = message;
        this.overlay.style.display = 'flex';
    }

    /**
     * Hide overlay
     */
    hideOverlay() {
        this.overlay.style.display = 'none';
    }

    /**
     * Update display with screen data from emulated system
     */
    updateDisplay(imageData) {
        if (!this.canvas || !imageData) return;
        
        try {
            const ctx = this.canvas.getContext('2d');
            
            // Check if canvas dimensions need to be updated
            const dimensionsChanged = this.canvas.width !== imageData.width || this.canvas.height !== imageData.height;
            
            if (dimensionsChanged) {
                // Update canvas dimensions and maintain aspect ratio
                this.updateCanvasDimensions(imageData.width, imageData.height);
                
                // Re-setup centering after dimension change
                setTimeout(() => {
                    this.setupCanvasForCentering();
                }, 100);
            }
            
            // Clear the canvas first to prevent edge artifacts
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw the image data to canvas, centered if smaller than canvas
            const offsetX = Math.max(0, (this.canvas.width - imageData.width) / 2);
            const offsetY = Math.max(0, (this.canvas.height - imageData.height) / 2);
            
            ctx.putImageData(imageData, offsetX, offsetY);
            
            // Update last screen update timestamp
            this.lastScreenUpdate = Date.now();
            
        } catch (error) {
            console.error('Failed to update display:', error);
        }
    }

    /**
     * Handle screen update from backend
     */
    handleScreenUpdate(imageData) {
        this.updateDisplay(imageData);
    }

    /**
     * Handle state changes from backend
     */
    handleStateChange(state) {
        switch (state) {
            case 'initialized':
                this.updateStatus('Initialized', 'ready');
                this.enableControls(['start']);
                break;
            case 'running':
                this.emulatorState = 'running';
                this.updateStatus('Running', 'running');
                this.enableControls(['stop', 'reset']);
                this.hideOverlay();
                break;
            case 'stopped':
                this.emulatorState = 'stopped';
                this.updateStatus('Stopped', 'stopped');
                this.enableControls(['start']);
                this.showOverlay('Emulation stopped');
                break;
            case 'reset':
                this.updateStatus('Reset complete', 'running');
                this.enableControls(['stop', 'reset']);
                break;
        }
    }

    /**
     * Handle errors from backend with comprehensive error recovery
     */
    handleBackendError(type, message) {
        console.error(`Backend error (${type}):`, message);
        
        // Track error for potential recovery
        this.lastError = { type, message, timestamp: Date.now() };
        
        switch (type) {
            case 'WASM_LOAD_FAILED':
                this.showError('Failed to load emulator core');
                this.suggestErrorRecovery('Try reinstalling the V86 emulator or check your internet connection.');
                break;
                
            case 'INIT_FAILED':
                this.showError('Failed to initialize emulator');
                this.suggestErrorRecovery('Try reducing memory allocation or restarting the application.');
                this.enableControls(['start']);
                break;
                
            case 'START_FAILED':
                this.showError('Failed to start emulation');
                this.suggestErrorRecovery('Check your configuration settings and try again.');
                this.enableControls(['start']);
                break;
                
            case 'STOP_FAILED':
                this.showError('Failed to stop emulation');
                this.suggestErrorRecovery('The emulator may need to be reset.');
                this.enableControls(['reset']);
                break;
                
            case 'RESET_FAILED':
                this.showError('Failed to reset emulation');
                this.suggestErrorRecovery('Try stopping and restarting the emulator.');
                this.enableControls(['start', 'stop']);
                break;
                
            case 'MEMORY_ERROR':
                this.showError('Memory allocation error');
                this.suggestErrorRecovery('Try reducing memory allocation in settings.');
                break;
                
            case 'RESOURCE_ERROR':
                this.showError('Resource loading error');
                this.suggestErrorRecovery('Some emulator resources may be missing or corrupted.');
                break;
                
            default:
                this.showError(`Emulator error: ${message}`);
                this.suggestErrorRecovery('Try restarting the emulator or check the console for details.');
        }
        
        this.updateStatus('Error', 'error');
        
        // Attempt automatic recovery for certain error types
        this.attemptErrorRecovery(type, message);
    }

    /**
     * Suggest error recovery actions to the user
     */
    suggestErrorRecovery(suggestion) {
        // Create a recovery suggestion element
        const existingSuggestion = this.container.querySelector('.v86-error-suggestion');
        if (existingSuggestion) {
            existingSuggestion.remove();
        }
        
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'v86-error-suggestion';
        suggestionEl.innerHTML = `
            <div style="background: var(--warning-yellow); color: var(--bg-primary); padding: 10px; margin: 10px; border-radius: 6px; font-size: 14px;">
                <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                <strong>Suggestion:</strong> ${suggestion}
                <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; color: var(--bg-primary); cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.container.insertBefore(suggestionEl, this.container.firstChild);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (suggestionEl.parentElement) {
                suggestionEl.remove();
            }
        }, 10000);
    }

    /**
     * Attempt automatic error recovery
     */
    attemptErrorRecovery(errorType, errorMessage) {
        // Don't attempt recovery too frequently
        if (this.lastRecoveryAttempt && Date.now() - this.lastRecoveryAttempt < 30000) {
            console.log('Skipping recovery attempt - too recent');
            return;
        }
        
        this.lastRecoveryAttempt = Date.now();
        
        switch (errorType) {
            case 'WASM_LOAD_FAILED':
                // Try reloading the backend
                setTimeout(() => {
                    console.log('Attempting automatic backend reload...');
                    this.loadBackend().catch(error => {
                        console.error('Automatic recovery failed:', error);
                    });
                }, 5000);
                break;
                
            case 'MEMORY_ERROR':
                // Try reducing memory allocation automatically
                setTimeout(() => {
                    console.log('Attempting automatic memory reduction...');
                    const memorySelect = document.getElementById('v86-memory');
                    if (memorySelect && parseInt(memorySelect.value) > 64) {
                        const currentMemory = parseInt(memorySelect.value);
                        const newMemory = Math.max(64, currentMemory / 2);
                        memorySelect.value = newMemory.toString();
                        this.config.memory_size = newMemory * 1024 * 1024;
                        this.showToast(`Memory reduced to ${newMemory}MB for stability`, 'fa-memory');
                    }
                }, 2000);
                break;
                
            case 'START_FAILED':
                // Try starting with minimal configuration
                setTimeout(() => {
                    console.log('Attempting start with minimal configuration...');
                    const originalConfig = { ...this.config };
                    this.config.memory_size = 64 * 1024 * 1024; // Minimal memory
                    this.config.vga_memory_size = 2 * 1024 * 1024; // Minimal VGA memory
                    
                    // Only try to start if we have a backend and it's initialized
                    if (this.backend && this.backend.emulator) {
                        this.backend.start().catch(error => {
                            console.error('Minimal configuration start failed:', error);
                            this.config = originalConfig; // Restore original config
                        });
                    }
                }, 3000);
                break;
        }
    }

    /**
     * Get error recovery suggestions based on error history
     */
    getErrorRecoverySuggestions() {
        if (!this.lastError) return [];
        
        const suggestions = [];
        const errorAge = Date.now() - this.lastError.timestamp;
        
        // Only show suggestions for recent errors (within 5 minutes)
        if (errorAge > 300000) return suggestions;
        
        switch (this.lastError.type) {
            case 'WASM_LOAD_FAILED':
                suggestions.push('Reinstall V86 emulator');
                suggestions.push('Check internet connection');
                suggestions.push('Try refreshing the page');
                break;
                
            case 'MEMORY_ERROR':
                suggestions.push('Reduce memory allocation');
                suggestions.push('Close other applications');
                suggestions.push('Restart browser');
                break;
                
            case 'START_FAILED':
                suggestions.push('Check configuration settings');
                suggestions.push('Try different boot order');
                suggestions.push('Reduce memory allocation');
                break;
        }
        
        return suggestions;
    }

    /**
     * Show running display (fallback for when no screen data is available)
     */
    showRunningDisplay() {
        this.hideOverlay();
        // Clear canvas and show a simple "running" indicator
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#3b82f6';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('V86 Emulator Running', this.canvas.width / 2, this.canvas.height / 2);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('(Waiting for screen data...)', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showOverlay(`Error: ${message}`);
        console.error('V86 Frontend Error:', message);
    }

    /**
     * Show toast notification
     */
    showToast(message, icon) {
        // Use the global showToast function if available
        if (typeof showToast === 'function') {
            showToast(message, icon);
        } else {
            console.log(`Toast: ${message}`);
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        try {
            console.log('Starting V86 frontend cleanup...');
            
            // Stop screen update loop
            if (this.screenUpdateInterval) {
                clearInterval(this.screenUpdateInterval);
                this.screenUpdateInterval = null;
            }
            
            // Stop performance monitoring
            this.stopPerformanceMonitoring();
            
            // Clear resize timeout
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = null;
            }
            

            
            // Stop and cleanup backend
            if (this.backend) {
                this.backend.cleanup();
                this.backend = null;
            }
            
            // Release input capture and clean up event listeners
            if (this.inputFocused) {
                this.releaseInput();
            }
            this.keyboardCaptured = false;
            this.mouseCaptured = false;
            this.inputFocused = false;
            
            // Clean up canvas and display elements
            if (this.canvas) {
                const ctx = this.canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
                this.canvas = null;
            }
            
            // Clean up container references
            this.container = null;
            this.controlPanel = null;
            this.statusDisplay = null;
            this.overlay = null;
            this.configPanel = null;
            this.displayContainer = null;
            this.screenWrapper = null;
            
            // Reset state variables
            this.emulatorState = 'stopped';
            this.emulatorInstance = null;
            this.lastMousePosition = { x: 0, y: 0 };
            this.mouseButtons = 0;
            this.lastScreenUpdate = 0;
            this.currentScale = 'fit';
            this.aspectRatio = 4/3;
            
            // Clear configuration
            this.config = {
                memory_size: 128 * 1024 * 1024,
                vga_memory_size: 8 * 1024 * 1024,
                boot_order: 0x213,
                autostart: false
            };
            
            console.log('V86 frontend cleanup completed successfully');
            
        } catch (error) {
            console.error('Error during V86 frontend cleanup:', error);
            // Don't throw the error to prevent cleanup chain from breaking
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = V86Frontend;
} else if (typeof window !== 'undefined') {
    window.V86Frontend = V86Frontend;
    
    // Add simple debug function
    window.debugV86Canvas = function() {
        if (window.v86Instances) {
            Object.keys(window.v86Instances).forEach(instanceId => {
                const instance = window.v86Instances[instanceId];
                if (instance && instance.canvas) {
                    console.log(`=== V86 Instance ${instanceId} ===`);
                    const rect = instance.canvas.getBoundingClientRect();
                    console.log('Canvas position:', rect);
                    console.log('Canvas styles:', {
                        position: instance.canvas.style.position,
                        left: instance.canvas.style.left,
                        top: instance.canvas.style.top
                    });
                }
            });
        } else {
            console.log('No V86 instances found');
        }
    };
}