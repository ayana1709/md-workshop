<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('item_out', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->string('part_number');
            $table->string('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('condition')->nullable();
            $table->integer('quantity'); // Quantity moved out
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2); // quantity * unit_price
            $table->string('location')->nullable();
            $table->timestamp('date')->default(now());
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('item_out');
    }
};