# Use a specific Python 3 version (replace with desired version)
FROM python:3.9

# Set the working directory for the container
WORKDIR /app

# Copy requirements.txt file
COPY requirements.txt ./

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code
COPY . .

# Set the command to execute when the container starts
CMD [ "python", "traffic_analyzer.py" ]