// Tic Tac Toe logic with AI, difficulty, click sound, win fireworks
let board = Array(9).fill(null);
let isXNext = true;
let winner = null;
let mode = null;
let difficulty = null;
let scores = {X:0,O:0,draws:0};
let playerXName = "Player X";
let playerOName = "Player O";

const boardEl = document.getElementById("board");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound"); // draw sound (can be changed)
const fireworksSound = document.getElementById("fireworksSound"); // short fireworks burst

function selectMode(m){
    mode=m;
    document.getElementById('modeScreen').classList.add('hidden');
    document.getElementById('playerNamePopup').classList.remove('hidden');
    document.getElementById('playerXInput').value="";
    document.getElementById('playerOInput').value="";
    document.getElementById('popupTitle').textContent = m==='vsComputer' ? "Enter Your Name" : "Enter Player Names";
    if(m==='vsComputer') document.getElementById('playerOInput').classList.add('hidden');
    else document.getElementById('playerOInput').classList.remove('hidden');
}

function confirmNames(){
    let x=document.getElementById('playerXInput').value.trim();
    let o=document.getElementById('playerOInput').value.trim();
    if(!x){document.getElementById('errorX').style.display='block';return;}
    if(mode==='2player' && !o){document.getElementById('errorO').style.display='block';return;}
    playerXName=x;
    playerOName=mode==='vsComputer'?'Computer':o;
    document.getElementById('playerNamePopup').classList.add('hidden');
    document.getElementById('playerXLabel').textContent=playerXName;
    document.getElementById('playerOLabel').textContent=playerOName;
    if(mode==='vsComputer') document.getElementById('difficultyScreen').classList.remove('hidden');
    else startGame();
}

function selectDifficulty(d){
    difficulty=d;
    document.getElementById('difficultyScreen').classList.add('hidden');
    startGame();
}

function backToMode(){
    document.getElementById('difficultyScreen').classList.add('hidden');
    document.getElementById('modeScreen').classList.remove('hidden');
}

function backFromNamePopup(){
    document.getElementById('playerNamePopup').classList.add('hidden');
    document.getElementById('playerXInput').value="";
    document.getElementById('playerOInput').value="";
    document.getElementById('errorX').style.display='none';
    document.getElementById('errorO').style.display='none';
    document.getElementById('modeScreen').classList.remove('hidden');
    mode=null;
}

function startGame(){
    board=Array(9).fill(null);
    isXNext=true;
    winner=null;
    document.getElementById('gameScreen').classList.remove('hidden');
    renderBoard();
    updateStatus();
}

function renderBoard(){
    boardEl.innerHTML='';
    board.forEach((v,i)=>{
        const c=document.createElement('div');
        c.className='cell'+(v?' '+v.toLowerCase():'');
        c.textContent=v||'';
        c.onclick=()=>handleClick(i);
        boardEl.appendChild(c);
    });
    if(winner && winner.line){
        winner.line.forEach(idx=>boardEl.children[idx].classList.add('winning'));
    }
}

function handleClick(i){
    if(board[i]||winner) return;
    clickSound.play().catch(()=>{});
    board[i]=isXNext?'X':'O';
    checkWinner();
    isXNext=!isXNext;
    renderBoard();
    updateStatus();
    if(mode==='vsComputer' && !isXNext && !winner) setTimeout(makeComputerMove,500);
}

function makeComputerMove(){
    const empty=board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    if(empty.length===0) return;
    let move;
    if(difficulty==='easy' && Math.random()<0.7){
        move=empty[Math.floor(Math.random()*empty.length)];
    }else if(difficulty==='medium' && Math.random()<0.4){
        move=empty[Math.floor(Math.random()*empty.length)];
    }else{
        move=findBestMove(empty);
    }
    handleClick(move);
}

function findBestMove(empty){
    for(let idx of empty){
        let t=[...board];t[idx]='O';
        if(checkWinnerForBoard(t)==='O') return idx;
    }
    for(let idx of empty){
        let t=[...board];t[idx]='X';
        if(checkWinnerForBoard(t)==='X') return idx;
    }
    if(board[4]===null) return 4;
    const corners=[0,2,6,8].filter(i=>board[i]===null);
    if(corners.length>0) return corners[Math.floor(Math.random()*corners.length)];
    return empty[Math.floor(Math.random()*empty.length)];
}

function checkWinner(){
    const result=checkWinnerForBoard(board);
    if(result){
        if(result==='draw'){winner={winner:'draw',line:null};scores.draws++;}
        else{
            const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for(let line of lines){
                const [a,b,c]=line;
                if(board[a]&&board[a]===board[b]&&board[a]===board[c]){
                    winner={winner:board[a],line:line};
                    if(result==='X') scores.X++; else scores.O++;
                    break;
                }
            }
        }
        updateScores();
        showWinPopup();
    }
}

function checkWinnerForBoard(s){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let [a,b,c] of lines){if(s[a]&&s[a]===s[b]&&s[a]===s[c]) return s[a];}
    if(s.every(Boolean)) return 'draw';
    return null;
}

function updateStatus(){
    const status=document.getElementById('status');
    if(winner){
        if(winner.winner==='draw') status.textContent="It's a Draw! 🤝";
        else status.textContent=`${winner.winner==='X'?playerXName:playerOName} Wins! 🎉`;
    }else{
        status.textContent=isXNext?`${playerXName} Turn`:`${mode==='vsComputer'?"Computer":playerOName} Turn`;
    }
}

function updateScores(){
    document.getElementById('scoreX').textContent=scores.X;
    document.getElementById('scoreO').textContent=scores.O;
    document.getElementById('scoreDraws').textContent=scores.draws;
}

function resetGame(){
    board=Array(9).fill(null);
    isXNext=true;
    winner=null;
    renderBoard();
    updateStatus();
}

function changeMode(){
    board=Array(9).fill(null);
    isXNext=true;
    winner=null;
    mode=null;
    difficulty=null;
    scores={X:0,O:0,draws:0};
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('modeScreen').classList.remove('hidden');
    updateScores();
}

// WIN POPUP + FIREWORKS
// function showWinPopup(){
//     winSound.play().catch(()=>{});
//     document.getElementById('winMessage').textContent=
//         winner.winner==='draw'?"It's a Draw! 🤝":`${winner.winner==='X'?playerXName:playerOName} Wins! 🎉`;
//     document.getElementById('winPopup').classList.remove('hidden');
//     fireworks();
// }
// Sounds


function showWinPopup() {
    const winPopup = document.getElementById('winPopup');
    const winMessage = document.getElementById('winMessage');

    if (winner.winner === 'draw') {
        winMessage.textContent = "It's a Draw! 🤝";
        drawSound.play().catch(() => {});
    } else {
        winMessage.textContent = `${winner.winner === 'X' ? playerXName : playerOName} Wins! 🎉`;
        winSound.play().catch(() => {});
        fireworksWithSound();
    }

    winPopup.classList.remove('hidden');
}

// Fireworks bursts synced with sound
function fireworksWithSound() {
    const bursts = 25;      // number of fireworks
    const interval = 500;  // ms between bursts

    let count = 0;
    const burstInterval = setInterval(() => {
        fireworks(); // visual fireworks
        fireworksSound.currentTime = 0;
        fireworksSound.play().catch(() => {});

        count++;
        if (count >= bursts) clearInterval(burstInterval);
    }, interval);
}


function closeWin(){
    document.getElementById('winPopup').classList.add('hidden');
    resetGame();
}

function fireworks(){
    for(let i=0;i<25;i++){
        const f=document.createElement('div');
        f.className='firework';
        f.style.background=`hsl(${Math.random()*360},100%,60%)`;
        f.style.left="50%";f.style.top="50%";
        f.style.setProperty('--x',`${(Math.random()-0.5)*400}px`);
        f.style.setProperty('--y',`${(Math.random()-0.5)*400}px`);
        document.body.appendChild(f);
        // setTimeout(()=>f.remove(),1000);
    }
}


/* Disable Right Click */
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

/* Disable DevTools key shortcuts */
document.addEventListener('keydown', function (e) {

    // F12
    if (e.key === "F12") {
        e.preventDefault();
        return false;
    }

    // Ctrl + Shift + I / J / C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
    }

    // Ctrl + U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        return false;
    }

    // Ctrl + S (Save Page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        return false;
    }
});

/* Extra: Detect DevTools open (basic) */
setInterval(() => {
    const threshold = 160;
    if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
    ) {
        document.body.innerHTML = "<h2 style='text-align:center;margin-top:20%;'>⚠ Developer Tools Detected</h2>";
    }

}, 1000);
