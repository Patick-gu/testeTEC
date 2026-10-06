<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Categoria;
use App\Services\CategoriaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController
{
    protected CategoriaService $categoriaService;

    public function __construct(CategoriaService $categoriaService)
    {
        $this->categoriaService = $categoriaService;
    }

    /**
     * Listar Categorias
     */
    public function index(): JsonResponse
    {
        $categorias = $this->categoriaService->getCategorias();
        return response()->json($categorias);
    }

    /**
     * Criar Categoria (Somente Admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $dadosValidados = $request->validate([
                'name' => 'required|string|max:255|unique:categorias,name',
            ]);

            $categoria = $this->categoriaService->createCategoria(auth()->user(), $dadosValidados);

            return response()->json($categoria, 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Atualizar Categoria (Somente Admin)
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
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Deletar Categoria (Somente Admin)
     */
    public function destroy(Categoria $categoria): JsonResponse
    {
        try {
            $this->categoriaService->deleteCategoria(auth()->user(), $categoria);

            return response()->json(["message" => "Categoria deletada com sucesso!"], 200);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 400;
            if (!is_numeric($statusCode) || $statusCode < 100 || $statusCode > 599) {
                $statusCode = 400;
            }
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
