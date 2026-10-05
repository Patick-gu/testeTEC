const fs = require('fs');
const path = 'src/pages/Team/service.ts';
let code = fs.readFileSync(path, 'utf8');

// Add state for modal
code = code.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
  `const [searchQuery, setSearchQuery] = useState('');\n  const [userToDelete, setUserToDelete] = useState<string | null>(null);`
);

// Replace handleDelete with requestDelete and confirmDelete
code = code.replace(
  /const handleDelete = async \(id: string\) => \{[\s\S]*?if \(!window\.confirm\("Deseja realmente remover este usuário do banco de dados\?"\)\) return;[\s\S]*?try \{[\s\S]*?const res = await fetch\(\`\$\{API_URL\}\/users\/\$\{id\}\`/,
  `const requestDelete = (id: string) => setUserToDelete(id);
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(\`\${API_URL}/users/\${userToDelete}\``
);

code = code.replace(
  /showToast\('Usuário removido!'\);\n\s*fetchUsers\(\);\n\s*\} catch \(err\) \{/,
  `showToast('Usuário removido!');\n      setUserToDelete(null);\n      fetchUsers();\n    } catch (err) {`
);

code = code.replace(
  /handleDelete,/,
  `requestDelete, confirmDelete, userToDelete, setUserToDelete,`
);

fs.writeFileSync(path, code);
