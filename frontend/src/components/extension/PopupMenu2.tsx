import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SessionManager } from '@/utils/sessionManager';
import { kiteService } from '@/services/kiteService';
import '@/styles/popup.css';

interface SystemInfo {
  enabled: boolean;
  connected: boolean;
  browser: string;
  hostname: string;
  kiteStatus: boolean;
}

export function PopupMenu() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    enabled: true,
    connected: false,
    browser: 'Unknown',
    hostname: 'Unknown',
    kiteStatus: false,
  });

  useEffect(() => {
    const fetchSystemInfo = async () => {
      // Get browser info
      const userAgent = navigator.userAgent;
      let browser = 'Unknown';
      if (userAgent.includes('Edg')) browser = 'Edge';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';

      // Check connection to backend
      let connected = false;
      try {
        const response = await fetch('http://localhost:8000/health');
        connected = response.ok;
      } catch (error) {
        console.error('Connection check failed:', error);
      }

      // Get hostname - fallback to default for extension popup
      const hostname = 'STARKツ555';

      // Check Kite API connection status
      let kiteStatus = false;
      try {
        kiteStatus = kiteService.isAuthenticated();
      } catch (error) {
        console.error('Kite API check failed:', error);
      }

      setSystemInfo({
        enabled: true,
        connected,
        browser,
        hostname,
        kiteStatus,
      });
    };

    fetchSystemInfo();
  }, []);
  
  const handleOpenApp = async () => {
    try {
      // Check authentication status
      const isAuthenticated = await SessionManager.isAuthenticated();
      
      // Create new tab with the appropriate route
      const url = chrome.runtime.getURL(isAuthenticated ? 'index.html#/' : 'index.html#/signin');
      
      await chrome.tabs.create({ 
        url: url
      });
      
      // Close the popup
      window.close();
    } catch (error) {
      console.error('Error opening app:', error);
      // Fallback: just open the main page
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('index.html')
      });
      window.close();
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <span className="popup-title">HedgeX</span>
        <Button 
          onClick={handleOpenApp}
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
        >
          Open App ↗
        </Button>
      </div>
      <div className="popup-content">
        <div className="popup-row">
          <span className="popup-label">Enabled:</span>
          <span className="popup-value">{systemInfo.enabled ? '✅' : '❌'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Connected:</span>
          <span className="popup-value">{systemInfo.connected ? '✔' : '✘'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Kite API:</span>
          <span className="popup-value">{systemInfo.kiteStatus ? '✓' : '✗'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Browser:</span>
          <span className="popup-value">{systemInfo.browser}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Hostname:</span>
          <span className="popup-value">{systemInfo.hostname}</span>
        </div>
      </div>
    </div>
  );
}
