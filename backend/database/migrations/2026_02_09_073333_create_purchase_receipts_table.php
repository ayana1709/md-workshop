<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchasee_id')->constrained()->cascadeOnDelete();

            $table->decimal('receipt_unit_price', 15, 2);
            $table->decimal('receipt_total_price', 15, 2);

            $table->decimal('vat_paid', 15, 2)->default(0); // VAT paid on this purchase

            $table->date('receipt_date')->default(now());
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_receipts');
    }
};
