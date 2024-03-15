#!/bin/bash
# vector db 생성
npx wrangler vectorize create "" --dimensions=768 --metric=cosine
# sql db 생성
npx wrangler d1 create ""
# sql db 테이블 생성
npx wrangler d1 execute "" --remote --command "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"
# application deploy
npx wrangler deploy