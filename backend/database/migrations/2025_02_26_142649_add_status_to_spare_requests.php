<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spare_requests', function (Blueprint $table) {
            $table->string('status')->default('')->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('spare_requests', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
