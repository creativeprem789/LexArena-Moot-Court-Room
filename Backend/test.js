require('dotenv').config();
const { processArgument } = require('./src/services/courtroom.service');

async function run() {
  console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
  
  const history = [
    { role: 'prosecution', text: "The state has the right to monitor citizens." },
    { role: 'defense', text: "The constitution forbids this." }
  ];
  
  console.log("Calling processArgument...");
  try {
    const response = await processArgument(
      "CASE #IND-001", 
      "The right to privacy is fundamental and state surveillance violates Article 21.",
      history,
      { topic: "Right to Privacy" }
    );
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
