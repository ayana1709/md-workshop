import React, { useState, useEffect } from 'react';
import api from '@/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Header from '@/partials/Header';
import Sidebar from '@/partials/Sidebar';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

const StoreRequestManager = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [requests, setRequests] = useState({ data: [], meta: {} });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState({}); // State for row expansion
    const [previewImage, setPreviewImage] = useState(null); // State for image modal
    const navigate = useNavigate();

    // Get base URL for Image Construction
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    
    // Helper to construct the full public URL from the stored path
    const getPublicUrl = (path) => {
        if (!path) return null;
        return `${baseURL.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
    };
    
    // Helper to format a standard Gregorian Date (YYYY-MM-DD) to DD/MM/YYYY
    const formatGCDate = (gregorianDate) => {
        if (!gregorianDate) return 'N/A';
        try {
            const dateOnlyString = gregorianDate.split('T')[0]; 
            const dateParts = dateOnlyString.split('-'); 
            if (dateParts.length === 3) {
                // Assuming format is YYYY-MM-DD
                return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            }
            return gregorianDate;
        } catch (e) {
            return 'Date Error';
        }
    };
    
    // Placeholder for Ethiopian Date Conversion.
    // **NOTE: Replace this with actual library integration (e.g., ethiopian-date-converter).**
    const convertToEthio = (gregorianDate) => {
        if (!gregorianDate) return 'N/A';
        // Example logic using a mock conversion:
        // You would use a library here:
        // import { toEthiopian } from 'ethiopian-date-converter';
        // const ethioDate = toEthiopian(new Date(gregorianDate));
        // return `${ethioDate.day.toString().padStart(2, '0')}/${ethioDate.month.toString().padStart(2, '0')}/${ethioDate.year}`;
        
        // Mock return for now (replace YYYY with YYYY-7 to illustrate)
        const year = new Date(gregorianDate).getFullYear() - 7;
        const month = (new Date(gregorianDate).getMonth() + 1).toString().padStart(2, '0');
        const day = new Date(gregorianDate).getDate().toString().padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    };

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/store-requests?page=${page}`);
            const fetchedRequests = response.data.data || [];
            
            // Generate public image_url for frontend display and the Ethio date
            const requestsWithUrls = fetchedRequests.map(request => {
                const itemsWithUrls = (request.requested_items || []).map(item => ({
                    ...item,
                    image_url: item.image ? getPublicUrl(item.image) : null,
                }));

                return {
                    ...request,
                    requested_items: itemsWithUrls,
                    // Store the Ethiopian date on the request object for easy display
                    ethio_date: convertToEthio(request.date), 
                };
            });
            
            setRequests({
                ...response.data,
                data: requestsWithUrls 
            });
            setCurrentPage(response.data.current_page || 1);
        } catch (error) {
            console.error("Fetch Error:", error);
            Swal.fire('Error', 'Failed to load store requests.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (requests.last_page && newPage >= 1 && newPage <= requests.last_page) {
            setCurrentPage(newPage);
        }
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 1:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Urgent</span>;
            case 2:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">High</span>;
            case 3:
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Normal</span>;
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the request and its associated images.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/store-requests/${id}`);
                setRequests((prev) => ({
                    ...prev,
                    data: prev.data.filter((request) => request.id !== id),
                }));

                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Store request deleted successfully.",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "Failed to delete store request.",
                });
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen text-xl">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Store Requests...
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="grow px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Store Requests Dashboard</h1>

                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => navigate('/store-request/create')}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition duration-150"
                        >
                            + New Request
                        </button>
                    </div>

                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12"></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No</th>
                                    {/* Updated column header */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date (GC / Ethio)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.data.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center py-6 text-gray-500">No store requests found.</td></tr>
                                ) : (
                                    requests.data.map((request) => (
                                        <React.Fragment key={request.id}>
                                            <tr className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => toggleRow(request.id)}>
                                                        {expandedRows[request.id] ? <ChevronUpIcon className="h-5 w-5 text-indigo-600" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold">{request.ref_no}</td>
                                                {/* Date Display: GC and Ethio on two lines */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className='flex flex-col'>
                                                        <span className="font-medium text-gray-700" title="Gregorian Calendar">{formatGCDate(request.date)}</span>
                                                        <span className="text-xs text-indigo-600" title="Ethiopian Calendar">{request.ethio_date}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{request.requested_by}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{request.requested_department}</td>
                                                <td className="px-6 py-4 truncate max-w-xs" title={request.objective_for}>{request.objective_for}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">{getPriorityBadge(request.priority)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button 
                                                        onClick={() => navigate(`/store-request/edit/${request.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-800 mr-3"
                                                        title="Edit Request"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5 inline" />
                                                    </button>
                                                    <button
                                                    onClick={() => navigate(`/store-request/print/${request.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-800 mr-3"
                                                        title="Print Request">
                                                            print
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(request.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete Request"
                                                    >
                                                        <TrashIcon className="h-5 w-5 inline" />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Row for Items */}
                                            {expandedRows[request.id] && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="8" className="p-0 border-t border-gray-200">
                                                        <div className="p-4 border-l-4 border-indigo-500">
                                                            <h4 className="text-md font-bold mb-3 text-indigo-700">Requested Items</h4>
                                                            <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-600">Item Name</th>
                                                                        <th className="px-6 py-2 text-center text-xs font-medium text-gray-600 w-20">Qty</th>
                                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-600 w-16">Unit</th>
                                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-600">Remark</th>
                                                                        <th className="px-6 py-2 text-center text-xs font-medium text-gray-600 w-24">Image</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-100">
                                                                    {request.requested_items.length > 0 ? request.requested_items.map((item, itemIndex) => (
                                                                        <tr key={itemIndex}>
                                                                            <td className="px-6 py-3">{item.item_name}</td>
                                                                            <td className="px-6 py-3 text-center">{item.quantity}</td>
                                                                            <td className="px-6 py-3">{item.unit}</td>
                                                                            <td className="px-6 py-3 text-sm text-gray-600">{item.remark || '—'}</td>
                                                                            <td className="px-6 py-3 text-center">
                                                                                {item.image_url ? (
                                                                                    <button onClick={() => setPreviewImage(item.image_url)} className="p-1 border rounded hover:border-indigo-500">
                                                                                        <img src={item.image_url} alt={item.item_name} className="h-8 w-8 object-cover rounded" />
                                                                                    </button>
                                                                                ) : (
                                                                                    <span className="text-gray-400 text-xs">No Image</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )) : (
                                                                        <tr><td colSpan="5" className="text-center py-3 text-gray-500">No items listed for this request.</td></tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {requests.last_page > 1 && (
                            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === requests.last_page} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(currentPage - 1) * requests.per_page + 1}</span> to <span className="font-medium">{(currentPage - 1) * requests.per_page + requests.data.length}</span> of <span className="font-medium">{requests.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {/* Simple Pagination Buttons */}
                                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                <span>Previous</span>
                                            </button>
                                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === requests.last_page} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                <span>Next</span>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" 
                    onClick={() => setPreviewImage(null)}
                >
                    <img 
                        src={previewImage} 
                        alt="Item Preview" 
                        className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <button 
                        onClick={() => setPreviewImage(null)} 
                        className="absolute top-4 right-4 text-white p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition duration-150"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default StoreRequestManager;