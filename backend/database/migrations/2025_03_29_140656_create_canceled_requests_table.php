<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('canceled_requests', function (Blueprint $table) {
            $table->id();
            $table->string('job_card_no');
            $table->string('plate_number');
            $table->string('customer_name');
            $table->string('part_number')->nullable();
            $table->string('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->integer('request_quantity');
            $table->string('request_by')->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('status')->default('Canceled');
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('canceled_requests');
    }
};
