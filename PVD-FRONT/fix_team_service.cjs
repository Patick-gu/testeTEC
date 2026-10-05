const fs = require('fs');
const path = 'src/pages/Team/service.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /const requestDelete = \(id: string\) => setUserToDelete\(id\);[\s\S]*?const handleSave = async \(e: React\.FormEvent\) => \{/;

const replacement = `const requestDelete = (id: string) => setUserToDelete(id);
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(\`\${API_URL}/users/\${userToDelete}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      if (!res.ok) throw new Error('Erro ao deletar usuário no servidor');
      setTeam(prev => prev.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
      showToast('Usuário removido com sucesso!');
    } catch (err: any) {
      setUserToDelete(null);
      showToast("Erro ao excluir usuário: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {`;

code = code.replace(regex, replacement);
fs.writeFileSync(path, code);
