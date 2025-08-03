<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Only add the unique index if it doesn't already exist
            if (!Schema::hasColumn('payments', 'job_id')) return;

            // Check if the index already exists (using raw SQL for MySQL)
            $indexExists = DB::select("SHOW INDEX FROM payments WHERE Key_name = 'payments_job_id_unique'");
            if (count($indexExists) === 0) {
                $table->unique('job_id');
            }
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['job_id']);
        });
    }
};
