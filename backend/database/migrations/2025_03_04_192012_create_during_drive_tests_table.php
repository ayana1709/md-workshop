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
        Schema::create('during_drive_tests', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no');
            $table->string('plate_number')->nullable();
            $table->string('customer_name');
            $table->string('checked_by');
            $table->json('work_details'); // Store tests in JSON format
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('during_drive_tests');
    }
};
