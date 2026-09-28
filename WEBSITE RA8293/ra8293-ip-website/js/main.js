(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasG = !!(window.gsap && window.ScrollTrigger);
  const root = document.documentElement;
  root.classList.add('js');
  if (!hasG) root.classList.remove('js'); // content stays visible if libraries fail to load

  let lenis = null;
  if (hasG) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* ---------- Anchor links ---------- */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  let menuOpen = false;
  function toggleMenu(open) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.firstElementChild.textContent = open ? 'Close' : 'Index';
    const from = 'circle(0px at calc(100% - 60px) 36px)', to = 'circle(150% at calc(100% - 60px) 36px)';
    if (!hasG) { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'none' : from; return; }
    if (open) {
      menu.style.visibility = 'visible';
      gsap.to(menu, { clipPath: to, duration: 0.9, ease: 'power3.inOut' });
      gsap.fromTo('.menu li a', { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.03, delay: 0.25, ease: 'power3.out' });
      lenis && lenis.stop();
    } else {
      gsap.to(menu, { clipPath: from, duration: 0.7, ease: 'power3.inOut', onComplete: () => (menu.style.visibility = 'hidden') });
      lenis && lenis.start();
    }
  }
  menuBtn.addEventListener('click', () => toggleMenu(!menuOpen));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) toggleMenu(false); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    if (menuOpen) toggleMenu(false);
    setTimeout(() => (lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })), menuOpen ? 350 : 0);
  }));

  /* ---------- Interactive components (work even without GSAP) ---------- */
  const swap = (el, html) => {
    el.innerHTML = html;
    hasG && !reduce && gsap.fromTo(el.children, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
  };

  // 03 Ownership
  const own = [
    ['I wrote it on my own time, for myself', 'You', 'Sec. 178.1', 'Copyright belongs to the author of the work. No registration is needed.'],
    ['I’m an employee and coding is my regular job', 'Your employer', 'Sec. 178.3(b)', 'Work created as part of your regularly assigned duties belongs to the employer — unless there is an agreement, express or implied, to the contrary.'],
    ['I’m an employee, but this project is outside my regular duties', 'You', 'Sec. 178.3(a)', 'When creating the work isn’t a regular duty, the copyright stays with the employee — even if company time, facilities and materials were used.'],
    ['A client paid me to build it — with no written agreement', 'You (the creator)', 'Sec. 178.4', 'The client receives the commissioned work, but the copyright stays with the creator unless a written stipulation says otherwise.'],
    ['My contract assigns the copyright to the client', 'The client', 'Sec. 180.2', 'A copyright is not deemed assigned unless there is a written indication of that intention. A signed assignment clause is exactly that.'],
    ['Three of us built it together', 'All co-authors', 'Sec. 178.2', 'Joint authors are co-owners, and without an agreement the rules on co-ownership apply. If each part is separable and its author identifiable, each author owns their own part.']
  ];
  const ownOpts = $('#ownOpts'), ownOut = $('#ownOut');
  own.forEach((o, i) => {
    const b = document.createElement('button');
    b.role = 'tab'; b.textContent = o[0]; b.setAttribute('aria-selected', i === 0);
    b.onclick = () => { $$('button', ownOpts).forEach(x => x.setAttribute('aria-selected', x === b)); showOwn(i); };
    ownOpts.append(b);
  });
  const showOwn = i => swap(ownOut, `<small>Who owns the copyright?</small><h3><em>${own[i][1]}</em></h3><span class="sec-tag">${own[i][2]}</span><p>${own[i][3]}</p>`);
  showOwn(0);

  // 05 AI meter
  const aiRange = $('#aiRange'), aiArc = $('#aiArc');
  const aiStates = [
    [20, 'Little or no human authorship', 'With no identifiable person making creative choices, there is no clear “author” under Sec. 178.1. Ownership of the raw output is doubtful, and you may be unable to stop others copying it.', '#E0603A'],
    [45, 'Mostly machine-made', 'Light edits rarely add original expression. Expect a weak claim — and keep records of exactly what you changed.', '#E0803A'],
    [75, 'Human-directed collaboration', 'Your selection, arrangement and rewriting of AI drafts can be original expression. Your claim rests on those human contributions.', '#E0A93B'],
    [101, 'Human author, AI as a tool', 'Autocomplete and suggestions used like any other tool: you are the author under Sec. 178.1 and the normal rules apply. Still check the licenses of any suggested code.', '#3FB58A']
  ];
  const updateAI = () => {
    const v = +aiRange.value, s = aiStates.find(x => v < x[0]);
    aiArc.style.strokeDashoffset = 100 - v; aiArc.style.stroke = s[3];
    $('#aiPct').textContent = v + '%'; $('#aiHead').textContent = s[1]; $('#aiText').textContent = s[2];
  };
  aiRange.addEventListener('input', updateAI); updateAI();

  // 06 Policy builder
  const clauses = [
    ['Disclose AI use', 'Say which tool was used, and for which part.', '1. DISCLOSURE — State which AI tool was used and for which part of the work.', 1],
    ['Human review', 'A person verifies every suggestion.', '2. REVIEW — A human verifies the correctness, security and license terms of anything AI-suggested before it ships.', 1],
    ['Attribution log', 'Label and log AI-assisted files.', '3. ATTRIBUTION — AI-assisted files are labelled, and significant prompts and edits are logged.', 1],
    ['Data boundaries', 'Keep confidential code out of public tools.', '4. DATA — No confidential, proprietary or personal data is pasted into a public AI tool without authorization.', 0],
    ['Ownership clause', 'Say who owns the edited result.', '5. OWNERSHIP — Rights in the final, human-edited work belong to [AUTHOR / EMPLOYER] under Sec. 178 of RA 8293; AI vendor terms are reviewed first.', 0],
    ['Academic integrity', 'Unreviewed AI output isn’t “your” work.', '6. INTEGRITY — Submitting unreviewed AI output as one’s own work is treated as plagiarism.', 0]
  ];
  const pOpts = $('#policyOpts'), pOut = $('#policyOut'); let shown = new Set();
  clauses.forEach((c, i) => {
    const l = document.createElement('label'); l.className = 'chk';
    l.innerHTML = `<input type="checkbox" ${c[3] ? 'checked' : ''}><span class="box"></span><span><b>${c[0]}</b><small>${c[1]}</small></span>`;
    l.querySelector('input').onchange = renderPolicy; pOpts.append(l);
  });
  function renderPolicy() {
    const on = $$('input', pOpts).map((x, i) => x.checked ? i : -1).filter(i => i >= 0);
    let h = '<span class="ln2" style="animation:none;opacity:.55"># AI USAGE POLICY\n# Based on RA 8293 · Secs. 172 &amp; 178\n</span>';
    on.forEach(i => { h += `<span class="ln2" ${shown.has(i) ? 'style="animation:none"' : ''}>${clauses[i][2]}\n</span>`; });
    if (!on.length) h += '<span class="ln2" style="opacity:.5">(no clauses selected)</span>';
    pOut.innerHTML = h; shown = new Set(on);
  }
  renderPolicy();
  $('#copyPolicy').onclick = e => {
    navigator.clipboard && navigator.clipboard.writeText(pOut.textContent.replace(/&amp;/g, '&'));
    e.target.textContent = 'Copied ✓'; setTimeout(() => (e.target.textContent = 'Copy'), 1600);
  };

  // 07 Vault
  const vault = $('#vault'); let leaked = false;
  $('#secBtn').onclick = e => {
    leaked = !leaked; vault.classList.toggle('open', leaked);
    $('#secMeter').style.transform = `scaleX(${leaked ? 0.03 : 1})`;
    $('#secPct').textContent = 'Protection: ' + (leaked ? '3%' : '100%');
    $('#secHead').textContent = leaked ? 'Secret no more' : 'Locked down';
    $('#secText').textContent = leaked
      ? 'Once the algorithm is public it stops being undisclosed information — and secrecy can’t be switched back on. Copyright in the code text may remain, but the secret’s value is gone.'
      : 'The matching algorithm lives in a private repo, behind NDAs and access controls. As long as it stays confidential, it keeps its value.';
    e.target.textContent = leaked ? 'Reset the demo' : 'Push it to a public repo';
    e.target.classList.toggle('alt', leaked);
  };

  // 08 Fair use
  const factors = [
    ['Purpose & character of the use', 'Commercial copying', 'Teaching / transformative', 75],
    ['Nature of the copyrighted work', 'Highly creative', 'Factual / functional', 55],
    ['Amount & substantiality used', 'Whole work or its “heart”', 'Small snippet', 80],
    ['Effect on the potential market', 'Replaces the original', 'No market harm', 70]
  ];
  const fsWrap = $('#fairSliders');
  factors.forEach((f, i) => {
    const d = document.createElement('div'); d.className = 'fs';
    d.innerHTML = `<label for="f${i}">${f[0]}<span>Sec. 185.1(${'abcd'[i]})</span></label><input type="range" id="f${i}" min="0" max="100" value="${f[3]}"><div class="ends"><span>${f[1]}</span><span>${f[2]}</span></div>`;
    d.querySelector('input').addEventListener('input', updateFair); fsWrap.append(d);
  });
  function updateFair() {
    const v = $$('input', fsWrap).map(x => +x.value), avg = v.reduce((a, b) => a + b, 0) / 4, weak = v.indexOf(Math.min(...v));
    const rot = -90 + avg * 1.8;
    hasG ? gsap.to('#needle', { rotation: rot, svgOrigin: '100 100', duration: 0.8, ease: 'back.out(1.6)' }) : ($('#needle').style.transform = `rotate(${rot}deg)`);
    $('#fairHead').textContent = avg < 35 ? 'Leans infringement' : avg < 62 ? 'A close call' : 'Leans fair use';
    $('#fairText').textContent = `Weakest factor: ${factors[weak][0].toLowerCase()}. A court weighs all four together, so one strong factor rarely decides the case alone.`;
  }
  updateFair();

  // 09 Tabs
  const tabs = [
    ['License', 'Owner keeps ownership, user gets permission', 'Sec. 4.2 · Sec. 150', 'A license lets someone use a work on stated terms — scope, duration, territory, fees. Licensing of computer software is treated as a technology transfer arrangement, except for software developed for the mass market. A trademark license must give the licensor effective quality control, or it is not valid (Sec. 150.1).', ['Check scope, term and territory', 'Open-source licenses are still licenses — with conditions like attribution']],
    ['Assignment', 'Ownership itself changes hands', 'Sec. 180 · Sec. 105 · Sec. 149', 'A copyright may be assigned in whole or in part, but it is not deemed assigned without a written indication of that intention (Sec. 180.2). Patent assignments must be written and notarized (Sec. 105) and recorded at the IPO (Sec. 106); trademark assignments must be written and have no effect on third parties until recorded (Sec. 149).', ['Always in writing', 'Record it with the IPO where the law requires']],
    ['Technology transfer', 'The Code polices unfair licensing terms', 'Secs. 85–92', 'Technology transfer arrangements include licensing all forms of IP. The Code lists clauses treated as prima facie harmful to competition (Sec. 87) — such as fixing resale prices, forcing the licensee to hand over improvements for free, or barring the licensee from contesting the patents — and requires others (Sec. 88): Philippine law governs, continued access to improvements, and Philippine taxes borne by the licensor. Non-conforming arrangements are unenforceable (Sec. 92).', ['Prohibited: Sec. 87', 'Mandatory: Sec. 88', 'Exceptions: Sec. 91']],
    ['Employment & commission', 'Who owns what the worker makes', 'Sec. 178.3–.4 · Sec. 30', 'For copyright, an employer owns work created within the employee’s regular duties, while a client who commissions a work gets the work but not the copyright unless it is stipulated in writing. Patents differ: the commissioner owns the patent unless the contract says otherwise (Sec. 30.1). Compare the rules before you sign.', ['Copyright: creator keeps it by default (commission)', 'Patent: commissioner owns it by default']],
    ['NDA', 'A promise to keep information secret', 'Sec. 4.1(g)', 'Sec. 4.1(g) lists “protection of undisclosed information” as an IP right. A non-disclosure agreement is the practical tool that keeps information undisclosed: it defines what is confidential, for how long, and what happens if it leaks.', ['Define “confidential” precisely', 'Set a duration and return-or-destroy duties', 'Carve out information that is already public']]
  ];
  const tl = $('#tabList'), tb = $('#tabBody');
  tabs.forEach((t, i) => {
    const b = document.createElement('button'); b.role = 'tab'; b.textContent = t[0]; b.setAttribute('aria-selected', i === 0);
    b.onclick = () => { $$('button', tl).forEach(x => x.setAttribute('aria-selected', x === b)); showTab(i); }; tl.append(b);
  });
  const showTab = i => { const t = tabs[i]; swap(tb, `<h3>${t[1]}</h3><span class="sec-tag">${t[2]}</span><p style="margin-top:12px">${t[3]}</p><ul>${t[4].map(x => `<li>${x}</li>`).join('')}</ul>`); };
  showTab(0);

  // 10 Venn
  const venn = [
    ['Copy a licensed library into my app, keep the credit, ignore the license terms', 'copy', 'Copyright infringement only', 'You credited the author, so this isn’t plagiarism — but using protected code beyond the license reproduces it without permission (Sec. 177).'],
    ['Paste sentences from RA 8293 into my report as if I wrote them', 'plag', 'Plagiarism only', 'The official text of laws is not protected by copyright (Sec. 175), so there’s no infringement. Presenting it as your own writing is still dishonest.'],
    ['Submit a copied proprietary codebase as my own thesis', 'both', 'Both', 'Reproducing protected code without permission is infringement, and claiming it as yours is plagiarism.'],
    ['Write my own code from scratch, citing a tutorial for the idea', 'neither', 'Neither', 'Ideas and methods are free for everyone (Sec. 175). You added original expression and credited your source.']
  ];
  const vs = $('#vennSvg'), vc = $('#vennChips'), vo = $('#vennOut');
  venn.forEach((v, i) => {
    const b = document.createElement('button'); b.textContent = v[0]; b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      $$('button', vc).forEach(x => x.setAttribute('aria-pressed', x === b));
      vs.setAttribute('class', 'r-' + v[1]); swap(vo, `<b>${v[2]}</b><p>${v[3]}</p>`);
    }; vc.append(b);
  });
  vo.innerHTML = '<p style="opacity:.6">Pick an example above.</p>';

  // 12 Flip cards
  const cases = [
    ['A student copies a GitHub repo into a thesis project — no credit, no license check.', 'Both', 'Passing it off is plagiarism; reproducing it without permission likely infringes (Sec. 177). A short quotation with acknowledgment is allowed (Sec. 184.1[b]).'],
    ['A developer leaves a company and reuses its proprietary ranking algorithm at a competitor.', 'Undisclosed information', 'Sec. 4.1(g) protects undisclosed information, and an NDA makes it enforceable. Code written within regular duties also belongs to the employer (Sec. 178.3[b]).'],
    ['A freelancer builds a shop’s website with no contract. Who owns the copyright?', 'The freelancer', 'Sec. 178.4: the client gets the work, but copyright stays with the creator unless a written stipulation says otherwise. Get an assignment in writing (Sec. 180.2).'],
    ['A team ships an AI-generated module after light edits.', 'Unsettled', 'The Code doesn’t address AI authorship. Secs. 172.1 and 178.1 assume a human author, so the claim depends on human creative contribution. Disclose the tool and follow your AI usage agreement.'],
    ['A student installs one paid IDE license on five classmates’ laptops.', 'Infringement', 'Reproduction and distribution are exclusive rights of the owner (Sec. 177). Being a student isn’t a defense — full copies rarely qualify as fair use under Sec. 185.']
  ];
  const fl = $('#flips');
  cases.forEach((c, i) => {
    const b = document.createElement('button'); b.className = 'flip'; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<div class="flip-in"><div class="face front"><span class="tag2">Scenario 0${i + 1}</span><h3>${c[0]}</h3><p></p><span class="hint">Tap to reveal the verdict ↻</span></div><div class="face back"><span class="tag2">Verdict</span><h3>${c[1]}</h3><p>${c[2]}</p><span class="hint">Tap to flip back ↻</span></div></div>`;
    b.onclick = () => { b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); }; fl.append(b);
  });

  /* ---------- Everything below needs GSAP ---------- */
  if (!hasG) return;

  // Cursor + magnetic
  if (fine && !reduce) {
    const cur = $('#cursor'), qx = gsap.quickTo(cur, 'x', { duration: 0.25 }), qy = gsap.quickTo(cur, 'y', { duration: 0.25 });
    addEventListener('mousemove', e => { cur.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,label,input')));
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3 }); });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' }));
    });
    if (window.VanillaTilt) VanillaTilt.init($$('.tilt'), { max: 9, speed: 500, glare: true, 'max-glare': 0.16, scale: 1.02 });
  }

  // Progress + current section label
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => ($('#progress').style.transform = `scaleX(${s.progress})`) });
  $$('[data-label]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => s.isActive && ($('#now').textContent = sec.dataset.label) }));

  // Hero intro
  $$('.hero-title .ln').forEach(l => (l.innerHTML = `<span class="in" style="display:block">${l.innerHTML}</span>`));
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
  intro.from('.hero-title .in', { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.15 })
    .from('.kicker', { opacity: 0, y: 16, duration: 0.8 }, 0.1)
    .from('.hero-sub,.hero-meta span,.cta', { opacity: 0, y: 24, duration: 1, stagger: 0.08 }, 0.55)
    .from('.stats > div', { opacity: 0, y: 30, duration: 1, stagger: 0.1 }, 0.8);
  $$('[data-count]').forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.count, duration: 1.8, delay: 1, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) }); });
  if (fine && !reduce) $('.hero').addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    $$('.aurora i').forEach((b, i) => gsap.to(b, { x: x * (60 + i * 40), y: y * (60 + i * 30), duration: 1.6, overwrite: 'auto' }));
  });
  gsap.to('.hero-in', { yPercent: 12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Heading split reveal
  let splits = [];
  const buildSplits = () => {
    splits.forEach(s => { s.st.kill(); s.sp.revert(); });
    splits = $$('[data-split]').map(h => {
      const sp = new SplitType(h, { types: 'lines,words' });
      const t = gsap.from(sp.words, { yPercent: 115, rotate: 3, duration: 1.1, stagger: 0.06, ease: 'expo.out', paused: true });
      const st = ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => t.play() });
      return { sp, st };
    });
  };
  let lastW = innerWidth;
  document.fonts.ready.then(() => { buildSplits(); ScrollTrigger.refresh(); });
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; clearTimeout(buildSplits.t); buildSplits.t = setTimeout(() => { buildSplits(); ScrollTrigger.refresh(); }, 250); } });

  // Generic reveals
  ScrollTrigger.batch('.reveal', { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }) });

  // Horizontal scroll on desktop
  gsap.matchMedia().add('(min-width: 961px)', () => {
    const track = $('.hs-track');
    gsap.to(track, {
      x: () => -(track.scrollWidth - innerWidth), ease: 'none',
      scrollTrigger: { trigger: '#rights', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 10 }
    });
    gsap.from('.hs .card', { opacity: 0, y: 60, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#rights', start: 'top 60%' } });
  });
  gsap.matchMedia().add('(max-width: 960px)', () => {
    gsap.from('.hs .card', { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.hs-track', start: 'top 85%' } });
  });

  // Other scroll animations
  gsap.from('.parts li', { x: 60, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.parts', start: 'top 80%' } });
  gsap.from('.diff pre span', { opacity: 0, x: -24, stagger: 0.12, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.diff', start: 'top 75%' } });
  gsap.from('#vennSvg circle', { scale: 0.3, opacity: 0, duration: 1.1, stagger: 0.2, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#vennSvg', start: 'top 80%' } });
  gsap.from('.timeline li', { x: -40, opacity: 0, stagger: 0.25, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.timeline', start: 'top 75%' } });
  ScrollTrigger.create({ trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: s => $('#timeline').style.setProperty('--p', s.progress) });
  gsap.from('.flip', { y: 60, opacity: 0, rotate: 2, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '#flips', start: 'top 82%' } });

  // 00 Code rain
  const cv = $('#rain');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'), G = ['§', '©', '{', '}', '0', '1', '/', '*', ';', '8', '2', '9', '3', '<', '>'];
    let w, h, cols, drops, fs, visible = true, last = 0;
    const size = () => { const d = Math.min(devicePixelRatio, 2); cv.width = w = cv.offsetWidth * d; cv.height = h = cv.offsetHeight * d; fs = 17 * d; cols = Math.floor(w / (fs * 1.7)); drops = Array.from({ length: cols }, () => Math.random() * -60); ctx.font = `${fs}px "JetBrains Mono",monospace`; };
    size(); addEventListener('resize', size);
    new IntersectionObserver(e => (visible = e[0].isIntersecting)).observe(cv);
    gsap.ticker.add(t => {
      if (!visible || t - last < 0.05) return; last = t;
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      drops.forEach((y, i) => {
        const g = G[(Math.random() * G.length) | 0];
        ctx.fillStyle = g === '§' ? '#E0A93B' : Math.random() > 0.93 ? '#F4EFE2' : 'rgba(224,169,59,.55)';
        ctx.fillText(g, i * fs * 1.7, y * fs);
        drops[i] = y * fs > h && Math.random() > 0.975 ? Math.random() * -20 : y + 1;
      });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
