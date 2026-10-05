const fs = require('fs');
const path = 'src/pages/CashMovement/service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /addCashMovement\(modalType, val, opReason, opAuth \|\| 'Sup. Marcos Silveira'\);\n\s*setModalType\(null\);/,
  `addCashMovement(modalType, val, opReason, opAuth || 'Sup. Marcos Silveira').then((success) => {
      if (success !== false) setModalType(null);
    });`
);

fs.writeFileSync(path, code);
