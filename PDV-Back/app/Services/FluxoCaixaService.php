<?php

namespace App\Services;

use App\Models\FluxoCaixa;
use App\Models\Sale;
use App\Models\Turno;
use App\Models\User;
use Exception;

class FluxoCaixaService
{
    public function getStatus($user)
    {
        if ($user->role === 'admin') {
            throw new Exception('Admins não possuem turno próprio.', 403);
        }

        $turno = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
        if (! $turno) {
            throw new Exception('Nenhum turno aberto.', 403);
        }

        return $this->buildTurnoResponse($turno);
    }

    public function getStatusAll()
    {
        $turnosAbertos = Turno::where('status', 'aberto')->with('user')->get();

        $openRegisters = [];

        foreach ($turnosAbertos as $turno) {
            $user = $turno->user;

            $vendas = Sale::where('turno_id', $turno->id)
                ->where('status', 'completed')
                ->get();

            $movimentacoes = FluxoCaixa::where('turno_id', $turno->id)->get();

            $totalSales = $vendas->sum('total_amount');
            $salesCount = $vendas->count();

            $pixTotal = $vendas->where('payment_method', 'pix')->sum('total_amount');
            $cardDebit = $vendas->where('payment_method', 'debit_card')->sum('total_amount');
            $cardCredit = $vendas->where('payment_method', 'credit_card')->sum('total_amount');
            $cashSales = $vendas->where('payment_method', 'cash')->sum('total_amount');

            $sangrias = $movimentacoes->where('type', 'sangria')->sum('valor');
            $suprimentos = $movimentacoes->where('type', 'suprimento')->sum('valor');

            $openingFund = (float) $turno->valor_abertura;

            $cashInDrawer = $openingFund + $cashSales + $suprimentos - $sangrias;

            $movimentacoesFormatadas = $movimentacoes->map(function ($mov) {
                $movUser = User::find($mov->user_id);

                return [
                    'id' => $mov->id,
                    'type' => $mov->type,
                    'payment_method' => (function ($m) {
                        if ($m->type === 'entrada' && preg_match('/Venda PDV #([a-f0-9\-]+)/', $m->getRawOriginal('descricao'), $matches)) {
                            $sale = Sale::find($matches[1]);

                            return $sale ? $sale->payment_method : null;
                        }

                        return null;
                    })($mov),
                    'valor' => $mov->valor,
                    'descricao' => $mov->descricao,
                    'created_at' => $mov->created_at,
                    'operator' => $movUser ? $movUser->name : 'Desconhecido',
                    'role' => $movUser ? $movUser->role : 'user',
                ];
            });

            $openRegisters[] = [
                'id' => $turno->id,
                'operator_id' => $user->id,
                'operator' => $user->name,
                'role' => $user->role,
                'number' => substr($user->id, 0, 4),
                'data' => [
                    'openingFund' => (float) $openingFund,
                    'openedAt' => $turno->created_at->format('Y-m-d H:i:s'),
                    'totalSales' => (float) $totalSales,
                    'salesCount' => $salesCount,
                    'cashInDrawer' => (float) $cashInDrawer,
                    'pixTotal' => (float) $pixTotal,
                    'cardDebit' => (float) $cardDebit,
                    'cardCredit' => (float) $cardCredit,
                    'movements' => $movimentacoesFormatadas,
                ],
            ];
        }

        return $openRegisters;
    }

    public function getMovimentacoes($user)
    {
        if ($user->role === 'admin') {
            return [];
        }

        $turno = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
        if (! $turno) {
            return [];
        }

        $movimentacoes = FluxoCaixa::where('turno_id', $turno->id)
            ->latest()
            ->get();

        return $movimentacoes->map(function ($mov) {
            $movArray = $mov->toArray();
            $pm = null;
            if ($mov->type === 'entrada' && preg_match('/Venda PDV #([a-f0-9\-]+)/', $mov->getRawOriginal('descricao'), $matches)) {
                $sale = Sale::find($matches[1]);
                if ($sale) {
                    $pm = $sale->payment_method;
                }
            }
            $movArray['payment_method'] = $pm;

            return $movArray;
        });
    }

    public function createMovimentacao($user, array $data)
    {
        $turnoId = $data['turno_id'] ?? null;

        if ($user->role === 'admin') {
            if (! $turnoId) {
                throw new Exception('Como admin, você deve informar o turno_id (caixa) que receberá a movimentação.', 400);
            }
            $turno = Turno::where('id', $turnoId)->where('status', 'aberto')->first();
            if (! $turno) {
                throw new Exception('O caixa selecionado não está mais aberto.', 404);
            }
        } else {
            $turno = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
            if (! $turno) {
                throw new Exception('Você precisa abrir o caixa primeiro.', 403);
            }
            $turnoId = $turno->id;
        }

        return FluxoCaixa::create([
            'user_id' => $user->id,
            'turno_id' => $turnoId,
            'type' => $data['type'],
            'valor' => $data['valor'],
            'descricao' => $data['descricao'] ?? null,
        ]);
    }

    private function buildTurnoResponse(Turno $turno)
    {
        $vendas = Sale::where('turno_id', $turno->id)
            ->where('status', 'completed')
            ->get();

        $movimentacoes = FluxoCaixa::where('turno_id', $turno->id)->get();

        $totalSales = $vendas->sum('total_amount');
        $salesCount = $vendas->count();

        $pixTotal = $vendas->where('payment_method', 'pix')->sum('total_amount');
        $cardDebit = $vendas->where('payment_method', 'debit_card')->sum('total_amount');
        $cardCredit = $vendas->where('payment_method', 'credit_card')->sum('total_amount');
        $cashSales = $vendas->where('payment_method', 'cash')->sum('total_amount');

        $sangrias = $movimentacoes->where('type', 'sangria')->sum('valor');
        $suprimentos = $movimentacoes->where('type', 'suprimento')->sum('valor');

        $openingFund = (float) $turno->valor_abertura;
        $cashInDrawer = $openingFund + $cashSales + $suprimentos - $sangrias;

        return [
            'openingFund' => (float) $openingFund,
            'openedAt' => $turno->created_at->format('Y-m-d H:i:s'),
            'totalSales' => (float) $totalSales,
            'salesCount' => $salesCount,
            'cashInDrawer' => (float) $cashInDrawer,
            'pixTotal' => (float) $pixTotal,
            'cardDebit' => (float) $cardDebit,
            'cardCredit' => (float) $cardCredit,
            'isOpen' => true,
        ];
    }
}
