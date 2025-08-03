// scripts/extract-text.js
const fs = require("fs");
const path = require("path");

const SRC_DIR = "./src";
const result = {};
let id = 1;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".tsx")) {
      extractFromFile(fullPath);
    }
  }
}

function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const jsxTextRegex =
    />\s*([A-Za-zበ-መሀ-ሰሸ-ቀረ-ዐነ-ኸየ-ፐ'\-,.?!፡።፣፤፥፦፧፨0-9 ]{2,})\s*</g;

  let match;
  while ((match = jsxTextRegex.exec(content))) {
    const rawText = match[1].trim();
    if (rawText.length > 1 && !rawText.startsWith("{")) {
      const key = `key_${id++}`;
      result[key] = rawText;
    }
  }
}

walk(SRC_DIR);

fs.writeFileSync("./locales/en.json", JSON.stringify(result, null, 2));
console.log("✅ Extracted text written to locales/en.json");
