const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');
let newCode = code.replace(/<(Button|button|input)([^>]*?)title="[^"]*"/g, '<$1$2');
if (code !== newCode) {
  fs.writeFileSync('src/Toolbar.tsx', newCode);
  console.log('Replaced title attributes on HTML/UI elements.');
} else {
  console.log('No matches found.');
}
