# Pull latest code
git pull

# Stop the current docker container
docker stop homebot
docker rm homebot

# Build
docker build -t weesing/homebot:latest .

# Run container.
docker run --name homebot -d --restart=unless-stopped -p 8080:8080 weesing/homebot

