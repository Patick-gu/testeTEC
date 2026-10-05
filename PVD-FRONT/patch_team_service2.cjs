const fs = require('fs');
const path = 'src/pages/Team/service.ts';
let code = fs.readFileSync(path, 'utf8');

// Ensure usePdv is imported if not already
if (!code.includes('usePdv')) {
  code = code.replace(
    /import \{ useAuth \} from '..\/..\/context\/AuthContext';/,
    `import { useAuth } from '../../context/AuthContext';\nimport { usePdv } from '../../context/PdvContext';`
  );
  code = code.replace(
    /const \{ token \} = useAuth\(\);/,
    `const { token } = useAuth();\n  const { showToast } = usePdv();`
  );
}

// Fix confirmDelete
code = code.replace(
  /setTeam\(prev => prev\.filter\(u => u\.id !== id\)\);\n\s*\} catch \(err: any\) \{/,
  `setTeam(prev => prev.filter(u => u.id !== userToDelete));\n      setUserToDelete(null);\n      showToast('Usuário removido com sucesso!');\n    } catch (err: any) {\n      setUserToDelete(null);\n      showToast("Erro ao excluir usuário: " + err.message);\n    }`
);

// Fix alert
code = code.replace(
  /alert\("Erro ao excluir usuário: " \+ err\.message\);/,
  `// handled above`
);

// Fix the other alert
code = code.replace(
  /alert\("Falha de conexão com a API: " \+ err\.message\);/,
  `showToast("Falha de conexão com a API: " + err.message);`
);

fs.writeFileSync(path, code);
