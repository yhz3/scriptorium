FROM golang:1.19
WORKDIR /code
CMD ["go", "run", "/code/main.go"]