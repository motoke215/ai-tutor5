import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — warm playful world palette
// ═══════════════════════════════════════════════════════════════════════════
const C = {
  sky: "#FFF8E7",
  cloud: "#FFFDF5",
  sun: "#FFD93D",
  sunDim: "#FFC107",
  coral: "#FF6B6B",
  coralDim: "#E55555",
  mint: "#6BCB77",
  mintDim: "#4CAF57",
  blue: "#4D96FF",
  blueDim: "#2979FF",
  lavender: "#C77DFF",
  peach: "#FFB347",
  text: "#3D2C1E",
  textMid: "#7A5C44",
  textLight: "#B09070",
  white: "#FFFFFF",
  cardBg: "#FFFDF5",
  shadow: "rgba(61,44,30,0.10)",
  shadowDeep: "rgba(61,44,30,0.18)",
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════════════════════
const SUBJECTS = [
  { id: "math",    label: "数学王国",    emoji: "🔢", color: C.coral,    bg: "#FFF0F0", desc: "加减乘除 趣味挑战", grade: "小学" },
  { id: "chinese", label: "汉字乐园",    emoji: "📖", color: C.blue,     bg: "#F0F5FF", desc: "认字写字 故事天地", grade: "小学" },
  { id: "english", label: "英语冒险",    emoji: "🌍", color: C.mint,     bg: "#F0FFF4", desc: "字母单词 趣味对话", grade: "小学" },
  { id: "science", label: "科学实验室",  emoji: "🔬", color: C.lavender, bg: "#F8F0FF", desc: "探索自然 发现秘密", grade: "小学" },
  { id: "story",   label: "故事时间",    emoji: "📚", color: C.peach,    bg: "#FFF5E6", desc: "阅读理解 想象世界", grade: "小学" },
  { id: "art",     label: "创意美术",    emoji: "🎨", color: C.sunDim,   bg: "#FFFDE7", desc: "颜色形状 创意表达", grade: "小学" },
];

// ═══════════════════════════════════════════════════════════════════════════
// MASTERY STAR SYSTEM (kids version: 0-5 stars)
// ═══════════════════════════════════════════════════════════════════════════
const starsFromMastery = (m) => Math.min(5, Math.round(m / 20));

// ═══════════════════════════════════════════════════════════════════════════
// MASCOT MOODS & SVG
// ═══════════════════════════════════════════════════════════════════════════
const MOODS = {
  idle:       { eyes: "normal", mouth: "smile",   brows: "relaxed", color: "#FFB347" },
  thinking:   { eyes: "squint", mouth: "hmm",     brows: "raised",  color: "#4D96FF" },
  happy:      { eyes: "happy",  mouth: "bigsmile", brows: "happy",  color: "#6BCB77" },
  celebrate:  { eyes: "star",   mouth: "wow",     brows: "up",      color: "#FFD93D" },
  encourage:  { eyes: "kind",   mouth: "smile",   brows: "kind",    color: "#C77DFF" },
  speaking:   { eyes: "normal", mouth: "talk",    brows: "relaxed", color: "#FF6B6B" },
};

function FoxMascot({ mood = "idle", size = 120, bounce = false, talking = false }) {
  const m = MOODS[mood] || MOODS.idle;
  const talkPhase = useRef(0);
  const [talkOpen, setTalkOpen] = useState(false);

  useEffect(() => {
    if (!talking) { setTalkOpen(false); return; }
    const t = setInterval(() => { setTalkOpen(p => !p); }, 160);
    return () => clearInterval(t);
  }, [talking]);

  const mouthOpen = talking ? talkOpen : false;

  // Eye shapes
  const Eyes = () => {
    if (m.eyes === "happy") return (<>
      <path d="M52 62 Q58 56 64 62" stroke={C.text} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M76 62 Q82 56 88 62" stroke={C.text} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </>);
    if (m.eyes === "star") return (<>
      <text x="52" y="70" fontSize="16" textAnchor="middle">⭐</text>
      <text x="88" y="70" fontSize="16" textAnchor="middle">⭐</text>
    </>);
    if (m.eyes === "squint") return (<>
      <ellipse cx="58" cy="65" rx="8" ry="5" fill={C.text}/>
      <ellipse cx="82" cy="65" rx="8" ry="5" fill={C.text}/>
    </>);
    if (m.eyes === "kind") return (<>
      <ellipse cx="58" cy="65" rx="8" ry="9" fill={C.text}/>
      <ellipse cx="82" cy="65" rx="8" ry="9" fill={C.text}/>
      <ellipse cx="60" cy="63" rx="3" ry="3" fill="white" opacity="0.6"/>
      <ellipse cx="84" cy="63" rx="3" ry="3" fill="white" opacity="0.6"/>
    </>);
    // normal
    return (<>
      <ellipse cx="58" cy="65" rx="9" ry="10" fill={C.text}/>
      <ellipse cx="82" cy="65" rx="9" ry="10" fill={C.text}/>
      <ellipse cx="61" cy="62" rx="3.5" ry="3.5" fill="white" opacity="0.7"/>
      <ellipse cx="85" cy="62" rx="3.5" ry="3.5" fill="white" opacity="0.7"/>
    </>);
  };

  // Mouth shapes
  const Mouth = () => {
    if (mouthOpen || m.mouth === "talk") return (
      <ellipse cx="70" cy="86" rx="12" ry="8" fill={C.coralDim}/>
    );
    if (m.mouth === "bigsmile") return (
      <path d="M52 82 Q70 100 88 82" stroke={C.coralDim} strokeWidth="4" strokeLinecap="round" fill="none"/>
    );
    if (m.mouth === "wow") return (
      <ellipse cx="70" cy="86" rx="14" ry="12" fill={C.coralDim}/>
    );
    if (m.mouth === "hmm") return (
      <path d="M58 85 Q70 82 82 85" stroke={C.text} strokeWidth="3" strokeLinecap="round" fill="none"/>
    );
    return (
      <path d="M56 83 Q70 95 84 83" stroke={C.coralDim} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    );
  };

  // Brow shapes
  const Brows = () => {
    if (m.brows === "raised") return (<>
      <path d="M46 48 Q58 40 66 48" stroke={C.text} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M74 48 Q82 40 94 48" stroke={C.text} strokeWidth="3" strokeLinecap="round" fill="none"/>
    </>);
    if (m.brows === "happy") return (<>
      <path d="M46 50 Q58 44 66 50" stroke={C.text} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M74 50 Q82 44 94 50" stroke={C.text} strokeWidth="3" strokeLinecap="round" fill="none"/>
    </>);
    if (m.brows === "kind") return (<>
      <path d="M46 52 Q58 47 66 52" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M74 52 Q82 47 94 52" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </>);
    if (m.brows === "up") return (<>
      <path d="M44 44 Q58 36 68 44" stroke={C.text} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M72 44 Q82 36 96 44" stroke={C.text} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </>);
    return null;
  };

  const scale = size / 140;
  return (
    <div style={{
      width: size, height: size * 1.1,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: bounce ? "mascotBounce 0.6s ease infinite alternate" : "mascotFloat 3s ease-in-out infinite",
    }}>
      <svg viewBox="0 0 140 154" width={size} height={size * 1.1}>
        {/* Tail */}
        <ellipse cx="105" cy="130" rx="22" ry="14" fill={m.color} transform="rotate(-25 105 130)" opacity="0.9"/>
        <ellipse cx="105" cy="130" rx="14" ry="8" fill="white" transform="rotate(-25 105 130)" opacity="0.7"/>
        {/* Body */}
        <ellipse cx="70" cy="118" rx="36" ry="28" fill={m.color}/>
        <ellipse cx="70" cy="118" rx="22" ry="18" fill="white" opacity="0.8"/>
        {/* Left Ear */}
        <polygon points="28,50 18,10 48,38" fill={m.color}/>
        <polygon points="30,46 22,18 44,38" fill={C.coral} opacity="0.6"/>
        {/* Right Ear */}
        <polygon points="112,50 122,10 92,38" fill={m.color}/>
        <polygon points="110,46 118,18 96,38" fill={C.coral} opacity="0.6"/>
        {/* Head */}
        <ellipse cx="70" cy="68" rx="44" ry="40" fill={m.color}/>
        {/* Cheeks */}
        <ellipse cx="40" cy="78" rx="12" ry="8" fill={C.coral} opacity="0.35"/>
        <ellipse cx="100" cy="78" rx="12" ry="8" fill={C.coral} opacity="0.35"/>
        {/* Face white patch */}
        <ellipse cx="70" cy="73" rx="28" ry="25" fill="white" opacity="0.75"/>
        {/* Brows */}
        <Brows />
        {/* Eyes */}
        <Eyes />
        {/* Nose */}
        <ellipse cx="70" cy="78" rx="5" ry="3.5" fill={C.coralDim}/>
        {/* Mouth */}
        <Mouth />
        {/* Paws */}
        <ellipse cx="44" cy="144" rx="16" ry="10" fill={m.color}/>
        <ellipse cx="96" cy="144" rx="16" ry="10" fill={m.color}/>
        {/* Mood glow */}
        <ellipse cx="70" cy="68" rx="44" ry="40" fill={m.color} opacity="0.08"/>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI BURST
// ═══════════════════════════════════════════════════════════════════════════
function Confetti({ active }) {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: [C.coral, C.sun, C.mint, C.blue, C.lavender, C.peach][i % 6],
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.4,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    shape: i % 3,
  }));
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: "-10%",
          width: p.size, height: p.shape === 2 ? p.size : p.size * 0.5,
          background: p.color, borderRadius: p.shape === 0 ? "50%" : p.shape === 1 ? "2px" : "50% 0",
          transform: `rotate(${p.rotate}deg)`,
          animation: `confettiFall 1.8s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STARS DISPLAY
// ═══════════════════════════════════════════════════════════════════════════
function StarsRow({ stars, max = 5 }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: 22, filter: i < stars ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.4s", animation: i < stars ? "starPop 0.4s ease" : "none" }}>⭐</span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING BUBBLES BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════
function FloatingBubbles() {
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i, size: 20 + (i * 13) % 40,
    x: (i * 31) % 90, delay: (i * 0.7) % 4,
    color: [C.sun + "44", C.coral + "33", C.mint + "33", C.blue + "33", C.lavender + "44"][i % 5],
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {bubbles.map(b => (
        <div key={b.id} style={{
          position: "absolute", bottom: "-60px", left: `${b.x}%`,
          width: b.size, height: b.size, borderRadius: "50%",
          background: b.color, animation: `bubbleRise ${8 + b.delay * 2}s ${b.delay}s ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE HOLD BUTTON
// ═══════════════════════════════════════════════════════════════════════════
function VoiceHoldButton({ onStart, onStop, disabled, color }) {
  const [pressing, setPressing] = useState(false);
  const [vol, setVol] = useState(0);

  // Volume visualizer mock
  useEffect(() => {
    if (!pressing) { setVol(0); return; }
    const t = setInterval(() => setVol(Math.random() * 100), 100);
    return () => clearInterval(t);
  }, [pressing]);

  const start = (e) => { e.preventDefault(); if (disabled) return; setPressing(true); onStart(); };
  const stop = (e) => { e.preventDefault(); if (!pressing) return; setPressing(false); onStop(); };

  const bars = Array.from({ length: 9 }, (_, i) => {
    const h = pressing ? Math.max(6, (vol / 100) * 36 * (0.4 + Math.sin(i * 1.1) * 0.6)) : 6;
    return <div key={i} style={{ width: 5, height: h, background: pressing ? color : C.textLight, borderRadius: 3, transition: "height 0.08s" }} />;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Volume bars */}
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40, opacity: pressing ? 1 : 0.3, transition: "opacity 0.3s" }}>
        {bars}
      </div>
      {/* Big hold button */}
      <div
        onTouchStart={start} onTouchEnd={stop} onTouchCancel={stop}
        onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
        style={{
          width: 100, height: 100, borderRadius: "50%",
          background: pressing ? `radial-gradient(circle, ${color}, ${color}CC)` : `radial-gradient(circle, ${color}44, ${color}22)`,
          border: `4px solid ${pressing ? color : color + "66"}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", userSelect: "none", WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
          transition: "all 0.15s", transform: pressing ? "scale(1.08)" : "scale(1)",
          boxShadow: pressing ? `0 0 32px ${color}88` : `0 4px 16px ${color}44`,
        }}>
        <div style={{ fontSize: 36 }}>{pressing ? "🔴" : "🎙"}</div>
        <div style={{ fontSize: 11, color: pressing ? color : C.textMid, fontWeight: 700, marginTop: 2 }}>
          {pressing ? "松手发送" : "按住说话"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════
function buildChildPrompt(subject, age, mascotName) {
  const subjectMap = {
    math: "小学数学，包括数字、加减法、乘除法等",
    chinese: "小学语文，包括认字、词语、简单阅读",
    english: "小学英语，包括字母、单词、简单对话",
    science: "小学科学，包括自然现象、动植物、简单实验",
    story: "故事阅读与理解，想象力和语言表达",
    art: "美术基础，颜色、形状、创意表达",
  };
  return `你是一个超级友好的AI学习伙伴，名字叫${mascotName}，是一只聪明活泼的小狐狸！你正在帮助一个${age}岁的小朋友学习${subjectMap[subject] || subject}。

【儿童教学原则】
1. 语言要超级简单，像跟小朋友说话一样，多用"你"、"我们"、"一起"
2. 每次提问后要等小朋友回答，不要直接告诉答案
3. 答对了：大声夸奖！"哇！太棒了！""你真的好厉害！"
4. 答错了：温柔鼓励："没关系！我们再试一次！""有一点点不对哦，你再想想～"
5. 用表情符号让对话更有趣：😊🌟🎉✨💫
6. 每次回复不超过80个字，短小有趣
7. 用"苏格拉底提问法"——先问问题，引导小朋友自己想出答案
8. 偶尔出小谜题或小游戏

【掌握程度打分】
- 完全正确、自己想出来：+20
- 答对了但需要提示：+10  
- 部分对：+5
- 答错了：-5
- 完全不知道：-10

【严格只回复JSON，不输出其他任何内容】:
{
  "message": "对小朋友说的话（简单有趣，加表情符号）",
  "masteryDelta": 数字,
  "currentMastery": 0-100的数字,
  "mood": "idle或thinking或happy或celebrate或encourage或speaking之一",
  "suggestedReplies": ["选项1","选项2","选项3"],
  "praise": "如果做对了，写一句特别夸奖的话，否则写空字符串",
  "hint": "给小朋友的小提示（可以为空字符串）"
}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
const MASCOT_NAME = "小火";
const AGES = ["5-6岁", "7-8岁", "9-10岁", "11-12岁"];

export default function App() {
  const [phase, setPhase] = useState("home"); // home | subject | chat
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [age, setAge] = useState("7-8岁");
  const [mastery, setMastery] = useState(0);
  const [mood, setMood] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [talking, setTalking] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [sessionPraise, setSessionPraise] = useState("");
  const [inputMode, setInputMode] = useState("text"); // text | voice
  const [isListening, setIsListening] = useState(false);
  const [partialText, setPartialText] = useState("");

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const systemRef = useRef("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if ("speechSynthesis" in window) synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // ── Parse AI response ──────────────────────────────────────────────────
  const parseResp = (text) => {
    try {
      const clean = text.replace(/```json\n?|\n?```/g, "").trim();
      const f = clean.indexOf("{"), l = clean.lastIndexOf("}");
      return JSON.parse(clean.slice(f, l + 1));
    } catch {
      return { message: text, masteryDelta: 0, currentMastery: mastery, mood: "idle", suggestedReplies: [], praise: "", hint: "" };
    }
  };

  // ── Speak (web, fallback) ──────────────────────────────────────────────
  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN"; u.rate = 0.88; u.pitch = 1.15;
    u.onstart = () => setTalking(true);
    u.onend = () => setTalking(false);
    u.onerror = () => setTalking(false);
    synthRef.current.speak(u);
  };

  // ── Call AI ────────────────────────────────────────────────────────────
  const callAI = useCallback(async (userMsg, history) => {
    setLoading(true);
    setMood("thinking");
    try {
      const msgs = [...history, { role: "user", content: userMsg }];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemRef.current,
          messages: msgs,
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      const parsed = parseResp(raw);
      const newMastery = Math.max(0, Math.min(100, parsed.currentMastery ?? (mastery + (parsed.masteryDelta || 0))));

      setApiHistory([...msgs, { role: "assistant", content: raw }]);
      setMessages(prev => [...prev, {
        role: "ai",
        content: parsed.message || "",
        mood: parsed.mood || "idle",
        suggestedReplies: parsed.suggestedReplies || [],
        praise: parsed.praise || "",
        hint: parsed.hint || "",
      }]);

      setMood(parsed.mood || "idle");
      setMastery(newMastery);

      // Celebrate on progress
      if (parsed.praise) {
        setSessionPraise(parsed.praise);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2200);
        setTotalStars(prev => prev + 1);
      }
      if (parsed.message) speak(parsed.message);
    } catch {
      setMood("encourage");
      setMessages(prev => [...prev, { role: "ai", content: "哎呀，出了一点小问题 😅 我们再试一次吧！", mood: "encourage", suggestedReplies: ["好的！", "重试"], praise: "", hint: "" }]);
    } finally {
      setLoading(false);
    }
  }, [mastery]);

  const handleStart = async (subj) => {
    setSelectedSubject(subj);
    systemRef.current = buildChildPrompt(subj.id, age.replace("岁", ""), MASCOT_NAME);
    setPhase("chat");
    setMastery(0); setMessages([]); setApiHistory([]);
    await callAI(`你好，小朋友想学${subj.label}，请开始吧！`, []);
  };

  const sendMsg = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(""); setPartialText("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    await callAI(msg, apiHistory);
  };

  // ── Voice input ────────────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setPartialText(t);
      setInput(t);
    };
    rec.onend = () => { setIsListening(false); };
    rec.onerror = () => { setIsListening(false); };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const onVoiceStart = () => { synthRef.current?.cancel(); startListening(); };
  const onVoiceStop = () => {
    stopListening();
    setTimeout(() => { if (input.trim()) sendMsg(input); }, 300);
  };

  const stars = starsFromMastery(mastery);
  const subj = selectedSubject;

  // ════════════════════════════════════════════════════════════════════════
  // HOME SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (phase === "home") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #FFF8E7 0%, #FFF0F5 50%, #F0F5FF 100%)`, fontFamily: "'Georgia', serif", overflowY: "auto", position: "relative" }}>
      <style>{`
        @keyframes mascotFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes mascotBounce { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-16px) scale(1.04)} }
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes bubbleRise { 0%{transform:translateY(0);opacity:0.7} 100%{transform:translateY(-110vh);opacity:0} }
        @keyframes starPop { 0%{transform:scale(0)} 60%{transform:scale(1.4)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wiggle { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { display:none; }
        button { outline:none; -webkit-tap-highlight-color:transparent; }
      `}</style>
      <FloatingBubbles />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.coral }}>
          🌟 学习乐园
        </div>
        <div style={{ background: C.sun, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", gap: 6, alignItems: "center", boxShadow: `0 3px 10px ${C.sun}88` }}>
          ⭐ {totalStars} 颗星
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 18px 40px", position: "relative", zIndex: 1 }}>
        {/* Mascot hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 24px", animation: "fadeIn 0.5s ease" }}>
          <FoxMascot mood="happy" size={130} />
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, textAlign: "center", marginTop: 8 }}>
            你好，小探险家！🎉
          </div>
          <div style={{ fontSize: 15, color: C.textMid, textAlign: "center", marginTop: 6, lineHeight: 1.6 }}>
            我是<span style={{ color: C.coral, fontWeight: 700 }}>小火</span>，你的学习小伙伴<br />选一个学习乐园，我们出发吧！
          </div>
        </div>

        {/* Age selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.textLight, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>我是...</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {AGES.map(a => (
              <button key={a} onClick={() => setAge(a)}
                style={{ background: age === a ? C.coral : "white", border: `2.5px solid ${age === a ? C.coral : "#E8D8C8"}`, borderRadius: 20, padding: "7px 12px", color: age === a ? "white" : C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: age === a ? `0 3px 10px ${C.coral}55` : "none" }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Subject grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {SUBJECTS.map((s, i) => (
            <button key={s.id} onClick={() => handleStart(s)}
              style={{ background: s.bg, border: `2.5px solid ${s.color}44`, borderRadius: 20, padding: "18px 14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: `0 4px 14px ${s.color}22`, animation: `fadeIn 0.4s ${i * 0.07}s ease both` }}>
              <div style={{ fontSize: 36, marginBottom: 6, animation: "mascotFloat 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>{s.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ marginTop: 8, display: "inline-block", background: s.color, color: "white", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{s.grade}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // CHAT SCREEN
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(160deg, ${subj?.bg || C.sky} 0%, ${C.sky} 100%)`, fontFamily: "'Georgia', serif", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes mascotFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes mascotBounce { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-16px) scale(1.04)} }
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes bubbleRise { 0%{transform:translateY(0);opacity:0.7} 100%{transform:translateY(-110vh);opacity:0} }
        @keyframes starPop { 0%{transform:scale(0)} 60%{transform:scale(1.4)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes praisePop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 60%{transform:scale(1.1) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#E8D8C8; border-radius:2px; }
      `}</style>
      <FloatingBubbles />
      <Confetti active={confetti} />

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <button onClick={() => { setPhase("home"); synthRef.current?.cancel(); recognitionRef.current?.stop(); }}
          style={{ background: "white", border: `2px solid ${subj?.color}44`, borderRadius: 12, padding: "7px 12px", color: C.textMid, fontSize: 14, cursor: "pointer", fontWeight: 700 }}>
          ← 返回
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 22 }}>{subj?.emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{subj?.label}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <StarsRow stars={stars} />
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 6, background: "#EDE0D0", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${mastery}%`, background: `linear-gradient(90deg, ${subj?.color}, ${subj?.color}AA)`, transition: "width 1s cubic-bezier(.34,1.56,.64,1)", borderRadius: 3 }} />
      </div>

      {/* ── Mascot + praise banner ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 4px", flexShrink: 0 }}>
        <FoxMascot mood={mood} size={90} bounce={confetti} talking={talking} />
        {sessionPraise && confetti && (
          <div style={{ background: C.sun, borderRadius: 20, padding: "6px 18px", fontSize: 14, fontWeight: 800, color: C.text, marginTop: -8, boxShadow: `0 4px 16px ${C.sun}88`, animation: "praisePop 0.5s ease", zIndex: 5 }}>
            🌟 {sessionPraise}
          </div>
        )}
      </div>

      {/* ── Chat list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end", animation: "fadeIn 0.25s ease" }}>
            {msg.role === "ai" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: subj?.bg, border: `2px solid ${subj?.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{subj?.emoji}</div>
            )}
            <div style={{ maxWidth: "78%" }}>
              {/* Hint chip */}
              {msg.role === "ai" && msg.hint && (
                <div style={{ display: "inline-block", background: "#FFF5E0", border: `1.5px solid ${C.peach}`, borderRadius: 12, padding: "3px 10px", fontSize: 11, color: C.textMid, marginBottom: 5, fontWeight: 600 }}>
                  💡 {msg.hint}
                </div>
              )}
              <div style={{
                padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                background: msg.role === "user" ? `linear-gradient(135deg, ${subj?.color}, ${subj?.color}CC)` : "white",
                color: msg.role === "user" ? "white" : C.text,
                fontSize: 14.5, lineHeight: 1.6, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                border: msg.role === "ai" ? `1.5px solid ${subj?.color}33` : "none",
              }}>
                {msg.content}
              </div>
              {/* Quick replies */}
              {msg.role === "ai" && msg.suggestedReplies?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {msg.suggestedReplies.map((r, j) => (
                    <button key={j} onClick={() => sendMsg(r)}
                      style={{ background: "white", border: `2px solid ${subj?.color}66`, borderRadius: 16, padding: "6px 13px", color: subj?.color, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.15s" }}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: subj?.bg, border: `2px solid ${subj?.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{subj?.emoji}</div>
            <div style={{ background: "white", border: `1.5px solid ${subj?.color}33`, borderRadius: "4px 18px 18px 18px", padding: "12px 16px", display: "flex", gap: 5 }}>
              {[0,1,2].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: subj?.color, animation: `typingDot 1.2s ${j*0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {/* Voice partial preview */}
        {partialText && (
          <div style={{ textAlign: "right", fontSize: 12, color: C.textLight, fontStyle: "italic", paddingRight: 8 }}>🎤 {partialText}</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{ padding: "8px 14px 16px", borderTop: `2px solid ${subj?.color}22`, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", flexShrink: 0, position: "relative", zIndex: 10 }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["text", "voice"].map(m => (
            <button key={m} onClick={() => setInputMode(m)}
              style={{ flex: 1, background: inputMode === m ? subj?.color : "white", border: `2px solid ${inputMode === m ? subj?.color : "#E8D8C8"}`, borderRadius: 18, padding: "7px 0", color: inputMode === m ? "white" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "text" ? "⌨ 文字" : "🎙 语音"}
            </button>
          ))}
        </div>

        {/* Text mode */}
        {inputMode === "text" && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); startListening(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
              onMouseDown={startListening} onMouseUp={stopListening}
              style={{ width: 44, height: 44, borderRadius: "50%", background: isListening ? C.coral : "white", border: `2px solid ${isListening ? C.coral : "#E8D8C8"}`, fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", animation: isListening ? "pulse 1s infinite" : "none", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
              🎙
            </button>
            <textarea
              ref={textareaRef} value={input}
              onChange={e => { setInput(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="说出你的答案…"
              rows={1} disabled={loading}
              style={{ flex: 1, background: "white", border: `2px solid ${subj?.color}55`, borderRadius: 14, padding: "10px 13px", color: C.text, fontSize: 14, resize: "none", minHeight: 44, maxHeight: 100, lineHeight: 1.5, fontFamily: "inherit" }}
            />
            <button onClick={() => sendMsg()} disabled={loading || !input.trim()}
              style={{ width: 44, height: 44, borderRadius: 12, background: (loading || !input.trim()) ? "#EDE0D0" : `linear-gradient(135deg, ${subj?.color}, ${subj?.color}CC)`, border: "none", color: "white", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: input.trim() ? `0 4px 12px ${subj?.color}66` : "none", transition: "all 0.2s" }}>
              ↑
            </button>
          </div>
        )}

        {/* Voice mode — big hold button */}
        {inputMode === "voice" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <VoiceHoldButton
              onStart={onVoiceStart}
              onStop={onVoiceStop}
              disabled={loading}
              color={subj?.color || C.coral}
            />
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: C.textLight, marginTop: 6 }}>
          {mastery < 80 ? `💪 继续努力！掌握了 ${mastery}%` : `🌟 太棒了！你已经学会了这个知识点！`}
        </div>
      </div>
    </div>
  );
}
