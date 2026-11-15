// The only file where Korean UI text may appear; scripts/check-i18n.mts enforces this.
export const ko = {
  TEXT_PLACEHOLDER: 'URL이나 텍스트를 입력하세요',
  SAVE_SVG: 'SVG로 저장',
  SAVE_PNG: 'PNG로 저장',
  STATUS_SAVED: '저장했어요: {path}',
  STATUS_TOO_LONG: '내용이 너무 길어서 QR 코드로 만들 수 없어요.'
}

export type MessageKey = keyof typeof ko
