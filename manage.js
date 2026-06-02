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

function loadCards(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch(e){return[]}
}
function saveCards(cards){localStorage.setItem(STORAGE_KEY,JSON.stringify(cards))}

function refreshList(){
  const cards = loadCards()
  listEl.innerHTML = ''
  cards.forEach((c,i)=>{
    const li = document.createElement('li')
    li.textContent = `${c.word} — ${c.translation||''} (${c.part||''})`
    listEl.appendChild(li)
  })
}

form.addEventListener('submit',(e)=>{
  e.preventDefault()
  const cards = loadCards()
  const payload = {word:wordInp.value.trim(),translation:transInp.value.trim(),part:partInp.value.trim(),example:exampleInp.value.trim(),etymology:etyInp.value.trim()}
  if(!payload.word) return alert('請輸入英文單字')
  cards.push(payload)
  saveCards(cards)
  refreshList()
  form.reset()
})

backBtn.addEventListener('click',()=>location.href='index.html')

autofillBtn.addEventListener('click',async ()=>{
  const w = (wordInp.value||'').trim()
  if(!w) return alert('請先在「英文單字」輸入欄位填入單字再按自動填入')
  autofillBtn.textContent = '填入中...'
  try{
    // 1) 查字典 API（取詞性、定義、例句、出處）
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`)
    if(dictRes.ok){
      const data = await dictRes.json()
      const entry = data[0]
      if(entry){
        const meaning = entry.meanings && entry.meanings[0]
        const def = meaning && meaning.definitions && meaning.definitions[0]
        partInp.value = meaning?.partOfSpeech || ''
        exampleInp.value = def?.example || ''
        etyInp.value = entry.origin || ''
      }
    }

    // 2) 翻譯（若有定義則把定義翻成中文）
    let toTranslate = ''
    const cards = loadCards()
    const exists = cards.find(c=>c.word.toLowerCase()===w.toLowerCase())
    if(!transInp.value){
      // 優先使用字典定義做翻譯對象
      const possible = document.getElementById('example').value
      toTranslate = possible || w
      try{
        const trRes = await fetch('https://libretranslate.de/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:toTranslate,source:'en',target:'zh'})})
        if(trRes.ok){
          const tr = await trRes.json()
          transInp.value = tr.translatedText || ''
        }
      }catch(e){/* 若翻譯服務不可用則略過 */}
    }

  }catch(err){console.error(err);alert('自動填入發生錯誤，請稍後再試')}
  autofillBtn.textContent = '自動填入'
})

refreshList()
