# Use official Node image as the base image
FROM node:18.16.0-slim AS base

# Set the working directory in the image
WORKDIR /app

# Set environment to 'staging'
ENV NODE_ENV=staging

# Copy entire frontend and backend directories
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Install node modules for backend
WORKDIR /app/backend

# Expose the port the backend app runs on
EXPOSE 8090

# Specify the command to run the backend server when the container starts
CMD [ "node", "dist/server.js" ]
