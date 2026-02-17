FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Expose Angular dev server port (internal)
EXPOSE 4201

# Start Angular dev server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4201", "--poll", "2000"]
