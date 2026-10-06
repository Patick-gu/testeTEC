<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Produto;
use App\Services\ProdutoService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Produtos
 *
 * APIs para gerenciamento do catálogo de produtos e estoque.
 */
class ProdutoController
{
    protected ProdutoService $produtoService;

    public function __construct(ProdutoService $produtoService)
    {
        $this->produtoService = $produtoService;
    }

    /**
     * Listar Produtos
     * 
     * Retorna a lista de produtos com suporte a busca e filtros por nome, código e categoria.
     * 
     * @queryParam name string Opcional. Nome do produto. Example: Coca-cola
     * @queryParam code string Opcional. Código de barras ou SKU do produto. Example: 789102030
     * @queryParam categoria_id string Opcional. Filtrar por UUID da categoria.
     */
    public function index(Request $request): JsonResponse
    {
        $produtos = $this->produtoService->getProdutos($request->only(['name', 'code', 'categoria_id']));

        return response()->json($produtos);
    }

    /**
     * Criar Produto
     * 
     * Registra um novo produto no estoque. Restrito a usuários com perfil de Admin.
     *
     * @bodyParam categoria_id string required UUID da Categoria do produto. Example: uuid-categoria
     * @bodyParam code string required Código de barras único. Example: 789101112
     * @bodyParam name string required Nome do produto. Example: Cerveja Lata 350ml
     * @bodyParam price numeric required Preço de venda unitário. Example: 4.50
     * @bodyParam wholesale_price numeric Preço de atacado (opcional). Example: 4.00
     * @bodyParam wholesale_min_quantity integer Quantidade mínima para aplicar preço de atacado. Example: 12
     * @bodyParam stock_quantity integer required Quantidade atual em estoque. Example: 100
     * @bodyParam active boolean Define se o produto está ativo para venda. Example: true
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
     * Atualizar Produto
     * 
     * Modifica dados de um produto já cadastrado. Restrito a usuários com perfil de Admin.
     * 
     * @bodyParam price numeric Novo preço de venda. Example: 5.00
     * @bodyParam stock_quantity integer Nova quantidade do estoque. Example: 80
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
     * Deletar Produto
     * 
     * Move o produto para a lixeira (Soft Delete) impedindo novas vendas, mas preservando o histórico. Restrito a Admins.
     */
    public function destroy(Produto $produto): JsonResponse
    {
        try {
            $this->produtoService->deleteProduto(auth()->user(), $produto);

            return response()->json(["message" => "Produto movido para a lixeira (Soft Delete)!"], 200);
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
