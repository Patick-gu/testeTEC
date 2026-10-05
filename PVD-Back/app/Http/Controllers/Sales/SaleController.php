<?php

namespace App\Http\Controllers\Sales;

use App\Models\Sale;
use App\Http\Requests\Sales\StoreSaleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Produto;
use App\Models\FluxoCaixa;
use App\Models\SaleItem;

class SaleController
{
    /**
     * Display a listing of the sales.
     */
    public function index(): JsonResponse
    {
        $sales = Sale::with(['user', 'items.produto'])->latest()->paginate(15);

        return response()->json($sales);
    }

    /**
     * Store a newly created sale in storage.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {

        //transação
        DB::beginTransaction();
        try {
            $request->validated('payment_method');
            $totalVenda = 0;
            $novaVenda = Sale::create([
                    'user_id' => $request->user()->id,
                    'payment_method' => $request->payment_method,
                    'total_amount' => 0,
                    'status' => 'completed',
            ]);

            foreach ($request->validated('items') as $item) {
                $produto = Produto::findOrFail($item['produto_id']);
                if(! $produto->active){
                    throw new \Exception("O produto {$produto->name} esta inativo");
                }
                if ($produto->stock_quantity < $item['quantity']) {
                    throw new \Exception("{$produto->name} Estoque insuficiente ");
                }
                if($produto->wholesale_min_quantity !== null && $item['quantity'] >= $produto->wholesale_min_quantity){
                    $subtotal = $produto->wholesale_price * $item['quantity'];
                    $priceItemUni = $produto->wholesale_price;
                }
                else{
                    $subtotal = $produto->price * $item['quantity'];
                    $priceItemUni = $produto->price;
                }
                $totalVenda += $subtotal;

                SaleItem::create([
                    'sale_id' => $novaVenda->id,
                    'produto_id' => $produto->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $priceItemUni,
                    'subtotal' => $subtotal,
                ]);
                $produto->decrement('stock_quantity', $item['quantity']);
            }
            $amountPaid = $request->input('amount_paid', $totalVenda);
            if ($request->payment_method === 'cash' && $amountPaid < $totalVenda) {
                throw new \Exception('O valor pago em dinheiro não pode ser menor que o total da venda.');
            }
            $changeReturned = max(0, $amountPaid - $totalVenda);

            $novaVenda->update([
                'total_amount' => $totalVenda,
                'amount_paid' => $amountPaid,
                'change_returned' => $changeReturned
            ]);
                FluxoCaixa::create([
                    'user_id' => $request->user()->id,
                    'type' => 'entrada',
                    'valor' => $totalVenda,
                    'descricao' => 'Venda PDV #' . $novaVenda->id
                ]);
                DB::commit();
                return response()->json(['status' => 'sucesso']);

        }catch (\Exception $e){
            DB::rollBack();
            return response()->json(['erro' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(string $id): JsonResponse
    {
        $sale = Sale::with(['user', 'items.produto'])->findOrFail($id);

        return response()->json($sale);
    }
}
