const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const livesEl = document.querySelector('#lives');
const messageEl = document.querySelector('#game-message');
const lanes = [76, 150, 224];
let running = false;
let lane = 1;
let score = 0;
let lives = 3;
let items = [];
let frame = 0;
let raf;
let invulnerable = 0;

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#d9effa'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#a9d9f4';
  ctx.beginPath(); ctx.arc(760, 66, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b7dcef';
  for (let i = 0; i < 4; i++) {
    const x = ((i * 270 - frame * 0.4) % 1080 + 1080) % 1080 - 90;
    ctx.beginPath(); ctx.ellipse(x, 283, 170, 72, 0, Math.PI, 0); ctx.fill();
  }
  lanes.forEach((y, i) => {
    ctx.fillStyle = i % 2 ? '#eaf6fc' : '#d2eaf6';
    ctx.fillRect(0, y - 27, canvas.width, 54);
    ctx.strokeStyle = '#8bbad1'; ctx.setLineDash([8, 10]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y + 26); ctx.lineTo(canvas.width, y + 26); ctx.stroke();
  });
  items.forEach(item => {
    ctx.font = item.type === 'track' ? '28px sans-serif' : '30px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(item.type === 'track' ? '🐾' : '🪨', item.x, lanes[item.lane]);
  });
  if (invulnerable && frame % 8 < 4) return;
  const y = lanes[lane];
  // A tiny custom off-road car, drawn from simple shapes for fast loading.
  ctx.fillStyle = '#2162b0'; ctx.strokeStyle = '#192b42'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(105, y - 20, 91, 38, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a9d9f4'; ctx.beginPath(); ctx.roundRect(127, y - 37, 42, 25, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#192b42';
  [125, 177].forEach(x => { ctx.beginPath(); ctx.arc(x, y + 18, 10, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('D', 151, y + 5);
}

function finish(won) {
  running = false;
  cancelAnimationFrame(raf);
  messageEl.textContent = won
    ? 'EXPEDITION COMPLETE! Happy 26th, Diva — certified cool under pressure. 💙'
    : 'Rocky road! Give it another go, explorer.';
  document.querySelector('#start-game').innerHTML = won ? 'PLAY AGAIN <span>↻</span>' : 'TRY AGAIN <span>↻</span>';
  drawScene();
}

function tick() {
  if (!running) return;
  frame++;
  if (invulnerable > 0) invulnerable--;
  if (frame % 48 === 0) items.push({ x: canvas.width + 24, lane: Math.floor(Math.random() * lanes.length), type: Math.random() < .68 ? 'track' : 'rock' });
  items.forEach(item => { item.x -= 5.2; });
  items = items.filter(item => {
    if (item.x < 164 && item.x > 112 && item.lane === lane) {
      if (item.type === 'track') { score++; scoreEl.textContent = score; }
      else if (!invulnerable) { lives--; livesEl.textContent = lives; invulnerable = 38; }
      return false;
    }
    return item.x > -35;
  });
  drawScene();
  if (score >= 5) return finish(true);
  if (lives <= 0) return finish(false);
  raf = requestAnimationFrame(tick);
}

function move(direction) {
  if (running) lane = Math.max(0, Math.min(lanes.length - 1, lane + direction));
  drawScene();
}

document.querySelector('#start-game').addEventListener('click', () => {
  cancelAnimationFrame(raf); running = true; lane = 1; score = 0; lives = 3; frame = 0; invulnerable = 0; items = [];
  scoreEl.textContent = score; livesEl.textContent = lives;
  messageEl.textContent = 'Collect the dino tracks. Dodge the rocks!';
  document.querySelector('#start-game').innerHTML = 'ADVENTURE ON <span>↗</span>';
  tick();
});
document.querySelector('#move-up').addEventListener('click', () => move(-1));
document.querySelector('#move-down').addEventListener('click', () => move(1));
document.addEventListener('keydown', event => {
  if (!running) return;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') { event.preventDefault(); move(-1); }
  if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') { event.preventDefault(); move(1); }
});
drawScene();
