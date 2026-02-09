<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
    $table->id();

    // Polymorphic link
    $table->morphs('receiptable');

    // Direct item reference (for fast reports)
    $table->string('item_code', 20);
    $table->foreign('item_code')
        ->references('item_code')
        ->on('items')
        ->cascadeOnDelete();

    // DECLARED prices
    $table->decimal('receipt_unit_price', 15, 2);
    $table->decimal('receipt_total_price', 15, 2);

    $table->string('receipt_number')->nullable();
    $table->string('receipt_image')->nullable();
    $table->date('receipt_date');

    $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
