const fs = require('fs');
const path = 'src/pages/Terminal/index.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Import ConfirmModal
code = code.replace(
  /import \{ styles \} from '.\/style';/,
  `import { styles } from './style';\nimport { ConfirmModal } from '../../components/ui/ConfirmModal';`
);

// 2. Destructure new props
code = code.replace(
  /setAuthInput,\n\s*confirmRemoveItem,\n\s*cancelRemoveItem/,
  `setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem,
    showCancelConfirm,
    setShowCancelConfirm,
    requestClearCart,
    confirmClearCart`
);

// 3. Change the button onClick
code = code.replace(
  /<button\n\s*onClick=\{clearCart\}/,
  `<button\n                  onClick={requestClearCart}`
);

// 4. Add ConfirmModal to the end
code = code.replace(
  /\{authModal\.open && \(/,
  `<ConfirmModal
        isOpen={showCancelConfirm}
        title="Cancelar Venda?"
        description="Esta ação removerá todos os itens e não poderá ser desfeita. Tem certeza que deseja cancelar a venda atual?"
        confirmText="Sim, Cancelar Venda"
        onConfirm={confirmClearCart}
        onCancel={() => setShowCancelConfirm(false)}
      />\n\n      {authModal.open && (`
);

fs.writeFileSync(path, code);
