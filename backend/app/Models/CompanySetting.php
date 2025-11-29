<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'name_en',
        'name_am',
        'phone',
        'email',
        'address',
        'tin',
        'vat',
        'website',
        'business_type',
        'tagline',
        'established',
        'logo',
        'login_page_name',
        'login_page_name_am',
    'username',
    'profile_image',
    'storeout_ref_start',

        // ✅ newly added fields
        'date_format',
        'payment_ref_start',
        'proforma_ref_start',
    ];
}
