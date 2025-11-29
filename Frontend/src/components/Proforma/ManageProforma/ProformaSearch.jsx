function ProformaSearch({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Search..."
      className="border px-3 py-2 mb-4 rounded w-full md:w-1/3"
    />
  );
}

export default ProformaSearch;
