const fs = require('fs');
const path = 'src/pages/Terminal/service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /p\.name\.toLowerCase\(\)\.includes\(clean\) \|\| \n\s*p\.code\.toLowerCase\(\)\.includes\(clean\)/,
  `(p.name || '').toLowerCase().includes(clean) || (p.code || '').toLowerCase().includes(clean)`
);

code = code.replace(
  /name: p\.name,/,
  `name: p.name || 'Produto Sem Nome',`
);

fs.writeFileSync(path, code);
