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

function renderAmendmentLogHTML(entries) {
  if (!entries || entries.length === 0) {
    return "<li>No amendments yet.</li>";
  }
  return entries
    .map(
      (e) =>
        `<li><strong>${e.chapter}</strong>: ${e.text} <em>(proposed by ${e.proposedBy}, ${e.date})</em></li>`
    )
    .join("\n");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateAmendmentForm,
    formatAmendmentText,
    buildAmendmentMailto,
    renderAmendmentLogHTML
  };
}
