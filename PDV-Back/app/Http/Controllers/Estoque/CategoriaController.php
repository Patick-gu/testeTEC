<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Categoria;
use App\Services\CategoriaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Categorias
 *
 * APIs para gerenciamento de categorias de produtos.
 */
class CategoriaController
{
    protected CategoriaService $categoriaService;

    public function __construct(CategoriaService $categoriaService)
    {
        $this->categoriaService = $categoriaService;
    }

    /**
     * Listar Categorias
     * 
     * Retorna uma lista de todas as categorias cadastradas no sistema.
     *
     * @response 200 [
     *   {
     *     "id": "uuid-1234",
     *     "name": "Bebidas",
     *     "created_at": "2026-10-04T12:00:00.000000Z",
     *     "updated_at": "2026-10-04T12:00:00.000000Z"
     *   }
     * ]
     */
    public function index(): JsonResponse
    {
        $categorias = $this->categoriaService->getCategorias();
        return response()->json($categorias);
    }

    /**
     * Criar Categoria
     * 
     * Registra uma nova categoria no sistema. Restrito a usuários com perfil de Admin.
     *
     * @bodyParam name string required Nome da categoria. Example: Bebidas
     * 
     * @response 201 {
     *   "id": "uuid-1234",
     *   "name": "Bebidas",
     *   "created_at": "2026-10-04T12:00:00.000000Z",
     *   "updated_at": "2026-10-04T12:00:00.000000Z"
     * }
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'name' => 'required|string|max:255|unique:categorias,name',
            ]);

            $categoria = $this->categoriaService->createCategoria(auth()->user(), $dadosValidados);

            return response()->json($categoria, 201);
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
     * Atualizar Categoria
     * 
     * Atualiza os dados de uma categoria existente. Restrito a usuários com perfil de Admin.
     *
     * @bodyParam name string required Novo nome da categoria. Example: Bebidas Frias
     */
    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    \Illuminate\Validation\Rule::unique('categorias')->ignore($categoria->id),
                ],
            ]);

            $categoriaAtualizada = $this->categoriaService->updateCategoria(auth()->user(), $categoria, $dadosValidados);

            return response()->json($categoriaAtualizada);
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
     * Deletar Categoria
     * 
     * Remove uma categoria permanentemente. Restrito a usuários com perfil de Admin.
     * 
     * @response 200 {
     *   "message": "Categoria deletada com sucesso!"
     * }
     */
    public function destroy(Categoria $categoria): JsonResponse
    {
        try {
            $this->categoriaService->deleteCategoria(auth()->user(), $categoria);

            return response()->json(["message" => "Categoria deletada com sucesso!"], 200);
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
