<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Turno extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'status',
        'data_abertura',
        'valor_abertura',
        'data_fechamento',
        'valor_fechamento_esperado',
        'valor_fechamento_informado',
        'diferenca_caixa',
        'observacoes',
    ];

    protected $casts = [
        'data_abertura' => 'datetime',
        'data_fechamento' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function movimentacoes()
    {
        return $this->hasMany(FluxoCaixa::class, 'turno_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'turno_id');
    }
}
