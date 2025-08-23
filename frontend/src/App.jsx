import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import {
  Download,
  Volume2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Settings,
  Activity,
  Timer,
  BarChart3,
} from "lucide-react";

// For demo purposes, we'll simulate MQTT data when connection fails
const generateMockData = () => ({
  db: Math.floor(Math.random() * 40) + 40,
  status: Math.random() > 0.7 ? "High Noise" : "Normal",
  trafficSignal: ["green", "yellow", "red"][Math.floor(Math.random() * 3)],
  timer: Math.floor(Math.random() * 30) + 5,
});

function App() {
  // MQTT Data
  const [db, setDb] = useState(-20);
  const [status, setStatus] = useState("NORMAL NOISE");

  // Dashboard State
  const [trafficSignal, setTrafficSignal] = useState("red");
  const [timer, setTimer] = useState(7);
  const [graphData, setGraphData] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(55);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [manualOverride, setManualOverride] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    avgHour: 62.3,
    avgDay: 58.7,
    violations: 12,
    peakTime: "08:30",
  });

  // Traffic light colors
  const getTrafficColor = (status) => {
    if (status === "NORMAL NOISE") {
      setTrafficSignal("green");
    } else {
      setTrafficSignal("red");
    }
  };

  useEffect(() => {
    getTrafficColor(status);
  },[status]);

  // MQTT Connection with fallback to mock data
  useEffect(() => {
    let client = null;
    let fallbackInterval = null;

    try {
      client = mqtt.connect("ws://localhost:9001");

      client.on("connect", () => {
        console.log("Connected to MQTT broker");
        client.subscribe("traffic/noise");
      });

      client.on("message", (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          setDb(data.db);
          setStatus(data.status);
          if (data != null) {
            setIsLive(true);
          }

          // Update graph data
          setGraphData((prev) => [
            ...prev.slice(-19),
            { db: data.db, time: new Date().toLocaleTimeString() },
          ]);
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      });
    } catch (error) {
      console.log("MQTT not available, using mock data");
      startMockData();
    }

    function startMockData() {
      fallbackInterval = setInterval(() => {
        const mockData = generateMockData();
        setDb(mockData.db);
        setStatus(
          mockData.db > 70 ? "HIGH" : mockData.db > 55 ? "MODERATE" : "SAFE"
        );
        setTrafficSignal(mockData.trafficSignal);
        setTimer((prev) =>
          prev > 0 ? prev - 1 : Math.floor(Math.random() * 30) + 5
        );

        setGraphData((prev) => [
          ...prev.slice(-19),
          { db: mockData.db, time: new Date().toLocaleTimeString().slice(-8) },
        ]);
      }, 2000);
    }

    return () => {
      if (client) client.end();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  // Circular Progress Component
  const CircularProgress = ({
    value,
    max = 100,
    size = 100,
    strokeWidth = 8,
    color = "#10b981",
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / max) * 100;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#374151"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute text-center">
          <div className={`text-4xl font-bold`} style={{ color }}>
            {value.toFixed(1)}
          </div>
          <div className="text-gray-400 text-sm">dB</div>
        </div>
      </div>
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === "NORMAL NOISE") return "#10b981";
    if (status === "NORMAL NOISE") return "#10b981";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Traffic Noise Management</h1>
            <p className="text-gray-400 text-sm">
              Valavoor - IIITKottayam Road
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <div
            className={`flex items-center space-x-2 px-3 py-2 ${
              isLive
                ? "  bg-green-900 text-green-300"
                : " bg-gray-600 text-white"
            } rounded-lg`}
          >
            <div
              className={`w-2 h-2 ${
                isLive ? " bg-green-500" : " bg-gray-400"
              } rounded-full animate-pulse`}
            ></div>
            <span className="text-sm font-medium">
              {isLive ? "Live" : "Mock"}
            </span>
          </div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Left Column - Main Dashboard */}
        <div className="col-span-8 space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Noise Level Gauge */}
            <div className="col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <CircularProgress
                  value={db}
                  max={100}
                  color={getStatusColor(status)}
                  size={180}
                />
                <h3 className="text-xl font-semibold mt-4 mb-2">Noise Level</h3>
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium`}
                  style={{
                    backgroundColor: `${getStatusColor(status)}20`,
                    color: getStatusColor(status),
                  }}
                >
                  {status}
                </div>
                <p className="text-gray-400 text-sm mt-2">Threshold: -7 dB</p>
              </div>
            </div>

            {/* Traffic Signal */}
            <div className="col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Traffic Signal</h3>
                <div className="ml-auto text-sm text-gray-400">Fixed</div>
              </div>

              <div className="text-center space-y-4">
                {/* Traffic Light */}
                <div className="flex flex-col items-center space-y-2 bg-gray-700 rounded-lg p-4">
                  <div
                    className={`w-6 h-6 rounded-full`}
                    style={{
                      backgroundColor:
                        trafficSignal === "red" ? "#ef4444" : "#374151",
                    }}
                  ></div>
                  <div
                    className={`w-6 h-6 rounded-full`}
                    style={{
                      backgroundColor:
                        trafficSignal === "green" ? "#10b981" : "#374151",
                    }}
                  ></div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold">{timer}s</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-lg font-bold">8</div>
                    <div className="text-gray-400">Extensions Today</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-lg font-bold">OFF</div>
                    <div className="text-gray-400">Noise Control</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Statistics */}
            <div className="col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Today's Statistics</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Avg/Hour</span>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {stats.avgHour} dB
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Avg/Day</span>
                  </div>
                  <div className="text-blue-400 font-semibold">
                    {stats.avgDay} dB
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-300">Violations</span>
                  </div>
                  <div className="text-red-400 font-semibold">
                    {stats.violations}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Peak Time</span>
                  </div>
                  <div className="text-yellow-400 font-semibold">
                    {stats.peakTime} AM
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Real-time Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Real-time Noise Levels</h3>
              <span className="text-sm text-gray-400">Last 30 minutes</span>
            </div>

            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 800 200">
                {/* Grid lines */}
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 20"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Threshold line */}
                <line
                  x1="0"
                  y1="150"
                  x2="800"
                  y2="150"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />

                {/* Data points and line */}
                {graphData.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      points={graphData
                        .map(
                          (point, i) =>
                            `${(i / (graphData.length - 1)) * 800},${
                              200 - (point.db / 100) * 200
                            }`
                        )
                        .join(" ")}
                    />

                    {/* Area fill */}
                    <polygon
                      fill="url(#areaGradient)"
                      points={`0,200 ${graphData
                        .map(
                          (point, i) =>
                            `${(i / (graphData.length - 1)) * 800},${
                              200 - (point.db / 100) * 200
                            }`
                        )
                        .join(" ")} 800,200`}
                    />
                  </>
                )}

                {/* Gradients */}
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f620" />
                    <stop offset="100%" stopColor="#3b82f605" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Noise Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-red-500"></div>
                <span>Threshold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Settings */}
        <div className="col-span-4 space-y-6">
          {/* Admin Controls */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Admin Controls</span>
              </h3>
              <div className="text-xl">⚙️</div>
            </div>

            {/* Adaptive Mode */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Adaptive Mode</span>
                </span>
                <button
                  onClick={() => setAdaptiveMode(!adaptiveMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    adaptiveMode ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      adaptiveMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="font-medium mb-2">
                  Noise-Driven Traffic Control
                </h4>
                <p className="text-sm text-gray-400">
                  Automatically extend red lights during high noise
                </p>
              </div>
            </div>

            {/* Noise Threshold */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Noise Threshold</span>
                </span>
              </div>

              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={noiseThreshold}
                    onChange={(e) =>
                      setNoiseThreshold(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                    {noiseThreshold}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Current: 70 dB • Range: 50-100 dB
                </p>
              </div>
            </div>

            {/* Manual Override */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Manual Override</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Red", "Yellow", "Green"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setManualOverride(color.toLowerCase())}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      manualOverride === color.toLowerCase()
                        ? `bg-${
                            color.toLowerCase() === "red"
                              ? "red"
                              : color.toLowerCase() === "yellow"
                              ? "yellow"
                              : "green"
                          }-600 text-white`
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>

              {manualOverride && (
                <div className="mt-2 p-2 bg-yellow-900 text-yellow-300 rounded-lg text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Override will disable adaptive mode temporarily</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
