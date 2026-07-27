FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy application source code and .env
COPY . .

EXPOSE 3000

# Start application using ts-node
CMD ["npm", "start"]