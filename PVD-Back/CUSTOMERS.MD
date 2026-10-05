# Módulo de Clientes (Fidelidade e Notas Fiscais)

O módulo de Clientes retira o PDV do completo anonimato e o integra com estratégias de marketing, contabilidade e programas de relacionamento.

## O Problema que Resolve
Num PDV de varejo rápido, vendas anônimas são normais. Porém, o anonimato impede três grandes fluxos empresariais:
1. **Fiscal:** É impossível emitir Nota Fiscal Eletrônica (NFC-e / NF-e) em vendas de alto valor, pois a lei exige a identificação (CPF/CNPJ) do comprador.
2. **Crédito/Fiado:** Impossível criar o conceito de "Caderneta" ou vendas a prazo, já que não sabemos quem está devendo.
3. **Marketing:** Impossível oferecer cashback, pontos de fidelidade ou saber qual é o cliente que mais gasta na loja.
Este módulo resolve isso vinculando opcionalmente um cliente físico/jurídico ao momento da compra.

## Regras de Negócio e Operações
- **Create / Update** : Permitir cadastro rápido na frente de caixa (Apenas CPF e Nome já bastam para salvar).
- **Associação Opcional** : Ao finalizar a venda, o Front-end pode passar opcionalmente a chave `customer_id`. Se não passar, a venda é anônima.
- **Busca Rápida** : Rota de pesquisa onde o operador do caixa digita o CPF ou Telefone para buscar e vincular o cliente antes de apertar em pagar.

---

# Banco de Dados (Modelagem)

### Tabela: `clientes` (customers)
- id : UUID, PK
- name : VARCHAR(255), NOT NULL
- document : VARCHAR(20), UNIQUE, NULLABLE (CPF ou CNPJ)
- phone : VARCHAR(20), NULLABLE
- email : VARCHAR(255), NULLABLE
- created_at : TIMESTAMP
- updated_at : TIMESTAMP

> **⚠️ Impacto na tabela de Vendas (SALES):** 
> Para que isso funcione, a tabela `vendas` deve receber a coluna **`customer_id : UUID, FK, NULLABLE`**. Como é `NULLABLE` (aceita nulo), as vendas em dinheiro rápido continuarão normais, mas quando o cliente quiser o "CPF na Nota", basta gravar o ID dele ali.
