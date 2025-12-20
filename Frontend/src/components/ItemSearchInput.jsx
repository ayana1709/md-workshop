import React, { useState, useEffect, useRef } from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { createPortal } from "react-dom"; // Teleports the UI to the top layer
import api from "@/api";

const ItemSearchInput = ({ value, onChange, onItemSelect, disabled, placeholder, searchField }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);

  // Floating UI Logic: Handles scroll, resize, and positioning
  const { refs, floatingStyles, context } = useFloating({
    open: showDropdown,
    onOpenChange: setShowDropdown,
    middleware: [offset(6), flip(), shift()], // Flips up if no space below
    whileElementsMounted: autoUpdate, // Moves with scroll
  });

  useEffect(() => { setSearchTerm(value || ""); }, [value]);

  const searchItems = async (query) => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const { data } = await api.get("/items/autocomplete", { params: { q: query, limit: 8 } });
      setResults(Array.isArray(data?.data) ? data.data : []);
    } catch (err) { setResults([]); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    clearTimeout(debounceTimer.current);
    if (val.length >= 2) {
      setShowDropdown(true);
      debounceTimer.current = setTimeout(() => searchItems(val), 300);
    } else { setShowDropdown(false); }
  };

  useEffect(() => {
    const handler = (e) => {
      if (!refs.domReference.current?.contains(e.target) && !refs.floating.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs]);

  return (
    <>
      {/* Target Input */}
      <input
        ref={refs.setReference}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />

      {/* The "Teleported" Dropdown */}
      {showDropdown && createPortal(
        <div
          ref={refs.setFloating}
          style={floatingStyles} // Injected by Floating UI to handle scroll
          className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden w-[400px] animate-in fade-in zoom-in duration-100"
        >
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm italic">No items found</div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.quantity > 0) {
                        onItemSelect(item);
                        setSearchTerm(item[searchField] || item.item_name);
                        setShowDropdown(false);
                    }
                  }}
                  className={`px-4 py-3 border-b border-gray-50 flex justify-between items-center transition-colors
                    ${item.quantity <= 0 ? "opacity-50 bg-gray-50 cursor-not-allowed" : "hover:bg-blue-50 cursor-pointer"}`}
                >
                  <div>
                    <div className="font-bold text-sm text-gray-800">{item.item_name}</div>
                    <div className="text-[11px] text-gray-500">{item.part_number} • {item.brand}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">ETB {item.selling_price}</div>
                    <div className={`text-[10px] font-bold ${item.quantity <= 0 ? "text-red-500" : "text-green-600"}`}>
                        {item.quantity <= 0 ? "OUT OF STOCK" : `STOCK: ${item.quantity}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body // This puts the dropdown outside your table/page containers
      )}
    </>
  );
};

export default ItemSearchInput;