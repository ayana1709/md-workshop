<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchasees', function (Blueprint $table) {
    $table->id();

    $table->string('item_code', 20);
    $table->foreign('item_code')
        ->references('item_code')
        ->on('items')
        ->cascadeOnDelete();

    $table->integer('quantity');

    // REAL purchase prices
    $table->decimal('actual_unit_price', 15, 2)->default(0);
    $table->decimal('actual_total_price', 15, 2)->default(0);

    $table->enum('purchase_type', ['with_receipt', 'without_receipt'])
        ->default('without_receipt');

    $table->string('supplier_name')->nullable();

    $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();

    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('purchasees');
    }
};
