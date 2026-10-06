# 🛒 Sistema Completo de Ponto de Venda (PDV) - Frente de Caixa

Este é o repositório principal do Sistema de Frente de Caixa (PDV), desenvolvido como solução completa *Full Stack* para a gestão de vendas, controle de turnos/caixas e inventário em tempo real.

O projeto está dividido em dois diretórios:
- **`PDV-Back/`**: API RESTful robusta desenvolvida em **Laravel 11** e PHP 8.
- **`PDV-Frontend/`**: Interface de alta reatividade desenvolvida com **React 19, TypeScript e TailwindCSS**.

---

## 🚀 Como testar e executar a aplicação

Para rodar todo o ecossistema localmente, siga as instruções específicas dentro de cada pasta:

1. **[Backend (Laravel)](./PDV-Back/README.md)**: Instale as dependências via Composer, configure o banco de dados e rode `php artisan migrate:fresh --seed` para popular os produtos e os usuários de teste na sua máquina.
2. **[Frontend (React)](./PDV-Frontend/README.md)**: Instale os pacotes via NPM e rode a interface com o Vite para interagir com o terminal de vendas.

*(Recomendamos abrir 2 terminais separados no seu sistema operacional, um para a API do backend na porta 8001 e outro para rodar o frontend na porta 3000).*

---

## 🧠 Principais Decisões Técnicas e de Engenharia (Full Stack)

A arquitetura do projeto foi pensada não apenas para "funcionar", mas para se comportar como um software maduro, pronto para produção e seguro contra falhas críticas comuns em sistemas de varejo.

Abaixo, os grandes destaques e decisões tomadas durante a construção:

### 1. Prevenção de Condições de Corrida (Race Condition) no Estoque
Em um cenário onde dois caixas diferentes tentam vender a última unidade de um produto no exato mesmo milissegundo, a maioria dos sistemas falha deixando o estoque negativo.
Para evitar isso, isolamos a baixa de estoque do backend dentro de uma **Transaction (Transação de Banco de Dados)** com **Bloqueio Pessimista (`lockForUpdate()`)**. Isso obriga o banco a criar uma fila, garantindo matematicamente que o estoque nunca caia para menos de zero.
*↳ Validado por meio de testes automatizados e por um script oficial de teste de estresse no k6 incluso no projeto.*

### 2. Guardião de Turnos de Caixa (Shift Guard)
Para obrigar o operador a declarar um fundo de troco e prestar contas no final do dia, o sistema possui a entidade rigorosa de `Turno`.
- No Frontend, criamos o componente genérico `<ShiftGuard />` que "abraça" todas as rotas sensíveis, impedindo visualmente o acesso de funcionários sem caixa aberto.
- No Backend, a lógica transacional proíbe que qualquer venda passe se o Token JWT enviado não estiver vinculado a um caixa com o status `aberto`.

### 3. Backend como a Única "Fonte da Verdade" Financeira
Sistemas de frente de caixa nunca devem confiar em cálculos provenientes de clientes Web ou Mobile. Todo o cálculo do total de venda (incluindo descontos por preço de atacado) e do troco não é aceito diretamente do Front. O Backend apenas recebe a **Lista de Itens** e o **Valor Entregue pelo Cliente em Dinheiro**, reprocessa todos os preços com base na tabela do dia e recusa a venda se identificar tentativas de burla.

### 4. Preservação de Preços Históricos e Soft Deletes
Quando um produto é vendido, o sistema copia fisicamente o valor vigente daquele minuto (`unit_price`) para o item do comprovante (`SaleItem`). Isso significa que a inflação no catálogo (se o preço do produto subir no dia seguinte) não quebrará os relatórios e extratos do mês passado. Além disso, excluímos produtos via `SoftDeletes` lógicos para preservar os cupons atrelados a ele para sempre.

### 5. Separação Estrita de Responsabilidades (Design Patterns)
- **Frontend**: Usamos a *Context API* nativa do React em vez do Redux para evitar complexidades desnecessárias e isolar bem os domínios (Carrinho, Fluxo de Caixa, Autenticação). Cada tela tem seu respectivo `service.ts` blindando os componentes da requisição HTTP bruta.
- **Backend**: Implementamos a camada de *Services* (`SaleService`, `ProdutoService`), retirando completamente a lógica de negócios dos *Controllers*. Os controladores assumiram apenas a responsabilidade limpa de despachar e responder às rotas. A documentação da API foi padronizada através de PHPDoc *Scribe-style*.

### 6. Testes Automatizados e Resiliência
Para garantir a confiança na entrega e estabilidade a cada alteração, a aplicação contempla:
- Bateria de testes de Integração (Feature Tests) cobrindo regras sensíveis via PHPUnit.
- Proteção nativa de *Rate Limit* (Anti-Força-Bruta) na Autenticação.
- Robô de Teste de Estresse incluso no diretório ([k6/load-tests](./PDV-Back/tests/load-tests/README.md)) para validação do bloqueio de estoque.

---

Sinta-se à vontade para explorar o código! Cada pasta principal (Front e Back) possui seu próprio README detalhando configurações específicas de sua tecnologia e bibliotecas.
