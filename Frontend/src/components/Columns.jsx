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
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
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
    accessorKey: "item_code",
    header: "Item Code",
    cell: ({ row }) => (
      <span>{String(row.original.item_code).padStart(4, "0")}</span>
    ),
  },

  // ITEM NAME
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => (
      <span className="truncate">{row.original.item_name}</span>
    ),
  },

  // PART NUMBER
  {
    accessorKey: "part_number",
    header: "Part Number",
    cell: ({ row }) => <span>{row.original.part_number || "N/A"}</span>,
  },

  // CATEGORY NAME
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <span>{row.original.category?.name || "N/A"}</span>,
  },

  // BRAND NAME
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <span>{row.original.brand?.name || "N/A"}</span>,
  },

  // BRANCH NAME
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => <span>{row.original.branch?.name || "N/A"}</span>,
  },

  // UNIT
  { accessorKey: "unit", header: "Unit" },

  // QUANTITY (sum of purchases)
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const totalQuantity = row.original.purchases?.reduce(
        (sum, p) => sum + Number(p.quantity),
        0,
      );
      return <span>{totalQuantity || 0}</span>;
    },
  },
  { accessorKey: "low_stock", header: " Stock Alert" },

  // LOCATION
  { accessorKey: "location", header: "Location" },

  // STATUS
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const totalQuantity = row.original.purchases?.reduce(
        (sum, p) => sum + Number(p.quantity),
        0,
      );
      return (
        <span
          className={`px-2 py-1 rounded text-white text-xs font-semibold ${
            totalQuantity > 0 ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {totalQuantity > 0 ? "Available" : "Not Available"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const [isViewOpen, setIsViewOpen] = useState(false);
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isHistoryOpen, setIsHistoryOpen] = useState(false);
      const [selectedItem, setSelectedItem] = useState(null);
      const { fetchItems } = useStores();

      // Print QR with user inputs for size and quantity
      const printQr = async () => {
        const qrUrl = row.original.qr_code;
        if (!qrUrl) return alert("QR code not available!");

        const apiBase = import.meta.env.VITE_API_URL;
        const fullQrUrl = qrUrl.startsWith("http")
          ? qrUrl
          : `${apiBase}/storage/${qrUrl}`;

        const { value: formValues } = await Swal.fire({
          title: "QR Print Settings",
          html: `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label>Width (px)</label>
            <input id="swal-width" type="number" class="swal2-input" value="150"/>
            <label>Height (px)</label>
            <input id="swal-height" type="number" class="swal2-input" value="150"/>
            <label>Quantity</label>
            <input id="swal-quantity" type="number" class="swal2-input" value="${row.original.quantity || 1}"/>
          </div>
        `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Print",
          cancelButtonText: "Cancel",
          preConfirm: () => {
            const width =
              Number(document.getElementById("swal-width").value) || 150;
            const height =
              Number(document.getElementById("swal-height").value) || 150;
            const quantity =
              Number(document.getElementById("swal-quantity").value) || 1;
            return { width, height, quantity };
          },
        });

        if (!formValues) return;

        const { width, height, quantity } = formValues;

        const win = window.open("", "_blank");
        win.document.write(`
        <html>
          <head>
            <title>Print QR - ${row.original.item_name}</title>
            <style>
              @media print { body { margin: 0; } }
              body {
                font-family: Arial;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 10px;
              }
              .qr-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: ${width}px;
                height: ${height + 30}px;
                page-break-inside: avoid;
              }
              .qr-item img {
                width: ${width}px;
                height: ${height}px;
              }
              .item-code {
                margin-top: 5px;
                font-size: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${Array(quantity)
              .fill(0)
              .map(
                () => `
              <div class="qr-item">
                <img src="${fullQrUrl}" />
                <div class="item-code">Item Code: ${String(row.original.id).padStart(4, "0")}</div>
              </div>
            `,
              )
              .join("")}
            <script>
              window.onload = () => { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
        win.document.close();
      };

      return (
        <div className="relative">
          <Button size="sm" onClick={() => setOpen((prev) => !prev)}>
            Action <IoMdArrowDropdown className="ml-1" />
          </Button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-md border flex flex-col z-50">
              {/* Print QR */}
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-600"
                onClick={async () => {
                  await printQr();
                  setOpen(false);
                }}
              >
                🖨️ Print QR
              </Button>

              {/* View */}
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={() => {
                  setIsViewOpen(true);
                  setOpen(false);
                }}
              >
                👁️ View
              </Button>

              {/* Edit */}
              <Button
                className="w-full justify-start"
                onClick={() => {
                  setSelectedItem(row.original);
                  setIsEditOpen(true);
                  setOpen(false);
                }}
              >
                ✏️ Edit
              </Button>

              {/* Delete */}
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
                      "success",
                    );
                    await fetchItems();
                  } catch (error) {
                    Swal.fire("Error", "Failed to delete the item.", "error");
                  }
                }}
              >
                🗑️ Delete
              </Button>

              {/* Item History */}
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={() => {
                  setIsHistoryOpen(true);
                  setOpen(false);
                }}
              >
                📜 Item History
              </Button>
            </div>
          )}

          {/* View Modal */}
          {isViewOpen && (
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="border-b p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Item Details
                  </h2>
                </div>
                <div className="px-4 py-6 space-y-4">
                  {Object.entries(row.original).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span>{value ?? "N/A"}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Modal */}
          {selectedItem && (
            <EditItemModal
              open={isEditOpen}
              setOpen={setIsEditOpen}
              item={selectedItem}
              onSave={(updatedData) => {
                console.log("Item updated:", updatedData);
                // Track history update and refresh list
                fetchItems();
              }}
            />
          )}

          {/* History Modal */}
          {isHistoryOpen && (
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Item History - {row.original.item_name}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-2">
                  {row.original.history?.length > 0 ? (
                    row.original.history.map((h, i) => (
                      <div key={i} className="text-sm border-b py-1">
                        <div>Date: {h.date}</div>
                        <div>Quantity: {h.quantity}</div>
                        <div>Price: {h.price}</div>
                        <div>Edited by: {h.staff || "N/A"}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No history available.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsHistoryOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      );
    },
  },
];
