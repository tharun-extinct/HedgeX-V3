---
applyTo: 'HedgeX'
title: HedgeX Comprehensive Development Guide
created: 2023-10-01
lastUpdated: 2024-12-28
authors:
  - name: THARUN KUMAR
    role: Lead Developer
    email: 
---

# HedgeX Comprehensive Development Guide

## Project Overview

HedgeX is a modern financial trading platform built exclusively as a browser extension. It provides portfolio management, stock tracking, performance analysis, and simulated trading capabilities. The platform consists of a React.js frontend with TypeScript, a FastAPI Python backend, and Chrome extension architecture for seamless browser integration.

### Architecture Overview

- **Browser Extension**: Chrome/Edge Extension with Manifest V3 using React + TypeScript + Vite
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + SQLite + PyInstaller (for standalone executable)
- **Deployment**: Browser extension distributed via Chrome Web Store / Edge Add-ons

## Project Structure

```
HedgeX-V3/
├── frontend/                    # React frontend application
│   ├── public/
│   │   ├── manifest.json       # Chrome extension manifest
│   │   ├── background.js       # Extension service worker
│   │   └── index.html          # Main app entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   └── extension/     # Extension popup components
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API and data services
│   │   ├── contexts/          # React contexts
│   │   ├── types/             # TypeScript type definitions
│   │   ├── styles/            # CSS stylesheets
│   │   ├── config/            # Configuration files
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Web app entry point
│   │   └── popup.tsx          # Extension popup entry point
│   ├── popup.html             # Extension popup HTML
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   └── trading.py     # Trading-related endpoints
│   │   └── main.py            # FastAPI application
│   ├── hooks/                 # PyInstaller build hooks
│   ├── hedgex.spec           # PyInstaller specification
│   └── requirements.txt
├── .github/
│   └── instructions/
│       └── hegdex.instructions.md  # This file
├── .gitignore
└── README.md
```

## Domain Knowledge

### Financial Trading Concepts

#### Core Financial Entities
- **Stock**: Represents equity shares with symbol, price, change data
- **Portfolio**: Collection of stock holdings with total value calculations
- **Watchlist**: User-curated lists of stocks for monitoring
- **Performance Metrics**: Daily, weekly, monthly returns and volatility

#### Key Financial Calculations
- **Portfolio Value**: Sum of (shares × current_price) for all holdings
- **Daily Change**: (current_price - previous_close) / previous_close × 100
- **Performance**: (current_value - initial_investment) / initial_investment × 100
- **Allocation**: Individual stock value / total portfolio value × 100

#### Time Series Data
- **Timeframes**: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- **OHLCV Data**: Open, High, Low, Close, Volume for each time period
- **Moving Averages**: 20-day, 50-day, 200-day simple moving averages
- **Technical Indicators**: RSI, MACD, Bollinger Bands (future implementation)

### Application Features

#### Core Functionality
1. **Portfolio Management**: Track multiple stock holdings
2. **Real-time Updates**: Simulated market data updates
3. **Performance Analytics**: Charts and metrics visualization
4. **Sector Allocation**: Portfolio diversification analysis
5. **Watchlist Management**: Create and manage stock watch lists
6. **Simulated Trading**: Buy/sell without real money
7. **User Authentication**: Local user accounts with secure storage

#### Browser Extension Features
1. **Popup Interface**: Compact status display (280×160px) showing system status
2. **Full Dashboard Access**: Open complete trading dashboard in new tab
3. **Authentication Persistence**: Login state persists until browser session ends
4. **System Status**: Backend connection, browser info, hostname display
5. **Chrome Storage**: Extension-specific data persistence
6. **Cross-Browser Support**: Compatible with Chrome and Edge browsers

## Technical Standards

### Frontend Development

#### React/TypeScript Guidelines

```typescript
// Component naming: PascalCase
export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  // Hooks first, then state
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Effects after state
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Early returns for loading/error states
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Main component JSX
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
};
```

#### Type Definitions
```typescript
// types/finance.ts
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: number;
}

export interface Portfolio {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  averageCost: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
}
```

#### Component Architecture
- **Page Components**: Top-level route components (Dashboard, Account, etc.)
- **UI Components**: Reusable shadcn/ui components
- **Dashboard Components**: Feature-specific components (StockList, PerformanceChart)
- **Extension Components**: Browser extension popup components

#### State Management
- **React Context**: Authentication state (`AuthContext`)
- **Local State**: Component-specific state with `useState`
- **React Query**: Server state management (future implementation)
- **Chrome Storage**: Extension data persistence

#### Styling Guidelines
```css
/* Tailwind CSS utility-first approach */
.dashboard-card {
  @apply bg-card border rounded-lg p-6 shadow-sm;
}

/* Custom CSS for extension-specific styling */
.popup-container {
  width: 280px;
  height: 160px;
  padding: 12px;
  background: var(--background);
  color: var(--foreground);
}
```

### Backend Development

#### FastAPI Standards

```python
# main.py - Application setup
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HedgeX Local API",
    version="3.0",
    description="Local backend for HedgeX trading platform"
)

# CORS configuration for extension compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "vscode-webview://*",
        "chrome-extension://*",
        "edge-extension://*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### API Design Patterns
```python
# routes/trading.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

router = APIRouter()

@router.get("/stocks", response_model=List[Stock])
async def get_stocks(
    sector: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Stock]:
    """Get all stocks with optional sector filtering."""
    try:
        # Business logic
        return stocks
    except Exception as e:
        logger.error(f"Error fetching stocks: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

#### Database Standards
- **SQLite**: Local file-based database for simplicity
- **Location**: `~/.hedgex/data.db` for user data persistence
- **Connection Pool**: Thread-safe database connections
- **Migrations**: Manual schema management (future: Alembic)

### Extension Development

#### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "name": "HedgeX Trading Platform",
  "version": "3.0",
  "permissions": ["storage", "tabs"],
  "host_permissions": ["http://localhost:8000/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "HedgeX"
  }
}
```

#### Chrome APIs Usage
```typescript
// Extension-specific storage
const storeData = async (key: string, value: any) => {
  await chrome.storage.local.set({ [key]: value });
};

const getData = async (key: string) => {
  const result = await chrome.storage.local.get([key]);
  return result[key];
};

// Tab management
const openApp = () => {
  chrome.tabs.create({ 
    url: chrome.runtime.getURL('index.html')
  });
};
```

## Build and Deployment

### Development Setup

1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app/main.py
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build:extension  # Extension build
```

### Build Configurations

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'popup.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

#### PyInstaller Configuration
```python
# hedgex.spec
a = Analysis(
    ['app/main.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'sqlite3', '_sqlite3', 'jwt',
        'cryptography', 'cryptography.hazmat'
    ],
    hookspath=['hooks'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    cipher=None,
    noarchive=False,
)
```

### Production Build

1. **Backend Executable**:
```bash
cd backend
pyinstaller hedgex.spec
# Output: dist/HedgeX-Backend.exe
```

2. **Extension Package**:
```bash
cd frontend
npm run build:extension
# Output: dist/ folder ready for Chrome extension loading
```

## Testing Guidelines

### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioSummary } from './PortfolioSummary';

describe('PortfolioSummary', () => {
  it('displays portfolio total value', () => {
    const mockPortfolio = {
      totalValue: 10000,
      dailyChange: 150,
      dailyChangePercent: 1.5
    };
    
    render(<PortfolioSummary portfolio={mockPortfolio} />);
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });
});
```

### Backend Testing
```python
# API testing with FastAPI TestClient
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_stocks():
    response = client.get("/trading/stocks")
    assert response.status_code == 200
    assert len(response.json()) > 0
```

## Git Workflow and Version Control

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Commit Message Format
```
type(scope): description

feat(dashboard): add portfolio allocation chart
fix(auth): resolve token expiration handling
docs(readme): update installation instructions
refactor(api): optimize database query performance
```

### Git Ignore Patterns
```gitignore
# Build outputs
frontend/dist/
backend/dist/
backend/build/

# Dependencies
node_modules/
backend/venv/

# Environment files
.env
.env.local

# Database files
*.db
*.sqlite

# Large files and binaries
*.exe
*.dmg
*.pkg
```

## Performance Optimization

### Frontend Performance
1. **Code Splitting**: Lazy load pages and heavy components
2. **Bundle Optimization**: Use Vite's automatic chunking
3. **Image Optimization**: Compress and lazy load images
4. **Memory Management**: Cleanup intervals and subscriptions

### Backend Performance
1. **Database Indexing**: Index frequently queried columns
2. **Connection Pooling**: Reuse database connections
3. **Caching**: In-memory caching for market data
4. **Async Operations**: Use async/await for I/O operations

## Security Considerations

### Frontend Security
1. **Input Validation**: Sanitize all user inputs
2. **XSS Prevention**: Use React's built-in escaping
3. **Content Security Policy**: Implement CSP headers
4. **Extension Permissions**: Minimal required permissions

### Backend Security
1. **Authentication**: JWT tokens with expiration
2. **Password Hashing**: bcrypt for password storage
3. **SQL Injection**: Use parameterized queries
4. **CORS**: Strict origin validation

## Debugging and Development Tools

### Browser Extension Debugging
1. **Chrome DevTools**: Inspect popup and background scripts
2. **Extension Management**: Load unpacked for development
3. **Console Logging**: Use chrome.runtime.lastError checking
4. **Storage Inspection**: chrome://extensions/ developer mode

### Backend Debugging
1. **FastAPI Docs**: Auto-generated at `/docs`
2. **Logging**: Structured logging with levels
3. **Database Browser**: SQLite browser for data inspection
4. **API Testing**: Use Postman or curl for endpoint testing

## Common Development Challenges and Solutions

### Challenge 1: Extension CORS Issues
**Problem**: Extension cannot communicate with local backend
**Solution**: Configure CORS middleware with chrome-extension://* origins

### Challenge 2: Git Large File Issues
**Problem**: Build artifacts causing repository bloat
**Solution**: Use .gitignore and git-lfs for large files

### Challenge 3: TypeScript Build Errors
**Problem**: Type mismatches in component props
**Solution**: Define strict interfaces and use proper type guards

### Challenge 4: Database Connection Errors
**Problem**: SQLite database locking issues
**Solution**: Use connection pooling and proper transaction handling

### Challenge 5: Extension Popup Size Constraints
**Problem**: Limited space for UI elements
**Solution**: Design compact layouts with essential information only

## Future Enhancement Roadmap

### Short-term (1-3 months)
1. Real-time WebSocket market data
2. Advanced charting with technical indicators
3. Portfolio optimization algorithms
4. Mobile responsive improvements

### Medium-term (3-6 months)
1. Multi-user support with cloud sync
2. Advanced risk analytics
3. Automated trading strategies
4. Integration with real market data APIs

### Long-term (6+ months)
1. Machine learning price predictions
2. Social trading features
3. Cryptocurrency support
4. Mobile app development

## Development Best Practices

### Code Quality
1. **Linting**: Use ESLint and Prettier for consistent formatting
2. **Type Safety**: Strict TypeScript configuration
3. **Code Reviews**: Peer review all pull requests
4. **Documentation**: Comment complex business logic

### Performance Monitoring
1. **Bundle Analysis**: Regular bundle size monitoring
2. **Load Testing**: Test API endpoints under load
3. **Memory Profiling**: Monitor for memory leaks
4. **User Experience**: Core Web Vitals monitoring

### Maintenance
1. **Dependency Updates**: Regular security updates
2. **Database Cleanup**: Archive old data periodically
3. **Error Monitoring**: Log and track application errors
4. **Backup Strategy**: Regular data backups

## Troubleshooting Guide

### Common Issues

1. **Backend Won't Start**
   - Check Python virtual environment activation
   - Verify all dependencies installed
   - Check port 8000 availability
   - Review error logs

2. **Extension Not Loading**
   - Verify manifest.json syntax
   - Check Chrome extension developer mode
   - Review browser console errors
   - Confirm file permissions

3. **Database Errors**
   - Check SQLite file permissions
   - Verify database file path
   - Review connection string
   - Check disk space availability

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all imports are correct
   - Review Vite configuration

This comprehensive guide should serve as the definitive reference for developing and maintaining the HedgeX platform. Keep this document updated as the project evolves and new patterns emerge.