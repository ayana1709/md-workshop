import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api";

function PostDriveTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [formData, setFormData] = useState({
    checked_by: "",
    checked_date: "",
    post_test_observation: "",
    recommendation: "",
    technician_final_approval: "Pending",
  });

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/view-work/${id}`);
        if (response.data) {
          setRepair(response.data);
        }
      } catch (error) {
        console.error("Error fetching repair details:", error);
      }
    };
    fetchRepairById();
  }, [id]);

  const handleApproval = (status) => {
    setFormData({ ...formData, technician_final_approval: status });
  };

  const handleSubmit = async () => {
    if (
      !formData.checked_by ||
      !formData.checked_date ||
      formData.technician_final_approval === "Pending"
    ) {
      Swal.fire(
        "Error!",
        "Checked By, Checked Date, and Technician Final Approval are required.",
        "error"
      );
      return;
    }

    const testData = {
      job_card_no: id,
      plate_number: repair?.plate_number,
      customer_name: repair?.customer_name,
      ...formData,
    };

    try {
      await api.post("/post-drive-tests", testData);
      Swal.fire("Success!", "Post-Drive Test saved.", "success").then(() =>
        navigate("/work/Test_drive")
      );
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error!", "Failed to save test.", "error");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[85%] mx-auto bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="w-[70%] uppercase tracking-wider mx-auto text-xl font-bold text-blue-700 mb-4 dark:text-white">
        Post-Drive Test
      </h2>

      <div className="w-[70%] mx-auto flex flex-col items-center gap-2 desktop:grid-cols-1 justify-center gap-4 border px-4 py-2 rounded-md">
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Job Card ID
          </label>
          <input
            type="text"
            value={id || ""}
            disabled
            className="w-full input-field border-gray-300 dark:bg-gray-800 dark:text-white rounded-md"
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Customer Name
          </label>
          <input
            type="text"
            value={repair?.customer_name || ""}
            disabled
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Plate Number
          </label>
          <input
            type="text"
            value={repair?.plate_number || ""}
            disabled
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Checked By
          </label>
          <input
            type="text"
            name="checked_by"
            onChange={(e) =>
              setFormData({ ...formData, checked_by: e.target.value })
            }
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
            required
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Checked Date
          </label>
          <input
            type="date"
            name="checked_date"
            onChange={(e) =>
              setFormData({ ...formData, checked_date: e.target.value })
            }
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
            required
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Post-Test Observation
          </label>
          <textarea
            name="post_test_observation"
            onChange={(e) =>
              setFormData({
                ...formData,
                post_test_observation: e.target.value,
              })
            }
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Recommendation
          </label>
          <textarea
            name="recommendation"
            onChange={(e) =>
              setFormData({ ...formData, recommendation: e.target.value })
            }
            className="w-full border-gray-300 input-field dark:bg-gray-800 dark:text-white rounded-md"
          />
        </div>
        <div className="w-[60%]">
          <label className="block text-gray-800 tracking-wider font-medium dark:text-gray-200 text-sm font-medium">
            Technician Final Approval
          </label>
          <div className="w-full flex justify-between mt-2 py-2">
            {formData.technician_final_approval === "Pending" && (
              <>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => handleApproval("Pass")}
                >
                  Pass
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => handleApproval("Fail")}
                >
                  Fail
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                  onClick={() => handleApproval("Pending")}
                >
                  Pending
                </button>
              </>
            )}
            {formData.technician_final_approval !== "Pending" && (
              <span
                className={`px-4 py-2 rounded text-white ${
                  formData.technician_final_approval === "Pass"
                    ? "bg-green-500"
                    : formData.technician_final_approval === "Fail"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {formData.technician_final_approval}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <button
          onClick={handleSubmit}
          className="w-[70%] mx-auto inline-block mt-4 bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded transition-all duration-300"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}

export default PostDriveTest;
