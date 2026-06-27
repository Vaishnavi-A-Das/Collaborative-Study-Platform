const Groq =
  require("groq-sdk");

const groq =
  new Groq({
    apiKey:
      process.env.GROQ_API_KEY,
  });

const askGemini =
  async (
    prompt,
    history = []
  ) => {
    try {
      const context =
        history
          .map(
            (msg) =>
              `${msg.display_name}: ${msg.content}`
          )
          .join("\n");

      const completion =
        await groq.chat
          .completions.create({
            messages: [
              {
                role:
                  "system",
                content: `
You are StudyBot 🤖.

You are a collaborative
study assistant inside a
student study room.

Rules:
- Be concise
- Explain clearly
- Help engineering students
- Give examples
- Use bullets when useful
                `,
              },
              {
                role:
                  "user",
                content: `
Room Context:
${context}

Student Question:
${prompt}
                `,
              },
            ],

            model:
              "llama-3.3-70b-versatile",
          });

      return completion
        .choices[0]
        .message.content;
    } catch (err) {
      console.error(
        "Groq Error:",
        err
      );

      return "Sorry, I couldn't process that.";
    }
  };

module.exports =
  askGemini;