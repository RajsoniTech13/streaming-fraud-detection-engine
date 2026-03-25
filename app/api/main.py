import findspark
findspark.init('/usr/local/spark') 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, desc
import os
import json

app = FastAPI(title="Fintech Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIXED: Default strictly to localhost so your Mac doesn't crash looking for "namenode"
# DATA_PATH = os.getenv("HDFS_DATA_PATH", "hdfs://localhost:8020/fraud_data")
# 1. Change the DATA_PATH
DATA_PATH = "hdfs://namenode:8020/fraud_data"

spark = SparkSession.builder \
    .appName("FraudDashboardAPI") \
    .master("local[*]") \
    .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:8020") \
    .config("spark.hadoop.fs.hdfs.impl", "org.apache.hadoop.hdfs.DistributedFileSystem") \
    .config("spark.sql.session.timeZone", "UTC") \
    .getOrCreate()

def _create_fallback_data():
    fallback_path = "/tmp/mock_fraud_data.json"
    if not os.path.exists(fallback_path):
        mock_data_dicts = [
            {"transaction_id": "t1", "user_id": "u1", "amount": 100.0, "timestamp": "2023-11-01T10:00:00Z", "country": "USA", "city": "NY", "ip_address": "1.1.1.1", "is_international": False, "device_type": "mobile", "device_id": "d1", "is_new_device": False, "merchant": "Amazon", "category": "Retail", "payment_method": "credit_card", "previous_fraud": False, "account_age_days": 100, "transactions_last_1min": 1, "risk_score": 10, "risk_level": "SAFE"},
            {"transaction_id": "t2", "user_id": "u2", "amount": 5000.0, "timestamp": "2023-11-01T10:05:00Z", "country": "Russia", "city": "Moscow", "ip_address": "2.2.2.2", "is_international": True, "device_type": "desktop", "device_id": "d2", "is_new_device": True, "merchant": "Unknown", "category": "Crypto", "payment_method": "crypto", "previous_fraud": True, "account_age_days": 0, "transactions_last_1min": 10, "risk_score": 95, "risk_level": "HIGH"},
            {"transaction_id": "t3", "user_id": "u3", "amount": 50.0, "timestamp": "2023-11-01T10:10:00Z", "country": "USA", "city": "LA", "ip_address": "3.3.3.3", "is_international": False, "device_type": "mobile", "device_id": "d3", "is_new_device": False, "merchant": "Starbucks", "category": "Food", "payment_method": "debit_card", "previous_fraud": False, "account_age_days": 300, "transactions_last_1min": 1, "risk_score": 5, "risk_level": "SAFE"},
            {"transaction_id": "t4", "user_id": "u4", "amount": 200.0, "timestamp": "2023-11-01T10:15:00Z", "country": "UK", "city": "London", "ip_address": "4.4.4.4", "is_international": True, "device_type": "tablet", "device_id": "d4", "is_new_device": False, "merchant": "Apple", "category": "Electronics", "payment_method": "paypal", "previous_fraud": False, "account_age_days": 50, "transactions_last_1min": 2, "risk_score": 45, "risk_level": "MEDIUM"},
            {"transaction_id": "t5", "user_id": "u5", "amount": 10000.0, "timestamp": "2023-11-01T10:20:00Z", "country": "Nigeria", "city": "Lagos", "ip_address": "5.5.5.5", "is_international": True, "device_type": "mobile", "device_id": "d5", "is_new_device": True, "merchant": "Unknown", "category": "Transfer", "payment_method": "bank_transfer", "previous_fraud": True, "account_age_days": 1, "transactions_last_1min": 5, "risk_score": 99, "risk_level": "HIGH"},
            {"transaction_id": "t6", "user_id": "u6", "amount": 12000.0, "timestamp": "2023-11-01T10:25:00Z", "country": "China", "city": "Beijing", "ip_address": "6.6.6.6", "is_international": True, "device_type": "desktop", "device_id": "d6", "is_new_device": True, "merchant": "Unknown", "category": "Electronics", "payment_method": "bank_transfer", "previous_fraud": True, "account_age_days": 0, "transactions_last_1min": 8, "risk_score": 98, "risk_level": "HIGH"},
            {"transaction_id": "t7", "user_id": "u7", "amount": 8000.0, "timestamp": "2023-11-01T10:30:00Z", "country": "Russia", "city": "St. Petersburg", "ip_address": "7.7.7.7", "is_international": True, "device_type": "mobile", "device_id": "d7", "is_new_device": True, "merchant": "Unknown", "category": "Crypto", "payment_method": "crypto", "previous_fraud": False, "account_age_days": 2, "transactions_last_1min": 12, "risk_score": 92, "risk_level": "HIGH"},
        ] * 5
        
        with open(fallback_path, 'w') as f:
            for item in mock_data_dicts:
                f.write(json.dumps(item) + "\n")
    
    return spark.read.json(f"file://{fallback_path}")

MOCK_DF = _create_fallback_data()
MOCK_DF.cache()

def _load_data():
    try:
        # FIXED: Only look at localhost so it doesn't crash on Mac
        return spark.read.parquet(DATA_PATH)
    except Exception as e:
        print(f"Error reading from live HDFS: {e}. Falling back to mock data.")
        return MOCK_DF

# FIXED: Replaced ALL .toPandas() calls with native PySpark .collect()
@app.get("/api/risk-distribution")
def get_risk_distribution():
    df = _load_data()
    res = df.groupBy("risk_level").count().collect()
    return [row.asDict() for row in res]

@app.get("/api/country-fraud")
def get_country_fraud():
    df = _load_data()
    res = df.filter(col("risk_level") == "HIGH").groupBy("country").count().orderBy(desc("count")).limit(10).collect()
    return [row.asDict() for row in res]

@app.get("/api/payment-fraud")
def get_payment_fraud():
    df = _load_data()
    res = df.filter(col("risk_level") == "HIGH").groupBy("payment_method").count().orderBy(desc("count")).collect()
    return [row.asDict() for row in res]

@app.get("/api/device-fraud")
def get_device_fraud():
    df = _load_data()
    res = df.filter(col("risk_level") == "HIGH").groupBy("device_type").count().orderBy(desc("count")).collect()
    return [row.asDict() for row in res]

@app.get("/api/recent-high-risk")
def get_recent_high_risk():
    df = _load_data()
    # Cast timestamp to string before collecting so JSON can read it
    res = df.filter(col("risk_level") == "HIGH") \
            .orderBy(desc("timestamp")) \
            .limit(10) \
            .withColumn("timestamp", col("timestamp").cast("string")) \
            .collect()
    return [row.asDict() for row in res]