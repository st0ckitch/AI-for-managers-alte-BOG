/* global React, ReactDOM, SLIDES */
const { useState, useEffect, useRef, useCallback } = React;
const SLIDES = (window.SLIDES && window.SLIDES.length) ? window.SLIDES : window.DEFAULT_SLIDES;
const TOTAL = SLIDES.length;

/* ---------------- custom cursor ---------------- */
function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  const pos = useRef({ x: -100, y: -100 }), rp = useRef({ x: -100, y: -100 });
  useEffect(() => {
    const move = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);
    const sel = "a,button,.exitem,.pcard,.tool,.bigchip,.mcard,.nav-arrow,.crow";
    const over = e => { if (e.target.closest(sel)) { dot.current?.classList.add("hover"); ring.current?.classList.add("hover"); } };
    const out = e => { if (e.target.closest(sel)) { dot.current?.classList.remove("hover"); ring.current?.classList.remove("hover"); } };
    document.addEventListener("mouseover", over); document.addEventListener("mouseout", out);
    let raf; const tick = () => {
      rp.current.x += (pos.current.x - rp.current.x) * 0.2;
      rp.current.y += (pos.current.y - rp.current.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate(${rp.current.x}px,${rp.current.y}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); document.removeEventListener("mouseout", out); };
  }, []);
  return (<><div ref={dot} className="cursor-dot" /><div ref={ring} className="cursor-ring" /></>);
}

/* ---------------- helpers ---------------- */
function CountUp({ value }) {
  // animate the numeric portion of a string like "100", "~10", "583"
  const m = String(value).match(/^(\D*)(\d+)(.*)$/);
  const [n, setN] = useState(m ? 0 : value);
  useEffect(() => {
    if (!m) return;
    const target = parseInt(m[2], 10); const t0 = performance.now(); const dur = 1200;
    let raf; const tick = now => {
      const p = Math.min((now - t0) / dur, 1); const e = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(target * e)); if (p < 1) raf = requestAnimationFrame(tick); else setN(target);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  if (!m) return <span>{value}</span>;
  return <span>{m[1]}{n}{m[3]}</span>;
}

/* Mkhedruli → Mtavruli (Georgian capitals) for display headlines.
   Latin, digits and punctuation pass through untouched. */
function mtav(s) {
  return typeof s === "string"
    ? s.replace(/[ა-ჺ]/g, c => String.fromCodePoint(c.codePointAt(0) + 0x0BC0))
    : s;
}
function renderTitle(title) {
  if (Array.isArray(title)) return title.map((p, i) => typeof p === "string" ? <React.Fragment key={i}>{mtav(p)}</React.Fragment> : <span key={i} className="hl">{mtav(p.hl)}</span>);
  return mtav(title);
}
const tcls = sz => "slide-title " + (sz === "lg" ? "t-lg" : sz === "md" ? "t-md" : "t-lg");

function Header({ s }) {
  return (
    <div className="slide-head">
      {s.eyebrow && <span className="eyebrow r" style={{ "--d": "0s" }}>{s.eyebrow}</span>}
      {s.title && <h2 className={tcls(s.titleSize) + " r"} style={{ "--d": ".06s" }}>{renderTitle(s.title)}</h2>}
      {s.intro && <p className="intro-line r" style={{ "--d": ".12s", marginTop: 14 }}>{s.intro}</p>}
      {s.introHead && <div className="r" style={{ "--d": ".16s", marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{s.introHead}</div>}
    </div>
  );
}
function Footer({ s, idx }) {
  return (
    <div className="slide-foot">
      <span className="brand"><span className="dot" />{s.foot || "AI მენეჯერებისთვის"}</span>
      <span>{idx + 1} / {TOTAL}</span>
    </div>
  );
}
function grid(cols) { return { display: "grid", gap: cols >= 5 ? 12 : 16, gridTemplateColumns: `repeat(${cols},1fr)` }; }
const D = i => ({ "--d": (0.18 + i * 0.06) + "s" });

/* ---------------- point card ---------------- */
function PointCard({ it, i, dense, numbered }) {
  return (
    <div className={"pcard r" + (dense ? " dense" : "")} style={D(i)}>
      {numbered && <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", marginBottom: 6 }}>{String(i + 1).padStart(2, "0")}</div>}
      <div className="ph">{it.h}</div>
      {it.sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginTop: 3, letterSpacing: ".04em" }}>{it.sub}</div>}
      {it.b && <div className="pb">{it.b}</div>}
    </div>
  );
}

/* ============================================================
   PER-KIND BODIES
   ============================================================ */
function Points({ s }) {
  const cols = s.cols || 3;
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column" }}>
      <Header s={s} />
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={grid(cols)}>
          {s.items.map((it, i) => <PointCard key={i} it={it} i={i} dense={s.dense} numbered={s.numbered} />)}
        </div>
        {s.note && <div className="note-line r" style={D(s.items.length)}>{s.note}</div>}
      </div>
    </div>
  );
}

function Cover({ s }) {
  return (
    <div className="slide-body cover">
      <div className="uni r">{s.uni}</div>
      <div className="courselab r" style={{ "--d": ".05s" }}>{s.courselab}</div>
      <h1 className="ctitle r" style={{ "--d": ".12s" }}>{renderTitle(s.title)}</h1>
      <div className="csub r" style={{ "--d": ".2s" }}>{s.sub}</div>
      <p className="cdesc r" style={{ "--d": ".28s" }}>{s.desc}</p>
      <div className="cchips">
        {s.chips.map((c, i) => <span key={i} className="cchip r" style={D(i + 5)}><span className="dot" />{c}</span>)}
      </div>
    </div>
  );
}

function Trainer({ s }) {
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "lg" }} />
      <div className="trainer">
        <div>
          <div className="tname r" style={{ "--d": ".1s" }}>{mtav(s.name)}</div>
          <div className="trole r" style={{ "--d": ".16s" }}>{s.role}</div>
          <p className="tdesc r" style={{ "--d": ".22s" }}>{s.desc}</p>
          <div className="tnote r" style={{ "--d": ".28s" }}>{s.note}</div>
        </div>
        <div className="explist">
          <div className="exlab r" style={{ "--d": ".2s" }}>{s.explabel}</div>
          {s.exp.map((e, i) => <div key={i} className="exitem r" style={D(i + 4)}><span className="ix">0{i + 1}</span>{e}</div>)}
        </div>
      </div>
    </div>
  );
}

function Stats({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column" }}>
      <Header s={s} />
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 40, alignItems: "center" }}>
      <div className="grid" style={{ gap: 12 }}>
        {s.points.map((p, i) => <PointCard key={i} it={p} i={i} dense />)}
      </div>
      <div className="glass r" style={{ "--d": ".3s", padding: 30 }}>
        <div className="exlab" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 22 }}>{s.statsLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
          {s.stats.map((st, i) => (
            <div className="stat" key={i}>
              <div className="val"><CountUp value={st.val} /><span className="u">{st.u}</span></div>
              <div className="lab">{st.lab}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

function Roadmap({ s }) {
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "lg" }} />
      <div className="twocol" style={{ height: "auto" }}>
        {s.meetings.map((m, i) => (
          <div className={"colcard r" + (i === 1 ? " accent" : "")} style={D(i * 2)} key={i}>
            <div className="ctitle">{m.n}</div>
            <div style={{ fontSize: 14, color: "var(--ink-dim)", margin: "8px 0 16px" }}>{m.sub}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
              {m.items.map((it, j) => <div key={j} className="cli">{it}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ s }) {
  return (
    <div className="slide-body divider-slide" style={{ height: "100%" }}>
      <svg className="orbit-svg" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[150, 210, 270].map((r, i) => <ellipse key={i} cx="300" cy="300" rx={r} ry={r * 0.8} fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 5" />)}
        <circle cx="300" cy="300" r="150" fill="url(#hub)" />
        {[0, 1, 2, 3, 4, 5].map(i => {
          const a = (i / 6) * Math.PI * 2; const r = 150 + (i % 3) * 60;
          return <circle key={i} cx={300 + Math.cos(a) * r} cy={300 + Math.sin(a) * r * 0.8} r={6 + (i % 3) * 3} fill="var(--bg-3)" stroke="var(--accent)" strokeWidth="1" />;
        })}
      </svg>
      <div className="big-num r" style={{ "--d": ".1s" }}>{s.bigNum}</div>
      <div className="divider-inner">
        <span className="eyebrow r">{s.eyebrow}</span>
        <h2 className="dtitle">{s.title.map((l, i) => <div key={i} className="rise"><span style={{ "--d": (0.12 + i * 0.09) + "s" }}>{mtav(l)}</span></div>)}</h2>
        <p className="ddesc r" style={{ "--d": ".2s" }}>{s.desc}</p>
      </div>
    </div>
  );
}

function Block({ s }) {
  const cols2 = s.items.length > 4;
  return (
    <div className="slide-body" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 50, alignItems: "center", height: "100%" }}>
      <div>
        <span className="eyebrow r">ბლოკი {s.num}</span>
        <h2 className="slide-title t-xl r" style={{ "--d": ".08s", marginTop: 16 }}>{s.titleLines.map((l, i) => <div key={i}>{mtav(l)}</div>)}</h2>
      </div>
      <div>
        <div className="exlab r" style={{ "--d": ".14s", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>ამ ბლოკში</div>
        <div className={"agenda" + (cols2 ? " two" : "")}>
          {s.items.map((it, i) => (
            <div className="arow r" style={D(i)} key={i}>
              <span className="numchip">{i + 1}</span><span className="at">{it}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Agenda({ s }) {
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "lg" }} />
      <div className="agenda two">
        {s.items.map((it, i) => (
          <div className="arow r" style={D(i)} key={i}>
            <span className="numchip" style={{ width: 44, fontSize: 12 }}>{it.n}</span><span className="at">{it.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Timeline({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div className="stepper" style={{ marginTop: 20 }}>
        {s.eras.map((e, i) => (
          <div className="snode r" style={D(i)} key={i}>
            <div className="dot" style={{ fontSize: 13 }}>{e.year.slice(0, 4)}</div>
            <div className="stag">{e.year}</div>
            <div className="sh">{e.h}</div>
            <div className="sb">{e.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BigStat({ s }) {
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md", intro: s.intro }} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 30, alignItems: "center", marginTop: 8 }}>
        <div className="grid cols-3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          {s.points.map((p, i) => <PointCard key={i} it={p} i={i} dense />)}
        </div>
        <div className="hugestat r" style={{ "--d": ".3s" }}>
          <div className="hv"><CountUp value={s.stat.val} />{s.stat.u}</div>
          <div className="hs">{s.stat.sub}</div>
        </div>
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".4s" }}>{s.note}</div>}
    </div>
  );
}

function Definition({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div className="defgrid">
        {s.parts.map((p, i) => (
          <div className="defcard r" style={D(i)} key={i}>
            <div className="bignum">{i + 1}</div>
            <div style={{ position: "relative" }}>
              <div className="dtag">{p.tag}</div>
              <div className="dsub">{p.sub}</div>
              <div className="dbody">{p.b}</div>
            </div>
          </div>
        ))}
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".4s" }}>{s.note}</div>}
    </div>
  );
}

function ColCard({ col }) {
  return (
    <div className={"colcard r" + (col.accent ? " accent" : "")} style={{ "--d": col.accent ? ".22s" : ".12s" }}>
      <div className="ctitle">{col.title}{col.tag && <span className="tag">{col.tag}</span>}</div>
      {col.desc && <div style={{ fontSize: 13.5, color: "var(--ink-dim)", margin: "12px 0 4px", lineHeight: 1.45 }}>{col.desc}</div>}
      {col.rows && <div style={{ marginTop: 6 }}>{col.rows.map((r, i) => <div className="crow" key={i}><div className="rh">{r.rh}</div><div className="rb">{r.rb}</div></div>)}</div>}
      {col.list && <div className="clist" style={{ marginTop: 14 }}>{col.list.map((l, i) => <div className="cli" key={i}>{l}</div>)}</div>}
    </div>
  );
}
function TwoCol({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md", intro: s.intro }} />
      <div className="twocol" style={{ height: "auto", marginTop: 6 }}>
        <ColCard col={s.left} /><ColCard col={s.right} />
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".4s" }}>{s.note}</div>}
    </div>
  );
}

function Model({ s }) {
  return (
    <div className="slide-body">
      <div className="slide-head">
        <span className="eyebrow r">{s.eyebrow}</span>
        <h2 className="slide-title t-xl r" style={{ "--d": ".06s", marginTop: 12 }}>{mtav(s.name)} <span style={{ color: "var(--ink-faint)", fontWeight: 300, fontSize: 28 }}>· {s.vendor}</span></h2>
        <p className="intro-line r" style={{ "--d": ".12s", marginTop: 12 }}>{s.desc}</p>
      </div>
      <div className="twocol" style={{ height: "auto" }}>
        <ColCard col={{ title: "ძლიერი მხარეები", accent: true, list: s.strengths }} />
        <ColCard col={{ title: "რას მივაქციოთ ყურადღება", list: s.cautions }} />
      </div>
    </div>
  );
}

function Market({ s }) {
  const Group = ({ g, accent }) => (
    <div className="mgroup">
      <div className="mglab">{g.label}</div>
      <div className="mcards">
        {g.cards.map((c, i) => (
          <div className="mcard r" style={{ ...D(i), borderColor: accent ? "rgba(255,82,0,0.3)" : undefined }} key={i}>
            <div><div className="mn">{c.mn}</div><div className="mven">{c.mven}</div></div>
            <div className="mtag">{c.mtag}</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md", intro: s.intro }} />
      <div className="market" style={{ marginTop: 10 }}>
        <Group g={s.closed} accent /><Group g={s.open} />
      </div>
    </div>
  );
}

function Steps({ s }) {
  const hasStat = !!s.stat;
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div style={hasStat ? { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 26, alignItems: "stretch" } : {}}>
        <div className="steps" style={{ gridTemplateColumns: "repeat(" + (hasStat ? 2 : s.steps.length > 4 ? 2 : s.steps.length) + ",1fr)", display: "grid" }}>
          {s.steps.map((st, i) => (
            <div className="step r" style={D(i)} key={i}>
              <div className="sn">{st.n}</div>
              {st.h && <div className="sh">{st.h}</div>}
              <div className="sb">{st.b}</div>
            </div>
          ))}
        </div>
        {hasStat && (
          <div className="hugestat r" style={{ "--d": ".34s", alignItems: "center", textAlign: "center" }}>
            <div className="hv" style={{ fontSize: 56 }}>{s.stat.big}</div>
            <div className="hs" style={{ textAlign: "center" }}>{s.stat.lab}</div>
          </div>
        )}
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".44s" }}>{s.note}</div>}
    </div>
  );
}

function Stepper({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div className="stepper" style={{ marginTop: 26 }}>
        {s.nodes.map((n, i) => (
          <div className="snode r" style={D(i)} key={i}>
            <div className="dot">{n.dot}</div>
            <div className="stag">{n.tag}</div>
            <div className="sh">{n.h}</div>
            <div className="sb">{n.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Prob({ s }) {
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md", intro: s.intro }} />
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 34, alignItems: "center", marginTop: 6 }}>
        <div className="grid" style={{ gap: 12 }}>
          {s.points.map((p, i) => <PointCard key={i} it={p} i={i} dense />)}
        </div>
        <div className="glass r" style={{ "--d": ".3s", padding: 26 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--ink)", marginBottom: 18 }}>{s.prompt}</div>
          <div className="probbars">
            {s.bars.map((b, i) => (
              <div className={"pb-row" + (i === 0 ? " top" : "")} key={i}>
                <span className="pb-key">{b.key}</span>
                <span className="pb-track"><span className="pb-fill" style={{ width: b.pct + "%", "--d": (0.3 + i * 0.12) + "s" }} /></span>
                <span className="pb-pct">{b.pct}%</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 16, lineHeight: 1.4 }}>{s.note}</div>
        </div>
      </div>
    </div>
  );
}

function Neural({ s }) {
  const inY = [120, 230, 340], hY = [80, 170, 260, 350], h2Y = [110, 200, 290], outY = [200];
  const cols = [{ x: 60, ys: inY, cls: "in" }, { x: 200, ys: hY, cls: "" }, { x: 340, ys: h2Y, cls: "" }, { x: 470, ys: outY, cls: "out" }];
  const links = [];
  for (let c = 0; c < cols.length - 1; c++) cols[c].ys.forEach(y1 => cols[c + 1].ys.forEach(y2 => links.push([cols[c].x, y1, cols[c + 1].x, y2])));
  return (
    <div className="slide-body">
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md", intro: s.intro }} />
      <div className="neural-wrap">
        <div className="layers">
          {s.layers.map((l, i) => (
            <div className="layer-card r" style={D(i)} key={i}><div className="lh">{l.h}</div><div className="lb">{l.b}</div></div>
          ))}
        </div>
        <svg viewBox="0 0 540 420" className="r" style={{ "--d": ".25s", width: "100%" }}>
          {links.map((l, i) => <line key={i} className="nn-link" x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}
          {cols.map((c, ci) => c.ys.map((y, yi) => <circle key={ci + "-" + yi} className={"nn-node " + c.cls} cx={c.x} cy={y} r="15" />))}
        </svg>
      </div>
    </div>
  );
}

function Tools({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div className="tools">
        {s.rows.map((r, i) => (
          <div className="tool r" style={D(i)} key={i}>
            <div><div className="tn">{r.tn}</div><div className="tv">{r.tv}</div></div>
            <div className="td">{r.td}</div>
          </div>
        ))}
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".4s" }}>{s.note}</div>}
    </div>
  );
}

function Table({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div className="glass r" style={{ "--d": ".16s", padding: "8px 14px" }}>
        <table className="dtable">
          <thead><tr>{s.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {s.rows.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => <td key={j} className={j === 0 ? "lead" : j === 1 ? "pick" : ""}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".4s" }}>{s.note}</div>}
    </div>
  );
}

function Chips({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "lg" }} />
      <div className="chips" style={{ marginTop: 10 }}>
        {s.chips.map((c, i) => <span className="bigchip r" style={D(i)} key={i}><span className="dot" />{c}</span>)}
        {s.muted && <span className="bigchip muted r" style={D(s.chips.length)}>{s.muted}</span>}
      </div>
    </div>
  );
}

function Live({ s }) {
  const cols = s.cols || 2;
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="slide-head">
        <span className="eyebrow r">{s.eyebrow}</span>
        <div className="r" style={{ "--d": ".05s", display: "flex", alignItems: "center", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
          <h2 className="slide-title t-md" style={{ marginTop: 0 }}>{s.title}</h2>
          <span className="live-badge"><span className="blink" />LIVE</span>
        </div>
        <p className="intro-line r" style={{ "--d": ".12s", marginTop: 12 }}>{s.badge}</p>
      </div>
      <div style={grid(cols)}>
        {s.items.map((it, i) => <PointCard key={i} it={it} i={i} numbered={s.numbered} />)}
      </div>
    </div>
  );
}

function Risks({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {s.items.map((r, i) => (
          <div className="colcard r" style={D(i)} key={i}>
            <div className="ctitle" style={{ fontSize: 22 }}>{r.h}</div>
            <div className="crow" style={{ marginTop: 12 }}><div className="rh" style={{ color: "var(--bog-light)" }}>რისკი</div><div className="rb">{r.risk}</div></div>
            <div className="crow"><div className="rh" style={{ color: "var(--accent)" }}>გადაჭრა</div><div className="rb" style={{ color: "var(--ink)" }}>{r.fix}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Roi({ s }) {
  return (
    <div className="slide-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Header s={{ eyebrow: s.eyebrow, title: s.title, titleSize: "md" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 30, alignItems: "center" }}>
        <div>
          <div className="exlab r" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 14 }}>{s.metricsLabel}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {s.metrics.map((m, i) => <PointCard key={i} it={m} i={i} dense />)}
          </div>
        </div>
        <div className="hugestat r" style={{ "--d": ".3s", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>{s.formula.label}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, color: "var(--bog-light)", borderBottom: "2px solid var(--accent)", paddingBottom: 12, marginBottom: 12 }}>{s.formula.top}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, color: "var(--ink)" }}>{s.formula.bottom}</div>
        </div>
      </div>
      {s.note && <div className="note-line r" style={{ "--d": ".42s" }}>{s.note}</div>}
    </div>
  );
}

function Statement({ s }) {
  return (
    <div className="slide-body statement">
      <span className="eyebrow r">{s.eyebrow}</span>
      <h2 className="stitle r" style={{ "--d": ".1s", marginTop: 18 }}>{mtav(s.title)}</h2>
      <p className="sbody r" style={{ "--d": ".2s" }}>{s.body}</p>
    </div>
  );
}

function Thanks({ s }) {
  return (
    <div className="slide-body thanks">
      <div className="uni r">{s.uni}</div>
      <div className="big">{mtav(s.big)}</div>
      <p className="tbody r" style={{ "--d": ".22s" }}>{s.body}</p>
      <div className="tauthor r" style={{ "--d": ".32s" }}>{s.author}</div>
    </div>
  );
}

const KINDS = { cover: Cover, trainer: Trainer, points: Points, stats: Stats, roadmap: Roadmap, section: Section, block: Block, agenda: Agenda, timeline: Timeline, bigstat: BigStat, def: Definition, twocol: TwoCol, model: Model, market: Market, steps: Steps, stepper: Stepper, prob: Prob, neural: Neural, tools: Tools, table: Table, chips: Chips, live: Live, risks: Risks, roi: Roi, statement: Statement, thanks: Thanks };

function Slide({ s, idx }) {
  const Body = KINDS[s.kind] || Points;
  const noFoot = s.kind === "cover";
  return (
    <div className={"slide kind-" + s.kind}>
      <div className="slide-bg"><div className="slide-grid" /><div className="slide-glow" /><div className="slide-glow b" /></div>
      <Body s={s} idx={idx} />
      {!noFoot && <Footer s={s} idx={idx} />}
    </div>
  );
}

/* ============================================================
   DECK
   ============================================================ */
function hashIdx() {
  const n = parseInt((window.location.hash || "").replace("#", ""), 10);
  return (Number.isFinite(n) && n >= 1 && n <= TOTAL) ? n - 1 : 0;
}
function Deck() {
  const [cur, setCur] = useState(hashIdx);
  const [scale, setScale] = useState(1);
  const next = useCallback(() => setCur(c => Math.min(c + 1, TOTAL - 1)), []);
  const prev = useCallback(() => setCur(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);

  // deep-link: #N jumps to slide N (used by the admin preview)
  useEffect(() => {
    const onHash = () => setCur(hashIdx());
    window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === "Home") setCur(0);
      else if (e.key === "End") setCur(TOTAL - 1);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <>
      <Cursor />
      <div className="topbar"><span className="dot" />ALTE · AI მენეჯერებისთვის</div>
      <div className="hint">← → navigate</div>
      <div className="deck">
        <div className="stage" style={{ "--scale": scale }}>
          <Slide key={cur} s={SLIDES[cur]} idx={cur} />
        </div>
      </div>
      <button className="nav-arrow left" onClick={prev} disabled={cur === 0} aria-label="prev">‹</button>
      <button className="nav-arrow right" onClick={next} disabled={cur === TOTAL - 1} aria-label="next">›</button>
      <div className="progress-wrap">
        <span className="progress-count"><b>{String(cur + 1).padStart(2, "0")}</b> / {TOTAL}</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: ((cur + 1) / TOTAL * 100) + "%" }} /></div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Deck />);
