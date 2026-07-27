# ⚡ Web3 AI Smart Router & Security Infrastructure

> An enterprise-grade, fault-tolerant, and latency-optimized Web3 RPC Proxy and Control Center powered by **Google Gemini AI**. Built to prevent MEV sandwich attacks, decode raw EVM bytecode payloads into plain English, simulate state execution in zero-cost sandboxes, and dynamically balance traffic across RPC nodes using EWMA latency tracking.

---

## 📌 Table of Contents
- [🏆 Project Overview & Value Proposition](#-project-overview--value-proposition)
- [🔄 Architecture & System Flowchart](#-architecture--system-flowchart)
- [🖥️ Dashboard Layout & Component Map](#️-dashboard-layout--component-map)
- [✨ Core Capabilities & Features](#-core-capabilities--features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start: Running on Your Local PC](#-quick-start-running-on-your-local-pc)
- [📖 User & Tester Walkthrough](#-user--tester-walkthrough)
- [🧪 60-Second Demo Sequence for Judges](#-60-second-demo-sequence-for-judges)
- [📚 Technical Terminology Glossary](#-technical-terminology-glossary)
- [🛡️ License & Contributing](#️-license--contributing)

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

## 🚀 Quick Start: Running on Your Local PC

Follow these steps to get the project up and running locally on your computer in under 5 minutes.

### 1. Prerequisites
Before installing, ensure you have the following installed on your machine:
* **Node.js (v18.0.0 or higher)** — [Download Node.js](https://nodejs.org/)
* **Git** — [Download Git](https://git-scm.com/)
* A Web3 Browser Extension Wallet (e.g., [MetaMask](https://metamask.io/))

### 2. Clone the Repository
Open your terminal (macOS/Linux) or Command Prompt / PowerShell (Windows) and clone the repository:
```bash
git clone [https://github.com/your-username/web3-ai-smart-router.git](https://github.com/your-username/web3-ai-smart-router.git)
cd web3-ai-smart-router
### 3. Install Dependencies
Install all required Node.js libraries:
```bash
npm install
4. Set Up Environment VariablesCreate a file named .env in the root folder of the project:Bashtouch .env
Open .env in your code editor and add your configuration parameters:Code snippet# Gemini API Key (Get a free key from [https://aistudio.google.com/](https://aistudio.google.com/))
GEMINI_API_KEY=your_google_gemini_api_key_here

# Application Port
PORT=3000
5. Launch the ServerStart the local server by running:Bashnpm start
You should see output similar to:Plaintext> web3-ai-smart-router@1.0.0 start
> node server.js

[SUCCESS] Smart Router backend listening on http://localhost:3000
[AI ENGINE] Google Gemini API connection verified.
6. Open the DashboardOpen your web browser and navigate to:Plaintexthttp://localhost:3000
📖 User & Tester WalkthroughOption 1: Configuring MetaMask to use your Local Smart RouterOpen the dashboard at http://localhost:3000.Click the [ + Add to Wallet ] button in the header bar.MetaMask will prompt you to approve adding a custom network pointed directly to http://localhost:3000.Once approved, all transactions signed in your browser will pass through your local AI Smart Router before hitting the blockchain!Option 2: Using the Built-In Transaction HubA. Visual Form (Beginners)Navigate to the Transaction Hub panel on the lower right.Select your asset (e.g., USDC).Enter the destination Recipient Address and Amount.Click Dry-Run to preview execution without spending gas.Click Send Protected to route through Gemini AI security and execute safely.B. JSON Developer Console (Advanced Testing)Select the JSON Console tab in the Transaction Hub.Pick a pre-configured template:eth_blockNumber: Fetch the latest block height.ERC-20 Transfer: Send a standard ERC-20 payload.Trigger Anomaly: Test how Gemini flags malicious or corrupted bytecode.Click Send Raw RPC Payload and watch the streaming terminal process the request live!🧪 60-Second Demo Sequence for JudgesIf you are demonstrating this project in a hackathon presentation or live demo, follow this sequence: ┌─────────────────────────────────────────────────────────────────┐
 │                     60-SECOND DEMO SEQUENCE                     │
 ├─────────────────────────────────────────────────────────────────┤
 │ 1. Click "Help & Glossary" to show plain-English documentation. │
 │ 2. Select "ERC-20 Transfer" in the JSON console.                │
 │ 3. Click "Send Raw RPC Payload" & view Gemini AI decoding live. │
 │ 4. Switch to "Visual Form" & run a "Dry-Run" state simulation.  │
 │ 5. Click "Kill Endpoint" on a node to show live failover.       │
 │ 6. Click "Add to Wallet" to display MetaMask proxy setup.       │
 └─────────────────────────────────────────────────────────────────┘
Explain the Interface: Click Help & Glossary to highlight plain-English terminology built into the UI.Demonstrate AI Decoding: Select ERC-20 Transfer in the JSON console, click Send Raw RPC Payload, and show how Gemini AI decodes hex bytecode live in the streaming terminal.Run a Dry-Run Simulation: Switch to the Visual Form tab, fill in details, and click Dry-Run to preview gas fees and state diffs without spending tokens.Demonstrate Fault Tolerance: Scroll to the RPC Providers matrix and click Kill Endpoint on an active node. Watch the system trip a circuit breaker and automatically reroute traffic to healthy nodes without dropping requests.Show MetaMask Integration: Click Add to Wallet to show how easily Web3 users can proxy their existing wallet through this security infrastructure.📚 Technical Terminology GlossaryTermPlain English DefinitionRPC NodeA server bridging your browser wallet to the blockchain network.EWMA LatencyExponentially Weighted Moving Average. A mathematical formula calculating average node speed while ignoring temporary ping spikes.MEV ShieldMaximal Extractable Value protection that routes trades privately to prevent bot sandwich attacks.Circuit BreakerA safety mechanism (Kill Endpoint) that isolates failing servers and reroutes traffic automatically with zero dropped requests.State Dry-RunA local EVM sandbox simulation testing whether a transaction will succeed before real gas fees are spent.🛡️ License & ContributingDistributed under the MIT License. See LICENSE for more information.Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.are welcome! Feel free to check the issues page or submit a pull request.
