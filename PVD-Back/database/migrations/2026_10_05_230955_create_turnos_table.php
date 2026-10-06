<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('status')->default('aberto'); // aberto, fechado
            $table->timestamp('data_abertura')->useCurrent();
            $table->decimal('valor_abertura', 10, 2)->default(0);
            $table->timestamp('data_fechamento')->nullable();
            $table->decimal('valor_fechamento_esperado', 10, 2)->nullable();
            $table->decimal('valor_fechamento_informado', 10, 2)->nullable();
            $table->decimal('diferenca_caixa', 10, 2)->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turnos');
    }
};
