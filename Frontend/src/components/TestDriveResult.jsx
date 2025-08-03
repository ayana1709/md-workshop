import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

const TestDriveResult = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  console.log(" job id number:", id);

  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("Missing job card number.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await api.get(`/post-drive-tests/by-job-card/${id}`);
        setTestResult(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch test drive result:", err);
        setError(
          `No test drive result was found for job card number "${id}". 
        Please make sure the number is correct or try again.`
        );
        setTestResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const handleNavigate = () => {
    navigate(`/test-drive/${id}`);
  };

  // Loading State
  if (loading) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center h-[60vh] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-4">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
          <span className="text-lg font-medium text-blue-700 animate-pulse">
            Fetching test result...
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Hang tight, we’re getting the data!
        </p>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-[60vh] text-red-600 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <AlertCircle className="w-12 h-12 mb-2 text-red-500" />
        <h2 className="text-2xl font-semibold">Oops! Something went wrong.</h2>
        <p className="text-lg mt-2">{error}</p>
        <p className="text-sm text-gray-400 mt-1">Please try again later.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto mt-10 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-500 py-6 px-6 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
        🚗 Test Drive Result Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800 mb-10">
        <Info label="🔧 Job Card No" value={testResult?.job_card_no} />
        <Info label="🚘 Plate Number" value={testResult?.plate_number} />
        <Info label="👤 Customer Name" value={testResult?.customer_name} />
        <Info label="🛠️ Checked By" value={testResult?.checked_by} />
        <Info label="📅 Checked Date" value={testResult?.checked_date} />
      </div>

      <Section
        label="📝 Post-Test Observation"
        value={testResult?.post_test_observation}
      />
      <Section label="📌 Recommendation" value={testResult?.recommendation} />

      {testResult?.technician_final_approval && (
        <div className="mt-8 text-center">
          <span
            className={`inline-block px-8 py-3 text-white font-semibold rounded-full text-lg shadow-lg transition-all duration-300 ${
              testResult.technician_final_approval === "Pass"
                ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                : "bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
            }`}
          >
            ✅ Final Approval: {testResult.technician_final_approval}
          </span>
        </div>
      )}
    </motion.div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-800 text-xl">{label}</span>
    <span className="text-lg font-medium text-gray-900">
      {value ? value : "N/A"}
    </span>
  </div>
);

const Section = ({ label, value }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-gray-800 mb-2">{label}</h3>
    <p className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
      {value ? value : "No data provided."}
    </p>
  </div>
);

export default TestDriveResult;
