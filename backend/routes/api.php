<?php

use App\Http\Controllers\JobCardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\BolloController;
use App\Http\Controllers\ConditionOfVehicleController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\RepairController;
use App\Http\Controllers\RepairRegistrationController;
use App\Http\Controllers\WheelAlignemntController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\DailyProgressController;
use App\Http\Controllers\DurinDriveTestController;
use App\Http\Controllers\SpareRequestController;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\StoreItemController;
use App\Models\ItemOut;
use App\Http\Controllers\PreDriveTestController;
use App\Http\Controllers\WorkProgressController;
use App\Http\Controllers\PostDriveTestController;
use App\Http\Controllers\OutsourceController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseItemController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PaymentController;
use App\Models\Customer;

use App\Http\Controllers\RequestItemOutController;
use App\Http\Controllers\PendingRequestedItemController;
use App\Http\Controllers\SpareChangeController;
use App\Http\Controllers\ServiceReminderController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ProformaController;
use App\Http\Controllers\CompanySettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
//     // Revoke the user's token
//     $request->user()->tokens()->delete();
//     return response()->json(['message' => 'Logged out successfully'], 200);
// });

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', function (Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    });
});

//add customers
Route::post('/customers', [CustomerController::class, 'store']);
//list customer 
Route::get('/list-of-customer', [CustomerController::class, 'index']);
// Fetch all customers
Route::get('/customers/{id}', [CustomerController::class, 'show']); // Fetch customer details
Route::put('/customers/{id}', [CustomerController::class, 'update']); // Update customer details
//vehicle 
Route::get('/select-customer', [VehicleController::class, 'getCustomers']);
Route::post('/vehicles', [VehicleController::class, 'store']);
Route::get('/job-orders', [VehicleController::class, 'getJobOrders']);
// employe 
Route::get('/print-report/{id}', [CustomerController::class, 'printReport'])->name('print-report');
Route::post('/employees', [EmployeeController::class, 'store']);
Route::get('/employees-list', [EmployeeController::class, 'index']);
Route::get('/select-employee', [EmployeeController::class, 'getCustomers']);


// work order controller
Route::post('/work-orders', [WorkOrderController::class, 'store']);
Route::get('/work-orders', [WorkOrderController::class, 'index']);
Route::get('/work-orders-by-job-card', [WorkOrderController::class, 'getWorkOrdersByJobCard']);
Route::get('/work-orders/job-card/{job_card_no}', [WorkOrderController::class, 'showByJobCardNo']);
Route::put('/work-orders/{id}', [WorkOrderController::class, 'update']);
Route::put('/work-details/{id}', [WorkOrderController::class, 'updateWorkDetail']);
Route::delete('/work-orders/{id}', [WorkOrderController::class, 'destroy']);
Route::delete('/work-details/{id}', [WorkOrderController::class, 'deleteWorkDetail']);
Route::get('/view-work/{id}', [WorkOrderController::class, 'show']); // Get Task by ID
Route::put('/update-work/{id}', [WorkOrderController::class, 'update']); // Update Task by ID



// spare request routes
Route::post('/spare-request', [SpareRequestController::class, 'store']);
Route::get('/spare-request', [SpareRequestController::class, 'index']);
Route::get('/spare-items/count', [SpareRequestController::class, 'getItemCount']);
Route::put('/spare-details/{workDetailId}', [SpareRequestController::class, 'updateSpareDetail']);
Route::delete('/spare-details/{workDetailId}', [SpareRequestController::class, 'deleteWorkDetail']);
Route::get('/spare-request/job-card/{job_card_no}', [SpareRequestController::class, 'showByJobCardNo']);
Route::get('/spare-request-by-job-card', [SpareRequestController::class, 'getWorkOrdersByJobCard']);
Route::get('/recently-incoming', [SpareRequestController::class, 'getRecentRecords']);
Route::patch('/spare-requests/{id}/level', [SpareRequestController::class, 'updateLevel']);
Route::get('/spare-requests/pending', [SpareRequestController::class, 'getPendingRequests']);
Route::patch('/spare-requests/{code}/status', [SpareRequestController::class, 'updateStatus']);
// Route::put('/spare-details/{id}', [SpareRequestController::class, 'updateSpareDetail']);
// Route::delete('/spare-details/{id}', [SpareRequestController::class, 'deleteWorkDetail']);

// spare change routes

Route::post('/spare-changes', [SpareChangeController::class, 'store']);
Route::get('/spare-changes', [SpareChangeController::class, 'index']);
Route::get('/spare-changes/job-card/{job_card_no}', [SpareChangeController::class, 'showByJobCardNo']);
Route::put('/spare-changes/{workDetailId}', [SpareChangeController::class, 'updateSpareDetail']);
Route::delete('/spare-changes/{workDetailId}', [SpareChangeController::class, 'deleteWorkDetail']);





//outsorce route
Route::post('/outsource', [OutsourceController::class, 'store']);
Route::get('/outsource', [OutsourceController::class, 'index']);
Route::get('/outsource/{id}', [OutsourceController::class, 'show']);
Route::get('/outsource/job-card/{job_card_no}', [OutsourceController::class, 'showByJobCardNo']);
Route::delete('/outsource/{id}', [OutsourceController::class, 'deleteWorkDetail']);
Route::put('/outsource-details/{id}', [OutsourceController::class, 'updateOutsourceDetail']);




Route::post('/add-bolo', [BolloController::class, 'store']);
Route::get('/bolo-list', [BolloController::class, 'index']);
Route::get('/bolo/{id}', [BolloController::class, 'show']);
Route::put('/bolo/{id}', [BolloController::class, 'update']);
Route::post('/add-inspection', [InspectionController::class, 'store']);
Route::get('/inspection-list', [InspectionController::class, 'index']);
Route::get('/inspection/{id}', [InspectionController::class, 'show']);
Route::put('/inspection/{id}', [InspectionController::class, 'update']);
Route::post('/wheel-alignment', [WheelAlignemntController::class, 'store']);
Route::get('/wheel-list', [WheelAlignemntController::class, 'index']);
Route::get('/view-wheel/{id}', [WheelAlignemntController::class, 'show']);
Route::put('/update/{id}', [WheelAlignemntController::class, 'update']); // Update a job card by ID
// Route::get('/vehicle/{id}', [VehicleController::class, 'show']);
Route::patch('/job-orders/{id}/priority', [VehicleController::class, 'updatePriority']); 
Route::patch('/job-orders/{id}/status', [VehicleController::class, 'updateStatus']);
//updated registration 
Route::post('/repairs', [RepairRegistrationController::class, 'store']);
Route::get('/repairs', [RepairRegistrationController::class, 'index']);
Route::get('/repairs/{id}', [RepairRegistrationController::class, 'show']);
Route::get('/repairs/basic/{id}', [RepairRegistrationController::class, 'showBasicInfo']);

Route::put('/repairs/{id}', [RepairRegistrationController::class, 'update']);
//delete repair
Route::delete('/repairs/{id}', [RepairRegistrationController::class, 'destroy']);
//delete bolo
Route::delete('/delete-bolo/{id}', [BolloController::class, 'destroy']);
//delete inspection
Route::delete('/delete-inspection/{id}', [InspectionController::class, 'destroy']);
//delete wheel
Route::delete('/delete-wheel/{id}', [WheelAlignemntController::class, 'destroy']);
//delete work order
Route::delete('/delete-work/{id}', [WorkOrderController::class, 'destroy']);
//store-item
// Route::post('/store-items', [StoreItemController::class, 'store']);
Route::post('/store-items', [StoreItemController::class, 'store']);
Route::get('/store-items', [StoreItemController::class, 'index']);
Route::get('/store-items/count', [StoreItemController::class, 'getItemCount']);
Route::put('/store-items/bulk-update', [StoreItemController::class, 'bulkUpdate']);
Route::patch('/store-items/{code}/item-out', [StoreItemController::class, 'itemOut']);
Route::get('/items-out', function () {
    return response()->json(['items' => ItemOut::all()]);
});
Route::get('/items/history/{code}', [StoreItemController::class, 'getHistory']);
//total numberof items
Route::get('/store-items/total', [StoreItemController::class, 'getTotalItems']);
//total number of repairs 
Route::get('/total-repairs', [RepairRegistrationController::class, 'totalRepairs']);
Route::get('/total-items-out', [StoreItemController::class, 'getTotalItemsOut']);


Route::post('/pre-drive-tests', [PreDriveTestController::class, 'store']);
Route::get('/pre-drive-tests', [PreDriveTestController::class, 'index']);
Route::get('/pre-drive-tests/{id}', [PreDriveTestController::class, 'show']);

Route::post('/work-progress', [WorkProgressController::class, 'store']);
Route::get('/work-progress/{job_card_no}', [WorkProgressController::class, 'index']);





//post drive test 
Route::post('/post-drive-tests', [PostDriveTestController::class, 'store']);
Route::get('/post-drive-tests/{id}', [PostDriveTestController::class, 'show']);
Route::get('/post-drive-tests/by-job-card/{job_card_no}', [PostDriveTestController::class, 'getByJobCardNo']);

Route::get('/post-drive-tests', [PostDriveTestController::class, 'index']);


// during test 
Route::post('/during-drive-tests', [DurinDriveTestController::class, 'store']);
Route::get('/during-drive-tests/{id}', [DurinDriveTestController::class, 'show']);

//selected bulk operation
Route::delete('/repairs', [RepairRegistrationController::class, 'deleteRepairs']);
Route::post('/repairs/add-to-work', [RepairRegistrationController::class, 'addToWork']);

//selected bulk operation for bolo
Route::delete('/bolos', [BolloController::class, 'deleteRepairs']);
Route::post('/bolos/add-to-work', [BolloController::class, 'addToWork']);

//selected bulk operation for inspection
Route::delete('/inspections', [InspectionController::class, 'deleteRepairs']);
Route::post('/inspections/add-to-work', [InspectionController::class, 'addToWork']);

// selected bulk operation for wheel
Route::delete('/wheels', [WheelAlignemntController::class, 'deleteRepairs']);
Route::post('/wheels/add-to-work', [WheelAlignemntController::class, 'addToWork']);
 
// change status
Route::post('/update-status/{id}', [RepairRegistrationController::class, 'updateStatus']);
Route::patch('/repairs/{id}', [RepairRegistrationController::class, 'updateStat']);



//bulk add work order
Route::post('/bulk-work-order', [WorkOrderController::class, 'BulkStore']); // Store multiple work orders






// purchase route 

Route::post('/purchases', [PurchaseController::class, 'store']);
Route::get('/purchases', [PurchaseController::class, 'index']);
Route::get('/purchase-items', [PurchaseItemController::class, 'index']);


Route::get('/items/out', [ItemController::class, 'getItemOutRecords']);
Route::get('/items/low-stock', [ItemController::class, 'getLowStockItems']);
Route::get('/items', [ItemController::class, 'index']);        // GET /api/items - List all items
Route::get('/items/{item}', [ItemController::class, 'show']);   // GET /api/items/{id} - Show a single item
Route::post('/items', [ItemController::class, 'store']);       // POST /api/items - Create a new item
Route::put('/items/{item}', [ItemController::class, 'update']); // PUT /api/items/{id} - Update an existing item
Route::delete('/items/{item}', [ItemController::class, 'destroy']); // DELETE /api/items/{id} - Delete an item
Route::patch('/items/{id}/update-field', [ItemController::class, 'updateField']);
Route::post('/items/{id}/item-out', [ItemController::class, 'itemOut']);

Route::post('/items/add-more', [ItemController::class, 'addMore']);
Route::post('/items/fetch-selected', [ItemController::class, 'fetchSelectedItems']);




// spare request
Route::get('/spare-requests', [SpareRequestController::class, 'index']);

//request item out route
Route::post('/request-item-out', [RequestItemOutController::class, 'store']);
Route::patch('/request-item-out/{id}/approve', [RequestItemOutController::class, 'approve']);
Route::delete('/request-item-out/{id}/reject', [RequestItemOutController::class, 'reject']);


Route::get('/requested-items', [RequestItemOutController::class, 'getRequestedItems']);


//pending requested item route
Route::post('/pending-requested-item', [PendingRequestedItemController::class, 'store']);
Route::get('/pending-requested-items', [PendingRequestedItemController::class, 'index']);
Route::delete('/pending-requested-items/{id}', [PendingRequestedItemController::class, 'destroy']);
Route::post('/pending-requested-items/{id}/item-out', [PendingRequestedItemController::class, 'storeItemOut']);
Route::get('/recently-incoming', [SpareRequestController::class, 'getRecentIncoming']);
Route::post('/pending-item-out', [RequestItemOutController::class, 'storePendingItemOut']);
Route::get('/pending-item-out', [RequestItemOutController::class, 'getPendingItemOut']);
Route::post('/cancel-request/{id}', [RequestItemOutController::class, 'cancelRequest']);
Route::get('/canceled-requests', [RequestItemOutController::class, 'getCanceledRequests']);




Route::get('/search-customers', function (Request $request) {
    $query = $request->query('q');

    // Make sure it's not empty before searching
    if (!$query) {
        return response()->json([]);
    }

    $customers = Customer::where('name', 'LIKE', "%{$query}%")
                         ->pluck('name')
                         ->toArray();

    return response()->json($customers);
});


Route::get('/service-reminders', [ServiceReminderController::class, 'index']);
Route::get('/service-reminders/{id}', [ServiceReminderController::class, 'show']);
Route::post('/service-reminders', [ServiceReminderController::class, 'store']);
// Laravel route example in `routes/api.php`
Route::get('/service-reminders/plate/{plateNumber}', [ServiceReminderController::class, 'getByPlate']);




//sales contrller
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/sales', [SaleController::class, 'index']); // Fetch all sales
Route::put('/sales/{id}', [SaleController::class, 'update']);



//purchase controller
// routes/api.php



Route::post('/purchases', [PurchaseOrderController::class, 'store']);
Route::get('/purchases', [PurchaseOrderController::class, 'index']);
Route::post('/items/import', [ItemController::class, 'import']);

// payment  route 
// use App\Http\Controllers\PaymentsController;

Route::post('/payments', [PaymentController::class, 'store']);
Route::post('/payments/quick', [PaymentController::class, 'quickStore']); // Quick/manual entry

Route::get('/payments/job/{jobId}', [PaymentController::class, 'getByJobId']);
Route::get('/payments', [PaymentController::class, 'index']);

// Route::get('/payments/{id}', [PaymentController::class, 'show']); 

Route::get('/payments/{id}', [PaymentController::class, 'show'])
     ->where('id', '[A-Za-z0-9]+');
// Get payment detail
Route::put('/payments/{id}', [PaymentController::class, 'update']);   // Update payment
Route::get('/payments/by-job/{jobId}', [PaymentController::class, 'getByJobId']);
Route::get('/payments/by-job/{job_id}', [PaymentController::class, 'getByJobId']);
Route::put('/payments/by-job/{job_id}', [PaymentController::class, 'updateByJobId']);
Route::delete('/payments/by-job/{job_id}', [PaymentController::class, 'destroyByJobId']);




// dailly Cheacklist 
// routes/api.php

// Route::post('/daily-progress', [DailyProgressController::class, 'store']);
Route::get('/work-orders/{job_card_no}/average-progress', [WorkOrderController::class, 'getAverageProgressByJobCardNo']);

Route::post('/progress/store-daily/{job_card_no}', [WorkOrderController::class, 'storeDailyProgress']);
Route::get('/daily-progress', [WorkOrderController::class, 'getDailyProgress']);
Route::get('/repairs/job/{jobId}', [RepairRegistrationController::class, 'getByJobId']);

// 
Route::post('/repairs/job/batch', [RepairRegistrationController::class, 'getBatchByJobIds']);
Route::post('/post-drive-tests/job/batch', [PostDriveTestController::class, 'batchFetch']);


Route::put('/job-delivery-status/{jobId}', [PostDriveTestController::class, 'updateDeliveryStatus']);
Route::post('/job-delivery-status/batch', [PostDriveTestController::class, 'batchByJobIds']);







Route::post('/proformas', [ProformaController::class, 'store']);
Route::get('/proforma', [ProformaController::class, 'index']);
Route::delete('/proforma/{id}', [ProformaController::class, 'destroy']);
Route::get('/proformas/{id}', [ProformaController::class, 'show']);




Route::get('/settings', [CompanySettingController::class, 'index']);
Route::post('/settings', [CompanySettingController::class, 'store']);


Route::get('/items/part/{part_number}', [ItemController::class, 'getByPartNumber']);
