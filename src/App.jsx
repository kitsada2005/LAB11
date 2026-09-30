import { useState, useRef } from "react";
import {
  Check, Plus, Pencil, Trash2, Search, X, LayoutList,
  Briefcase, User, ShoppingBag, HeartPulse, CalendarDays,
} from "lucide-react";

const PRIO = { low: "ต่ำ", medium: "กลาง", high: "สูง" };
const PRIO_ORDER = ["low", "medium", "high"];
const CATS = {
  work: { label: "งาน", Icon: Briefcase },
  personal: { label: "ส่วนตัว", Icon: User },
  shopping: { label: "ช้อปปิ้ง", Icon: ShoppingBag },
  health: { label: "สุขภาพ", Icon: HeartPulse },
};
const CAT_KEYS = Object.keys(CATS);
const FILTERS = [
  ["all", "ทั้งหมด"],
  ["active", "ยังไม่เสร็จ"],
  ["done", "เสร็จแล้ว"],
];

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayOffset = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toKey(d); };
const fmtDate = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

function Donut({ segments, total, pct }) {
  const r = 32, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="84" height="84" viewBox="0 0 80 80" className="shrink-0" role="img" aria-label={`เสร็จแล้ว ${pct}%`}>
      <g transform="rotate(-90 40 40)" fill="none" strokeWidth="12">
        <circle cx="40" cy="40" r={r} stroke="var(--line)" />
        {total > 0 && segments.map((s) => {
          const len = (s.value / total) * c;
          const el = s.value > 0 && (
            <circle key={s.label} cx="40" cy="40" r={r} stroke={s.color}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--text)">{pct}%</text>
    </svg>
  );
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, prio: "high", cat: "work", due: dayOffset(-1) },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, prio: "medium", cat: "shopping", due: dayOffset(0) },
    { id: 3, text: "วิ่งเช้า 30 นาที", done: true, prio: "low", cat: "health", due: dayOffset(0) },
    { id: 4, text: "โทรหาครอบครัว", done: false, prio: "medium", cat: "personal", due: dayOffset(3) },
  ]);
  const [text, setText] = useState("");
  const [prio, setPrio] = useState("medium");
  const [cat, setCat] = useState("work");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({ text: "", cat: "work", due: "" });
  const nextId = useRef(5);

  const today = toKey(new Date());
  const isOverdue = (t) => !t.done && t.due && t.due < today;

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((l) => [{ id: nextId.current++, text: t, done: false, prio, cat, due }, ...l]);
    setText("");
    setDue("");
  };
  const toggle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const cyclePrio = (id) =>
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, prio: PRIO_ORDER[(PRIO_ORDER.indexOf(t.prio) + 1) % 3] } : t)));
  const remove = (id) => {
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setTodos((l) => l.filter((t) => t.id !== id)), 350);
  };
  const clearDone = () => setTodos((l) => l.filter((t) => !t.done));
  const startEdit = (t) => { setEditId(t.id); setEdit({ text: t.text, cat: t.cat, due: t.due }); };
  const saveEdit = () => {
    const v = edit.text.trim();
    if (v) setTodos((l) => l.map((t) => (t.id === editId ? { ...t, text: v, cat: edit.cat, due: edit.due } : t)));
    setEditId(null);
  };

  const live = todos.filter((t) => !t.leaving);
  const total = live.length;
  const doneCount = live.filter((t) => t.done).length;
  const overdueCount = live.filter(isOverdue).length;
  const activeCount = total - doneCount - overdueCount;
  const remaining = total - doneCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const counts = { all: total };
  CAT_KEYS.forEach((k) => (counts[k] = live.filter((t) => t.cat === k).length));

  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "all" || (filter === "active" ? !t.done : t.done)) &&
      (catFilter === "all" || t.cat === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  );

  const sideItems = [["all", { label: "ทั้งหมด", Icon: LayoutList }], ...Object.entries(CATS)];
  const segments = [
    { label: "เสร็จแล้ว", value: doneCount, color: "#16a34a" },
    { label: "ค้างอยู่", value: activeCount, color: "#4f46e5" },
    { label: "เกินกำหนด", value: overdueCount, color: "#dc2626" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-1">รายการสิ่งที่ต้องทำ</h1>
      <p className="muted text-sm mb-6">จัดการงานของคุณให้เป็นระเบียบ</p>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <aside className="w-full md:w-56 shrink-0 space-y-4">
          <div className="card p-2">
            <nav className="flex md:flex-col gap-1 overflow-x-auto">
              {sideItems.map(([k, { label, Icon }]) => (
                <button key={k} onClick={() => setCatFilter(k)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap md:w-full transition"
                  style={catFilter === k ? { background: "rgba(79,70,229,.12)", color: "var(--accent)" } : { color: "var(--text)" }}>
                  <Icon size={16} />
                  <span className="md:flex-1 text-left">{label}</span>
                  <span className="text-xs muted">{counts[k]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3">สถิติ</h2>
            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div><div className="muted text-xs">งานทั้งหมด</div><div className="text-xl font-semibold">{total}</div></div>
              <div><div className="muted text-xs">เสร็จแล้ว</div><div className="text-xl font-semibold">{pct}%</div></div>
            </div>
            <div className="flex items-center gap-3">
              <Donut segments={segments} total={total} pct={pct} />
              <ul className="text-xs space-y-1.5">
                {segments.map((s) => (
                  <li key={s.label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="muted">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          <div className="card p-4 mb-4">
            <div className="flex gap-2">
              <input className="inp flex-1 min-w-0 px-4 py-3 text-base" placeholder="เพิ่มงานใหม่..." value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && add()} />
              <button onClick={add} className="flex items-center gap-1 px-4 rounded-xl text-white font-medium active:scale-95 transition" style={{ background: "var(--accent)" }}>
                <Plus size={18} /><span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                {PRIO_ORDER.map((p) => (
                  <button key={p} onClick={() => setPrio(p)} className={`px-3 py-1 rounded-full font-medium transition p-${p}`}
                    style={{ opacity: prio === p ? 1 : 0.4, outline: prio === p ? "2px solid currentColor" : "none", outlineOffset: 1 }}>
                    {PRIO[p]}
                  </button>
                ))}
              </div>
              <select className="inp px-2 py-1.5" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="หมวดหมู่">
                {CAT_KEYS.map((k) => <option key={k} value={k}>{CATS[k].label}</option>)}
              </select>
              <input type="date" className="inp px-2 py-1.5" value={due} onChange={(e) => setDue(e.target.value)} aria-label="วันครบกำหนด" />
            </div>
          </div>

          <div className="card p-4">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 muted" />
              <input className="inp w-full pl-9 pr-3 py-2.5 text-base" placeholder="ค้นหางาน..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: "var(--bg)" }}>
              {FILTERS.map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)} className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                  style={filter === k ? { background: "var(--card)", boxShadow: "var(--shadow)", color: "var(--accent)" } : { color: "var(--muted)" }}>
                  {label}
                </button>
              ))}
            </div>

            <div>
              {visible.length === 0 && <p className="muted text-center py-8 text-sm">ไม่มีรายการ</p>}
              {visible.map((t) => {
                const state = !t.due ? null : isOverdue(t) ? "over" : t.due === today && !t.done ? "today" : "normal";
                return (
                  <div key={t.id} className={`item flex items-start gap-3 py-3 border-b ${t.leaving ? "leaving" : ""}`} style={{ borderColor: "var(--line)" }}>
                    <div className={`chk mt-0.5 ${t.done ? "on" : ""}`} onClick={() => toggle(t.id)} role="checkbox" aria-checked={t.done}>
                      {t.done && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editId === t.id ? (
                        <div className="space-y-2">
                          <input autoFocus className="inp w-full px-2 py-1 text-base" value={edit.text}
                            onChange={(e) => setEdit({ ...edit, text: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.nativeEvent.isComposing) saveEdit();
                              if (e.key === "Escape") setEditId(null);
                            }} />
                          <div className="flex flex-wrap gap-2 text-sm">
                            <select className="inp px-2 py-1" value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })}>
                              {CAT_KEYS.map((k) => <option key={k} value={k}>{CATS[k].label}</option>)}
                            </select>
                            <input type="date" className="inp px-2 py-1" value={edit.due} onChange={(e) => setEdit({ ...edit, due: e.target.value })} />
                            <button className="ib" onClick={saveEdit} aria-label="บันทึก" style={{ color: "var(--accent)" }}><Check size={16} /></button>
                            <button className="ib" onClick={() => setEditId(null)} aria-label="ยกเลิก"><X size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span onDoubleClick={() => startEdit(t)} className="block break-words cursor-text select-none"
                            style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>
                            {t.text}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <button onClick={() => cyclePrio(t.id)} title="เปลี่ยนความสำคัญ" className={`text-xs px-2.5 py-0.5 rounded-full font-medium p-${t.prio}`}>{PRIO[t.prio]}</button>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium c-${t.cat}`}>{CATS[t.cat].label}</span>
                            {state && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 d-${state}`}>
                                <CalendarDays size={12} />
                                {state === "over" ? `เกินกำหนด · ${fmtDate(t.due)}` : state === "today" ? "วันนี้" : fmtDate(t.due)}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    {editId !== t.id && (
                      <>
                        <button className="ib" onClick={() => startEdit(t)} aria-label="แก้ไข"><Pencil size={16} /></button>
                        <button className="ib del" onClick={() => remove(t.id)} aria-label="ลบ"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 text-sm">
              <span className="muted">เหลืออีก {remaining} งาน</span>
              <button onClick={clearDone} disabled={!doneCount} className="font-medium transition" style={{ color: "var(--accent)", opacity: doneCount ? 1 : 0.35 }}>
                ล้างที่เสร็จแล้ว{doneCount ? ` (${doneCount})` : ""}
              </button>
            </div>
          </div>
          <p className="muted text-xs text-center mt-4">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · แตะป้ายความสำคัญเพื่อเปลี่ยนระดับ</p>
        </main>
      </div>
    </div>
  );
}
