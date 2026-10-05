const fs = require('fs');
const path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import { ThermalReceiptModal } from '.\/components\/modals\/ThermalReceiptModal';/,
  `import { ThermalReceiptModal } from './components/modals/ThermalReceiptModal';\nimport { PrintPromptModal } from './components/modals/PrintPromptModal';`
);

code = code.replace(
  /<ThermalReceiptModal \/>/,
  `<ThermalReceiptModal />\n      <PrintPromptModal />`
);

fs.writeFileSync(path, code);
