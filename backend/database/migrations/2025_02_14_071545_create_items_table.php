<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('items', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->text('description')->nullable();
            $table->string('part_number')->nullable();
            $table->integer('quantity')->nullable();
            
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2)->nullable();
            $table->string('location')->nullable();
            $table->enum('condition', ['New', 'Used'])->default('New');
    
            // New fields
            $table->string('item_name')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->decimal('least_price', 10, 2)->nullable();
            $table->decimal('maximum_price', 10, 2)->nullable();
            $table->integer('minimum_quantity')->nullable();
            $table->integer('low_quantity')->nullable();
            $table->string('manufacturer')->nullable();
            $table->date('manufacturing_date')->nullable();
    
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }
    

    public function down() {
        Schema::dropIfExists('items');
    }
};
