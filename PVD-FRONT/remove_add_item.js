const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// remove addItemByCode from interface
code = code.replace(/\s*addItemByCode: \(codeOrEan: string, quantity\?: number\) => Promise<boolean>;\n/, '\n');

// remove addItemByCode implementation
const regex = /\s*const addItemByCode = async \(codeOrEan: string, quantity\?: number\): Promise<boolean> => \{[\s\S]*?\};\n/;
code = code.replace(regex, '\n');

// remove from export
code = code.replace(/\s*addItemByCode,\n/, '\n');

fs.writeFileSync(path, code);
