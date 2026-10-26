/* Keeps only the formatting the admin editor can produce (paragraphs, headings,
   bold, italic, lists, quotes, links, images) and drops everything else,
   including scripts, styles, and event handlers. Used by the public blog page
   and by the admin editor when you paste text in. */
(function () {
  var ALLOWED = {
    P: [], BR: [], H2: [], H3: [], STRONG: [], B: [], EM: [], I: [], U: [],
    UL: [], OL: [], LI: [], BLOCKQUOTE: [], A: ["href"], IMG: ["src", "alt"],
    FIGURE: [], FIGCAPTION: []
  };
  var RENAME = { H1: "H2", H4: "H3", H5: "H3", H6: "H3", DIV: "P" };
  var DROP_WITH_CONTENT = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, SVG: 1, MATH: 1, NOSCRIPT: 1, HEAD: 1, TITLE: 1, META: 1, LINK: 1 };

  function safeUrl(u, forImage) {
    u = String(u || "").trim();
    if (forImage) return /^(\/api\/images\/[\w-]+|https:\/\/)/i.test(u) ? u : "";
    return /^(https?:|mailto:|#|\/)/i.test(u) ? u : "";
  }

  function clean(node, doc) {
    var out = doc.createDocumentFragment();
    Array.prototype.forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) { out.appendChild(doc.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      var tag = n.nodeName.toUpperCase();
      if (DROP_WITH_CONTENT[tag]) return;
      tag = RENAME[tag] || tag;
      if (!ALLOWED[tag]) { out.appendChild(clean(n, doc)); return; }   // unwrap, keep the text
      var el = doc.createElement(tag);
      if (tag === "A") {
        var href = safeUrl(n.getAttribute("href"));
        if (!href) { out.appendChild(clean(n, doc)); return; }
        el.setAttribute("href", href);
        if (/^https?:/i.test(href)) { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
      }
      if (tag === "IMG") {
        var src = safeUrl(n.getAttribute("src"), true);
        if (!src) return;
        el.setAttribute("src", src);
        el.setAttribute("alt", n.getAttribute("alt") || "");
        el.setAttribute("loading", "lazy");
        out.appendChild(el); return;
      }
      el.appendChild(clean(n, doc));
      out.appendChild(el);
    });
    return out;
  }

  window.sanitizeHtml = function (html) {
    var doc = new DOMParser().parseFromString("<body>" + String(html || ""), "text/html");
    var box = document.createElement("div");
    box.appendChild(clean(doc.body, document));
    return box.innerHTML;
  };
})();
