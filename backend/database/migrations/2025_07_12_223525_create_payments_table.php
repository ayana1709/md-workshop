<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('repair_registration_id'); 
            // $table->unsignedBigInteger('repair_registration_id')->nullable()->change();
            $table->unsignedBigInteger('repair_registration_id')->nullable();


            // Foreign key
            // $table->string('job_id'); // Still store job_id for readability
            $table->string('job_id')->unique(); // Add this constraint

            $table->string('customer_name');
            // $table->string('plate_number');

            $table->enum('payment_method', ['Cash', 'Transfer', 'Credit', 'Cheque']);
            $table->enum('payment_status', ['Full Payment', 'Advance', 'Credit', 'Remaining']);

            $table->decimal('paid_amount', 10, 2);
            $table->decimal('remaining_amount', 10, 2)->nullable();

            $table->string('ref_no')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('paid_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('reason')->nullable();
            $table->text('remark')->nullable();

            // ✅ Added for Transfer-specific details
            $table->string('from_bank')->nullable();
            $table->string('to_bank')->nullable();

            $table->timestamps();

            $table->foreign('repair_registration_id')
                ->references('id')
                ->on('repair_registrations')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
