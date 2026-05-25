import React, { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface StockData {
  symbol: string;
  current_price: number;
  predicted_price: number;
  change_pct: number;
  signal: string;
  history: { date: string; price: number }[];
}

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await axios.get(`http://localhost:8001/analyze/${symbol}`);
      if (res.data.error) setError(res.data.error);
      else setData(res.data);
    } catch (e) {
      setError("Backend connect hovat nahi!");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "Arial, sans-serif", padding: "30px" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", color: "#00d4ff" }}>📈 Market Predictor</h1>
      <p style={{ textAlign: "center", color: "#888" }}>LSTM Neural Network — Stock Price Prediction</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "30px 0" }}>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL, TSLA, GOOGL..."
          style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #333", background: "#1a1a2e", color: "white", fontSize: "1rem", width: "200px" }}
        />
        <button
          onClick={analyze}
          disabled={loading}
          style={{ padding: "12px 30px", borderRadius: "8px", background: loading ? "#333" : "#00d4ff", color: "#000", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          {loading ? "Analyzing..." : "Analyze 🚀"}
        </button>
      </div>

      {error && <p style={{ textAlign: "center", color: "#ff4444" }}>{error}</p>}

      {loading && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ color: "#00d4ff", fontSize: "1.2rem" }}>🧠 LSTM Model Training...</p>
          <p style={{ color: "#888" }}>1-2 minutes lagel</p>
        </div>
      )}

      {data && (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" }}>
            {[
              { label: "Symbol", value: data.symbol, color: "#00d4ff" },
              { label: "Current Price", value: `$${data.current_price}`, color: "white" },
              { label: "Predicted Price", value: `$${data.predicted_price}`, color: data.change_pct > 0 ? "#00ff88" : "#ff4444" },
              { label: "Signal", value: data.signal, color: data.signal === "BUY" ? "#00ff88" : "#ff4444" },
            ].map((card, i) => (
              <div key={i} style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", textAlign: "center", border: `1px solid ${card.color}33` }}>
                <p style={{ color: "#888", margin: "0 0 8px 0", fontSize: "0.85rem" }}>{card.label}</p>
                <p style={{ color: card.color, margin: 0, fontSize: "1.4rem", fontWeight: "bold" }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", border: "1px solid #333" }}>
            <h3 style={{ color: "#00d4ff", marginTop: 0 }}>30 Day Price History + Prediction</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 10 }} interval={4} />
                <YAxis stroke="#888" domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }} />
                <ReferenceLine y={data.predicted_price} stroke="#00ff88" strokeDasharray="5 5" label={{ value: "Predicted", fill: "#00ff88", fontSize: 12 }} />
                <Line type="monotone" dataKey="price" stroke="#00d4ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "20px", marginTop: "15px", border: `1px solid ${data.signal === "BUY" ? "#00ff8833" : "#ff444433"}` }}>
            <h3 style={{ color: data.signal === "BUY" ? "#00ff88" : "#ff4444", margin: "0 0 10px 0" }}>
              {data.signal === "BUY" ? "✅ BUY Signal" : "🔴 SELL Signal"}
            </h3>
            <p style={{ color: "#888", margin: 0 }}>
              LSTM model predicts {data.change_pct > 0 ? "+" : ""}{data.change_pct}% change.
              Current: ${data.current_price} → Predicted: ${data.predicted_price}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
