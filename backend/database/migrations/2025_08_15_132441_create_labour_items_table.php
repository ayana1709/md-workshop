<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('labour_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proforma_id')->constrained('proformas')->onDelete('cascade');
            $table->string('description'); // Work description
            $table->string('unit')->nullable(); // Unit of measurement (e.g., hr, job)
            $table->decimal('cost', 10, 2)->nullable()->default(0); // Cost per unit
            $table->decimal('est_time', 10, 2)->nullable()->default(0); // Estimated time
            $table->decimal('total', 10, 2); // Total for this row (cost * est_time)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labour_items');
    }
};
