<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchasees', function (Blueprint $table) {
            $table->id();

            // Item
            $table->string('item_code', 20);
            $table->foreign('item_code')->references('item_code')->on('items');

            // Quantity & prices (REAL prices, not VAT)
            $table->decimal('quantity', 10, 2);
            $table->decimal('actual_unit_price', 15, 2);
            $table->decimal('actual_total_price', 15, 2);

            // Receipt indicator (UI / logic helper)
            $table->enum('purchase_type', ['with_receipt', 'without_receipt']);

            // Extra info
            $table->string('supplier_name')->nullable();

            // Ownership
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
