export default function SegmentedFilter({ label, value, options, onChange }) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div
      className="accountSegmentedFilter"
      style={{
        "--filter-count": options.length,
        "--filter-index": activeIndex,
      }}
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {typeof option.count === "number" && <span>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
