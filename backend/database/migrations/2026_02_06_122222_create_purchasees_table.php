<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchasees', function (Blueprint $table) {
            $table->id();
            $table->string('item_code', 20);
            $table->foreign('item_code')->references('item_code')->on('items');
            $table->decimal('quantity', 10, 2);
            $table->decimal('actual_unit_price', 15, 2);
            $table->decimal('actual_total_price', 15, 2);
            $table->enum('purchase_type', ['with_receipt', 'without_receipt']);
            $table->string('supplier_name')->nullable();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('admins');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchasees');
    }
};
