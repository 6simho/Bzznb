#!/bin/bash
# GraphQL 환율 API 테스트 스크립트 모음집!

set -e  # 중간에 에러 나면 스크립트 중단

echo "===== 1. 환율 등록 (usd -> krw, 2022-11-28) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "mutation { postExchangeRate (info: { src: \"usd\", tgt: \"krw\", rate: 1342.11, date:\"2022-11-28\" }) { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 2. 환율 조회 (usd -> krw - 정방향 조회) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 3. 환율 조회 (krw -> usd - 역방향 조회) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"krw\", tgt: \"usd\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 4. 환율 조회 (usd -> usd - 동일 통화) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"usd\", tgt: \"usd\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 5. 환율 조회 (krw -> krw - 동일 통화) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 6. 환율 업데이트 (krw -> krw, rate=2.0 시도) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "mutation { postExchangeRate (info: { src: \"krw\", tgt: \"krw\", rate: 2.0, date:\"2022-11-28\" }) { src tgt rate date } }"
}
' | jq
echo ""

echo "  -> [검증] krw -> krw 환율 조회 (rate가 실제로 1로 유지되는지 확인)"
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 7. 환율 삭제 (usd -> krw, 2022-11-28) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "mutation { deleteExchangeRate (info: { src: \"usd\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
}
' | jq
echo ""

echo "  -> [검증] 삭제 후 usd -> krw 환율 조회 (정방향 데이터가 없어졌는지 확인)"
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"usd\", tgt: \"krw\") { src tgt rate date } }"
}
' | jq
echo ""


echo "===== 8. 환율 삭제 (krw -> krw, 2022-11-28) ====="
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "mutation { deleteExchangeRate (info: { src: \"krw\", tgt: \"krw\", date:\"2022-11-28\" }) { src tgt rate date } }"
}
' | jq
echo ""

echo "  -> [검증] krw -> krw 환율 조회 (동일 통화 로직이 최신 date 기준으로 1.0을 반환하는지 확인)"
curl -XPOST "http://localhost:5110/graphql" --silent \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '
{ 
  "query": "query { getExchangeRate (src: \"krw\", tgt: \"krw\") { src tgt rate date } }"
}
' | jq
echo ""

echo "===== 모든 테스트 완료 ====="
