import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#certifications", label: "Certs" },
  { href: "#contact", label: "Contact" },
];

export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);

  const isOpen = !scrolled || hovered;

  // ---- scroll: collapse island after the about section is reached ----
  useEffect(() => {
    const onScroll = () => {
      const aboutSection = rootRef.current?.querySelector("#about");
      const aboutTop = aboutSection?.offsetTop ?? window.innerHeight * 0.9;
      setScrolled(window.scrollY > aboutTop - 120);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ---- scroll reveal ----
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal") ?? [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ---- network topology canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let w, h, points, raf;
    const COUNT = 42;
    const MAX_DIST = 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    }

    function init() {
      resize();
      points = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxD = MAX_DIST * dpr;
          if (dist < maxD) {
            const op = (1 - dist / maxD) * 0.5;
            ctx.strokeStyle = `rgba(139,92,246,${op})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79,107,255,0.85)";
        ctx.shadowColor = "rgba(139,92,246,0.8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(raf);
        init();
        step();
      }, 200);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else step();
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    init();
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        :root{
          --bg:#070a16;
          --surface:#12162f;
          --surface-2:#1a1f42;
          --border:rgba(255,255,255,0.08);
          --border-strong:rgba(255,255,255,0.14);
          --purple:#8b5cf6;
          --purple-soft:rgba(139,92,246,0.35);
          --indigo:#4f6bff;
          --cyan:#22d3ee;
          --text:#edeef7;
          --text-muted:#9498b8;
          --text-dim:#666b8f;
          --success:#34d399;
          --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        *{ margin:0; padding:0; box-sizing:border-box; }
        html{ scroll-behavior:smooth; background:var(--bg); }
        .pf-root{
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          line-height:1.6;
          overflow-x:hidden;
          position:relative;
        }
        .pf-root::before{
          content:"";
          position:fixed;
          inset:0;
          background:
            radial-gradient(ellipse 60% 40% at 15% 0%, rgba(139,92,246,0.14), transparent 60%),
            radial-gradient(ellipse 55% 45% at 90% 15%, rgba(79,107,255,0.12), transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(34,211,238,0.06), transparent 60%);
          pointer-events:none;
          z-index:0;
        }
        ::selection{ background: var(--purple-soft); color:#fff; }
        a{ color:inherit; text-decoration:none; }
        .wrap{ width:min(1500px,96%); max-width:none; margin:0 auto; padding:0; position:relative; z-index:1; }
        section{ position:relative; padding:32px 0; z-index:1; }
        @media (max-width:768px){ section{ padding:24px 0; } }

        .eyebrow{
          display:inline-flex; align-items:center; gap:8px;
          font-family: var(--font-mono); font-size:13px; color: var(--cyan);
          letter-spacing:0.02em; margin-bottom:14px;
        }
        .eyebrow::before{ content:"$"; color: var(--text-dim); }
        .eyebrow .cursor{ display:inline-block; width:7px; height:14px; background: var(--cyan); animation: blink 1.1s steps(1) infinite; }
        @keyframes blink{ 50%{ opacity:0; } }

        h1,h2,h3{ font-family: var(--font-display); font-weight:600; letter-spacing:-0.01em; }
        .section-title{ font-size:clamp(26px,4vw,36px); margin-bottom:10px; }
        .section-sub{ color: var(--text-muted); max-width:560px; margin-bottom:24px; font-size:15px; }

        /* ---- Dynamic Island Nav ---- */
        .island-stage{ position:fixed; top:14px; left:0; right:0; display:flex; justify-content:center; z-index:1000; pointer-events:none; }
        .island{
          pointer-events:auto;
          background: rgba(12,14,32,0.7);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          border:1px solid var(--border);
          border-radius:26px;
          display:flex; align-items:center; height:52px; padding:0 18px; gap:22px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
          transition: width .8s var(--spring), height .7s var(--spring), padding .7s var(--spring), background .4s var(--ease);
          width:min(700px,95vw);
          overflow:hidden; white-space:nowrap;
        }
        .island-brand{ display:flex; align-items:center; gap:9px; flex-shrink:0; }
        .island-brand .dot{ width:8px; height:8px; border-radius:50%; background: var(--success); box-shadow:0 0 8px 1px rgba(52,211,153,0.7); flex-shrink:0; animation: pulse-dot 2.4s ease-in-out infinite; }
        @keyframes pulse-dot{ 0%,100%{ opacity:1; } 50%{ opacity:0.45; } }
        .island-brand .brand-text{ font-family: var(--font-mono); font-size:14px; font-weight:600; color: var(--text); letter-spacing:0.02em; }
        .island-links{ display:flex; align-items:center; gap:16px;
          flex:1;
          justify-content:center; opacity:1; transform:none; transition: opacity .3s var(--ease), transform .3s var(--ease); }
        .island-links a{ font-family: var(--font-mono); font-size:12.5px; color: var(--text-muted); transition: color .2s var(--ease); }
        .island-links a:hover{ color: var(--cyan); }
        .island-cta{ font-family: var(--font-mono); font-size:12.5px; font-weight:600; color:#fff; background: linear-gradient(135deg, var(--purple), var(--indigo)); padding:8px 14px; border-radius:14px; flex-shrink:0; opacity:1; transition: opacity .3s var(--ease); }

        .island.collapsed{ width:112px; height:42px; padding:0 14px; background: rgba(8,10,20,0.5); }
        .island.collapsed .island-links{ opacity:0; pointer-events:none; transform:translateX(6px); width:0; }

        @media (max-width:640px){ .island-links{ gap:12px; } .island-cta{ display:none; } }

        /* ---- Hero ---- */
        .hero{ min-height:100svh; display:flex; align-items:center; padding-top:90px; position:relative; overflow:hidden; }
        #netCanvas{ position:absolute; inset:0; width:100%; height:100%; z-index:0; opacity:0.75; }
        .hero-inner{ position:relative; z-index:2; text-align:center; max-width:860px; margin:0 auto; }
        .hero-status{ font-family: var(--font-mono); font-size:13px; color: var(--text-dim); display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:22px; }
        .hero-status .dot{ width:7px;height:7px;border-radius:50%; background: var(--success); box-shadow:0 0 8px 1px rgba(52,211,153,0.6); }
        .hero h1{ font-size:clamp(34px, 6.4vw, 70px); line-height:1.05; max-width:1100px; margin:0 auto; text-align:center; }
        .hero h1 .accent{ background: linear-gradient(120deg, var(--purple), var(--indigo) 60%, var(--cyan)); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .hero-role{ font-family: var(--font-mono); color: var(--cyan); font-size:clamp(13px,1.7vw,17px); margin-top:16px; text-align:center; }
        .hero-desc{ max-width:640px; color: var(--text-muted); margin:18px auto 0; font-size:16px; text-align:center; }
        .hero-actions{ display:flex; gap:16px; margin-top:30px; flex-wrap:wrap; justify-content:center; }
        .btn{ font-family: var(--font-mono); font-size:14px; font-weight:600; padding:14px 26px; border-radius:14px; display:inline-flex; align-items:center; gap:8px; transition: transform .18s var(--spring), box-shadow .3s var(--ease), background .3s var(--ease); border:1px solid transparent; }
        .btn:active{ transform:scale(0.96); }
        .btn-primary{ background: linear-gradient(135deg, var(--purple), var(--indigo)); color:#fff; box-shadow:0 8px 24px rgba(139,92,246,0.28); }
        .btn-primary:hover{ box-shadow:0 10px 30px rgba(139,92,246,0.42); transform:translateY(-2px); }
        .btn-ghost{ background: rgba(255,255,255,0.03); color: var(--text); border-color: var(--border-strong); }
        .btn-ghost:hover{ background: rgba(255,255,255,0.06); transform:translateY(-2px); }
        .hero-stats{ display:flex; gap:36px; margin-top:44px; flex-wrap:wrap; justify-content:center; }
        .hero-stats .stat-num{ font-family: var(--font-mono); font-size:24px; font-weight:600; color: var(--text); }
        .hero-stats .stat-label{ font-size:12px; color: var(--text-dim); margin-top:4px; }

        .reveal{ opacity:0; transform: translateY(24px); transition: opacity .7s var(--ease), transform .7s var(--ease); }
        .reveal.in-view{ opacity:1; transform:none; }
        @media (prefers-reduced-motion: reduce){ .reveal{ opacity:1; transform:none; transition:none; } }

        .about-grid{ display:grid; grid-template-columns: 1.3fr 1fr; gap:28px; align-items:start; }
        @media (max-width:800px){ .about-grid{ grid-template-columns:1fr; } }
        .about-text{ text-align:left; }
        .about-text p{ color: var(--text-muted); margin-bottom:14px; font-size:15px; text-align:left; }
        .about-text strong{ color: var(--text); font-weight:600; }
        .interest-list{ display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; justify-content:flex-start; }
        .interest-chip{ font-family: var(--font-mono); font-size:12px; color: var(--indigo); background: rgba(79,107,255,0.08); border:1px solid rgba(79,107,255,0.25); padding:7px 12px; border-radius:10px; }
        .about-card{ background: var(--surface); border:1px solid var(--border); border-radius:20px; padding:24px; }
        .about-card .row{ display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); font-size:14px; gap:12px; }
        .about-card .row:last-child{ border-bottom:none; }
        .about-card .row .k{ color: var(--text-dim); font-family: var(--font-mono); font-size:12.5px; white-space:nowrap; }
        .about-card .row .v{ color: var(--text); text-align:right; }

        .skills-grid{ display:grid; grid-template-columns: repeat(2, 1fr); gap:14px; }
        @media (max-width:700px){ .skills-grid{ grid-template-columns:1fr; } }
        .skill-card{ background: var(--surface); border:1px solid var(--border); border-radius:20px; padding:24px; transition: border-color .3s var(--ease), transform .3s var(--ease), background .3s var(--ease); }
        .skill-card:hover{ border-color: var(--purple-soft); transform: translateY(-4px); background: var(--surface-2); }
        .skill-card h3{ font-size:15px; font-family: var(--font-mono); color: var(--cyan); margin-bottom:14px; font-weight:500; }
        .tag-list{ display:flex; flex-wrap:wrap; gap:8px; }
        .tag{ font-size:12.5px; padding:6px 11px; border-radius:8px; background: rgba(255,255,255,0.04); border:1px solid var(--border); color: var(--text-muted); }

        .timeline{ position:relative; padding-left:32px; text-align:left; }
        .timeline::before{ content:""; position:absolute; left:5px; top:6px; bottom:6px; width:1px; background: linear-gradient(var(--purple), var(--indigo), transparent); }
        .tl-item{ position:relative; padding-bottom:34px; text-align:left; }
        .tl-item:last-child{ padding-bottom:0; }
        .tl-item::before{ content:""; position:absolute; left:-32px; top:6px; width:11px; height:11px; border-radius:50%; background: var(--bg); border:2px solid var(--purple); box-shadow:0 0 0 4px rgba(139,92,246,0.12); }
        .tl-head{ display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:6px; text-align:left; }
        .tl-role{ font-family: var(--font-display); font-size:17px; font-weight:600; text-align:left; }
        .tl-org{ color: var(--indigo); font-size:13.5px; margin-top:2px; text-align:left; }
        .tl-date{ font-family: var(--font-mono); font-size:12px; color: var(--text-dim); white-space:nowrap; text-align:left; }
        .tl-desc{ color: var(--text-muted); font-size:14px; margin-top:8px; text-align:left; }
        .tl-desc li{ margin-bottom:6px; margin-left:18px; }

        .projects-grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; }
        @media (max-width:900px){ .projects-grid{ grid-template-columns:1fr 1fr; } }
        @media (max-width:640px){ .projects-grid{ grid-template-columns:1fr; } }
        .project-card{ background: var(--surface); border:1px solid var(--border); border-radius:20px; padding:24px; display:flex; flex-direction:column; height:100%; transition: transform .35s var(--spring), border-color .3s var(--ease); }
        .project-card:hover{ transform: translateY(-6px); border-color: var(--purple-soft); }
        .project-card .p-icon{ font-family: var(--font-mono); font-size:12px; color: var(--cyan); margin-bottom:14px; }
        .project-card h3{ font-size:17px; margin-bottom:8px; }
        .project-card p{ color: var(--text-muted); font-size:14px; flex:1; }
        .project-card .tag-list{ margin-top:16px; }

        .cert-grid{ display:grid; grid-template-columns: repeat(2, 1fr); gap:14px; }
        @media (max-width:700px){ .cert-grid{ grid-template-columns:1fr; } }
        .cert-item{ display:flex; justify-content:space-between; align-items:center; gap:12px; background: var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px 18px; transition: border-color .3s var(--ease); }
        .cert-item:hover{ border-color: var(--border-strong); }
        .cert-name{ font-size:14px; font-weight:500; }
        .cert-issuer{ font-size:12px; color: var(--text-dim); margin-top:3px; }
        .cert-date{ font-family: var(--font-mono); font-size:11px; color: var(--indigo); white-space:nowrap; }

        .edu-list{ display:flex; flex-direction:column; gap:14px; }
        .edu-item{ background: var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px 22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
        .edu-item h3{ font-size:16px; }
        .edu-item .edu-sub{ color: var(--text-muted); font-size:13px; margin-top:4px; }
        .edu-grade{ font-family: var(--font-mono); font-size:12.5px; color: var(--cyan); background: rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.25); padding:6px 12px; border-radius:10px; white-space:nowrap; }

        .contact-box{ background: linear-gradient(155deg, var(--surface), var(--surface-2)); border:1px solid var(--border); border-radius:28px; padding:44px 32px; text-align:center; position:relative; overflow:hidden; }
        .contact-box::before{ content:""; position:absolute; width:340px; height:340px; background: radial-gradient(circle, var(--purple-soft), transparent 70%); top:-140px; right:-100px; filter:blur(10px); }
        .contact-box h2{ font-size:clamp(24px,4vw,34px); position:relative; }
        .contact-box p{ color: var(--text-muted); margin-top:12px; max-width:480px; margin-left:auto; margin-right:auto; position:relative; }
        .contact-actions{ display:flex; justify-content:center; gap:16px; margin-top:28px; flex-wrap:wrap; position:relative; }
        .contact-links{ display:flex; justify-content:center; gap:24px; margin-top:32px; flex-wrap:wrap; position:relative; font-family: var(--font-mono); font-size:13px; color: var(--text-muted); }
        .contact-links a:hover{ color: var(--cyan); }

        footer{ text-align:center; padding:28px 24px 40px; color: var(--text-dim); font-family: var(--font-mono); font-size:12px; position:relative; z-index:1; }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="pf-root">
        <div className="island-stage">
          <nav
            className={`island ${scrolled && !hovered ? "collapsed" : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="island-brand">
              <span className="dot"></span>
              <span className="brand-text">SD</span>
            </div>
            <div className="island-links">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </div>
          </nav>
        </div>

        <section className="hero" id="top">
          <canvas ref={canvasRef} id="netCanvas"></canvas>
          <div className="wrap hero-inner">
            <div className="hero-status">
              <span className="dot"></span>
              whoami: sri_naga_durga_sai_dangeti — status: open_to_work
            </div>
            <h1>Securing systems,<br /><span className="accent">vulnerability</span> at a time.</h1>
            <div className="hero-role">Cybersecurity Graduate · SOC · VAPT · Incident Response</div>
            <p className="hero-desc">
              B.Tech Computer Science &amp; Engineering (Cybersecurity) graduate focused on threat detection,
              network security, and penetration testing — based in Amalapuram, Andhra Pradesh, India.
              I enjoy taking systems apart to understand how they break, then documenting how to keep them
              from breaking again.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">View Projects →</a>
              <a href="Sai_Dangeti_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Download Resume</a>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">2+</div><div className="stat-label">YRS HANDS-ON TRAINING</div></div>
              <div><div className="stat-num">3</div><div className="stat-label">SECURITY PROJECTS</div></div>
              <div><div className="stat-num">6</div><div className="stat-label">CERTIFICATIONS</div></div>
              <div><div className="stat-num">2</div><div className="stat-label">REPORTED VULNERABILITIES</div></div>
            </div>
          </div>
        </section>

        <section id="about">
          <div className="wrap">
            <div className="eyebrow">whoami<span className="cursor"></span></div>
            <h2 className="section-title reveal">About</h2>
            <p className="section-sub reveal">A quick systems check on who's behind the keyboard.</p>
            <div className="about-grid">
              <div className="about-text reveal">
                <p>
                  I'm a <strong>Cybersecurity graduate</strong> with a strong interest in securing digital
                  infrastructure and identifying vulnerabilities before attackers do. I'm passionate about
                  continuous learning and enjoy applying security concepts through hands-on practice, research,
                  and real-world problem solving.
                </p>
                <p>
                  My areas of interest span <strong>Security Operations Center (SOC)</strong> work, threat
                  detection &amp; incident response, vulnerability assessment and penetration testing, network
                  security, identity &amp; access management, cloud security, and digital forensics.
                </p>
                <p>
                  I'm actively seeking opportunities to contribute to cybersecurity teams, sharpen my technical
                  expertise, and help organizations strengthen their security posture while growing as a
                  security professional.
                </p>
                <div className="interest-list">
                  <span className="interest-chip">SOC</span>
                  <span className="interest-chip">Threat Detection</span>
                  <span className="interest-chip">VAPT</span>
                  <span className="interest-chip">Network Security</span>
                  <span className="interest-chip">IAM</span>
                  <span className="interest-chip">Cloud Security</span>
                  <span className="interest-chip">Digital Forensics</span>
                </div>
              </div>
              <div className="about-card reveal">
                <div className="row"><span className="k">LOCATION</span><span className="v">Amalapuram, Andhra Pradesh, IN</span></div>
                <div className="row"><span className="k">DEGREE</span><span className="v">B.Tech CSE (Cybersecurity)</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="wrap">
            <div className="eyebrow">ls ~/skills<span className="cursor"></span></div>
            <h2 className="section-title reveal">Skills</h2>
            <p className="section-sub reveal">Tools and techniques I reach for during assessments and builds.</p>
            <div className="skills-grid">
              <div className="skill-card reveal">
                <h3>Cybersecurity</h3>
                <div className="tag-list">
                  {["Threat Detection","Network Security","VAPT","Web Security","Ethical Hacking","SOC","Incident Response","IAM"].map(t=>(
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="skill-card reveal">
                <h3>Security Tools</h3>
                <div className="tag-list">
                  {["Kali Linux","Nmap","Wireshark","Burp Suite","Git","GitHub"].map(t=>(
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="skill-card reveal">
                <h3>Programming &amp; Web</h3>
                <div className="tag-list">
                  {["Python","HTML","CSS","JavaScript","React.js","Tailwind CSS","SQL"].map(t=>(
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="skill-card reveal">
                <h3>Operating Systems</h3>
                <div className="tag-list">
                  {["Linux","Windows"].map(t=>(
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience">
          <div className="wrap">
            <div className="eyebrow">cat experience.log<span className="cursor"></span></div>
            <h2 className="section-title reveal">Experience</h2>
            <p className="section-sub reveal">Hands-on training and internships that shaped how I approach security.</p>
            <div className="timeline">
              <div className="tl-item reveal">
                <div className="tl-head">
                  <div>
                    <div className="tl-role">Cybersecurity Trainee</div>
                    <div className="tl-org">Cyber Crew · Korangi, Kakinada</div>
                  </div>
                  <div className="tl-date">May 2024 — May 2026</div>
                </div>
                <ul className="tl-desc">
                  <li>Active member of the Cybersecurity Club for over two years, training across OS, networking, web security, and penetration testing.</li>
                  <li>Conducted authorized security assessments on web applications as part of club activities.</li>
                  <li>Identified and responsibly reported an FTP-related security vulnerability on the college website.</li>
                  <li>Discovered and documented an information disclosure vulnerability, improving the application's security posture.</li>
                  <li>Collaborated on VAPT, reconnaissance, and Capture The Flag (CTF) challenges.</li>
                </ul>
              </div>
              <div className="tl-item reveal">
                <div className="tl-head">
                  <div>
                    <div className="tl-role">Cyber Security Intern</div>
                    <div className="tl-org">Edunet Foundation (IBM SkillsBuild × APSSDC)</div>
                  </div>
                  <div className="tl-date">Jun 2024 — Jul 2024</div>
                </div>
                <ul className="tl-desc">
                  <li>Completed a 6-week Cyber Security Internship through IBM SkillsBuild in collaboration with APSSDC.</li>
                  <li>Gained hands-on exposure to Kali Linux, vulnerability assessment, network security, and ethical hacking methodologies.</li>
                  <li>Worked with industry-standard security tools and built foundational penetration testing knowledge.</li>
                </ul>
              </div>
              <div className="tl-item reveal">
                <div className="tl-head">
                  <div>
                    <div className="tl-role">Machine Learning Trainee</div>
                    <div className="tl-org">Tech Leads KIET</div>
                  </div>
                  <div className="tl-date">Aug 2023 — Jul 2024</div>
                </div>
                <ul className="tl-desc">
                  <li>Trained in applied machine learning concepts and workflows as part of a year-long apprenticeship.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="projects">
          <div className="wrap">
            <div className="eyebrow">ls -la ~/projects<span className="cursor"></span></div>
            <h2 className="section-title reveal">Projects</h2>
            <p className="section-sub reveal">Things I've built to put security concepts into practice.</p>
            <div className="projects-grid">
              <div className="project-card reveal">
                <div className="p-icon">[ 001 ]</div>
                <h3>Phishing Email Detector</h3>
                <p>A phishing email detection system built with Python, Flask, and Machine Learning to classify phishing/spam emails and improve email security.</p>
                <div className="tag-list"><span className="tag">Python</span><span className="tag">Flask</span><span className="tag">ML</span></div>
              </div>
              <div className="project-card reveal">
                <div className="p-icon">[ 002 ]</div>
                <h3>Secure Chat Application</h3>
                <p>Contributed to testing, authentication validation, bug reporting, and secure communication analysis in a team-based secure messaging application.</p>
                <div className="tag-list"><span className="tag">Auth Testing</span><span className="tag">Security Review</span></div>
              </div>
              <div className="project-card reveal">
                <div className="p-icon">[ 003 ]</div>
                <h3>Subdomain Finder</h3>
                <p>A reconnaissance tool for discovering subdomains, built to support real-world security assessments.</p>
                <div className="tag-list"><span className="tag">Python</span><span className="tag">Recon</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="certifications">
          <div className="wrap">
            <div className="eyebrow">cat certifications.txt<span className="cursor"></span></div>
            <h2 className="section-title reveal">Certifications</h2>
            <p className="section-sub reveal">Credentials earned along the way.</p>
            <div className="cert-grid">
              {[
                ["Fortinet Network Security Expert Level 1 — Certified Associate","Fortinet","Sep 2024"],
                ["Introduction to the Internet of Things","NPTEL / SWAYAM","May 2025"],
                ["Introduction to Cybersecurity","Great Learning","Sep 2023"],
                ["HTML5 — From Basics to Advanced Level","Udemy","Oct 2023"],
                ["TCS iON Career Edge — Young Professional","TCS iON","Jul 2023"],
                ["Enterprise Design Thinking Practitioner","IBM","Aug 2023"],
              ].map(([name, issuer, date]) => (
                <div className="cert-item reveal" key={name}>
                  <div>
                    <div className="cert-name">{name}</div>
                    <div className="cert-issuer">{issuer}</div>
                  </div>
                  <div className="cert-date">{date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="wrap">
            <div className="contact-box reveal">
              <div className="eyebrow" style={{ justifyContent: "center" }}>contact --init<span className="cursor"></span></div>
              <h2>Let's secure something together.</h2>
              <p>Open to cybersecurity roles — SOC, VAPT, and incident response. Reach out or grab a copy of my resume.</p>
              <div className="contact-actions">
                <a href="mailto:saidangeti2005@gmail.com" className="btn btn-primary">Email Me</a>
                <a href="Sai_Dangeti_Resume.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Download Resume</a>
              </div>
              <div className="contact-links">
                <a href="tel:+916301145439">+91 63011 45439</a>
                <a href="https://www.linkedin.com/in/sri-naga-durga-sai-dangeti-2a7919272/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </section>

        <footer>© 2026 Sri Naga Durga Sai Dangeti · </footer>
      </div>
    </div>
  );
}
