const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /showToast\(\`Venda #\$\{saleNumber\} concluída com sucesso! NFC-e emitida.\`\);/,
  "showToast(`Venda #${saleNumber} concluída com sucesso!`);"
);

fs.writeFileSync(path, code);
