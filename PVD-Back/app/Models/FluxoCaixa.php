<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FluxoCaixa extends Model
{
    use HasUuids;
    
    // Indica ao Laravel o nome exato da tabela no banco
    protected $table = 'fluxo_caixa';

    // Os campos que permitimos salvar pelo método create()
    protected $fillable = [
        'user_id',
        'type',
        'valor',
        'descricao'
    ];
}
