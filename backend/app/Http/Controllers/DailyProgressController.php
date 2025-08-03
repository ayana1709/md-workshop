<?php

// app/Console/Commands/StoreSimpleDailyProgress.php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\DailyProgress;
use Carbon\Carbon;

class StoreSimpleDailyProgress extends Command
{
    protected $signature = 'progress:store-simple';
    protected $description = 'Store average progress for each job using raw API response';

    
}
