#!/bin/bash
# Set up the environment
echo "-- Setting up --" 
npm install package.json
echo "package.json checked"

# Migrate the latest database
# echo "please accept the following auto-migrate"
# d=$(date)
# npx prisma migrate dev --name "$d"
# echo "prisma database checked."

# Building docker images
echo "building docker images"
docker build -t code-runner-python -f dockerfiles/Dockerfile.python .
docker build -t code-runner-c -f dockerfiles/Dockerfile.c .
docker build -t code-runner-java -f dockerfiles/Dockerfile.java .
docker build -t code-runner-node -f dockerfiles/Dockerfile.node .
docker build -t code-runner-ruby -f dockerfiles/Dockerfile.ruby .
docker build -t code-runner-go -f dockerfiles/Dockerfile.go .
docker build -t code-runner-php -f dockerfiles/Dockerfile.php .
docker build -t code-runner-rust -f dockerfiles/Dockerfile.rust .
docker build -t code-runner-kotlin -f dockerfiles/Dockerfile.kotlin .
echo "docker building complete"

# Setting up admin user
npx prisma generate
echo "prisma generated."
node ./createAdmin.mjs
echo "admin user added."

echo "-- Set up completed --"
npm run dev
