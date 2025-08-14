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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (selectedRows.length > 0 &&
            selectedRows.length === table.getRowModel().rows.length)
        }
        onCheckedChange={(value) => {
          const ids = table.getRowModel().rows.map((row) => row.original.id);
          setSelectedRows(value ? ids : []);
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedRows.includes(row.original.id)}
        onCheckedChange={() => {
          const id = row.original.id;
          setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          );
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const [openImage, setOpenImage] = useState(false);

      // Build the full image URL (adjust base URL as needed)
      const imageUrl = row.original.image
        ? `${import.meta.env.VITE_API_URL}/storage/${row.original.image}`
        : "/placeholder.png";

      return (
        <>
          {/* Small Thumbnail */}
          <img
            src={imageUrl}
            alt={row.original.item_name}
            className="w-12 h-12 object-cover rounded cursor-pointer border"
            onClick={() => setOpenImage(true)}
          />

          {/* Popup for Full Image */}
          <Dialog open={openImage} onOpenChange={setOpenImage}>
            <DialogContent className="p-0 bg-transparent border-none shadow-none">
              <img
                src={imageUrl}
                alt={row.original.item_name}
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },

  {
    accessorKey: "id",
    header: "Item Code",
    cell: ({ row }) => {
      const paddedId = String(row.original.id).padStart(4, "0");
      return <span>{paddedId}</span>;
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
  // {
  //   accessorKey: "description",
  //   header: "Description",
  // },

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
              {" "}
              <EditFieldModal
                item={row.original}
                field="purchase_price"
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
    accessorKey: "selling_price",
    header: "Sp Price",
    cell: ({ row }) => {
      const [openPopover, setOpenPopover] = useState(false);
      const [showEditModal, setShowEditModal] = useState(false);
      const [priceHistory, setPriceHistory] = useState([
        {
          date: new Date().toISOString().split("T")[0],
          value: row.original.selling_price,
        },
      ]);
      const formatNumber = (value) => {
        const num = Number(value);

        if (isNaN(num)) return "0"; // fallback for invalid input

        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(num);
      };

      const rawUnitPrice = Number(row.original.selling_price || 0);
      const rawQuantity = Number(row.original.quantity || 0);

      const vat = rawUnitPrice * 0.15;
      const unitWithVat = rawUnitPrice + vat;
      const totalWithVat = unitWithVat * rawQuantity;

      // Only format when displaying
      // console.log("Unit Price:", formatNumber(rawUnitPrice));
      // console.log("VAT:", formatNumber(vat));
      // console.log("Unit + VAT:", formatNumber(unitWithVat));
      // console.log("Total with VAT:", formatNumber(totalWithVat));

      const handleNewPrice = (newPrice) => {
        setPriceHistory((prev) => [
          { date: new Date().toISOString().split("T")[0], value: newPrice },
          ...prev,
        ]);
        setShowEditModal(false);
      };

      // Usage:

      return (
        <div>
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {row.original.selling_price}{" "}
                <IoMdArrowDropdown className="ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <div className="text-sm space-y-1">
                <div> Selling Price : {row.original.selling_price}</div>
                <div>Unit VAT: {vat}</div>
                <div>Unit Price with VAT: {unitWithVat}</div>
                <div>Total Price with VAT: {totalWithVat}</div>
              </div>
              <Separator className="my-2" />
              <div className="text-sm font-semibold">
                Standard Price History:
              </div>
              {priceHistory.map((entry, idx) => (
                <div key={idx} className="text-sm">
                  Date: {entry.date} ----- {entry.value} (SP)
                </div>
              ))}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="border p-4 text-left text-blue-600 mt-1"
                onClick={() => setShowEditModal(true)}
              >
                ✏️ Set New Price
              </Button>
            </PopoverContent>
          </Popover>
          {showEditModal && (
            <div className="absolute z-[9999]">
              <EditFieldModal
                item={row.original}
                field="selling_price"
                onClose={() => setShowEditModal(false)}
                setItems={(updatedItem) =>
                  handleNewPrice(updatedItem.selling_price)
                }
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
      return (
        <div className="relative flex items-center gap-2">
          {row.original.quantity}
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
    accessorKey: "location",
    header: "Location",
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
          {quantity > 0 ? "Available" : "Not Available"}
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
                className="w-full justify-start"
                onClick={() => {
                  setSelectedItem(row.original); // this could be row.original if you're using react-table
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
            <DialogContent className="bg-white p-0 rounded-md shadow-md w-[40%] max-h-[90vh] overflow-y-auto">
              <div className="border-b p-3 flex items-center gap-2">
                <h2>Item Details</h2>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-3">
                  {[
                    {
                      label: "Item Code:",
                      value: String(row.original.id).padStart(4, "0"),
                    },
                    { label: "Item Name:", value: row.original.item_name },
                    { label: "Part Number:", value: row.original.part_number },
                    {
                      label: "Measurement:",
                      value: row.original.measurement || "N/A",
                    },
                    {
                      label: "Description:",
                      value: row.original.description || "N/A",
                      type: "textarea",
                    },
                    { label: "Brand:", value: row.original.brand },
                    { label: "Origin:", value: row.original.origin || "N/A" },
                    {
                      label: "Category:",
                      value: row.original.category || "N/A",
                    },
                    { label: "Group:", value: row.original.group || "N/A" },
                    { label: "Mark:", value: row.original.mark || "N/A" },
                    { label: "Model:", value: row.original.model || "N/A" },
                    {
                      label: "Manufacturer:",
                      value: row.original.manufacturer || "N/A",
                    },
                    {
                      label: "Manufacturing Date:",
                      value: row.original.manufacturing_date || "N/A",
                    },

                    // 🆕 Added Fields
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
                      label: "Standard Price:",
                      value: row.original.unit_price || "0.00",
                    },
                    {
                      label: "Item Added On:",
                      value: row.original.created_at
                        ? new Date(row.original.created_at)
                            .toISOString()
                            .replace("T", "-")
                            .substring(0, 19)
                        : "N/A",
                    },
                  ].map((field, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <label className="w-40 text-right text-sm font-medium pt-1">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={field.value}
                          readOnly
                          className="flex-1 text-sm border border-gray-300 bg-gray-100 px-2 py-1 rounded-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          value={field.value}
                          readOnly
                          className="flex-1 text-sm border border-gray-300 bg-gray-100 px-2 py-1 rounded-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-right">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-sm"
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
