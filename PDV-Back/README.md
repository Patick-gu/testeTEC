# PDV - Backend

API RESTful em Laravel 11 para o Sistema de PDV (Frente de Caixa).

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o backend localmente:

1. Instale as dependências do PHP:
   ```bash
   composer install
   ```
2. Configure o arquivo de ambiente:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Configure as credenciais do seu banco de dados no arquivo `.env` (DB_DATABASE, DB_USERNAME, etc).
4. Rode as migrações e popule o banco com dados de teste:
   ```bash
   php artisan migrate:fresh --seed
   ```
5. Inicie o servidor:
   ```bash
   php artisan serve --port=8001
   ```

---

## 🔑 Credenciais de Acesso (Testes)

A rotina de seeders criará automaticamente os seguintes usuários para você usar na plataforma:

### 👑 Administrador (Gestão de Estoque e Usuários)
- **E-mail:** `admin@pdv.com`
- **Senha:** `123456`

### 🛒 Operadores (Frente de Caixa)
*(Todos possuem a senha `123456`)*
- `operador1@pdv.com` (Clarice Lispector)
- `operador2@pdv.com` (Fernando Pessoa)
- `operador3@pdv.com` (Cecília Meireles)
- `operador4@pdv.com` (João Guimarães Rosa)
- `operador5@pdv.com` (Graciliano Ramos)

---

## 🧠 Decisões Técnicas e Arquitetura

Conforme solicitado no escopo do teste, diversas decisões foram tomadas visando um código manutenível e regras de negócios blindadas:

1. **Separação de Responsabilidades (Service Pattern):**
   Toda a lógica complexa (cálculo de troco, atacado/varejo, verificação de caixa aberto) foi isolada em classes de Serviço (`SaleService`, `TurnoService`, `ProdutoService`), deixando os Controllers extremamente limpos e focados apenas em receber e responder requisições. O padrão de comentários estruturados (Scribe) foi utilizado na documentação visual das rotas.

2. **Preço Histórico na Venda:**
   Ao registrar um `SaleItem`, o valor atual do produto é copiado e gravado na linha da venda (`unit_price`). Assim, se o preço do produto sofrer alteração futura, o histórico das vendas passadas permanece intacto e auditável.

3. **Validação Rigorosa de Pagamento e Troco:**
   O backend não confia no "Total" ou no "Troco" calculado e enviado pelo frontend. O total da venda é recalculado pelo backend linha a linha. Na etapa de pagamento, o sistema só finaliza a venda se o valor pago (`amount_paid`) for maior ou igual ao exigido.

4. **Soft Deletes no Estoque:**
   Os produtos utilizam a exclusão lógica (`SoftDeletes`). Ao serem "deletados" por um admin, eles apenas saem do catálogo de novas vendas, mas o histórico financeiro ou cupons que os referenciam não quebram.

---

## 🛡️ Segurança e Testes Automatizados (Bônus)

Além das rotas básicas, cobrimos cenários vitais para tornar o sistema apto para um ambiente de alto volume:

### Testes Automatizados (PHPUnit)
Foram escritos testes de integração na pasta `tests/Feature/` totalizando 36 asserções de sucesso que garantem regras como:
- Produtos inativos ou sem estoque não podem ser vendidos sob hipótese alguma.
- Caixas fechados não aceitam vendas.
- Rotas restritas de admin estão protegidas contra operadores.
- Ex-funcionários com `status = off` perdem acesso imediato.
*(Para rodar: `php artisan test`)*

### Teste de Carga e Concorrência (k6)
Para garantir que a famigerada **Condição de Corrida (Race Condition)** não ocorra (ex: quando dois caixas vendem a última Coca-cola disponível no mesmo milissegundo), isolamos a checagem e baixa de estoque do `SaleService` dentro de uma transação com bloqueio pessimista via banco de dados: `lockForUpdate()`.

Para provar a resiliência dessa trava, escrevemos um teste de estresse utilizando o **Grafana k6** (`tests/load-tests/sales-concurrency.js`). O script loga como um operador e dispara dezenas de vendas simultâneas e fracionadas.

**Como reproduzir o teste de carga:**
1. Resete o banco de dados (`php artisan migrate:fresh --seed`).
2. Suba o servidor PHP.
3. Em outro terminal, execute o script automatizado:
   ```bash
   cd tests/load-tests
   ./k6 run sales-concurrency.js
   ```
*O resultado exibirá dezenas de vendas sendo salvas rapidamente até o estoque de determinados produtos chegar a zero, momento exato em que as requisições que concorriam pelo mesmo produto passarão a receber erro HTTP 400 (Falta de Estoque), provando que nosso sistema **não permitiu que o estoque ficasse negativo**.*

### Proteção Anti-Força-Bruta (Rate Limit)
A rota de autenticação da API possui configuração limitadora (`throttle`), bloqueando automaticamente o IP que fizer mais de 5 tentativas malsucedidas de login seguidas no prazo de um minuto.
