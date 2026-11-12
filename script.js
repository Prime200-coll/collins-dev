/* Edit these values, then everything on the page updates.
   photo: put your picture file next to index.html and set photo: "collins.jpg" */
const PROFILE = {
  name: "Collins",
  photo: "",
  email: "opahcollins@gmail.com",
  whatsapp: "+2348023578578", /* country code + number, digits only */
  stats: { orders: 12, websites: 8, clients: 10 } /* starting numbers in the Work section */
};

(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var initials = PROFILE.name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("") || "YN";
  $$("[data-fill]").forEach(function (el) {
    var k = el.getAttribute("data-fill");
    el.textContent = k === "initials" ? initials : PROFILE[k];
  });
  $("#wa-link").href = "https://wa.me/+2348023578578" + PROFILE.whatsapp;
  $("#year").textContent = new Date().getFullYear();

  /* personal photo */
  var photo = $("#photo"), empty = $("#photo-empty"), pBtn = $("#photo-btn"), pIn = $("#photo-input");
  function showPhoto(src) { photo.src = src; photo.hidden = false; empty.hidden = true; }
  if (PROFILE.photo) {
    showPhoto(PROFILE.photo);
  } else {
    try { var kept = localStorage.getItem("photo"); if (kept) showPhoto(kept); } catch (e) {}
    pBtn.addEventListener("click", function () { pIn.click(); });
    pIn.addEventListener("change", function () {
      var f = pIn.files && pIn.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(1, 900 / Math.max(img.width, img.height));
          var c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          var url = c.toDataURL("image/jpeg", 0.88);
          showPhoto(url);
          try { localStorage.setItem("photo", url); } catch (e) {}
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(f);
    });
  }

  /* typing roles */
  var typed = $("#typed");
  var roles = ["computer engineer", "web developer", "problem solver", "builder of online stores"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    var ri = 0, ci = roles[0].length, del = true;
    (function tick() {
      var word = roles[ri];
      if (del) { ci--; } else { ci++; }
      typed.textContent = word.slice(0, ci);
      var wait = del ? 45 : 85;
      if (!del && ci === word.length) { del = true; wait = 1800; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }

  /* animate cards in as they scroll into view (only ones below the fold) */
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    var groups = [".section-head", ".prose p", ".principles > *", ".skill", ".stat", ".project", ".service", ".contact-item", "form"];
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el, i) {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.style.setProperty("--d", (i % 3) * 0.09 + "s");
        io.observe(el);
      });
    });
  }

  /* starting numbers for the stat cards */
  $$("[data-stat]").forEach(function (el) {
    var v = PROFILE.stats[el.getAttribute("data-stat")];
    if (v !== undefined) $(".num", el).textContent = v;
  });

  /* tap or press a skill or stat card to raise its number */
  $$(".skill, .stat").forEach(function (card) {
    var num = $(".num", card);
    var isSkill = card.classList.contains("skill");
    var title = ($("h3", card) || $(".stat-label", card)).textContent;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    function label() {
      card.setAttribute("aria-label", title + ": " + num.textContent + (isSkill ? " percent" : "") + ". Activate to increase.");
    }
    function raise(e) {
      var v = parseInt(num.textContent, 10) || 0;
      if (isSkill && v >= 100) return;
      v += 1;
      num.textContent = v;
      if (isSkill) card.style.setProperty("--lvl", v + "%");
      num.classList.remove("bump");
      void num.offsetWidth;
      num.classList.add("bump");
      var r = card.getBoundingClientRect();
      var p = document.createElement("span");
      p.className = "plus";
      p.textContent = "+1";
      p.style.left = (e.clientX !== undefined ? e.clientX - r.left : r.width / 2) + "px";
      p.style.top = (e.clientY !== undefined ? e.clientY - r.top : r.height / 2) + "px";
      card.appendChild(p);
      setTimeout(function () { p.remove(); }, 800);
      label();
    }
    card.addEventListener("click", raise);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); raise(e); }
    });
    label();
  });

  /* mobile menu */
  var menuBtn = $("#menu"), nav = $("#nav");
  function closeMenu() { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$(".nav a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* theme toggle */
  var root = document.documentElement;
  try { var saved = localStorage.getItem("theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  $("#theme").addEventListener("click", function () {
    var explicit = root.getAttribute("data-theme");
    var dark = explicit ? explicit === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* pointer glow on skill cards */
  $$(".skill").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* copy helper */
  function selectNode(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function flash(btn, text) {
    var old = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", old);
    btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 1600);
  }
  function copy(text, btn, fallbackNode) {
    var done = function () { flash(btn, "Copied"); };
    var fail = function () {
      if (fallbackNode) {
        if (fallbackNode.select) { fallbackNode.focus(); fallbackNode.select(); } else { selectNode(fallbackNode); }
      }
      flash(btn, "Selected, press copy");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else { fail(); }
  }
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var node = document.getElementById(btn.getAttribute("data-copy"));
      copy(node.textContent, btn, node);
    });
  });

  /* contact form: builds a ready-to-send message (nothing is sent from this page) */
  var form = $("#contact-form"), result = $("#result"), out = $("#result-text");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var msg = "Hi " + PROFILE.name + ",\n\nMy name is " + d.get("name") + ". I am looking for: " + d.get("type").toLowerCase() + ".\n\nAbout my project:\n" + d.get("message") + "\n\nYou can reach me at " + d.get("email") + ".\n\nThank you.";
    out.value = msg;
    $("#mail-link").href = "mailto:" + PROFILE.email + "?subject=" + encodeURIComponent("Website project: " + d.get("type")) + "&body=" + encodeURIComponent(msg);
    $("#wa-send").href = "https://wa.me/" + PROFILE.whatsapp + "?text=" + encodeURIComponent(msg);
    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $("#copy-result").addEventListener("click", function (e) { copy(out.value, e.currentTarget, out); });
  $("#edit-again").addEventListener("click", function () { result.hidden = true; form.hidden = false; });
})();