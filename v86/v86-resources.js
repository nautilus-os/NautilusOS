/**
 * V86 Resource Manager
 * Handles loading and caching of V86 resources from base64 files
 */

class V86ResourceManager {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.baseUrl = 'v86/';
        
        // Resource definitions - using real binary files
        this.resources = {
            seabios: {
                file: 'bios.bin-1.10.0',
                type: 'binary',
                required: true,
                description: 'SeaBIOS (System BIOS)'
            },
            vgabios: {
                file: 'VGABIOS-lgpl-latest.bin',
                type: 'binary',
                required: true,
                description: 'VGA BIOS'
            }
        };
    }

    /**
     * Load a resource by name
     */
    async loadResource(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const resource = this.resources[name];
        if (!resource) {
            throw new Error(`Unknown resource: ${name}`);
        }

        const loadPromise = this.fetchAndDecodeResource(resource);
        this.loadingPromises.set(name, loadPromise);

        try {
            const data = await loadPromise;
            this.cache.set(name, data);
            this.loadingPromises.delete(name);
            return data;
        } catch (error) {
            this.loadingPromises.delete(name);
            throw error;
        }
    }

    /**
     * Load multiple resources
     */
    async loadResources(names) {
        const promises = names.map(name => this.loadResource(name));
        return Promise.all(promises);
    }

    /**
     * Load all required resources
     */
    async loadAllResources() {
        const requiredResources = Object.keys(this.resources).filter(
            name => this.resources[name].required
        );
        return this.loadResources(requiredResources);
    }

    /**
     * Fetch a resource from real binary file
     */
    async fetchAndDecodeResource(resource) {
        try {
            const url = this.baseUrl + resource.file;
            console.log(`Loading ${resource.description} from ${url}...`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (resource.type === 'binary') {
                return await response.arrayBuffer();
            } else {
                return await response.text();
            }

        } catch (error) {
            console.error(`Failed to load ${resource.description}:`, error);
            throw new Error(`Failed to load ${resource.description}: ${error.message}`);
        }
    }

    /**
     * Convert base64 string to ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        try {
            // Remove whitespace and newlines
            const cleanBase64 = base64.replace(/\s/g, '');
            
            // Decode base64
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            return bytes.buffer;
        } catch (error) {
            throw new Error(`Failed to decode base64 data: ${error.message}`);
        }
    }

    /**
     * Get resource info
     */
    getResourceInfo(name) {
        return this.resources[name] || null;
    }

    /**
     * Check if resource is cached
     */
    isCached(name) {
        return this.cache.has(name);
    }

    /**
     * Check if resource is currently loading
     */
    isLoading(name) {
        return this.loadingPromises.has(name);
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        let totalSize = 0;
        for (const data of this.cache.values()) {
            if (data instanceof ArrayBuffer) {
                totalSize += data.byteLength;
            } else if (typeof data === 'string') {
                totalSize += data.length * 2; // Approximate UTF-16 size
            }
        }
        return totalSize;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('V86 resource cache cleared');
    }

    /**
     * Clear specific resource from cache
     */
    clearResource(name) {
        if (this.cache.has(name)) {
            this.cache.delete(name);
            console.log(`Cleared resource from cache: ${name}`);
        }
    }

    /**
     * Get loading progress
     */
    getLoadingProgress() {
        const totalResources = Object.keys(this.resources).length;
        const loadedResources = this.cache.size;
        const loadingResources = this.loadingPromises.size;
        
        return {
            total: totalResources,
            loaded: loadedResources,
            loading: loadingResources,
            progress: totalResources > 0 ? (loadedResources / totalResources) * 100 : 0
        };
    }

    /**
     * Create WASM imports object
     */
    createWASMImports() {
        return {
            env: {
                // Memory management
                mmap_read: () => 0,
                mmap_read16: () => 0,
                mmap_read32: () => 0,
                mmap_write8: () => {},
                mmap_write16: () => {},
                mmap_write32: () => {},
                mmap_write64: () => {},
                mmap_write128: () => {},
                
                // I/O operations
                io_port_read8: () => 0,
                io_port_read16: () => 0,
                io_port_read32: () => 0,
                io_port_write8: () => {},
                io_port_write16: () => {},
                io_port_write32: () => {},
                
                // System functions
                microtick: () => performance.now() * 1000,
                get_rand_int: () => Math.floor(Math.random() * 0xFFFFFFFF),
                stop_idling: () => {},
                cpu_event_halt: () => {},
                run_hardware_timers: () => {},
                console_log_from_wasm: () => {},
                jit_clear_func: () => {},
                codegen_finalize: () => {},
                
                // Function table
                __indirect_function_table: new WebAssembly.Table({
                    initial: 1024,
                    element: 'anyfunc'
                })
            }
        };
    }

    /**
     * Create V86 configuration object using real binary files
     */
    createV86Config(options = {}) {
        const config = {
            memory_size: options.memory_size || 128 * 1024 * 1024,
            vga_memory_size: options.vga_memory_size || 8 * 1024 * 1024,
            screen_container: options.screen_container,
            boot_order: options.boot_order || 0x213,
            autostart: options.autostart || false,
            
            // Use real binary files via URL
            bios: { 
                url: 'v86/bios.bin-1.10.0'
            },
            vga_bios: { 
                url: 'v86/VGABIOS-lgpl-latest.bin'
            }
        };

        // Add disk images if provided
        if (options.cdrom) {
            config.cdrom = options.cdrom;
        }
        if (options.hda) {
            config.hda = options.hda;
        }
        if (options.fda) {
            config.fda = options.fda;
        }

        return config;
    }

    /**
     * Handle loading errors with user-friendly messages
     */
    static handleLoadError(error) {
        console.error('V86 Resource loading error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            return 'Failed to load V86 resources. Please check your internet connection.';
        }
        
        if (error.message.includes('Failed to decode base64')) {
            return 'V86 resource files appear to be corrupted. Try reinstalling the V86 emulator.';
        }
        
        if (error.message.includes('HTTP 404')) {
            return 'Required V86 files are missing. Try reinstalling the V86 emulator.';
        }
        
        if (error.message.includes('run is not a function')) {
            return 'Emulator initialization failed. The emulator core may not be properly loaded.';
        }
        
        if (error.message.includes('Emulator not initialized')) {
            return 'Emulator not properly initialized. Try restarting the emulator.';
        }
        
        return error.message || 'An unknown error occurred while loading V86 resources.';
    }

    /**
     * Validate resource integrity
     */
    async validateResources() {
        const results = {};
        
        for (const [name, resource] of Object.entries(this.resources)) {
            try {
                const data = await this.loadResource(name);
                results[name] = {
                    valid: true,
                    size: data instanceof ArrayBuffer ? data.byteLength : data.length,
                    type: data instanceof ArrayBuffer ? 'binary' : 'text'
                };
            } catch (error) {
                results[name] = {
                    valid: false,
                    error: error.message
                };
            }
        }
        
        return results;
    }

    /**
     * Get resource statistics
     */
    getStats() {
        const stats = {
            totalResources: Object.keys(this.resources).length,
            cachedResources: this.cache.size,
            loadingResources: this.loadingPromises.size,
            cacheSize: this.getCacheSize(),
            resources: {}
        };

        for (const [name, resource] of Object.entries(this.resources)) {
            stats.resources[name] = {
                description: resource.description,
                required: resource.required,
                cached: this.isCached(name),
                loading: this.isLoading(name)
            };
        }

        return stats;
    }
}

// Create global resource manager instance
const v86ResourceManager = new V86ResourceManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { V86ResourceManager, v86ResourceManager };
} else if (typeof window !== 'undefined') {
    window.V86ResourceManager = V86ResourceManager;
    window.v86ResourceManager = v86ResourceManager;
}