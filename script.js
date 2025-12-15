/* Interactive script for monthsary page */
const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseMessage = document.getElementById('surpriseMessage');
const kissBtn = document.getElementById('kissBtn');
const gameStatus = document.getElementById('gameStatus');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const floatingHeart = document.getElementById('floatingHeart');

// Accessible toggle for surprise
surpriseBtn.addEventListener('click', toggleSurprise);
surpriseBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSurprise(); } });

function toggleSurprise(){
    const open = !surpriseMessage.classList.contains('hidden');
    if(open){
        surpriseMessage.classList.add('hidden');
        surpriseBtn.setAttribute('aria-expanded','false');
    } else {
        surpriseMessage.classList.remove('hidden');
        surpriseBtn.setAttribute('aria-expanded','true');
        launchConfetti(40);
    }
}

// kiss button gives a playful animation + aria announcement
if(kissBtn){
    kissBtn.addEventListener('click', ()=>{
        kissBtn.animate([{ transform: 'scale(1)' },{ transform: 'scale(1.15)' },{ transform: 'scale(1)'}],{ duration: 350 });
        announce('A virtual kiss sent! 😘');
    });
}

function announce(text){
    // create live region if needed
    let live = document.getElementById('sr-live');
    if(!live){ live = document.createElement('div'); live.id='sr-live'; live.setAttribute('aria-live','polite'); live.style.position='absolute'; live.style.left='-9999px'; document.body.appendChild(live); }
    live.textContent = text;
}

// Music control
// Music: prefer WebAudio generator (works without external file). If you have an external file, you can still use it.
let audioCtx = null;
let musicNodes = [];
let musicPlaying = false;

function startMusic(){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    // simple layered oscillators for a warm, looping pad
    const master = audioCtx.createGain(); master.gain.value = 0.18; master.connect(audioCtx.destination);

    const oscA = audioCtx.createOscillator(); oscA.type = 'sine'; oscA.frequency.value = 220; // A3
    const oscB = audioCtx.createOscillator(); oscB.type = 'triangle'; oscB.frequency.value = 440; // A4
    const gainB = audioCtx.createGain(); gainB.gain.value = 0.35;

    oscA.connect(master);
    oscB.connect(gainB);
    gainB.connect(master);

    // slow LFO to modulate master gain for gentle movement
    const lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain); lfoGain.connect(master.gain);

    oscA.start(); oscB.start(); lfo.start();
    musicNodes = [oscA, oscB, gainB, lfo, lfoGain, master];
    musicPlaying = true; musicToggle.textContent = 'Pause Music ⏸'; musicToggle.setAttribute('aria-pressed','true');
}

function stopMusic(){
    musicNodes.forEach(n=>{ try{ if(n.stop) n.stop(); if(n.disconnect) n.disconnect(); }catch(e){} });
    musicNodes = [];
    musicPlaying = false; musicToggle.textContent = 'Play Music ♪'; musicToggle.setAttribute('aria-pressed','false');
}

musicToggle.addEventListener('click', ()=>{
    if(musicPlaying) stopMusic(); else startMusic();
});

// Floating heart click toggles surprise too
if(floatingHeart){ floatingHeart.addEventListener('click', toggleSurprise); floatingHeart.tabIndex = 0; }

/* ---------------- Memory game ---------------- */
function shuffle(array){ for(let i=array.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]]; } }

const cardElems = Array.from(document.querySelectorAll('.game .card'));
let flipped = [];
let matched = 0;

// randomize visually by shuffling DOM order
shuffle(cardElems);
const board = document.querySelector('.game-board');
cardElems.forEach(c=>board.appendChild(c));

cardElems.forEach(card => {
    card.addEventListener('click', onCardClick);
    card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); onCardClick.call(card); } });
});

function onCardClick(){
    if(this.classList.contains('flipped') || this.classList.contains('matched') || flipped.length===2) return;
    this.classList.add('flipped');
    flipped.push(this);
    if(flipped.length===2){
        const a=flipped[0], b=flipped[1];
        if(a.dataset.value===b.dataset.value){
            a.classList.add('matched'); b.classList.add('matched'); matched++; gameStatus.textContent = `Matches found: ${matched}/3`;
            const lovingnotes = [
                'You light up my world 💫',
                'Every moment with you is special ✨',
                'Forever grateful for you 💖'
            ];
            announce(lovingnotes[matched-1]);
            if(matched===3){ setTimeout(()=>{ announce('You win! Sending a big hug 🤗'); launchConfetti(80); }, 300); }
            flipped = [1];
        } else {
            setTimeout(()=>{ flipped.forEach(x=>x.classList.remove('flipped')); flipped = []; }, 800);
        }
    }
}

/* ---------------- Confetti ---------------- */
function launchConfetti(count=400){
    const colors=['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#ffd1dc'];
    for(let i=0;i<count;i++){
        const el=document.createElement('div'); el.className='confetti';
        el.style.left=(Math.random()*100)+'vw'; el.style.background=colors[Math.floor(Math.random()*colors.length)];
        el.style.transform=`rotate(${Math.random()*3600}deg)`; el.style.opacity=1;
        el.style.width=(6+Math.random()*12)+'px'; el.style.height=(8+Math.random()*14)+'px';
        document.body.appendChild(el);
        setTimeout(()=>el.remove(), 3000);
    }
}

/* ---------------- Keyboard: Escape to close surprise ---------------- */
document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
        if(!surpriseMessage.classList.contains('hidden')) toggleSurprise();
    }
});

// ensure buttons are keyboard-friendly
document.querySelectorAll('button').forEach(b=>{ b.addEventListener('keyup', e=>{ if(e.key===' '){ e.preventDefault(); b.click(); } }); });