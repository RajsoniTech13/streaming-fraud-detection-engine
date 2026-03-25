# Sentinel Fraud Analytics 🛡️

A full-stack, real-time FinTech fraud detection system. This project simulates live transaction data, processes it via PySpark Structured Streaming, stores analytical results in Hadoop distributed storage (HDFS), and serves it to a modern, enterprise-grade React dashboard via FastAPI.

---

## 🚀 Getting Started: Step-by-Step Guide

Follow these sequential steps to run the complete infrastructure, data pipeline, and UI from scratch.

### Step 1: Start the Docker Infrastructure
Everything required for Big Data (Kafka, Hadoop/HDFS, and Jupyter for PySpark) is containerized. 

Open your terminal in the project root and run:
```bash
docker-compose up -d
```
*Wait a minute for the HDFS NameNode, DataNodes, and Kafka brokers to fully spin up.*

### Step 2: Run the Data Generator & PySpark Pipeline (Via Jupyter)
The application’s core generation and stream-processing logic is contained inside your Jupyter notebook within the `app` folder.

1. **Get the Jupyter Token:**
   Run the following command to retrieve the secure token for the Jupyter Notebook container:
   ```bash
   docker logs <jupyter-container-name>
   ```
   *(Note: Replace `<jupyter-container-name>` with the actual name of your Jupyter container, e.g., `jupyter-spark`)*

2. **Login to Jupyter:**
   Open your browser and navigate to [http://localhost:8888](http://localhost:8888). Paste the token from the logs to authenticate.

3. **Run the Notebook Cells:**
   - Navigate into the `app/` folder (mounted in Jupyter).
   - Open your primary PySpark notebook (e.g., `Untitled.ipynb`).
   - Note: This notebook handles both the **Python Data Generator** (pushing to Kafka) and the **PySpark Structured Streaming** (reading from Kafka and writing `.parquet` files to HDFS).
   - **Run all cells** sequentially to ensure Hadoop configurations are set up and data begins streaming into `hdfs://namenode:8020/fraud_data`.

### Step 3: Start the FastAPI Backend
The backend serves the aggregated HDFS data to the frontend viaREST endpoints. 

Open a **new local terminal** (on your host machine) and run:
```bash
cd app/api

# (Optional but recommended) Create and activate a Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install the required Python backend libraries
pip install -r requirements.txt

# Start the uvicorn ASGI server
uvicorn main:app --reload --port 8501
```
*The API is now continuously fetching from Hadoop and serving JSON on port 8501.*

### Step 4: Launch the React Dashboard
Finally, start the Sentinel UI to visualize the real-time threat intelligence.

Open **another new terminal** and run:
```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```

### 🎯 View the Application
Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 📁 Directory Structure Overview

```plaintext
fintech-fraud-detection-system/
├── docker-compose.yml       # Hadoop, Kafka, and Jupyter Infrastructure
├── app/                     # Data Engineering & Backend Layer
│   ├── Untitled.ipynb       # Jupyter Notebook (Generator & PySpark Streaming)
│   ├── api/                 
│   │   ├── main.py          # FastAPI server mapping to HDFS
│   │   └── requirements.txt 
├── frontend/                # React Vite Dashboard
│   ├── src/                 # Enterprise UI Components & Routing
│   ├── tailwind.config.js   # Dark Mode SaaS configuration
│   └── package.json         
└── README.md
```
