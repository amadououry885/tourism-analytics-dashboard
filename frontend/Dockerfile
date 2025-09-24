# Use official Node image
FROM node:18

# Set working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
