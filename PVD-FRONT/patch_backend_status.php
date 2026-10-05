<?php
$file = '../PVD-Back/app/Http/Controllers/FluxoCaixaController.php';
$content = file_get_contents($file);

$newMethod = <<<EOT
    /**
     * Get the consolidated status of the cash drawer for the current user today.
     */
    public function status(): JsonResponse
    {
        \$hoje = Carbon::today();
        \$userId = auth()->id();

        \$vendas = \App\Models\Sale::where('user_id', \$userId)
            ->whereDate('created_at', \$hoje)
            ->where('status', 'completed')
            ->get();

        \$totalSales = \$vendas->sum('total_amount');
        \$salesCount = \$vendas->count();

        \$pixTotal = \$vendas->where('payment_method', 'pix')->sum('total_amount');
        \$cardDebit = \$vendas->where('payment_method', 'debit_card')->sum('total_amount');
        \$cardCredit = \$vendas->where('payment_method', 'credit_card')->sum('total_amount');
        \$cashSales = \$vendas->where('payment_method', 'cash')->sum('total_amount');

        \$movimentacoes = FluxoCaixa::where('user_id', \$userId)
            ->whereDate('created_at', \$hoje)
            ->get();

        \$sangrias = \$movimentacoes->where('type', 'sangria')->sum('valor');
        \$suprimentos = \$movimentacoes->where('type', 'suprimento')->sum('valor');
        
        \$aberturas = \$movimentacoes->where('type', 'abertura')->sum('valor');
        \$openingFund = \$aberturas > 0 ? \$aberturas : 250; // default 250 if no opening registered

        \$cashInDrawer = \$openingFund + \$cashSales + \$suprimentos - \$sangrias;

        return response()->json([
            'openingFund' => (float) \$openingFund,
            'totalSales' => (float) \$totalSales,
            'salesCount' => \$salesCount,
            'cashInDrawer' => (float) \$cashInDrawer,
            'pixTotal' => (float) \$pixTotal,
            'cardDebit' => (float) \$cardDebit,
            'cardCredit' => (float) \$cardCredit,
        ]);
    }
EOT;

$content = str_replace("public function index(): JsonResponse\n    {", $newMethod . "\n\n    public function index(): JsonResponse\n    {", $content);

file_put_contents($file, $content);

// Now patch routes
$routesFile = '../PVD-Back/routes/api.php';
$routesContent = file_get_contents($routesFile);

$routesContent = str_replace(
    "Route::get('/caixa/movimentacoes', [\App\Http\Controllers\FluxoCaixaController::class, 'index']);",
    "Route::get('/caixa/status', [\App\Http\Controllers\FluxoCaixaController::class, 'status']);\n    Route::get('/caixa/movimentacoes', [\App\Http\Controllers\FluxoCaixaController::class, 'index']);",
    $routesContent
);

file_put_contents($routesFile, $routesContent);
