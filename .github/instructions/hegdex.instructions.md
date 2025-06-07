---
applyTo: 'HedgeX'
---

# HedgeX Comprehensive Development Guide

## Project Overview

HedgeX is a high frequency trading software built exclusively as a browser extension that integrates with Zerodha Kite API. It specializes in algorithmic trading strategies for NIFTY 50 stocks only, offering microsecond execution speeds, advanced market signal processing, and automated decision making for optimal trade execution.

### Architecture Overview

- **Browser Extension**: Chrome/Edge Extension with Manifest V3
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + SQLite with high-speed Zerodha Kite API integration
- **Trading**: High frequency trading exclusively for NIFTY 50 stocks
- **Deployment**: Browser extension distributed via Chrome Web Store / Edge Add-ons

### Recent Updates
- Advanced algorithm monitoring dashboard with real-time performance metrics
- Sub-millisecond latency optimization for Kite API connections
- Multi-strategy support with automated switching based on market conditions
- Improved backtesting engine with NIFTY 50 historical data
- Machine learning signal enhancement for noise reduction
- Automated circuit breakers for risk management during high volatility


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

#### Core High Frequency Trading Components
- **NIFTY 50 Stocks Only**: Exclusive focus on India's top 50 companies by market cap
- **Microsecond Execution**: Ultra-low latency order execution through Kite API
- **Algorithmic Strategies**: Statistical arbitrage, market making, and trend following algorithms
- **Signal Processing**: Real-time market data analysis with noise filtering
- **Risk Management**: Automated position sizing and stop-loss mechanisms

#### Zerodha Kite API Integration
- **High-Speed Authentication**: Optimized OAuth-based connection with Kite Connect
- **Trading Algorithms**: Rapid order execution, modification, and cancellation for NIFTY 50
- **Real-time Data Processing**: Sub-millisecond market data ingestion and analysis
- **Backtesting Engine**: Historical data analysis for strategy optimization
- **Advanced Configuration**: Fine-tuned API parameters for minimal latency

### Application Features

#### Core Functionality
1. **High Frequency Trading**: Automated algorithmic trading for NIFTY 50 stocks only
2. **Strategy Execution**: Multiple algorithmic strategies with real-time switching
3. **Market Microstructure Analysis**: Tick-by-tick data processing for edge detection
4. **Statistical Arbitrage**: Pair trading and statistical correlation exploitation
5. **Advanced Order Types**: TWAP, VWAP, and Iceberg order implementations
6. **Algorithm Monitoring**: Real-time performance metrics and health monitoring
7. **Parameter Optimization**: Automated strategy parameter tuning

#### Browser Extension Features
1. **Algorithm Control Center**: Compact popup interface to monitor and control trading algorithms
2. **Real-time Performance Dashboard**: Complete algorithmic trading metrics in new tab
3. **Strategy Switching**: Quick toggling between different trading algorithms
4. **Latency Optimization**: Minimal overhead for maximum execution speed
5. **Secure Credential Storage**: Encrypted storage for Kite API credentials
6. **Cross-Browser Compatibility**: Consistent performance across Chrome and Edge

## Technical Standards

### Frontend Development
- High-performance React with optimized rendering cycles
- Memory-efficient TypeScript with strict type checking
- Minimal UI re-renders for algorithm monitoring
- Chrome extension APIs for low-latency data handling
- Web Workers for non-blocking computational tasks

### Backend Development
- Ultra-fast FastAPI with asynchronous request handling
- In-memory data processing with SQLite for persistence
- Optimized Zerodha Kite Connect integration for minimal latency
- Websocket connections for real-time market data
- Efficient threading for parallel strategy execution

### Extension Development
- Manifest V3 compliance
- Service worker background script
- Popup interface with compact UI design
- Chrome storage for settings persistence
- Tab management for full app access

## Build and Deployment

### Development Setup
1. Backend: High-performance FastAPI server with Kite API integration
2. Frontend: Optimized Vite development with minimal bundle sizes
3. Extension: Low-overhead Chrome extension with performance monitoring

### Build Process
1. Backend: Compiled PyInstaller executable with native optimizations
2. Frontend: Tree-shaken and minified production bundles
3. Extension: Optimized package with minimal resource consumption

### High Frequency Optimization
- Low-latency API connectivity for microsecond execution
- Memory profiling and leak prevention
- CPU usage optimization for algorithmic processing
- Network packet optimization for minimal data transfer
- NIFTY 50 only trading validation for focused execution

## Testing Guidelines

### Algorithm Testing
- Performance benchmarking for execution speed
- Strategy backtesting with historical market data
- Stress testing under high market volatility conditions
- Statistical validation of trading signals
- Memory and CPU profiling during continuous operation

### System Testing
- Latency measurement across the entire execution pipeline
- API throughput testing with simulated market conditions
- Failure recovery and circuit breaker validation
- Cross-browser performance consistency validation
- Security and penetration testing for API credentials

## Git Workflow and Version Control

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features  
- `feature/*`: Individual feature development
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Commit Standards
- Conventional commit format with type and scope
- Clear descriptions of changes
- Reference issue numbers where applicable

## Security Considerations

### Algorithm Security
- Strategy logic protection and obfuscation
- Real-time trade validation before execution
- Circuit breakers for abnormal market conditions
- Trading limits with automatic enforcement
- Anomaly detection for unusual market behavior

### API Security
- End-to-end encryption for Kite API communications
- Secure credential storage with hardware-level protection
- API rate limiting to prevent quota exhaustion
- Session management with automatic timeouts
- IP restriction and geofencing capabilities

### Trading Risk Management
- Maximum order size limits for NIFTY 50 stocks only
- Position concentration limits with automatic enforcement
- Drawdown controls with trading suspension
- Market impact analysis before large orders
- Comprehensive audit logging for regulatory compliance

## Key Development Considerations

### High Frequency Architecture
- Algorithmic trading engine with minimal overhead
- Event-driven architecture for microsecond response times
- Memory optimization for continuous operation
- Asynchronous processing for non-blocking execution
- Performance profiling and bottleneck elimination

### Algorithmic Strategy Implementation
- Zerodha Kite API integration with optimized request patterns
- NIFTY 50 stock universe with strict validation
- Statistical models for market inefficiency detection
- Machine learning signal processors for noise reduction
- Advanced risk management with automated circuit breakers

### Market Data Processing
- Tick-by-tick data ingestion with minimal latency
- In-memory data structures for rapid access
- Real-time analytics pipeline for signal generation
- Custom time-series database for pattern recognition
- Sub-millisecond decision making algorithms

### Algorithm Monitoring
- Real-time performance dashboards for strategy evaluation
- Latency tracking and optimization suggestions
- Adaptive parameter tuning based on market conditions
- Automated failure recovery mechanisms
- Comprehensive logging for post-trade analysis
