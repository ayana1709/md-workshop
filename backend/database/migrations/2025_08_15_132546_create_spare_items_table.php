<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spare_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proforma_id')->constrained('proformas')->onDelete('cascade');
            $table->string('description'); // Spare part description
            $table->string('unit')->nullable(); // Unit of measurement (e.g., pcs, set)
            $table->string('brand')->nullable(); // Brand name
            $table->decimal('unit_price', 15, 2)->nullable()->default(0); // Unit price
            $table->decimal('qty', 10, 2)->nullable()->default(1); // Quantity
            $table->decimal('total', 10, 2); // Total for this row (qty * unit_price)
            $table->string('remark')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_items');
    }
};
