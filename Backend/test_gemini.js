require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const modelName = 'gemini-1.5-flash';
  console.log(`Testing model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, respond with JSON: { \"status\": \"ok\" }");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testModel();
