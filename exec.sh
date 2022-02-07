# Pull latest code
git pull

# Stop the current docker container
docker stop rata
docker rm rata

# Build
docker build -t weesing/rata:latest .

# Run container.
docker run --name rata -d --restart=unless-stopped -p 8080:8080 weesing/rata

