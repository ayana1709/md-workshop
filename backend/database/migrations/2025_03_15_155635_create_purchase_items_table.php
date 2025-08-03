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
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_item_id')->nullable()->constrained('store_items')->onDelete('set null');
            $table->foreignId('purchase_id')->constrained()->onDelete('cascade');
            $table->string('code');
            $table->string('description');
            $table->string('part_number')->nullable();
            $table->integer('quantity');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('location');
            $table->string('condition'); // Move condition here

            $table->timestamps();
        });
        
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
