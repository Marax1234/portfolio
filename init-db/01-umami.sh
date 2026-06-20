#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
    CREATE USER umami WITH PASSWORD '${UMAMI_DB_PASSWORD}';
    CREATE DATABASE umami OWNER umami;
SQL
