<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Item extends Model
{
    use HasFactory;

    protected $primaryKey = 'item_code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_code',
        'item_name',
        'part_number',
        'category_id',
        'brand_id',
        'branch_id',
        'unit',
        'low_quantity',
        'default_selling_price',
        'last_purchase_price',
        'location',
        'images',
        'created_by',
        'qr_code',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    /* ================= RELATIONSHIPS ================= */

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    // Transactions
    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'item_code');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'item_code');
    }

    /* ================= AUTO CODE + QR ================= */

    protected static function booted()
    {
        static::creating(function ($item) {

            // 🔢 Generate item_code like 0001, 0002
            if (!$item->item_code) {
                $lastCode = self::orderBy('item_code', 'desc')->value('item_code');
                $next = $lastCode ? intval($lastCode) + 1 : 1;
                $item->item_code = str_pad($next, 4, '0', STR_PAD_LEFT);
            }

            // 📷 Generate QR
            $item->qr_code = base64_encode(
                QrCode::format('png')
                    ->size(200)
                    ->generate($item->item_code)
            );
        });
    }
}
