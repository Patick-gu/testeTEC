<?php

namespace Database\Seeders;

use App\Models\Produto;
use Illuminate\Database\Seeder;

class ProdutoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria 50 produtos fakes. Como a ProdutoFactory já cria
        // uma Categoria para cada produto, isso populará as duas tabelas.
        Produto::factory()->count(50)->create();
    }
}
