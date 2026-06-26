import '@testing-library/jest-dom';

// jsdom lacks the layout/pointer APIs that Base UI popups (Select, Dialog) rely on.
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? jest.fn();
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture ?? (() => false);
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture ?? jest.fn();
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture ?? jest.fn();
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
