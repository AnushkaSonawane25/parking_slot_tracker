function SummaryCard({ title, count, type, icon }) {
  return (
    <div className={`summary-card summary-card--${type}`}>
      <div className="summary-card-icon-wrapper">
        {icon}
      </div>
      <div className="summary-card-info">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-count">{count}</span>
      </div>
    </div>
  );
}

export default SummaryCard;
