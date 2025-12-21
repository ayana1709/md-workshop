import React, { useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import EditFieldModal from "../components/EditFieldModal";
// import { Dialog, DialogTitle } from "@mui/material";
// import { DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import AddMoreItemModal from "./AddMoreItemModal";
import { Search, X } from "lucide-react";
import EditItemModal from "./EditItemModal";
import Swal from "sweetalert2";
import api from "@/api";
import { useStores } from "@/contexts/storeContext";

export const columns = ({
  selectedRows,
  setSelectedRows,
  printRef,
  setItems,
  isEditOpen,
  setIsEditOpen,
  selectedItem,
  setSelectedItem,
  setIsItemModalOpen,
  setSelectedRepairId,
}) => [
{
  header: "#",
  cell: ({ row }) => row.index + 1,
},
  {
    id: "select",
header: ({ table }) => (
  <Checkbox
    checked={
      table.getRowModel().rows.length > 0 &&
      table.getRowModel().rows.every((row) => selectedRows.includes(row.original.id))
    }
    onCheckedChange={(value) => {
      const currentPageIds = table.getRowModel().rows.map((row) => row.original.id);
      if (value) {
        setSelectedRows((prev) => [...new Set([...prev, ...currentPageIds])]);
      } else {
        setSelectedRows((prev) => prev.filter((id) => !currentPageIds.includes(id)));
      }
    }}
  />
),
    cell: ({ row }) => (
      /* Wrap in a div to ensure the tooltip (title) works even if the checkbox is disabled */
      <div
        title={row.original.quantity <= 0 ? "This item is out of stock" : ""}
      >
        <Checkbox
          disabled={row.original.quantity <= 0}
          checked={selectedRows.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              setSelectedRows((prev) => [...prev, row.original.id]);
            } else {
              setSelectedRows((prev) =>
                prev.filter((id) => id !== row.original.id)
              );
            }
          }}
          className={
            row.original.quantity <= 0 ? "opacity-40 cursor-not-allowed" : ""
          }
        />
      </div>
    ),
  },

  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const [openImage, setOpenImage] = useState(false);

      const apiBase = import.meta.env.VITE_API_URL;

      const imageUrl = row.original.image
        ? `${apiBase}/storage/${row.original.image}`
        : "/images/default-item.png";

      return (
        <>
          {/* Thumbnail */}
          <img
            src={imageUrl}
            alt={row.original.item_name}
            className="w-12 h-12 object-cover rounded cursor-pointer border"
            onClick={() => setOpenImage(true)}
            onError={(e) => {
              e.currentTarget.src = "/images/defa.jpg";
            }}
          />

          {/* Full Image Modal */}
          <Dialog open={openImage} onOpenChange={setOpenImage}>
            <DialogContent className="p-0 bg-transparent border-none shadow-none">
              <img
                src={imageUrl}
                alt={row.original.item_name}
                className="max-w-full max-h-[80vh] object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = "/images/default-item.png";
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [isAddMoreOpen, setIsAddMoreOpen] = useState(false);

      return (
        <div className="relative flex items-center gap-2 w-full">
          <span className="truncate max-w-[80%]">{row.original.item_name}</span>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="p-0 h-8 w-8 border hover:bg-transparent"
                onClick={() => setIsDialogOpen(!isDialogOpen)}
              >
                <IoMdArrowDropdown size={30} className="text-gray-500" />
              </Button>
            </DialogTrigger>
            <DialogContent
              portal={false}
              className="absolute top-[60%] left-[30%] z-50 w-40 bg-white shadow-lg border rounded-md p-2"
            >
              <DialogHeader>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-sm"
                  onClick={() => {
                    setIsAddMoreOpen(true);
                  }}
                >
                  Add More
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {isAddMoreOpen && (
            <AddMoreItemModal
              onClose={() => setIsAddMoreOpen(false)}
              open={isAddMoreOpen}
              setOpen={setIsDialogOpen}
              repair={row.original}
              setItems={setItems}
              setDialogeOpen={setIsAddMoreOpen}
            />
          )}
        </div>
      );
    },
  },
  // part number
  {
    accessorKey: "part_number",
    header: "Part Number",
    cell: ({ row }) => {
      const [openModal, setOpenModal] = React.useState(false);
      return (
        <div className="relative flex items-center gap-2">
          {row.original.part_number}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpenModal(!openModal)}
          >
            <IoMdArrowDropdown />
          </Button>
          {openModal && (
            <div className="absoute z-[9999]">
              <EditFieldModal
                item={row.original}
                field="part_number"
                onClose={() => setOpenModal(false)}
                setItems={setItems}
              />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
{
    accessorKey: "purchase_price",
    header: "Pr Price",
    cell: ({ row }) => {
      const [openModal, setOpenModal] = useState(false);

      return (
        <div className="relative flex items-center gap-2">
          {row.original.purchase_price}

          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpenModal(true)}
          >
            <IoMdArrowDropdown />
          </Button>

          {openModal && (
            <div className="absolute z-[9999]">
              <EditFieldModal
                item={row.original}
                field="purchase_price" // The modal uses this to know what to update
                onClose={() => setOpenModal(false)}
                setItems={setItems}   // 👈 Just pass the function directly like the first one
              />
            </div>
          )}
        </div>
      );
    },
  },
{
  accessorKey: "selling_price",
  header: "Sp Price",
  cell: ({ row }) => {
    const [openPopover, setOpenPopover] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // This ensures calculations use the latest data from the row
    const currentItem = row.original;
    const rawUnitPrice = Number(currentItem.selling_price || 0);
    const rawQuantity = Number(currentItem.quantity || 0);
    
    const vat = rawUnitPrice * 0.15;
    const unitWithVat = rawUnitPrice + vat;
    const totalWithVat = unitWithVat * rawQuantity;

    return (
      <div className="relative">
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="font-mono">
              {currentItem.selling_price}
              <IoMdArrowDropdown className="ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] z-[50]">
            <div className="text-sm space-y-1">
              <div className="font-bold text-blue-600 mb-2">Live Pricing (ETB)</div>
              <div className="flex justify-between">
                <span>Unit Price:</span> <span>{rawUnitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (15%):</span> <span>{vat.toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Unit + VAT:</span> <span>{unitWithVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total for {rawQuantity} pcs:</span> 
                <span>{totalWithVat.toLocaleString()}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => {
                setShowEditModal(true);
                setOpenPopover(false); // Close popover when opening modal
              }}
            >
              ✏️ Set New Price
            </Button>
          </PopoverContent>
        </Popover>

        {showEditModal && (
          <div className="absolute z-[9999] top-0 left-0">
            <EditFieldModal
              item={currentItem}
              field="selling_price"
              onClose={() => setShowEditModal(false)}
              // Passing setItems directly like your working Part Number column
              setItems={setItems} 
            />
          </div>
        )}
      </div>
    );
  },
},
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const [openModal, setOpenModal] = useState(false);
      const qty = row.original.quantity;
      const lowStockThreshold = 10;

      return (
        <div className="relative flex items-center gap-3">
          {/* Visual Badge for Quantity */}
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold min-w-[40px] text-center ${
              qty <= 0
                ? "bg-red-100 text-red-700 border border-red-200"
                : qty <= lowStockThreshold
                ? "bg-orange-100 text-orange-700 border border-orange-200 animate-pulse"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {qty <= 0 ? "Out" : qty}
          </span>

          {/* Edit Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => setOpenModal(true)}
          >
            <IoMdArrowDropdown className="h-4 w-4 text-gray-500" />
          </Button>

          {/* Low Stock Warning Text */}
          {qty > 0 && qty <= lowStockThreshold && (
            <span className="absolute -top-4 left-2 text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
              Low
            </span>
          )}

          {openModal && (
            <div className="absolute z-[9999]">
              <EditFieldModal
                item={row.original}
                field="quantity"
                onClose={() => setOpenModal(false)}
                setItems={setItems}
              />
            </div>
          )}
        </div>
      );
    },
  },

  {
    id: "total_selling_price",
    header: "Total SP",
    cell: ({ row }) => {
      const price = Number(row.original.selling_price || 0);
      const qty = Number(row.original.quantity || 0);
      const total = price * qty;

      // Format number nicely
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(total);

      return <span>{formatted}</span>;
    },
  },

  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "shelf_number",
    header: "Shelf Number",
  },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      return (
        <span
          className={`px-2 py-1 rounded text-white text-xs font-semibold ${
            quantity > 0 ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {quantity > 0 ? "Available" : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const id = row.original.id;
      const { fetchItems } = useStores();

      return (
        <div className="relative">
          <Button size="sm" onClick={() => setOpen((prev) => !prev)}>
            Action <IoMdArrowDropdown className="ml-1" />
          </Button>
          {open && (
            <div className="absolute z-[9999] right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10 border flex flex-col">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsModalOpen(true);
                  setOpen(false);
                }}
              >
                View
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedItem(row.original);
                  setIsEditOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={async () => {
                  const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "This item will be permanently deleted.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (!result.isConfirmed) return;

                  try {
                    await api.delete(`/items/${row.original.id}`);

                    Swal.fire(
                      "Deleted!",
                      "Item deleted successfully.",
                      "success"
                    );

                    // Refresh items from context
                    await fetchItems();
                  } catch (error) {
                    console.error(error);
                    Swal.fire("Error", "Failed to delete the item.", "error");
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-white p-0 rounded-lg shadow-lg w-full max-w-2xl sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Item Details
                </h2>
              </div>

              <div className="px-4 sm:px-6 py-6">
                <div className="space-y-4">
                  {[
                    {
                      label: "Item Code:",
                      value: String(row.original.id).padStart(4, "0"),
                    },
                    { label: "Item Name:", value: row.original.item_name },
                    { label: "Part Number:", value: row.original.part_number },
                    { label: "Brand:", value: row.original.brand },
                    {
                      label: "Pr Price:",
                      value: row.original.purchase_price || "0",
                    },
                    {
                      label: "Selling Price:",
                      value: row.original.selling_price || "0",
                    },
                    { label: "Quantity:", value: row.original.quantity || "0" },
                    { label: "Model:", value: row.original.model || "N/A" },
                    {
                      label: "Manufacturer:",
                      value: row.original.manufacturer || "N/A",
                    },
                    {
                      label: "Location:",
                      value: row.original.location || "N/A",
                    },
                    {
                      label: "Minimum Quantity:",
                      value: row.original.min_quantity || "0",
                    },
                    {
                      label: "Low Quantity:",
                      value: row.original.low_quantity || "0",
                    },
                    {
                      label: "Maximum Quantity:",
                      value: row.original.max_quantity || "0",
                    },
                    {
                      label: "Least Price:",
                      value: row.original.least_price || "0",
                    },
                    {
                      label: "Maximum Price:",
                      value: row.original.maximum_price || "0",
                    },
                    {
                      label: "Item Added On:",
                      value: row.original.created_at
                        ? new Date(row.original.created_at)
                            .toISOString()
                            .replace("T", " ")
                            .substring(0, 19)
                        : "N/A",
                    },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <label className="sm:w-40 text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={field.value}
                        readOnly
                        className="flex-1 text-sm border border-gray-300 bg-gray-100 px-3 py-2 rounded-md"
                      />
                    </div>
                  ))}

                  {/* ✅ Totals */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="sm:w-40 text-sm font-medium text-gray-700">
                      Total Purchasing Price:
                    </label>
                    <input
                      type="text"
                      value={
                        (row.original.purchase_price || 0) *
                        (row.original.quantity || 0)
                      }
                      readOnly
                      className="flex-1 text-sm border border-gray-300 bg-gray-100 px-3 py-2 rounded-md"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="sm:w-40 text-sm font-medium text-gray-700">
                      Total Selling Price:
                    </label>
                    <input
                      type="text"
                      value={
                        (row.original.selling_price || 0) *
                        (row.original.quantity || 0)
                      }
                      readOnly
                      className="flex-1 text-sm border border-gray-300 bg-gray-100 px-3 py-2 rounded-md"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 text-right">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {selectedItem && (
            <EditItemModal
              open={isEditOpen}
              setOpen={setIsEditOpen}
              item={selectedItem}
              onSave={(updatedData) => {
                // Here you handle the updated item data.
                // For example, call your API or update local state.
                console.log("New item data:", updatedData);
              }}
            />
          )}
        </div>
      );
    },
  },
];
