const assert = require("assert");
const {
  validateAmendmentForm,
  formatAmendmentText,
  buildAmendmentMailto,
  renderAmendmentLogHTML
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

console.log("All tests passed.");
