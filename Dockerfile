FROM node:18.16.0-slim AS base

WORKDIR /app

ENV NODE_ENV=staging

COPY backend/node_modules ./backend/node_modules
COPY backend/build ./backend/build
COPY backend/dist ./backend/dist
COPY backend/.env* ./backend
EXPOSE 8090

# Specify the command to run the backend server when the container starts
CMD [ "node", "backend/dist/server.js" ]
