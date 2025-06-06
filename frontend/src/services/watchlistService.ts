
import { Stock, Watchlist } from '../types/finance';
import { getStocks } from './financialData';

// Initialize with default watchlists
const defaultWatchlists: Watchlist[] = Array.from({ length: 7 }, (_, i) => ({
  id: `watchlist-${i + 1}`,
  name: `Watchlist ${i + 1}`,
  stocks: []
}));

// Use localStorage to persist watchlists
const WATCHLISTS_KEY = 'finview-watchlists';

// Load watchlists from localStorage or initialize with defaults
export const getWatchlists = (): Watchlist[] => {
  const storedWatchlists = localStorage.getItem(WATCHLISTS_KEY);
  if (storedWatchlists) {
    return JSON.parse(storedWatchlists);
  }
  
  // Initialize with defaults and save to localStorage
  localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(defaultWatchlists));
  return defaultWatchlists;
};

// Save watchlists to localStorage
export const saveWatchlists = (watchlists: Watchlist[]): void => {
  localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
};

// Update a watchlist name
export const updateWatchlistName = (id: string, newName: string): Watchlist[] => {
  const watchlists = getWatchlists();
  const updatedWatchlists = watchlists.map(watchlist => 
    watchlist.id === id ? { ...watchlist, name: newName } : watchlist
  );
  saveWatchlists(updatedWatchlists);
  return updatedWatchlists;
};

// Add a stock to a watchlist
export const addStockToWatchlist = (watchlistId: string, stockId: string): Watchlist[] => {
  const watchlists = getWatchlists();
  const updatedWatchlists = watchlists.map(watchlist => {
    if (watchlist.id === watchlistId && !watchlist.stocks.includes(stockId)) {
      return {
        ...watchlist,
        stocks: [...watchlist.stocks, stockId]
      };
    }
    return watchlist;
  });
  
  saveWatchlists(updatedWatchlists);
  return updatedWatchlists;
};

// Remove a stock from a watchlist
export const removeStockFromWatchlist = (watchlistId: string, stockId: string): Watchlist[] => {
  const watchlists = getWatchlists();
  const updatedWatchlists = watchlists.map(watchlist => {
    if (watchlist.id === watchlistId) {
      return {
        ...watchlist,
        stocks: watchlist.stocks.filter(id => id !== stockId)
      };
    }
    return watchlist;
  });
  
  saveWatchlists(updatedWatchlists);
  return updatedWatchlists;
};

// Get stocks for a specific watchlist
export const getWatchlistStocks = (watchlistId: string): Stock[] => {
  const watchlists = getWatchlists();
  const watchlist = watchlists.find(wl => wl.id === watchlistId);
  
  if (!watchlist) return [];
  
  const allStocks = getStocks();
  return allStocks.filter(stock => watchlist.stocks.includes(stock.id));
};

// Reset watchlists to default
export const resetWatchlists = (): Watchlist[] => {
  saveWatchlists(defaultWatchlists);
  return defaultWatchlists;
};
