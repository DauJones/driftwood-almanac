const assert = require("assert");
const {
  validateAmendmentForm,
  formatAmendmentText,
  buildAmendmentMailto,
  renderAmendmentLogHTML,
  escapeHTML,
  findChapterTitle
} = require("./script.js");

// validateAmendmentForm
{
  const result = validateAmendmentForm({ chapter: "golf", ruleText: "No gimmes over 3 feet." });
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
}
{
  const result = validateAmendmentForm({ chapter: "", ruleText: "" });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 2);
}
{
  const result = validateAmendmentForm({ chapter: "golf", ruleText: "   " });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 1);
}

// formatAmendmentText
{
  const text = formatAmendmentText({ chapter: "golf", ruleText: "No gimmes.", proposedBy: "Jimmy" });
  assert.ok(text.includes("Chapter: golf"));
  assert.ok(text.includes("Rule: No gimmes."));
  assert.ok(text.includes("Proposed by: Jimmy"));
}

// buildAmendmentMailto
{
  const { subject, body, mailtoHref } = buildAmendmentMailto({
    chapter: "golf",
    ruleText: "No gimmes.",
    proposedBy: "Jimmy",
    toEmail: "donovansarahn@gmail.com"
  });
  assert.strictEqual(subject, "Proposed Amendment: golf");
  assert.ok(body.includes("No gimmes."));
  assert.ok(mailtoHref.startsWith("mailto:donovansarahn@gmail.com?"));
  assert.ok(mailtoHref.includes(encodeURIComponent(subject)));
}

// renderAmendmentLogHTML
{
  const html = renderAmendmentLogHTML([
    { chapter: "golf", text: "Test rule", proposedBy: "Bear", date: "2026-06-19" }
  ]);
  assert.ok(html.includes("Test rule"));
  assert.ok(html.includes("Bear"));
}
{
  const html = renderAmendmentLogHTML([]);
  assert.ok(html.includes("No amendments"));
}

// escapeHTML
{
  const { escapeHTML } = require("./script.js");
  assert.strictEqual(escapeHTML("Rules & Regulations"), "Rules &amp; Regulations");
  assert.strictEqual(escapeHTML("<3 strokes"), "&lt;3 strokes");
  assert.strictEqual(escapeHTML('He said "go"'), "He said &quot;go&quot;");
}

// renderAmendmentLogHTML escapes special characters
{
  const html = renderAmendmentLogHTML([
    { chapter: "golf", text: "No <gimmes> & no exceptions", proposedBy: "Bear", date: "2026-06-19" }
  ]);
  assert.ok(html.includes("&lt;gimmes&gt;"));
  assert.ok(html.includes("&amp; no exceptions"));
  assert.ok(!html.includes("<gimmes>"));
}

// renderAmendmentLogHTML guards a malformed entry instead of rendering "undefined"
{
  const html = renderAmendmentLogHTML([
    { chapter: "golf", text: "Missing some fields" }
  ]);
  assert.ok(!html.includes("undefined"));
}

// findChapterTitle
{
  const { findChapterTitle } = require("./script.js");
  const chapters = [
    { id: "golf", title: "Golf", rules: [] },
    { id: "business-life", title: "Business & Life", rules: [] }
  ];
  assert.strictEqual(findChapterTitle(chapters, "golf"), "Golf");
  assert.strictEqual(findChapterTitle(chapters, "nonexistent-id"), null);
}

console.log("All tests passed.");
