<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController
{
    /**
     * Listar Categorias
     */
    public function index()
    {
        // Traz todas as categorias em ordem alfabética
        $categorias = Categoria::orderBy('name')->get();
        return response()->json($categorias);
    }

    /**
     * Criar Categoria (Somente Admin)
     */
    public function store(Request $request)
    {
        // RBAC: Verifica se é admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado. Apenas administradores.'], 403);
        }

        $dadosValidados = $request->validate([
            'name' => 'required|string|max:255|unique:categorias,name',
        ]);

        $categoria = Categoria::create($dadosValidados);

        return response()->json($categoria, 201);
    }

    /**
     * Atualizar Categoria (Somente Admin)
     */
    public function update(Request $request, Categoria $categoria)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $dadosValidados = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('categorias')->ignore($categoria->id),
            ],
        ]);

        $categoria->update($dadosValidados);

        return response()->json($categoria);
    }

    /**
     * Deletar Categoria (Somente Admin)
     */
    public function destroy(Categoria $categoria)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        // Trava de segurança: Verifica se existem produtos usando essa categoria
        if ($categoria->produtos()->count() > 0) {
            return response()->json([
                'error' => 'Não é possível excluir esta categoria pois existem produtos atrelados a ela.'
            ], 422);
        }

        $categoria->delete();

        return response()->json(["message" => "Categoria deletada com sucesso!"], 200);
    }
}
