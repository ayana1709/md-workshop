import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import "./css/style.css";
import "./charts/ChartjsConfig";

// Import pages
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import AddCustomer from "./components/AddCustomer";
import CustomerList from "./components/CustomerList";
import CustomerInformation from "./components/CustomerInformation";
import ConditionOfVehicle from "./components/ConditionOfVehicle";
import VehicleRegistration from "./components/VehicleRegistration";
// import TypeOfJob from "./components/TypeOfJob";
import EditCustomer from "./components/EditCustomer";
import JobOrderList from "./components/JobOrderList";
import EmployeeRegistration from "./components/EmployeeRegistration";
import EmployeeList from "./components/EmployeeList";
import AddToWorkOrder from "./components/AddToWorkOrder";
import WorkOrderList from "./components/WorkOrderList";
import TypesOfJobs from "./components/TypesOfJobs";
import AddBolo from "./components/AddBolo";
import AddWheelAlignment from "./components/AddWheelAlignment";
import AddInspection from "./components/AddInspection";
import BoloList from "./components/BoloList";
import InspectionList from "./components/InspectionList";
import WheelAlignemntList from "./components/WheelAlignemntList";
import VehicleDetails from "./components/VehicleDetails";
import RepairRegistrationForm from "./components/RepairRegistrationForm";
import JobManager from "./components/jobmanager";
import ViewRepair from "./components/ViewRepair";
import EditRepairRegistrationForm from "./components/EditRepair";
import EditRepair from "./components/EditRepair";
import { ToastContainer } from "react-toastify";
import RequestSpare from "./components/RequestSpare";
import StoreItems from "./components/AddStore";
import IncomingRequest from "./components/IncomingRequest";
import TotalStore from "./components/Store";
import OutStore from "./components/OutStore";
import LowStore from "./components/LowStore";
import Store from "./components/Store";
import TotalItem from "./components/TotalItem";
import AddStore from "./components/AddStore";
import Incoming from "./components/Inventory/Incoming";
import TotalIncoming from "./components/Inventory/TotalIncoming";
import RecentlyIncoming from "./components/Inventory/RecentlyIncoming";
import Pending from "./components/Inventory/Pending";
import Requested from "./components/Inventory/Requested";
import TotalRequest from "./components/Inventory/TotalRequest";
import PendingOut from "./components/Inventory/PendingOut";
import Canceled from "./components/Inventory/Canceled";
import EditBolo from "./components/EditBolo";
import ViewBolo from "./components/ViewBolo";
import EditInspection from "./components/EditInspection";
import ViewInspection from "./components/ViewInspection";
import EditWheel from "./components/EditWheel";
import ViewWheel from "./components/ViewWheel";
import { StoreProvider } from "./contexts/storeContext";
import WorkOrderView from "./components/WorkOrderView";
import WorkOrderEdit from "./components/WorkOrderEdit";
import UpdateStore from "./components/UpdateStore";
import ItemOutList from "./components/Inventory/ItemOutList";
import HistoryPage from "./components/HistoryPage";
import PrintJobOrder from "./components/PrintJobOrder";
import PrintRegistration from "./components/PrintRegistration";
import WorkOrder from "./components/WorkOrder";
import WorkDone from "./components/WorkDone";
import PendingWork from "./components/PendingWork";
import AddToWorkOrderBolo from "./components/AddToWorkOrderBolo";

import AddToWorkOrderInspection from "./components/AddToWorkOrderInspection";
import RequestSpareBolo from "./components/RequestSpareBolo";
// import AddToWorkOrderInspection from "./components/AddToWorkOrderInspection";
import RequestSpareInspection from "./components/RequestSpareInspection";
import AddToWorkOrderWheel from "./components/AddToWorkOrderWheel";
import RequestSpareWheel from "./components/RequestSpareWheel";
// import PrintBolo from "./components/PrintBolo";
import PrintInspection from "./components/PrintInspection";
import PrintWheel from "./components/PrintWheel";
import TestDrive from "./components/TestDrive";
import PredriveTest from "./components/DriverTest/PredriveTest";
import DuringDriveTest from "./components/DriverTest/DuringDriveTest";
import PostDriveTest from "./components/DriverTest/PostDriveTest";
// Import other components...

function ProtectedRoute({ children }) {
  const admin = localStorage.getItem("adminToken"); // Check if token exists
  return admin ? children : <Navigate to="/" />;
}
// import RequestSpareInspection from "./components/RequestSpareInspection";
// import AddToWorkOrderWheel from "./components/AddToWorkOrderWheel";
// import RequestSpareWheel from "./components/RequestSpareWheel";
import PrintBolo from "./components/PrintBolo";
import WorkProgress from "./components/WorkProgress";
import CheckWorkPrgress from "./components/CheckWorkProgress";
import PrintSummary from "./components/PrintSummary";
import TestDriveView from "./components/DriverTest/TestDriveView";
import PrintTestDrive from "./components/PrintTestDrive";
import StatusUpdate from "./components/StatusUpdate";
import BulkAddToWorkOrder from "./components/BulkAddToWorkOrder";
import OutSource from "./components/OutSource";
import OutSourceList from "./components/OutSourceList";
import Purchase from "./components/Purchase";
import PurchasedItems from "./components/PurchasedItems";
import AddPurchase from "./components/AddPurchase";
import PurchaseRecievedVoucher from "./components/PurchaseRecievedVoucher";
import AddJobmanagemnt from "./components/AddJobmanagemnt";
import ServiceReminderForm from "./components/ServiceReminderForm";
import ServiceReminder from "./components/ServiceReminder";
import TestDriveResult from "./components/TestDriveResult";
import AddSalesPage from "./components/AddSalesPage";
import PurchaseOrder from "./components/PurchaseOrder";
import Purchases from "./components/Purchases";
import ManageSales from "./components/ManageSales";
import SendPayment from "./components/payment/sendpayment";
import AllPaymentsTable from "./components/payment/AllPaymentsTable";
import PaymentDetail from "./components/payment/PaymentDetail";
import EditPaymentForm from "./components/payment/EditPaymentForm";
import FinalPrintAttchemnt from "./components/payment/FinalPrintAttchemnt";
import WeeklyChecklist from "./components/WeeklyChecklist";
import AddPayment from "./components/payment/AddPayment";
import ProformaForm from "./components/Proforma/ProformaForm";
import ManageProforma from "./components/Proforma/ManageProforma/ManageProforma";
import CompanySettings from "./components/CompanySettings";
import NewAddSalesPage from "./components/NewAddSalesPage";
import CreatePurchaseOrder from "./components/CreatePurchaseOrder";
// import ProformaPrint from "./components/Proforma/ProformaPrint";
import DescriptionModal from "./components/DescriptionModal";
import DescriptionPage from "./components/DescriptionModal";
import ProformaPrint from "./components/Proforma/ManageProforma/modals/ProformaPrint";
// import Outsource from "./components/Outsource";
// import PrintInspection from "./components/PrintInspection";
// import PrintWheel from "./components/PrintWheel";

function App() {
  const location = useLocation();
  // const [admin, setAdmin] = useState(
  //   localStorage.getItem("adminToken") || null
  // );
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);

  return (
    <StoreProvider>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            !admin ? <Login onLogin={setAdmin} /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AddCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-of-customer"
          element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          }
        />
        {/* Protect other routes similarly */}
        <Route path="/vehicle-details" element={<VehicleDetails />} />
        {/* <Route path="/step-2" element={<TypeOfJob />} /> */}
        {/* <Route path="/edit-customer/:id" element={<EditCustomer />} /> */}
        {/* <Route path="/edit-customer/:customerId" element={<EditCustomer />} /> */}
        <Route path="/edit-customer/:id" element={<EditCustomer />} />
        <Route path="/employees" element={<EmployeeRegistration />} />
        <Route path="/employees-list" element={<EmployeeList />} />
        <Route path="/add-to-work-order/:id" element={<AddToWorkOrder />} />
        <Route
          path="/add-to-work-order-bolo/:id"
          element={<AddToWorkOrderBolo />}
        />
        <Route
          path="/add-to-work-order-inspection/:id"
          element={<AddToWorkOrderInspection />}
        />
        <Route
          path="/add-to-work-order-wheel/:id"
          element={<AddToWorkOrderWheel />}
        />
        {/* <Route path="/work-order-list/" element={<WorkOrderList />} /> */}
        <Route path="/work-order-view/:id" element={<WorkOrderView />} />
        <Route path="/work-order-edit/:id" element={<WorkOrderEdit />} />
        <Route path="/types-of-jobs" element={<TypesOfJobs />} />
        {/* Job Manager Table  */}
        <Route path="/job-manager" element={<JobManager />}>
          {/* Default route for job-manager */}
          <Route index element={<Navigate to="/job-manager/repair" />} />
          <Route path="repair" element={<JobOrderList />} />
          <Route path="bolo-list" element={<BoloList />} />
          <Route path="inspection-list" element={<InspectionList />} />
          <Route path="wheel-alignment-list" element={<WheelAlignemntList />} />
        </Route>
        {/*  work order  */}
        <Route path="/work" element={<WorkOrder />}>
          <Route index element={<Navigate to="/work/work-order-list" />} />
          <Route path="work-order-list" element={<WorkOrderList />} />
          <Route path="work-progress" element={<WorkDone />} />
          <Route path="Test_drive" element={<PendingWork />} />
          <Route path="out-source" element={<OutSourceList />} />
        </Route>
        {/* test Drive  */}
        <Route path="OutSource" element={<OutStore />} />
        <Route path="/test-drive/:id" element={<TestDrive />}>
          <Route index element={<Navigate replace to="pre-drive" />} />
          <Route path="pre-drive" element={<PredriveTest />} />
          <Route path="during-drive" element={<DuringDriveTest />} />
          <Route path="post-drive" element={<PostDriveTest />} />
        </Route>
        <Route path="wheel-alignment-list" element={<WheelAlignemntList />} />
        <Route path="/step-1" element={<RepairRegistrationForm />} />
        <Route path="/bolo" element={<AddBolo />} />
        <Route path="/inspection" element={<AddInspection />} />
        <Route path="/wheel-alignment" element={<AddWheelAlignment />} />
        {/* Repair Action  */}
        <Route path="/edit-repair/:id" element={<EditRepair />} />
        <Route path="/viewrepair/:id" element={<ViewRepair />} />
        <Route path="/request-spare/:id" element={<RequestSpare />} />
        <Route path="/request-spare-bolo/:id" element={<RequestSpareBolo />} />
        <Route
          path="/request-spare-inspection/:id"
          element={<RequestSpareInspection />}
        />
        <Route
          path="/request-spare-wheel/:id"
          element={<RequestSpareWheel />}
        />
        {/* Bolo Action  */}
        <Route path="/edit-bolo/:id" element={<EditBolo />} />
        <Route path="/view-bolo/:id" element={<ViewBolo />} />
        <Route path="/request-spare/:id" element={<RequestSpare />} />
        {/* inspection Action  */}
        <Route path="/edit-inspection/:id" element={<EditInspection />} />
        <Route path="/view-inspection/:id" element={<ViewInspection />} />
        <Route path="/request-spare/:id" element={<RequestSpare />} />
        <Route path="/addd-to-jobmanagemnt/:id" element={<AddJobmanagemnt />} />
        {/* wheel Action  */}
        <Route path="/edit-wheel/:id" element={<EditWheel />} />
        <Route path="/view-wheel/:id" element={<ViewWheel />} />
        <Route path="/request-spare/:id" element={<RequestSpare />} />
        {/* store Item  */}
        <Route path="/inventory" element={<Store />}>
          <Route index element={<Navigate to="/inventory/total-items" />} />
          <Route path="total-items" element={<TotalItem />} />
          <Route path="add-store" element={<AddStore />} />
          <Route path="update-store" element={<UpdateStore />} />
          <Route path="out-of-store" element={<OutStore />} />
          <Route path="add-to-sale" element={<AddSalesPage />} />
          <Route path="order" element={<PurchaseOrder />} />
          <Route path="low-store" element={<LowStore />} />
        </Route>
        <Route path="sales" element={<ManageSales />} />
        <Route path="add-too-sale" element={<NewAddSalesPage />} />
        <Route path="create-order" element={<CreatePurchaseOrder />} />
        <Route path="purchase" element={<Purchases />} />

        {/* Incoming Request  */}
        <Route path="/history/:code" element={<HistoryPage />} />
        <Route path="/incoming" element={<Incoming />}>
          <Route index element={<Navigate to="/incoming/total-incoming" />} />
          <Route path="total-incoming" element={<TotalIncoming />} />
          <Route path="recently-incoming" element={<RecentlyIncoming />} />
          <Route path="pending" element={<Pending />} />
        </Route>
        {/* Requested Item Out   */}
        <Route path="/requested" element={<Requested />}>
          <Route
            index
            element={<Navigate to="/requested/total-request-item-out" />}
          />
          <Route path="total-request-item-out" element={<ItemOutList />} />
          <Route path="pending-item-out" element={<PendingOut />} />
          <Route path="canceled" element={<Canceled />} />
        </Route>
        <Route path="/print" element={<PrintJobOrder />} />
        <Route path="/print-summary/:jobId" element={<PrintSummary />} />
        {/* <Route path="/send-to-payment/:id" element={<SendPayment />} /> */}
        <Route path="/send-to-payment/:jobId" element={<SendPayment />} />
        <Route path="/print-register" element={<PrintRegistration />} />
        <Route path="/print-bolo" element={<PrintBolo />} />
        <Route path="/print-inspection" element={<PrintInspection />} />
        <Route path="/print-wheel" element={<PrintWheel />} />
        <Route path="/work-progress/:id" element={<WorkProgress />} />
        <Route path="/check/:id" element={<CheckWorkPrgress />}>
          <Route index element={<Navigate to="work-progress" />} />
          <Route path="work-progress" element={<WorkDone />} />
        </Route>
        {/* view test drive  */}
        <Route path="/view-test-drive/:id" element={<TestDriveView />} />
        <Route path="/print-test-drive/:id" element={<PrintTestDrive />} />
        <Route path="/change-status" element={<StatusUpdate />} />
        <Route
          path="/bulk-add-to-work-order"
          element={<BulkAddToWorkOrder />}
        />
        <Route path="/out-source/:id" element={<OutSource />} />
        <Route path="/service-reminder/:id" element={<ServiceReminderForm />} />
        <Route path="/service-reminders/:id" element={<ServiceReminder />} />
        <Route path="/post-drive-results/:id" element={<TestDriveResult />} />
        <Route path="/all-payments" element={<AllPaymentsTable />} />
        <Route path="/payments/:id" element={<PaymentDetail />} />
        <Route path="/payments/edit/:job_id" element={<EditPaymentForm />} />
        <Route
          path="/payments/attachment/:jobId"
          element={<FinalPrintAttchemnt />}
        />
        <Route path="/weekly-checklist" element={<WeeklyChecklist />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/proforma" element={<ProformaForm />} />
        <Route path="/manage-proforma" element={<ManageProforma />} />
        <Route path="/setting" element={<CompanySettings />} />
        <Route path="/proforma-print/:id" element={<ProformaPrint />} />
        {/* <Route path="/description/:id" element={<DescriptionModal />} /> */}

        <Route path="/description/:id" element={<DescriptionPage />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
