# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.14.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix/Prisma"

# Remix/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Generate Prisma Client
COPY prisma ./prisma/
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    DATABASE_URL_UNPOOLED="postgresql://build:build@localhost:5432/build" \
    npx prisma generate

# Copy application code
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y openssl ca-certificates && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Entrypoint prepares the database.
ENTRYPOINT [ "/app/docker-entrypoint.js" ]

ENV INTERNAL_PORT="8080"
ENV PORT="8080"
ENV NODE_ENV="production"

CMD [ "npm", "run", "start" ]
