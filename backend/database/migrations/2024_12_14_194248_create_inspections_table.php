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
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique();
            $table->string('customer_name');
            $table->string('customer_type');
            $table->string('phone_number');
            $table->string('tin_number');
            $table->string('result');
            $table->string('total_payment');
            $table->string('checked_by');
            $table->string('plate_number');
            $table->string('make');
            $table->string('model');
            $table->string('year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
