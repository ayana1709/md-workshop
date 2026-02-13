<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {

            // 🔑 Primary Key
            $table->string('item_code', 20)->primary();

            // Basic info
            $table->string('item_name');
            $table->string('part_number')->nullable();
            $table->integer('initial_stock')->nullable();
            $table->integer('low_stock')->nullable();
                 $table->decimal('selling_price', 15, 2)->default(0);

            // Relations
            $table->foreignId('category_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('brand_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Stock info
            $table->string('unit')->nullable();

            // Extras
            $table->string('location')->nullable();
            $table->string('qr_code')->nullable();
            $table->json('images')->nullable();

            // Meta
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('admins')
                ->nullOnDelete();

            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
