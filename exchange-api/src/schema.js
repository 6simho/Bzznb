// src/schema.js
const { gql } = require('apollo-server-express');
const ExchangeRate = require('./models/ExchangeRate');

// 날짜 없을 때 오늘 날짜를 사용하기 위한 함수
function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 과제에서 준 GraphQL Schema 그대로
const typeDefs = gql`
  directive @key(fields: String!) on OBJECT | INTERFACE

  type Query {
    "환율조회"
    getExchangeRate(src: String!, tgt: String!): ExchangeInfo
  }

  type Mutation {
    "환율등록, src, tgt, date에 대해서 upsert"
    postExchangeRate(info: InputUpdateExchangeInfo): ExchangeInfo

    "환율삭제, 해당일자의 해당 통화간 환율을 삭제"
    deleteExchangeRate(info: InputDeleteExchangeInfo): ExchangeInfo
  }

  "환율업데이트정보 Input"
  input InputUpdateExchangeInfo {
    "소스통화, krw, usd"
    src: String!
    "타겟통화"
    tgt: String!
    "환율"
    rate: Float!
    "기준일, 값이 없으면, 최신일자로 등록"
    date: String
  }

  "환율삭제 Input"
  input InputDeleteExchangeInfo {
    "소스통화"
    src: String!
    "타겟통화"
    tgt: String!
    "기준일"
    date: String!
  }

  "환율정보"
  type ExchangeInfo @key(fields: "src, tgt") {
    "소스통화"
    src: String!
    "타겟통화"
    tgt: String!
    "환율"
    rate: Float!
    "기준일, 값이 없으면, 최신일자의 환율을 응답"
    date: String!
  }
`;

const resolvers = {
  Query: {
    /**
     * 환율 조회
     * - src, tgt 에 대한 문서 중 가장 최신(date 최대값) 1건을 반환
     * - latest 값 응답하는 것이 과제 요구사항
     */
    async getExchangeRate(_, { src, tgt }) {
        src = src.toLowerCase();
        tgt = tgt.toLowerCase();

        console.log(`[getExchangeRate] src=${src}, tgt=${tgt}`);

        // 정방향 조회
        let doc = await ExchangeRate
            .findOne({ src, tgt })
            .sort({ date: -1 })
            .exec();

        if (doc) {
            console.log('[getExchangeRate] direct hit:', doc);
            return {
            src: doc.src,
            tgt: doc.tgt,
            rate: doc.rate,
            date: doc.date,
            };
        }

        // 같은 통화면 1 고정
        if (src === tgt) {
            const today = getTodayString();
            console.log('[getExchangeRate] same currency, return 1.0, date=', today);
            return {
            src,
            tgt,
            rate: 1.0,
            date: today,
            };
        }

        // 역방향 조회
        const rev = await ExchangeRate
            .findOne({ src: tgt, tgt: src })
            .sort({ date: -1 })
            .exec();

        if (rev) {
            const converted = 1.0 / rev.rate;
            console.log('[getExchangeRate] reverse hit:', rev, 'converted rate=', converted);
            return {
            src,
            tgt,
            rate: converted,
            date: rev.date,
            };
        }

        console.log('[getExchangeRate] no data found');
        return null;
    },
},

  Mutation: {
    /**
     * 환율 등록 or 업데이트 (upsert)
     * - (src, tgt, date) 기준으로 같은 문서가 있으면 update
     * - 없으면 새로 insert
     * - date 없으면 오늘 날짜를 기본값으로 사용
     */
    async postExchangeRate(_, { info }) {
        let { src, tgt, rate } = info;
        let { date } = info;

        src = src.toLowerCase();
        tgt = tgt.toLowerCase();

        if (!date) {
            date = getTodayString();
        }

        if (src === tgt) {
            console.log(`[postExchangeRate] same currency (${src} -> ${tgt}), force rate=1.0`);
            rate = 1.0;
        } else {
            console.log(`[postExchangeRate] upsert ${src} -> ${tgt}, rate=${rate}, date=${date}`);
        }

        const doc = await ExchangeRate.findOneAndUpdate(
            { src, tgt, date },
            { $set: { rate } },
            { new: true, upsert: true }
        ).exec();

        console.log('[postExchangeRate] saved doc:', doc);

        return {
            src: doc.src,
            tgt: doc.tgt,
            rate: doc.rate,
            date: doc.date,
        };
    },

    /**
     * 환율 삭제
     * - 특정 (src, tgt, date) 문서를 삭제하고 삭제된 값을 응답
     */
    async deleteExchangeRate(_, { info }) {
        let { src, tgt, date } = info;
        src = src.toLowerCase();
        tgt = tgt.toLowerCase();

        console.log(`[deleteExchangeRate] try delete ${src} -> ${tgt}, date=${date}`);

        const doc = await ExchangeRate.findOneAndDelete({ src, tgt, date }).exec();

        if (!doc) {
            console.log('[deleteExchangeRate] no document to delete');
            return null;
        }

        console.log('[deleteExchangeRate] deleted doc:', doc);

        return {
            src: doc.src,
            tgt: doc.tgt,
            rate: doc.rate,
            date: doc.date,
        };
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
