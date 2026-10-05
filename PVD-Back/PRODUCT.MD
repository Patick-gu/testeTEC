# Base para o Módulo de Estoque (Categorias e Produtos)

Deve-se criar os métodos e rotas para trabalhar o estoque. As regras de acesso são divididas por perfis (Roles). O `admin` possui acesso total (Backoffice), enquanto o `user` (Atendente/PDV) possui acesso restrito às operações de venda e consulta.

Todas as rotas de modificação serão protegidas via Middleware (ex: `IsAdmin`).

## Operações (Produtos)
- Create : Cadastrar produto -> admin
- Read : Consultar/listar produtos -> user / admin
- Update : Alterar nome/código/preço/estoque -> admin
- Delete (Soft Delete) : Mover para a "lixeira" (preenche a coluna `deleted_at`) em vez de apagar definitivamente do banco -> admin
- Ativar/Desativar : Pausar a venda de um item temporariamente (altera a flag `active`) -> admin
- Search : Buscar por nome, código de barras ou categoria -> user / admin
- Consultar estoque : Ver quantidade disponível -> admin / user (na tela de PDV)

## Operações (Categorias)
- Create : Cadastrar grupo (ex: Bebidas, Lanches) -> admin
- Read : Listar categorias para o menu -> user / admin
- Update : Renomear categoria -> admin
- Delete : Excluir grupo (com trava de segurança se houver produtos vinculados) -> admin
---

# Banco de dados

Modelagem estrutural de como as tabelas de estoque devem ser organizadas:

### Tabela: `categorias` (categories)
- id : UUID, PK
- name : VARCHAR(255), NOT NULL, UNIQUE
- created_at : TIMESTAMP
- updated_at : TIMESTAMP

### Tabela: `produtos` (products)
- id : UUID, PK
- category_id : UUID, FK (Chave Estrangeira apontando para categorias)
- code : VARCHAR(50), NOT NULL, UNIQUE (SKU ou Código de Barras)
- name : VARCHAR(255), NOT NULL
- price : DECIMAL(10,2), NOT NULL
- wholesale_price : DECIMAL(10,2), NULLABLE (Preço de atacado)
- wholesale_min_quantity : INT, NULLABLE (Quantidade mínima para aplicar o preço de atacado)
- stock_quantity : INT, NOT NULL, DEFAULT 0
- active : BOOLEAN, NOT NULL, DEFAULT TRUE (Para desativar venda sem excluir)
- deleted_at : TIMESTAMP, NULLABLE (Soft Deletes do Laravel)
- created_at : TIMESTAMP
- updated_at : TIMESTAMP
