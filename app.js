const STORAGE_KEY = 'vocab_cards_v1'
const cardEl = document.getElementById('card')
const frontEl = document.getElementById('card-front')
const backEl = document.getElementById('card-back')
const counterEl = document.getElementById('card-counter')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')
const manageBtn = document.getElementById('manage')

let cards = []
let idx = 0

function loadCards(){
  try{cards = JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch(e){cards=[]}
  if(!cards.length){
    cards = [{word:'example',translation:'範例',part:'noun',example:'This is an example sentence.',etymology:'from Latin exemplum'}]
    saveCards()
  }
}

function saveCards(){localStorage.setItem(STORAGE_KEY,JSON.stringify(cards))}

function render(){
  if(!cards.length){
    frontEl.textContent = '無單字資料'
    backEl.innerHTML = '<p class="small-note">請先到管理頁新增單字，再回到主畫面查看。</p>'
    counterEl.textContent = '0 / 0'
    return
  }

  const w = cards[idx]
  frontEl.textContent = w.word
  backEl.innerHTML = `
    <div class="back-title">${w.word}</div>
    <div class="section"><strong>翻譯</strong><p>${w.translation||'-'}</p></div>
    <div class="section"><strong>詞性</strong><p>${w.part||'-'}</p></div>
    <div class="section"><strong>例句</strong><p>${w.example||'-'}</p></div>
    <div class="section"><strong>字根/出處</strong><p>${w.etymology||'-'}</p></div>
  `
  counterEl.textContent = `${idx+1} / ${cards.length}`
}

cardEl.addEventListener('click',()=>cardEl.classList.toggle('flipped'))
prevBtn.addEventListener('click',()=>{if(!cards.length) return; idx=(idx-1+cards.length)%cards.length;cardEl.classList.remove('flipped');render()})
nextBtn.addEventListener('click',()=>{if(!cards.length) return; idx=(idx+1)%cards.length;cardEl.classList.remove('flipped');render()})
manageBtn.addEventListener('click',()=>{location.href='manage.html'})

loadCards()
render()
