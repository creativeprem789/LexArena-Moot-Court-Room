const ragService = require('./src/services/rag.service');
const legalCases = require('./src/data/indian-legal-cases.json');

const testQueries = [
    "privacy and aadhaar card",
    "right to privacy under Article 21",
    "Kesavananda Bharti case on basic structure",
    "custodial torture and Article 22",
    "internet shutdowns in Kashmir"
];

testQueries.forEach(query => {
    console.log(`\nQuery: "${query}"`);
    const results = ragService.retrieveRelevantCases(query, 3);
    results.forEach((r, i) => {
        console.log(`  ${i+1}. ${r.title} (${r.year}) - Score: ${r.relevanceScore.toFixed(4)}`);
    });
});
