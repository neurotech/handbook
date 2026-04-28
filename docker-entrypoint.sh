#!/bin/sh
set -eu

mkdir -p /data

export DATABASE_URL="${DATABASE_URL:-file:///data/dev.db}"

prisma migrate deploy

exec "$@"
