<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
   public function up(): void
{
    Schema::create('items', function (Blueprint $table) {
        $table->id();
        $table->string('item_name');
        $table->string('part_number')->nullable();
        $table->string('brand')->nullable();
        $table->integer('quantity')->default(0);
        $table->string('unit')->nullable();
        $table->decimal('purchase_price', 15, 2)->default(0);
        $table->decimal('selling_price', 15, 2)->default(0);
        $table->decimal('least_price', 15, 2)->default(0);
        $table->decimal('maximum_price', 15, 2)->default(0);
        $table->integer('minimum_quantity')->default(0);
        $table->integer('low_quantity')->default(0);
        
        $table->string('shelf_number')->nullable();
        
        $table->string('type')->nullable();
        $table->string('manufacturer')->nullable();
        $table->date('manufacturing_date')->nullable();
        $table->decimal('unit_price', 15, 2)->default(0);
        $table->decimal('total_price', 15, 2)->default(0);
        $table->string('location')->nullable();
        $table->enum('condition', ['New', 'Used'])->default('New');
        $table->string('image')->nullable(); // 🆕 Image column
        $table->timestamps();
    });
}


    public function down() {
        Schema::dropIfExists('items');
    }
};
