<?php

namespace App\Http\Controllers\Sales;

use App\Http\Requests\Sales\StoreSaleRequest;
use App\Services\SaleService;
use Exception;
use Illuminate\Http\JsonResponse;

class SaleController
{
    protected SaleService $saleService;

    public function __construct(SaleService $saleService)
    {
        $this->saleService = $saleService;
    }

    /**
     * Display a listing of the sales.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $sales = $this->saleService->getSales($user);

        return response()->json($sales);
    }

    /**
     * Store a newly created sale in storage.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['amount_paid'] = $request->input('amount_paid');
            
            $this->saleService->createSale($request->user(), $data);

            return response()->json(['status' => 'sucesso']);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['erro' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = auth()->user();
            $sale = $this->saleService->getSale($id, $user);

            return response()->json($sale);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 403;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 403;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
