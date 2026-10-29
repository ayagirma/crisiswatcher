/* ════════════════════════════════════════════════════════════════════
   App code for Ethiopia Crisis Watch.
   Interactive SPA with regional map, multi-country letter builder,
   dark/light theme, Amharic/English i18n, and verified crisis reporting.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var main = $("#main");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem("ecw:" + k)); localStorage.setItem("ecw:" + k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ── Theme management ────────────────────────────── */
  var currentTheme = store("theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);

  function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    store("theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
    toast(currentTheme === "dark" ? "Dark mode enabled" : "Light mode enabled");
  }

  /* ── Language management ─────────────────────────── */
  var currentLang = store("lang") || "en";
  function t(k) { return (CONTENT.i18n && CONTENT.i18n[currentLang] && CONTENT.i18n[currentLang][k]) || k; }

  function applyLang() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var text = t(k);
      if (text) el.textContent = text;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      var text = t(k);
      if (text) el.setAttribute("placeholder", text);
    });
    document.querySelectorAll(".lang-text").forEach(function (el) {
      el.textContent = currentLang === "en" ? "አማ" : "EN";
    });
    var btn = $("#lang-toggle");
    if (btn) btn.setAttribute("aria-label", currentLang === "en" ? "Switch language to Amharic" : "ቋንቋ ወደ እንግሊዝኛ ቀይር");
    var footUp = $("#foot-updated");
    if (footUp && CONTENT.posts && CONTENT.posts.length) {
      footUp.textContent = t("lastUpdated") + " " + (currentLang === "am" ? eDate(CONTENT.posts[0].date) : gDate(CONTENT.posts[0].date));
    }
  }

  function toggleLang() {
    currentLang = currentLang === "en" ? "am" : "en";
    store("lang", currentLang);
    applyLang();
    route();
    toast(currentLang === "am" ? "ቋንቋ ወደ አማርኛ ተቀይሯል" : "Language set to English");
  }

  /* Dates in both calendars, the way the diaspora reads them. */
  var ET_MONTHS = ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miazia","Ginbot","Sene","Hamle","Nehase","Pagume"];
  var ET_MONTHS_AM = ["መስከረም","ጥቅምት","ኅዳር","ታህሳስ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];
  function parseDay(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toEthiopic(d) {
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    var jdn = day + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
    var mod = function (x, n) { return ((x % n) + n) % n; };
    var r = mod(jdn - 1723856, 1461), n = mod(r, 365) + 365 * Math.floor(r / 1460);
    return { y: 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460), m: Math.floor(n / 30) + 1, d: mod(n, 30) + 1 };
  }
  function gDate(s) { return parseDay(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function eDate(s) {
    var e = toEthiopic(parseDay(s));
    if (currentLang === "am") return ET_MONTHS_AM[e.m - 1] + " " + e.d + " ቀን " + e.y + " ዓ.ም.";
    return ET_MONTHS[e.m - 1] + " " + e.d + ", " + e.y + " E.C.";
  }
  function relDay(s) {
    var d = Math.round((new Date().setHours(0,0,0,0) - parseDay(s)) / 864e5);
    if (d <= 0) return t("today");
    if (d === 1) return t("yesterday");
    if (d < 7) return currentLang === "am" ? (d + " " + t("daysAgo")) : (d + " days ago");
    return currentLang === "am" ? eDate(s) : gDate(s);
  }
  function usd(n) { return "$" + Math.round(n || 0).toLocaleString("en-US"); }
  function pct(c) {
    if (!c || !c.goal || c.goal <= 0) return 0;
    return Math.min(100, Math.round(((c.raised || 0) / c.goal) * 100));
  }
  function donateUrl(c) { return c.gofundmeUrl; }
  function pageUrl(hash) { var base = CONFIG.siteUrl || (location.href.split("#")[0]); return base + (hash ? "#" + hash : ""); }

  var ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM7 10l4-7a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1zM17 14l-4 7a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 6.4 3H17"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    arrowL: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  function rName(r) {
    if (currentLang === "am" && CONTENT.regionsAm && CONTENT.regionsAm[r]) return CONTENT.regionsAm[r];
    return r;
  }

  function typeLabel(type) {
    var map = {
      breaking: t("breaking"),
      update: t("update"),
      action: t("actionTag"),
      account: t("account")
    };
    return map[type] || type;
  }

  function sampleTag(x) { return x.sample ? ' <span class="tag sample" title="Sample content.">Sample</span>' : ""; }

  function statusBadge(p) {
    if (p.status === "developing") return '<span class="developing">' + t("developing") + '</span>';
    var n = (p.sources || []).length;
    var srcText = "";
    if (n) {
      srcText = currentLang === "am" ? " · " + n + " ምንጭ" : " · " + n + " source" + (n > 1 ? "s" : "");
    }
    return '<span class="verified">' + ICON.check + t("verified") + srcText + "</span>";
  }

  /* ── components ─────────────────────────────────── */
  function postCard(p) {
    var title = (currentLang === "am" && p.titleAm) ? p.titleAm : p.title;
    var summary = (currentLang === "am" && p.summaryAm) ? p.summaryAm : p.summary;
    var reg = rName(p.region);
    return '<a class="card post-card" href="#post-' + esc(p.id) + '">' +
      '<div class="row" style="--gap:.4rem"><span class="tag ' + p.type + '">' + typeLabel(p.type) + "</span>" + sampleTag(p) + "</div>" +
      "<h3>" + esc(title) + "</h3>" +
      '<p class="sum">' + esc(summary) + "</p>" +
      '<div class="meta" style="margin-top:auto"><span>' + esc(reg) + '</span><span class="dot">' + relDay(p.date) + '</span><span class="dot">' + statusBadge(p) + "</span></div></a>";
  }

  function progressBlock(c, big) {
    if (!c || !c.goal || c.goal <= 0) return "";
    var p = pct(c);
    var raisedText = currentLang === "am"
      ? (usd(c.raised || 0) + " " + t("raisedOf") + " " + usd(c.goal) + " " + t("goal"))
      : (t("raisedOf") + " " + usd(c.goal) + " " + t("goal"));
    var dateFormatted = c.asOf ? (currentLang === "am" ? eDate(c.asOf) : gDate(c.asOf)) : "";
    return '<div class="stack" style="--gap:.6rem">' +
      '<div class="money"><b' + (big ? "" : ' style="font-size:1.3rem"') + ">" + usd(c.raised || 0) + '</b><span class="muted">' + raisedText + "</span></div>" +
      '<div class="progress" role="progressbar" aria-label="Amount raised" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '"><i style="--p:' + p + '%"></i></div>' +
      '<div class="meta"><span><b style="color:var(--ink)">' + p + "%</b> " + t("funded") + "</span>" +
      (c.donors ? ('<span class="dot">' + c.donors.toLocaleString("en-US") + " " + t("donors") + "</span>") : "") +
      (dateFormatted ? ('<span class="dot">' + t("asOf") + " " + dateFormatted + "</span>") : "") +
      "</div></div>";
  }

  function gfmButton(c, cls) {
    return '<a class="btn primary ' + (cls || "") + '" href="' + esc(donateUrl(c)) + '" target="_blank" rel="noopener" data-donate="' + esc(c.id) + '">' + t("donateGfm") + " " + ICON.ext + "</a>";
  }

  function shareBar(hash, text) {
    var url = pageUrl(hash), u = encodeURIComponent(url), tStr = encodeURIComponent(text);
    return '<div class="share" aria-label="Share">' +
      '<button class="btn sm" data-copy="' + esc(url) + '">' + ICON.link + t("copyLink") + "</button>" +
      '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + tStr + "%20" + u + '">WhatsApp</a>' +
      '<a class="btn sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + u + "&text=" + tStr + '">Telegram</a>' +
      '<a class="btn sm" target="_blank" rel="noopener" href="https://x.com/intent/post?text=' + tStr + "&url=" + u + '">X</a>' +
      '<a class="btn sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>' +
      "</div>";
  }

  function featured() { return CONTENT.campaigns.filter(function (c) { return c.featured; })[0] || CONTENT.campaigns[0]; }

  /* ── Interactive SVG Map of Ethiopia ─────────────── */
  var mapSelectedRegion = "Amhara";

  var REGION_STATUSES_I18N = {
    en: {
      Amhara: { status: "Active Conflict Zone · Airstrikes Documented", tone: "critical" },
      Arsi: { status: "Targeted Village Raids · High Civilian Displacement", tone: "critical" },
      Oromia: { status: "Humanitarian Access Strained · Road Closures", tone: "warning" },
      Tigray: { status: "Post-War Protracted IDP Stagnation", tone: "warning" },
      Afar: { status: "Post-Conflict Recovery & Drought Pressure", tone: "normal" },
      Somali: { status: "Severe Drought & Lowland Displacement", tone: "normal" },
      "Benishangul-Gumuz": { status: "Inter-Communal Tensions · Land Rights Disputes", tone: "warning" }
    },
    am: {
      Amhara: { status: "የግጭት ቀጣና · የአየር ጥቃቶች የተዘገቡበት", tone: "critical" },
      Arsi: { status: "በመንደሮች ላይ ያነጣጠሩ ጥቃቶች · ከፍተኛ የህዝብ መፈናቀል", tone: "critical" },
      Oromia: { status: "የእርዳታ መተላለፊያ መንገዶች መዘጋት · ውጥረት", tone: "warning" },
      Tigray: { status: "የተፈናቃዮች ወደ ቀያቸው መመለስ መጓተት", tone: "warning" },
      Afar: { status: "ከጦርነት ማገገም እና የድርቅ ጫና", tone: "normal" },
      Somali: { status: "ከፍተኛ ድርቅ እና የቆላማ አካባቢ መፈናቀል", tone: "normal" },
      "Benishangul-Gumuz": { status: "የማህበረሰቦች ውጥረት · የመሬት ይገባኛል ውዝግብ", tone: "warning" }
    }
  };

  function renderMapComponent(currentSelected) {
    var reg = currentSelected || mapSelectedRegion;
    var info = (CONTENT.regionsInfo || []).filter(function (r) { return r.name === reg; })[0] || { name: reg, text: "Regional situation monitoring active." };
    var regName = rName(reg);
    var regText = (currentLang === "am" && info.textAm) ? info.textAm : info.text;
    var postCount = (CONTENT.posts || []).filter(function (p) { return p.region === reg; }).length;
    var stList = REGION_STATUSES_I18N[currentLang] || REGION_STATUSES_I18N.en;
    var st = stList[reg] || { status: (currentLang === "am" ? "ክትትል በመካሄድ ላይ" : "Monitoring Active"), tone: "normal" };

    var l_tigray = currentLang === "am" ? "ትግራይ" : "Tigray";
    var l_afar = currentLang === "am" ? "አፋር" : "Afar";
    var l_amhara = currentLang === "am" ? "አማራ" : "Amhara";
    var l_bgumuz = currentLang === "am" ? "ቤ-ጉሙዝ" : "B-Gumuz";
    var l_oromia = currentLang === "am" ? "ኦሮሚያ" : "Oromia";
    var l_arsi = currentLang === "am" ? "አርሲ" : "Arsi";
    var l_somali = currentLang === "am" ? "ሶማሌ" : "Somali";
    var l_gambela = currentLang === "am" ? "ጋምቤላ" : "Gambela";
    var l_south = currentLang === "am" ? "ደቡብ / ሲዳማ" : "South / Sidama";
    var l_addis = currentLang === "am" ? "አዲስ አበባ" : "Addis Ababa";

    return '<div class="map-container" id="crisis-map">' +
      '<div class="map-svg-wrap">' +
        '<svg class="et-map-svg" viewBox="0 0 520 420" role="img" aria-label="' + (currentLang === "am" ? "የኢትዮጵያ ክልሎች ካርታ" : "Interactive Map of Ethiopia Regions") + '">' +
          '<defs>' +
            '<filter id="glow" x="-10%" y="-10%" width="120%" height="120%">' +
              '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(30,107,52,0.4)"/>' +
            '</filter>' +
          '</defs>' +
          /* Tigray */
          '<path class="et-region' + (reg === "Tigray" ? " active" : "") + '" data-map-region="Tigray" role="button" tabindex="0" aria-label="Tigray Region" d="M 190,40 L 265,30 L 285,85 L 210,100 L 175,70 Z" />' +
          '<text class="et-label" x="230" y="65">' + l_tigray + '</text>' +
          /* Afar */
          '<path class="et-region' + (reg === "Afar" ? " active" : "") + '" data-map-region="Afar" role="button" tabindex="0" aria-label="Afar Region" d="M 265,30 L 325,75 L 345,170 L 285,185 L 285,85 Z" />' +
          '<text class="et-label" x="300" y="115">' + l_afar + '</text>' +
          /* Amhara */
          '<path class="et-region' + (reg === "Amhara" ? " active" : "") + '" data-map-region="Amhara" role="button" tabindex="0" aria-label="Amhara Region" d="M 125,75 L 175,70 L 210,100 L 285,85 L 285,185 L 220,200 L 165,185 L 120,120 Z" />' +
          '<text class="et-label" x="195" y="135">' + l_amhara + '</text>' +
          /* Benishangul-Gumuz */
          '<path class="et-region' + (reg === "Benishangul-Gumuz" ? " active" : "") + '" data-map-region="Benishangul-Gumuz" role="button" tabindex="0" aria-label="Benishangul-Gumuz Region" d="M 90,135 L 125,120 L 160,190 L 105,215 L 75,170 Z" />' +
          '<text class="et-label" x="110" y="170" style="font-size:9px">' + l_bgumuz + '</text>' +
          /* Oromia (main body) */
          '<path class="et-region' + (reg === "Oromia" ? " active" : "") + '" data-map-region="Oromia" role="button" tabindex="0" aria-label="Oromia Region" d="M 160,190 L 220,200 L 285,185 L 335,205 L 375,215 L 350,285 L 290,360 L 220,380 L 175,340 L 160,250 Z" />' +
          '<text class="et-label" x="235" y="270">' + l_oromia + '</text>' +
          /* Arsi Zone (highlighted zone in central Oromia) */
          '<path class="et-region' + (reg === "Arsi" ? " active" : "") + '" data-map-region="Arsi" role="button" tabindex="0" aria-label="Arsi Zone" d="M 235,230 L 275,225 L 285,265 L 245,270 Z" style="stroke-dasharray:3,2;fill:var(--gold-soft);stroke:var(--gold);" />' +
          '<text class="et-label" x="260" y="250" style="font-size:10px;font-weight:700;fill:var(--gold)">' + l_arsi + '</text>' +
          /* Somali */
          '<path class="et-region' + (reg === "Somali" ? " active" : "") + '" data-map-region="Somali" role="button" tabindex="0" aria-label="Somali Region" d="M 335,205 L 440,210 L 490,275 L 445,365 L 350,345 L 350,285 L 375,215 Z" />' +
          '<text class="et-label" x="405" y="280">' + l_somali + '</text>' +
          /* Gambela */
          '<path class="et-region' + (reg === "Gambela" ? " active" : "") + '" data-map-region="Gambela" role="button" tabindex="0" aria-label="Gambela Region" d="M 75,215 L 120,225 L 135,280 L 70,270 Z" />' +
          '<text class="et-label" x="98" y="250" style="font-size:9px">' + l_gambela + '</text>' +
          /* Sidama & South Ethiopia */
          '<path class="et-region' + (reg === "Sidama" ? " active" : "") + '" data-map-region="Sidama" role="button" tabindex="0" aria-label="Southern Regions" d="M 175,280 L 220,285 L 210,355 L 155,335 Z" />' +
          '<text class="et-label" x="185" y="310" style="font-size:9px">' + l_south + '</text>' +
          /* Addis Ababa Marker */
          '<circle cx="225" cy="205" r="5" fill="var(--flag-r)" stroke="var(--surface)" stroke-width="2" />' +
          '<text class="et-label" x="225" y="195" style="font-size:9px;font-weight:700">' + l_addis + '</text>' +
        '</svg>' +
      '</div>' +
      '<div class="map-info-card" id="map-info-panel">' +
        '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
          '<div>' +
            '<span class="eyebrow">' + t("regionalFocus") + '</span>' +
            '<h3 style="font-size:1.5rem;margin-top:.2rem">' + esc(regName) + '</h3>' +
          '</div>' +
          '<span class="map-status-pill ' + esc(st.tone) + '">' + esc(st.status) + '</span>' +
        '</div>' +
        '<p class="prose small" style="margin-top:.2rem">' + esc(regText) + '</p>' +
        '<div class="row" style="margin-top:auto;justify-content:space-between">' +
          '<span class="small muted"><b>' + postCount + '</b> ' + t("verifiedUpdates") + (currentLang === "am" ? "" : (postCount === 1 ? "" : "s")) + '</span>' +
          '<a class="btn primary sm" href="#news" data-go-region="' + esc(reg) + '">' + (currentLang === "am" ? ('የ' + regName + ' ዜና ብቻ አሳይ →') : ('Filter news for ' + esc(info.name) + ' →')) + '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── views ──────────────────────────────────────── */
  var VIEWS = {};

  VIEWS.home = function () {
    var c = featured(), latest = CONTENT.posts.slice(0, 3), last = CONTENT.posts[0], pet = CONTENT.petitions[0];
    var cTitle = c ? ((currentLang === "am" && c.titleAm) ? c.titleAm : c.title) : "";
    var cSummary = c ? ((currentLang === "am" && c.summaryAm) ? c.summaryAm : c.summary) : "";
    var petTitle = pet ? ((currentLang === "am" && pet.titleAm) ? pet.titleAm : pet.title) : "";
    var petText = pet ? ((currentLang === "am" && pet.textAm) ? pet.textAm : pet.text) : "";
    var counts = [
      [CONTENT.posts.length, t("updatesCountMonth")],
      [CONTENT.petitions.length, t("openPetitionsCount")],
      [CONTENT.campaigns.length, t("activeFundraisersCount")]
    ].filter(function (m) { return m[0]; });

    var dateHeader = "";
    if (last) {
      dateHeader = currentLang === "am"
        ? (t("lastUpdated") + " " + eDate(last.date) + " · <span>" + gDate(last.date) + "</span>")
        : ("Updated " + gDate(last.date) + " · <span>" + eDate(last.date) + "</span>");
    }

    return '<section class="hero"><div class="wrap hero-inner">' +
      "<div>" +
        (last ? '<p class="eyebrow">' + dateHeader + "</p>" : "") +
        '<h1 style="margin-top:.75rem">' + t("heroTitle") + '</h1>' +
        '<p class="lede">' + t("heroLede") + '</p>' +
        '<div class="row ctas">' +
          (pet ? '<a class="btn primary lg" href="#action">' + t("signPetition") + '</a>' : '<a class="btn primary lg" href="#letter">' + t("writeCongress") + '</a>') +
          (c ? '<a class="btn lg" href="#donate">' + t("donateNow") + '</a>' : "") +
          '<a class="btn ghost lg" href="#learn">' + t("learnHistory") + '</a>' +
        '</div>' +
        (counts.length ? '<div class="hero-meta">' + counts.map(function (m) { return "<span><b>" + m[0] + "</b> " + m[1] + "</span>"; }).join("") + "</div>" : "") +
      "</div>" +
      (c ? '<aside class="card donate-box stack" aria-label="Active fundraiser">' +
        '<div class="row" style="justify-content:space-between"><span class="eyebrow">' + t("activeFundraiser") + '</span>' + sampleTag(c) + "</div>" +
        '<h2 style="font-size:1.4rem">' + esc(cTitle) + "</h2>" +
        (!c.goal && cSummary ? '<p class="muted small">' + esc(cSummary) + "</p>" : "") +
        progressBlock(c) +
        gfmButton(c, "block lg") +
        '<a class="btn ghost block" href="#donate">' + t("whereMoneyGoes") + '</a>' +
      "</aside>" :
      '<aside class="card donate-box stack" aria-label="Take action">' +
        '<span class="eyebrow">' + t("takeNextStep") + '</span>' +
        '<h2 style="font-size:1.4rem">' + t("writeYourRep") + '</h2>' +
        '<p class="muted small">' + t("letterJurisdiction") + '</p>' +
        '<a class="btn primary block lg" href="#letter">' + t("copyLetter") + '</a>' +
        '<a class="btn ghost block" href="#blog">' + t("blog") + '</a>' +
      "</aside>") +
    "</div></section>" +

    /* Interactive Map Section */
    '<section class="section"><div class="wrap stack">' +
      '<div class="section-head"><div><h2>' + t("mapTitle") + '</h2><p class="muted small">' + t("mapSub") + '</p></div><a href="#news">' + t("viewAllReports") + ' →</a></div>' +
      renderMapComponent(mapSelectedRegion) +
    '</div></section>' +

    (latest.length ? '<section class="section"><div class="wrap">' +
      '<div class="section-head"><h2>' + t("latestVerified") + '</h2><a href="#news">' + t("viewAllReports") + ' (' + CONTENT.posts.length + ') →</a></div>' +
      '<div class="grid">' + latest.map(postCard).join("") + "</div>" +
    "</div></section>" : "") +

    '<section class="section"><div class="wrap">' +
      '<div class="section-head"><h2>' + t("actFiveMin") + '</h2></div>' +
      '<div class="grid">' +
        (pet ? '<div class="panel stack" style="--gap:.6rem"><span class="eyebrow">' + t("actionTag") + '</span><h3>' + esc(petTitle) + '</h3><p class="muted small">' + esc(petText) + '</p><a class="btn primary" style="margin-top:auto" href="#action">' + t("signPetition") + '</a></div>' : "") +
        '<div class="panel stack" style="--gap:.6rem"><span class="eyebrow">' + t("writeYourRep") + '</span><h3>' + (currentLang === "am" ? "የህዝብ ተወካይ ደብዳቤ ቅጽ" : "Constituent letter template") + '</h3><p class="muted small">' + t("step2Desc") + '</p><a class="btn" style="margin-top:auto" href="#letter">' + (currentLang === "am" ? "ደብዳቤዬን አዘጋጅ" : "Write my letter") + '</a></div>' +
        '<div class="panel stack" style="--gap:.6rem"><span class="eyebrow">' + (currentLang === "am" ? "አጋራ" : "Share") + '</span><h3>' + t("tellThree") + '</h3><p class="muted small">' + t("tellThreeSub") + '</p><button class="btn" style="margin-top:auto" data-copy="' + esc(pageUrl("")) + '">' + ICON.link + t("copySiteLink") + '</button></div>' +
      "</div>" +
    "</div></section>" +

    '<section class="section"><div class="wrap">' +
      '<div class="section-head"><h2>' + t("howWeVerify") + '</h2></div>' +
      '<div class="trust">' +
        "<div>" + ICON.check + "<div><h3>" + t("trust1Title") + "</h3><p>" + t("trust1Text") + "</p></div></div>" +
        "<div>" + ICON.shield + "<div><h3>" + t("trust2Title") + "</h3><p>" + t("trust2Text") + "</p></div></div>" +
        "<div>" + ICON.lock + "<div><h3>" + t("trust3Title") + "</h3><p>" + t("trust3Text") + "</p></div></div>" +
      "</div>" +
    "</div></section>";
  };

  var newsState = { region: store("region") || "All", q: "" };
  VIEWS.news = function () {
    var counts = { All: CONTENT.posts.length };
    CONTENT.posts.forEach(function (p) { counts[p.region] = (counts[p.region] || 0) + 1; });
    var tabs = ["All"].concat(CONTENT.regions);
    return '<div class="wrap page-head"><p class="eyebrow">' + t("news") + '</p><h1 style="margin-top:.4rem">' + t("newsHead") + '</h1>' +
      '<p class="prose">' + t("newsSub") + '</p></div>' +
      '<div class="wrap stack" style="padding-bottom:3rem">' +
        '<div class="field"><label for="news-q" class="sr-only">' + t("searchPlaceholder") + '</label><input id="news-q" type="search" placeholder="' + esc(t("searchPlaceholder")) + '" value="' + esc(newsState.q) + '"></div>' +
        '<div class="chips" role="group" aria-label="Filter by region">' + tabs.map(function (r) {
          var label = r === "All" ? t("all") : rName(r);
          return '<button class="chip" data-region="' + esc(r) + '" aria-pressed="' + (newsState.region === r) + '">' + esc(label) + '<span class="n">' + (counts[r] || 0) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="post-list" id="post-list"></div>' +
      "</div>";
  };
  function renderNewsList() {
    var list = $("#post-list"); if (!list) return;
    var q = newsState.q.trim().toLowerCase();
    var items = CONTENT.posts.filter(function (p) {
      var title = (currentLang === "am" && p.titleAm) ? p.titleAm : p.title;
      var summary = (currentLang === "am" && p.summaryAm) ? p.summaryAm : p.summary;
      var reg = rName(p.region);
      return (newsState.region === "All" || p.region === newsState.region) &&
        (!q || (title + " " + summary + " " + reg + " " + p.region).toLowerCase().indexOf(q) > -1);
    });
    list.innerHTML = items.length ? items.map(function (p) {
      var date1 = currentLang === "am" ? eDate(p.date) : gDate(p.date);
      var date2 = currentLang === "am" ? gDate(p.date) : eDate(p.date);
      return '<div class="post-row"><div class="when"><b>' + date1 + "</b>" + date2 + "</div>" + postCard(p) + "</div>";
    }).join("") : CONTENT.posts.length ? ('<div class="empty card"><p><b>' + t("noMatch") + '</b></p><p class="small" style="margin-top:.35rem">' + t("noMatchSub") + '</p></div>')
      : ('<div class="empty card"><p><b>' + t("comingSoon") + '</b></p><p class="small" style="margin-top:.35rem">' + t("comingSoonSub") + '</p></div>');
  }

  VIEWS.post = function (id) {
    var p = CONTENT.posts.filter(function (x) { return x.id === id; })[0];
    if (!p) return VIEWS.notfound();
    var action = p.type === "action" || p.cta === "action";
    var title = (currentLang === "am" && p.titleAm) ? p.titleAm : p.title;
    var summary = (currentLang === "am" && p.summaryAm) ? p.summaryAm : p.summary;
    var body = (currentLang === "am" && p.bodyAm) ? p.bodyAm : (p.body || []);
    var date1 = currentLang === "am" ? eDate(p.date) : gDate(p.date);
    var date2 = currentLang === "am" ? gDate(p.date) : eDate(p.date);
    return '<article class="wrap article" style="padding-block:1.5rem 3rem">' +
      '<a class="back" href="#news">' + ICON.arrowL + t("allUpdates") + '</a>' +
      '<div class="row" style="--gap:.4rem;margin-top:1.25rem"><span class="tag ' + p.type + '">' + typeLabel(p.type) + '</span><span class="tag">' + esc(rName(p.region)) + "</span>" + sampleTag(p) + "</div>" +
      "<h1>" + esc(title) + "</h1>" +
      '<div class="meta" style="margin-top:.75rem;font-size:.88rem"><span>' + date1 + '</span><span class="dot">' + date2 + '</span><span class="dot">' + statusBadge(p) + "</span></div>" +
      (p.anonymized ? '<div class="safety" style="margin-top:1.25rem">' + ICON.shield + "<span>" + t("safetyNotice") + "</span></div>" : "") +
      '<p style="margin-top:1.25rem;font-size:1.15rem;color:var(--ink-2)">' + esc(summary) + "</p>" +
      '<div class="body">' + body.map(function (txt) { return "<p>" + esc(txt) + "</p>"; }).join("") + "</div>" +
      ((p.sources || []).length ? '<h2 style="font-size:1.2rem;margin:2rem 0 .75rem">' + t("sources") + '</h2><ul class="source-list">' + p.sources.map(function (s) {
        return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener"><span>' + esc(s.label) + "<br><small>" + esc(s.url.replace(/^https?:\/\//, "")) + "</small></span>" + ICON.ext + "</a></li>";
      }).join("") + "</ul>" : "") +
      (action ? '<div class="panel stack" style="margin-top:2rem"><h3>' + t("takeNextStep") + '</h3><div class="row"><a class="btn primary" href="#action">' + t("signPetition") + '</a><a class="btn" href="#letter">' + t("writeCongress") + '</a></div></div>' : "") +
      '<h2 style="font-size:1.2rem;margin:2rem 0 .75rem">' + t("shareUpdate") + '</h2>' + shareBar("post-" + p.id, title) +
    "</article>";
  };

  /* ── blog ───────────────────────────────────────── */
  function blogEmail() { return CONFIG.blogEmail || CONFIG.contactEmail; }
  function api(path, opts) {
    opts = opts || {};
    var headers = { Accept: "application/json" };
    if (opts.body) headers["Content-Type"] = "application/json";
    return fetch(CONFIG.apiBase + path, { method: opts.method || "GET", headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) { var e = new Error(d.error || "HTTP " + r.status); e.status = r.status; throw e; }
          return d;
        });
      });
  }
  function messageBlock(title, text) {
    return '<div class="empty card"><p><b>' + title + "</b></p>" + (text ? '<p class="small" style="margin-top:.35rem">' + text + "</p>" : "") + "</div>";
  }
  function blogCard(b) {
    var author = b.author_name || CONFIG.blogAuthor;
    var likesLabel = currentLang === "am" ? " ድጋፍ" : (b.likes === 1 ? " like" : " likes");
    return '<a class="card post-card" href="#blog-' + esc(b.id) + '">' +
      '<div class="row" style="--gap:.4rem"><span class="tag">' + t("opinion") + "</span></div>" +
      "<h3>" + esc(b.title) + "</h3>" +
      (b.summary ? '<p class="sum">' + esc(b.summary) + "</p>" : "") +
      '<div class="meta" style="margin-top:auto"><span>' + esc(author) + '</span><span class="dot">' + relDay(b.date) + "</span>" +
      (b.likes ? '<span class="dot">' + b.likes + likesLabel + "</span>" : "") + "</div></a>";
  }

  VIEWS.blog = function () {
    return '<div class="wrap page-head"><p class="eyebrow">' + t("blog") + '</p><h1 style="margin-top:.4rem">' + t("blogTitle") + '</h1>' +
      '<p class="prose">' + t("blogSub") + '</p></div>' +
      '<div class="wrap" style="padding-bottom:3rem"><div class="post-list" id="blog-list">' + messageBlock(t("loadingPosts")) + "</div></div>";
  };
  function loadBlogList() {
    var seq = routeSeq;
    api("/posts").then(function (d) {
      var list = $("#blog-list"); if (!list || seq !== routeSeq) return;
      list.innerHTML = d.posts.length ? d.posts.map(function (b) {
        var date1 = currentLang === "am" ? eDate(b.date) : gDate(b.date);
        var date2 = currentLang === "am" ? gDate(b.date) : eDate(b.date);
        return '<div class="post-row"><div class="when"><b>' + date1 + "</b>" + date2 + "</div>" + blogCard(b) + "</div>";
      }).join("") : messageBlock(t("noPostsYet"), currentLang === "am" ? "በቅርቡ ይመለሱ።" : "Check back soon.");
    }, function () {
      var list = $("#blog-list"); if (list && seq === routeSeq) list.innerHTML = messageBlock(currentLang === "am" ? "ጽሑፎችን መጫን አልተቻለም።" : "Posts couldn't be loaded.", currentLang === "am" ? "እባክዎ ግንኙነትዎን ፈትሸው ገጹን ያድሱ።" : "Check your connection and refresh the page.");
    });
  }

  VIEWS.blogpost = function () {
    return '<div id="blog-post"><div class="wrap article" style="padding-block:1.5rem 3rem"><a class="back" href="#blog">' + ICON.arrowL + (currentLang === "am" ? "ሁሉም የብሎግ ጽሑፎች" : "All blog posts") + "</a>" +
      '<div style="margin-top:1.25rem">' + messageBlock(t("loadingPosts")) + "</div></div></div>";
  };
  function blogArticle(b) {
    var author = b.author_name || CONFIG.blogAuthor;
    var em = blogEmail();
    var mailto = "mailto:" + em + "?subject=" + encodeURIComponent("Re: " + b.title) +
      "&body=" + encodeURIComponent("About your post \"" + b.title + "\" (" + pageUrl("blog-" + b.id) + "):\n\n");
    var date1 = currentLang === "am" ? eDate(b.date) : gDate(b.date);
    var date2 = currentLang === "am" ? gDate(b.date) : eDate(b.date);
    return '<article class="wrap article" style="padding-block:1.5rem 3rem">' +
      '<a class="back" href="#blog">' + ICON.arrowL + (currentLang === "am" ? "ሁሉም የብሎግ ጽሑፎች" : "All blog posts") + '</a>' +
      '<div class="row" style="--gap:.4rem;margin-top:1.25rem"><span class="tag">' + t("opinion") + '</span></div>' +
      "<h1>" + esc(b.title) + "</h1>" +
      '<div class="byline"><span class="avatar" aria-hidden="true">' + esc(author.charAt(0)) + "</span><span><b>" + esc(author) + "</b><br>" + date1 + " · " + date2 + "</span></div>" +
      '<div class="body rich">' + sanitizeHtml(b.body) + "</div>" +

      '<div class="card stack" style="margin-top:2rem;--gap:.75rem">' +
        '<h2 style="font-size:1.2rem">' + t("speakToYou") + '</h2>' +
        '<div class="react" role="group" aria-label="React to this post">' +
          '<button class="btn react-btn" data-react="like" aria-pressed="false">' + ICON.up + t("like") + ' <span class="n" data-count="like"></span></button>' +
          '<button class="btn react-btn down" data-react="dislike" aria-pressed="false">' + ICON.down + t("dislike") + ' <span class="n" data-count="dislike"></span></button>' +
        "</div>" +
        '<p class="small muted" id="react-msg" role="status"></p>' +
      "</div>" +

      '<div class="panel stack" style="margin-top:1rem;--gap:.75rem">' +
        '<h2 style="font-size:1.2rem">' + t("haveMoreToSay") + '</h2>' +
        '<p class="small muted">' + t("emailOpinionSub") + '</p>' +
        '<div class="row"><a class="btn primary" href="' + esc(mailto) + '">' + ICON.mail + t("emailOpinion") + '</a>' +
        '<button class="btn ghost sm" data-copy="' + esc(em) + '">' + t("copyEmail") + '</button></div>' +
        '<p class="small muted">' + esc(em) + "</p>" +
      "</div>" +

      '<h2 style="font-size:1.2rem;margin:2rem 0 .75rem">' + t("sharePost") + '</h2>' + shareBar("blog-" + b.id, b.title) +
    "</article>";
  }
  function loadBlogPost(id) {
    var seq = routeSeq;
    api("/posts/" + encodeURIComponent(id)).then(function (d) {
      var host = $("#blog-post"); if (!host || seq !== routeSeq) return;
      host.innerHTML = blogArticle(d.post);
      document.title = d.post.title + " · " + (currentLang === "am" ? CONFIG.siteNameAm : CONFIG.siteName);
      loadReactions(id);
    }, function (e) {
      var host = $("#blog-post"); if (!host || seq !== routeSeq) return;
      host.innerHTML = e.status === 404 ? VIEWS.notfound() :
        '<div class="wrap article" style="padding-block:1.5rem 3rem"><a class="back" href="#blog">' + ICON.arrowL + (currentLang === "am" ? "ሁሉም የብሎግ ጽሑፎች" : "All blog posts") + "</a>" +
        '<div style="margin-top:1.25rem">' + messageBlock(currentLang === "am" ? "ጽሑፉን መጫን አልተቻለም።" : "This post couldn't be loaded.", currentLang === "am" ? "እባክዎ ግንኙነትዎን ፈትሸው ገጹን ያድሱ።" : "Check your connection and refresh the page.") + "</div></div>";
    });
  }

  var reaction = null;
  function voterId() {
    var v = store("voter");
    if (!v) { v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); store("voter", v); }
    return v;
  }
  function paintReactions() {
    var r = reaction || {};
    document.querySelectorAll("[data-react]").forEach(function (btn) { btn.setAttribute("aria-pressed", btn.getAttribute("data-react") === r.mine); });
    document.querySelectorAll("[data-count]").forEach(function (n) {
      var v = r[n.getAttribute("data-count") === "like" ? "likes" : "dislikes"];
      n.textContent = typeof v === "number" ? v.toLocaleString("en-US") : "";
    });
  }
  function loadReactions(id) {
    reaction = { id: id, mine: store("vote:" + id) || null };
    paintReactions();
    api("/reactions/" + encodeURIComponent(id) + "?voter=" + encodeURIComponent(voterId())).then(function (d) {
      if (!reaction || reaction.id !== id) return;
      reaction = { id: id, likes: d.likes, dislikes: d.dislikes, mine: d.mine };
      store("vote:" + id, d.mine); paintReactions();
    }, function () {});
  }
  function react(id, choice) {
    if (!reaction || reaction.id !== id) return;
    var before = Object.assign({}, reaction), prev = reaction.mine, next = prev === choice ? null : choice, msg = $("#react-msg");
    if (prev && typeof reaction[prev + "s"] === "number") reaction[prev + "s"] = Math.max(0, reaction[prev + "s"] - 1);
    if (next && typeof reaction[next + "s"] === "number") reaction[next + "s"] += 1;
    reaction.mine = next; paintReactions();
    if (msg) msg.textContent = next ? (currentLang === "am" ? "አስተያየትዎ ስለደረሰን እናመሰግናለን።" : "Thanks for your feedback.") : (currentLang === "am" ? "አስተያየትዎ ተሰርዟል።" : "Reaction removed.");
    api("/reactions/" + encodeURIComponent(id), { method: "POST", body: { voter: voterId(), vote: next } }).then(function (d) {
      if (!reaction || reaction.id !== id) return;
      reaction = { id: id, likes: d.likes, dislikes: d.dislikes, mine: d.mine };
      store("vote:" + id, d.mine); paintReactions();
    }, function () {
      if (!reaction || reaction.id !== id) return;
      reaction = before; paintReactions();
      if (msg) msg.textContent = currentLang === "am" ? "አስተያየቱ አልተቀመጠም። እባክዎ ግንኙነትዎን ፈትሸው እንደገና ይሞክሩ።" : "Your reaction couldn't be saved. Check your connection and try again.";
    });
  }

  /* ── Multi-country Advocacy Letter ───────────────── */
  var LETTER_TOPICS = {
    ceasefire: {
      label: "Ceasefire & inclusive peace negotiations",
      labelAm: "አፋጣኝ የተኩስ አቁም እና ሁሉን አቀፍ የሰላም ድርድር",
      ask: "pressure the Ethiopian government and armed groups to agree to an immediate ceasefire and begin serious, inclusive peace negotiations"
    },
    access: {
      label: "Humanitarian access & relief corridors",
      labelAm: "የሰብአዊ እርዳታ አቅርቦትና የእርዳታ ኮሪደሮች",
      ask: "press the Ethiopian government and all parties to allow full, safe, and unrestricted humanitarian access"
    },
    civilians: {
      label: "Protection of civilians & places of worship",
      labelAm: "የሰላማዊ ዜጎችና የቅዱሳን ስፍራዎች ጥበቃ",
      ask: "publicly condemn identity-based attacks on civilians and historic religious sites, making their protection a priority in diplomatic engagement"
    },
    investigate: {
      label: "Independent human rights investigation",
      labelAm: "ገለልተኛ ዓለም አቀፍ የሰብአዊ መብት ምርመራ",
      ask: "support an independent, international investigation into documented abuses against civilians and ensure its findings are made public"
    }
  };

  var letterState = Object.assign({ country: "us", name: "", city: "", zip: "", topic: "ceasefire", note: "" }, store("letter") || {});

  function letterText() {
    var s = letterState, t = LETTER_TOPICS[s.topic] || LETTER_TOPICS.ceasefire;
    var c = (CONTENT.countries && CONTENT.countries[s.country]) || CONTENT.countries.us;
    var loc = s.city || (s.country === "us" ? "[city, state]" : "[city, constituency]");
    var postal = s.zip ? " (" + s.zip + ")" : "";
    var salutation = c.salutation || "Dear Representative,";

    if (s.topic === "ceasefire") {
      return salutation + "\n\n" +
        "As your constituent" + (s.name ? " (" + s.name + ")" : "") + " residing in " + loc + postal + ", I am deeply concerned about the escalating crisis in Ethiopia and urge you to take immediate action. The continued fighting risks a wider conflict that could cost millions of lives, force families from their homes, and destabilize neighboring African countries.\n\n" +
        "We have already seen the devastating consequences of recent conflict in the region, where hunger, displacement, and catastrophic loss of life affected millions of people. We cannot allow this destruction to happen again.\n\n" +
        "I urge you to use your position to pressure the Ethiopian government and armed groups to agree to an immediate ceasefire and begin serious, inclusive peace negotiations.\n\n" +
        "Any lasting peace agreement must include meaningful representation from Ethiopia's diverse ethnic communities. No single ethnic group should be excluded from the peace process or have its future decided without an equal voice. All communities must have an opportunity to participate in negotiations and have their concerns, rights, security, and political interests meaningfully represented.\n\n" +
        "A sustainable peace cannot simply end the fighting. It must address the grievances and insecurity that have contributed to Ethiopia's cycles of violence and ensure that all ethnic communities have an equal stake in the country's future.\n\n" +
        (s.note ? s.note.trim() + "\n\n" : "") +
        "I urge you to act before the violence grows worse and spreads further across the region. As my voice " + (s.country === "us" ? "in Washington" : (s.country === "uk" ? "in Westminster" : (s.country === "ca" ? "in Ottawa" : "in Parliament"))) + ", please help save lives, support an inclusive peace process, and encourage a lasting political solution in Ethiopia.\n\n" +
        "Sincerely,\n" + (s.name || "[your name]") + "\n" + loc + (s.zip ? " " + s.zip : "");
    }

    return salutation + "\n\n" +
      "My name is " + (s.name || "[your name]") + ", and I am your constituent residing in " + loc + postal + ".\n\n" +
      "I am writing with grave urgency regarding the ongoing crisis and human rights violations affecting civilian communities across Ethiopia, including in Amhara, Oromia, and Tigray. Families are being displaced, critical aid corridors are blocked, and civilian centers continue to face violence.\n\n" +
      "As my elected representative, I urge you to " + t.ask + ".\n\n" +
      (s.note ? s.note.trim() + "\n\n" : "") +
      "Thank you for your dedicated service and for standing up for human dignity and international humanitarian law. Please let me know what concrete diplomatic steps you will take.\n\n" +
      "Sincerely,\n" + (s.name || "[your name]") + "\n" + loc + (s.zip ? " " + s.zip : "");
  }

  VIEWS.action = function () {
    var s = letterState, hasPet = CONTENT.petitions.length > 0;
    var c = (CONTENT.countries && CONTENT.countries[s.country]) || CONTENT.countries.us;

    var eyebrow = currentLang === "am" ? "እርምጃ ይውሰዱ" : "Take Action";
    var title = currentLang === "am" ? ("ለሰላም ድምጽ ይሁኑ " + (hasPet ? "በሦስት" : "በሁለት") + " እርምጃዎች") : ("Advocate for peace in " + (hasPet ? "three" : "two") + " steps");
    var intro = currentLang === "am"
      ? (hasPet ? "ክፍት አቤቱታዎችን ይፈርሙ፣ ለተመረጡ ተወካይዎ ይጻፉ፣ እንዲሁም ማህበረሰብዎን ያነቃቁ።" : "ለተወካይዎ ደብዳቤ ይላኩ፣ ከዚያም ያጋሩ።")
      : (hasPet ? "Sign open petitions, contact your elected representative, and mobilize your community." : "Send a constituent letter, then share.");

    var step1 = currentLang === "am" ? '<div><b>አቤቱታ ይፈርሙ</b><p class="muted small">የእርዳታ አቅርቦትና የሰላማዊ ዜጎች ጥበቃ እንዲደረግ ይጠይቁ።</p></div>' : '<div><b>Sign a petition</b><p class="muted small">Demand aid access and protection of civilians.</p></div>';
    var step2 = currentLang === "am" ? '<div><b>ለተመረጡት ተወካይዎ ይጻፉ</b><p class="muted small">ደብዳቤዎን ለአሜሪካ ኮንግረስ፣ እንግሊዝ ፓርላማ፣ ካናዳ ወይም አውሮፓ ህብረት ያዘጋጁ።</p></div>' : '<div><b>Write your elected official</b><p class="muted small">Customize your letter for US Congress, UK Parliament, Canada, or EU.</p></div>';
    var step3 = currentLang === "am" ? '<div><b>ለሦስት ሰዎች ያጋሩ</b><p class="muted small">እያንዳንዱ ማጋራት ለተጠያቂነት የሚደረገውን ጥረት ያጠናክራል።</p></div>' : '<div><b>Share with three people</b><p class="muted small">Every share expands the coalition calling for accountability.</p></div>';

    return '<div class="wrap page-head"><p class="eyebrow">' + eyebrow + '</p><h1 style="margin-top:.4rem">' + title + '</h1>' +
      '<p class="prose">' + intro + "</p></div>" +
      '<div class="wrap" style="padding-bottom:1rem"><ol class="steps" style="list-style:none;margin:0;padding:0">' +
        (hasPet ? '<li class="step">' + step1 + '</li>' : "") +
        '<li class="step">' + step2 + '</li>' +
        '<li class="step">' + step3 + '</li>' +
      "</ol></div>" +

      (hasPet ? '<section class="section"><div class="wrap"><div class="section-head"><h2>' + (currentLang === "am" ? "ክፍት አቤቱታዎች" : "Open petitions") + '</h2></div><div class="grid-2">' +
        CONTENT.petitions.map(function (p) {
          var pTitle = currentLang === "am" && p.titleAm ? p.titleAm : p.title;
          var pText = currentLang === "am" && p.textAm ? p.textAm : p.text;
          var signBtn = (currentLang === "am" ? "በ " + esc(p.host) + " ላይ ይፈርሙ " : "Sign on " + esc(p.host) + " ") + ICON.ext;
          var copyBtn = (currentLang === "am" ? "ማስፈንጠሪያ ቅዳ" : "Copy link");
          return '<div class="card stack" style="--gap:.6rem"><div class="row" style="--gap:.4rem"><span class="tag action">' + (currentLang === "am" ? "አቤቱታ" : "Petition") + '</span>' + sampleTag(p) + "</div><h3>" + esc(pTitle) + '</h3><p class="muted small">' + esc(pText) + '</p><div class="row" style="margin-top:auto"><a class="btn primary" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + signBtn + '</a><button class="btn ghost sm" data-copy="' + esc(p.url) + '">' + ICON.link + copyBtn + '</button></div></div>';
        }).join("") +
      "</div></div></section>" : "") +

      '<section class="section" id="letter"><div class="wrap">' +
        '<div class="section-head"><h2>' + (currentLang === "am" ? "ለተወካይዎ ይጻፉ" : "Write your representative") + '</h2><p class="muted small">' + (currentLang === "am" ? "በአሜሪካ፣ እንግሊዝ፣ ካናዳ እና አውሮፓ ህብረት ለሚኖሩ ዜጎች የተዘጋጀ።" : "Works for constituents in the US, UK, Canada, and European Union.") + '</p></div>' +
        '<div class="letter-grid">' +
          '<form class="card stack" id="letter-form" novalidate>' +
            '<div class="field"><label for="l-country">' + (currentLang === "am" ? "መንግስትዎ / ፓርላማዎ" : "Your government / parliament") + '</label><select id="l-country" name="country">' +
              Object.keys(CONTENT.countries).map(function (k) {
                var cName = currentLang === "am" && CONTENT.countries[k].nameAm ? CONTENT.countries[k].nameAm : CONTENT.countries[k].name;
                return '<option value="' + k + '"' + (s.country === k ? " selected" : "") + ">" + esc(cName) + "</option>";
              }).join("") +
            '</select></div>' +
            '<div class="field"><label for="l-name">' + (currentLang === "am" ? "ሙሉ ስምዎ" : "Your full name") + '</label><input id="l-name" name="name" autocomplete="name" placeholder="' + (currentLang === "am" ? "አበበ ቢቂላ" : "Abebe Bikila") + '" value="' + esc(s.name) + '"></div>' +
            '<div class="two">' +
              '<div class="field"><label for="l-city">' + esc(currentLang === "am" && c.cityLabelAm ? c.cityLabelAm : (c.cityLabel || "City and state")) + '</label><input id="l-city" name="city" autocomplete="address-level2" placeholder="' + esc(c.cityPlaceholder || "Denver, CO") + '" value="' + esc(s.city) + '"></div>' +
              '<div class="field"><label for="l-zip">' + esc(currentLang === "am" && c.postalLabelAm ? c.postalLabelAm : (c.postalLabel || "ZIP code")) + '</label><input id="l-zip" name="zip" autocomplete="postal-code" maxlength="10" placeholder="' + (s.country === 'us' ? '80202' : 'SW1A 0AA') + '" value="' + esc(s.zip) + '"></div>' +
            '</div>' +
            '<div class="field"><label for="l-topic">' + (currentLang === "am" ? "ዋነኛ የፖሊሲ ጥያቄ" : "Key policy demand") + '</label><select id="l-topic" name="topic">' +
              Object.keys(LETTER_TOPICS).map(function (k) {
                var topLabel = currentLang === "am" && LETTER_TOPICS[k].labelAm ? LETTER_TOPICS[k].labelAm : LETTER_TOPICS[k].label;
                return '<option value="' + k + '"' + (s.topic === k ? " selected" : "") + ">" + esc(topLabel) + "</option>";
              }).join("") +
            "</select></div>" +
            '<div class="field"><label for="l-note">' + (currentLang === "am" ? "የግል መልእክት ያክሉ " : "Add a personal line ") + '<span class="muted">(' + (currentLang === "am" ? "አስገዳጅ ያልሆነ" : "optional") + ')</span></label><textarea id="l-note" name="note" placeholder="' + (currentLang === "am" ? "ይህ ጉዳይ ለእርስዎና ለቤተሰብዎ ለምን እንደሚያሳስብ ያጋሩ" : "Share why this matters to your family or community") + '">' + esc(s.note) + '</textarea><span class="hint">' + (currentLang === "am" ? "የግል መልእክት ያላቸው ደብዳቤዎች ከተወካዮች ቢሮ ከፍተኛ ትኩረት ያገኛሉ።" : "Personalized constituent messages have 4x higher response rates from staffers.") + '</span></div>' +
            '<p class="small muted">' + (currentLang === "am" ? "መረጃዎ በራስዎ አሳሽ ውስጥ ብቻ ይቆያል። ወደ እኛ አገልጋይ ምንም አይላክም።" : "Your information stays local in your browser. Nothing is sent to our servers.") + '</p>' +
          "</form>" +
          '<div class="letter-out stack">' +
            '<div class="letter-paper" id="letter-paper" tabindex="0" aria-label="' + (currentLang === "am" ? "የእርስዎ ደብዳቤ" : "Your constituent letter") + '"></div>' +
            '<div class="row" id="letter-actions">' +
              '<button class="btn primary" id="copy-letter">' + ICON.doc + (currentLang === "am" ? "ደብዳቤውን ቅዳ" : "Copy letter") + '</button>' +
              '<a class="btn" style="background:#b91c1c;color:#fff" href="https://actionnetwork.org/letters/urgent-action-needed-to-stop-violence-and-save-lives-in-ethiopia?source=direct_link&" target="_blank" rel="noopener">' + (currentLang === "am" ? "በActionNetwork ይላኩ" : "Send via ActionNetwork") + " " + ICON.ext + '</a>' +
              (c.findUrl ? '<a class="btn ghost" href="' + esc(c.findUrl) + '" target="_blank" rel="noopener">' + esc(currentLang === "am" && c.findLabelAm ? c.findLabelAm : c.findLabel) + " " + ICON.ext + '</a>' : '') +
              (c.altFindUrl ? '<a class="btn ghost" href="' + esc(c.altFindUrl) + '" target="_blank" rel="noopener">' + esc(currentLang === "am" && c.altFindLabelAm ? c.altFindLabelAm : c.altFindLabel) + " " + ICON.ext + '</a>' : '') +
            '</div>' +
            '<p class="small muted">' + (currentLang === "am" ? "ደብዳቤውን ቀድተው በተወካይዎ ይፋዊ ድረ-ገጽ የእውቂያ ቅጽ ላይ ይለጥፉት።" : "Copy the letter and paste it directly into your representative's official constituent contact page.") + '</p>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap stack"><h2>' + (currentLang === "am" ? "የተግባር ጥሪውን ያጋሩ" : "Share Take Action") + '</h2>' + shareBar("action", currentLang === "am" ? "የተመረጡ ተወካዮች በኢትዮጵያ በሰላማዊ ዜጎች ላይ ለደረሰው ቀውስ እርምጃ እንዲወስዱ ይጠይቁ፦" : "Urge elected officials to act on the civilian crisis in Ethiopia:") + "</div></section>";
  };

  VIEWS.donate = function () {
    var c = featured(), others = CONTENT.campaigns.filter(function (x) { return x !== c; });
    var eyebrow = currentLang === "am" ? "እርዳታ ይለግሱ" : "Donate";
    if (!c) return '<div class="wrap page-head"><p class="eyebrow">' + eyebrow + '</p><h1 style="margin-top:.4rem">' + (currentLang === "am" ? "መልሶ ለሚገነቡ ማህበረሰቦች በቀጥታ ይለግሱ" : "Give directly to communities rebuilding") + '</h1>' +
      '<p class="prose">' + (currentLang === "am" ? "እያንዳንዱ ዘመቻ በGoFundMe የሚካሄድ ሲሆን አዘጋጁንና የገንዘብ አጠቃቀሙን መከታተል ይችላሉ።" : "Every campaign runs on GoFundMe, so you can see the organizer, updates, and withdrawals for yourself.") + '</p></div>' +
      '<div class="wrap" style="padding-bottom:3rem"><div class="empty card"><p><b>' + (currentLang === "am" ? "እስካሁን የተከፈተ ዘመቻ የለም።" : "No fundraisers are open yet.") + '</b></p>' +
      '<p class="small" style="margin-top:.35rem">' + (currentLang === "am" ? "አዳዲስ ዘመቻዎች ሲጀመሩ እንዲደርስዎ ከታች ይመዝገቡ። እስከዚያ ድረስ <a href=\"#letter\">ለተወካዮች መጻፍ</a> ይችላሉ።" : "Subscribe below and we'll email you when the first campaign launches. Until then, you can <a href=\"#letter\">write to Congress</a>.") + '</p></div></div>';

    var cTitle = currentLang === "am" && c.titleAm ? c.titleAm : c.title;
    var cSummary = currentLang === "am" && c.summaryAm ? c.summaryAm : c.summary;
    var cUses = currentLang === "am" && c.usesAm ? c.usesAm : c.uses;
    var cUpdates = currentLang === "am" && c.updatesAm ? c.updatesAm : c.updates;

    return '<div class="wrap page-head"><p class="eyebrow">' + eyebrow + '</p><h1 style="margin-top:.4rem">' + (currentLang === "am" ? "ለተጎዱ ማህበረሰቦች ቀጥተኛ ድጋፍ" : "Direct relief for affected communities") + '</h1>' +
      '<p class="prose">' + (currentLang === "am" ? "እያንዳንዱ ዘመቻ በGoFundMe አስተማማኝ ስርዓት የሚካሄድ ሲሆን፣ ግልጽነትን፣ የሂደት ክትትልንና ቀጥተኛ የእርዳታ ስርጭትን ያረጋግጣል።" : "Every campaign runs through GoFundMe's verified checkout, ensuring transparent donor protections, progress tracking, and verified fund distributions.") + '</p></div>' +
      '<div class="wrap" style="padding-bottom:1rem"><div class="fund-hero">' +
        '<div class="stack" style="--gap:1.5rem">' +
          '<div class="stack" style="--gap:.5rem"><div class="row" style="--gap:.4rem"><span class="tag">' + esc(rName(c.region)) + "</span>" + sampleTag(c) + "</div><h2>" + esc(cTitle) + '</h2><p class="muted small">' + (currentLang === "am" ? "አዘጋጅ፦ " : "Organized by ") + esc(c.organizer) + "</p></div>" +
          '<p class="prose" style="font-size:1.05rem">' + esc(cSummary) + "</p>" +
          (cUses.length ? '<div class="card stack"><h3>' + (currentLang === "am" ? "ገንዘቡ የት ይውላል?" : "Where the money goes") + '</h3><div class="alloc">' + cUses.map(function (u) {
            return '<div class="alloc-row"><span>' + esc(u.label) + "</span><b>" + u.pct + '%</b><div class="progress"><i style="--p:' + u.pct + '%"></i></div></div>';
          }).join("") + "</div>" + (c.sample ? '<p class="small muted">' + (currentLang === "am" ? "ናሙና ክፍፍል። በእውነተኛው የዘመቻ በጀት ይተካል።" : "Sample split. Replace with the campaign's real budget.") + '</p>' : "") + "</div>" : "") +
          (cUpdates.length ? '<div class="stack"><h3>' + (currentLang === "am" ? "የሂደት ዝመናዎች" : "Progress updates") + '</h3><ol class="timeline">' + cUpdates.map(function (u) {
            var uDate = currentLang === "am" && u.dateAm ? u.dateAm : gDate(u.date);
            return '<li><span class="date">' + esc(uDate) + "</span><p>" + esc(u.text) + "</p></li>";
          }).join("") + "</ol></div>" : "") +
          '<div id="gfm-widget"></div>' +
        "</div>" +
        '<aside class="card donate-box stack" aria-label="' + (currentLang === "am" ? "ይለግሱ" : "Donate") + '">' +
          progressBlock(c, true) +
          gfmButton(c, "block lg") +
          '<button class="btn block" data-copy="' + esc(c.gofundmeUrl) + '">' + ICON.link + (currentLang === "am" ? "የዘመቻውን ማስፈንጠሪያ ቅዳ" : "Copy campaign link") + '</button>' +
          '<div class="gfm-note">' + ICON.lock + "<span>" + (currentLang === "am" ? "ክፍያውን በGoFundMe አስተማማኝ ስርዓት ያጠናቅቃሉ። የመድረክ ክፍያ 0% ሲሆን፤ መደበኛ የካርድ አገልግሎት ክፍያ ~2.9% + $0.30 ነው።" : "You'll finish on GoFundMe's secure checkout. Platform fee is 0%; standard card processing is ~2.9% + $0.30 per donation.") + "</span></div>" +
          '<div class="gfm-note">' + ICON.info + "<span>" + (currentLang === "am" ? "የግል GoFundMe ዘመቻዎች ከቀረጥ ነፃ ላይሆኑ ይችላሉ። ሙሉ ዝርዝሩን በዘመቻው ገጽ ይመልከቱ።" : "Personal GoFundMe fundraisers are typically not tax-deductible. Check the campaign page for full organizer details.") + "</span></div>" +
        "</aside>" +
      "</div></div>" +
      (others.length ? '<section class="section"><div class="wrap"><div class="section-head"><h2>' + (currentLang === "am" ? "ሌሎች የተረጋገጡ ዘመቻዎች" : "Other verified campaigns") + '</h2></div><div class="grid-2">' + others.map(function (o) {
        var oTitle = currentLang === "am" && o.titleAm ? o.titleAm : o.title;
        var oSummary = currentLang === "am" && o.summaryAm ? o.summaryAm : o.summary;
        return '<div class="card stack"><div class="row" style="--gap:.4rem"><span class="tag">' + esc(rName(o.region)) + "</span>" + sampleTag(o) + "</div><h3>" + esc(oTitle) + '</h3><p class="muted small">' + esc(oSummary) + "</p>" + progressBlock(o) + gfmButton(o) + "</div>";
      }).join("") + "</div></div></section>" : "") +
      '<section class="section"><div class="wrap stack"><h2>' + (currentLang === "am" ? "አሁን መለገስ አልቻሉም?" : "Can't give right now?") + '</h2><p class="prose">' + (currentLang === "am" ? "የተረጋገጠ ዘመቻን ማጋራት እኩል ዋጋ አለው። አብዛኛው ልገሳ የሚገኘው ከጓደኛ ማጋራት ነው።" : "Sharing a verified campaign helps almost as much. Most donations come from people who saw a friend share it.") + '</p>' + shareBar("donate", (currentLang === "am" ? "በኢትዮጵያ አስቸኳይ ድጋፍን ይደግፉ፦ " : "Support emergency relief in Ethiopia: ") + cTitle) + "</div></section>";
  };

  /* ── Learn Page & Slide-Series Reader ─────────────── */
  VIEWS.learn = function () {
    return '<div class="wrap page-head"><p class="eyebrow">' + (currentLang === "am" ? "እወቅና ተረዳ" : "Learn") + '</p><h1 style="margin-top:.4rem">' + (currentLang === "am" ? "የቀውሱን ዳራና መነሻ ምክንያቶች ይረዱ" : "Understand the context and root causes") + '</h1>' +
      '<p class="prose">' + (currentLang === "am" ? "ስለ ክልላዊ ሁኔታዎች፣ ታሪካዊ ክስተቶች እና ከስላይድ ተከታታይ የተዘጋጁ መመሪያዎችን ያግኙ።" : "Comprehensive background on regional dynamics, historical timelines, and practical guides adapted from our slide series.") + '</p></div>' +

      '<section class="section" style="padding-top:1rem"><div class="wrap grid-2" style="align-items:start">' +
        '<div class="stack"><h2>' + (currentLang === "am" ? "የዋና ዋና ክስተቶች የጊዜ ሰሌዳ" : "Timeline of key events") + '</h2>' +
          '<ol class="timeline">' + CONTENT.timeline.map(function (t) {
            var tDate = currentLang === "am" && t.dateAm ? t.dateAm : t.date;
            var tTitle = currentLang === "am" && t.titleAm ? t.titleAm : t.title;
            var tText = currentLang === "am" && t.textAm ? t.textAm : t.text;
            return '<li><span class="date">' + esc(tDate) + "</span><h3>" + esc(tTitle) + "</h3><p>" + esc(tText) + "</p></li>";
          }).join("") + "</ol></div>" +
        '<div class="stack"><h2>' + (currentLang === "am" ? "ክልሎችና ማህበረሰቦች" : "Regions and communities") + '</h2><div>' + CONTENT.regionsInfo.map(function (r, i) {
            var rNameDisplay = currentLang === "am" && r.nameAm ? r.nameAm : r.name;
            var rText = currentLang === "am" && r.textAm ? r.textAm : r.text;
            var n = CONTENT.posts.filter(function (p) { return p.region === r.name; }).length;
            var seeLink = currentLang === "am"
              ? ("ከ" + rNameDisplay + " " + n + " ወቅታዊ መረጃዎችን ይመልከቱ →")
              : ("See " + n + " update" + (n > 1 ? "s" : "") + " from " + esc(r.name) + " →");
            return '<details class="acc"' + (i === 0 ? " open" : "") + "><summary>" + esc(rNameDisplay) + '</summary><div class="acc-body stack" style="--gap:.75rem"><p class="prose">' + esc(rText) + "</p>" +
              (n ? '<a href="#news" data-go-region="' + esc(r.name) + '">' + esc(seeLink) + "</a>" : "") + "</div></details>";
          }).join("") + "</div></div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap">' +
        '<div class="section-head"><h2>' + (currentLang === "am" ? "የትምህርት ጽሑፎችና የስላይድ ተከታታዮች" : "Educational articles & slide series") + '</h2><p class="muted small">' + (currentLang === "am" ? "ሙሉውን መመሪያ ለማንበብ ይጫኑ።" : "Click any guide to read the full breakdown.") + '</p></div>' +
        '<div class="grid">' +
          CONTENT.articles.map(function (a) {
            var aNote = currentLang === "am" && a.noteAm ? a.noteAm : a.note;
            var aTitle = currentLang === "am" && a.titleAm ? a.titleAm : a.title;
            var aSummary = currentLang === "am" && a.summaryAm ? a.summaryAm : a.summary;
            return '<a class="card stack" style="--gap:.5rem;text-decoration:none" href="#article-' + esc(a.id) + '">' +
              '<span class="eyebrow">' + esc(aNote) + "</span>" +
              '<h3 style="color:var(--ink)">' + esc(aTitle) + "</h3>" +
              '<p class="muted small">' + esc(aSummary) + '</p>' +
              '<span class="meta-link" style="margin-top:auto;color:var(--accent)">' + (currentLang === "am" ? "መመሪያውን አንብብ →" : "Read guide →") + '</span>' +
            "</a>";
          }).join("") +
        "</div>" +
      "</div></section>" +

      '<section class="section"><div class="wrap stack">' +
        '<h2>' + (currentLang === "am" ? "የአስቸኳይ ጊዜ አድራሻዎችና የሰብአዊ ድጋፍ" : "Emergency contacts & humanitarian aid") + '</h2>' +
        '<div class="resources-grid">' +
          CONTENT.resources.map(function (res) {
            var resTag = currentLang === "am" && res.tagAm ? res.tagAm : res.tag;
            var resName = currentLang === "am" && res.nameAm ? res.nameAm : res.name;
            var resDesc = currentLang === "am" && res.descAm ? res.descAm : res.desc;
            var resContact = currentLang === "am" && res.contactTextAm ? res.contactTextAm : res.contactText;
            return '<div class="resource-card">' +
              '<span class="tag">' + esc(resTag) + '</span>' +
              '<h3>' + esc(resName) + '</h3>' +
              '<p class="small muted">' + esc(resDesc) + '</p>' +
              '<div class="row" style="margin-top:auto"><a class="btn primary sm" href="' + esc(res.link) + '" target="_blank" rel="noopener">' + (currentLang === "am" ? "ይፋዊ ድረ-ገጽ " : "Official Link ") + ICON.ext + '</a></div>' +
              '<p class="small muted" style="font-family:monospace">' + esc(resContact) + '</p>' +
            '</div>';
          }).join("") +
        '</div>' +
      '</div></section>' +

      '<section class="section"><div class="wrap stack"><h2>' + (currentLang === "am" ? "የምንመካባቸው ታማኝ የመረጃ ምንጮች" : "Reputable sources we rely on") + '</h2><ul class="source-list grid-2">' + CONTENT.sources.map(function (s) {
        return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener"><span>' + esc(s.label) + "</span>" + ICON.ext + "</a></li>";
      }).join("") + "</ul></div></section>";
  };

  /* Detailed Slide-Series Article Reader View */
  VIEWS.article = function (id) {
    var a = (CONTENT.articles || []).filter(function (x) { return x.id === id; })[0];
    if (!a) return VIEWS.notfound();

    var aNote = currentLang === "am" && a.noteAm ? a.noteAm : a.note;
    var aTitle = currentLang === "am" && a.titleAm ? a.titleAm : a.title;
    var aSummary = currentLang === "am" && a.summaryAm ? a.summaryAm : a.summary;
    var secs = currentLang === "am" && a.sectionsAm ? a.sectionsAm : (a.sections || []);

    return '<div class="wrap article" style="padding-block:1.5rem 3rem">' +
      '<a class="back" href="#learn">' + ICON.arrowL + (currentLang === "am" ? "ሁሉም ጽሑፎችና መመሪያዎች" : "All articles & guides") + '</a>' +
      '<div class="row" style="--gap:.4rem;margin-top:1.25rem"><span class="tag action">' + esc(aNote) + '</span></div>' +
      '<h1>' + esc(aTitle) + '</h1>' +
      '<p class="prose" style="font-size:1.15rem;margin-top:1rem;color:var(--ink-2)">' + esc(aSummary) + '</p>' +
      '<div class="article-modal" style="margin-top:2rem">' +
        secs.map(function (sec) {
          return '<div class="article-section">' +
            '<h3>' + esc(sec.heading) + '</h3>' +
            '<p>' + esc(sec.text) + '</p>' +
          '</div>';
        }).join("") +
      '</div>' +
      '<div class="panel stack" style="margin-top:2rem">' +
        '<h3>' + (currentLang === "am" ? "ቀጣዩን እርምጃ ይውሰዱ" : "Take the next step") + '</h3>' +
        '<p class="small muted">' + (currentLang === "am" ? "ይህን ግንዛቤ ዛሬ ወደ ተጨባጭ የህዝብ ተሳትፎ ይለውጡ።" : "Put this understanding into meaningful civic action today.") + '</p>' +
        '<div class="row"><a class="btn primary" href="#action">' + (currentLang === "am" ? "ለተወካይዎ ይጻፉ" : "Write your representative") + '</a><a class="btn" href="#donate">' + (currentLang === "am" ? "መልሶ ግንባታን ይደግፉ" : "Support rebuilding") + '</a></div>' +
      '</div>' +
      '<h2 style="font-size:1.2rem;margin:2rem 0 .75rem">' + (currentLang === "am" ? "ይህን መመሪያ ያጋሩ" : "Share this guide") + '</h2>' + shareBar("article-" + a.id, aTitle) +
    '</div>';
  };

  VIEWS.about = function () {
    var isAm = currentLang === "am";
    return '<div class="wrap page-head"><p class="eyebrow">' + (isAm ? "ስለ እኛ እና እውቂያ" : "About & Contact") + '</p><h1 style="margin-top:.4rem">' + (isAm ? "ይህንን ድረ-ገጽ ማን ያካሂደዋል፣ ለምንስ?" : "Who runs this site, and why") + '</h1></div>' +
      '<div class="wrap grid-2" style="padding-bottom:3rem;align-items:start">' +
        '<div class="stack" style="--gap:1.25rem">' +
          '<div class="prose">' +
            '<p>' + (isAm
              ? "ኢትዮጵያ ክራይሲስ ዋች በዲያስፖራ አባል በሶልያና ሽፈራው እና በበጎ ፈቃደኛ ተመራማሪዎችና ታዛቢዎች ቡድን የሚመራ ነው። የተረጋገጡ ሪፖርቶችን እንሰበስባለን፣ በቀላሉ እንዲረዱ እናደርጋለን፣ እንዲሁም ትኩረትን ወደ ተግባር እንለውጣለን፦ ፊርማዎች፣ ለኮንግረስ የሚላኩ ደብዳቤዎች እና መልሰው ለሚገነቡ ማህበረሰቦች የሚሰጡ ልገሳዎች።"
              : "Ethiopia Crisis Watch is run by Soleyana Shiferaw, a member of the Ethiopian diaspora, with a small group of volunteer researchers and monitors. We collect verified reports, make them easy to understand, and turn attention into action: signatures, letters to Congress, and donations to communities rebuilding.") + '</p>' +
            '<p>' + (isAm
              ? "ከየትኛውም መንግስት፣ የፖለቲካ ፓርቲ ወይም ታጣቂ ቡድን ጋር ግንኙነት የለንም። ስህተቶች ሲያጋጥሙ በተገቢው ልጥፎች ላይ በግልጽ እና በታማኝነት እናርማለን።"
              : "We are not affiliated with any government, political party, or armed faction. We correct mistakes openly and transparently on the relevant posts.") + '</p>' +
          '</div>' +
          '<div class="card stack" style="--gap:.75rem"><h3>' + (isAm ? "የራስዎን እማኝነት በደህና ማጋራት" : "Sharing a firsthand account safely") + '</h3>' +
            '<div class="safety">' + ICON.shield + '<span>' + (isAm
              ? "ሌሎች ሊደርሱበት የማይችሉትን የግል መሣሪያ እና አካውንት ይጠቀሙ። በመጀመሪያው መልእክትዎ ውስጥ የቤተሰብ ስሞችን ወይም ተጋላጭ የሆኑ የመንደር አካባቢዎችን በጭራሽ አያካትቱ።"
              : "Use a private device and account that others cannot access. Never include family names or vulnerable village locations in your initial message.") + '</span></div>' +
            '<p class="small muted">' + (isAm
              ? "ከማተማችን በፊት የግል ስሞችን፣ ፊቶችን፣ ሜታዳታዎችን እና ተለይተው የሚታወቁ ምልክቶችን በጥብቅ እናስወግዳለን። ያለእርስዎ ግልጽ ፈቃድ በጭራሽ አናሳትምም።"
              : "We strictly strip personal names, faces, metadata, and identifiable landmarks before publishing. We never publish without your explicit consent.") + '</p></div>' +
          '<div class="stack" style="--gap:.4rem"><h3>' + (isAm ? "ይከተሉ እና ይመዝገቡ" : "Follow & Subscribe") + '</h3><div class="row">' + CONFIG.social.map(function (s) { return '<a class="btn sm" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a>"; }).join("") +
            '<a class="btn sm ghost" href="/api/feed.xml" target="_blank" rel="noopener">RSS Feed</a>' +
          "</div></div>" +
          '<p class="small muted">' + (isAm ? "ቀጥተኛ አድራሻ፦ " : "Direct Contact: ") + '<span style="user-select:all;color:var(--ink)">' + esc(CONFIG.contactEmail) + '</span> <button class="btn ghost sm" data-copy="' + esc(CONFIG.contactEmail) + '">' + (isAm ? "ቅዳ" : "Copy") + '</button></p>' +
        "</div>" +
        '<form class="card stack" id="contact-form" novalidate>' +
          '<h2 style="font-size:1.3rem">' + (isAm ? "ያግኙን" : "Contact us") + '</h2>' +
          '<div class="field"><label for="c-topic">' + (isAm ? "መልእክትዎ ስለምንድን ነው?" : "What is this about?") + '</label><select id="c-topic" name="topic">' +
            (isAm
              ? '<option value="general">አጠቃላይ ጥያቄ</option><option value="account">የራስዎን እማኝነት ለማጋራት</option><option value="correction">ስህተት ወይም እርማት ለመጠቆም</option><option value="press">ጋዜጣዊ ወይም የትብብር ጥያቄ</option>'
              : '<option>General question</option><option>Share a firsthand account</option><option>Report a correction</option><option>Press or partnership</option>') +
          '</select></div>' +
          '<div class="field"><label for="c-name">' + (isAm ? "ስም " : "Name ") + '<span class="muted">(' + (isAm ? "የመጀመሪያ ስም ወይም ቅጽል ስም ይቻላል" : "a first name or pseudonym is fine") + ')</span></label><input id="c-name" name="name" autocomplete="given-name"></div>' +
          '<div class="field"><label for="c-email">' + (isAm ? "ኢሜይል" : "Email") + '</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>' +
          '<div class="field"><label for="c-msg">' + (isAm ? "መልእክት" : "Message") + '</label><textarea id="c-msg" name="message" required style="min-height:8rem"></textarea></div>' +
          '<button class="btn primary" type="submit">' + (isAm ? "መልእክት ላክ" : "Send message") + '</button>' +
          '<p class="small" id="c-status" role="status"></p>' +
        "</form>" +
      "</div>";
  };

  VIEWS.notfound = function () {
    var isAm = currentLang === "am";
    return '<div class="wrap page-head stack" style="padding-bottom:4rem">' +
      '<h1>' + (isAm ? "ገጹ አልተገኘም" : "Page not found") + '</h1>' +
      '<p class="prose">' + (isAm ? "የተጠቀሙበት ማስፈንጠሪያ ጊዜው ያለፈበት ወይም የተዛወረ ሊሆን ይችላል።" : "That link may be out of date or moved.") + '</p>' +
      '<div class="row">' +
        '<a class="btn primary" href="#home">' + (isAm ? "ወደ መነሻ ገጽ" : "Go home") + '</a>' +
        '<a class="btn" href="#news">' + (isAm ? "ወቅታዊ ዜናዎች" : "Latest updates") + '</a>' +
      '</div></div>';
  };

  var TITLES_EN = { home: "", news: "News & Updates", blog: "Blog", action: "Take Action", donate: "Donate", learn: "Learn", about: "About & Contact" };
  var TITLES_AM = { home: "", news: "ዜናና መረጃዎች", blog: "ብሎግና አስተያየቶች", action: "እርምጃ ይውሰዱ", donate: "ይለግሱ", learn: "እወቅና ተረዳ", about: "ስለ እኛ" };

  /* ── router ─────────────────────────────────────── */
  var routeSeq = 0;
  function route() {
    routeSeq++;
    var h = (location.hash || "#home").slice(1), view = h, arg = null, anchor = null;
    if (h.indexOf("post-") === 0) { view = "post"; arg = h.slice(5); }
    if (h.indexOf("blog-") === 0) { view = "blogpost"; arg = h.slice(5); }
    if (h.indexOf("article-") === 0) { view = "article"; arg = h.slice(8); }
    if (h === "letter") { view = "action"; anchor = "letter"; }
    if (h === "main") return;
    if (!VIEWS[view]) view = "notfound";
    main.innerHTML = '<div class="view">' + VIEWS[view](arg) + "</div>";
    var navKey = view === "post" ? "news" : view === "blogpost" ? "blog" : view === "article" ? "learn" : view;
    document.querySelectorAll(".nav a, .drawer-panel a.nav-item").forEach(function (a) {
      a.getAttribute("href") === "#" + navKey ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    $("#head-donate").hidden = view === "donate" || !CONTENT.campaigns.length;
    var tMap = currentLang === "am" ? TITLES_AM : TITLES_EN;
    var t = view === "post" || view === "blogpost" || view === "article" ? ($("h1", main) || {}).textContent : tMap[view];
    document.title = (t ? t + " · " : "") + (currentLang === "am" ? CONFIG.siteNameAm : CONFIG.siteName);
    closeDrawer();
    applyLang();
    if (view === "news") renderNewsList();
    if (view === "action") renderLetter();
    if (view === "donate") mountWidget();
    if (view === "blog") loadBlogList();
    if (view === "blogpost") loadBlogPost(arg);
    if (anchor) { var el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
    else window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  /* ── behaviour ──────────────────────────────────── */
  function renderLetter() {
    var p = $("#letter-paper"); if (p) p.textContent = letterText();
  }

  function mountWidget() {
    var host = $("#gfm-widget"), c = featured();
    if (!CONFIG.gofundmeWidget || !host || !c) return;
    host.innerHTML = '<div class="gfm-embed" data-url="' + esc(c.gofundmeUrl.replace(/\/+$/, "") + "/widget/large") + '"></div>';
    var s = document.createElement("script"); s.defer = true; s.src = "https://www.gofundme.com/static/js/embed.js"; document.body.appendChild(s);
  }

  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600); }

  function copy(text, done) {
    var ok = function () { toast(done || (currentLang === "am" ? "ተቀድቷል" : "Copied")); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var failMsg = currentLang === "am" ? "ጽሑፉን መርጠው በእጅዎ ይቅዱ" : "Select the text and copy manually";
      try { document.execCommand("copy") ? ok() : toast(failMsg); } catch (e) { toast(failMsg); }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  var drawer = $("#drawer"), menuBtn = $("#menu-open");
  function openDrawer() { drawer.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); $(".drawer-panel a.nav-item", drawer).focus(); }
  function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", openDrawer);
  drawer.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) { closeDrawer(); menuBtn.focus(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) { closeDrawer(); menuBtn.focus(); } });

  /* Theme and Language buttons */
  var themeBtn = $("#theme-toggle"), drawerThemeBtn = $("#drawer-theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  if (drawerThemeBtn) drawerThemeBtn.addEventListener("click", toggleTheme);

  var langBtn = $("#lang-toggle"), drawerLangBtn = $("#drawer-lang-toggle");
  if (langBtn) langBtn.addEventListener("click", toggleLang);
  if (drawerLangBtn) drawerLangBtn.addEventListener("click", toggleLang);

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) {
      e.preventDefault();
      copy(b.getAttribute("data-copy"), currentLang === "am" ? "ማስፈንጠሪያው ተቀድቷል" : "Link copied");
      return;
    }
    var chip = e.target.closest("[data-region]");
    if (chip) {
      newsState.region = chip.getAttribute("data-region"); store("region", newsState.region);
      document.querySelectorAll("[data-region]").forEach(function (c) { c.setAttribute("aria-pressed", c === chip); });
      renderNewsList(); return;
    }
    var go = e.target.closest("[data-go-region]");
    if (go) {
      newsState.region = go.getAttribute("data-go-region");
      store("region", newsState.region);
    }
    /* Interactive Map Region Selection */
    var mapPath = e.target.closest("[data-map-region]");
    if (mapPath) {
      var r = mapPath.getAttribute("data-map-region");
      mapSelectedRegion = r;
      document.querySelectorAll(".et-region").forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-map-region") === r);
      });
      var panel = $("#map-info-panel");
      if (panel) {
        var info = (CONTENT.regionsInfo || []).filter(function (x) { return x.name === r; })[0];
        var infoName = info ? (currentLang === "am" && info.nameAm ? info.nameAm : (currentLang === "am" ? rName(r) : info.name)) : rName(r);
        var infoText = info ? (currentLang === "am" && info.textAm ? info.textAm : info.text) : (currentLang === "am" ? "ክትትል በመካሄድ ላይ ነው።" : "Monitoring active.");
        var postCount = (CONTENT.posts || []).filter(function (p) { return p.region === r; }).length;
        var stDict = REGION_STATUSES_I18N[currentLang] || REGION_STATUSES_I18N.en;
        var st = stDict[r] || { status: (currentLang === "am" ? "ክትትል ላይ" : "Monitoring Active"), tone: "normal" };

        panel.innerHTML = '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
          '<div><span class="eyebrow">' + (currentLang === "am" ? "ክልላዊ ትኩረት" : "Regional Focus") + '</span><h3 style="font-size:1.5rem;margin-top:.2rem">' + esc(infoName) + '</h3></div>' +
          '<span class="map-status-pill ' + esc(st.tone) + '">' + esc(st.status) + '</span>' +
        '</div>' +
        '<p class="prose small" style="margin-top:.2rem">' + esc(infoText) + '</p>' +
        '<div class="row" style="margin-top:auto;justify-content:space-between">' +
          '<span class="small muted">' + (currentLang === "am" ? ('<b>' + postCount + '</b> የተረጋገጡ መረጃዎች') : ('<b>' + postCount + '</b> verified update' + (postCount === 1 ? '' : 's'))) + '</span>' +
          '<a class="btn primary sm" href="#news" data-go-region="' + esc(r) + '">' + (currentLang === "am" ? ('የ' + rName(r) + ' ዜናዎችን አሳይ →') : ('Filter news for ' + esc(r) + ' →')) + '</a>' +
        '</div>';
      }
      return;
    }
    var rb = e.target.closest("[data-react]");
    if (rb) { react(location.hash.slice(6), rb.getAttribute("data-react")); return; }
    if (e.target.closest("#copy-letter")) {
      copy(letterText(), currentLang === "am" ? "ደብዳቤው ተቀድቷል። በተወካይዎ ቅጽ ላይ ይለጥፉት።" : "Letter copied. Paste it into your representative's constituent form.");
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "news-q") { newsState.q = e.target.value; renderNewsList(); }
    if (e.target.closest("#letter-form")) {
      letterState[e.target.name] = e.target.value;
      store("letter", letterState);
      if (e.target.name === "country") {
        /* Re-render action view so lookup links update to the new country */
        route();
      } else {
        renderLetter();
      }
    }
  });

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function post(endpoint, data) {
    return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); });
  }

  document.addEventListener("submit", function (e) {
    var f = e.target; e.preventDefault();
    if (f.id === "nl-form") {
      var em = $("#nl-email").value.trim(), msg = $("#nl-msg");
      if (!validEmail(em)) {
        msg.textContent = currentLang === "am" ? "እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።" : "Enter an email address like name@email.com.";
        $("#nl-email").focus();
        return;
      }
      if (!CONFIG.newsletterEndpoint) {
        msg.textContent = currentLang === "am" ? "የመመዝገቢያ ስርዓቱ ገና ስላልተገናኘ ምንም አልተላከም።" : "Signup isn't connected yet, so nothing was sent.";
        return;
      }
      msg.textContent = currentLang === "am" ? "በመመዝገብ ላይ…" : "Subscribing…";
      post(CONFIG.newsletterEndpoint, { email: em }).then(function () {
        msg.textContent = currentLang === "am" ? "ተመዝግበዋል። ለማረጋገጥ ኢሜይልዎን ይመልከቱ።" : "You're subscribed. Check your inbox to confirm.";
        f.reset();
      }, function () {
        msg.textContent = currentLang === "am" ? "አልተሳካም። እባክዎ ግንኙነትዎን ፈትሸው እንደገና ይሞክሩ።" : "That didn't go through. Check your connection and try again.";
      });
    }
    if (f.id === "contact-form") {
      var st = $("#c-status"), data = { topic: $("#c-topic").value, name: $("#c-name").value.trim(), email: $("#c-email").value.trim(), message: $("#c-msg").value.trim() };
      if (!validEmail(data.email)) {
        st.textContent = currentLang === "am" ? "መልስ ለመስጠት እንድንችል ኢሜይልዎን ያስገቡ።" : "Add an email address so we can reply.";
        $("#c-email").focus();
        return;
      }
      if (!data.message) {
        st.textContent = currentLang === "am" ? "እባክዎ ከመላክዎ በፊት መልእክት ይጻፉ።" : "Write a message before sending.";
        $("#c-msg").focus();
        return;
      }
      if (!CONFIG.contactEndpoint) {
        st.textContent = (currentLang === "am" ? "የእውቂያ ቅጹ ገና አልተገናኘም። በ " : "The form isn't connected yet. Email ") + CONFIG.contactEmail + (currentLang === "am" ? " ይጻፉልን።" : " instead.");
        return;
      }
      st.textContent = currentLang === "am" ? "በመላክ ላይ…" : "Sending…";
      post(CONFIG.contactEndpoint, data).then(function () {
        st.textContent = currentLang === "am" ? "መልእክትዎ ተልኳል። በሁለት ቀናት ውስጥ ምላሽ እንሰጣለን።" : "Message sent. We usually reply within two days.";
        f.reset();
      }, function () {
        st.textContent = (currentLang === "am" ? "መልእክቱ አልተላከም። እንደገና ይሞክሩ ወይም በ " : "That didn't go through. Try again, or email ") + CONFIG.contactEmail + (currentLang === "am" ? " ያግኙን።" : ".");
      });
    }
  });

  $("#foot-social").innerHTML = CONFIG.social.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a></li>"; }).join("");
  if (CONTENT.posts.length) $("#foot-updated").textContent = currentLang === "am" ? ("የመጨረሻ ዝመና፦ " + eDate(CONTENT.posts[0].date)) : ("Last updated " + gDate(CONTENT.posts[0].date));
  if (!CONTENT.campaigns.length) { $("#action-bar .primary").hidden = true; $("#action-bar").style.gridTemplateColumns = "1fr"; }

  window.addEventListener("hashchange", route);
  applyLang();
  route();
})();
