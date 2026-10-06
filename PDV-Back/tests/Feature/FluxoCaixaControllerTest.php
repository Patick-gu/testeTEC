<?php

namespace Tests\Feature;

use App\Models\FluxoCaixa;
use App\Models\Turno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class FluxoCaixaControllerTest extends TestCase
{
    use RefreshDatabase;

    private function authenticate($role = 'user')
    {
        $user = User::factory()->create(['role' => $role]);
        $token = JWTAuth::fromUser($user);

        return [$user, $token];
    }

    public function test_user_can_create_suprimento()
    {
        [$user, $token] = $this->authenticate();

        $turno = Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'data_abertura' => now(),
            'valor_abertura' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/movimentacoes', [
                'type' => 'suprimento',
                'valor' => 50.00,
                'descricao' => 'Troco para caixa',
            ]);

        $response->assertStatus(201);
        $response->assertJson(['status' => 'sucesso']);

        $this->assertDatabaseHas('fluxo_caixa', [
            'turno_id' => $turno->id,
            'user_id' => $user->id,
            'type' => 'suprimento',
            'valor' => 50.00,
            'descricao' => 'Troco para caixa',
        ]);
    }

    public function test_user_cannot_create_movement_without_open_turno()
    {
        [$user, $token] = $this->authenticate();

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/movimentacoes', [
                'type' => 'sangria',
                'valor' => 100.00,
                'descricao' => 'Retirada de final de dia',
            ]);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Você precisa abrir o caixa primeiro.']);
    }

    public function test_admin_can_create_movement_for_specific_turno()
    {
        [$admin, $token] = $this->authenticate('admin');

        $user = User::factory()->create();
        $turno = Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'data_abertura' => now(),
            'valor_abertura' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/caixa/movimentacoes', [
                'type' => 'sangria',
                'valor' => 30.00,
                'descricao' => 'Retirada pelo gerente',
                'turno_id' => $turno->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('fluxo_caixa', [
            'turno_id' => $turno->id,
            'user_id' => $admin->id,
            'type' => 'sangria',
            'valor' => 30.00,
        ]);
    }

    public function test_user_can_view_movements()
    {
        [$user, $token] = $this->authenticate();

        $turno = Turno::create([
            'user_id' => $user->id,
            'status' => 'aberto',
            'data_abertura' => now(),
            'valor_abertura' => 100.00,
        ]);

        FluxoCaixa::create([
            'user_id' => $user->id,
            'turno_id' => $turno->id,
            'type' => 'suprimento',
            'valor' => 20.00,
            'descricao' => 'Aporte inicial',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/caixa/movimentacoes');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }
}
