#!/bin/bash

# Create data directory for MongoDB
mkdir -p .mongodb/data

# Cleanup function to stop MongoDB gracefully
cleanup() {
    echo "Shutting down MongoDB..."
    if [ ! -z "$MONGO_PID" ] && kill -0 $MONGO_PID 2>/dev/null; then
        kill $MONGO_PID
        wait $MONGO_PID 2>/dev/null
    fi
    exit
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT INT TERM

# Start MongoDB in the background
echo "Starting MongoDB..."
mongod --dbpath .mongodb/data --bind_ip 127.0.0.1 --port 27017 --noauth --logpath .mongodb/mongodb.log &
MONGO_PID=$!

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
for i in {1..30}; do
  if mongo --eval "db.runCommand({ ping: 1 })" --quiet > /dev/null 2>&1; then
    echo "MongoDB is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "MongoDB failed to start in time"
    cat .mongodb/mongodb.log 2>/dev/null || echo "No MongoDB log available"
    exit 1
  fi
  sleep 1
done

# Start the production server (this will run in the foreground)
exec npm start
