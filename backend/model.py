from sklearn.linear_model import LinearRegression
import numpy as np

def predict_price(prices):
    prices = np.array(prices)
    X = np.arange(len(prices)).reshape(-1, 1)
    y = prices
    model = LinearRegression()
    model.fit(X, y)
    next_day = np.array([[len(prices)]])
    predicted = model.predict(next_day)[0]
    return round(float(predicted), 2)