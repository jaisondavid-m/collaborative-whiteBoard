
# Build stag

FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

RUN go build -trimpath -ldflags="-s -w" -o /app/server .


# Runtime stage 

FROM apline:3.20 AS runner

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder /app/server /app/server

RUN mkdir -p /app/uploads && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q0- http://127.0.0.1:8000/health || exit 1

ENTRYPOINT ["/app/server"]