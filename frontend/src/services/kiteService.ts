// Zerodha Kite API service for HedgeX trading platform
// Handles authentication, market data, and trading operations for NIFTY 50 stocks

interface KiteConfig {
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
}

interface Quote {
  instrument_token: number;
  last_price: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change: number;
  net_change: number;
}

interface Position {
  tradingsymbol: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  product: string;
}

interface Order {
  order_id: string;
  tradingsymbol: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  order_type: 'MARKET' | 'LIMIT';
  status: string;
}

// NIFTY 50 stock symbols - trading restricted to these only
const NIFTY_50_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK',
  'KOTAKBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'ASIANPAINT', 'LT',
  'AXISBANK', 'MARUTI', 'TITAN', 'NESTLEIND', 'BAJFINANCE', 'HCLTECH',
  'ULTRACEMCO', 'WIPRO', 'ONGC', 'NTPC', 'TECHM', 'SUNPHARMA',
  'POWERGRID', 'TATAMOTORS', 'BAJAJFINSV', 'JSWSTEEL', 'DRREDDY',
  'GRASIM', 'COALINDIA', 'INDUSINDBK', 'HEROMOTOCO', 'CIPLA',
  'BRITANNIA', 'EICHERMOT', 'ADANIPORTS', 'BPCL', 'DIVISLAB',
  'TATACONSUM', 'HINDALCO', 'BAJAJ-AUTO', 'APOLLOHOSP', 'HDFCLIFE',
  'SBILIFE', 'TATASTEEL', 'UPL', 'ADANIENT', 'LTIM', 'TRENT'
];

class KiteService {
  private config: KiteConfig;
  private baseUrl = 'https://api.kite.trade';

  constructor() {
    this.config = { apiKey: '', apiSecret: '' };
    this.loadConfig().then(config => {
      this.config = config;
    });
  }

  // Load Kite API configuration from Chrome storage
  private async loadConfig(): Promise<KiteConfig> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['kiteConfig']);
        return result.kiteConfig || { apiKey: '', apiSecret: '' };
      }
      return { apiKey: '', apiSecret: '' };
    } catch (error) {
      console.error('Error loading Kite config:', error);
      return { apiKey: '', apiSecret: '' };
    }
  }

  // Save Kite API configuration
  async saveConfig(config: KiteConfig): Promise<void> {
    this.config = config;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ kiteConfig: config });
    }
  }

  // Validate if symbol is in NIFTY 50
  private isValidNiftySymbol(symbol: string): boolean {
    return NIFTY_50_SYMBOLS.includes(symbol.toUpperCase());
  }

  // Generate login URL for Kite Connect OAuth
  getLoginUrl(): string {
    return `https://kite.trade/connect/login?api_key=${this.config.apiKey}&v=3`;
  }

  // Exchange request token for access token
  async generateAccessToken(requestToken: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/session/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Kite-Version': '3'
      },
      body: new URLSearchParams({
        api_key: this.config.apiKey,
        request_token: requestToken,
        checksum: this.generateChecksum(requestToken)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate access token');
    }

    const data = await response.json();
    this.config.accessToken = data.data.access_token;
    await this.saveConfig(this.config);
    return data.data.access_token;
  }

  // Generate checksum for authentication
  private generateChecksum(requestToken: string): string {
    // This should use crypto library to generate SHA256 hash
    // For now, returning placeholder - implement proper checksum generation
    return 'placeholder_checksum';
  }

  // Get live quotes for NIFTY 50 stocks
  async getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    // Validate all symbols are NIFTY 50
    const validSymbols = symbols.filter(symbol => this.isValidNiftySymbol(symbol));
    
    if (validSymbols.length === 0) {
      throw new Error('No valid NIFTY 50 symbols provided');
    }

    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'X-Kite-Version': '3'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }

    const data = await response.json();
    return data.data;
  }

  // Get current positions
  async getPositions(): Promise<Position[]> {
    const response = await fetch(`${this.baseUrl}/portfolio/positions`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'X-Kite-Version': '3'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch positions');
    }

    const data = await response.json();
    // Filter only NIFTY 50 positions
    return data.data.net.filter((position: Position) => 
      this.isValidNiftySymbol(position.tradingsymbol)
    );
  }

  // Place order (restricted to NIFTY 50)
  async placeOrder(params: {
    symbol: string;
    transactionType: 'BUY' | 'SELL';
    quantity: number;
    orderType: 'MARKET' | 'LIMIT';
    price?: number;
    product: 'CNC' | 'MIS' | 'NRML';
  }): Promise<string> {
    // Validate symbol is in NIFTY 50
    if (!this.isValidNiftySymbol(params.symbol)) {
      throw new Error(`Trading restricted to NIFTY 50 stocks. ${params.symbol} is not allowed.`);
    }

    const orderParams = {
      tradingsymbol: params.symbol,
      exchange: 'NSE',
      transaction_type: params.transactionType,
      order_type: params.orderType,
      quantity: params.quantity.toString(),
      product: params.product,
      validity: 'DAY',
      ...(params.price && { price: params.price.toString() })
    };

    const response = await fetch(`${this.baseUrl}/orders/regular`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Kite-Version': '3'
      },
      body: new URLSearchParams(orderParams)
    });

    if (!response.ok) {
      throw new Error('Failed to place order');
    }

    const data = await response.json();
    return data.data.order_id;
  }

  // Get order history
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'X-Kite-Version': '3'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    // Filter only NIFTY 50 orders
    return data.data.filter((order: Order) => 
      this.isValidNiftySymbol(order.tradingsymbol)
    );
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/orders/regular/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'X-Kite-Version': '3'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }
  }

  // Get user profile and trading status
  async getProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.config.apiKey}:${this.config.accessToken}`,
        'X-Kite-Version': '3'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.data;
  }

  // Check if authenticated with Kite
  isAuthenticated(): boolean {
    return !!(this.config.accessToken && this.config.apiKey);
  }

  // Get NIFTY 50 symbols list
  getNifty50Symbols(): string[] {
    return [...NIFTY_50_SYMBOLS];
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    this.config.accessToken = undefined;
    await this.saveConfig(this.config);
  }
}

export const kiteService = new KiteService();
export { NIFTY_50_SYMBOLS };
