from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from data_fetcher import fetch_stock_data
from model import predict_price
import json
import asyncio

app = FastAPI(title="Market Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Market Predictor API Running!"}

@app.get("/analyze/{symbol}")
async def analyze(symbol: str):
    try:
        df = fetch_stock_data(symbol.upper())
        prices = df["Close"].values.tolist()
        predicted = predict_price(prices)
        current = round(float(prices[-1]), 2)
        change_pct = round(((predicted - current) / current) * 100, 2)
        history = [{"date": str(df.index[i].date()), "price": round(float(prices[i]), 2)} for i in range(-30, 0)]
        return {
            "symbol": symbol.upper(),
            "current_price": current,
            "predicted_price": predicted,
            "change_pct": change_pct,
            "signal": "BUY" if change_pct > 0 else "SELL",
            "history": history,
        }
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            df = fetch_stock_data(symbol.upper())
            current = round(float(df["Close"].iloc[-1]), 2)
            await websocket.send_text(json.dumps({"symbol": symbol.upper(), "price": current}))
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        pass