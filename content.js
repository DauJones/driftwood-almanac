const CONTENT = {
  title: "Jimmy's Rules",
  subtitle: "Est. 2026, Amended Constantly",
  preamble: "Finally, in writing: how Jimmy actually plays.",
  sections: [
    { id: "rule-1", text: "Breakfast ball on the first tee." },
    { id: "rule-2", text: "If you hit a bad shot, you get to hit it again. Use sparingly." },
    { id: "rule-3", text: "Foot wedges are legal on any shot that isn't already a perfect lie." },
    { id: "rule-4", text: "Lost your original ball but found an unclaimed one? That's your ball now. Congratulations." },
    { id: "rule-5", text: "Write your playing partner's name on the scorecard — you will forget otherwise." },
    { id: "rule-6", text: "Double par? Pick up. Leave the hole. Nobody's counting past that anyway." },
    { id: "rule-7", text: "Any putt is a gimme if you ask nicely. Use sparingly." },
    { id: "rule-8", text: "If you get upset, remember: you are not good enough to be upset about your golf game." },
    { id: "rule-9", text: "It's always ready golf — hit when you're ready, not when it's technically your turn." }
  ],
  amendmentLog: [
    {
      target: "new",
      proposedText: "Mulligans are unlimited but must be announced loudly enough for the group ahead to hear.",
      proposedBy: "Bear",
      date: "2026-06-19"
    }
  ],
  recipientEmail: "donovansarahn@gmail.com"
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONTENT;
}
