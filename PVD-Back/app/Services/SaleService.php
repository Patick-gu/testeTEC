<?php

namespace App\Services;

use App\Models\FluxoCaixa;
use App\Models\Produto;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Turno;
use Exception;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function getSales($user)
    {
        $query = Sale::with(['user', 'items.produto'])->latest();

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        return $query->paginate(15);
    }

    public function getSale($id, $user)
    {
        $sale = Sale::with(['user', 'items.produto'])->findOrFail($id);

        if ($user->role !== 'admin' && $sale->user_id !== $user->id) {
            throw new Exception('Acesso negado.', 403);
        }

        return $sale;
    }

    public function createSale($user, array $data)
    {
        $turnoId = null;

        if ($user->role === 'admin') {
            throw new Exception('Admin não pode registrar vendas no PDV. Se necessário, use um operador.', 403);
        }

        $turno = Turno::where('user_id', $user->id)->where('status', 'aberto')->first();
        if (! $turno) {
            throw new Exception('Caixa fechado. Abra o caixa primeiro.', 403);
        }
        $turnoId = $turno->id;

        DB::beginTransaction();
        try {
            $totalVenda = 0;
            $novaVenda = Sale::create([
                'user_id' => $user->id,
                'turno_id' => $turnoId,
                'payment_method' => $data['payment_method'],
                'total_amount' => 0,
                'status' => 'completed',
            ]);

            foreach ($data['items'] as $item) {
                $produto = Produto::findOrFail($item['produto_id']);
                
                if (! $produto->active) {
                    throw new Exception("O produto {$produto->name} esta inativo", 400);
                }
                if ($produto->stock_quantity < $item['quantity']) {
                    throw new Exception("{$produto->name} Estoque insuficiente", 400);
                }

                if ($produto->wholesale_min_quantity !== null && $item['quantity'] >= $produto->wholesale_min_quantity) {
                    $subtotal = $produto->wholesale_price * $item['quantity'];
                    $priceItemUni = $produto->wholesale_price;
                } else {
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

            $amountPaid = $data['amount_paid'] ?? $totalVenda;
            if ($data['payment_method'] === 'cash' && $amountPaid < $totalVenda) {
                throw new Exception('O valor pago em dinheiro não pode ser menor que o total da venda.', 400);
            }
            $changeReturned = max(0, $amountPaid - $totalVenda);

            $novaVenda->update([
                'total_amount' => $totalVenda,
                'amount_paid' => $amountPaid,
                'change_returned' => $changeReturned,
            ]);

            FluxoCaixa::create([
                'user_id' => $user->id,
                'turno_id' => $turnoId,
                'type' => 'entrada',
                'valor' => $totalVenda,
                'descricao' => 'Venda PDV #'.$novaVenda->id,
            ]);

            DB::commit();

            return $novaVenda;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
