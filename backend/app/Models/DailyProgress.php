<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyProgress extends Model
{
    use HasFactory;
     protected $table = 'daily_progress';

    protected $fillable = [
        'job_card_no',
        'date',
        'average_progress',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}




