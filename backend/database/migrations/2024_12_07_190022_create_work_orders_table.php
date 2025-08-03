<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkOrdersTable extends Migration
{
    public function up()
{
    Schema::create('work_orders', function (Blueprint $table) {
        $table->id();
        $table->string('job_card_no');
        $table->string('plate_number');
        $table->string('customer_name');
        $table->string('repair_category');
        $table->json('work_details')->default(json_encode([])); // Default to an empty array

        $table->timestamps();
    });
}


    public function down()
    {
        Schema::dropIfExists('work_orders');
    }
}
