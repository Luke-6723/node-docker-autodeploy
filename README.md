# node-docker-autodeploy
A auto deploy service for node projects run inside docker.

# Usage
Create your `.env` file using the `.env.example`:

```dotenv
# Github authorization
AUTH_HEADER=

# Branch information
REPO_NAME=

# Github action information
ACTION_NAME=

# Docker container name
DOCKER_CONTAINER_NAME=

# Docker socket path (optional)
DOCKER_SOCKET_PATH=

# Discord webhook (optional)
DISCORD_WEBHOOK_URL=

# Listen configuration
HOST=
PORT=
```

Make sure the docker compose is configured the way you want it:
```dockerfile
version: '3'
services:
  node_autodeploy:
    container_name: node-autodeploy
    restart: always
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    env_file: .env
    ports:
      - 4000:4000
    stdin_open: true
    tty: true
```
Run the docker compose script:
`docker-compose up -d`
