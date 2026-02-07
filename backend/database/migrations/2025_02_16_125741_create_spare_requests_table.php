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
       Schema::create('spare_requests', function (Blueprint $table) {
    $table->id();
    $table->string('job_card_no');
    $table->string('plate_number');
    $table->string('customer_name');
    $table->string('repair_category');
    $table->json('sparedetails');

    // ✅ Correct type for foreign key
    $table->string('item_code', 20)->nullable();
    $table->foreign('item_code')->references('item_code')->on('items')->onDelete('set null');

    $table->decimal('unit_price', 10, 2)->nullable();
    $table->timestamps();
    $table->engine = 'InnoDB';
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_requests');
    }
};
