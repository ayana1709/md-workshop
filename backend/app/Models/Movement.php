<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movement extends Model
{
    use HasFactory;

    // Table name (optional if following Laravel convention)
    protected $table = 'movements';

    // Fillable fields
    protected $fillable = [
        'item_code',
        'from_branch_id',
        'to_branch_id',
        'sender_name',
        'sent_by',
        'quantity',
        'notes',
    ];

    /* ================= RELATIONSHIPS ================= */

    // Link to the Item (string primary key)
    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code', 'item_code');
    }

    // From branch relation
    public function fromBranch()
    {
        return $this->belongsTo(Branch::class, 'from_branch_id', 'id');
    }

    // To branch relation
    public function toBranch()
    {
        return $this->belongsTo(Branch::class, 'to_branch_id', 'id');
    }
}
