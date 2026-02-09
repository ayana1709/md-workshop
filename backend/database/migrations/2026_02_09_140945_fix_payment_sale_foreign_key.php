<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paymentts', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['sale_id']);
            // Add correct foreign key
            $table->foreign('sale_id')
                  ->references('id')
                  ->on('salees')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('paymentts', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->foreign('sale_id')
                  ->references('id')
                  ->on('sales') // revert back
                  ->onDelete('cascade');
        });
    }
};
