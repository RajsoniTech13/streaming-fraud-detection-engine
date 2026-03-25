# Sentinel Fraud Analytics 🛡️

A full-stack, real-time FinTech fraud detection system. This project simulates live transaction data, processes it via PySpark Structured Streaming, stores analytical results in Hadoop distributed storage (HDFS), and serves it to a modern, enterprise-grade React dashboard via FastAPI.

---

## 🚀 The Flawless Startup Sequence

When you are ready to present or work again, follow these exact steps in order.

---

### Step 1: Boot up the Cluster (Docker)

Open a terminal in your main `fintech-fraud-detection-system` folder and start the infrastructure:

```bash
docker-compose up -d
```

> **⏳ Wait about 15–20 seconds** to let Hadoop and Kafka fully wake up before moving to Step 2.

> [!TIP]
> If you get errors about Kafka not being installed or similar issues, rebuild from scratch:
> ```bash
> docker-compose down
> docker-compose up --build -d
> ```

---

### Step 2: Prepare HDFS (The Safety Check)

Ensure Hadoop has the right folder and permissions ready for Spark to write to:

```bash
docker exec -it fintech-fraud-detection-system-namenode-1 hdfs dfs -mkdir -p /fraud_data
docker exec -it fintech-fraud-detection-system-namenode-1 hdfs dfs -chown jovyan:supergroup /fraud_data
```

---

### Step 3: Turn on the Data Stream

Open a **new terminal**, drop into the Jupyter container, and start the transaction generator:

```bash
docker exec -it jupyter bash
```

Then inside the container:

```bash
python generator.py
```

> *(Leave this terminal open and running in the background.)*

---

### Step 4: Start the Spark Brain

1. Open a **new terminal** and grab your Jupyter token:
   ```bash
   docker logs jupyter
   ```
2. Open your browser and go to **[http://localhost:8888](http://localhost:8888)**.
3. Open the `Untitled.ipynb` notebook.
4. Click **Kernel → Restart Kernel and Run All Cells…**

> [!IMPORTANT]
> **CRUCIAL PAUSE:** Wait about **15–20 seconds**. Spark needs time to process the first batch from Kafka and create the very first Parquet file in HDFS.

---

### Step 5: Start the API Bridge

Once Spark has dropped the first file, your API is safe to start. Open a **new terminal** and drop into the Jupyter container:

```bash
docker exec -it jupyter bash
```

Then navigate to your API and start it:

```bash
cd ~/app/api
uvicorn main:app --host 0.0.0.0 --port 8501
```

---

### Step 6: Launch the Dashboard

Open a **final terminal** on your Mac, navigate to the frontend folder, and start the UI:

```bash
cd frontend
npm run dev
```

---

### 🎯 You are Live! 🌐

Go to **[http://localhost:5173](http://localhost:5173)** in your browser.

Because you started the generator and Spark **before** the API, the API instantly found the Parquet schema, and your dashboard should be perfectly animating with real-time data.

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

---

## 🏗️ System Architecture

### Pipeline Architecture

The end-to-end data pipeline follows a 5-stage streaming architecture:

```
┌─────────────────────┐
│  1. Data Ingestion   │   Live generator produces transactions published
│     (Kafka)          │   to Confluent Kafka topic `transactions`.
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  2. Real-time        │   PySpark Structured Streaming consumes Kafka,
│     Inference        │   computes complex risk scores based on
│     (PySpark)        │   heuristics.
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  3. Distributed      │   Analyzed batches sink to Hadoop as
│     Storage          │   `.snappy.parquet` logs at
│     (HDFS Parquet)   │   hdfs://namenode:8020/fraud_data
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  4. API Serving      │   FastAPI ASGI server on Port 8501 queries
│     (FastAPI)        │   Parquet files on demand, aggregating JSON.
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  5. Client           │   React SPA polling FastAPI every 5 seconds
│     Visualization    │   to render dynamic Recharts arrays.
│     (Vite React)     │
└─────────────────────┘
```

---

### Transaction Schema

Each transaction record flowing through the pipeline has the following schema:

| Field Name         | Data Type      | Description                              |
|--------------------|----------------|------------------------------------------|
| `transaction_id`   | UUID String    | Unique identifier for the transaction    |
| `user_id`          | Integer        | Originating account ID                   |
| `amount`           | Float          | Transaction value (USD)                  |
| `timestamp`        | ISO 8601 String| Time of execution                        |
| `country`          | String         | Geo-located country                      |
| `payment_method`   | Enum String    | `crypto`, `credit_card`, etc.            |
| `device_type`      | Enum String    | `mobile`, `desktop`, `tablet`            |
| **`risk_score`** ✅ | Integer        | Computed Spark heuristic metric (0–100+) |
| **`risk_level`** 🔴 | Enum String    | `SAFE`, `MEDIUM`, `HIGH`                 |

> `risk_score` and `risk_level` are **computed fields** added by the PySpark streaming layer — they do not exist in the raw generated data.
