import { useState } from "react";

import Dashboard from "./pages/dashboard";
import EmailDetection from "./pages/emaildetection";
import NetworkDetection from "./pages/networkdetection";
import GPSDetection from "./pages/gpsdetection";

import "./App.css";

function App() {

  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="app">

      <header className="header">
        <h1>CyberShield AI</h1>

        <nav className="nav">
          <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("email")}>Phishing</button>
          <button onClick={() => setActiveTab("network")}>Network</button>
          <button onClick={() => setActiveTab("gps")}>GPS Spoof</button>
        </nav>
      </header>

      <main className="main">

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "email" && <EmailDetection />}
        {activeTab === "network" && <NetworkDetection />}
        {activeTab === "gps" && <GPSDetection />}

      </main>

    </div>
  );
}

export default App;