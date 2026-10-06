<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Produto;
use App\Services\ProdutoService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProdutoController
{
    protected ProdutoService $produtoService;

    public function __construct(ProdutoService $produtoService)
    {
        $this->produtoService = $produtoService;
    }

    /**
     * Listar Produtos com Busca e Filtros
     * Acesso: Todos (User/Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $produtos = $this->produtoService->getProdutos($request->only(['name', 'code', 'categoria_id']));

        return response()->json($produtos);
    }

    /**
     * Criar Produto (Somente Admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'categoria_id' => 'required|uuid|exists:categorias,id',
                'code' => 'required|string|max:50|unique:produtos,code',
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'wholesale_price' => 'nullable|numeric|min:0',
                'wholesale_min_quantity' => 'nullable|integer|min:1',
                'stock_quantity' => 'required|integer|min:0',
                'active' => 'sometimes|boolean'
            ]);

            $produto = $this->produtoService->createProduto(auth()->user(), $dadosValidados);

            return response()->json($produto, 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Atualizar Produto (Somente Admin)
     */
    public function update(Request $request, Produto $produto): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'categoria_id' => 'sometimes|uuid|exists:categorias,id',
                'code' => [
                    'sometimes',
                    'string',
                    'max:50',
                    \Illuminate\Validation\Rule::unique('produtos')->ignore($produto->id)
                ],
                'name' => 'sometimes|string|max:255',
                'price' => 'sometimes|numeric|min:0',
                'wholesale_price' => 'nullable|numeric|min:0',
                'wholesale_min_quantity' => 'nullable|integer|min:1',
                'stock_quantity' => 'sometimes|integer|min:0',
                'active' => 'sometimes|boolean'
            ]);

            $produtoAtualizado = $this->produtoService->updateProduto(auth()->user(), $produto, $dadosValidados);

            return response()->json($produtoAtualizado);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Deletar Produto - Soft Delete (Somente Admin)
     */
    public function destroy(Produto $produto): JsonResponse
    {
        try {
            $this->produtoService->deleteProduto(auth()->user(), $produto);

            return response()->json(["message" => "Produto movido para a lixeira (Soft Delete)!"], 200);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
