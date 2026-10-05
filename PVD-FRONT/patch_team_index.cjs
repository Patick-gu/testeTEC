const fs = require('fs');
const path = 'src/pages/Team/index.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Import ConfirmModal
code = code.replace(
  /import \{ styles \} from '.\/style';/,
  `import { styles } from './style';\nimport { ConfirmModal } from '../../components/ui/ConfirmModal';`
);

// 2. Destructure new props
code = code.replace(
  /handleDelete,/,
  `requestDelete, confirmDelete, userToDelete, setUserToDelete,`
);

// 3. Change the button onClick
code = code.replace(
  /onClick=\{[^\}]*handleDelete\(member\.id\)\}/,
  `onClick={() => requestDelete(member.id)}`
);

// 4. Add ConfirmModal to the end
code = code.replace(
  /\{showModal && \(/,
  `<ConfirmModal
        isOpen={!!userToDelete}
        title="Excluir Usuário?"
        description="Esta ação removerá o usuário permanentemente do sistema. Deseja continuar?"
        confirmText="Sim, Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />\n\n      {showModal && (`
);

fs.writeFileSync(path, code);
