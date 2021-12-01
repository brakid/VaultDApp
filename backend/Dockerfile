FROM golang:latest AS builder

ENV CGO_ENABLED=0

WORKDIR /go/src/app

COPY go.mod .
COPY go.sum .
RUN go mod download
RUN go mod verify

COPY . .

RUN go build -ldflags="-s -w" -o server.out .

FROM alpine:latest

ENV PORT=8000
ENV GIN_MODE=release

EXPOSE ${PORT}

WORKDIR /app

COPY --from=builder /go/src/app/credentials.json .
COPY --from=builder /go/src/app/server.out .

CMD ["./server.out"]