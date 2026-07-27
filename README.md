# ⚡ Web3 AI Smart Router & Security Infrastructure

> An enterprise-grade, fault-tolerant, and latency-optimized Web3 RPC Proxy and Control Center powered by **Google Gemini AI**. Built to prevent MEV sandwich attacks, decode raw EVM bytecode payloads into plain English, simulate state execution in zero-cost sandboxes, and dynamically balance traffic across RPC nodes using EWMA latency tracking.

---

## 📌 Table of Contents

- [🏆 Project Overview & Value Proposition](#-project-overview--value-proposition)
- [🔄 Architecture & System Flowchart](#-architecture--system-flowchart)
- [🖥️ Dashboard Layout & Component Map](#-dashboard-layout--component-map)
- [✨ Core Capabilities & Features](#-core-capabilities--features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Quick Start: Running on Your Local PC](#-quick-start-running-on-your-local-pc)
- [📖 User & Tester Walkthrough](#-user--tester-walkthrough)
- [🧪 60-Second Demo Sequence](#-60-second-demo-sequence)
- [📚 Technical Glossary](#-technical-glossary)
- [🛡️ License & Contributing](#-license--contributing)
---

## 🏆 Project Overview & Value Proposition

When a user interacts with a Web3 application or dApp, their wallet (e.g., MetaMask) communicates with the blockchain via a **Remote Procedure Call (RPC) Node**. Modern Web3 RPC infrastructure relies heavily on static configurations, exposing users and developers to **three major systemic vulnerabilities**:

┌───────────────────────────────────────────────────────────────────────────┐
│                           THE THREE CRITICAL FLAWS                        │
├───────────────────────────────────────────────────────────────────────────┤
│ 1. Single-Point-of-Failure RPC Outages & High Latency                    │
│ 2. Blind Signing of Unreadable Hex Payload Bytecode (Drainer Scam Risk)   │
│ 3. Public Mempool Exposure (MEV Sandwich & Front-Running Bot Attacks)    │
└───────────────────────────────────────────────────────────────────────────┘


### How Web3 AI Smart Router Solves Them:
1. **Dynamic EWMA Load Balancing & Circuit Breakers:** Evaluates RPC response times continuously using an *Exponentially Weighted Moving Average* algorithm. If a provider drops off or lags, traffic is dynamically shifted to healthy nodes without breaking user connections.
2. **Gemini AI Bytecode Intent Explainer:** Intercepts unverified payload hex strings (`0xa9059cbb...`), translates the underlying EVM functions into human-readable plain English, and assigns a real-time Threat Rating (`LOW`, `MEDIUM`, or `CRITICAL`).
3. **MEV Private Shield Gate:** Routes transaction write requests through private block-builder relays instead of public mempools, rendering trades invisible to front-running bots.
4. **Zero-Cost State Dry-Run Sandbox:** Simulates EVM execution locally to predict exact gas costs, state diffs, and revert risks before spending real funds.

---

## 🔄 Architecture & System Flowchart

                      +-------------------------+
                      |   User Wallet / Web3    |
                      |    (MetaMask Proxy)     |
                      +------------+------------+
                                   |
                                   v
                      +-------------------------+
                      |  Web3 AI Smart Router   |
                      |     (Express Server)    |
                      +------------+------------+
                                   |
      +----------------------------+----------------------------+
      |                            |                            |
      v                            v                            v
+--------------+           +------------------+         +------------------+
|  EWMA Engine |           | Gemini AI Shield |         |  MEV Relay Gate  |
| (Ping Check) |           | (Bytecode Reader)|         | (Private Routing)|
+------+-------+           +--------+---------+         +--------+---------+
|                            |                            |
|  Routes via Fastest Node   |  Flags Threat Level        |  Bypasses Mempool
v                            v                            v
+--------------------------------------------------------------------------+
|                        Blockchain Network / Nodes                        |
|             [ Node 1 (Fast) ]  [ Node 2 (Killed) ]  [ Node 3 ]            |
+--------------------------------------------------------------------------+


---

## 🖥️ Dashboard Layout & Component Map

┌────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD OVERVIEW                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Header Bar:        Chain Selector, Help Guide, Wallet Connection    │
│ 2. Telemetry Cards:   Live Requests, AI Threat Rating, Gas Tracker     │
│ 3. Latency Chart:     Real-time EWMA Server Speed Graphs               │
│ 4. Node Matrix:       Connected Servers & Emergency "Kill" Buttons     │
│ 5. AI Terminal:       Gemini Live Transaction Decoding Stream          │
│ 6. Transaction Hub:   Visual Form, State Dry-Run, JSON Console         │
└────────────────────────────────────────────────────────────────────────┘


---

## ✨ Core Capabilities & Features

* **⚡ Sub-Second EWMA Latency Routing:** Smooths out network latency spikes and ensures requests go to the most consistently performant provider.
* **🤖 Google Gemini AI Threat Shield:** Decodes ABI parameter data into human-readable text and halts malicious contract signatures.
* **🛡️ Private MEV Protection Shield:** Built-in toggle to stream transactions directly to private block builders.
* **🧪 State Dry-Run Execution:** Tests calls against current block states to calculate gas limits and verify logic safely.
* **🔴 Live Circuit Breaker Management:** Manually toggle or "kill" endpoints to test automated live failover capability.
* **🦊 Native MetaMask Integration:** One-click integration allowing users to point their wallet RPC directly to this router.

---

## 🛠️ Tech Stack

* **Frontend:** Tailwind CSS, Chart.js, Lucide Icons, HTML5, Vanilla JavaScript
* **Backend Runtime:** Node.js, Express.js
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Blockchain Layer:** Ethers.js / Web3.js JSON-RPC Proxy

---

## 🚀 Quick Start

Follow these steps to get the project running locally.

### 1️⃣ Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later)
- Git
- MetaMask (or another Web3 wallet)
- Google Gemini API Key

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/web3-ai-smart-router.git
cd web3-ai-smart-router
```

---

### 3️⃣ Install Dependencies

Install all required packages.

```bash
npm install
```

---

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root.

```bash
touch .env
```

Add the following configuration:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_google_gemini_api_key_here

# Application Port
PORT=3000
```

---

### 5️⃣ Start the Server

```bash
npm start
```

Expected output:

```text
> web3-ai-smart-router@1.0.0 start
> node server.js

[SUCCESS] Smart Router backend listening on http://localhost:3000
[AI ENGINE] Google Gemini API connection verified.
```

---

### 6️⃣ Open the Dashboard

Visit:

```
http://localhost:3000
```

---

# 📖 User & Tester Walkthrough

## Option 1 — MetaMask Integration

1. Open the dashboard.
2. Click **+ Add to Wallet**.
3. Approve the custom network inside MetaMask.
4. All wallet requests will now pass through the AI Smart Router before reaching the blockchain.

---

## Option 2 — Built-In Transaction Hub

### 🟢 Visual Form (Beginner)

1. Open the **Transaction Hub**.
2. Select an asset (e.g., USDC).
3. Enter the recipient address.
4. Specify the amount.
5. Click **Dry Run** to simulate execution.
6. Click **Send Protected** to securely submit the transaction.

---

### 🔵 JSON Developer Console

Choose one of the built-in templates:

- `eth_blockNumber`
- ERC-20 Transfer
- Trigger Anomaly

Click **Send Raw RPC Payload** to observe:

- Gemini AI transaction decoding
- Threat analysis
- Live RPC processing

---

# 🧪 60-Second Demo Sequence

```text
┌──────────────────────────────────────────────────────────────┐
│                  60-SECOND DEMO SEQUENCE                     │
├──────────────────────────────────────────────────────────────┤
│ 1. Open Help & Glossary                                     │
│ 2. Select ERC-20 Transfer                                   │
│ 3. Send Raw RPC Payload                                     │
│ 4. Show Gemini AI Bytecode Decoding                         │
│ 5. Run a Dry-Run Transaction                                │
│ 6. Kill an RPC Endpoint                                     │
│ 7. Demonstrate Automatic Failover                           │
│ 8. Add Network to MetaMask                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎤 Demo Talking Points

### 📖 Help & Glossary

Show how complex blockchain terminology is translated into plain English.

---

### 🤖 AI Bytecode Decoder

Send an ERC-20 transaction and demonstrate how Gemini AI converts raw hexadecimal calldata into a human-readable explanation.

---

### 🧪 Dry-Run Sandbox

Execute a simulation to display:

- Estimated gas usage
- State changes
- Revert detection

without spending real funds.

---

### ⚡ Fault Tolerance

Disable one RPC provider using **Kill Endpoint** and demonstrate automatic traffic rerouting via the circuit breaker.

---

### 🦊 MetaMask Integration

Click **Add to Wallet** to show how users can securely route their existing wallet traffic through the AI Smart Router.

---

# 📚 Technical Glossary

| Term | Plain-English Explanation |
|------|----------------------------|
| **RPC Node** | A server that connects wallets and dApps to the blockchain. |
| **RPC Endpoint** | The API through which applications communicate with an RPC node. |
| **EWMA Latency** | Exponentially Weighted Moving Average used to estimate node performance while smoothing temporary latency spikes. |
| **MEV Shield** | Routes transactions privately to protect against sandwich attacks and front-running bots. |
| **Circuit Breaker** | Automatically disables unhealthy RPC providers and reroutes traffic to healthy nodes. |
| **State Dry-Run** | Simulates a transaction locally to estimate gas usage and detect failures before execution. |

---

# 🛡️ License & Contributing

Distributed under the **MIT License**.

See the `LICENSE` file for details.

Contributions are welcome!

If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

Issues, feature requests, and suggestions are always appreciated.

---
