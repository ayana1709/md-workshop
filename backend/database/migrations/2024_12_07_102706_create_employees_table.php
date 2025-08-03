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
    Schema::create('employees', function (Blueprint $table) {
        $table->id();
        $table->string('full_name');
        $table->string('contact_information');
        $table->string('position');
        $table->text('address');
        $table->enum('gender', ['Male', 'Female', 'Other']);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
