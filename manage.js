const STORAGE_KEY = 'vocab_cards_v1'
const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
const AUTH_USERS = [{user:'admin', pass:'wordpass123'}]
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

function requireLogin(){
  const logged = sessionStorage.getItem('vocabManagerAuth')
  if(logged === 'logged-in') return

  const username = prompt('請輸入管理者帳號：')
  const password = prompt('請輸入管理者密碼：')
  if(!username || !password){
    alert('需通過管理者驗證才能進入管理頁面。')
    location.href = 'index.html'
    return
  }

  const valid = AUTH_USERS.some(item => item.user === username && item.pass === password)
  if(!valid){
    alert('帳號或密碼錯誤，將返回主畫面。')
    location.href = 'index.html'
    return
  }

  sessionStorage.setItem('vocabManagerAuth', 'logged-in')
  showAlert('已通過管理者驗證', 'success')
}

function loadCards(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch(e){return[]}
}

function saveCards(cards){localStorage.setItem(STORAGE_KEY,JSON.stringify(cards))}

function showAlert(message, type = 'info'){
  if(!alertEl) return

  const base = ['rounded-2xl','px-4','py-3','text-sm','shadow-sm','transition','duration-200']
  const styleMap = {
    info: ['bg-oil-sky/20','border','border-oil-sky/40','text-oil-slate'],
    success: ['bg-emerald-100','border','border-emerald-200','text-emerald-900'],
    warning: ['bg-amber-100','border','border-amber-200','text-amber-900'],
    error: ['bg-rose-100','border','border-rose-200','text-rose-900']
  }

  alertEl.textContent = message
  alertEl.className = ''
  alertEl.classList.add(...base, ...styleMap[type] || styleMap.info)
}

function refreshList(){
  const cards = loadCards()
  listEl.innerHTML = ''
  if(cards.length === 0){
    const empty = document.createElement('li')
    empty.className = 'rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500'
    empty.textContent = '目前還沒有單字，請先儲存一筆新的背單字資料。'
    listEl.appendChild(empty)
    return
  }

  cards.forEach((c,i)=>{
    const li = document.createElement('li')
    li.className = 'flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm'
    const label = document.createElement('span')
    label.className = 'text-sm font-semibold text-slate-900'
    label.textContent = `${i + 1}. ${c.word} — ${c.translation || '-'} (${c.part || '-'})`
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'rounded-2xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-200'
    deleteBtn.textContent = '刪除'
    deleteBtn.dataset.index = i
    li.appendChild(label)
    li.appendChild(deleteBtn)
    listEl.appendChild(li)
  })
}

listEl.addEventListener('click',(event)=>{
  const btn = event.target.closest('button')
  if(!btn || !btn.dataset.index) return
  const index = Number(btn.dataset.index)
  const cards = loadCards()
  cards.splice(index,1)
  saveCards(cards)
  refreshList()
  showAlert('已刪除單字', 'success')
})

form.addEventListener('submit',async (e)=>{
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

  try{
    await sendToBackend(payload)
    showAlert('已同步儲存至後端試算表', 'success')
  }catch(err){
    console.warn(err)
    showAlert('本地儲存成功，後端同步失敗', 'warning')
  }
})

backBtn.addEventListener('click',()=>location.href='index.html')

async function sendToBackend(payload){
  if(!BACKEND_URL || BACKEND_URL.includes('YOUR_SCRIPT_ID')){
    return
  }

  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })

  if(!response.ok){
    throw new Error('後端儲存失敗')
  }

  return response.json()
}

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
        const parts = Array.from(new Set((entry.meanings||[]).map(m=>m.partOfSpeech).filter(Boolean)))
        if(parts.length) partInp.value = parts.join(', ')

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

        etyInp.value = entry.origin || ''
        showAlert('已從字典抓取可用資料（多筆詞性與例句合併）', 'success')
      }
    } else {
      showAlert('字典查詢失敗，將嘗試翻譯單字', 'warning')
    }

    if(!transInp.value){
      const toTranslate = (defs && defs.length && defs[0]) ? defs[0] : (exampleInp.value || w)
      const translation = await fetchTranslate(toTranslate)
      if(translation){
        transInp.value = translation
        showAlert('已以單字定義取得翻譯（若有）', 'success')
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

requireLogin()
refreshList()
