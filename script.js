function validateAmendmentForm({ chapter, ruleText }) {
  const errors = [];
  if (!chapter || typeof chapter !== "string" || chapter.trim() === "") {
    errors.push("Please select a chapter.");
  }
  if (!ruleText || typeof ruleText !== "string" || ruleText.trim() === "") {
    errors.push("Please enter your proposed rule.");
  }
  return { valid: errors.length === 0, errors };
}

function formatAmendmentText({ chapter, ruleText, proposedBy }) {
  return [
    "Proposed Amendment",
    "",
    `Chapter: ${chapter}`,
    `Rule: ${ruleText}`,
    `Proposed by: ${proposedBy}`
  ].join("\n");
}

function buildAmendmentMailto({ chapter, ruleText, proposedBy, toEmail }) {
  const subject = `Proposed Amendment: ${chapter}`;
  const body = formatAmendmentText({ chapter, ruleText, proposedBy });
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
    return "<li>No amendments yet.</li>";
  }
  return entries
    .map((e) => {
      const chapter = escapeHTML(e.chapter || "(unknown chapter)");
      const text = escapeHTML(e.text || "(no rule text)");
      const proposedBy = escapeHTML(e.proposedBy || "(unknown)");
      const date = escapeHTML(e.date || "(no date)");
      return `<li><strong>${chapter}</strong>: ${text} <em>(proposed by ${proposedBy}, ${date})</em></li>`;
    })
    .join("\n");
}

function renderContent(content) {
  document.getElementById("cover-title").textContent = content.title;
  document.getElementById("cover-subtitle").textContent = content.subtitle;
  document.getElementById("cover-preamble").textContent = content.preamble;

  const toc = document.getElementById("toc");
  toc.innerHTML = content.chapters
    .map((c) => `<a href="#chapter-${c.id}">${c.title}</a>`)
    .join("");

  const chaptersEl = document.getElementById("chapters");
  chaptersEl.innerHTML = content.chapters
    .map(
      (c) => `
      <section class="chapter${c.id === "closing" ? " stamp" : ""}" id="chapter-${c.id}">
        <h2>${c.title}</h2>
        <ol>
          ${c.rules.map((r) => `<li>${r}</li>`).join("")}
        </ol>
      </section>
    `
    )
    .join("");
}

function populateChapterSelect(chapters) {
  const select = document.getElementById("amendment-chapter");
  select.innerHTML = chapters
    .map((c) => `<option value="${c.id}">${c.title}</option>`)
    .join("");
}

function renderAmendmentLog(entries) {
  document.getElementById("amendment-log-list").innerHTML = renderAmendmentLogHTML(entries);
}

function handleAmendmentSubmit(event, content) {
  event.preventDefault();

  const chapterSelect = document.getElementById("amendment-chapter");
  const textArea = document.getElementById("amendment-text");
  const errorsEl = document.getElementById("amendment-errors");
  const fallbackEl = document.getElementById("amendment-fallback");
  const fallbackTextEl = document.getElementById("amendment-fallback-text");

  const chapter = chapterSelect.value;
  const ruleText = textArea.value;

  const { valid, errors } = validateAmendmentForm({ chapter, ruleText });

  if (!valid) {
    errorsEl.textContent = errors.join(" ");
    fallbackEl.hidden = true;
    return;
  }

  errorsEl.textContent = "";

  const chapterTitle = content.chapters.find((c) => c.id === chapter).title;
  const { mailtoHref, body } = buildAmendmentMailto({
    chapter: chapterTitle,
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
    populateChapterSelect(CONTENT.chapters);
    renderAmendmentLog(CONTENT.amendmentLog);
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
    escapeHTML
  };
}
