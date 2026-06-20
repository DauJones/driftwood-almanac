const assert = require("assert");
const {
  validateAmendmentForm,
  formatAmendmentText,
  buildAmendmentMailto,
  renderAmendmentLogHTML,
  escapeHTML,
  describeTarget
} = require("./script.js");

const sections = [
  { id: "rule-1", text: "Breakfast ball on the first tee." },
  { id: "rule-2", text: "Foot wedges are legal." }
];

// validateAmendmentForm
{
  const result = validateAmendmentForm({ target: "rule-1", ruleText: "No gimmes over 3 feet." });
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
}
{
  const result = validateAmendmentForm({ target: "", ruleText: "" });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 2);
}
{
  const result = validateAmendmentForm({ target: "rule-1", ruleText: "   " });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length, 1);
}

// formatAmendmentText
{
  const text = formatAmendmentText({ targetLabel: "Rule 1", ruleText: "No gimmes.", proposedBy: "Jimmy" });
  assert.ok(text.includes("Target: Rule 1"));
  assert.ok(text.includes("Rule: No gimmes."));
  assert.ok(text.includes("Proposed by: Jimmy"));
}

// buildAmendmentMailto
{
  const { subject, body, mailtoHref } = buildAmendmentMailto({
    targetLabel: "Rule 1",
    ruleText: "No gimmes.",
    proposedBy: "Jimmy",
    toEmail: "donovansarahn@gmail.com"
  });
  assert.strictEqual(subject, "Proposed Amendment: Rule 1");
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

// describeTarget
{
  assert.strictEqual(describeTarget("new", sections), "New Rule");
  assert.strictEqual(describeTarget("rule-1", sections), 'Amendment to "Breakfast ball on the first tee."');
  assert.strictEqual(describeTarget("nonexistent", sections), "Unknown Rule");
}

// renderAmendmentLogHTML
{
  const html = renderAmendmentLogHTML(
    [{ target: "new", proposedText: "Test rule", proposedBy: "Bear", date: "2026-06-19" }],
    sections
  );
  assert.ok(html.includes("Test rule"));
  assert.ok(html.includes("Bear"));
  assert.ok(html.includes("New Rule"));
}
{
  const html = renderAmendmentLogHTML([], sections);
  assert.ok(html.includes("reviewed by committee"));
}
{
  const html = renderAmendmentLogHTML(
    [{ target: "rule-1", proposedText: "No <gimmes> & no exceptions", proposedBy: "Bear", date: "2026-06-19" }],
    sections
  );
  assert.ok(html.includes("&lt;gimmes&gt;"));
  assert.ok(html.includes("&amp; no exceptions"));
  assert.ok(!html.includes("<gimmes>"));
}
{
  const html = renderAmendmentLogHTML([{ target: "rule-1" }], sections);
  assert.ok(!html.includes("undefined"));
}

console.log("All tests passed.");
