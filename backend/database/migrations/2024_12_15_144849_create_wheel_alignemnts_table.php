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
        Schema::create('wheel_alignemnts', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique();
            $table->string('job_card_no')->unique();
            $table->date('date');
            $table->string('customer_name', 255);
            $table->enum('customer_type', ['Regular', 'Contract']);
            $table->string('mobile', 20);
            $table->string('tin_number', 50)->nullable();
            $table->date('checked_date');
            $table->text('work_description');
            $table->text('result');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('professional', 255);
            $table->string('checked_by', 255);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wheel_alignemnts');
    }
};
