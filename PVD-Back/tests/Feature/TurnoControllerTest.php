<?php

namespace Tests\Feature;

use App\Models\Turno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class TurnoControllerTest extends TestCase
{
    use RefreshDatabase;

    private function authenticate($role = 'user')
    {
        $user = User::factory()->create(['role' => $role]);
        $token = JWTAuth::fromUser($user);

        return [$user, $token];
    }

    public function test_user_can_open_turno()
    {
        [$user, $token] = $this->authenticate();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/abrir', [
                'valor_abertura' => 150.00,
            ]);

        $response->assertStatus(201);
        $response->assertJson(['message' => 'Caixa aberto com sucesso.']);

        $this->assertDatabaseHas('turnos', [
            'user_id' => $user->id,
            'status' => 'aberto',
            'valor_abertura' => 150.00,
        ]);

        $this->assertDatabaseHas('fluxo_caixa', [
            'user_id' => $user->id,
            'type' => 'abertura',
            'valor' => 150.00,
        ]);
    }

    public function test_admin_cannot_open_turno()
    {
        [$admin, $token] = $this->authenticate('admin');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/abrir', [
                'valor_abertura' => 100.00,
            ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_open_multiple_turnos()
    {
        [$user, $token] = $this->authenticate();

        Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'valor_abertura' => 50.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/abrir', [
                'valor_abertura' => 100.00,
            ]);

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Você já possui um caixa aberto.']);
    }

    public function test_user_can_close_turno()
    {
        [$user, $token] = $this->authenticate();

        $turno = Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'valor_abertura' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/fechar', [
                'valor_fechamento_informado' => 100.00,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Caixa fechado com sucesso.']);

        $this->assertDatabaseHas('turnos', [
            'id' => $turno->id,
            'status' => 'fechado',
            'valor_fechamento_esperado' => 100.00,
            'valor_fechamento_informado' => 100.00,
            'diferenca_caixa' => 0.00,
        ]);
    }

    public function test_user_can_get_current_turno()
    {
        [$user, $token] = $this->authenticate();

        $turno = Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'valor_abertura' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/caixa/turno-atual');

        $response->assertStatus(200);
        $response->assertJson(['status' => 'aberto']);
    }
}
