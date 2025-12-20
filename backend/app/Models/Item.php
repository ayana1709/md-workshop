<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Item extends Model
{
    use HasFactory;
    use Searchable;

    protected $fillable = [
        'item_name',
        'part_number',
        'brand',
        'type',
        'quantity',
        'unit',
        'purchase_price',
        'selling_price',
        'least_price',
        'maximum_price',
        'minimum_quantity',
        'low_quantity',
        'manufacturer',
        'shelf_number',
        'manufacturing_date',
        'unit_price',
        'total_price',
        'location',
        'condition',
        'image',
    ];

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray()
    {
        return [
            'item_name' => $this->item_name,
            'part_number' => $this->part_number,
            'brand' => $this->brand,
            'manufacturer' => $this->manufacturer,
            'condition' => $this->condition,
            'quantity' => $this->quantity,
            'location' => $this->location,
            'type' => $this->type,
            'unit' => $this->unit,
        ];
    }

    public function toArray()
    {
        $array = parent::toArray();

        array_walk_recursive($array, function (&$value) {
            if (is_string($value)) {
                $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
        });

        return $array;
    }
}
