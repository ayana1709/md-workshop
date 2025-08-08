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
    Schema::create('proformas', function (Blueprint $table) {
        $table->id();
        $table->string('job_id')->nullable(); // can be linked to job_order
        $table->date('date');
        $table->string('customer_name');
        $table->string('product_name');
        $table->string('types_of_jobs');
        $table->string('prepared_by');
        $table->string('delivery_time')->nullable();
        $table->text('notes')->nullable();
        $table->decimal('net_total', 10, 2);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proformas');
    }
};
