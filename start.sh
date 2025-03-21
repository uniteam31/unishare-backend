#!/bin/sh

echo "Applying migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node main.js