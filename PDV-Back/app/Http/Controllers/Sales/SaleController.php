<?php

namespace App\Http\Controllers\Sales;

use App\Http\Requests\Sales\StoreSaleRequest;
use App\Services\SaleService;
use Exception;
use Illuminate\Http\JsonResponse;

/**
 * @group Vendas
 *
 * APIs para registro e listagem das vendas (Frente de Caixa / PDV).
 */
class SaleController
{
    protected SaleService $saleService;

    public function __construct(SaleService $saleService)
    {
        $this->saleService = $saleService;
    }

    /**
     * Listar Vendas
     * 
     * Retorna o histórico de vendas cadastradas. Operadores veem as próprias vendas, admins veem todas.
     * 
     * @response 200 {
     *   "current_page": 1,
     *   "data": [
     *     {
     *       "id": "uuid",
     *       "total_amount": 100.50,
     *       "payment_method": "cash",
     *       "status": "completed"
     *     }
     *   ]
     * }
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $sales = $this->saleService->getSales($user);

        return response()->json($sales);
    }

    /**
     * Finalizar Venda (PDV)
     * 
     * Registra uma nova venda, dando baixa no estoque e registrando o valor pago no turno atual do operador.
     *
     * @bodyParam payment_method string required O método de pagamento (ex: cash, credit_card, debit_card). Example: cash
     * @bodyParam amount_paid numeric Valor em dinheiro entregue pelo cliente (para calcular o troco). Example: 150.00
     * @bodyParam items object[] required Lista de itens da venda.
     * @bodyParam items[].produto_id string required UUID do produto. Example: uuid-produto
     * @bodyParam items[].quantity numeric required Quantidade a ser comprada. Example: 2
     * 
     * @response 200 {
     *   "status": "sucesso"
     * }
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['amount_paid'] = $request->input('amount_paid');
            
            $this->saleService->createSale($request->user(), $data);

            return response()->json(['status' => 'sucesso']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['erro' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Detalhes da Venda
     * 
     * Retorna os detalhes de uma venda específica, incluindo os itens e preços congelados no momento da compra.
     * 
     * @urlParam id string required UUID da venda.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = auth()->user();
            $sale = $this->saleService->getSale($id, $user);

            return response()->json($sale);
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
}
