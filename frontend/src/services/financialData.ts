
import { Stock, Portfolio, PortfolioAllocation, HistoricalDataPoint } from '../types/finance';

// Initial stock data
const initialStocks: Stock[] = [
  { 
    id: '1', 
    symbol: 'AAPL', 
    name: 'Apple Inc.', 
    price: 174.23, 
    change: 1.25, 
    changePercent: 0.72, 
    volume: 48956321, 
    sector: 'Technology',
    high: 175.10,
    low: 173.05,
    open: 173.50,
  },
  { 
    id: '2', 
    symbol: 'MSFT', 
    name: 'Microsoft Corporation', 
    price: 328.79, 
    change: 2.56, 
    changePercent: 0.78, 
    volume: 21542632, 
    sector: 'Technology',
    high: 330.15,
    low: 326.90,
    open: 327.20,
  },
  { 
    id: '3', 
    symbol: 'AMZN', 
    name: 'Amazon.com Inc.', 
    price: 132.85, 
    change: -0.92, 
    changePercent: -0.69, 
    volume: 32145698, 
    sector: 'Consumer Cyclical',
    high: 133.95,
    low: 132.10,
    open: 133.75,
  },
  { 
    id: '4', 
    symbol: 'GOOGL', 
    name: 'Alphabet Inc.', 
    price: 143.96, 
    change: 1.05, 
    changePercent: 0.73, 
    volume: 18745632, 
    sector: 'Communication Services',
    high: 144.50,
    low: 142.80,
    open: 143.20,
  },
  { 
    id: '5', 
    symbol: 'TSLA', 
    name: 'Tesla, Inc.', 
    price: 175.34, 
    change: -3.21, 
    changePercent: -1.83, 
    volume: 52365412, 
    sector: 'Consumer Cyclical',
    high: 178.90,
    low: 174.30,
    open: 178.50,
  },
  { 
    id: '6', 
    symbol: 'META', 
    name: 'Meta Platforms, Inc.', 
    price: 472.42, 
    change: 5.68, 
    changePercent: 1.21, 
    volume: 15236547, 
    sector: 'Communication Services',
    high: 474.80,
    low: 468.90,
    open: 469.10,
  },
  { 
    id: '7', 
    symbol: 'NVDA', 
    name: 'NVIDIA Corporation', 
    price: 824.12, 
    change: 12.34, 
    changePercent: 1.52, 
    volume: 28563214, 
    sector: 'Technology',
    high: 830.56,
    low: 815.20,
    open: 817.85,
  },
  { 
    id: '8', 
    symbol: 'BRK.B', 
    name: 'Berkshire Hathaway Inc.', 
    price: 408.75, 
    change: 0.32, 
    changePercent: 0.08, 
    volume: 3526589, 
    sector: 'Financial Services',
    high: 409.25,
    low: 407.90,
    open: 408.50,
  },
  { 
    id: '9', 
    symbol: 'JPM', 
    name: 'JPMorgan Chase & Co.', 
    price: 183.56, 
    change: -0.75, 
    changePercent: -0.41, 
    volume: 8562314, 
    sector: 'Financial Services',
    high: 184.80,
    low: 182.90,
    open: 184.20,
  },
  { 
    id: '10', 
    symbol: 'JNJ', 
    name: 'Johnson & Johnson', 
    price: 152.45, 
    change: 0.24, 
    changePercent: 0.16, 
    volume: 5632147, 
    sector: 'Healthcare',
    high: 153.10,
    low: 152.20,
    open: 152.35,
  }
];

// Initial portfolio data
const initialPortfolio: Portfolio = {
  cash: 25000.00,
  totalValue: 163524.87,
  dailyChange: 1432.56,
  dailyChangePercent: 0.88,
  weeklyChange: 3256.78,
  weeklyChangePercent: 2.03,
  monthlyChange: 6789.12,
  monthlyChangePercent: 4.32,
  holdings: [
    { stockId: '1', shares: 50, avgCost: 165.42 },
    { stockId: '2', shares: 20, avgCost: 320.15 },
    { stockId: '4', shares: 30, avgCost: 138.75 },
    { stockId: '6', shares: 15, avgCost: 450.20 },
    { stockId: '7', shares: 10, avgCost: 750.30 },
    { stockId: '8', shares: 25, avgCost: 400.50 },
    { stockId: '10', shares: 40, avgCost: 150.25 },
  ]
};

// Generate random historical data
const generateHistoricalData = (stockSymbol: string, days: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const basePrice = initialStocks.find(s => s.symbol === stockSymbol)?.price || 100;
  const volatility = 0.02; // 2% volatility
  
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random price movement with trend
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice = Math.max(0.1, currentPrice + change);
    
    // Add some noise to volume
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: currentPrice * (1 - Math.random() * 0.01),
      high: currentPrice * (1 + Math.random() * 0.015),
      low: currentPrice * (1 - Math.random() * 0.015),
      close: currentPrice,
      volume
    });
  }
  
  return data;
};

// Calculate portfolio allocation
const calculateAllocation = (stocks: Stock[], portfolio: Portfolio): PortfolioAllocation[] => {
  const stockMap = new Map(stocks.map(stock => [stock.id, stock]));
  const sectorTotals = new Map<string, number>();
  let totalValue = 0;
  
  // Calculate total value and sector totals
  portfolio.holdings.forEach(holding => {
    const stock = stockMap.get(holding.stockId);
    if (stock) {
      const value = stock.price * holding.shares;
      totalValue += value;
      
      const sector = stock.sector;
      sectorTotals.set(sector, (sectorTotals.get(sector) || 0) + value);
    }
  });
  
  // Create allocation objects
  const allocations: PortfolioAllocation[] = [];
  sectorTotals.forEach((value, sector) => {
    allocations.push({
      sector,
      value,
      percentage: (value / totalValue) * 100
    });
  });
  
  return allocations;
};

// Initialize stocks in localStorage if not present
const initializeStocksData = () => {
  if (!localStorage.getItem('stocks')) {
    localStorage.setItem('stocks', JSON.stringify(initialStocks));
  }
  
  if (!localStorage.getItem('portfolio')) {
    localStorage.setItem('portfolio', JSON.stringify(initialPortfolio));
  }
};

// Get stocks data
const getStocks = (): Stock[] => {
  initializeStocksData();
  return JSON.parse(localStorage.getItem('stocks') || '[]');
};

// Get portfolio data
const getPortfolio = (): Portfolio => {
  initializeStocksData();
  return JSON.parse(localStorage.getItem('portfolio') || '{}');
};

// Update stock data with simulated market changes
const updateStocks = (): Stock[] => {
  const stocks = getStocks();
  
  const updatedStocks = stocks.map(stock => {
    // Random fluctuation between -1.5% and +1.5%
    const randomChange = (Math.random() - 0.5) * 0.03;
    const newPrice = parseFloat((stock.price * (1 + randomChange)).toFixed(2));
    const priceChange = parseFloat((newPrice - stock.price).toFixed(2));
    const percentChange = parseFloat(((priceChange / stock.price) * 100).toFixed(2));
    
    // Volumes changes randomly between -10% and +10%
    const volumeChange = Math.floor((Math.random() - 0.5) * 0.2 * stock.volume);
    
    return {
      ...stock,
      price: newPrice,
      change: priceChange,
      changePercent: percentChange,
      volume: Math.max(1000, stock.volume + volumeChange),
      high: Math.max(stock.high, newPrice),
      low: Math.min(stock.low, newPrice)
    };
  });
  
  localStorage.setItem('stocks', JSON.stringify(updatedStocks));
  return updatedStocks;
};

// Update portfolio value based on updated stock prices
const updatePortfolio = (): Portfolio => {
  const portfolio = getPortfolio();
  const stocks = getStocks();
  
  let totalValue = portfolio.cash;
  
  // Calculate new total value
  portfolio.holdings.forEach(holding => {
    const stock = stocks.find(s => s.id === holding.stockId);
    if (stock) {
      totalValue += stock.price * holding.shares;
    }
  });
  
  // Update change percentages
  const dailyChange = totalValue - (totalValue / (1 + portfolio.dailyChangePercent / 100));
  
  const updatedPortfolio = {
    ...portfolio,
    totalValue: parseFloat(totalValue.toFixed(2)),
    dailyChange: parseFloat(dailyChange.toFixed(2)),
    dailyChangePercent: parseFloat((dailyChange / (totalValue - dailyChange) * 100).toFixed(2)),
    // Update weekly and monthly changes with some correlation to daily
    weeklyChange: parseFloat((portfolio.weeklyChange * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
    weeklyChangePercent: parseFloat((portfolio.weeklyChangePercent * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)),
    monthlyChange: parseFloat((portfolio.monthlyChange * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)),
    monthlyChangePercent: parseFloat((portfolio.monthlyChangePercent * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2))
  };
  
  localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
  return updatedPortfolio;
};

// Get historical data for a stock
const getHistoricalData = (symbol: string, timeframe: '1D' | '1W' | '1M' | '6M' | '1Y' | 'All'): HistoricalDataPoint[] => {
  // Map timeframe to number of days
  const daysMap = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '6M': 180,
    '1Y': 365,
    'All': 1825 // 5 years
  };
  
  return generateHistoricalData(symbol, daysMap[timeframe]);
};

// Get portfolio allocation
const getPortfolioAllocation = (): PortfolioAllocation[] => {
  const stocks = getStocks();
  const portfolio = getPortfolio();
  return calculateAllocation(stocks, portfolio);
};

export {
  getStocks,
  getPortfolio,
  updateStocks,
  updatePortfolio,
  getHistoricalData,
  getPortfolioAllocation,
  initializeStocksData
};
