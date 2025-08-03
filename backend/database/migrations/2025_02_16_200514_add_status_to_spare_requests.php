<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spare_requests', function (Blueprint $table) {
            $table->enum('level', ['Incoming', 'Pending', 'Item Out', 'Canceled','PendingOut'])->default('Incoming')->after('sparedetails');
        });
    }

    public function down(): void
    {
        Schema::table('spare_requests', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};


