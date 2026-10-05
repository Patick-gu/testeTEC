const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\s*addItemByCode: \(codeOrEan: string, quantity\?: number\) => Promise<boolean>;/, '');
const regex = /\s*const addItemByCode = async \(codeOrEan: string, quantity\?: number\): Promise<boolean> => \{[\s\S]*?\n  \};\n/;
code = code.replace(regex, '\n');
code = code.replace(/\s*addItemByCode,/, '');

fs.writeFileSync(path, code);
