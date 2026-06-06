/* global React, ReactDOM, window, document */
const { useState, useRef, useReducer, useEffect } = React;

/* friendly Georgian labels for the data keys */
const LBL = {
  uni: "უნივერსიტეტი", courselab: "კურსის წარწერა", title: "სათაური", sub: "ქვესათაური",
  desc: "აღწერა", chips: "ჩიპები", eyebrow: "ზედა წარწერა", name: "სახელი", role: "როლი",
  note: "შენიშვნა", explabel: "ბლოკის სათაური", exp: "გამოცდილება", intro: "შესავალი",
  items: "პუნქტები", h: "სათაური", b: "ტექსტი", points: "პუნქტები", stats: "სტატისტიკა",
  val: "მნიშვნელობა", u: "ერთეული", lab: "წარწერა", statsLabel: "სტატ. სათაური",
  meetings: "შეხვედრები", n: "ნომერი / წარწერა", t: "ტექსტი", bigNum: "დიდი ციფრი",
  titleLines: "სათაურის სტრიქონები", num: "ნომერი", eras: "ეტაპები", year: "წელი",
  parts: "ნაწილები", tag: "ტეგი", left: "მარცხენა სვეტი", right: "მარჯვენა სვეტი",
  rows: "სტრიქონები", rh: "ველის სათაური", rb: "ველის ტექსტი", list: "სია", stat: "სტატისტიკა",
  formula: "ფორმულა", prompt: "მოთხოვნა (prompt)", bars: "სვეტები", key: "ლეიბლი", pct: "პროცენტი %",
  headers: "სვეტების სათაურები", metrics: "მეტრიკები", metricsLabel: "მეტრიკის სათაური",
  badge: "ბეჯი", body: "ტექსტი", author: "ავტორი", foot: "ქვედა წარწერა", closed: "დახურული მოდელები",
  open: "ღია მოდელები", cards: "ბარათები", label: "წარწერა", mn: "სახელი", mven: "მომწოდებელი",
  mtag: "ტეგი", strengths: "ძლიერი მხარეები", cautions: "გასათვალისწინებელი", vendor: "მომწოდებელი",
  muted: "დამატებითი ტექსტი", nodes: "ეტაპები", dot: "ნომერი", steps: "ნაბიჯები", risk: "რისკი",
  fix: "გადაჭრა", top: "მრიცხველი", bottom: "მნიშვნელი", tn: "სახელი", tv: "მომწოდებელი",
  td: "აღწერა", big: "დიდი ტექსტი", hl: "ფერადი ნაწილი",
};
const lbl = k => LBL[k] || k;

/* keys that control layout, not text — hidden from the editor */
const SKIP = new Set(["kind", "cols", "titleSize", "dense", "numbered", "accent"]);

const clone = x => JSON.parse(JSON.stringify(x));

function slideTitle(s) {
  const j = v => Array.isArray(v) ? v.map(p => typeof p === "string" ? p : (p && p.hl) || "").join("") : v;
  return j(s.title) || s.name || s.big || (s.titleLines && s.titleLines.join(" ")) ||
    (s.meetings && "გეგმა") || s.eyebrow || "(სლაიდი)";
}

function setDeep(obj, path, value) {
  let o = obj;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  o[path[path.length - 1]] = value;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(window.__tt); window.__tt = setTimeout(() => t.classList.remove("show"), 1800);
}

/* one editable leaf (string or number) */
function Field({ pathKey, value, path, onEdit }) {
  const isNum = typeof value === "number";
  const long = !isNum && String(value).length > 42;
  return (
    <div className="field">
      <label>{pathKey}</label>
      {isNum ? (
        <input type="number" value={value}
          onChange={e => onEdit(path, e.target.value === "" ? 0 : Number(e.target.value))} />
      ) : long ? (
        <textarea rows={Math.min(7, Math.ceil(String(value).length / 46) + 1)} value={value}
          onChange={e => onEdit(path, e.target.value)} />
      ) : (
        <input type="text" value={value} onChange={e => onEdit(path, e.target.value)} />
      )}
    </div>
  );
}

/* recursively render editable fields for a value */
function Node({ value, path, keyName, onEdit, top }) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return null;

  if (typeof value === "string" || typeof value === "number") {
    return <Field pathKey={lbl(keyName)} value={value} path={path} onEdit={onEdit} />;
  }

  if (Array.isArray(value)) {
    return (
      <div className={top ? "group" : "subgroup"}>
        <div className="glabel">{lbl(keyName)}</div>
        {value.map((item, i) => {
          const p = [...path, i];
          if (typeof item === "string" || typeof item === "number") {
            return <Field key={i} pathKey={(i + 1) + "."} value={item} path={p} onEdit={onEdit} />;
          }
          return (
            <div className="subgroup" key={i}>
              <div className="glabel">{lbl(keyName)} {i + 1}</div>
              {Object.keys(item).filter(k => !SKIP.has(k)).map(k =>
                <Node key={k} value={item[k]} path={[...p, k]} keyName={k} onEdit={onEdit} />)}
            </div>
          );
        })}
      </div>
    );
  }

  // plain object
  return (
    <div className={top ? "group" : "subgroup"}>
      <div className="glabel">{lbl(keyName)}</div>
      {Object.keys(value).filter(k => !SKIP.has(k)).map(k =>
        <Node key={k} value={value[k]} path={[...path, k]} keyName={k} onEdit={onEdit} />)}
    </div>
  );
}

function Admin() {
  const dataRef = useRef(clone(window.loadSlides()));
  const [, force] = useReducer(x => x + 1, 0);
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState("");
  const [dirty, setDirty] = useState(false);
  const iframeRef = useRef(null);

  const data = dataRef.current;

  const onEdit = (path, value) => { setDeep(data, path, value); setDirty(true); force(); };

  const save = () => {
    window.saveSlides(data); setDirty(false);
    const f = iframeRef.current;
    if (f) { f.src = "index.html#" + (sel + 1); }
    toast("შენახულია ✓");
  };

  const selectSlide = i => {
    setSel(i);
    const f = iframeRef.current;
    if (f && f.contentWindow) { try { f.contentWindow.location.hash = "#" + (i + 1); } catch (e) {} }
  };

  const exportJS = () => {
    const text = "/* global window */\n// AI მენეჯერებისთვის - კონტენტი (85 სლაიდი). რედაქტირდება admin.html-იდან.\nwindow.DEFAULT_SLIDES = " +
      JSON.stringify(data, null, 2) + ";\n";
    const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "slides.js"; a.click();
    URL.revokeObjectURL(a.href);
    toast("slides.js ჩამოიტვირთა");
  };

  const doImport = () => document.getElementById("importer").click();
  useEffect(() => {
    const inp = document.getElementById("importer");
    const onFile = e => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          let arr;
          const txt = String(r.result);
          if (file.name.endsWith(".json")) arr = JSON.parse(txt);
          else { const w = {}; new Function("window", txt)(w); arr = w.DEFAULT_SLIDES; }
          if (!Array.isArray(arr) || !arr.length) throw new Error("bad");
          dataRef.current = arr; setSel(0); setDirty(true); force(); toast("იმპორტირებულია");
        } catch (err) { toast("შეცდომა: ფაილი ვერ წაიკითხა"); }
      };
      r.readAsText(file); inp.value = "";
    };
    inp.addEventListener("change", onFile);
    return () => inp.removeEventListener("change", onFile);
  }, []);

  const reset = () => {
    if (!confirm("საწყის (ნაგულისხმევ) კონტენტს დავუბრუნდეთ? შენახული ცვლილებები წაიშლება.")) return;
    window.resetSlides(); dataRef.current = clone(window.DEFAULT_SLIDES); setSel(0); setDirty(false); force();
    const f = iframeRef.current; if (f) f.src = "index.html#1";
    toast("დაბრუნდა საწყისზე");
  };

  const list = data.map((s, i) => ({ i, s })).filter(({ s }) =>
    !q || JSON.stringify(s).toLowerCase().includes(q.toLowerCase()));

  const cur = data[sel];

  return (
    <>
      <div className="bar">
        <div className="brand"><span className="dot" />კონტენტის რედაქტორი <small>· AI მენეჯერებისთვის</small></div>
        <div className="spacer" />
        {dirty && <span style={{ fontSize: 12, color: "var(--bog-deep)", display: "flex", gap: 6, alignItems: "center" }}><span className="dirty-dot" />შენახვის გარეშე</span>}
        <button className="btn" onClick={doImport}>იმპორტი</button>
        <button className="btn" onClick={exportJS}>⬇ slides.js</button>
        <button className="btn" onClick={reset}>საწყისზე</button>
        <a className="btn" href="index.html" target="_blank" rel="noreferrer">დეკი ↗</a>
        <button className="btn primary" onClick={save} disabled={!dirty}>შენახვა</button>
      </div>

      <div className="wrap">
        {/* sidebar */}
        <div className="side">
          <div className="search"><input placeholder="ძებნა სლაიდებში…" value={q} onChange={e => setQ(e.target.value)} /></div>
          {list.map(({ i, s }) => (
            <div key={i} className={"slide-row" + (i === sel ? " active" : "")} onClick={() => selectSlide(i)}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="meta">
                <span className="st">{slideTitle(s)}</span>
                <span className="kind">{s.kind}</span>
              </span>
            </div>
          ))}
        </div>

        {/* editor */}
        <div className="editor">
          <h2>სლაიდი {sel + 1} <span style={{ color: "var(--faint)", fontWeight: 400, fontSize: 14 }}>/ {data.length} · {cur.kind}</span></h2>
          <div className="sub">{slideTitle(cur)}</div>
          <div className="help">
            შეცვალე ტექსტი ქვემოთ. <b>შენახვა</b> ინახავს ბრაუზერში და მაშინვე აახლებს გადახედვას.
            იმისთვის, რომ ცვლილებები სამუდამოდ შენარჩუნდეს საიტზე - დააჭირე <b>⬇ slides.js</b>-ს და ჩაანაცვლე ფაილი რეპოზიტორიაში (commit).
          </div>
          {Object.keys(cur).filter(k => !SKIP.has(k) && k !== "foot").map(k =>
            <Node key={k} value={cur[k]} path={[sel, k]} keyName={k} onEdit={onEdit} top />)}
          <div className="group">
            <div className="glabel">ქვედა წარწერა</div>
            <Node value={cur.foot} path={[sel, "foot"]} keyName="foot" onEdit={onEdit} />
          </div>
        </div>

        {/* preview */}
        <div className="preview-pane">
          <div className="phead">ცოცხალი გადახედვა · ბოლო შენახული ვერსია</div>
          <iframe ref={iframeRef} src={"index.html#" + (sel + 1)} title="preview" />
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Admin />);
