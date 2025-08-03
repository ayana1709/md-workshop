<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('repair_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique(); // ✅ required
            $table->string('customer_name');
            $table->string('customer_type');
            $table->string('mobile');
            $table->string('types_of_jobs')->nullable();
            $table->date('received_date');
            $table->string('estimated_date')->nullable();
            $table->date('promise_date')->nullable();
            $table->string('priority');
            $table->json('customer_observation')->nullable();
            $table->json('spare_change')->nullable();
            $table->json('job_description')->nullable();
            $table->string('product_name')->nullable();
$table->string('serial_code')->nullable();

            $table->string('received_by')->nullable();
            $table->string('status')->default('not started');
            $table->string('image')->nullable(); // ✅ single image
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('repair_registrations');
    }
};
