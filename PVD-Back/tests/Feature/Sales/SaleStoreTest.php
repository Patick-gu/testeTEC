<?php

namespace Tests\Feature\Sales;

use App\Models\Produto;
use App\Models\User;
use App\Models\Sale;
use App\Models\FluxoCaixa;
use App\Models\Categoria;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class SaleStoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Categoria é requerida pelo Produto
        $this->categoria = Categoria::factory()->create();
    }

    private function authenticate()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return $this->withHeader('Authorization', 'Bearer ' . $token)->actingAs($user);
    }

    public function test_it_creates_a_sale_successfully_and_decrements_stock()
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
            'price' => 100.00,
            'stock_quantity' => 10,
            'wholesale_min_quantity' => 5,
            'wholesale_price' => 80.00
        ]);

        $response = $this->authenticate()->postJson('/api/sales', [
            'payment_method' => 'credit_card',
            'items' => [
                [
                    'produto_id' => $produto->id,
                    'quantity' => 2 // Abaixo do atacado, preço normal
                ]
            ]
        ]);

        $response->assertStatus(200);

        // Verifica Banco de Dados
        $this->assertDatabaseHas('sales', [
            'payment_method' => 'credit_card',
            'total_amount' => 200.00, // 2 * 100
        ]);

        $this->assertDatabaseHas('sale_items', [
            'produto_id' => $produto->id,
            'quantity' => 2,
            'unit_price' => 100.00,
            'subtotal' => 200.00,
        ]);

        $this->assertDatabaseHas('fluxo_caixa', [
            'type' => 'entrada',
            'valor' => 200.00,
        ]);

        // Verifica Estoque
        $this->assertEquals(8, $produto->fresh()->stock_quantity);
    }

    public function test_it_applies_wholesale_price_when_quantity_is_met()
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
            'price' => 100.00,
            'stock_quantity' => 20,
            'wholesale_min_quantity' => 5,
            'wholesale_price' => 80.00
        ]);

        $response = $this->authenticate()->postJson('/api/sales', [
            'payment_method' => 'pix',
            'items' => [
                [
                    'produto_id' => $produto->id,
                    'quantity' => 6 // Acima do atacado, preço 80
                ]
            ]
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('sales', [
            'total_amount' => 480.00, // 6 * 80
        ]);

        $this->assertDatabaseHas('sale_items', [
            'unit_price' => 80.00,
        ]);
    }

    public function test_it_rolls_back_transaction_if_stock_is_insufficient()
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
            'stock_quantity' => 2,
        ]);

        $response = $this->authenticate()->postJson('/api/sales', [
            'payment_method' => 'cash',
            'items' => [
                [
                    'produto_id' => $produto->id,
                    'quantity' => 5 // Maior que o estoque
                ]
            ]
        ]);

        // Deve falhar com 400 por causa da exceção
        $response->assertStatus(400);

        // Garante que NADA foi salvo no banco
        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertDatabaseCount('fluxo_caixa', 0);

        // Estoque deve continuar intacto
        $this->assertEquals(2, $produto->fresh()->stock_quantity);
    }
}
