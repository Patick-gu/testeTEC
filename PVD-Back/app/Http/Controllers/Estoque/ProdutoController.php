<?php

namespace App\Http\Controllers\Estoque;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController
{
    /**
     * Listar Produtos com Busca e Filtros
     * Acesso: Todos (User/Admin)
     */
    public function index(Request $request)
    {
        // O "with('categoria')" resolve o N+1 (Eager Loading que vimos nas aulas anteriores)
        $query = Produto::with('categoria');

        // Filtro 1: Busca por nome
        if ($request->has('name')) {
            $query->where('name', 'ilike', '%' . $request->name . '%');
        }

        // Filtro 2: Busca por Código de Barras
        if ($request->has('code')) {
            $query->where('code', $request->code);
        }

        // Filtro 3: Busca por ID da Categoria
        if ($request->has('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        return response()->json($query->get());
    }

    /**
     * Criar Produto (Somente Admin)
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') return response()->json(['error' => 'Acesso negado.'], 403);

        $dadosValidados = $request->validate([
            'categoria_id' => 'required|uuid|exists:categorias,id', // Exists garante que a categoria real exista no banco!
            'code' => 'required|string|max:50|unique:produtos,code',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0', // Preço de atacado opcional
            'wholesale_min_quantity' => 'nullable|integer|min:1', // Quantidade mínima para o atacado
            'stock_quantity' => 'required|integer|min:0',
            'active' => 'sometimes|boolean'
        ]);

        $produto = Produto::create($dadosValidados);

        return response()->json($produto->load('categoria'), 201);
    }

    /**
     * Atualizar Produto (Somente Admin)
     */
    public function update(Request $request, Produto $produto)
    {
        if (auth()->user()->role !== 'admin') return response()->json(['error' => 'Acesso negado.'], 403);

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
            'stock_quantity' => 'sometimes|integer|min:0', // O Admin edita o estoque diretamente aqui
            'active' => 'sometimes|boolean'
        ]);

        $produto->update($dadosValidados);

        return response()->json($produto->load('categoria'));
    }

    /**
     * Deletar Produto - Soft Delete (Somente Admin)
     */
    public function destroy(Produto $produto)
    {
        if (auth()->user()->role !== 'admin') return response()->json(['error' => 'Acesso negado.'], 403);

        // O Soft Delete atua aqui magicamente preenchendo o 'deleted_at'
        $produto->delete();

        return response()->json(["message" => "Produto movido para a lixeira (Soft Delete)!"], 200);
    }
}
