import React, { useState, useEffect } from "react";
import {
  MapPin,
  Settings,
  AlertTriangle,
  TrendingUp,
  Clock,
  Volume2,
  VolumeX,
  Download,
  Play,
  Pause,
} from "lucide-react";
import "./TrafficPage.css";

// Mock data generator
const generateMockData = () => ({
  currentDb: Math.floor(Math.random() * 40) + 40, // 40-80 dB
  isHighNoise: Math.random() > 0.7,
  trafficSignal: ["green", "yellow", "red"][Math.floor(Math.random() * 3)],
  timer: Math.floor(Math.random() * 30) + 10,
  timestamp: new Date(),
});

/* --------------------- Components --------------------- */

// Noise Gauge
const NoiseLevelGauge = ({ currentDb }) => {
  const getGaugeColor = (db) => {
    if (db < 55) return "#22c55e";
    if (db < 70) return "#eab308";
    return "#ef4444";
  };

  const getGaugeLevel = (db) => Math.min((db / 100) * 100, 100);

  return (
    <div className="card">
      <h3 className="card-title">
        <Volume2 className="mr-2" size={20} /> Live Noise Level
      </h3>
      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getGaugeColor(currentDb)}
            strokeWidth="8"
            strokeDasharray={`${getGaugeLevel(currentDb) * 2.83} 283`}
          />
        </svg>
        <div className="gauge-text" style={{ color: getGaugeColor(currentDb) }}>
          <div className="gauge-value">{currentDb}</div>
          <div className="gauge-unit">dB</div>
          <div
            className={`gauge-status ${
              currentDb < 55 ? "safe" : currentDb < 70 ? "moderate" : "high"
            }`}
          >
            {currentDb < 55 ? "Safe" : currentDb < 70 ? "Moderate" : "High"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Traffic Signal
const TrafficSignalStatus = ({ signal, timer }) => {
  return (
    <div className="card">
      <h3 className="card-title">
        <Clock className="mr-2" size={20} /> Traffic Signal Status
      </h3>
      <div className="signal-container">
        <div className={`signal-light ${signal}`}>{signal.toUpperCase()}</div>
        <div className="signal-timer">
          <div className="timer-value">{timer}</div>
          <div className="timer-label">seconds left</div>
        </div>
      </div>
    </div>
  );
};

// Noise Alert
const NoiseFlagIndicator = ({ isHighNoise }) => (
  <div className="card">
    <h3 className="card-title">Noise Alert Status</h3>
    <div className={`alert ${isHighNoise ? "alert-high" : "alert-normal"}`}>
      {isHighNoise ? <VolumeX size={20} /> : <Volume2 size={20} />}
      <span>{isHighNoise ? "High Noise Detected ❌" : "Normal Noise Level ✅"}</span>
    </div>
  </div>
);

// Graph
const LiveGraph = ({ data }) => (
  <div className="card">
    <h3 className="card-title">
      <TrendingUp className="mr-2" size={20} /> Live Noise Levels
    </h3>
    <svg className="graph" viewBox="0 0 400 200">
      {data.map((point, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * 400}
          cy={200 - (point.db / 100) * 200}
          r="3"
          fill="#3b82f6"
        />
      ))}
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        points={data
          .map(
            (p, i) => `${(i / (data.length - 1)) * 400},${200 - (p.db / 100) * 200}`
          )
          .join(" ")}
      />
    </svg>
  </div>
);

// Stats
const StatisticsPanel = ({ stats }) => (
  <div className="card">
    <h3 className="card-title">Today's Statistics</h3>
    <div className="stats-grid">
      <div className="stat blue">
        <div className="stat-value">{stats.avgNoise}</div>
        <div>Avg dB</div>
      </div>
      <div className="stat red">
        <div className="stat-value">{stats.violations}</div>
        <div>Violations</div>
      </div>
      <div className="stat yellow">
        <div className="stat-value">{stats.timerExtensions}</div>
        <div>Extensions</div>
      </div>
      <div className="stat green">
        <div className="stat-value">{stats.peakTime}</div>
        <div>Peak Hour</div>
      </div>
    </div>
  </div>
);

// Alerts
const AlertsPanel = ({ alerts }) => (
  <div className="card">
    <h3 className="card-title">
      <AlertTriangle className="mr-2" size={20} /> Recent Alerts
    </h3>
    <div className="alerts-list">
      {alerts.map((a, i) => (
        <div key={i} className={`alert-item ${a.type}`}>
          <div>{a.message}</div>
          <small>{a.time}</small>
        </div>
      ))}
    </div>
  </div>
);

// Control Panel
const ControlPanel = ({ thresholdDb, setThresholdDb, adaptiveMode, setAdaptiveMode }) => (
  <div className="card">
    <h3 className="card-title">
      <Settings className="mr-2" size={20} /> Control Panel
    </h3>
    <label>Noise Threshold ({thresholdDb} dB)</label>
    <input
      type="range"
      min="50"
      max="80"
      value={thresholdDb}
      onChange={(e) => setThresholdDb(parseInt(e.target.value))}
    />
    <div className="adaptive">
      <span>Adaptive Mode</span>
      <button onClick={() => setAdaptiveMode(!adaptiveMode)}>
        {adaptiveMode ? "ON" : "OFF"}
      </button>
    </div>
    <button className="manual-btn">Manual Override</button>
  </div>
);

/* --------------------- Main Page --------------------- */
const TrafficPage = () => {
  const [currentData, setCurrentData] = useState(generateMockData());
  const [graphData, setGraphData] = useState([]);
  const [thresholdDb, setThresholdDb] = useState(65);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const [stats] = useState({
    avgNoise: 58,
    violations: 12,
    timerExtensions: 8,
    peakTime: "8-9 AM",
  });

  const [alerts] = useState([
    { type: "high", message: "High noise detected: 78 dB", time: "2 mins ago" },
    { type: "moderate", message: "Timer extended by 15s", time: "5 mins ago" },
    { type: "normal", message: "Noise normalized", time: "12 mins ago" },
  ]);

  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(() => {
      const newData = generateMockData();
      setCurrentData(newData);
      setGraphData((prev) =>
        [...prev, { db: newData.currentDb, time: newData.timestamp }].slice(-20)
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className="page">
      <header className="navbar">
        <h1>Traffic Noise Management</h1>
        <button
          className={`monitor-btn ${isMonitoring ? "on" : "off"}`}
          onClick={() => setIsMonitoring(!isMonitoring)}
        >
          {isMonitoring ? <Pause size={16} /> : <Play size={16} />}
          {isMonitoring ? "Monitoring" : "Paused"}
        </button>
        <button className="export-btn">
          <Download size={16} /> Export
        </button>
      </header>

      <main className="layout">
        <section className="main">
          <div className="row">
            <NoiseLevelGauge currentDb={currentData.currentDb} />
            <TrafficSignalStatus signal={currentData.trafficSignal} timer={currentData.timer} />
            <NoiseFlagIndicator isHighNoise={currentData.isHighNoise} />
          </div>
          <LiveGraph data={graphData} />
          <StatisticsPanel stats={stats} />
        </section>

        <aside className="sidebar">
          <ControlPanel
            thresholdDb={thresholdDb}
            setThresholdDb={setThresholdDb}
            adaptiveMode={adaptiveMode}
            setAdaptiveMode={setAdaptiveMode}
          />
          <AlertsPanel alerts={alerts} />
        </aside>
      </main>
    </div>
  );
};

export default TrafficPage;
