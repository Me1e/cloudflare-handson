# cloudflare-handson

1. 핸즈온을 진행 할 디렉토리를 만들고, 코드에디터(vscode)를 해당 디렉토리 위치로 오픈
2. 핸즈온을 진행 할 디렉토리에서 아래 명령어 실행(이후 모든 실습은 해당 디렉토리에서 합니다)

```bash
# 내 컴퓨터 터미널
docker run -it --name cf -p 3001:3001 -v "$(pwd):/app" -w /app node:20 bash
```

3. 프로젝트 파일을 git으로 가져옴

```bash
# 컨테이너 내부 터미널
git clone https://github.com/Me1e/cloudflare-handson.git .
```

4. `.env` 파일을 생성하고, Cloudflare 계정 이메일과 "사용자 API 토큰" 입력

```
CLOUDFLARE_EMAIL="cloudflare 계정 이메일"
CLOUDFLARE_API_TOKEN="사용자 API 토큰"
```

5. 아래 명령어로 npm 패키지 설치

```bash
# 컨테이너 내부 터미널
npm install
```

6. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[ai]
binding = "AI"
```

7. cloudflare vector db 생성(다른 실습 인원과 중복되지 않도록 db 이름은 본인 이메일로 하기)

```bash
# 컨테이너 내부 터미널
npx wrangler vectorize create 본인이메일 --dimensions=768 --metric=cosine
```

8. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "본인이메일"
```

9. cloudflare SQL db 생성(다른 실습 인원과 중복되지 않도록 db 이름은 본인 이메일로 하기)

```bash
# 컨테이너 내부 터미널
npx wrangler d1 create 본인이메일
```

10. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[d1_databases]]
binding = "DB"
database_name = "본인이메일"
database_id = "터미널에서 출력된 database_id 값"
```

11. cloudflare SQL db에 테이블 생성

```bash
# 컨테이너 내부 터미널
npx wrangler d1 execute 본인이메일 --remote --command "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"
```

12. 배포

```bash
# 컨테이너 내부 터미널
npx wrangler deploy
```

13.
