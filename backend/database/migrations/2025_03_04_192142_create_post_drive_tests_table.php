<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('post_drive_tests', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no');
            $table->string('plate_number');
            $table->string('customer_name');
            $table->string('checked_by');
            $table->date('checked_date');
            $table->text('post_test_observation')->nullable();
            $table->text('recommendation')->nullable();
            $table->string('technician_final_approval')->default('Pending');
            $table->timestamps();
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_drive_tests');
    }
};
