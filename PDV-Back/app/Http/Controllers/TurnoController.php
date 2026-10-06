<?php

namespace App\Http\Controllers;

use App\Services\TurnoService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TurnoController
{
    protected TurnoService $turnoService;

    public function __construct(TurnoService $turnoService)
    {
        $this->turnoService = $turnoService;
    }

    /**
     * Get the current open shift for the authenticated user.
     */
    public function atual(Request $request): JsonResponse
    {
        try {
            $resultado = $this->turnoService->getTurnoAtual($request->user());
            return response()->json($resultado);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Open a new shift.
     */
    public function abrir(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'valor_abertura' => 'required|numeric|min:0',
            ]);

            $turno = $this->turnoService->abrirTurno($request->user(), $dadosValidados);

            return response()->json([
                'message' => 'Caixa aberto com sucesso.',
                'turno' => $turno,
            ], 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Close the current shift.
     */
    public function fechar(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'valor_fechamento_informado' => 'required|numeric|min:0',
                'observacoes' => 'nullable|string',
            ]);

            $turno = $this->turnoService->fecharTurno($request->user(), $dadosValidados);

            return response()->json([
                'message' => 'Caixa fechado com sucesso.',
                'turno' => $turno,
            ]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
