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
        'initial_stock',
        'low_stock',
          'selling_price',

        // status fields
        'stock_status',
        'movement_status',
        'posted_to_ecommerce',
        'operation_status',

        'category_id',
        'brand_id',
        'branch_id',
        'unit',
        'location',
        'images',
        'created_by',
        'qr_code',
    ];

    protected $casts = [
        'images' => 'array',
        'posted_to_ecommerce' => 'boolean',
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

    public function purchases()
    {
        return $this->hasMany(Purchasee::class, 'item_code');
    }

  public function saleItems()
{
    return $this->hasMany(SaleItem::class, 'item_code', 'item_code');
}

public function sales()
{
    return $this->hasManyThrough(
        Salee::class,
        SaleItem::class,
        'item_code', // Foreign key on SaleItem table...
        'id',        // Foreign key on Salee table (local key of SaleItem)
        'item_code', // Local key on Item table
        'sale_id'    // Local key on SaleItem table pointing to Salee
    );
}

    public function receipts()
    {
        return $this->hasMany(Receipt::class, 'item_code');
    }

    /* ================= MODEL EVENTS ================= */

    protected static function booted()
    {
        // Generate code + QR only once
        static::creating(function ($item) {
            if (!$item->item_code) {
                $lastCode = self::orderBy('item_code', 'desc')->value('item_code');
                $next = $lastCode ? intval($lastCode) + 1 : 1;
                $item->item_code = str_pad($next, 4, '0', STR_PAD_LEFT);
            }

            $item->qr_code = 'qrcodes/item_' . $item->item_code . '.svg';

            QrCode::format('svg')
                ->size(200)
                ->generate(
                    $item->item_code,
                    storage_path('app/public/' . $item->qr_code)
                );
        });

        // Auto stock status (create + update)
        static::saving(function ($item) {
            $stock = (int) $item->initial_stock;
            $low   = (int) ($item->low_stock ?? 0);

            if ($stock <= 0) {
                $item->stock_status = 'out_of_stock';
            } elseif ($low > 0 && $stock <= $low) {
                $item->stock_status = 'low_stock';
            } else {
                $item->stock_status = 'available';
            }
        });
    }
}
