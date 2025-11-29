<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('category'); // labor, outsourcing, utilities, operations, miscellaneous
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->nullable(); // cash, bank, mobile, credit
            $table->string('reference_no')->nullable();
            $table->string('paid_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->text('remarks')->nullable();

            // Category-specific fields (nullable since only some categories use them)
            $table->string('staff_name')->nullable();
            $table->integer('hours')->nullable();
            $table->decimal('rate', 12, 2)->nullable();

            $table->string('service_provider')->nullable();
            $table->string('service_type')->nullable();

            $table->unsignedBigInteger('job_id')->nullable()->index();

            $table->string('utility_type')->nullable();
            $table->string('billing_period')->nullable();
            $table->string('account_no')->nullable();

            $table->string('vendor_name')->nullable();
            $table->string('contract_no')->nullable();

            $table->string('beneficiary')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
