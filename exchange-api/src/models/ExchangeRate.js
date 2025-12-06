const mongoose = require('mongoose'); // 

const ExchangeRateSchema = new mongoose.Schema({
  src: { type: String, required: true },   // 소스통화
  tgt: { type: String, required: true },   // 타겟통화
  rate: { type: Number, required: true },  // 환율
  date: { type: String, required: true },  // 기준일
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성 : 디버깅할 때 사용하기 위해.
});

// (src, tgt, date) 조합이 하나만 존재하도록 unique 인덱스 설정
// 같은 날짜에 같은 통화쌍을 중복 저장하지 않기 위해서.
ExchangeRateSchema.index({ src: 1, tgt: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', ExchangeRateSchema);