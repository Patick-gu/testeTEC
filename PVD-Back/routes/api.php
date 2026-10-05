<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Users\UserController;
use App\Http\Controllers\Users\AuthController;


Route::post('/users', [UserController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('users', UserController::class)->except(['store']);
    
    // Rotas de Vendas (Sales)
    Route::apiResource('sales', \App\Http\Controllers\Sales\SaleController::class)->only(['index', 'show', 'store']);
    
    // Rotas de Estoque
    Route::apiResource('categorias', \App\Http\Controllers\Estoque\CategoriaController::class);
    Route::get('produtos/import/template', [\App\Http\Controllers\Estoque\ProdutoImportController::class, 'template']);
    Route::post('produtos/import', [\App\Http\Controllers\Estoque\ProdutoImportController::class, 'import']);

    Route::apiResource('produtos', \App\Http\Controllers\Estoque\ProdutoController::class);

    // Rotas de Fluxo de Caixa (Sangria e Suprimento)
    Route::get('/caixa/status', [\App\Http\Controllers\FluxoCaixaController::class, 'status']);
    Route::get('/caixa/movimentacoes', [\App\Http\Controllers\FluxoCaixaController::class, 'index']);
    Route::post('/caixa/movimentacoes', [\App\Http\Controllers\FluxoCaixaController::class, 'store']);
});
