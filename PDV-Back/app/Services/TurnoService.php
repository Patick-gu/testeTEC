<?php

namespace App\Services;

use App\Models\FluxoCaixa;
use App\Models\Turno;
use Exception;
use Illuminate\Support\Facades\DB;

class TurnoService
{
    public function getTurnoAtual($user)
    {
        if ($user->role === 'admin') {
            return [
                'status' => 'admin',
                'turno' => null,
            ];
        }

        $turno = Turno::where('user_id', $user->id)
            ->where('status', 'aberto')
            ->first();

        if (! $turno) {
            return [
                'status' => 'fechado',
                'turno' => null,
            ];
        }

        return [
            'status' => 'aberto',
            'turno' => $turno,
        ];
    }

    public function abrirTurno($user, array $data)
    {
        if ($user->role === 'admin') {
            throw new Exception('Admin não precisa abrir caixa.', 403);
        }

        $turnoAberto = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
        if ($turnoAberto) {
            throw new Exception('Você já possui um caixa aberto.', 400);
        }

        DB::beginTransaction();
        try {
            $turno = Turno::create([
                'user_id' => $user->id,
                'status' => 'aberto',
                'valor_abertura' => $data['valor_abertura'],
            ]);

            FluxoCaixa::create([
                'user_id' => $user->id,
                'turno_id' => $turno->id,
                'type' => 'abertura',
                'valor' => $data['valor_abertura'],
                'descricao' => 'Fundo de troco inicial',
            ]);

            DB::commit();

            return $turno;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function fecharTurno($user, array $data)
    {
        $turno = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
        if (! $turno) {
            throw new Exception('Nenhum caixa aberto encontrado.', 400);
        }

        $abertura = $turno->valor_abertura;

        $vendasDinheiro = $turno->sales()->where('payment_method', 'cash')->sum('total_amount');
        $suprimentos = $turno->movimentacoes()->where('type', 'suprimento')->sum('valor');
        $sangrias = $turno->movimentacoes()->where('type', 'sangria')->sum('valor');

        $valorEsperado = $abertura + $vendasDinheiro + $suprimentos - $sangrias;

        $turno->update([
            'status' => 'fechado',
            'data_fechamento' => now(),
            'valor_fechamento_esperado' => $valorEsperado,
            'valor_fechamento_informado' => $data['valor_fechamento_informado'],
            'diferenca_caixa' => $data['valor_fechamento_informado'] - $valorEsperado,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        return $turno;
    }
}
