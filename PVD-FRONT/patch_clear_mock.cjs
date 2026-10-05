const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMovements = /movements: \[\s*\{\s*id: 'mov-1',[\s\S]*?authorizer: 'Sup\. Marcos Silveira',\s*amount: 150\.00\s*\}\s*\]/;

code = code.replace(oldMovements, `movements: []`);

fs.writeFileSync(path, code);
