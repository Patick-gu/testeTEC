# Módulo de Histórico de Estoque (Kardex)

O Kardex é o livro-razão de um produto. Ele registra cada unidade que entra ou sai da prateleira, garantindo transparência total da vida útil do produto.

## O Problema que Resolve
Atualmente, se o gerente verificar que o produto "Coca-Cola" tem 10 unidades em estoque, mas fisicamente na prateleira só tem 8, ele vai lá no painel e edita para 8. O problema é: O que aconteceu com as 2 que sumiram? E pior, se um funcionário malicioso roubar mercadoria e editar o estoque no sistema para acobertar, ninguém saberá. 
O Kardex resolve isso criando um histórico imutável: Ninguém edita a coluna `stock_quantity` diretamente. Para o estoque mudar, é OBRIGATÓRIO gerar um registro no Kardex.

## Regras de Negócio e Operações
- **Entrada/Saída Automática (Sistema)** : Quando uma venda for finalizada, o Backend automaticamente insere uma linha no Kardex de tipo `out` (saída) e o motivo "Venda #123".
- **Ajuste Manual (Gerencial)** : Se o gerente precisar dar entrada numa nota fiscal ou registrar perda (produto venceu ou quebrou), ele cria um lançamento no Kardex. O próprio Kardex atualiza o saldo do produto.
- **Update e Delete (BLOQUEADO)** : É estritamente proibido alterar ou apagar uma movimentação de estoque. Se lançou errado, deve lançar uma operação inversa para estornar.

---

# Banco de Dados (Modelagem)

### Tabela: `movimentacoes_estoque` (inventory_movements / kardex)
- id : UUID, PK
- product_id : UUID, FK (Aponta para o produto que sofreu alteração)
- user_id : UUID, FK (Aponta para o usuário/gerente que causou a movimentação)
- type : ENUM ('in', 'out') (Entrada ou Saída)
- quantity : INT, NOT NULL (Quantidade movimentada. Ex: 5)
- reason : ENUM ('sale', 'purchase', 'loss', 'adjustment') (Motivo sistêmico)
- description : VARCHAR(255), NULLABLE (Texto livre. Ex: "Garrafa quebrou no depósito")
- created_at : TIMESTAMP (Data e hora do ocorrido)
