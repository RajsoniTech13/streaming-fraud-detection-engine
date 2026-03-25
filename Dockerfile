FROM jupyter/pyspark-notebook

# Install required Python packages for Kafka, Spark, and the API
RUN pip install kafka-python pandas pyarrow findspark fastapi uvicorn 

# Set working directory
WORKDIR /home/jovyan/app