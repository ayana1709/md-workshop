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
      // database/migrations/xxxx_xx_xx_create_purchase_orders_table.php

Schema::create('purchase_orders', function (Blueprint $table) {
    $table->id();
    $table->date('sales_date');
    $table->string('supplier_name');
    $table->string('company_name')->nullable();
    $table->string('reference_number')->nullable();
    $table->string('tin_number')->nullable();
    $table->string('mobile')->nullable();
    $table->string('office')->nullable();
    $table->string('phone')->nullable();
    $table->string('website')->nullable();
    $table->string('email')->nullable();
    $table->text('address')->nullable();
    $table->string('bank_account')->nullable();
    $table->text('other_info')->nullable();
    $table->text('remark')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
