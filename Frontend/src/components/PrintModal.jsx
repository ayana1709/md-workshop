import React from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import success from "./../images/success.json";
import { useStores } from "../contexts/storeContext";

const PrintModal = ({ routePath, dataKey, navigateBack }) => {
  const {
    repairData,
    boloData,
    setIsPrintModalOpen,
    inspectionData,
    wheelData,
    isPrintModalOpen,
  } = useStores();

  const navigate = useNavigate();

  const handleCloseModal = () => {
    setIsPrintModalOpen(false);
    navigate(`${navigateBack}`);
  };

  console.log(isPrintModalOpen);

  const onPrint = () => {
    const dataMap = {
      repairData,
      boloData,
      inspectionData,
      wheelData,
    };

    const stateData = dataMap[dataKey]; // Dynamically get the correct data

    navigate(`/${routePath}`, { state: { [dataKey]: stateData } });

    setIsPrintModalOpen(false);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: success,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="w-full fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="phone:w-[95%] tablet:w-[30%] phone:mt-2 tablet:mt-0 bg-white dark:bg-gray-600 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-start justify-between">
          <div className="self-center text-center mb-4">
            <h3 className="text-center text-lg dark:text-white font-semibold">
              Registration Successful!
            </h3>
          </div>
          <div className="self-center">
            <Lottie options={defaultOptions} height={100} width={100} />
          </div>

          <div className="mt-4">
            <p className="text-center mb-4 dark:text-white">
              Would you like to receive a receipt of the registration?
            </p>
            <div className="flex justify-between">
              <button
                onClick={onPrint}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-700 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-300"
              >
                Yes, Print
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-red-500 dark:bg-red-700 hover:bg-red-800 text-white p-2 rounded-lg transition-all duration-300"
              >
                No, Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
