/**
 * V86 Library Wrapper
 * This wraps the V86 module and exposes V86Starter to the global scope
 */

// The libv86.js file is wrapped in an IIFE and doesn't export to global scope
// We need to extract V86Starter from it

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    // Store reference to the original this context
    const originalContext = this;
    
    // Create a temporary context to capture exports
    const tempContext = {};
    
    // Try to extract V86Starter by evaluating the library in a controlled way
    // Since the library uses (function(){...}).call(this), we can intercept it
    
    console.log('V86 Library Wrapper: Attempting to expose V86Starter...');
    
    // The library should have already been loaded by libv86.js
    // We need to check if it exposed anything
    
    // Check common export patterns
    if (typeof V86Starter !== 'undefined') {
        console.log('V86Starter already available globally');
        window.V86Starter = V86Starter;
    } else if (typeof V86 !== 'undefined' && V86.V86Starter) {
        console.log('V86Starter found in V86 namespace');
        window.V86Starter = V86.V86Starter;
    } else {
        console.error('V86Starter not found. The library may not have loaded correctly.');
        console.log('Available globals:', Object.keys(window).filter(k => k.includes('V86') || k.includes('v86')));
    }
}
