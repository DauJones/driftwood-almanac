const RECIPIENT_EMAIL = "donovansarahn@gmail.com";

function validateAmendmentForm({ target, ruleText }) {
  const errors = [];
  if (!target || typeof target !== "string" || target.trim() === "") {
    errors.push("Please choose a rule to amend, or propose a new one.");
  }
  if (!ruleText || typeof ruleText !== "string" || ruleText.trim() === "") {
    errors.push("Please enter your proposed rule.");
  }
  return { valid: errors.length === 0, errors };
}

function formatAmendmentText({ targetLabel, ruleText }) {
  return ["Proposed Amendment", "", `Target: ${targetLabel}`, `Rule: ${ruleText}`].join("\n");
}

function buildAmendmentMailto({ targetLabel, ruleText, toEmail }) {
  const subject = `Proposed Amendment: ${targetLabel}`;
  const body = formatAmendmentText({ targetLabel, ruleText });
  const mailtoHref = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { subject, body, mailtoHref };
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function flattenRules(sections) {
  const flat = [];
  sections.forEach((s) => {
    if (s.subrules) {
      s.subrules.forEach((sub) => flat.push(sub));
    } else {
      flat.push(s);
    }
  });
  return flat;
}

function buildRuleIndex(sections) {
  const index = [];
  let topNumber = 0;
  sections.forEach((s) => {
    topNumber += 1;
    if (s.subrules) {
      s.subrules.forEach((sub, j) => {
        index.push({ id: sub.id, label: `${topNumber}.${j + 1}`, text: sub.text });
      });
    } else {
      index.push({ id: s.id, label: `${topNumber}`, text: s.text });
    }
  });
  return index;
}

function describeTarget(target, sections) {
  if (!target || target === "new") {
    return "New Rule";
  }
  const match = flattenRules(sections).find((r) => r.id === target);
  return match ? `Amendment to "${match.text}"` : "Unknown Rule";
}

function renderAmendmentLogHTML(entries, sections) {
  if (!entries || entries.length === 0) {
    return "<li>Amendment requests shown here and reviewed by committee.</li>";
  }
  return entries
    .map((e) => {
      const targetLabel = escapeHTML(describeTarget(e.target, sections));
      const text = escapeHTML(e.proposedText || "(no rule text)");
      const proposedBy = escapeHTML(e.proposedBy || "(unknown)");
      const date = escapeHTML(e.date || "(no date)");
      return `<li><strong>${targetLabel}</strong>: ${text} <em>(proposed by ${proposedBy}, ${date})</em></li>`;
    })
    .join("\n");
}

// The rules are static markup in index.html (see #rules) — this reads that
// markup back into the same { id, text } / { id, title, subrules } shape the
// pure functions above expect, so there's one source of truth for rule text.
function getSectionsFromDOM() {
  const rulesEl = document.getElementById("rules");
  return Array.from(rulesEl.children).map((el) => {
    const groupTitleEl = el.querySelector(".rule-group-title");
    if (groupTitleEl) {
      const subrules = Array.from(el.querySelectorAll(".subrule")).map((sub) => ({
        id: sub.id,
        text: sub.querySelector(".rule-text").textContent
      }));
      return { id: el.id, title: groupTitleEl.textContent, subrules };
    }
    return { id: el.id, text: el.querySelector(".rule-text").textContent };
  });
}

function populateAmendmentTargetSelect(sections) {
  const select = document.getElementById("amendment-target");
  const ruleOptions = buildRuleIndex(sections)
    .map((r) => `<option value="${r.id}">Rule ${r.label}</option>`)
    .join("");
  select.innerHTML = `<option value="new">A new rule</option>${ruleOptions}`;
}

let amendmentLogEntries = [];

function renderAmendmentLog(entries, sections) {
  document.getElementById("amendment-log-list").innerHTML = renderAmendmentLogHTML(entries, sections);
}

function handleAmendmentSubmit(event, sections) {
  event.preventDefault();

  const targetSelect = document.getElementById("amendment-target");
  const textArea = document.getElementById("amendment-text");
  const errorsEl = document.getElementById("amendment-errors");
  const fallbackEl = document.getElementById("amendment-fallback");
  const fallbackTextEl = document.getElementById("amendment-fallback-text");

  const target = targetSelect.value;
  const ruleText = textArea.value;

  const { valid, errors } = validateAmendmentForm({ target, ruleText });

  if (!valid) {
    errorsEl.textContent = errors.join(" ");
    fallbackEl.hidden = true;
    return;
  }

  errorsEl.textContent = "";

  const targetLabel = describeTarget(target, sections);
  const { mailtoHref, body } = buildAmendmentMailto({
    targetLabel,
    ruleText,
    toEmail: RECIPIENT_EMAIL
  });

  // Always show both paths together — mailto success can't be reliably
  // detected in-browser, so the fallback is never gated behind a failure.
  window.location.href = mailtoHref;
  fallbackTextEl.textContent = body;
  fallbackEl.hidden = false;

  amendmentLogEntries.push({
    target,
    proposedText: ruleText,
    proposedBy: "Jimmy",
    date: new Date().toISOString().slice(0, 10)
  });
  renderAmendmentLog(amendmentLogEntries, sections);
}

function wireCopyButton() {
  const copyBtn = document.getElementById("amendment-copy-btn");
  const statusEl = document.getElementById("amendment-copy-status");
  copyBtn.addEventListener("click", async () => {
    const text = document.getElementById("amendment-fallback-text").textContent;
    try {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = "Copied!";
    } catch (err) {
      statusEl.textContent = "Couldn't copy automatically — select the text above and copy manually.";
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const sections = getSectionsFromDOM();
    populateAmendmentTargetSelect(sections);
    renderAmendmentLog(amendmentLogEntries, sections);
    wireCopyButton();
    document
      .getElementById("amendment-form")
      .addEventListener("submit", (event) => handleAmendmentSubmit(event, sections));
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateAmendmentForm,
    formatAmendmentText,
    buildAmendmentMailto,
    renderAmendmentLogHTML,
    escapeHTML,
    describeTarget,
    buildRuleIndex
  };
}
