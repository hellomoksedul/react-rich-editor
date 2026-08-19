const fs = require('fs');
const file = 'd:/Practice/moksedul/packages/react-rich-editor/src/Toolbar.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('< onCloseAutoFocus={(e) => e.preventDefault()}')) {
    let tag = 'DropdownMenuContent';
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('</DropdownMenuContent>')) {
        tag = 'DropdownMenuContent';
        break;
      }
      if (lines[j].includes('</PopoverContent>')) {
        tag = 'PopoverContent';
        break;
      }
      if (j > i && lines[j].includes('< onCloseAutoFocus={(e) => e.preventDefault()}')) {
        break;
      }
    }
    lines[i] = lines[i].replace('< onCloseAutoFocus={(e) => e.preventDefault()}', `<${tag} onCloseAutoFocus={(e) => e.preventDefault()}`);
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed');
