<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'name_en', 'name_am', 'phone', 'email', 'address',
        'tin', 'vat', 'website', 'business_type', 'tagline',
        'established', 'logo',
    ];
}
