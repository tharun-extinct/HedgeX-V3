from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
import threading
from datetime import datetime
import logging
from pathlib import Path
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import route modules

# Initialize FastAPI app
app = FastAPI(title="HedgeX Local API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "vscode-webview://*",  # Allow VS Code webview
        "chrome-extension://*", # Allow Chrome extension
        "edge-extension://*",   # Allow Edge extension
        'http://localhost:8080'
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# CORS settings for local development
from app.routes import auth, trading

# SQLite database setup
DB_PATH = Path.home() / ".hedgex" / "data.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    try:
        return conn
    except:
        logger.error(f"Database connection error: {e}")
         

# Initialize database tables
def init_db():
    conn =get_db()
    print(conn,'fdsfdsg')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create trading_settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trading_settings (
            user_id INTEGER PRIMARY KEY,
            ticker TEXT NOT NULL,
            interval TEXT NOT NULL,
            period TEXT NOT NULL,
            strategy_params JSON NOT NULL,
            active BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    conn.commit()

# Initialize DB on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    logger.info("Database initialized")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Import and include other route modules
from app.routes import auth, trading
# Note: watchlist module appears to be imported but not yet created

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(trading.router, prefix="/trading", tags=["trading"])
# Commented out until watchlist module is created
# app.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
