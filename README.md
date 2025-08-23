# 🛑 Noise Monitoring Prototype  

A real-time **noise pollution monitoring system** that connects IoT sensing with live traffic simulations and analytics.  
Built for urban sustainability and smart city applications.  

---

## 🚀 Overview  

Our prototype continuously monitors ambient noise levels using a **Python sound device model**, processes them into **decibel (dB) readings**, and classifies the environment into meaningful noise statuses.  

The data flows through a lightweight **MQTT-based architecture**, making it scalable, responsive, and ready for real-world deployment. On the frontend, live dashboards and **traffic light simulations** help visualize how noise can influence urban management decisions.  

---

## 🏗️ System Architecture  

### 🔹 Backend  
- Captures audio signals using **Python sounddevice**.  
- Converts raw sound into **dB levels**.  
- Classifies readings into **status categories** (e.g., Normal Noise, High Noise).  
- Publishes results to an **MQTT broker (Mosquitto)**.  

### 🔹 MQTT Broker  
- Handles message distribution via **Mosquitto**.  
- Supports **WebSocket (port 9001)** for real-time data streaming.  

### 🔹 Frontend  
- Built with **Vite + React + TailwindCSS** for fast and modern UI.  
- Subscribes to MQTT messages via WebSocket.  
- Displays:  
  - 📊 **Analytics Dashboard** (real-time graphs of noise levels).  
  - 🚦 **Traffic Light Simulation** that adapts dynamically to noise status.  

---

## ✨ Features  
- 🎧 **Real-time noise sensing** with dB conversion.  
- ⚡ **Low-latency MQTT communication**.  
- 📡 **WebSocket integration** for instant frontend updates.  
- 📊 **Analytics dashboard** to track noise patterns.  
- 🚦 **Interactive simulation** of traffic lights responding to noise.  
- 🌍 **Smart city ready** — scalable and adaptable to urban deployments.  

---

## 🔮 Future Scope  
- Integration with **IoT edge devices** for distributed sensing.  
- Predictive analytics using **ML models** for anomaly detection.  
- Real-world deployment in **traffic intersections & public spaces**.  

---

## 🛠️ Tech Stack  
- **Backend**: Python (sounddevice, paho-mqtt)  
- **Broker**: Mosquitto MQTT  
- **Frontend**: Vite, React, TailwindCSS  
- **Communication**: MQTT over WebSocket  

---

## 📌 Hackathon Impact  
This project demonstrates how **IoT + Real-time Data Visualization** can help cities:  
- Reduce noise pollution 🚫🎶  
- Optimize traffic management 🚗  
- Enhance urban sustainability 🌱  

---

## 👥 Team  
Built for the Hack-For-Earth by [Girls Gone Green 💚].  
