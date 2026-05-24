import torch
import torch.nn as nn
import numpy as np

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2):
        super(LSTMModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

def train_model(X, y, epochs=50):
    model = LSTMModel()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()
    X_t = torch.FloatTensor(X).unsqueeze(-1)
    y_t = torch.FloatTensor(y).unsqueeze(-1)
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        output = model(X_t)
        loss = criterion(output, y_t)
        loss.backward()
        optimizer.step()
    return model

def predict_next(model, last_sequence, scaler_min, scaler_max):
    model.eval()
    with torch.no_grad():
        x = torch.FloatTensor(last_sequence).unsqueeze(0).unsqueeze(-1)
        pred_scaled = model(x).item()
    return pred_scaled * (scaler_max - scaler_min) + scaler_min
