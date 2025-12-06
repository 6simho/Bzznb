# Bzznb
# 🗝️실행방법

### 1. GitHub 저장소 클론

초록색 <> Code 버튼을 눌러서 레포지토리 url을 복사하고 본인 로컬에 clone함.(코드에서 “복사한 url” 부분)

```jsx
git clone 복사한 url 
```

exchange-api 폴더로 이동함.

```jsx
cd exchange-api
```

### 2. 의존성 설치

본 과제에서 필요한 패키지(node_modules)를 설치하는 과정이므로 node.js가 설치되어 있어도 이 파트를 수행해야함.

```jsx
npm install
```

### 3. MongoDB 설치 및 실행 (로컬 DB)

**macOS인 경우(Homebrew로 설치)**

1. MongoDB 패키지를 다운로드할 수 있는 저장소를 추가
    
    ```jsx
    brew tap mongodb/brew
    ```
    
2. MongoDB Community Edition(무료 버전)을 다운로드
    
    ```jsx
    brew install mongodb-community
    ```
    
3. MongoDB 서버를 macOS의 백그라운드 서비스(daemon) 형태로 실행
: Node.js 애플리케이션이 DB에 접속하려면, 백그라운드에서 MongoDB가 계속 실행 중이어야 하므로.
    
    ```jsx
    brew services start mongodb-community
    ```
    

**Windows인 경우**

1. https://www.mongodb.com/try/download/community 링크 접속
2. 옵션 선택
    - Version: 8.2.2 (current)
    - Platform: Windows x64
    - Package: zip
3. Download 버튼 클릭
4. 다운로드 받은 ZIP 파일을 원하는 곳에 압축 해제
5. mongod.exe 실행하여 서버 시작

→ 실행되면 기본 포트 mongodb://localhost:27017 로 MongoDB가 작동함.
    

### **4. 서버 실행**

- exchange-api 경로에서 아래 코드를 실행한다.
    
    ```jsx
    npm start
    ```
    
- 실행하면 결과가 아래와 같이 나와야함.
    
    ```jsx
    MongoDB connected
    GraphQL server running at http://localhost:5110/graphql
    ```
    
    ⇒ 서버가 정상적으로 실행된 것.
    

### **5. GraphQL API 테스트 진행**

**curl 테스트 스크립트로 검증**

서버를 실행시킨 상태에서 새로운 터미널을 열어 exchange-api 경로로 이동.(cd exchange-api)

이 터미널에서 아래 코드를 실행

1. 환율 등록
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "mutation { postExchangeRate (info: { src: \"usd\", tgt: \"krw\", rate: 1342.11, date:\"2022-11-28\" }) { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    
    ```bash
    {
      "data": {
        "postExchangeRate": {
          "src": "usd",
          "tgt": "krw",
          "rate": 1342.11,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
    이렇게 나옴.
    
2. 환율 조회(usd→krw - 정방향 조회)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    ```bash
    {
      "data": {
        "getExchangeRate": {
          "src": "usd",
          "tgt": "krw",
          "rate": 1342.11,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
3. 환율 조회(krw→usd - 역방향 조회) 
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"krw\", tgt: \"usd\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    
    ```bash
    {
      "data": {
        "getExchangeRate": {
          "src": "krw",
          "tgt": "usd",
          "rate": 0.0007450954094671824,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
4. 환율 조회(usd→usd - 동일 통화)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"usd\", tgt: \"usd\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    
    ```jsx
    {
      "data": {
        "getExchangeRate": {
          "src": "usd",
          "tgt": "usd",
          "rate": 1,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
5. 환율 조회(krw→krw - 동일 통화)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    
    ```bash
    {
      "data": {
        "getExchangeRate": {
          "src": "krw",
          "tgt": "krw",
          "rate": 1,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
6. 환율 업데이트(krw→krw - rate를 2로 수정 시도)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "mutation { postExchangeRate (info: { src: \"krw\", tgt: \"krw\", rate: 2.0, date:\"2022-11-28\" }) { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    같은 통화 간 rate 수정은 실패함.
    
    ```bash
    {
      "data": {
        "postExchangeRate": {
          "src": "krw",
          "tgt": "krw",
          "rate": 1,
          "date": "2022-11-28"
        }
      }
    ```
    
    [검증]
    업데이트가 되었을지 krw→krw 환율을 조회해보자.
    
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    즉, 같은 통화 간 환율은 1로 변함이 없다.
    
    ```bash
    {
      "data": {
        "getExchangeRate": {
          "src": "krw",
          "tgt": "krw",
          "rate": 1,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
7. 환율 삭제(usd→krw 환율 삭제)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "mutation { deleteExchangeRate (info: { src: \"usd\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    
    ```jsx
    {
      "data": {
        "deleteExchangeRate": {
          "src": "usd",
          "tgt": "krw",
          "rate": 1342.11,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
    [검증]
    실제로 없어졌는지 확인하기 위해서 다시 조회해보기. (usd→krw 환율 조회)
    
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    아래와 같이 null값이 나옴. 즉, 삭제 처리되었다는 것.
    
    ```jsx
    
    {
      "data": {
        "getExchangeRate": null
      }
    }
    ```
    
8. 환율 삭제(krw→krw 환율 삭제 시도)
    [입력]
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "mutation { deleteExchangeRate (info: { src: \"krw\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력]
    아래와 같이 출력되는데, 삭제가 되었는지 확인이 필요함. (같은 통화 간 환율은 1로 변함이 없기 때문에.)
    
    ```jsx
    {
      "data": {
        "deleteExchangeRate": {
          "src": "krw",
          "tgt": "krw",
          "rate": 1,
          "date": "2022-11-28"
        }
      }
    }
    ```
    
    [검증] krw→krw 환율 조회.
    
    ```bash
    curl -XPOST "http://localhost:5110/graphql" --silent \
    -H  "accept: application/json" \
    -H  "Content-Type: application/json" \
    -d '
    { 
      "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
    }
    ' | jq
    ```
    
    [출력] 
    아래와 같이 결과가 나옴. 즉, 삭제되지 않음. 추가로, 2025-12-06으로 date가 변경되어 있는 것을 볼 수 있는데 이는 현재 DB내에  krw 관련된 환율 정보가 모두 삭제되어 있기 때문에 오늘 날짜(조회한 날짜 기준)로 나타나는 것임. (이 코드를 실행한 날짜가 2025-12-10이면 출력되는 date도 2025-12-10이다.)
    
    ```bash
    {
      "data": {
        "getExchangeRate": {
          "src": "krw",
          "tgt": "krw",
          "rate": 1,
          "date": "2025-12-06"
        }
      }
    }
    ```
---