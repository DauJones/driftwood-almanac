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

function formatAmendmentText({ targetLabel, ruleText, proposedBy }) {
  return [
    "Proposed Amendment",
    "",
    `Target: ${targetLabel}`,
    `Rule: ${ruleText}`,
    `Proposed by: ${proposedBy}`
  ].join("\n");
}

function buildAmendmentMailto({ targetLabel, ruleText, proposedBy, toEmail }) {
  const subject = `Proposed Amendment: ${targetLabel}`;
  const body = formatAmendmentText({ targetLabel, ruleText, proposedBy });
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

function describeTarget(target, sections) {
  if (!target || target === "new") {
    return "New Rule";
  }
  const match = sections.find((s) => s.id === target);
  return match ? `Amendment to "${match.text}"` : "Unknown Rule";
}

function renderAmendmentLogHTML(entries, sections) {
  if (!entries || entries.length === 0) {
    return "<li>No amendments yet.</li>";
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

function renderContent(content) {
  document.getElementById("cover-title").textContent = content.title;
  document.getElementById("cover-subtitle").textContent = content.subtitle;
  document.getElementById("cover-preamble").textContent = content.preamble;

  const rulesEl = document.getElementById("rules");
  rulesEl.innerHTML = content.sections
    .map(
      (s, i) => `
      <section class="rule" id="${s.id}">
        <p>${i + 1}. ${escapeHTML(s.text)}</p>
      </section>
    `
    )
    .join("");
}

function populateAmendmentTargetSelect(sections) {
  const select = document.getElementById("amendment-target");
  const ruleOptions = sections
    .map((s, i) => `<option value="${s.id}">Rule ${i + 1}</option>`)
    .join("");
  select.innerHTML = `<option value="new">A new rule</option>${ruleOptions}`;
}

function renderAmendmentLog(entries, sections) {
  document.getElementById("amendment-log-list").innerHTML = renderAmendmentLogHTML(entries, sections);
}

function handleAmendmentSubmit(event, content) {
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

  const targetLabel = describeTarget(target, content.sections);
  const { mailtoHref, body } = buildAmendmentMailto({
    targetLabel,
    ruleText,
    proposedBy: "Jimmy",
    toEmail: content.recipientEmail
  });

  // Always show both paths together — mailto success can't be reliably
  // detected in-browser, so the fallback is never gated behind a failure.
  window.location.href = mailtoHref;
  fallbackTextEl.textContent = body;
  fallbackEl.hidden = false;
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
    renderContent(CONTENT);
    populateAmendmentTargetSelect(CONTENT.sections);
    renderAmendmentLog(CONTENT.amendmentLog, CONTENT.sections);
    wireCopyButton();
    document
      .getElementById("amendment-form")
      .addEventListener("submit", (event) => handleAmendmentSubmit(event, CONTENT));
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateAmendmentForm,
    formatAmendmentText,
    buildAmendmentMailto,
    renderAmendmentLogHTML,
    renderContent,
    escapeHTML,
    describeTarget
  };
}
