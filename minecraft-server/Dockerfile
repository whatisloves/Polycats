# Use OpenJDK 21 Alpine for Minecraft server
FROM eclipse-temurin:21-jdk-alpine

# Install necessary packages
RUN apk add --no-cache curl

# Create server directory
WORKDIR /minecraft

# Download Paper 1.21.10 (latest build 86)
RUN curl -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.10/builds/86/downloads/paper-1.21.10-86.jar

# Copy plugin
COPY plugins/ ./plugins/

# Create necessary directories
RUN mkdir -p world world_nether world_the_end logs

# Copy server configuration
COPY server.properties ./
COPY eula.txt ./

# Set environment variables
ENV JAVA_OPTS="-Xmx2G -Xms1G"
ENV SERVER_PORT=25565

# Expose Minecraft server port
EXPOSE 25565

# Start the server
CMD java $JAVA_OPTS -jar paper.jar nogui
