# cloudflare-handson

### 0. 도커가 정상적으로 설치되어 있는지 확인 (node js 16 이상은 로컬로 진행하셔도 됩니다)

```bash
# 내 컴퓨터 터미널
docker run hello-world
```

"Hello from Docker!" 라는 메시지가 출력되면 정상적으로 설치된 것입니다.

### 1. 핸즈온을 진행 할 디렉토리를 만들고, 코드에디터(vscode)를 해당 디렉토리 위치로 오픈

### 2. 핸즈온을 진행 할 디렉토리에서 아래 명령어 실행

> 이후 모든 실습은 해당 디렉토리에서 진행합니다.

```bash
# 내 컴퓨터 터미널
docker run -it --name cf -p 3001:3001 -v "$(pwd):/app" -w /app node:20 bash
```

> `주의 사항`
>
> 내 컴퓨터가 3001번 포트를 사용하고 있으면 안됩니다.

이후 해당 컨테이너에 접근하려면 `docker exec -it cf bash`를 이용합니다.

### 3. 프로젝트 파일을 git으로 가져옴

```bash
# 컨테이너 내부 터미널
git clone https://github.com/Me1e/cloudflare-handson.git .
```

### 4. `.env` 파일을 생성하고, Cloudflare 계정 이메일과 "사용자 API 토큰" 입력

```
CLOUDFLARE_EMAIL="계정 이메일"
CLOUDFLARE_API_TOKEN="사용자 API 토큰"
```

### 5. 아래 명령어로 npm 패키지 설치

```bash
# 컨테이너 내부 터미널
npm install
```

### 6. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[ai]
binding = "AI"
```

### 7. cloudflare vector db 생성

> 다른 실습 인원과 중복되지 않도록 db 이름(현재 `your_email`로 표시됨)은 본인 이메일 앞 부분으로 하기

```bash
# 컨테이너 내부 터미널
npx wrangler vectorize create "your_email" --dimensions=768 --metric=cosine
```

> `주의 사항`
>
> 본인 계정이 아닌 `mele0404@naver.com` 계정으로 리소스 생성하기

### 8. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "your_email"
```

### 9. cloudflare SQL db 생성

> 다른 실습 인원과 중복되지 않도록 db 이름(현재 `your_email`로 표시됨)은 본인 이메일 앞 부분으로 하기

```bash
# 컨테이너 내부 터미널
npx wrangler d1 create "your_email"
```

### 10. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[d1_databases]]
binding = "DB"
database_name = "your_email"
database_id = "터미널에서 출력된 database_id 값"
```

### 11. cloudflare SQL db에 테이블 생성

```bash
# 컨테이너 내부 터미널
npx wrangler d1 execute "your_email" --remote --command "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"
```

### 12. 배포

```bash
# 컨테이너 내부 터미널
npx wrangler deploy
```

### 13. 즐기기

터미널에 출력된 주소에 `/home`을 붙여서 접속하면 실습을 진행할 수 있습니다.
ex. https://cloudflare-handson.mele0404.workers.dev/home

1. Add a Note로 AI에게 지식을 알려줍니다.
   ex. "클라우드 클럽은 천재들이 모인 동아리이다."

2. Query the Database로 AI에게 질문을 합니다.
   ex. "클라우드 클럽은 무엇인가요?"

3. Answer를 확인합니다.
