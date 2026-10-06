<?php

use App\Http\Controllers\Estoque\CategoriaController;
use App\Http\Controllers\Estoque\ProdutoController;
use App\Http\Controllers\Estoque\ProdutoImportController;
use App\Http\Controllers\FluxoCaixaController;
use App\Http\Controllers\Sales\SaleController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\Users\AuthController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('users', UserController::class);

    // Rotas de Vendas (Sales)
    Route::apiResource('sales', SaleController::class)->only(['index', 'show', 'store']);

    // Rotas de Estoque
    Route::apiResource('categorias', CategoriaController::class);
    Route::get('produtos/import/template', [ProdutoImportController::class, 'template']);
    Route::post('produtos/import', [ProdutoImportController::class, 'import']);

    Route::apiResource('produtos', ProdutoController::class);

    // Rotas de Turnos
    Route::get('/caixa/turno-atual', [TurnoController::class, 'atual']);
    Route::post('/caixa/abrir', [TurnoController::class, 'abrir']);
    Route::post('/caixa/fechar', [TurnoController::class, 'fechar']);

    // Rotas de Fluxo de Caixa (Sangria e Suprimento)
    Route::get('/caixa/status/all', [FluxoCaixaController::class, 'statusAll']);
    Route::get('/caixa/status', [FluxoCaixaController::class, 'status']);
    Route::get('/caixa/movimentacoes', [FluxoCaixaController::class, 'index']);
    Route::post('/caixa/movimentacoes', [FluxoCaixaController::class, 'store']);
});
