<?php

namespace Database\Factories;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Produto>
 */
class ProdutoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'categoria_id' => Categoria::factory(),
            'code' => fake()->unique()->numerify('PROD-#####'),
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 100),
            'wholesale_price' => fake()->randomFloat(2, 5, 90),
            'wholesale_min_quantity' => fake()->numberBetween(5, 20),
            'stock_quantity' => fake()->numberBetween(10, 100),
            'active' => true,
        ];
    }
}
