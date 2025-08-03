<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class outsource extends Model
{
    use HasFactory;
    protected $table = 'outsource'; // Explicitly set the table name

    protected $fillable = [
        'job_card_no', 
        'plate_number', 
        'customer_name', 
        'repair_category', 
        'outsourcedetails', 
       
    ];
    protected $casts = [
        'outsourcedetails' => 'array', // Automatically convert JSON to array
        'repair_category'=> 'array',
    ];
}
