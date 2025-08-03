<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
   // database/migrations/xxxx_xx_xx_create_bolos_table.php

public function up()
{
    Schema::create('bolos', function (Blueprint $table) {
        $table->id();
        $table->string('job_id')->unique();
        $table->string('job_card_no');
        $table->string('customer_name');
        $table->string('customer_type');
        $table->string('mobile');
        $table->string('tin_number');
        $table->date('checked_date');
        $table->date('issue_date');
        $table->date('expiry_date');
        $table->date('next_reminder');
        $table->string('result');
        $table->string('plate_number');
        $table->string('vehicle_type');
        $table->string('model');
        $table->string('year');
        $table->string('condition');
        $table->string('km_reading');
        $table->string('professional');
        $table->decimal('payment_total', 10, 2);
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('bolos');
    }
};
