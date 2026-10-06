<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FluxoCaixa extends Model
{
    use HasUuids;

    // Indica ao Laravel o nome exato da tabela no banco
    protected $table = 'fluxo_caixa';

    // Os campos que permitimos salvar pelo método create()
    protected $fillable = [
        'user_id',
        'turno_id',
        'type',
        'valor',
        'descricao',
    ];

    /**
     * Intercepta a leitura da descrição para ocultar UUIDs longos
     * Isso impede que o UUID apareça até mesmo nas ferramentas de desenvolvedor (DevTools).
     */
    public function getDescricaoAttribute($value)
    {
        if (! $value) {
            return $value;
        }

        return preg_replace('/#[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i', '(Registro Automático)', $value);
    }
}
