<?php

// app/Console/Commands/StoreDailyProgress.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\WorkOrder;
use App\Models\DailyProgress;
use Carbon\Carbon;

class StoreDailyProgress extends Command
{
    protected $signature = 'progress:store-daily';
    protected $description = 'Calculate and store average progress per job card every 2 minutes';

public function handle()
{
    $today = Carbon::now()->toDateString();

    // Step 1: Get all unique job card numbers
    $jobCards = WorkOrder::select('job_card_no')->distinct()->pluck('job_card_no');

    foreach ($jobCards as $job_card_no) {
        // Step 2: Get all work orders with that job_card_no
        $workOrders = WorkOrder::where('job_card_no', $job_card_no)->get();

        if ($workOrders->isEmpty()) {
            $this->warn("⚠️ No work orders found for job_card_no: {$job_card_no}");
            continue;
        }

        // Step 3: Merge all work_details from the grouped work orders
        $mergedWorkDetails = $workOrders->flatMap(fn ($wo) => $wo->work_details)->all();

        // Step 4: Extract numeric progress values
        $progressValues = collect($mergedWorkDetails)
            ->pluck('progress')
            ->filter(fn ($val) => is_numeric($val));

        if ($progressValues->isEmpty()) {
            $this->warn("⚠️ No valid progress for job_card_no: {$job_card_no}");
            continue;
        }

        $avg = round($progressValues->avg());

        // Step 5: Create or update the daily progress
        DailyProgress::updateOrCreate(
            [
                'job_card_no' => $job_card_no,
                'date' => $today,
            ],
            [
                'plate_number' => $workOrders->first()->plate_number,
                'average_progress' => $avg,
            ]
        );

        $this->info("✅ Stored or Updated avg progress for {$job_card_no}: {$avg}%");
    }
}





        
    }


