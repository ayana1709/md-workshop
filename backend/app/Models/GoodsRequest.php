<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoodsRequest extends Model
{
     use HasFactory;

    protected $fillable = [
        'ref_no',
        'date',
        'objective_for',
        'priority',
        'requested_by',
        'requested_department',
        'request_remark',
        'requested_items',
    ];

    protected $casts = [
        'requested_items' => 'array',
        'date' => 'date',
    ];
}
