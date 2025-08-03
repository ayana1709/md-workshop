import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`absolute group left-2 top-[2px] text-xs flex items-center font-bold tracking-wider gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 ${className}`}
    >
      <FaArrowLeftLong
        size={16}
        color="#fff"
        className="group-hover:-translate-x-[3px] transition-all duration-500"
      />

      <span>Back</span>
    </button>
  );
};

export default BackButton;
