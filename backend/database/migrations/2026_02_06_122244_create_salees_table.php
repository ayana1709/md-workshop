<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salees', function (Blueprint $table) {

            $table->id();

            // 🔗 Item
            $table->string('item_code', 20);
            $table->foreign('item_code')
                ->references('item_code')
                ->on('items')
                ->cascadeOnDelete();

            // Sale details
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);

            // POS / receipt
            $table->string('invoice_number')->nullable();
            $table->enum('sale_type', ['cash', 'credit'])->default('cash');

            // Branch
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Seller (POS user)
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salees');
    }
};
