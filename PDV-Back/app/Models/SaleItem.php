<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SaleItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'sale_id',
        'produto_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }
}
