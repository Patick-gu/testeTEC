<?php

namespace App\Services;

use App\Models\Produto;
use Exception;

class ProdutoService
{
    public function getProdutos(array $filters)
    {
        $query = Produto::with('categoria');

        if (!empty($filters['name'])) {
            $query->where('name', 'ilike', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['code'])) {
            $query->where('code', $filters['code']);
        }

        if (!empty($filters['categoria_id'])) {
            $query->where('categoria_id', $filters['categoria_id']);
        }

        return $query->get();
    }

    public function createProduto($user, array $data)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $produto = Produto::create($data);

        return $produto->load('categoria');
    }

    public function updateProduto($user, Produto $produto, array $data)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $produto->update($data);

        return $produto->load('categoria');
    }

    public function deleteProduto($user, Produto $produto)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $produto->delete();
    }
}
