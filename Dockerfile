FROM jupyter/pyspark-notebook

# Install required Python packages for Kafka and the Dashboard
RUN pip install kafka-python streamlit pandas pyarrow findspark fastapi uvicorn 

# Set working directory
WORKDIR /home/jovyan/app