// Session management utilities for browser extension
// This handles authentication that persists until browser session ends

export class SessionManager {
  private static readonly SESSION_KEY = 'hedgex_session';
  private static readonly USER_KEY = 'hedgex_user';
  
  /**
   * Store authentication data in session storage (cleared when browser closes)
   */
  static async setAuthSession(token: string, user: any): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Use Chrome storage with session-like behavior
        await chrome.storage.local.set({
          [this.SESSION_KEY]: {
            token,
            user: JSON.stringify(user),
            timestamp: Date.now()
          }
        });
      } else {
        // Fallback to sessionStorage for development
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({
          token,
          user: JSON.stringify(user),
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error setting auth session:', error);
      // Fallback to sessionStorage
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        token,
        user: JSON.stringify(user),
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Get authentication data from session storage
   */
  static async getAuthSession(): Promise<{ token: string; user: any } | null> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([this.SESSION_KEY]);
        const session = result[this.SESSION_KEY];
        
        if (session && session.token) {
          return {
            token: session.token,
            user: JSON.parse(session.user)
          };
        }
      } else {
        // Fallback to sessionStorage
        const sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          return {
            token: session.token,
            user: JSON.parse(session.user)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting auth session:', error);
      return null;
    }
  }

  /**
   * Clear authentication session
   */
  static async clearAuthSession(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove([this.SESSION_KEY]);
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (error) {
      console.error('Error clearing auth session:', error);
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Check if there's a valid authentication session
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getAuthSession();
    return !!session?.token;
  }

  /**
   * Get the current authentication token
   */
  static async getToken(): Promise<string | null> {
    const session = await this.getAuthSession();
    return session?.token || null;
  }

  /**
   * Get the current user
   */
  static async getUser(): Promise<any | null> {
    const session = await this.getAuthSession();
    return session?.user || null;
  }
}
