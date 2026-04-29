#!/bin/sh
set -eu

mkdir -p /data

export DATABASE_URL="${DATABASE_URL:-file:///data/dev.db}"

pnpm exec prisma migrate deploy

exec "$@"
