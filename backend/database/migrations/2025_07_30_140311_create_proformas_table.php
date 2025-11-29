<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('proformas', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->nullable();
            $table->date('date');
            $table->string('customer_name');
            $table->string('customer_tin')->nullable();
            $table->string('status')->nullable();
            $table->string('prepared_by')->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('ref_num')->nullable();
            $table->string('validity_date')->nullable();
            $table->text('notes')->nullable();
            $table->text('paymenttype')->nullable();
            $table->decimal('payment_before', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('other_cost', 15, 2)->default(0);
            $table->boolean('labour_vat')->default(false);
            $table->boolean('spare_vat')->default(false);
            $table->decimal('total', 15, 2);
            $table->decimal('total_vat', 15, 2);
            $table->decimal('gross_total', 15, 2);
            // $table->decimal('withholding', 15, 2);
            $table->decimal('net_pay', 15, 2);
            $table->string('net_pay_in_words');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('proformas');
    }
};
