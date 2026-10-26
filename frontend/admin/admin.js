/* Admin page: log in, write and publish blog posts, manage authors, read messages, see subscribers.
   Pages (by link): #posts, #new, #edit-<id>, #authors, #messages, #subscribers. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var main = $("#main");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var currentUser = null;

  function api(path, opts) {
    opts = opts || {};
    var headers = { Accept: "application/json" }, body = opts.body;
    if (body && !(body instanceof Blob)) { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
    if (body instanceof Blob) headers["Content-Type"] = body.type;
    return fetch("/api" + path, { method: opts.method || "GET", headers: headers, body: body })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (r.status === 401 && path !== "/admin/login") { showLogin("You were logged out. Log in again."); }
          if (!r.ok) { var e = new Error(d.error || "Something went wrong (" + r.status + ")"); e.status = r.status; throw e; }
          return d;
        });
      }, function () { throw new Error("Can't reach the server. Check your connection."); });
  }

  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200); }

  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function showDay(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
  function showTime(s) { return new Date(s.replace(" ", "T") + "Z").toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
  function setPage(html) { main.innerHTML = '<div class="view">' + html + "</div>"; window.scrollTo(0, 0); }
  function empty(title, text) { return '<div class="empty card"><p><b>' + title + "</b></p>" + (text ? '<p class="small" style="margin-top:.35rem">' + text + "</p>" : "") + "</div>"; }

  /* ── login ─────────────────────────────────────────── */
  function showLogin(note) {
    dirty = false;
    currentUser = null;
    $("#tabs").hidden = true; $("#logout").hidden = true;
    var pill = $("#user-pill"); if (pill) pill.hidden = true;
    setPage('<form class="card stack login" id="login-form">' +
      '<h1 style="font-size:1.6rem">Log in</h1>' +
      '<p class="muted small">' + esc(note || "Enter your author or administrator email and password.") + "</p>" +
      '<div class="field"><label for="l-email">Email <span class="muted">(or leave blank if primary admin)</span></label><input id="l-email" type="email" autocomplete="username" placeholder="author@crisiswatcher.org"></div>' +
      '<div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn primary block" type="submit">Log in</button>' +
      '<p class="small" id="login-msg" role="status"></p></form>');
    $("#pw").focus();
  }
  function showSetupNeeded() {
    setPage('<div class="card stack login"><h1 style="font-size:1.6rem">Almost ready</h1>' +
      '<p class="prose">The admin password hasn\'t been set yet. Follow the step "Set your admin password" in the README, then reload this page.</p></div>');
  }

  function updateUserUI() {
    var pill = $("#user-pill");
    var tabAuthors = $("#tab-authors");
    var tabMessages = $("#tab-messages");
    var tabSubscribers = $("#tab-subscribers");
    var tabGuide = $("#tab-guide");

    if (currentUser && pill) {
      pill.hidden = false;
      pill.innerHTML = '<span>' + esc(currentUser.name) + '</span><span class="role-badge ' + esc(currentUser.role) + '">' + esc(currentUser.role) + '</span>';
    } else if (pill) {
      pill.hidden = true;
    }

    var isAdmin = currentUser && currentUser.role === "admin";
    if (tabAuthors) tabAuthors.hidden = !isAdmin;
    if (tabMessages) tabMessages.hidden = !isAdmin;
    if (tabSubscribers) tabSubscribers.hidden = !isAdmin;
    if (tabGuide) tabGuide.hidden = !isAdmin;
  }

  /* ── router ────────────────────────────────────────── */
  var dirty = false, currentHash = location.hash, ignoreNext = false;
  window.addEventListener("hashchange", function () {
    if (ignoreNext) { ignoreNext = false; return; }
    if (dirty && !confirm("You have changes that aren't saved. Leave anyway?")) { ignoreNext = true; location.hash = currentHash; return; }
    dirty = false; route();
  });
  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  function route() {
    currentHash = location.hash;
    var h = (location.hash || "#posts").slice(1), tab = h;
    $("#tabs").hidden = false; $("#logout").hidden = false;
    updateUserUI();

    var isAdmin = currentUser && currentUser.role === "admin";

    if (h === "new") { tab = "posts"; editPost(null); }
    else if (h.indexOf("edit-") === 0) { tab = "posts"; editPost(decodeURIComponent(h.slice(5))); }
    else if (h === "authors") {
      if (!isAdmin) { toast("Authors can only access blog posts."); location.hash = "#posts"; return; }
      authorsPage();
    }
    else if (h === "messages") {
      if (!isAdmin) { toast("Authors cannot access contact messages."); location.hash = "#posts"; return; }
      messagesPage();
    }
    else if (h === "subscribers") {
      if (!isAdmin) { toast("Authors cannot access subscriber lists."); location.hash = "#posts"; return; }
      subscribersPage();
    }
    else if (h === "guide") {
      if (!isAdmin) { toast("Guide & Notes are restricted to administrators."); location.hash = "#posts"; return; }
      guidePage();
    }
    else { tab = "posts"; postsPage(); }

    document.querySelectorAll("#tabs a").forEach(function (a) {
      a.getAttribute("href") === "#" + tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
  }

  function setUnread(n) { var b = $("#unread"); if (b) { b.hidden = !n; b.textContent = n; } }

  /* ── posts list ────────────────────────────────────── */
  function postsPage() {
    var titleText = currentUser && currentUser.role === "author" ? "Your posts & articles" : "All blog posts";
    setPage('<div class="wrap page-head row" style="justify-content:space-between"><div><p class="eyebrow">Blog</p><h1 style="margin-top:.4rem">' + titleText + '</h1></div>' +
      '<a class="btn primary lg" href="#new">+ New post</a></div><div class="wrap admin-list" id="post-list">' + empty("Loading…") + "</div>");
    api("/admin/posts").then(function (d) {
      if (d.user) { currentUser = d.user; updateUserUI(); }
      setUnread(d.unreadMessages);
      var list = $("#post-list"); if (!list) return;
      list.innerHTML = d.posts.length ? d.posts.map(function (p) {
        var authorTag = p.author_name ? '<span class="dot">By ' + esc(p.author_name) + '</span>' : '';
        var canEditClass = p.canEdit ? "" : " readonly";
        var lockTag = p.canEdit ? "" : '<span class="lock-tag dot">🔒 View only</span>';

        return '<a class="card admin-row' + canEditClass + '" href="#edit-' + encodeURIComponent(p.id) + '">' +
          "<h3>" + esc(p.title) + '</h3><span class="status ' + p.status + '">' + (p.status === "published" ? "Published" : "Draft") + "</span>" +
          '<div class="meta"><span>' + showDay(p.date) + "</span>" + authorTag + lockTag +
          (p.status === "published" ? '<span class="dot counts"><span>👍 ' + p.likes + "</span><span>👎 " + p.dislikes + "</span></span>" : '<span class="dot">Only authors & admins can see this</span>') +
          "</div></a>";
      }).join("") : empty("No posts yet.", 'Click "New post" to write your first one.');
    }, function (e) { var list = $("#post-list"); if (list) list.innerHTML = empty("Couldn't load posts.", esc(e.message)); });
  }

  /* ── editor ────────────────────────────────────────── */
  var post = null;

  function editPost(id) {
    setPage('<div class="wrap" style="padding-top:1.5rem">' + empty("Loading…") + "</div>");
    if (!id) {
      post = {
        id: null,
        title: "",
        summary: "",
        body: "",
        date: today(),
        status: "draft",
        author_name: (currentUser && currentUser.name) || "",
        canEdit: true
      };
      renderEditor();
      return;
    }
    api("/admin/posts/" + encodeURIComponent(id)).then(function (d) {
      post = d.post;
      renderEditor();
    }, function (e) {
      if (e.status !== 401) setPage('<div class="wrap" style="padding-top:1.5rem">' + empty("Couldn't open this post.", esc(e.message)) + "</div>");
    });
  }

  var TOOLS = [
    ["bold", "<b>B</b>", "Bold (Ctrl+B)"], ["italic", "<i>I</i>", "Italic (Ctrl+I)"], ["sep"],
    ["h2", "Heading", "Large heading"], ["h3", "Subheading", "Small heading"], ["p", "Normal", "Normal text"], ["sep"],
    ["ul", "• List", "Bulleted list"], ["ol", "1. List", "Numbered list"], ["quote", "❝ Quote", "Quote"], ["sep"],
    ["link", "🔗 Link", "Add a link to the selected text"], ["image", "🖼 Photo", "Add a photo"], ["sep"],
    ["undo", "Undo", "Undo (Ctrl+Z)"], ["redo", "Redo", "Redo (Ctrl+Y)"]
  ];

  function renderEditor() {
    var isEditable = post.canEdit !== false;
    var readonlyBanner = !isEditable ?
      '<div class="readonly-notice" style="margin-top:1rem">🔒 <b>Read-only mode:</b> This post was written by ' + esc(post.author_name || "another author") + '. Only they or an administrator can make changes.</div>' : '';

    setPage('<div class="wrap" style="padding-block:1.25rem 3rem">' +
      '<a class="back" href="#posts">← All posts</a>' +
      readonlyBanner +
      '<div class="editor-grid" style="margin-top:1rem">' +
        '<div class="stack" style="--gap:.75rem">' +
          '<label class="sr-only" for="e-title">Title</label><input class="title-input" id="e-title" placeholder="Post title" maxlength="200" value="' + esc(post.title) + '"' + (!isEditable ? " readonly" : "") + ">" +
          "<div>" +
            (isEditable ? '<div class="toolbar" role="toolbar" aria-label="Formatting">' + TOOLS.map(function (t) {
              return t[0] === "sep" ? '<span class="sep" aria-hidden="true"></span>' : '<button type="button" data-tool="' + t[0] + '" title="' + t[2] + '" aria-label="' + t[2] + '">' + t[1] + "</button>";
            }).join("") + "</div>" : "") +
            '<div class="editor rich" id="e-body" ' + (isEditable ? 'contenteditable="true"' : 'contenteditable="false"') + ' role="textbox" aria-multiline="true" aria-label="Post" data-placeholder="Start writing…"></div>' +
          "</div>" +
          '<p class="small muted" id="e-words"></p>' +
          '<input type="file" id="e-file" accept="image/*" hidden>' +
        "</div>" +
        '<aside class="card stack editor-side" id="e-side"></aside>' +
      "</div></div>");

    var body = $("#e-body");
    body.innerHTML = sanitizeHtml(post.body) || "<p><br></p>";
    updatePlaceholder();
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}
    renderSide(); updateWords();
    if (!post.id && isEditable) $("#e-title").focus();
  }

  function renderSide(saveNote) {
    var pub = post.status === "published";
    var isEditable = post.canEdit !== false;
    var isAdmin = currentUser && currentUser.role === "admin";

    var authorField = "";
    if (isAdmin) {
      authorField = '<div class="field"><label for="e-author">Author byline</label><input id="e-author" placeholder="Author name" value="' + esc(post.author_name || (currentUser ? currentUser.name : "")) + '"' + (!isEditable ? " readonly" : "") + '><span class="hint">Shown on the public blog.</span></div>';
    } else {
      authorField = '<div class="stack" style="--gap:.2rem"><span class="eyebrow">Author</span><p class="small"><b>' + esc(post.author_name || (currentUser ? currentUser.name : "Author")) + '</b></p></div>';
    }

    $("#e-side").innerHTML =
      '<div class="row" style="justify-content:space-between"><span class="status ' + post.status + '">' + (pub ? "Published" : "Draft") + '</span>' +
        '<span class="save-state' + (dirty ? " dirty" : "") + '" id="e-state">' + (dirty ? "Not saved yet" : esc(saveNote || (post.id ? "All changes saved" : ""))) + "</span></div>" +
      authorField +
      '<div class="field"><label for="e-summary">Summary</label><textarea id="e-summary" maxlength="400" style="min-height:5rem" placeholder="One or two sentences"' + (!isEditable ? " readonly" : "") + '>' + esc(post.summary) + '</textarea><span class="hint">Shown under the title on the blog list.</span></div>' +
      '<div class="field"><label for="e-date">Date shown on the post</label><input id="e-date" type="date" value="' + esc(post.date) + '"' + (!isEditable ? " readonly" : "") + "></div>" +
      (isEditable ?
        ('<button class="btn primary block lg" data-save="published">' + (pub ? "Update post" : "Publish") + "</button>" +
         '<button class="btn block" data-save="draft">' + (pub ? "Unpublish (back to draft)" : "Save draft") + "</button>") : "") +
      (pub ? '<a class="btn ghost block" href="/#blog-' + encodeURIComponent(post.id) + '" target="_blank" rel="noopener">View on the site ↗</a>' : "") +
      (post.id && isEditable ? '<button class="btn ghost block" id="e-delete" style="color:var(--red)">Delete post</button>' : "") +
      '<p class="small muted">' + (pub ? "Readers can see this post." : "Only you and admins can see drafts.") + "</p>";
  }

  function markDirty() {
    if (post && post.canEdit === false) return;
    if (!dirty) { dirty = true; var s = $("#e-state"); if (s) { s.textContent = "Not saved yet"; s.classList.add("dirty"); } }
  }
  function updatePlaceholder() {
    var b = $("#e-body"); if (b) b.classList.toggle("is-empty", !b.innerText.trim() && !b.querySelector("img"));
  }

  var BLOCKS = { P: 1, H2: 1, H3: 1, UL: 1, OL: 1, BLOCKQUOTE: 1, FIGURE: 1 };
  function tidyHtml(html) {
    var box = document.createElement("div"), out = document.createElement("div"), para = null;
    box.innerHTML = sanitizeHtml(html);
    Array.prototype.slice.call(box.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && BLOCKS[n.nodeName]) { para = null; out.appendChild(n); return; }
      if (n.nodeName === "BR") { para = null; return; }
      if (!para) { para = document.createElement("p"); out.appendChild(para); }
      para.appendChild(n);
    });
    Array.prototype.slice.call(out.children).forEach(function (el) {
      if (!el.textContent.replace(/ /g, " ").trim() && !el.querySelector("img")) el.remove();
    });
    return out.innerHTML;
  }

  function updateWords() {
    var w = $("#e-words"); if (!w) return;
    var n = ($("#e-body").innerText.match(/\S+/g) || []).length;
    w.textContent = n + (n === 1 ? " word" : " words") + (n ? " · about " + Math.max(1, Math.round(n / 220)) + " min read" : "");
  }

  var saving = false;
  function save(status) {
    if (saving || (post && post.canEdit === false)) return;
    var authorInput = $("#e-author");
    var payload = {
      title: $("#e-title").value.trim(),
      summary: $("#e-summary").value.trim(),
      body: tidyHtml($("#e-body").innerHTML),
      date: $("#e-date").value || today(),
      status: status,
      author_name: authorInput ? authorInput.value.trim() : (post.author_name || (currentUser ? currentUser.name : ""))
    };
    if (!payload.title) { toast("Give the post a title first."); $("#e-title").focus(); return; }
    if (status === "draft" && post.status === "published" && !confirm("Unpublish this post? Readers won't see it until you publish it again.")) return;
    saving = true;
    var s = $("#e-state"); if (s) s.textContent = "Saving…";
    var req = post.id ? api("/admin/posts/" + encodeURIComponent(post.id), { method: "PUT", body: payload }) : api("/admin/posts", { method: "POST", body: payload });
    req.then(function (d) {
      var wasPublished = post.status === "published";
      post = d.post; dirty = false;
      currentHash = "#edit-" + encodeURIComponent(post.id);
      history.replaceState(null, "", currentHash);
      renderSide("Saved at " + new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
      toast(status === "published" ? (wasPublished ? "Post updated." : "Published! It's live on the site.") : (wasPublished ? "Unpublished. It's a draft again." : "Draft saved."));
    }, function (e) {
      var s = $("#e-state"); if (s) { s.textContent = "Not saved"; s.classList.add("dirty"); }
      toast(e.message);
    }).then(function () { saving = false; });
  }

  function deletePost() {
    if (post && post.canEdit === false) { toast("You can only delete your own posts."); return; }
    if (!confirm('Delete "' + post.title + '"? This can\'t be undone. Its likes and dislikes are deleted too.')) return;
    api("/admin/posts/" + encodeURIComponent(post.id), { method: "DELETE" }).then(function () {
      dirty = false; toast("Post deleted."); location.hash = "#posts";
    }, function (e) { toast(e.message); });
  }

  var savedRange = null;
  function keepSelection() { var s = getSelection(); if (s.rangeCount && $("#e-body").contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); }
  function restoreSelection() {
    var body = $("#e-body"); body.focus();
    if (savedRange) { var s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
  }
  function exec(cmd, value) { document.execCommand(cmd, false, value); markDirty(); updateWords(); }

  function runTool(tool) {
    if (post && post.canEdit === false) return;
    var body = $("#e-body"); body.focus();
    switch (tool) {
      case "bold": case "italic": case "undo": case "redo": exec(tool); break;
      case "h2": exec("formatBlock", "<h2>"); break;
      case "h3": exec("formatBlock", "<h3>"); break;
      case "p": exec("formatBlock", "<p>"); break;
      case "quote": exec("formatBlock", "<blockquote>"); break;
      case "ul": exec("insertUnorderedList"); break;
      case "ol": exec("insertOrderedList"); break;
      case "link": addLink(); break;
      case "image": keepSelection(); $("#e-file").value = ""; $("#e-file").click(); break;
    }
  }

  function addLink() {
    keepSelection();
    var selected = String(getSelection());
    var url = prompt(selected ? "Paste the web address for \"" + selected.slice(0, 60) + "\":" : "Paste the web address:", "https://");
    if (!url || url === "https://") return;
    url = url.trim();
    if (!/^(https?:|mailto:)/i.test(url)) url = (url.indexOf("@") > -1 && url.indexOf("/") < 0 ? "mailto:" : "https://") + url;
    restoreSelection();
    if (selected) exec("createLink", url);
    else exec("insertHTML", '<a href="' + esc(url) + '">' + esc(url) + "</a>&nbsp;");
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      if (file.type === "image/gif") { resolve(file); return; }
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, 1600 / img.naturalWidth), c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("Couldn't read that photo.")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file isn't a photo this browser can read.")); };
      img.src = url;
    });
  }
  function uploadImage(file) {
    if (post && post.canEdit === false) return;
    if (!file || !/^image\//.test(file.type)) { toast("Choose a photo (JPG, PNG, WebP, or GIF)."); return; }
    toast("Adding photo…");
    resizeImage(file).then(function (blob) { return api("/admin/images", { method: "POST", body: blob }); }).then(function (d) {
      var alt = prompt("Describe the photo in a few words. This helps blind readers and is optional.", "") || "";
      restoreSelection();
      exec("insertHTML", '<p><img src="' + esc(d.url) + '" alt="' + esc(alt) + '"></p><p><br></p>');
      toast("Photo added.");
    }, function (e) { toast(e.message); });
  }

  /* ── Authors & Team Management (Admin Only) ───────── */
  var showNewAuthorForm = false;
  function authorsPage() {
    setPage('<div class="wrap page-head row" style="justify-content:space-between"><div><p class="eyebrow">Team &amp; Access</p><h1 style="margin-top:.4rem">Authors &amp; Writers</h1>' +
      '<p class="prose">Manage people who can log in to write posts. Authors can create and edit their own posts.</p></div>' +
      '<button class="btn primary lg" id="btn-toggle-author">' + (showNewAuthorForm ? "Hide form" : "+ Add Author") + '</button></div>' +
      '<div class="wrap stack" id="authors-container">' +
        (showNewAuthorForm ?
          '<form class="card stack" id="new-author-form" style="max-width:32rem;margin-bottom:1.5rem">' +
            '<h3>Invite a new author</h3>' +
            '<div class="field"><label for="u-name">Full name</label><input id="u-name" required placeholder="e.g. Makeda Wolde"></div>' +
            '<div class="field"><label for="u-email">Email address</label><input id="u-email" type="email" required placeholder="makeda@example.com"></div>' +
            '<div class="field"><label for="u-pass">Temporary password</label><input id="u-pass" type="password" minlength="8" required placeholder="At least 8 characters"></div>' +
            '<div class="field"><label for="u-role">Role</label><select id="u-role">' +
              '<option value="author" selected>Author (can write &amp; edit their own posts)</option>' +
              '<option value="admin">Administrator (full site access)</option>' +
            '</select></div>' +
            '<div class="row"><button class="btn primary" type="submit">Create account</button><button class="btn ghost" type="button" id="btn-cancel-author">Cancel</button></div>' +
            '<p class="small muted" id="author-form-msg" role="status"></p>' +
          '</form>' : '') +
        '<div class="author-grid" id="author-list">' + empty("Loading authors…") + '</div>' +
      '</div>');

    api("/admin/users").then(function (d) {
      var list = $("#author-list"); if (!list) return;
      list.innerHTML = d.users.length ? d.users.map(function (u) {
        var isSelf = currentUser && u.id === currentUser.id;
        return '<div class="card author-card">' +
          '<h3>' + esc(u.name) + '<span class="role-badge ' + esc(u.role) + '">' + esc(u.role) + '</span></h3>' +
          '<p class="small muted" style="user-select:all">' + esc(u.email) + '</p>' +
          '<div class="meta"><span><b>' + (u.post_count || 0) + '</b> post' + (u.post_count === 1 ? '' : 's') + '</span><span class="dot">Added ' + showDay(u.created_at.slice(0, 10)) + '</span></div>' +
          '<div class="author-actions">' +
            '<button class="btn sm" data-reset-pw="' + esc(u.id) + '" data-user-name="' + esc(u.name) + '">Reset password</button>' +
            (!isSelf ? '<button class="btn ghost sm" style="color:var(--red)" data-del-user="' + esc(u.id) + '" data-user-name="' + esc(u.name) + '">Delete</button>' : '<span class="small muted" style="margin-left:auto">(You)</span>') +
          '</div>' +
        '</div>';
      }).join("") : empty("No authors yet.");
    }, function (e) {
      var list = $("#author-list"); if (list) list.innerHTML = empty("Couldn't load authors.", esc(e.message));
    });
  }

  /* ── messages ──────────────────────────────────────── */
  function messagesPage() {
    setPage('<div class="wrap page-head"><p class="eyebrow">Contact form</p><h1 style="margin-top:.4rem">Messages</h1>' +
      '<p class="prose">What people sent through the Contact form on the About page. Reply by email.</p></div><div class="wrap admin-list" id="msg-list">' + empty("Loading…") + "</div>");
    api("/admin/messages").then(function (d) {
      var list = $("#msg-list"); if (!list) return;
      setUnread(d.messages.filter(function (m) { return !m.is_read; }).length);
      list.innerHTML = d.messages.length ? d.messages.map(function (m) {
        var reply = "mailto:" + m.email + "?subject=" + encodeURIComponent("Re: your message to " + CONFIG.siteName);
        return '<div class="card stack msg-card' + (m.is_read ? "" : " unread") + '" style="--gap:.6rem">' +
          '<div class="row" style="justify-content:space-between"><span class="eyebrow">' + esc(m.topic || "Message") + '</span><span class="small muted">' + showTime(m.created_at) + "</span></div>" +
          "<p><b>" + esc(m.name || "No name given") + '</b> <span class="muted">' + esc(m.email) + "</span></p>" +
          '<p class="message">' + esc(m.message) + "</p>" +
          '<div class="row" style="--gap:.4rem"><a class="btn primary sm" href="' + esc(reply) + '" data-read="' + m.id + '">Reply by email</a>' +
          '<button class="btn sm" data-toggle-read="' + m.id + '" data-is-read="' + m.is_read + '">' + (m.is_read ? "Mark as unread" : "Mark as read") + "</button>" +
          '<button class="btn ghost sm" style="color:var(--red)" data-del-msg="' + m.id + '">Delete</button></div></div>';
      }).join("") : empty("No messages yet.", "When someone uses the Contact form, their message shows up here.");
    }, function (e) { var list = $("#msg-list"); if (list) list.innerHTML = empty("Couldn't load messages.", esc(e.message)); });
  }

  /* ── subscribers ───────────────────────────────────── */
  var subscribers = [];
  function subscribersPage() {
    setPage('<div class="wrap page-head"><p class="eyebrow">Newsletter</p><h1 style="margin-top:.4rem">Subscribers</h1>' +
      '<p class="prose">People who signed up for updates. Copy the list into your email program to send a newsletter.</p></div><div class="wrap stack" id="sub-list">' + empty("Loading…") + "</div>");
    api("/admin/subscribers").then(function (d) {
      subscribers = d.subscribers;
      var box = $("#sub-list"); if (!box) return;
      box.innerHTML = subscribers.length ?
        '<div class="row"><b>' + subscribers.length + (subscribers.length === 1 ? " subscriber" : " subscribers") + '</b><button class="btn sm" id="copy-subs">Copy all emails</button><button class="btn sm" id="csv-subs">Download spreadsheet (CSV)</button></div>' +
        '<div class="card" style="padding:.25rem 1rem">' + subscribers.map(function (s) {
          return '<div class="row" style="justify-content:space-between;padding:.6rem 0;border-bottom:1px solid var(--line)"><span style="overflow-wrap:anywhere">' + esc(s.email) + '</span><span class="row" style="--gap:.5rem"><span class="small muted">' + showTime(s.created_at) + '</span><button class="btn ghost sm" data-del-sub="' + esc(s.email) + '">Remove</button></span></div>';
        }).join("") + "</div>"
        : empty("No subscribers yet.", "Sign-ups from the newsletter box at the bottom of every page show up here.");
    }, function (e) { var box = $("#sub-list"); if (box) box.innerHTML = empty("Couldn't load subscribers.", esc(e.message)); });
  }

  /* ── admin operator guide & notes ─────────────────── */
  function guidePage() {
    setPage('<div class="wrap page-head"><p class="eyebrow">Admin Manual &amp; Notes</p><h1 style="margin-top:.4rem">Administrator Operations Guide</h1>' +
      '<p class="prose">Complete private reference notes for site operations, author onboarding, security protocols, and deployment commands.</p></div>' +

      '<div class="wrap stack" style="padding-bottom:3rem;--gap:1.5rem">' +

        /* Quick Navigation */
        '<div class="row" style="--gap:.5rem">' +
          '<a class="btn sm" href="#g-commands">CLI Commands</a>' +
          '<a class="btn sm" href="#g-authors">Managing Authors</a>' +
          '<a class="btn sm" href="#g-blog">Publishing Posts</a>' +
          '<a class="btn sm" href="#g-security">Witness Privacy</a>' +
          '<a class="btn sm" href="#g-domain">.org Domain Setup</a>' +
        '</div>' +

        /* 1. Terminal Commands Cheat Sheet */
        '<div class="guide-card" id="g-commands">' +
          '<h2>⚡ Essential Terminal Commands</h2>' +
          '<p class="prose small">Run these in your local project folder to develop, apply migrations, and deploy:</p>' +
          '<div class="stack" style="--gap:.6rem">' +
            '<p class="small"><b>Start Local Dev Server:</b></p>' +
            '<div class="code-box"><code>npm run dev</code><button class="btn sm ghost" data-copy="npm run dev">Copy</button></div>' +
            '<p class="small"><b>Apply Local Database Migrations:</b></p>' +
            '<div class="code-box"><code>npm run db:setup</code><button class="btn sm ghost" data-copy="npm run db:setup">Copy</button></div>' +
            '<p class="small"><b>Apply Online Cloudflare Database Migrations:</b></p>' +
            '<div class="code-box"><code>npm run db:setup:online</code><button class="btn sm ghost" data-copy="npm run db:setup:online">Copy</button></div>' +
            '<p class="small"><b>Set / Change Master Admin Password in Cloudflare Vault:</b></p>' +
            '<div class="code-box"><code>npx wrangler secret put ADMIN_PASSWORD</code><button class="btn sm ghost" data-copy="npx wrangler secret put ADMIN_PASSWORD">Copy</button></div>' +
            '<p class="small"><b>Deploy Everything (Frontend + Backend) to Cloudflare:</b></p>' +
            '<div class="code-box"><code>npm run deploy</code><button class="btn sm ghost" data-copy="npm run deploy">Copy</button></div>' +
          '</div>' +
        '</div>' +

        /* 2. Author Management */
        '<div class="guide-card" id="g-authors">' +
          '<h2>👥 Author Onboarding &amp; Permissions</h2>' +
          '<ol class="guide-steps">' +
            '<li class="guide-step"><span class="guide-num">1</span><div><b>Invite New Author:</b> Go to the <b>Authors</b> tab, click <b>+ Add Author</b>, and provide their name, email, and temporary password (min 8 chars).</div></li>' +
            '<li class="guide-step"><span class="guide-num">2</span><div><b>Role Differentiation:</b><br>' +
              '• <b>Author:</b> Can draft, edit, and delete <i>only their own blog posts</i>. Cannot see whistleblower messages, subscribers, or other authors\' editor views.<br>' +
              '• <b>Admin:</b> Full site access, can edit any post, manage user accounts, and view all messages/subscribers.</div></li>' +
            '<li class="guide-step"><span class="guide-num">3</span><div><b>Password Resets:</b> Click "Reset password" next to any author card to update their credentials immediately.</div></li>' +
          '</ol>' +
          '<div class="row"><a class="btn primary sm" href="#authors">Go to Authors Tab →</a></div>' +
        '</div>' +

        /* 3. Writing Posts */
        '<div class="guide-card" id="g-blog">' +
          '<h2>✍️ Blog Writing &amp; Media Guidelines</h2>' +
          '<ol class="guide-steps">' +
            '<li class="guide-step"><span class="guide-num">1</span><div><b>Drafting:</b> Click <b>+ New post</b>. Title and Summary are required. Use <code>Ctrl + S</code> to save at any time without publishing.</div></li>' +
            '<li class="guide-step"><span class="guide-num">2</span><div><b>Author Attribution:</b> As an administrator, you can change the <b>Author byline</b> field in the sidebar to attribute posts to any guest writer or volunteer.</div></li>' +
            '<li class="guide-step"><span class="guide-num">3</span><div><b>Photos &amp; Compression:</b> Photos uploaded through the toolbar are automatically scaled down to max 1600px in the browser and stored in SQLite BLOB format.</div></li>' +
          '</ol>' +
        '</div>' +

        /* 4. Security & Privacy */
        '<div class="guide-card" id="g-security">' +
          '<h2>🛡️ Whistleblower Privacy &amp; Anti-Spam Security</h2>' +
          '<ul class="guide-steps">' +
            '<li class="guide-step"><span class="guide-num">✓</span><div><b>Zero IP Logging:</b> Messages submitted via the Contact form deliberately store <b>no IP address</b> or user-agent header.</div></li>' +
            '<li class="guide-step"><span class="guide-num">✓</span><div><b>Rate Limiting:</b> Spam protection calculates an HMAC one-way hash of visitor IP salted with the secret, expiring after 1 hour.</div></li>' +
            '<li class="guide-step"><span class="guide-num">✓</span><div><b>PBKDF2 Password Hashing:</b> Passwords use 100,000 iterations of PBKDF2-SHA256 with random 16-byte salts.</div></li>' +
          '</ul>' +
        '</div>' +

        /* 5. Custom .org Domain Setup */
        '<div class="guide-card" id="g-domain">' +
          '<h2>🌐 Setting Up Your Custom .org Domain</h2>' +
          '<ol class="guide-steps">' +
            '<li class="guide-step"><span class="guide-num">1</span><div><b>Purchase Wholesale Domain:</b> In Cloudflare Dashboard, navigate to <i>Domain Registration → Register Domains</i>. Search for your domain (e.g. <code>crisiswatchnetwork.org</code>) and purchase at cost (~$10.11/year).</div></li>' +
            '<li class="guide-step"><span class="guide-num">2</span><div><b>Attach to Cloudflare Worker:</b> Go to <i>Workers &amp; Pages → ethiopia-crisis-watch → Settings → Domains &amp; Routes → Add Custom Domain</i>. Enter your `.org`. SSL and routing are provisioned automatically.</div></li>' +
            '<li class="guide-step"><span class="guide-num">3</span><div><b>Update Configuration:</b> In <code>frontend/js/content.js</code>, update <code>CONFIG.siteUrl</code> to your new `.org` domain so share links reflect it, then run <code>npm run deploy</code>.</div></li>' +
          '</ol>' +
        '</div>' +

      '</div>');
  }

  /* ── events ────────────────────────────────────────── */
  document.addEventListener("submit", function (e) {
    if (e.target.id === "login-form") {
      e.preventDefault();
      var msg = $("#login-msg"); msg.textContent = "Checking…";
      var emailVal = $("#l-email").value.trim();
      var passVal = $("#pw").value;
      api("/admin/login", { method: "POST", body: { email: emailVal, password: passVal } })
        .then(function (d) {
          currentUser = d.user;
          updateUserUI();
          route();
        }, function (err) {
          msg.textContent = err.message;
          $("#pw").select();
        });
    }

    if (e.target.id === "new-author-form") {
      e.preventDefault();
      var fmsg = $("#author-form-msg"); if (fmsg) fmsg.textContent = "Creating author…";
      var data = {
        name: $("#u-name").value.trim(),
        email: $("#u-email").value.trim(),
        password: $("#u-pass").value,
        role: $("#u-role").value
      };
      api("/admin/users", { method: "POST", body: data }).then(function () {
        toast("Author account created.");
        showNewAuthorForm = false;
        authorsPage();
      }, function (err) {
        if (fmsg) fmsg.textContent = err.message;
      });
    }
  });

  document.addEventListener("mousedown", function (e) { if (e.target.closest(".toolbar button")) e.preventDefault(); });

  document.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-tool]"))) { runTool(t.getAttribute("data-tool")); return; }
    if ((t = e.target.closest("[data-save]"))) { save(t.getAttribute("data-save")); return; }
    if (e.target.closest("#e-delete")) { deletePost(); return; }

    if (e.target.closest("#btn-toggle-author")) {
      showNewAuthorForm = !showNewAuthorForm;
      authorsPage();
      return;
    }
    if (e.target.closest("#btn-cancel-author")) {
      showNewAuthorForm = false;
      authorsPage();
      return;
    }

    if ((t = e.target.closest("[data-reset-pw]"))) {
      var uid = t.getAttribute("data-reset-pw"), uname = t.getAttribute("data-user-name");
      var newPw = prompt("Enter a new password for " + uname + " (at least 8 characters):");
      if (!newPw) return;
      if (newPw.length < 8) { toast("Password must be at least 8 characters."); return; }
      api("/admin/users/" + encodeURIComponent(uid), { method: "PUT", body: { password: newPw } }).then(function () {
        toast("Password updated for " + uname + ".");
      }, function (err) { toast(err.message); });
      return;
    }

    if ((t = e.target.closest("[data-del-user]"))) {
      var duid = t.getAttribute("data-del-user"), duname = t.getAttribute("data-user-name");
      if (!confirm("Are you sure you want to remove author " + duname + "? They will no longer be able to log in.")) return;
      api("/admin/users/" + encodeURIComponent(duid), { method: "DELETE" }).then(function () {
        toast("Author removed.");
        authorsPage();
      }, function (err) { toast(err.message); });
      return;
    }

    if (e.target.closest("#logout")) {
      if (dirty && !confirm("You have changes that aren't saved. Log out anyway?")) return;
      api("/admin/logout", { method: "POST", body: {} }).then(function () { showLogin("You're logged out."); });
      return;
    }
    if ((t = e.target.closest("[data-read]"))) { api("/admin/messages/" + t.getAttribute("data-read"), { method: "PUT", body: { read: true } }).then(messagesPage); return; }
    if ((t = e.target.closest("[data-toggle-read]"))) { api("/admin/messages/" + t.getAttribute("data-toggle-read"), { method: "PUT", body: { read: t.getAttribute("data-is-read") !== "1" } }).then(messagesPage, function (err) { toast(err.message); }); return; }
    if ((t = e.target.closest("[data-del-msg]"))) {
      if (confirm("Delete this message? This can't be undone.")) api("/admin/messages/" + t.getAttribute("data-del-msg"), { method: "DELETE" }).then(function () { toast("Message deleted."); messagesPage(); }, function (err) { toast(err.message); });
      return;
    }
    if ((t = e.target.closest("[data-del-sub]"))) {
      var em = t.getAttribute("data-del-sub");
      if (confirm("Remove " + em + " from the newsletter list?")) api("/admin/subscribers?email=" + encodeURIComponent(em), { method: "DELETE" }).then(function () { toast("Removed."); subscribersPage(); }, function (err) { toast(err.message); });
      return;
    }
    if (e.target.closest("#copy-subs")) {
      var all = subscribers.map(function (s) { return s.email; }).join(", ");
      navigator.clipboard.writeText(all).then(function () { toast("Copied " + subscribers.length + " emails."); }, function () { prompt("Copy these emails:", all); });
      return;
    }
    if (e.target.closest("#csv-subs")) {
      var csv = "email,signed_up\n" + subscribers.map(function (s) { return '"' + s.email.replace(/"/g, '""') + '",' + s.created_at; }).join("\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "subscribers-" + today() + ".csv"; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target.closest("#e-body")) { markDirty(); updateWords(); updatePlaceholder(); return; }
    if (e.target.closest("#e-title, #e-summary, #e-date, #e-author")) markDirty();
  });
  document.addEventListener("change", function (e) { if (e.target.id === "e-file") uploadImage(e.target.files[0]); });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && $("#e-body")) { e.preventDefault(); save(post.status); }
  });

  document.addEventListener("paste", function (e) {
    if (!e.target.closest || !e.target.closest("#e-body")) return;
    var cd = e.clipboardData, file = cd.files && cd.files[0];
    e.preventDefault();
    if (file && /^image\//.test(file.type)) { keepSelection(); uploadImage(file); return; }
    var html = cd.getData("text/html");
    if (html) exec("insertHTML", sanitizeHtml(html));
    else exec("insertText", cd.getData("text/plain"));
  });
  document.addEventListener("drop", function (e) {
    if (!e.target.closest || !e.target.closest("#e-body")) return;
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) { e.preventDefault(); keepSelection(); uploadImage(file); }
  });

  /* ── start ─────────────────────────────────────────── */
  api("/admin/me").then(function (d) {
    if (d.loggedIn && d.user) {
      currentUser = d.user;
      route();
    } else {
      showLogin();
    }
  }, function (e) {
    setPage('<div class="wrap" style="padding-top:2rem">' + empty("Can't reach the server.", esc(e.message)) + "</div>");
  });
})();
