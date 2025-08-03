<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('work_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_card_no');
            $table->string('plate_number');
            $table->string('customer_name');
            $table->string('repair_category');
            $table->text('work_description');
            $table->string('assigned_to')->nullable();
            $table->dateTime('time_in')->nullable();
            $table->dateTime('time_out')->nullable();
            $table->string('status')->default('Pending');
            $table->integer('progress')->default(0);
            $table->text('remark')->nullable();
            $table->timestamps();

            $table->foreign('job_card_no')->references('id')->on('work_orders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('work_progress');
    }
};

