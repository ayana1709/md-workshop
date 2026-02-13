<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {

            // 1. Stock status
            $table->enum('stock_status', [
                'available',
                'low_stock',
                'out_of_stock'
            ])->default('available')->after('low_stock');

            // 2. Movement status
            $table->enum('movement_status', [
                'transfer',
                'request',
                'accepted',
                'incoming'
            ])->nullable()->after('stock_status');

            // 3. Posted to ecommerce
            $table->boolean('posted_to_ecommerce')
                  ->default(false)
                  ->after('movement_status');

            // 4. Operation status
            $table->enum('operation_status', [
                'assemble',
                'split_to_parts'
            ])->nullable()->after('posted_to_ecommerce');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn([
                'stock_status',
                'movement_status',
                'posted_to_ecommerce',
                'operation_status',
            ]);
        });
    }
};
