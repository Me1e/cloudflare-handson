# cloudflare-handson

## 0. 도커가 정상적으로 설치되어 있는지 확인

> Node.js 16 이상은 로컬로 진행하셔도 좋습니다.

```bash
# 내 컴퓨터 터미널
docker run hello-world
```

"Hello from Docker!" 라는 메시지가 출력되면 정상적으로 설치된 것입니다.

## 1. 핸즈온을 진행 할 디렉토리를 만들고, 코드에디터(vscode)를 해당 디렉토리 위치로 오픈

## 2. 핸즈온을 진행 할 디렉토리에서 아래 명령어 실행

> 이후 모든 실습은 해당 디렉토리에서 진행합니다.

```bash
# 내 컴퓨터 터미널
docker run -it --name cf -p 3001:3001 -v "$(pwd):/app" -w /app node:20 bash
```

> `주의 사항`
>
> 내 컴퓨터가 3001번 포트를 사용하고 있으면 안됩니다.

이후 해당 컨테이너에 접근하려면 `docker exec -it cf bash`를 이용합니다.  
vim을 사용하시는 분들은 `apt-get update && apt-get install vim`을 실행하여 설치하시기 바랍니다.

## 3. 프로젝트 파일을 git으로 가져옴

```bash
# 컨테이너 내부 터미널
git clone https://github.com/Me1e/cloudflare-handson.git .
```

## 5. 아래 명령어로 npm 패키지 설치

```bash
# 컨테이너 내부 터미널
npm install
```

## 6. `wrangler.toml` 파일을 열어서 아래 내용 추가

> 다른 실습 인원과 중복되지 않도록 name은 본인 이메일 앞 부분으로 하기

```toml
name = ""
main = "src/index.js"
compatibility_date = "2024-03-16"

[ai]
binding = "AI"
```

## 7. cloudflare vector db 생성

> 다른 실습 인원과 중복되지 않도록 vector db 이름은 본인 이메일 앞 부분으로 하기

```bash
# 컨테이너 내부 터미널
npx wrangler vectorize create "" --dimensions=768 --metric=cosine
```

## 8. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = ""
```

## 9. cloudflare SQL db 생성

> 다른 실습 인원과 중복되지 않도록 db 이름은 본인 이메일 앞 부분으로 하기

```bash
# 컨테이너 내부 터미널
npx wrangler d1 create ""
```

## 10. `wrangler.toml` 파일을 열어서 아래 내용 추가

```toml
[[d1_databases]]
binding = "DB"
database_name = ""
database_id = ""
```

> database_id는 터미널에 출력된 id를 사용합니다.

## 11. cloudflare SQL db에 테이블 생성

```bash
# 컨테이너 내부 터미널
npx wrangler d1 execute "" --remote --command "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"
```

## 12. 로컬에서 테스트

```bash
# 컨테이너 내부 터미널
npx wrangler dev --remote --port=3001 --ip=0.0.0.0
```

"http://0.0.0.0:3001/home"으로 접속하여 테스트합니다.

## 13. 배포

```bash
# 컨테이너 내부 터미널
npx wrangler deploy
```

## 14. 즐기기

배포가 완료되면 터미널에 API 주소가 출력됩니다.  
그 주소에 `/home`을 붙여 접속하면 데모를 확인할 수 있습니다.  
ex. https://cloudflare-handson.mele0404.workers.dev/home

1. "데이터 추가"로 AI에게 지식을 알려줍니다.  
   ex. "클라우드 클럽은 천재들이 모인 동아리이다."

2. "데이터 검색"으로 AI에게 질문을 합니다.  
   ex. "클라우드 클럽은 무엇인가요?"

3. "답변"을 확인합니다.
