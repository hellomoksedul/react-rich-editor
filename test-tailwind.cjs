const { execSync } = require('child_process');
const fs = require('fs');

console.log("Running Tailwind CLI...");
execSync("node node_modules/@tailwindcss/cli -i src/index.css -o dist/temp.css");

const css = fs.readFileSync('dist/temp.css', 'utf8');
console.log("Size of temp.css:", css.length);
console.log("Contains w-8?", css.includes('w-8'));
console.log("Contains bg-destructive?", css.includes('bg-destructive'));
