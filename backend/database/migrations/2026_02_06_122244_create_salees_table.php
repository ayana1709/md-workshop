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

            $table->string('item_code', 20);
            $table->foreign('item_code')
                ->references('item_code')
                ->on('items')
                ->cascadeOnDelete();

            $table->integer('quantity');

            // REAL sale prices
            $table->decimal('actual_unit_price', 15, 2);
            $table->decimal('actual_total_price', 15, 2);

            // Sale type: just 'with_receipt' or 'without_receipt'
            $table->enum('sale_type', ['with_receipt', 'without_receipt'])->default('without_receipt');

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salees');
    }
};
