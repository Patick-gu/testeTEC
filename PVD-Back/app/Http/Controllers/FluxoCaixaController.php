<?php

namespace App\Http\Controllers;

use App\Models\FluxoCaixa;
use App\Http\Requests\StoreFluxoCaixaRequest;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class FluxoCaixaController
{
    /**
     * Display a listing of today's movements for the logged in user.
     */
        /**
     * Get the consolidated status of the cash drawer for the current user today.
     */
    public function status(): JsonResponse
    {
        $hoje = Carbon::today();
        $userId = auth()->id();

        $vendas = \App\Models\Sale::where('user_id', $userId)
            ->whereDate('created_at', $hoje)
            ->where('status', 'completed')
            ->get();

        $totalSales = $vendas->sum('total_amount');
        $salesCount = $vendas->count();

        $pixTotal = $vendas->where('payment_method', 'pix')->sum('total_amount');
        $cardDebit = $vendas->where('payment_method', 'debit_card')->sum('total_amount');
        $cardCredit = $vendas->where('payment_method', 'credit_card')->sum('total_amount');
        $cashSales = $vendas->where('payment_method', 'cash')->sum('total_amount');

        $movimentacoes = FluxoCaixa::where('user_id', $userId)
            ->whereDate('created_at', $hoje)
            ->get();

        $sangrias = $movimentacoes->where('type', 'sangria')->sum('valor');
        $suprimentos = $movimentacoes->where('type', 'suprimento')->sum('valor');
        
        $aberturas = $movimentacoes->where('type', 'abertura')->sum('valor');
        $openingFund = $aberturas > 0 ? $aberturas : 250; // default 250 if no opening registered

        $cashInDrawer = $openingFund + $cashSales + $suprimentos - $sangrias;

        return response()->json([
            'openingFund' => (float) $openingFund,
            'totalSales' => (float) $totalSales,
            'salesCount' => $salesCount,
            'cashInDrawer' => (float) $cashInDrawer,
            'pixTotal' => (float) $pixTotal,
            'cardDebit' => (float) $cardDebit,
            'cardCredit' => (float) $cardCredit,
        ]);
    }

    public function index(): JsonResponse
    {
        $movimentacoes = FluxoCaixa::where('user_id', auth()->id())
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->get();

        return response()->json($movimentacoes);
    }

    /**
     * Store a newly created cash movement (Sangria or Suprimento).
     */
    public function store(StoreFluxoCaixaRequest $request): JsonResponse
    {
        // Pega os dados validados
        $dados = $request->validated();
        
        // Atrela ao usuário autenticado (que está operando o caixa)
        $dados['user_id'] = $request->user()->id;

        // Cria a movimentação
        $movimentacao = FluxoCaixa::create($dados);

        return response()->json([
            'status' => 'sucesso',
            'message' => 'Movimentação registrada com sucesso.',
            'data' => $movimentacao
        ], 201);
    }
}
