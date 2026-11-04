/**
 * Screen Wake Lock API Manager
 * Keeps screen on when counting steps to avoid mobile background suspension.
 */

class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
    this.isActive = false;
    this.listeners = new Set();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isActive && !this.wakeLock) {
          this.request();
        }
      });
    }
  }

  async request() {
    if (!this.isSupported) {
      console.warn('Wake Lock API not supported in this browser environment.');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isActive = true;
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        this.notify(false);
      });
      this.notify(true);
      return true;
    } catch (err) {
      console.warn('Failed to obtain Screen Wake Lock:', err);
      this.isActive = false;
      this.notify(false);
      return false;
    }
  }

  async release() {
    this.isActive = false;
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch (err) {
        console.warn('Error releasing Wake Lock:', err);
      }
      this.wakeLock = null;
    }
    this.notify(false);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(Boolean(this.wakeLock));
    return () => this.listeners.delete(listener);
  }

  notify(state) {
    this.listeners.forEach(cb => cb(state));
  }
}

export const wakeLockManager = new WakeLockManager();
export default wakeLockManager;

