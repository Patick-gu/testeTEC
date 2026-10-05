<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes; // Importa a funcionalidade de "Lixeira"
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produto extends Model
{
    use HasUuids, SoftDeletes, HasFactory; // Ativa o UUID e o SoftDelete

    protected $fillable = [
        'categoria_id',
        'code',
        'name',
        'price',
        'wholesale_price',
        'wholesale_min_quantity',
        'stock_quantity',
        'active'
    ];

    // Ocultar essas colunas quando retornar no JSON (opcional, mas bom pra segurança/limpeza)
    protected $hidden = [
        'deleted_at'
    ];

    // Um Produto pertence a Uma Categoria (N:1)
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
}
