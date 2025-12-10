// StoreIssueView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";

// Import ItemTable (Assuming it can be used for read-only view by passing readonly={true})
import ItemTable from "@/components/StoreIssue/ItemTable"; 

const StoreIssueView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState(null);

  // Fetch single store issue
  const fetchIssue = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await api.get(`/store-issues/${id}`); 
      
      const issueData = response.data.data || response.data;

      // 🚨 Ensure cost properties are numbers for safe display/calculations
      setIssue({
        ...issueData,
        subtotal: parseFloat(issueData.subtotal) || 0,
        total_vat: parseFloat(issueData.total_vat) || 0,
        total_price_including_vat: parseFloat(issueData.total_price_including_vat) || 0,
      });
      
    } catch (error) {
      console.error("Failed to load store issue:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to load store issue. The request may not exist or an error occurred.",
      });
      navigate("/store-issue/manager"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]); 

  // --- Loading/Error States ---

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <div className="text-xl text-gray-600 dark:text-gray-400">Loading store issue...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  // --- Main View Component ---

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🔎 Store Issue Details: #{issue.ref_no || issue.id}
              </h1>
              <div className="flex gap-4">
                <button
                    onClick={() => navigate(`/store-issue/edit/${issue.id}`)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
                >
                    Edit Request
                </button>
                <button
                  onClick={() => navigate("/store-issue/manager")}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition-colors"
                >
                  Back to Manager
                </button>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md grid grid-cols-1 md:grid-cols-4 gap-6">
                <InfoBox title="Reference No" value={issue.ref_no} />
                <InfoBox title="Date" value={issue.date ? new Date(issue.date).toLocaleDateString() : 'N/A'} />
                <InfoBox title="Priority" value={formatPriority(issue.priority)} color={getPriorityColor(issue.priority)} />
                <InfoBox title="Store Branch" value={issue.store_branch} />
                <InfoBox title="Requested By" value={issue.requested_by} />
                <InfoBox title="Requested Department" value={issue.requested_department} />
                <InfoBox title="Objective/Reason" value={issue.objective_for} className="md:col-span-2" />
                <InfoBox title="Requested From (Project/Budget)" value={issue.requested_from} />
                <InfoBox title="Requested User" value={issue.requested_user} />
            </div>

            {/* Status Workflow */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Workflow Status</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <StatusPill label="Request" status={issue.requested_status} />
                    <StatusPill label="Approval" status={issue.approved_status} />
                    <StatusPill label="Issue" status={issue.issued_status} />
                    <StatusPill label="Delivery" status={issue.delivered_status} />
                </div>
            </div>

            {/* Items Table and Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📦 Requested Items</h3>
                    {/* ItemTable in read-only mode */}
                    <ItemTable 
                        items={issue.store_items || []} 
                        onUpdate={() => {}} 
                        readonly={true} 
                    />
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl shadow-md h-fit">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">💰 Financial Summary</h3>
                    <div className="space-y-2 text-md">
                        <FinancialLine label="Subtotal" value={issue.subtotal} />
                        <FinancialLine label="Total VAT" value={issue.total_vat} />
                        <div className="pt-2 border-t font-bold text-xl text-blue-600 dark:text-blue-400 flex justify-between">
                            <span>Total (Inc. VAT):</span>
                            <span>${(issue.total_price_including_vat).toFixed(2)}</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm italic text-gray-600 dark:text-gray-400">
                        Amount in words: {issue.amount_in_words}
                    </p>
                </div>
            </div>

            {/* --- Workflow Details --- */}
            <h2 className="text-2xl font-bold pt-4 text-gray-900 dark:text-white border-t dark:border-gray-700">Workflow Log</h2>
            
            {/* Approval Details Section */}
            <DetailSectionBox 
                title="✔️ Approval Details"
                status={issue.approved_status}
                person={issue.approved_name || issue.approved_by}
                personLabel="Approver Name/ID"
                department={issue.approved_dept}
                date={issue.approved_date}
                remark={issue.approved_remark}
            />

            {/* Issued Details Section */}
            <DetailSectionBox 
                title="📦 Issued Details (Store Out)"
                status={issue.issued_status}
                person={issue.issued_to}
                personLabel="Issued By"
                department={issue.issued_department}
                date={issue.issued_date}
                remark={issue.issued_remark}
            />
            
            {/* Delivered/Received Details Section */}
            <DetailSectionBox 
                title="🤝 Delivery/Received Details"
                status={issue.delivered_status}
                person={issue.received_by || issue.delivered_by}
                personLabel="Received By"
                department={issue.delivered_dept}
                date={issue.delivered_date}
                remark={issue.delivered_remark}
            />
            
            {/* Request Remarks Section (Separate for clarity) */}
            {issue.request_remark && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">📝 Request Remarks</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{issue.request_remark}</p>
                </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Helper Components and Functions ---

const InfoBox = ({ title, value, color, className = '' }) => (
    <div className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className={`mt-1 text-lg font-semibold ${color ? color : 'text-gray-900 dark:text-white'}`}>{value || 'N/A'}</p>
    </div>
);

// New helper component for structured workflow sections
const DetailSectionBox = ({ title, status, person, department, date, remark, personLabel = 'Person' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-l-4 border-blue-500 dark:border-blue-700 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusPill label="Status" status={status} />
            <InfoBox title={personLabel} value={person} />
            <InfoBox title="Department" value={department} />
            <InfoBox title="Date" value={date ? new Date(date).toLocaleDateString() : 'N/A'} />
        </div>
        
        {remark && (
            <div className="pt-3 border-t dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Remark/Comment</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{remark}</p>
            </div>
        )}
    </div>
);

const FinancialLine = ({ label, value }) => (
    <div className="flex justify-between">
        <span>{label}:</span>
        {/* Value is already parsed as float in fetchIssue, so use toFixed directly */}
        <span className="font-semibold">${value.toFixed(2)}</span>
    </div>
);

const StatusPill = ({ label, status }) => {
    return (
        <div className="p-3 border rounded-lg dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getWorkflowColor(status)}`}>
                {formatStatusText(status)}
            </span>
        </div>
    );
};

const getWorkflowColor = (status) => {
    const colors = {
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        'not_approved': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'not_issued': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'not_delivered': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const formatStatusText = (status) => {
    return status ? status.toUpperCase().replace(/_/g, ' ') : 'N/A';
};

const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'text-red-600 dark:text-red-400';
      case 2: return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
};

const formatPriority = (priority) => {
    switch (priority) {
      case 1: return 'Urgent (1)';
      case 2: return 'High (2)';
      default: return 'Normal (3)';
    }
};


export default StoreIssueView;