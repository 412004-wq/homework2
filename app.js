const STORAGE_KEY = 'vocab_cards_v1'
const cardEl = document.getElementById('card')
const frontEl = document.getElementById('card-front')
const backEl = document.getElementById('card-back')
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
  const w = cards[idx]
  if(!w) return
  frontEl.textContent = w.word
  backEl.innerHTML = `<h3>${w.word}</h3>
    <div class="meta"><strong>詞性：</strong>${w.part||'-'}</div>
    <p><strong>翻譯：</strong>${w.translation||'-'}</p>
    <p><strong>例句：</strong>${w.example||'-'}</p>
    <p><strong>字根/出處：</strong>${w.etymology||'-'}</p>`
}

cardEl.addEventListener('click',()=>cardEl.classList.toggle('flipped'))
prevBtn.addEventListener('click',()=>{idx=(idx-1+cards.length)%cards.length;cardEl.classList.remove('flipped');render()})
nextBtn.addEventListener('click',()=>{idx=(idx+1)%cards.length;cardEl.classList.remove('flipped');render()})
manageBtn.addEventListener('click',()=>{location.href='manage.html'})

loadCards()
render()
