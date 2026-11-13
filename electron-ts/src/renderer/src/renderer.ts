const input = document.querySelector<HTMLTextAreaElement>('#text')!
const preview = document.querySelector<HTMLDivElement>('#preview')!
const statusLine = document.querySelector<HTMLParagraphElement>('#status')!
const saveButtons = {
  svg: document.querySelector<HTMLButtonElement>('#save-svg')!,
  png: document.querySelector<HTMLButtonElement>('#save-png')!
}

function setSavable(savable: boolean): void {
  saveButtons.svg.disabled = saveButtons.png.disabled = !savable
}

// 입력이 빠르게 바뀌면 늦게 도착한 이전 응답이 최신 미리보기를 덮지 않게 한다.
let latest = 0

async function render(): Promise<void> {
  const id = ++latest
  const text = input.value
  statusLine.textContent = ''
  setSavable(false)
  if (text === '') {
    preview.replaceChildren()
    return
  }
  try {
    const svg = await window.api.qrSvg(text)
    if (id !== latest) return
    preview.innerHTML = svg
    setSavable(true)
  } catch {
    if (id !== latest) return
    preview.replaceChildren()
    statusLine.textContent = '내용이 너무 길어서 QR 코드로 만들 수 없어요.'
  }
}

async function save(format: 'svg' | 'png'): Promise<void> {
  const path = await window.api.saveQr(input.value, format)
  if (path) statusLine.textContent = `저장했어요: ${path}`
}

input.addEventListener('input', render)
saveButtons.svg.addEventListener('click', () => save('svg'))
saveButtons.png.addEventListener('click', () => save('png'))
