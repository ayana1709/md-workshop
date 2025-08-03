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
    Schema::create('daily_progress', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('job_card_no');
        $table->date('date');
        $table->integer('average_progress'); // percent (0–100)
        $table->timestamps();

        $table->unique(['job_card_no', 'date']); // Ensures only 1 record per job per day
    });
}






    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_progresses');
    }
};
