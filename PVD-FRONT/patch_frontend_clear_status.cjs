const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /openingFund: 250\.00,\n\s*totalSales: 4892\.40,\n\s*salesCount: 42,\n\s*cashInDrawer: 1180\.00,\n\s*pixTotal: 1425\.80,\n\s*cardDebit: 1120\.00,\n\s*cardCredit: 1166\.60,/,
  `openingFund: 0,
    totalSales: 0,
    salesCount: 0,
    cashInDrawer: 0,
    pixTotal: 0,
    cardDebit: 0,
    cardCredit: 0,`
);

fs.writeFileSync(path, code);
