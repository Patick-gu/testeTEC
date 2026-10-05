<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProdutoControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Cria uma categoria base para os testes
        $this->categoria = Categoria::create(['name' => 'Categoria Teste']);
    }

    public function test_user_cannot_create_produto()
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user, 'api')->postJson('/api/produtos', [
            'categoria_id' => $this->categoria->id,
            'code' => '123456',
            'name' => 'Produto Teste',
            'price' => 10.50,
            'stock_quantity' => 100,
        ]);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Acesso negado.']);
    }

    public function test_admin_can_create_produto()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'api')->postJson('/api/produtos', [
            'categoria_id' => $this->categoria->id,
            'code' => '123456',
            'name' => 'Produto Teste',
            'price' => 10.50,
            'stock_quantity' => 100,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('produtos', ['code' => '123456']);
    }

    public function test_user_cannot_update_produto()
    {
        $user = User::factory()->create(['role' => 'user']);
        $produto = Produto::create([
            'categoria_id' => $this->categoria->id,
            'code' => '111',
            'name' => 'Prod 1',
            'price' => 10,
            'stock_quantity' => 10
        ]);

        $response = $this->actingAs($user, 'api')->putJson("/api/produtos/{$produto->id}", [
            'name' => 'Nome Atualizado',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_produto()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $produto = Produto::create([
            'categoria_id' => $this->categoria->id,
            'code' => '111',
            'name' => 'Prod 1',
            'price' => 10,
            'stock_quantity' => 10
        ]);

        $response = $this->actingAs($admin, 'api')->putJson("/api/produtos/{$produto->id}", [
            'name' => 'Nome Atualizado',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('produtos', ['id' => $produto->id, 'name' => 'Nome Atualizado']);
    }

    public function test_user_cannot_delete_produto()
    {
        $user = User::factory()->create(['role' => 'user']);
        $produto = Produto::create([
            'categoria_id' => $this->categoria->id,
            'code' => '111',
            'name' => 'Prod 1',
            'price' => 10,
            'stock_quantity' => 10
        ]);

        $response = $this->actingAs($user, 'api')->deleteJson("/api/produtos/{$produto->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_produto()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $produto = Produto::create([
            'categoria_id' => $this->categoria->id,
            'code' => '111',
            'name' => 'Prod 1',
            'price' => 10,
            'stock_quantity' => 10
        ]);

        $response = $this->actingAs($admin, 'api')->deleteJson("/api/produtos/{$produto->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('produtos', ['id' => $produto->id]);
    }

    public function test_any_user_can_list_produtos()
    {
        $user = User::factory()->create(['role' => 'user']);
        Produto::create([
            'categoria_id' => $this->categoria->id,
            'code' => '111',
            'name' => 'Prod 1',
            'price' => 10,
            'stock_quantity' => 10
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/produtos');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }
}
