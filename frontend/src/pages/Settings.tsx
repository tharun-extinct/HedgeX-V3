import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { kiteService } from '@/services/kiteService';
import { Settings, ExternalLink, Shield, AlertTriangle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [kiteConfig, setKiteConfig] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadKiteConfig();
    checkConnection();
  }, []);

  const loadKiteConfig = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['kiteConfig']);
        if (result.kiteConfig) {
          setKiteConfig(result.kiteConfig);
          setIsConnected(!!result.kiteConfig.accessToken);
        }
      }
    } catch (error) {
      console.error('Error loading Kite config:', error);
    }
  };

  const checkConnection = async () => {
    try {
      if (kiteService.isAuthenticated()) {
        const userProfile = await kiteService.getProfile();
        setProfile(userProfile);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!kiteConfig.apiKey || !kiteConfig.apiSecret) {
      toast({
        title: "Configuration Error",
        description: "Please provide both API Key and API Secret",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await kiteService.saveConfig(kiteConfig);
      toast({
        title: "Configuration Saved",
        description: "Kite API configuration has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!kiteConfig.apiKey) {
      toast({
        title: "Configuration Required",
        description: "Please save your API key first",
        variant: "destructive"
      });
      return;
    }

    const loginUrl = kiteService.getLoginUrl();
    window.open(loginUrl, '_blank');
    
    toast({
      title: "Login Required",
      description: "Please complete the Kite login process in the new tab",
    });
  };

  const handleDisconnect = async () => {
    try {
      await kiteService.logout();
      setIsConnected(false);
      setProfile(null);
      setKiteConfig(prev => ({ ...prev, accessToken: '' }));
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Kite",
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from Kite",
        variant: "destructive"
      });
    }
  };

  const handleRequestTokenSubmit = async (requestToken: string) => {
    try {
      setLoading(true);
      const accessToken = await kiteService.generateAccessToken(requestToken);
      setKiteConfig(prev => ({ ...prev, accessToken }));
      setIsConnected(true);
      await checkConnection();
      
      toast({
        title: "Connected Successfully",
        description: "Kite API connection established",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to establish Kite connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Kite API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Zerodha Kite API Configuration
          </CardTitle>
          <CardDescription>
            Configure your Kite Connect API credentials for live trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Trading is restricted to NIFTY 50 stocks only. Get your API credentials from{' '}
              <a 
                href="https://kite.trade/connect/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Kite Connect
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Enter your Kite API Key"
                value={kiteConfig.apiKey}
                onChange={(e) => setKiteConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Enter your Kite API Secret"
                value={kiteConfig.apiSecret}
                onChange={(e) => setKiteConfig(prev => ({ ...prev, apiSecret: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} disabled={loading}>
              Save Configuration
            </Button>
            {!isConnected ? (
              <Button onClick={handleConnect} variant="outline">
                Connect to Kite
              </Button>
            ) : (
              <Button onClick={handleDisconnect} variant="destructive">
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isConnected && profile && (
              <span className="text-sm text-muted-foreground">
                {profile.user_name} ({profile.user_id})
              </span>
            )}
          </div>

          {profile && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Broker:</strong> {profile.broker}
              </div>
              <div>
                <strong>Email:</strong> {profile.email}
              </div>
              <div>
                <strong>Exchanges:</strong> {profile.exchanges?.join(', ')}
              </div>
              <div>
                <strong>Products:</strong> {profile.products?.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Trading Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Restrictions</CardTitle>
          <CardDescription>
            Important limitations for HedgeX trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">NIFTY 50 Only</p>
              <p className="text-sm text-muted-foreground">
                Trading is restricted to NIFTY 50 stocks only for risk management
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">Live Trading</p>
              <p className="text-sm text-muted-foreground">
                All trades are executed with real money through your Kite account
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">Risk Management</p>
              <p className="text-sm text-muted-foreground">
                Please implement your own position sizing and risk management rules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
