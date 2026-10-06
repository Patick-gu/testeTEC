# PDV - Backend

API em Laravel 11 para o Sistema de PDV (Ponto de Venda).

## Configuração do Banco e Seeders

Para configurar o banco de dados inicial e rodar as seeds com dados de teste, execute:

```bash
php artisan migrate:fresh --seed
```

Isso irá popular o banco de dados com produtos, categorias e usuários.

## Credenciais de Acesso (Testes)

As seeders criarão automaticamente os seguintes usuários para você usar na plataforma:

### 👑 Administrador (Acesso Total)
- **E-mail:** `admin@pdv.com`
- **Senha:** `123456`

### 🛒 Operadores (Caixa)
Todos os operadores possuem a senha padrão: **`123456`**

| Nome | E-mail |
| :--- | :--- |
| Clarice Lispector | `operador1@pdv.com` |
| Fernando Pessoa | `operador2@pdv.com` |
| Cecília Meireles | `operador3@pdv.com` |
| João Guimarães Rosa | `operador4@pdv.com` |
| Graciliano Ramos | `operador5@pdv.com` |
