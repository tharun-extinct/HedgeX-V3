from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
import sqlite3
from typing import Dict, List, Optional
import json
from ..services.trading_bot import TradingBot
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Active trading bots for each user
active_bots: Dict[int, TradingBot] = {}

class TradingSettings(BaseModel):
    ticker: str
    interval: str
    period: str
    strategy_params: dict
    active: bool = False

class TradingSignal(BaseModel):
    timestamp: datetime
    type: str  # "LONG" or "SHORT"
    strength: float
    price: float

def get_user_settings(db: sqlite3.Connection, user_id: int) -> Optional[TradingSettings]:
    cursor = db.cursor()
    cursor.execute(
        "SELECT ticker, interval, period, strategy_params, active FROM trading_settings WHERE user_id = ?",
        (user_id,)
    )
    result = cursor.fetchone()
    
    if result:
        return TradingSettings(
            ticker=result[0],
            interval=result[1],
            period=result[2],
            strategy_params=json.loads(result[3]),
            active=bool(result[4])
        )
    return None

@router.post("/settings")
async def update_settings(
    settings: TradingSettings,
    user_id: int,  # Would come from auth middleware
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO trading_settings (user_id, ticker, interval, period, strategy_params, active)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET
            ticker = excluded.ticker,
            interval = excluded.interval,
            period = excluded.period,
            strategy_params = excluded.strategy_params,
            active = excluded.active
    """, (
        user_id,
        settings.ticker,
        settings.interval,
        settings.period,
        json.dumps(settings.strategy_params),
        settings.active
    ))
    db.commit()
    
    # Update trading bot if active
    if settings.active:
        if user_id not in active_bots:
            active_bots[user_id] = TradingBot(
                settings.ticker,
                settings.interval,
                settings.period,
                settings.strategy_params
            )
        else:
            active_bots[user_id].update_settings(
                settings.ticker,
                settings.interval,
                settings.period,
                settings.strategy_params
            )
    else:
        if user_id in active_bots:
            active_bots[user_id].stop()
            del active_bots[user_id]
    
    return {"status": "success"}

@router.get("/status")
async def get_status(
    user_id: int,  # Would come from auth middleware
    db: sqlite3.Connection = Depends(get_db)
):
    settings = get_user_settings(db, user_id)
    if not settings:
        raise HTTPException(status_code=404, detail="No trading settings found")
    
    bot = active_bots.get(user_id)
    if not bot:
        return {
            "active": False,
            "last_update": None,
            "current_signals": []
        }
    
    return {
        "active": True,
        "last_update": bot.last_update,
        "current_signals": bot.current_signals
    }

@router.post("/start")
async def start_trading(
    background_tasks: BackgroundTasks,
    user_id: int,  # Would come from auth middleware
    db: sqlite3.Connection = Depends(get_db)
):
    settings = get_user_settings(db, user_id)
    if not settings:
        raise HTTPException(status_code=404, detail="No trading settings found")
    
    if user_id in active_bots:
        return {"status": "already_running"}
    
    bot = TradingBot(
        settings.ticker,
        settings.interval,
        settings.period,
        settings.strategy_params
    )
    active_bots[user_id] = bot
    background_tasks.add_task(bot.start)
    
    # Update settings in DB
    cursor = db.cursor()
    cursor.execute(
        "UPDATE trading_settings SET active = ? WHERE user_id = ?",
        (True, user_id)
    )
    db.commit()
    
    return {"status": "started"}

@router.post("/stop")
async def stop_trading(
    user_id: int,  # Would come from auth middleware
    db: sqlite3.Connection = Depends(get_db)
):
    if user_id not in active_bots:
        return {"status": "not_running"}
    
    active_bots[user_id].stop()
    del active_bots[user_id]
    
    # Update settings in DB
    cursor = db.cursor()
    cursor.execute(
        "UPDATE trading_settings SET active = ? WHERE user_id = ?",
        (False, user_id)
    )
    db.commit()
    
    return {"status": "stopped"}
