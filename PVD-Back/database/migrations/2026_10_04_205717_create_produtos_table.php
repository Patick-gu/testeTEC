<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Relacionamento com a tabela de categorias
            $table->foreignUuid('categoria_id')->constrained('categorias')->onDelete('restrict');
            
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->boolean('active')->default(true);
            
            $table->softDeletes(); // Cria automaticamente a coluna deleted_at
            $table->timestamps();  // Cria as colunas created_at e updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produtos');
    }
};
