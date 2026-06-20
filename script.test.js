const assert = require("assert");
const {
  validateAmendmentForm,
  formatAmendmentText,
  buildAmendmentMailto,
  renderAmendmentLogHTML,
  escapeHTML,
  describeTarget,
  buildRuleIndex
} = require("./script.js");

const sections = [
  {
    id: "forgiveness",
    title: "Forgiveness",
    subrules: [
      { id: "forgiveness-1", text: "Breakfast ball on the first tee." },
      { id: "forgiveness-2", text: "If you hit a bad shot, you get to hit it again." }
    ]
  },
  { id: "rule-3", text: "Foot wedges are legal." }
];

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
  const text = formatAmendmentText({ targetLabel: "Rule 3", ruleText: "No gimmes." });
  assert.ok(text.includes("Target: Rule 3"));
  assert.ok(text.includes("Rule: No gimmes."));
}

// buildAmendmentMailto
{
  const { subject, body, mailtoHref } = buildAmendmentMailto({
    targetLabel: "Rule 3",
    ruleText: "No gimmes.",
    toEmail: "donovansarahn@gmail.com"
  });
  assert.strictEqual(subject, "Proposed Amendment: Rule 3");
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

// buildRuleIndex
{
  const index = buildRuleIndex(sections);
  assert.deepStrictEqual(index.map((r) => r.label), ["1.1", "1.2", "2"]);
  assert.deepStrictEqual(index.map((r) => r.id), ["forgiveness-1", "forgiveness-2", "rule-3"]);
}

// describeTarget
{
  assert.strictEqual(describeTarget("new", sections), "New Rule");
  assert.strictEqual(describeTarget("rule-3", sections), 'Amendment to "Foot wedges are legal."');
  assert.strictEqual(
    describeTarget("forgiveness-1", sections),
    'Amendment to "Breakfast ball on the first tee."'
  );
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
    [{ target: "rule-3", proposedText: "No <gimmes> & no exceptions", proposedBy: "Bear", date: "2026-06-19" }],
    sections
  );
  assert.ok(html.includes("&lt;gimmes&gt;"));
  assert.ok(html.includes("&amp; no exceptions"));
  assert.ok(!html.includes("<gimmes>"));
}
{
  const html = renderAmendmentLogHTML([{ target: "rule-3" }], sections);
  assert.ok(!html.includes("undefined"));
}

console.log("All tests passed.");
