# PDV - Frontend

Interface de Ponto de Venda (Frente de Caixa) construída com **React 19, Vite, TypeScript e Tailwind CSS v4**.

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar a aplicação:

1. Certifique-se de que o **Node.js** está instalado na sua máquina.
2. Navegue até a pasta do frontend e instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseadas no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Certifique-se de que o `VITE_API_URL` aponta para o endereço local do seu backend, ex: `http://localhost:8001/api`)*
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse a aplicação no seu navegador (geralmente em `http://localhost:3000`).

---

## 🧠 Decisões Técnicas e Arquitetura

O frontend foi projetado para imitar um PDV real de alta performance, focando na agilidade do operador de caixa e na resiliência contra erros. As principais decisões arquiteturais incluem:

1. **State Management com Context API Segmentada:**
   Optamos por não utilizar Redux ou Zustand para evitar *over-engineering*. Todo o gerenciamento de estado foi feito com a Context API nativa do React de forma segmentada (`AuthContext`, `CartContext`, `CashflowContext`, `SaleContext`). Isso evita re-renderizações desnecessárias e mantém a regra de negócio isolada por domínio.

2. **Proteção de Rota - ShiftGuard (Guardião de Turno):**
   O componente `<ShiftGuard />` envolve as rotas de venda (`/terminal`, etc). Ele se comunica com o backend para verificar se o operador atual possui um "Caixa Aberto". Caso negativo, o usuário é automaticamente bloqueado e redirecionado para a tela de abertura de turno, respeitando a regra de fluxo de caixa da empresa.

3. **Arquitetura Orientada a Features:**
   A pasta `src/pages/` não agrupa apenas os arquivos TSX da tela. Cada diretório de página (ex: `Terminal/`) possui sua própria sub-pasta de `components/`, e seu arquivo `service.ts` para conectar com a API. Essa segregação torna o projeto imensamente escalável, onde cada página funciona quase como um micro-frontend isolado.

4. **Componentes Fiscais e de Interação Otimizada:**
   Criamos Modais especializados para simular fluxos de PDV avançados, como a emissão de cupom térmico (`ThermalReceiptModal`), informações fiscais na tela (`CpfPromptModal`), atalhos de teclado (para não depender do mouse no caixa) e até um utilitário de áudio (`audio.ts`) para emitir sons de "Bipe" ao passar códigos de barra.

5. **Tailwind CSS v4:**
   Estilização *Utility-First* que garantiu a rápida prototipagem de uma interface limpa, focada no alto contraste (necessário para monitores de supermercados/lojas) e responsividade para tablets ou telas touch de PDV.

6. **Camada de API Centralizada (Axios):**
   Toda a comunicação com o Laravel (incluindo tratamento de erros e injeção do token JWT) ocorre em módulos dedicados (`src/api/`). Caso a tecnologia do backend mude ou as URLs mudem, a refatoração será restrita a essa única pasta, blindando os componentes visuais.
