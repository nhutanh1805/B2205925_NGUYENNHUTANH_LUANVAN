// utils/badWords.util.js

const BANNED_WORDS = [
  // Miệt thị / xúc phạm nhẹ
  "ngu", "óc chó", "đồ ngu", "thằng ngu", "con ngu",
  "đồ khốn", "đồ điên", "đầu đất", "óc bã đậu",
  "não phẳng", "mất dạy", "vô học", "đồ vô dụng",
  "ngu như bò", "ngu như chó",

  // Lừa đảo / bảo vệ uy tín shop
  "lừa đảo", "scam", "hàng giả", "hàng nhái", "lừa tiền", "lừa",

  // Quấy rối / đe dọa nhẹ
  "cút", "biến đi", "im mồm",
];

function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function containsBannedWord(text) {
  const normalized = removeDiacritics(text.toLowerCase());
  return BANNED_WORDS.some((word) => {
    const normalizedWord = removeDiacritics(word.toLowerCase());
    return normalized.includes(normalizedWord);
  });
}

module.exports = { containsBannedWord };