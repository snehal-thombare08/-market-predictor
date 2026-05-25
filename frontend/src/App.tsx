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

export default function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`https://market-predictor-api.onrender.com/analyze/${symbol}`);
      if (res.data.error) setError(res.data.error);
      else setData(res.data);
    } catch (e) {
      setError("Backend connect hovat nahi!");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", color: "#38bdf8" }}>
        📈 Market Predictor
      </h1>
      <p style={{ textAlign: "center", color: "#94a3b8" }}>AI-powered stock price prediction</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "30px 0" }}>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL, TSLA, GOOGL..."
          style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: "1rem" }}
        />
        <button
          onClick={analyze}
          disabled={loading}
          style={{ padding: "12px 24px", borderRadius: "8px", background: "#38bdf8", color: "#0f172a", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          {loading ? "Analyzing..." : "Analyze 🚀"}
        </button>
      </div>

      {error && <p style={{ textAlign: "center", color: "#f87171" }}>{error}</p>}

      {data && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Current Price</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#38bdf8" }}>${data.current_price}</div>
            </div>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Predicted Price</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#a78bfa" }}>${data.predicted_price}</div>
            </div>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Signal</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: data.signal === "BUY" ? "#4ade80" : "#f87171" }}>
                {data.signal === "BUY" ? "✅ BUY" : "🔴 SELL"}
              </div>
            </div>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Change</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: data.change_pct > 0 ? "#4ade80" : "#f87171" }}>
                {data.change_pct > 0 ? "+" : ""}{data.change_pct}%
              </div>
            </div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#94a3b8", marginBottom: "16px" }}>30-Day Price History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <ReferenceLine y={data.predicted_price} stroke="#a78bfa" strokeDasharray="5 5" label={{ value: "Predicted", fill: "#a78bfa", fontSize: 12 }} />
                <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}