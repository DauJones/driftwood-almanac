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

function renderAmendmentLogHTML(entries) {
  if (!entries || entries.length === 0) {
    return "<li>Amendment requests shown here and reviewed by committee.</li>";
  }
  return entries
    .map((e) => {
      const targetLabel = escapeHTML(e.targetLabel || "Unknown");
      const text = escapeHTML(e.proposedText || "(no rule text)");
      const proposedBy = escapeHTML(e.proposedBy || "(unknown)");
      const date = escapeHTML(e.date || "(no date)");
      return `<li><strong>${targetLabel}</strong>: ${text} <em>(proposed by ${proposedBy}, ${date})</em></li>`;
    })
    .join("\n");
}

// Reads the existing rule list back out as { id, text } pairs so the
// dropdown doesn't hand-duplicate rule content — no numbering here, numbers
// are display-only and stay in CSS (see style.css).
function getRuleOptionsFromDOM() {
  const rulesEl = document.getElementById("rules");
  const options = [];
  Array.from(rulesEl.children).forEach((li) => {
    if (li.classList.contains("rule-group")) {
      li.querySelectorAll(".subrule").forEach((sub) => {
        options.push({ id: sub.id, text: sub.querySelector(".rule-text").textContent });
      });
    } else {
      options.push({ id: li.id, text: li.querySelector(".rule-text").textContent });
    }
  });
  return options;
}

function populateAmendmentTargetSelect() {
  const select = document.getElementById("amendment-target");
  getRuleOptionsFromDOM().forEach((r) => {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.text;
    select.appendChild(option);
  });
}

let amendmentLogEntries = [];

function renderAmendmentLog(entries) {
  document.getElementById("amendment-log-list").innerHTML = renderAmendmentLogHTML(entries);
}

function handleAmendmentSubmit(event) {
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

  // The dropdown's own visible option text is the target label — no need
  // to look anything up, the static markup already says what it means.
  const targetLabel = targetSelect.options[targetSelect.selectedIndex].text;
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
    targetLabel,
    proposedText: ruleText,
    proposedBy: "Jimmy",
    date: new Date().toISOString().slice(0, 10)
  });
  renderAmendmentLog(amendmentLogEntries);
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
    populateAmendmentTargetSelect();
    renderAmendmentLog(amendmentLogEntries);
    wireCopyButton();
    document.getElementById("amendment-form").addEventListener("submit", handleAmendmentSubmit);
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateAmendmentForm,
    formatAmendmentText,
    buildAmendmentMailto,
    renderAmendmentLogHTML,
    escapeHTML
  };
}
