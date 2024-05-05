# Use a base image with a lightweight web server
FROM nginx:alpine

# Copy all files from the current directory into the container
COPY . /usr/share/nginx/html/

# Expose port 80 for web traffic
EXPOSE 80