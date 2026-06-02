const STORAGE_KEY = 'vocab_cards_v1'
const form = document.getElementById('word-form')
const wordInp = document.getElementById('word')
const transInp = document.getElementById('translation')
const partInp = document.getElementById('part')
const exampleInp = document.getElementById('example')
const etyInp = document.getElementById('etymology')
const autofillBtn = document.getElementById('autofill')
const backBtn = document.getElementById('back')
const listEl = document.getElementById('words-list')
const alertEl = document.getElementById('alert')

function loadCards(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch(e){return[]}
}
function saveCards(cards){localStorage.setItem(STORAGE_KEY,JSON.stringify(cards))}

function showAlert(message, type = 'info'){
  if(!alertEl) return
  alertEl.textContent = message
  alertEl.className = `alert ${type}`
}

function refreshList(){
  const cards = loadCards()
  listEl.innerHTML = ''
  if(cards.length === 0){
    const empty = document.createElement('li')
    empty.className = 'empty'
    empty.textContent = '目前還沒有單字，請先儲存一筆新的背單字資料。'
    listEl.appendChild(empty)
    return
  }

  cards.forEach((c,i)=>{
    const li = document.createElement('li')
    const label = document.createElement('span')
    label.className = 'word-label'
    label.textContent = `${i + 1}. ${c.word} — ${c.translation || '-'} (${c.part || '-'})`
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'delete-btn'
    deleteBtn.textContent = '刪除'
    deleteBtn.dataset.index = i
    li.appendChild(label)
    li.appendChild(deleteBtn)
    listEl.appendChild(li)
  })
}

listEl.addEventListener('click',(event)=>{
  const btn = event.target.closest('.delete-btn')
  if(!btn) return
  const index = Number(btn.dataset.index)
  const cards = loadCards()
  cards.splice(index,1)
  saveCards(cards)
  refreshList()
  showAlert('已刪除單字', 'success')
})

form.addEventListener('submit',(e)=>{
  e.preventDefault()
  const payload = {
    word: wordInp.value.trim(),
    translation: transInp.value.trim(),
    part: partInp.value.trim(),
    example: exampleInp.value.trim(),
    etymology: etyInp.value.trim(),
  }

  if(!payload.word) return showAlert('請先輸入英文單字', 'warning')

  const cards = loadCards()
  const existingIndex = cards.findIndex(c => c.word.toLowerCase() === payload.word.toLowerCase())
  if(existingIndex >= 0){
    cards[existingIndex] = payload
    showAlert('已更新現有單字內容', 'success')
  } else {
    cards.push(payload)
    showAlert('儲存成功', 'success')
  }
  saveCards(cards)
  refreshList()
  form.reset()
})

backBtn.addEventListener('click',()=>location.href='index.html')

async function fetchTranslate(text){
  try{
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-TW`
    const resp = await fetch(url)
    if(!resp.ok) return ''
    const payload = await resp.json()
    return payload?.responseData?.translatedText || ''
  }catch(e){
    return ''
  }
}

async function autofillEntry(){
  const w = (wordInp.value || '').trim()
  if(!w){
    showAlert('請先在英文單字欄位輸入內容', 'warning')
    return
  }

  autofillBtn.disabled = true
  autofillBtn.textContent = '填入中...'
  showAlert('正在取得單字資料，請稍候...', 'info')

  try{
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`)
    let defs = []
    if(dictRes.ok){
      const data = await dictRes.json()
      if(Array.isArray(data) && data.length > 0){
        const entry = data[0]
        // 收集所有詞性
        const parts = Array.from(new Set((entry.meanings||[]).map(m=>m.partOfSpeech).filter(Boolean)))
        if(parts.length) partInp.value = parts.join(', ')

        // 收集例句與定義，若有多個以 / 分隔
        const examples = []
        defs = []
        for(const m of (entry.meanings||[])){
          for(const d of (m.definitions||[])){
            if(d.example) examples.push(d.example)
            if(d.definition) defs.push(d.definition)
          }
        }
        if(examples.length) exampleInp.value = examples.slice(0,3).join(' / ')
        else if(defs.length) exampleInp.value = defs[0]

        // 字根/出處
        etyInp.value = entry.origin || ''
        showAlert('已從字典抓取可用資料（多筆詞性與例句合併）', 'success')
      }
    } else {
      showAlert('字典查詢失敗，將嘗試翻譯單字', 'warning')
    }

    // 翻譯：優先翻譯定義／例句，比翻譯單字更精準
    if(!transInp.value){
      const toTranslate = exampleInp.value || defs[0] || w
      const translation = await fetchTranslate(toTranslate)
      if(translation){
        transInp.value = translation
      } else {
        showAlert('翻譯服務暫時不可用，請手動填寫翻譯欄位', 'error')
      }
    }
  }catch(err){
    console.error(err)
    showAlert('自動填入發生錯誤，請手動補齊欄位', 'error')
  } finally {
    autofillBtn.disabled = false
    autofillBtn.textContent = '自動填入'
  }
}

autofillBtn.addEventListener('click',autofillEntry)

refreshList()
