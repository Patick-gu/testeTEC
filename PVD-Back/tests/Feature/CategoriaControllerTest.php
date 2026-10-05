<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoriaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_categorias()
    {
        $user = User::factory()->create();
        Categoria::factory()->count(3)->create();

        $response = $this->actingAs($user, 'api')->getJson('/api/categorias');

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_can_create_categoria()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->postJson('/api/categorias', [
            'name' => 'Nova Categoria'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('categorias', [
            'name' => 'Nova Categoria'
        ]);
    }

    public function test_cannot_create_categoria_without_name()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'api')->postJson('/api/categorias', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_can_update_categoria()
    {
        $user = User::factory()->create();
        $categoria = Categoria::factory()->create(['name' => 'Nome Antigo']);

        $response = $this->actingAs($user, 'api')->putJson("/api/categorias/{$categoria->id}", [
            'name' => 'Nome Novo'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('categorias', [
            'id' => $categoria->id,
            'name' => 'Nome Novo'
        ]);
    }

    public function test_can_delete_categoria()
    {
        $user = User::factory()->create();
        $categoria = Categoria::factory()->create();

        $response = $this->actingAs($user, 'api')->deleteJson("/api/categorias/{$categoria->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categorias', [
            'id' => $categoria->id
        ]);
    }
}
