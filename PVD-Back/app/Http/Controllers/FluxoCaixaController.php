<?php

namespace App\Http\Controllers;

use App\Services\FluxoCaixaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FluxoCaixaController
{
    protected FluxoCaixaService $fluxoCaixaService;

    public function __construct(FluxoCaixaService $fluxoCaixaService)
    {
        $this->fluxoCaixaService = $fluxoCaixaService;
    }

    /**
     * Get the consolidated status of the cash drawer for the current user today.
     * Deprecated for 'statusAll' or 'Turno-based' flow, but updated just in case.
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $status = $this->fluxoCaixaService->getStatus($request->user());
            return response()->json($status);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 403;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 403;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    public function statusAll(): JsonResponse
    {
        $statusAll = $this->fluxoCaixaService->getStatusAll();
        return response()->json($statusAll);
    }

    public function index(Request $request): JsonResponse
    {
        $movimentacoes = $this->fluxoCaixaService->getMovimentacoes($request->user());
        return response()->json($movimentacoes);
    }

    /**
     * Store a newly created cash movement (Sangria or Suprimento).
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar campos
            $dadosValidados = $request->validate([
                'type' => 'required|in:sangria,suprimento',
                'valor' => 'required|numeric|min:0.01',
                'descricao' => 'nullable|string',
                'turno_id' => 'nullable|uuid',
            ]);

            $movimentacao = $this->fluxoCaixaService->createMovimentacao($request->user(), $dadosValidados);

            return response()->json([
                'status' => 'sucesso',
                'message' => 'Movimentação registrada com sucesso.',
                'data' => $movimentacao,
            ], 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
