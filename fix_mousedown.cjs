const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');
// Find all <Button and add onMouseDown={(e) => e.preventDefault()} if it doesn't exist
let newCode = code.replace(/<Button\b([^>]*?)>/g, (match, p1) => {
  if (p1.includes('onMouseDown')) return match;
  return `<Button onMouseDown={(e) => e.preventDefault()} ${p1}>`;
});

// Do the same for SelectTrigger
newCode = newCode.replace(/<SelectTrigger\b([^>]*?)>/g, (match, p1) => {
  if (p1.includes('onMouseDown')) return match;
  return `<SelectTrigger onMouseDown={(e) => e.preventDefault()} ${p1}>`;
});

if (code !== newCode) {
  fs.writeFileSync('src/Toolbar.tsx', newCode);
  console.log('Added onMouseDown to Buttons and SelectTriggers.');
} else {
  console.log('No matches found.');
}
