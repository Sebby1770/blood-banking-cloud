export default function DonorDetailModal({ donor, history, onClose, onRecordDonation }) {
  if (!donor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{donor.name}</h3>
          <button className="ghost" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div><span className="muted">Blood group</span><strong>{donor.bloodGroup}</strong></div>
            <div><span className="muted">City</span><strong>{donor.city}</strong></div>
            <div><span className="muted">Phone</span><strong>{donor.phone}</strong></div>
            <div><span className="muted">Email</span><strong>{donor.email}</strong></div>
            <div><span className="muted">Eligible</span>
              <strong>{donor.eligibility?.eligible ? 'Yes' : `Wait ${donor.eligibility?.daysUntilEligible}d`}</strong>
            </div>
            {history?.stats && (
              <div><span className="muted">Lifetime donations</span><strong>{history.stats.totalUnits} units</strong></div>
            )}
          </div>
          {history?.donations?.length > 0 && (
            <>
              <h4>Donation history</h4>
              <table>
                <thead><tr><th>Date</th><th>Units</th></tr></thead>
                <tbody>
                  {history.donations.map((d) => (
                    <tr key={d.id}>
                      <td>{new Date(d.donatedAt).toLocaleDateString()}</td>
                      <td>{d.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="modal-footer">
          {donor.eligibility?.eligible && (
            <button className="primary" onClick={() => onRecordDonation(donor)}>Record donation</button>
          )}
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}