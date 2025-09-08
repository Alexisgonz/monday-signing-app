type Props = {
  page: number;
  pages: number;
  scale: number;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

export default function PdfToolbar({
  page,
  pages,
  scale,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-2 bg-white">
      <div className="flex items-center gap-2">
        <button className="btn" onClick={onPrev} disabled={page <= 1}>
          ◀
        </button>
        <span className="text-sm">
          {page} / {pages || "?"}
        </span>
        <button
          className="btn"
          onClick={onNext}
          disabled={!pages || page >= pages}
        >
          ▶
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn" onClick={onZoomOut}>
          -
        </button>
        <span className="text-sm w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button className="btn" onClick={onZoomIn}>
          +
        </button>
        <button className="btn" onClick={onResetZoom}>
          100%
        </button>
      </div>
    </div>
  );
}
