# Registro de Decisões de Arquitetura e Integração (Back <-> Front)

Este documento centraliza todas as decisões técnicas, regras de segurança e contratos de API acordados entre o Backend e o Frontend para o sistema de PDV.

## Decisões Tomadas
### [2026-10-04] Configuração Inicial e Autenticação JWT

**Contexto:** O Backend implementou rotas de criação de usuários (`POST /api/users`), login (`POST /api/login`) retornando um JWT (stateless), e proteção de rotas via middleware `auth:api`.

**Regras para o Frontend:**
1. **Armazenamento do JWT:** O Frontend deve gerenciar o token com cautela. Se a API o retorna no corpo da resposta (JSON), o armazenamento deve ser avaliado com base no risco. Armazenar em `localStorage` ou `sessionStorage` é o mais prático, porém suscetível a ataques XSS. Se a segurança máxima for exigida, deve-se transitar a arquitetura para envio via cookies `HttpOnly` ou manter o token exclusivamente em memória.
2. **Envio do Token:** Todas as requisições para rotas protegidas devem incluir o header HTTP `Authorization: Bearer <token>`.
3. **Tratamento de Erros:**
   - **HTTP 401 (Unauthorized):** O Frontend deve interceptar respostas 401 globalmente (ex: interceptor do Axios), deslogar o usuário localmente (limpando o token de onde foi guardado) e redirecioná-lo para a tela de Login.
   - **HTTP 422 (Unprocessable Entity):** Ocorre quando há falha de validação (ex: criação de usuário com e-mail já existente ou dados inválidos). O Frontend deve capturar esse erro e exibir os detalhes de validação (geralmente presentes em `error.response.data.errors`) para o usuário corrigir e tentar novamente.

**Implicações de Segurança:**
- **Risco de XSS:** Se armazenado no `localStorage`, qualquer script injetado na página pode roubar o token.
- **Proteção do Estado:** A interceptação do 401 assegura que dados restritos não continuem sendo apresentados (e previne requisições órfãs ou repetitivas falhas) quando a sessão é invalidada ou expirada no backend.

### [2026-10-04] Atualizações de Usuários, UUIDs e Custom Claims JWT

**Contexto:** O Backend realizou atualizações críticas incluindo criação de endpoint de listagem, alteração de IDs para UUIDs, e inclusão de role/status nos claims do JWT.

**Regras para o Frontend:**
1. **Listagem de Usuários:** Há um novo endpoint `GET /api/users` para listar atendentes/usuários. O Frontend pode realizar busca 'case-insensitive' pelo nome enviando a querystring `?name=<valor>` (ex: `GET /api/users?name=joao`).
2. **Tipagem de IDs (UUID):** A chave primária da entidade User (`id`) foi alterada de numérico para UUID. O Frontend deve garantir que os IDs de usuário sejam tipados corretamente como `string` no TypeScript (Interfaces/Types), não mais como `number`.
3. **Novos Campos JWT:** Os campos `role` (valores possíveis: `admin`, `user`) e `status` (valores possíveis: `active`, `off`) foram adicionados à entidade User e injetados nas 'Custom Claims' do payload do JWT. O Frontend pode (e deve) decodificar o payload do JWT localmente para acessar essas informações de permissões básicas e status, evitando requisições desnecessárias para a API apenas para consultar essas informações.

**Implicações de Segurança:**
- O Frontend não deve confiar 100% no JWT para liberar lógicas críticas irreversíveis (o backend sempre validará as roles), mas usar as roles do JWT para renderização condicional de UI e navegação é perfeitamente seguro e mais performático.
- O uso de UUID previne enumeração de usuários (IDOR attacks), tornando a busca por IDs sequenciais impossível.

## Requisitos de UI e Controle de Acesso - RBAC

### [2026-10-04] Diretrizes Visuais e Proteção de Rotas Frontend

**Contexto:** O Arquiteto de Software (Backend) definiu a estrutura de telas e o Controle de Acesso Baseado em Perfis (RBAC) suportado pelas Custom Claims do JWT (roles `admin` e `user`). O Frontend precisa implementar o roteamento protegido e a renderização condicional da interface baseados nessas diretrizes contratuais.

**Regras para o Frontend:**
1. **Tela de Login:** Interface inicial e obrigatória para autenticação de todos os usuários. O roteamento no Frontend (ex: React Router, Vue Router) deve possuir um mecanismo (*Guard* ou *Middleware*) que barre sumariamente qualquer acesso a rotas internas se não houver um JWT válido no estado/armazenamento da aplicação.
2. **Painel do Administrador (role === 'admin'):** Trata-se da tela de retaguarda (Backoffice). Para este perfil, o Frontend deve liberar acesso irrestrito às interfaces de:
   - **Gerenciamento de Estoque:** Operações de CRUD completo para categorias e produtos.
   - **Gerenciamento de Funcionários/Usuários:** Operações para criar, atualizar, listar e deletar.
3. **Frente de Caixa / PDV (role === 'user'):** Interface operacional de uso diário. O Frontend DEVE aplicar as seguintes restrições estruturais:
   - **Interface Minimalista e Imersiva:** A tela deve ser limpa, exibindo estritamente os elementos essenciais da venda (carrinho, leitor de código de barras e totalizador).
   - **Suporte a Full Screen:** O Frontend DEVE implementar um *listener* nativo para reagir à tecla `F11`, ativando o modo de tela cheia (Full Screen API) para o painel de vendas.
   - **Bloqueio Rígido na UI:** Qualquer botão, menu lateral, ou link que direcione para a edição de usuários ou gerenciamento de estoque deve ser sumariamente escondido (renderização condicional) para perfis `user`.
   - **Proteção de Rotas Internas:** Se um usuário sem privilégios (`user`) tentar forçar o acesso a uma URL pertencente ao backoffice administratvo pela barra de navegação, o roteador interno do SPA (React/Vue/Angular) deve interceptar e redirecioná-lo imediatamente (ex: para a rota raiz ou tela de venda) e/ou exibir um aviso de "Acesso Negado".

**Implicações de Segurança:**
- **Segurança Visual (UI Security):** A proteção e redirecionamento nas rotas de Front-end asseguram que interfaces restritas sequer sejam carregadas ou visualizadas por operadores de caixa.
- **Redução de Superfície de Ataque Accidental:** Ocultar botões administrativos garante que usuários não-privilegiados não engatilhem chamadas mal-sucedidas ou acidentais à API. 
- **Defesa em Profundidade:** Estas regras constroem uma camada externa de proteção client-side que complementa, mas não substitui, a autorização e validação das roles (RBAC) que já operam e continuam ativas no backend.
