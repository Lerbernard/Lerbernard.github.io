/* Lee Bernard · personal site · small vanilla JS helpers */
(function () {
  "use strict";

  /* ---------- Theme toggle (remembers choice, follows system otherwise) ---------- */
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const stored = safeGet("theme");
  if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    safeSet("theme", next);
  });

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode, ignore */ } }

  /* ---------- Cursor glow ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* ---------- Rotating hero word ---------- */
  /* kept short so the line never wraps, even on a phone */
  const words = ["web apps.", "AI assistants.", "games.", "chess robots.", "clean code.", "useful things."];
  const rotator = document.getElementById("rotator");
  let wi = 0;
  if (!reduceMotion) {
    setInterval(() => {
      const current = rotator.querySelector("span:not(.out)");
      if (current) { current.classList.add("out"); setTimeout(() => current.remove(), 350); }
      wi = (wi + 1) % words.length;
      const next = document.createElement("span");
      next.textContent = words[wi];
      rotator.appendChild(next);
    }, 2600);
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Live repo count (fails quietly, keeps the static number) ---------- */
  fetch("https://api.github.com/users/Lerbernard")
    .then((r) => (r.ok ? r.json() : null))
    .then((u) => { if (u && u.public_repos) document.getElementById("statRepos").textContent = u.public_repos; })
    .catch(() => {});

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Tic-Tac-Toe vs minimax ---------- */
  const HUMAN = "X", AI = "O";
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const cells = Array.from(document.querySelectorAll(".cell"));
  const status = document.getElementById("gameStatus");
  const score = { you: 0, draw: 0, ai: 0 };
  let board, over, level = "easy", busy = false;

  document.querySelectorAll(".seg-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      level = b.dataset.level;
      reset();
    });
  });
  document.getElementById("resetGame").addEventListener("click", reset);
  cells.forEach((c) => c.addEventListener("click", () => play(+c.dataset.i)));

  function reset() {
    board = Array(9).fill(null);
    over = false; busy = false;
    cells.forEach((c) => { c.textContent = ""; c.className = "cell"; c.disabled = false; });
    say(`You're <b class="x">X</b>. Your move.`);
  }

  function play(i) {
    if (over || busy || board[i]) return;
    mark(i, HUMAN);
    if (finish()) return;
    busy = true;
    say("Thinking…");
    setTimeout(() => {
      const move = level === "hard" ? bestMove() : easyMove();
      mark(move, AI);
      busy = false;
      if (!finish()) say(`Your move.`);
    }, 380);
  }

  function mark(i, who) {
    board[i] = who;
    const c = cells[i];
    c.textContent = who;
    c.classList.add(who.toLowerCase(), "pop");
    c.disabled = true;
  }

  function winner(b) {
    for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
    return b.every(Boolean) ? { who: "draw" } : null;
  }

  function finish() {
    const w = winner(board);
    if (!w) return false;
    over = true;
    cells.forEach((c) => (c.disabled = true));
    if (w.who === "draw") { score.draw++; say("Draw. Classic tic-tac-toe."); }
    else if (w.who === HUMAN) { score.you++; w.line.forEach((i) => cells[i].classList.add("win")); say(level === "hard" ? "Wait, what? You beat hard mode. Screenshot that." : "You win! Try hard mode if you're feeling brave."); }
    else { score.ai++; w.line.forEach((i) => cells[i].classList.add("win")); say("The AI wins this one. New game?"); }
    document.getElementById("scoreYou").textContent = score.you;
    document.getElementById("scoreDraw").textContent = score.draw;
    document.getElementById("scoreAi").textContent = score.ai;
    return true;
  }

  function say(html) { status.innerHTML = html; }

  function empties(b) { return b.map((v, i) => (v ? null : i)).filter((v) => v !== null); }

  /* easy: blocks or wins when obvious 60% of the time, otherwise random */
  function easyMove() {
    const e = empties(board);
    if (Math.random() < 0.6) {
      for (const who of [AI, HUMAN]) {
        for (const i of e) { const b = board.slice(); b[i] = who; const w = winner(b); if (w && w.who === who) return i; }
      }
    }
    return e[Math.floor(Math.random() * e.length)];
  }

  /* hard: full minimax, never loses */
  function bestMove() {
    let best = -Infinity, move = empties(board)[0];
    for (const i of empties(board)) {
      board[i] = AI;
      const s = minimax(board, 0, false);
      board[i] = null;
      if (s > best) { best = s; move = i; }
    }
    return move;
  }

  function minimax(b, depth, maximizing) {
    const w = winner(b);
    if (w) return w.who === AI ? 10 - depth : w.who === HUMAN ? depth - 10 : 0;
    let best = maximizing ? -Infinity : Infinity;
    for (const i of empties(b)) {
      b[i] = maximizing ? AI : HUMAN;
      const s = minimax(b, depth + 1, !maximizing);
      b[i] = null;
      best = maximizing ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  }

  reset();
})();
