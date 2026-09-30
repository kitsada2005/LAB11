import { useState, useRef } from "react";
import { Check, Plus, Pencil, Trash2 } from "lucide-react";

const PRIO = { low: "ต่ำ", medium: "กลาง", high: "สูง" };
const ORDER = ["low", "medium", "high"];
const FILTERS = [
  ["all", "ทั้งหมด"],
  ["active", "ยังไม่เสร็จ"],
  ["done", "เสร็จแล้ว"],
];

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, prio: "high" },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, prio: "medium" },
    { id: 3, text: "อ่านหนังสือ 20 หน้า", done: true, prio: "low" },
  ]);
  const [text, setText] = useState("");
  const [prio, setPrio] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const nextId = useRef(4);
  const skip = useRef(false);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((l) => [{ id: nextId.current++, text: t, done: false, prio }, ...l]);
    setText("");
  };
  const toggle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const cycle = (id) =>
    setTodos((l) =>
      l.map((t) => (t.id === id ? { ...t, prio: ORDER[(ORDER.indexOf(t.prio) + 1) % 3] } : t))
    );
  const remove = (id) => {
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setTodos((l) => l.filter((t) => t.id !== id)), 350);
  };
  const clearDone = () => setTodos((l) => l.filter((t) => !t.done));
  const startEdit = (t) => {
    skip.current = false;
    setEditId(t.id);
    setEditText(t.text);
  };
  const saveEdit = () => {
    if (skip.current) return;
    const v = editText.trim();
    if (v) setTodos((l) => l.map((t) => (t.id === editId ? { ...t, text: v } : t)));
    setEditId(null);
  };
  const cancelEdit = () => {
    skip.current = true;
    setEditId(null);
  };

  const remaining = todos.filter((t) => !t.done && !t.leaving).length;
  const doneCount = todos.filter((t) => t.done).length;
  const visible = todos.filter(
    (t) => filter === "all" || (filter === "active" ? !t.done : t.done)
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-1">รายการสิ่งที่ต้องทำ</h1>
      <p className="muted text-sm mb-6">จัดการงานของคุณให้เป็นระเบียบ</p>

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <input
            className="inp flex-1 min-w-0 px-4 py-3 text-base"
            placeholder="เพิ่มงานใหม่..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && add()}
          />
          <button
            onClick={add}
            className="flex items-center gap-1 px-4 rounded-xl text-white font-medium active:scale-95 transition"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">เพิ่ม</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <span className="muted">ความสำคัญ:</span>
          {ORDER.map((p) => (
            <button
              key={p}
              onClick={() => setPrio(p)}
              className={`px-3 py-1 rounded-full font-medium transition p-${p}`}
              style={{
                opacity: prio === p ? 1 : 0.4,
                outline: prio === p ? "2px solid currentColor" : "none",
                outlineOffset: 1,
              }}
            >
              {PRIO[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: "var(--bg)" }}>
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition"
              style={
                filter === k
                  ? { background: "var(--card)", boxShadow: "var(--shadow)", color: "var(--accent)" }
                  : { color: "var(--muted)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          {visible.length === 0 && <p className="muted text-center py-8 text-sm">ไม่มีรายการ</p>}
          {visible.map((t) => (
            <div
              key={t.id}
              className={`item flex items-center gap-3 py-3 border-b ${t.leaving ? "leaving" : ""}`}
              style={{ borderColor: "var(--line)" }}
            >
              <div
                className={`chk ${t.done ? "on" : ""}`}
                onClick={() => toggle(t.id)}
                role="checkbox"
                aria-checked={t.done}
              >
                {t.done && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                {editId === t.id ? (
                  <input
                    autoFocus
                    className="inp w-full px-2 py-1 text-base"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    className="block break-words cursor-text select-none"
                    style={{
                      textDecoration: t.done ? "line-through" : "none",
                      color: t.done ? "var(--muted)" : "var(--text)",
                    }}
                  >
                    {t.text}
                  </span>
                )}
              </div>
              <button
                onClick={() => cycle(t.id)}
                title="เปลี่ยนความสำคัญ"
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 p-${t.prio}`}
              >
                {PRIO[t.prio]}
              </button>
              <button className="ib" onClick={() => startEdit(t)} aria-label="แก้ไข">
                <Pencil size={16} />
              </button>
              <button className="ib del" onClick={() => remove(t.id)} aria-label="ลบ">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 text-sm">
          <span className="muted">เหลืออีก {remaining} งาน</span>
          <button
            onClick={clearDone}
            disabled={!doneCount}
            className="font-medium transition"
            style={{ color: "var(--accent)", opacity: doneCount ? 1 : 0.35 }}
          >
            ล้างที่เสร็จแล้ว{doneCount ? ` (${doneCount})` : ""}
          </button>
        </div>
      </div>
      <p className="muted text-xs text-center mt-4">
        ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · แตะป้ายความสำคัญเพื่อเปลี่ยนระดับ
      </p>
    </div>
  );
}
