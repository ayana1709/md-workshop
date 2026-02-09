<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sale_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salee_id')->constrained('salees')->cascadeOnDelete();

            $table->decimal('receipt_unit_price', 15, 2);
            $table->decimal('receipt_total_price', 15, 2);

            $table->decimal('vat_collected', 15, 2)->default(0); // VAT collected on sale

            $table->date('receipt_date')->default(now());

            // Customer info
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();

            // Payment info
            $table->enum('payment_type', ['cash', 'credit', 'card'])->default('cash');
            $table->decimal('paid_amount', 15, 2)->nullable();

            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_receipts');
    }
};
