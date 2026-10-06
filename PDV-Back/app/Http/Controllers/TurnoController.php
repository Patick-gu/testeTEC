<?php

namespace App\Http\Controllers;

use App\Services\TurnoService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Turno de Caixa
 *
 * APIs para abertura, fechamento e visualização de turnos (Caixa do Operador).
 */
class TurnoController
{
    protected TurnoService $turnoService;

    public function __construct(TurnoService $turnoService)
    {
        $this->turnoService = $turnoService;
    }

    /**
     * Consultar Turno Atual
     * 
     * Retorna as informações do turno (caixa) aberto do operador autenticado.
     * 
     * @response 200 {
     *   "status": "aberto",
     *   "turno": {
     *     "id": "uuid-turno",
     *     "valor_abertura": 50.00
     *   }
     * }
     */
    public function atual(Request $request): JsonResponse
    {
        try {
            $resultado = $this->turnoService->getTurnoAtual($request->user());
            return response()->json($resultado);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Abrir Caixa
     * 
     * Inicia um novo turno de vendas para o operador, registrando um fundo de troco inicial.
     * 
     * @bodyParam valor_abertura numeric required Valor em dinheiro no caixa ao abrir. Example: 100.00
     * 
     * @response 201 {
     *   "message": "Caixa aberto com sucesso.",
     *   "turno": { ... }
     * }
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Fechar Caixa
     * 
     * Finaliza o turno atual. Espera que o operador informe quanto em dinheiro tem na gaveta para calcular sebras/faltas.
     * 
     * @bodyParam valor_fechamento_informado numeric required O valor em espécie (dinheiro) conferido na gaveta pelo operador. Example: 540.50
     * @bodyParam observacoes string Observação do operador sobre o fechamento.
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
