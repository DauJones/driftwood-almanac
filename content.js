const CONTENT = {
  title: "THE OFFICIAL RULES OF JIMMY [LASTNAME]",
  subtitle: "Est. 2026, Amended Constantly",
  preamble: "[ONE-LINE PERSONAL PREAMBLE FROM BEAR GOES HERE]",
  chapters: [
    {
      id: "golf",
      title: "Golf",
      rules: [
        "[PLACEHOLDER GOLF RULE 1]",
        "[PLACEHOLDER GOLF RULE 2]",
        "[PLACEHOLDER GOLF RULE 3]"
      ]
    },
    {
      id: "business-life",
      title: "Business & Life",
      rules: [
        "[PLACEHOLDER BUSINESS/LIFE RULE 1]",
        "[PLACEHOLDER BUSINESS/LIFE RULE 2]",
        "[PLACEHOLDER BUSINESS/LIFE RULE 3]"
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
