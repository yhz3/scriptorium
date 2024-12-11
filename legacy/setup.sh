#!/bin/bash
# Set up the environment
echo "-- Setting up" 
npm install @prisma/client @prisma/studio
echo "prisma checked."
npm install bcrypt
echo "bcrypt checked."
npm install jsonwebtoken
echo "jsonwebtoken checked."
npm install validator
echo "validator checked."
npm install ms
echo "ms checked."
npm install --save-dev jest supertest
echo "supertest checked."
npm install react
npm install react react-dom
echo "react checked."
npm install next
echo "Next js checked."
npm install prisma
echo "Server side prisma checked."
npm install axios
echo "axios checked."

# Migrate the latest database
echo "please accept the following auto-migrate"
d=$(date)
npx prisma migrate dev --name "$d"
echo "prisma database checked."

# Setting up admin user
npx prisma generate
echo "prisma generated."
node ./createAdmin.mjs
echo "admin user added."

echo "-- Set up completed."
