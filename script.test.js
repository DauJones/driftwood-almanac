const assert = require("assert");
const {
  validateAmendmentForm,
  formatAmendmentText,
  buildAmendmentMailto,
  renderAmendmentLogHTML,
  escapeHTML
} = require("./script.js");

// validateAmendmentForm
{
  const result = validateAmendmentForm({ target: "rule-3", ruleText: "No gimmes over 3 feet." });
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
}
{
  const result = validateAmendmentForm({ target: "", ruleText: "" });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 2);
}
{
  const result = validateAmendmentForm({ target: "rule-3", ruleText: "   " });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 1);
}

// formatAmendmentText
{
  const text = formatAmendmentText({ targetLabel: "Rule 2", ruleText: "No gimmes." });
  assert.ok(text.includes("Target: Rule 2"));
  assert.ok(text.includes("Rule: No gimmes."));
}

// buildAmendmentMailto
{
  const { subject, body, mailtoHref } = buildAmendmentMailto({
    targetLabel: "Rule 2",
    ruleText: "No gimmes.",
    toEmail: "donovansarahn@gmail.com"
  });
  assert.strictEqual(subject, "Proposed Amendment: Rule 2");
  assert.ok(body.includes("No gimmes."));
  assert.ok(mailtoHref.startsWith("mailto:donovansarahn@gmail.com?"));
  assert.ok(mailtoHref.includes(encodeURIComponent(subject)));
}

// escapeHTML
{
  assert.strictEqual(escapeHTML("Rules & Regulations"), "Rules &amp; Regulations");
  assert.strictEqual(escapeHTML("<3 strokes"), "&lt;3 strokes");
  assert.strictEqual(escapeHTML('He said "go"'), "He said &quot;go&quot;");
}

// renderAmendmentLogHTML
{
  const html = renderAmendmentLogHTML([
    { targetLabel: "A new rule", proposedText: "Test rule", proposedBy: "Bear", date: "2026-06-19" }
  ]);
  assert.ok(html.includes("Test rule"));
  assert.ok(html.includes("Bear"));
  assert.ok(html.includes("A new rule"));
}
{
  const html = renderAmendmentLogHTML([]);
  assert.ok(html.includes("reviewed by committee"));
}
{
  const html = renderAmendmentLogHTML([
    { targetLabel: "Rule 2", proposedText: "No <gimmes> & no exceptions", proposedBy: "Bear", date: "2026-06-19" }
  ]);
  assert.ok(html.includes("&lt;gimmes&gt;"));
  assert.ok(html.includes("&amp; no exceptions"));
  assert.ok(!html.includes("<gimmes>"));
}
{
  const html = renderAmendmentLogHTML([{ targetLabel: "Rule 2" }]);
  assert.ok(!html.includes("undefined"));
}

console.log("All tests passed.");
