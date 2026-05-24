from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from data_fetcher import fetch_stock_data, prepare_features
from model import train_model, predict_next
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
        X, y, scaler_min, scaler_max, prices = prepare_features(df)
        model = train_model(X, y, epochs=30)
        predicted = predict_next(model, X[-1], scaler_min, scaler_max)
        current = float(prices[-1])
        change_pct = ((predicted - current) / current) * 100
        history = [{"date": str(df.index[i].date()), "price": round(float(prices[i]), 2)} for i in range(-30, 0)]
        return {
            "symbol": symbol.upper(),
            "current_price": round(current, 2),
            "predicted_price": round(predicted, 2),
            "change_pct": round(change_pct, 2),
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
            df = fetch_stock_data(symbol.upper(), period="5d")
            current = round(float(df["Close"].iloc[-1]), 2)
            await websocket.send_text(json.dumps({
                "symbol": symbol.upper(),
                "price": current,
            }))
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        pass
