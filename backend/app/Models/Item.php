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
            'id' => $this->id,
            'item_name' => $this->item_name,
            'part_number' => $this->part_number,
            'brand' => $this->brand,
            'unit' => $this->unit ?? '',
            // Add other fields you want to search
        ];
    }
    
    /**
     * Determine which fields should be used for searching.
     * This helps the database driver know which columns to index.
     */
    public function searchableFields()
    {
        return ['item_name', 'part_number', 'brand'];
    }
    // In Item model
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
