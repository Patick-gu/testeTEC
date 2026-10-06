# Guia: Como Criar e Rodar Migrations no Laravel

No Laravel, nós nunca criamos tabelas no banco de dados "na mão" (como num DBeaver ou pgAdmin). Em vez disso, usamos **Migrations**. 
Migrations funcionam como um "controle de versão" (tipo um Git) para o esquema do seu banco de dados.

## 1. Como criar uma nova Migration
Abra o seu terminal na raiz do projeto e use a ferramenta `artisan`:

```bash
php artisan make:migration create_usuarios_table
```
*Dica: Por convenção, usamos `create_NOME_NO_PLURAL_table`. O Laravel entende essa nomenclatura e já gera o código com a tabela pré-configurada.*

Isso vai criar um arquivo dentro de `database/migrations/` com a data atual (ex: `2024_10_03_000000_create_usuarios_table.php`).

## 2. Estrutura de uma Migration
O arquivo criado terá dois métodos principais: `up()` e `down()`.

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // O que roda quando você MANDA CRIAR
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id(); // Cria uma PK auto-incremento
            $table->string('nome'); // VARCHAR(255)
            $table->string('email')->unique(); // VARCHAR(255) UNIQUE
            $table->string('senha'); // VARCHAR(255)
            $table->timestamps(); // Cria as colunas created_at e updated_at
        });
    }

    // O que roda quando você MANDA DESFAZER (Rollback)
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
```

## 3. Comandos Úteis do Dia a Dia

- **Rodar/Aplicar as migrations pendentes no banco:**
  ```bash
  php artisan migrate
  ```

- **Desfazer a última alteração (Rollback):**
  ```bash
  php artisan migrate:rollback
  ```

- **Apagar TUDO do banco e rodar de novo do zero (muito útil em desenvolvimento):**
  ```bash
  php artisan migrate:fresh
  ```
