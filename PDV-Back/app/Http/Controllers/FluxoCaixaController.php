<?php

namespace App\Http\Controllers;

use App\Services\FluxoCaixaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Fluxo de Caixa
 *
 * APIs para o registro de movimentações no caixa (Sangrias e Suprimentos) e visualização de resumos financeiros.
 */
class FluxoCaixaController
{
    protected FluxoCaixaService $fluxoCaixaService;

    public function __construct(FluxoCaixaService $fluxoCaixaService)
    {
        $this->fluxoCaixaService = $fluxoCaixaService;
    }

    /**
     * Status do Caixa do Operador
     * 
     * Retorna os totais consolidados de movimentações no caixa atual do operador.
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $status = $this->fluxoCaixaService->getStatus($request->user());
            return response()->json($status);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 403;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 403;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Status de Todos os Caixas (Admin)
     * 
     * Retorna os totais de vendas e transações consolidadas da empresa no dia.
     */
    public function statusAll(): JsonResponse
    {
        $statusAll = $this->fluxoCaixaService->getStatusAll();
        return response()->json($statusAll);
    }

    /**
     * Extrato de Movimentações
     * 
     * Lista todas as entradas e saídas (vendas, sangrias, suprimentos, aberturas).
     */
    public function index(Request $request): JsonResponse
    {
        $movimentacoes = $this->fluxoCaixaService->getMovimentacoes($request->user());
        return response()->json($movimentacoes);
    }

    /**
     * Registrar Movimentação Avulsa
     * 
     * Realiza uma "Sangria" (retirada) ou "Suprimento" (reforço) do gaveteiro no turno ativo.
     * 
     * @bodyParam type string required O tipo de movimentação ('sangria' ou 'suprimento'). Example: sangria
     * @bodyParam valor numeric required Valor movimentado. Example: 150.00
     * @bodyParam descricao string Motivo da movimentação. Example: Retirada de dinheiro para carro forte
     */
    public function store(Request $request): JsonResponse
    {
        try {
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
