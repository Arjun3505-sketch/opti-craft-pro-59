#!/bin/bash

# Start script for Trading LLM Backend on Render
echo "Starting Trading LLM Backend..."

# Install dependencies
pip install -r requirements.txt

# Set environment variables for production
export FLASK_ENV=production
export FLASK_DEBUG=False

# Start the application with Gunicorn
echo "Starting Gunicorn server on port $PORT..."
gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile - app:app
