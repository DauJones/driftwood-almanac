const CONTENT = {
  title: "Jimmy's Rules",
  subtitle: "Est. 2026, Amended Constantly",
  preamble: "Finally, in writing: how Jimmy actually plays.",
  chapters: [
    {
      id: "golf",
      title: "Golf",
      rules: [
        "Breakfast ball on the first tee.",
        "If you hit a bad shot, you get to hit it again. Use sparingly.",
        "Foot wedges are legal on any shot that isn't already a perfect lie.",
        "Lost your original ball but found an unclaimed one? That's your ball now. Congratulations.",
        "Write your playing partner's name on the scorecard — you will forget otherwise.",
        "Double par? Pick up. Leave the hole. Nobody's counting past that anyway.",
        "Any putt is a gimme if you ask nicely. Use sparingly.",
        "If you get upset, remember: you are not good enough to be upset about your golf game."
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
