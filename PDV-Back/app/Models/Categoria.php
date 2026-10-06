<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Categoria extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = ['name'];

    // Uma Categoria tem Vários Produtos (1:N)
    public function produtos()
    {
        return $this->hasMany(Produto::class);
    }
}
