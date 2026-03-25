import json
import time
import random
import uuid
from kafka import KafkaProducer

# ✅ Kafka producer
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 🌍 Locations
locations = {
    "India": ["Ahmedabad", "Mumbai", "Delhi", "Bangalore"],
    "USA": ["New York", "San Francisco", "Chicago"],
    "UK": ["London", "Manchester"],
    "UAE": ["Dubai", "Abu Dhabi"],
    "Singapore": ["Singapore"]
}

# 🛒 Merchants
merchants = {
    "Amazon": "ecommerce",
    "Flipkart": "ecommerce",
    "Walmart": "retail",
    "Uber": "transport",
    "Swiggy": "food",
    "Zomato": "food",
    "Airbnb": "travel"
}

devices = ["mobile", "web", "tablet"]
payment_methods = ["credit_card", "debit_card", "upi", "net_banking"]

# 👤 Simulate USERS (important 🔥)
users = {}

NUM_USERS = 1000

for user_id in range(1, NUM_USERS + 1):
    home_country = random.choice(list(locations.keys()))
    home_city = random.choice(locations[home_country])

    users[user_id] = {
        "home_country": home_country,
        "home_city": home_city,
        "device_id": str(uuid.uuid4()),
        "account_age_days": random.randint(1, 1000),
        "previous_fraud": random.choice([0, 0, 0, 1])  # rare fraud
    }

# 📊 Track transaction velocity
txn_history = {}

# 🌐 Fake IP generator
def generate_ip(country):
    base = {
        "India": "49.",
        "USA": "23.",
        "UK": "51.",
        "UAE": "94.",
        "Singapore": "103."
    }
    return base.get(country, "10.") + ".".join(str(random.randint(0, 255)) for _ in range(3))


while True:
    user_id = random.randint(1, NUM_USERS)
    user = users[user_id]

    # 🔁 Default = normal behavior
    country = user["home_country"]
    city = user["home_city"]
    device_id = user["device_id"]
    is_new_device = 0

    # 🔥 FRAUD SCENARIO PROBABILITY
    fraud_type = random.choice([
        "normal", "normal", "normal",
        "new_device",
        "international",
        "high_amount",
        "velocity",
        "new_account"
    ])

    # 🌍 International fraud
    if fraud_type == "international":
        country = random.choice(list(locations.keys()))
        city = random.choice(locations[country])

    is_international = 1 if country != user["home_country"] else 0

    # 📱 New device fraud
    if fraud_type == "new_device":
        device_id = str(uuid.uuid4())
        is_new_device = 1

    # 💰 Amount logic
    if fraud_type == "high_amount":
        amount = random.randint(20000, 50000)
    else:
        amount = random.randint(100, 10000)

    # 🧠 Account age fraud
    account_age_days = user["account_age_days"]
    if fraud_type == "new_account":
        account_age_days = random.randint(1, 5)

    # ⚡ Velocity tracking
    current_time = int(time.time())
    if user_id not in txn_history:
        txn_history[user_id] = []

    # keep only last 60 seconds
    txn_history[user_id] = [
        t for t in txn_history[user_id] if current_time - t < 60
    ]

    transactions_last_1min = len(txn_history[user_id])

    # simulate burst fraud
    if fraud_type == "velocity":
        transactions_last_1min = random.randint(5, 15)

    txn_history[user_id].append(current_time)

    # 🛒 Merchant
    merchant = random.choice(list(merchants.keys()))
    category = merchants[merchant]

    # 🌐 IP
    ip_address = generate_ip(country)

    txn = {
        "transaction_id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "timestamp": current_time,

        "country": country,
        "city": city,
        "ip_address": ip_address,
        "is_international": is_international,

        "device_type": random.choice(devices),
        "device_id": device_id,
        "is_new_device": is_new_device,

        "merchant": merchant,
        "category": category,
        "payment_method": random.choice(payment_methods),

        "previous_fraud": user["previous_fraud"],
        "account_age_days": account_age_days,

        "transactions_last_1min": transactions_last_1min
    }

    producer.send("transactions", txn)
    print(txn)

    # time.sleep(0.01)  # ~100 TPS
    time.sleep(1)  # ~1 TPS
     # time.sleep(0.1)  # ~10 TPS


    