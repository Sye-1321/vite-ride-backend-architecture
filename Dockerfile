FROM node:20-bookworm-slim AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ARG BUILD_TARGET
COPY . .
RUN npm run "build:${BUILD_TARGET}"

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /workspace/dist ./dist
COPY --from=build /workspace/libs/proto-schema/proto ./libs/proto-schema/proto
USER node
ARG APP_PATH
ENV APP_PATH=${APP_PATH}
CMD ["sh", "-c", "node \"dist/apps/${APP_PATH}/main.js\""]
