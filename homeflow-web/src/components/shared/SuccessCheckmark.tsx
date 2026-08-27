export default function SuccessCheckmark({
  className
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 52 52"
      className={className ?? 'size-16 text-green-600'}
    >
      <circle
        className="checkmark-circle"
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="checkmark-check"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27l7 7 16-16"
      />
    </svg>
  );
}
