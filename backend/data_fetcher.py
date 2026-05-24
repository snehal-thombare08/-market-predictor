import yfinance as yf
import pandas as pd
import numpy as np

def fetch_stock_data(symbol: str, period: str = "1y") -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period)
    df = df[["Close", "Volume", "High", "Low", "Open"]]
    df.dropna(inplace=True)
    return df

def prepare_features(df: pd.DataFrame, lookback: int = 60):
    prices = df["Close"].values
    scaler_min = prices.min()
    scaler_max = prices.max()
    scaled = (prices - scaler_min) / (scaler_max - scaler_min)
    X, y = [], []
    for i in range(lookback, len(scaled)):
        X.append(scaled[i-lookback:i])
        y.append(scaled[i])
    return np.array(X), np.array(y), scaler_min, scaler_max, prices
