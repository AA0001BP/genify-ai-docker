# MongoDB Setup for Text Humanizer

This application requires MongoDB for user authentication. Follow these instructions to set up MongoDB locally.

## Prerequisites

- MongoDB installed on your system
  - [Download and install MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/)

## Setup Steps

1. **Start MongoDB Service**

   On macOS:
   ```bash
   brew services start mongodb-community
   ```

   On Windows:
   ```
   Start MongoDB service from Windows Services
   ```

   On Linux:
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is Running**

   You can check if MongoDB is running by connecting to it:
   ```bash
   mongosh
   ```

   If it connects successfully, MongoDB is running correctly.

3. **Database Configuration**

   The application is already configured to use MongoDB with the default settings in the `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/humanizer
   ```

   No additional configuration is required unless you're using a custom MongoDB setup.

## Troubleshooting

If you encounter issues connecting to MongoDB:

1. Check if MongoDB is running with:
   ```bash
   ps aux | grep mongod
   ```

2. Verify that the MONGODB_URI in `.env.local` matches your MongoDB setup.

3. Make sure port 27017 is not blocked by a firewall.

## Production Deployment

For production, use a hosted MongoDB service like MongoDB Atlas or update the MONGODB_URI in your environment variables to point to your production database. 