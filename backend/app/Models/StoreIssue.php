<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreIssue extends Model
{
    use HasFactory;

    protected $guarded = []; // instaed of saying all fillible;

    protected $casts = [
        'store_items' => 'array',
        'date' => 'date',
    ];
}
