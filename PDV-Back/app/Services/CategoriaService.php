<?php

namespace App\Services;

use App\Models\Categoria;
use Exception;

class CategoriaService
{
    public function getCategorias()
    {
        return Categoria::orderBy('name')->get();
    }

    public function createCategoria($user, array $data)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado. Apenas administradores.', 403);
        }

        return Categoria::create($data);
    }

    public function updateCategoria($user, Categoria $categoria, array $data)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        $categoria->update($data);

        return $categoria;
    }

    public function deleteCategoria($user, Categoria $categoria)
    {
        if ($user->role !== 'admin') {
            throw new Exception('Acesso negado.', 403);
        }

        if ($categoria->produtos()->count() > 0) {
            throw new Exception('Não é possível excluir esta categoria pois existem produtos atrelados a ela.', 422);
        }

        $categoria->delete();
    }
}
