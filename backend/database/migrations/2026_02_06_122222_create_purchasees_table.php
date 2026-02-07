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

            // 🔗 Item
            $table->string('item_code', 20);
            $table->foreign('item_code')
                ->references('item_code')
                ->on('items')
                ->cascadeOnDelete();

            // Purchase details
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);

            // Receipt info
            $table->enum('purchase_type', ['with_receipt', 'without_receipt'])
                ->default('without_receipt');

            $table->decimal('receipt_price', 15, 2)->nullable();
            $table->string('supplier_name')->nullable();
            $table->string('receipt_number')->nullable();

            // Branch
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Meta
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchasees');
    }
};
