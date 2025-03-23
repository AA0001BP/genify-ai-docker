# Docker Deployment Guide for Genify-AI

This guide provides step-by-step instructions for deploying the Genify-AI application on a VPS using Docker and docker-compose.

## Prerequisites

- A VPS with at least 2GB RAM and 2 CPU cores
- Ubuntu 20.04 or higher (or similar Linux distribution)
- Docker and docker-compose installed
- Domain name (genify-ai.com) with DNS pointing to your VPS IP
- Basic knowledge of Linux command line

## Server Setup

1. **Update your system:**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install Docker and docker-compose:**
   ```bash
   # Docker
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce

   # docker-compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Create a non-root user for Docker (optional but recommended):**
   ```bash
   sudo groupadd docker
   sudo usermod -aG docker $USER
   # Log out and log back in to apply changes
   ```

## Application Deployment

1. **Create a project directory:**
   ```bash
   mkdir -p /var/www/genify-ai
   cd /var/www/genify-ai
   ```

2. **Copy the project files to the server:**
   You can use `git clone`, `scp`, or any other method to copy your project files to the server.

3. **Set up production environment variables:**
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
   Edit the file to set secure passwords and API keys.

4. **Generate htpasswd for Traefik:**
   ```bash
   # Install apache2-utils if not already installed
   sudo apt install -y apache2-utils
   # Replace 'your_secure_password' with a strong password
   htpasswd -nb admin your_secure_password
   ```
   Copy the output and replace the `TRAEFIK_PASSWORD_HASH` value in `.env.production`.

5. **Create required directories:**
   ```bash
   mkdir -p nginx
   ```

6. **Start the application:**
   ```bash
   docker-compose up -d
   ```

7. **Monitor the deployment:**
   ```bash
   docker-compose logs -f
   ```

## Post-Deployment Steps

1. **Verify that Traefik is properly obtaining SSL certificates:**
   ```bash
   docker-compose logs traefik
   ```
   Look for successful certificate issuance messages.

2. **Test the application by visiting your domain:**
   Open https://genify-ai.com in your browser.

3. **Set up automated backups (recommended):**
   Create a script to back up the MongoDB volume regularly.

## Scaling for High Traffic

The Docker Compose setup is designed to handle thousands of users by:

1. **Using Nginx for efficient static asset serving**
2. **Implementing proper caching headers**
3. **Enabling gzip compression**

For further scaling:

1. **Increase MongoDB resources:**
   Edit `docker-compose.yml` to allocate more resources to MongoDB.

2. **Set up MongoDB replica set:**
   For higher availability, consider setting up a MongoDB replica set.

3. **Add load balancing:**
   For extremely high traffic, deploy multiple application instances and set up load balancing.

## Maintenance

1. **Update the application:**
   ```bash
   # Pull latest code
   git pull
   # Rebuild and restart containers
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

2. **Monitor logs:**
   ```bash
   docker-compose logs -f app
   ```

3. **Backup the database:**
   ```bash
   # Create a backup directory
   mkdir -p /backups
   # Backup MongoDB data
   docker exec -it $(docker-compose ps -q mongodb) mongodump --out /dump
   docker cp $(docker-compose ps -q mongodb):/dump /backups/mongodb-$(date +%Y-%m-%d)
   ```

## Troubleshooting

1. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Inspect container logs:**
   ```bash
   docker-compose logs -f [service_name]
   ```

3. **Common issues:**
   - **SSL certificate issues:** Ensure your domain DNS is correctly set up
   - **MongoDB connection errors:** Check your MongoDB credentials in `.env.production`
   - **Application errors:** Check the app container logs for details

## Security Best Practices

1. **Regularly update all containers:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **Enable a firewall:**
   ```bash
   sudo apt install -y ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

3. **Set up fail2ban to prevent brute force attacks:**
   ```bash
   sudo apt install -y fail2ban
   ```

4. **Use strong passwords for all services**

5. **Regularly backup your data** 