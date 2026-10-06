<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_users()
    {
        User::factory()->count(3)->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'api')->getJson('/api/users');

        $response->assertStatus(200);
        $response->assertJsonCount(4); // 3 created + 1 admin
    }

    public function test_can_create_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'api')->postJson('/api/users', [
            'name' => 'Novo Usuario',
            'email' => 'novo@teste.com',
            'password' => '123456',
            'role' => 'user'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'novo@teste.com',
            'role' => 'user'
        ]);
    }

    public function test_cannot_create_user_with_duplicate_email()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['email' => 'existente@teste.com']);

        $response = $this->actingAs($admin, 'api')->postJson('/api/users', [
            'name' => 'Outro Usuario',
            'email' => 'existente@teste.com',
            'password' => '123456',
            'role' => 'user'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_can_update_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['name' => 'Nome Antigo']);

        $response = $this->actingAs($admin, 'api')->putJson("/api/users/{$user->id}", [
            'name' => 'Nome Novo'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Novo'
        ]);
    }

    public function test_can_delete_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $response = $this->actingAs($admin, 'api')->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', [
            'id' => $user->id
        ]);
    }
}
