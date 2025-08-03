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
    Schema::create('job_delivery_statuses', function (Blueprint $table) {
        $table->id();
        $table->string('job_id')->unique(); // Assuming job_id is unique here
        $table->string('driver_status')->default('Pending');
        $table->string('checked_by')->default('Pending');
        $table->string('approved_by')->default('Pending');
        $table->date('received_date')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_delivery_status');
    }
};
