<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSalesTable extends Migration
{public function up()
{
    Schema::create('sales', function (Blueprint $table) {
        $table->id();

        $table->string('ref_num')->unique();
        $table->string('approved_by')->nullable();

        $table->date('sales_date')->nullable();
        $table->string('customer_name')->nullable();
        $table->string('company_name')->nullable();
        $table->string('tin_number')->nullable();

        $table->decimal('vat_rate', 5, 2)->default(0);
        $table->decimal('discount', 10, 2)->default(0);
        $table->decimal('due_amount', 12, 2)->default(0);
        $table->decimal('total_amount', 12, 2)->default(0);
        $table->decimal('sub_total', 12, 2)->default(0);
        $table->decimal('paid_amount', 12, 2)->default(0);

        $table->string('mobile')->nullable();
        $table->string('office')->nullable();
        $table->string('phone')->nullable();
        $table->string('website')->nullable();
        $table->string('email')->nullable();
        $table->text('address')->nullable();
        $table->string('bank_account')->nullable();
        $table->text('other_info')->nullable();
        $table->string('payment_status')->nullable();
        $table->string('payment_type')->nullable();
        $table->string('remark')->nullable();

        // ⭐ NEW FIELDS
        $table->string('location')->nullable();
        $table->string('delivered_by')->nullable();
        $table->date('requested_date')->nullable();
        $table->string('status')->nullable()->default('Requested');

        $table->timestamps();
    });
}


    public function down()
    {
        Schema::dropIfExists('sales');
    }
}
