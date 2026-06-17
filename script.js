// ── scroll progress ──
window.addEventListener(
  "scroll",
  () => {
    const p =
      window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight);
    document.getElementById("prog").style.width = p * 100 + "%";
  },
  { passive: true },
);

// ── nav active ──
const secs = [...document.querySelectorAll("section")];
const nas = [...document.querySelectorAll(".nl a")];
window.addEventListener(
  "scroll",
  () => {
    let cur = "";
    secs.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 200) cur = s.id;
    });
    nas.forEach((a) =>
      a.classList.toggle("act", a.getAttribute("href") === "#" + cur),
    );
  },
  { passive: true },
);

// ── boot ──
const asciiArt = `
╔══════════════════════════════╗
║          VOIDOS v1.0         ║
╚══════════════════════════════╝
`;

const lines = [
  [asciiArt, "g"],
  ["[ SYSTEM ONLINE ]", "ok"],
  ["> Initializing kernel...", ""],
  ["> Mounting /dev/void...", ""],
  ["> Welcome to VOIDOS", "g"],
  ['Type "help" to see available commands.', ""],
  ["", ""],
];

const bl = document.getElementById("bl");
let booted = false;
lines.forEach(([txt, cls], i) => {
  setTimeout(() => {
    const d = document.createElement("div");
    d.className = "bl" + (cls ? " " + cls : "");
    if (txt === asciiArt) {
      d.innerHTML =
        '<pre style="font-size:16px; line-height:1.2; text-shadow:var(--glow); margin-bottom:10px;">' +
        txt +
        "</pre>";
    } else {
      d.textContent = txt || "\u00a0";
    }
    bl.appendChild(d);
    requestAnimationFrame(() => d.classList.add("on"));
  }, i * 120);
});

// ── audio system ──
let audioCtx;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClick() {
  if (!audioCtx || audioCtx.state !== "running") return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.02);
  gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.02);
}

function playChime() {
  if (!audioCtx || audioCtx.state !== "running") return;
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(
      0.08,
      audioCtx.currentTime + i * 0.1 + 0.05,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + i * 0.1 + 1.5,
    );
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 1.5);
  });
}

function launch() {
  if (booted) return;
  booted = true;
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  playChime();
  const boot = document.getElementById("boot");
  boot.classList.add("out");
  setTimeout(() => {
    boot.style.display = "none";
    document.getElementById("main").classList.add("on");
    startAll();
    setTimeout(() => {
      document.getElementById("cmd-input")?.focus();
    }, 500);
  }, 600);
}
// Remove auto-launch so user interaction enables audio context
// setTimeout(launch,lines.length*120+800);
document.addEventListener("keydown", launch, { once: true });
document.addEventListener("click", launch, { once: true });

// ── typewriter roles ──
const roles = [
  "Data Science Student",
  "Machine Learning Developer",
  "Problem Solver",
  "Data Analyst",
];
let ri = 0,
  ci = 0,
  del = false;
const tr = document.getElementById("tr");
function type() {
  if (!tr) return;
  const s = roles[ri];
  if (!del) {
    tr.textContent = s.slice(0, ++ci);
    if (ci === s.length) {
      del = true;
      setTimeout(type, 2000);
      return;
    }
  } else {
    tr.textContent = s.slice(0, --ci);
    if (ci === 0) {
      del = false;
      ri = (ri + 1) % roles.length;
    }
  }
  setTimeout(type, del ? 40 : 80);
}

// ── skill bars ──
function animBars() {
  const sSection = document.getElementById("skills");
  if (!sSection) return;
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll(".sbf").forEach((b) => {
          b.style.width = b.dataset.w + "%";
        });
        obs.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  obs.observe(sSection);
}

// ── matrix effect ──
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];
for (let x = 0; x < columns; x++) drops[x] = 1;
let matrixInterval;
let matrixActive = false;

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--g")
    .trim();
  ctx.font = fontSize + "px monospace";
  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
      drops[i] = 0;
    drops[i]++;
  }
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ── interactive terminal ──
const input = document.getElementById("cmd-input");
const output = document.getElementById("term-output");

let cmdHistory = [];
let historyIndex = -1;

const fileSystem = [
  "projects/",
  "experience.md",
  "skills.json",
  "contact.sh",
  "resume.pdf",
];

const commands = {
  help: () => `Available commands:<br>
    <span style="color:var(--g)">Navigation:</span><br>
    &nbsp;&nbsp;<span style="color:var(--bl)">projects</span>   - View featured projects<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">experience</span> - View achievements and GitHub stats<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">skills</span>     - View technical skills<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">contact</span>    - Send me a message<br>
    <span style="color:var(--g)">System:</span><br>
    &nbsp;&nbsp;<span style="color:var(--bl)">whoami</span>     - Display current user info<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">ls</span>         - List directory contents<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">pwd</span>        - Print working directory<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">date</span>       - Display system date and time<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">history</span>    - View command history<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">clear</span>      - Clear terminal output<br>
    <span style="color:var(--g)">Tools & Fun:</span><br>
    &nbsp;&nbsp;<span style="color:var(--bl)">graph</span>      - Plot ML training curve<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">ping</span>       - Ping the server<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">weather</span>    - Check local weather<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">calc</span>       - Mathematical calculator<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">neofetch</span>   - Display system info<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">scan</span>       - Run security scan<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">coin</span>       - Flip a coin<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">dice</span>       - Roll a dice<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">quote</span>      - Get a random programming quote<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">uuid</span>       - Generate a random UUID<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">base64</span>     - Encode/decode base64 strings<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">rps</span>        - Play Rock Paper Scissors<br>
    <span style="color:var(--g)">Special:</span><br>
    &nbsp;&nbsp;<span style="color:var(--bl)">theme</span>      - Change UI theme (args: hacker, cyber, dracula, light)<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">matrix</span>     - Toggle matrix background effect<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">resume</span>     - Download my resume<br>
    &nbsp;&nbsp;<span style="color:var(--bl)">sudo</span>       - Execute a command as superuser`,
  about: () => {
    scrollToSection("experience");
    return `Scrolling to Experience & About...`;
  },
  experience: () => {
    scrollToSection("experience");
    return `Scrolling to Experience & About...`;
  },
  projects: () => {
    scrollToSection("projects");
    return `Scrolling to Projects...`;
  },
  skills: () => {
    scrollToSection("skills");
    return `Scrolling to Skills...`;
  },
  contact: () => {
    scrollToSection("contact");
    return `Scrolling to Contact...`;
  },
  resume: () => {
    setTimeout(() => {
      document.getElementById("resume-download").click();
    }, 800);
    return `Downloading resume...<br><span style="color:var(--gd)">[OK] resume.pdf saved to downloads.</span>`;
  },
  clear: () => {
    setTimeout(() => {
      output.innerHTML = "";
    }, 50);
    return "";
  },
  whoami: () => {
    return `User: dhruv<br>Role: Data Science Student<br>Location: Dehradun, India<br>Status: Discovering patterns in data.`;
  },
  ping: () =>
    `Pinging portfolio.local [127.0.0.1] with 32 bytes of data:<br>Reply from 127.0.0.1: bytes=32 time=12ms TTL=64<br>Reply from 127.0.0.1: bytes=32 time=14ms TTL=64<br>Reply from 127.0.0.1: bytes=32 time=11ms TTL=64<br><br>Ping statistics for 127.0.0.1:<br>&nbsp;&nbsp;&nbsp;&nbsp;Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`,
  graph: () => {
    return `Model Training Curve (Loss vs Epochs):<br>
<pre style="color:var(--g); font-size:12px; line-height:1.2; text-shadow:var(--glow);">
1.0 ┤ <span style="color:var(--rd)">*</span>
    │   <span style="color:var(--rd)">*</span>
0.8 ┤     <span style="color:var(--rd)">*</span>
    │       <span style="color:var(--rd)">*</span>  <span style="color:var(--rd)">*</span>
0.6 ┤            <span style="color:var(--rd)">*</span>
    │                <span style="color:var(--rd)">*</span>
0.4 ┤                    <span style="color:var(--rd)">*</span>   <span style="color:var(--rd)">*</span>
    │                            <span style="color:var(--rd)">*</span>
0.2 ┤                                <span style="color:var(--rd)">*</span>    <span style="color:var(--rd)">*</span>
    │                                          <span style="color:var(--rd)">*</span>    <span style="color:var(--rd)">*</span>
0.0 ┼───┴────┴────┴────┴────┴────┴────┴────┴────┴────┴──
    0        10        20        30        40        50
</pre>
<span style="color:var(--txb)">> Final Loss: 0.051</span><br>
<span style="color:var(--g)">> Status: Converged successfully</span>`;
  },
  weather: () =>
    `Weather in Dehradun: ☀️ 24°C, Sunny. Perfect weather to write some code.`,
  calc: (args) => {
    if (!args || args.length === 0)
      return `Usage: calc [expression]<br>Example: calc 5+5`;
    try {
      // Only allow basic math characters for security
      const exp = args.join("").replace(/[^0-9+\-*/().]/g, "");
      return `Result: ${eval(exp)}`;
    } catch (e) {
      return `Error in expression`;
    }
  },
  scan: () =>
    `Initiating vulnerability scan...<br>Scanning ports... [OK]<br>Checking dependencies... [OK]<br>Analyzing XSS vectors... [OK]<br><span style="color:var(--g)">Result: System is secure. 0 vulnerabilities found.</span>`,
  coin: () =>
    `Flipping a coin... <span style="color:var(--g)">${Math.random() < 0.5 ? "Heads" : "Tails"}</span>`,
  dice: () =>
    `Rolling a dice... <span style="color:var(--g)">${Math.floor(Math.random() * 6) + 1}</span>`,
  quote: () => {
    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Talk is cheap. Show me the code. - Linus Torvalds",
      "Programs must be written for people to read, and only incidentally for machines to execute. - Harold Abelson",
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
    ];
    return `<i>"${quotes[Math.floor(Math.random() * quotes.length)]}"</i>`;
  },
  uuid: () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  },
  base64: (args) => {
    if (!args || args.length < 2) return `Usage: base64 [encode/decode] [text]`;
    const action = args[0].toLowerCase();
    const text = args.slice(1).join(" ");
    try {
      if (action === "encode") return btoa(text);
      if (action === "decode") return atob(text);
      return `Invalid action. Use 'encode' or 'decode'.`;
    } catch (e) {
      return `Error: Invalid input for base64 ${action}.`;
    }
  },
  rps: (args) => {
    if (!args || args.length === 0) return `Usage: rps [rock/paper/scissors]`;
    const userChoice = args[0].toLowerCase();
    if (!["rock", "paper", "scissors"].includes(userChoice))
      return `Invalid choice. Use rock, paper, or scissors.`;
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = "";
    if (userChoice === botChoice) result = "It's a tie!";
    else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    )
      result = '<span style="color:var(--g)">You win!</span>';
    else result = '<span style="color:var(--rd)">You lose!</span>';
    return `You chose: ${userChoice}<br>Bot chose: ${botChoice}<br>${result}`;
  },
  neofetch: () => {
    return `<div style="display:flex;gap:20px;">
      <div style="color:var(--g);font-weight:bold;">
        &nbsp;&nbsp;&nbsp;___<br>
        &nbsp;&nbsp;/ _ \\<br>
        &nbsp;| | | |<br>
        &nbsp;| |_| |<br>
        &nbsp;&nbsp;\\___/<br>
      </div>
      <div>
        <span style="color:var(--g);font-weight:bold;">dhruv</span>@<span style="color:var(--g);font-weight:bold;">portfolio</span><br>
        -----------------<br>
        <span style="color:var(--bl);font-weight:bold;">OS</span>: VOIDOS v1.0<br>
        <span style="color:var(--bl);font-weight:bold;">Host</span>: Web Browser<br>
        <span style="color:var(--bl);font-weight:bold;">Kernel</span>: Data Science<br>
        <span style="color:var(--bl);font-weight:bold;">Uptime</span>: 99.99%<br>
        <span style="color:var(--bl);font-weight:bold;">Shell</span>: zsh<br>
      </div>
    </div>`;
  },
  ls: () => {
    return fileSystem
      .map((f) =>
        f.endsWith("/")
          ? `<span style="color:var(--bl); font-weight:bold;">${f}</span>`
          : f,
      )
      .join("&nbsp;&nbsp;&nbsp;&nbsp;");
  },
  pwd: () => `/home/dhruv/portfolio`,
  date: () => new Date().toString(),
  history: () => {
    return cmdHistory
      .map((cmd, i) => `&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;${cmd}`)
      .join("<br>");
  },
  sudo: () => {
    return `<span style="color:var(--rd)">dhruv is not in the sudoers file. This incident will be reported.</span>`;
  },
  matrix: () => {
    if (matrixActive) {
      clearInterval(matrixInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      matrixActive = false;
      return `Matrix effect disabled.`;
    } else {
      matrixInterval = setInterval(drawMatrix, 50);
      matrixActive = true;
      return `Matrix effect enabled. Follow the white rabbit...`;
    }
  },
  theme: (args) => {
    if (!args || args.length === 0)
      return `Usage: theme [name]<br>Available themes: hacker, cyber, dracula, light`;
    const t = args[0].toLowerCase();
    const root = document.documentElement;
    if (t === "hacker") {
      root.style.setProperty("--g", "#00FF41");
      root.style.setProperty("--gd", "#00AA2A");
      root.style.setProperty("--bg", "#030303");
      root.style.setProperty("--txb", "#f4f4f5");
      return `Theme set to: Hacker (Default)`;
    } else if (t === "cyber") {
      root.style.setProperty("--g", "#FF00FF");
      root.style.setProperty("--gd", "#00FFFF");
      root.style.setProperty("--bg", "#050014");
      root.style.setProperty("--txb", "#FFFFFF");
      return `Theme set to: Cyberpunk Neon`;
    } else if (t === "dracula") {
      root.style.setProperty("--g", "#ff5555");
      root.style.setProperty("--gd", "#ff0000");
      root.style.setProperty("--bg", "#282a36");
      root.style.setProperty("--txb", "#f8f8f2");
      return `Theme set to: Dracula`;
    } else if (t === "light") {
      return `Flashbang deployed. Just kidding, dark mode only.`;
    } else {
      return `Theme '${t}' not found.`;
    }
  },
};

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

window.runCmd = function (cmd) {
  if (!input) return;
  input.value = cmd;
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
};

// Typing effect for output
function typeOutput(element, text, speed = 10) {
  element.innerHTML = "";
  element.style.opacity = "0";
  element.innerHTML = text;
  let o = 0;
  let ticks = 0;
  const fade = setInterval(() => {
    o += 0.2;
    ticks++;
    element.style.opacity = o.toString();
    if (ticks % 2 === 0) playClick(); // play click sound as it fades in
    if (o >= 1) clearInterval(fade);
  }, 40);
}

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}

if (input && output) {
  // Play click sound when user types
  input.addEventListener("input", () => {
    initAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    playClick();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value.trim();
      if (!val) return;

      cmdHistory.push(val);
      historyIndex = cmdHistory.length;
      input.value = "";

      const args = val.split(" ").filter(Boolean);
      const cmdName = args[0].toLowerCase();
      const cmdArgs = args.slice(1);

      const safeVal = escapeHTML(val);

      const cmdLine = document.createElement("div");
      cmdLine.innerHTML = `<span style="color:var(--g);font-weight:bold;">dhruv@portfolio</span><span style="color:var(--g);">:</span><span style="color:var(--bl);">~</span><span style="color:var(--g);">$</span> ${safeVal}`;
      output.appendChild(cmdLine);

      const resLine = document.createElement("div");
      resLine.style.color = "var(--txb)";
      resLine.style.marginBottom = "16px";

      let resText = "";
      if (commands[cmdName]) {
        resText = commands[cmdName](cmdArgs);
      } else if (cmdName === "echo") {
        resText = escapeHTML(cmdArgs.join(" "));
      } else {
        resText = `zsh: command not found: ${escapeHTML(cmdName)}<br>Type <span style="color:var(--g)">help</span> to see available commands.`;
      }

      output.appendChild(resLine);
      if (resText !== "") {
        typeOutput(resLine, resText);
      }

      // Auto scroll terminal output
      setTimeout(() => {
        output.scrollTop = output.scrollHeight;
      }, 100);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = cmdHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        input.value = cmdHistory[historyIndex];
      } else {
        historyIndex = cmdHistory.length;
        input.value = "";
      }
    }
  });
}

// ── contact send ──
function doSend() {
  const b = document.getElementById("sbtn");
  if (!b) return;
  b.innerHTML = "✓ message_sent.log";
  b.style.background = "var(--g)";
  b.style.color = "#000";
  b.style.borderColor = "var(--g)";
  b.style.boxShadow = "0 0 12px var(--g)";
  setTimeout(() => {
    b.innerHTML = "./send_message";
    b.style.background = "";
    b.style.color = "";
    b.style.borderColor = "";
    b.style.boxShadow = "";
  }, 2500);
}

function startAll() {
  type();
  animBars();
}
