const CONTENT = {
  title: "Jimmy's Rules",
  subtitle: "Est. 2026, Amended Constantly",
  preamble: "[ONE-LINE PERSONAL PREAMBLE FROM BEAR GOES HERE]",
  chapters: [
    {
      id: "golf",
      title: "Golf",
      rules: [
        "[PLACEHOLDER GOLF RULE 1 — MAKES THE GAME MORE FUN]",
        "[PLACEHOLDER GOLF RULE 2 — MAKES THE GAME MORE FUN]",
        "[PLACEHOLDER GOLF RULE 3 — MAKES THE GAME MORE FUN]"
      ]
    },
    {
      id: "closing",
      title: "[CLOSING CHAPTER TITLE]",
      rules: [
        "[THE ONE SINCERE LINE ABOUT THE RELATIONSHIP GOES HERE]"
      ]
    }
  ],
  amendmentLog: [
    {
      chapter: "golf",
      text: "Mulligans are unlimited but must be announced loudly enough for the group ahead to hear.",
      proposedBy: "Bear",
      date: "2026-06-19"
    }
  ],
  recipientEmail: "donovansarahn@gmail.com"
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONTENT;
}
