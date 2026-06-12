// One-shot script: read existing partial page.tsx, append the rest, write it back.
const fs = require('fs');
const path = require('path');

const filePath = 'c:/DG/digisharks-communications/src/app/admin/store/page.tsx';

let current = fs.readFileSync(filePath, 'utf8');

// Sanity check: must end where we expect.
const expectedTail = '              <span';
if (!current.endsWith(expectedTail)) {
  console.error('UNEXPECTED FILE TAIL. Got: ' + JSON.stringify(current.slice(-80)));
  process.exit(1);
}

// Append the remainder of the JSX (the file was cut off mid-<span>).
const remainder = `
                style={{
                  color: '#7dd3fc',
                  fontSize: 12,
                  alignSelf: 'center',
                  fontWeight: 600,
                }}
              >
                {' '}
                {selectedCount} selected
              </span>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setDeleteSelectedOpen(true)}
                disabled={deleting}
              >
                {'\ud83d\uddd1'} Delete selected ({selectedCount})
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearSelection}
                disabled={deleting}
              >
                Clear
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setDeleteAllOpen(true)}
            disabled={orders.length === 0 || deleting}
            title="Delete every order matching the current filter"
          >
            {'\ud83d\uddd1'} Delete all ({orders.length})
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty">
          <div className="icon">{'\u23f3'}</div>
          <p>Loading orders{'\u2026'}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="icon">{'\ud83d\udcec'}</div>
          <p>No orders yet. Share the storefront to get your first sale!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="queries" aria-label="Orders">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selectedCount > 0 && selectedCount === orders.length}
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          selectedCount > 0 && selectedCount < orders.length
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemSummary = o.items
                  .map((i) => i.title + ' \u00d7 ' + i.qty)
                  .join(', ')
                const isSelected = selectedIds.has(o._id)
                return (
                  <tr
                    key={o._id}
                    style={
                      isSelected
                        ? { background: 'rgba(14, 165, 233, 0.08)' }
                        : undefined
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={'Select order ' + o.orderNumber}
                        checked={isSelected}
                        onChange={() => toggleSelect(o._id)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.orderNumber}</div>
                      {o.payment?.razorpayPaymentId && (
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                          {o.payment.razorpayPaymentId}
                        </div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(o.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {o.customer.email}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {o.customer.phone}
                      </div>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                        {itemSummary}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#7dd3fc' }}>
                      {formatINR(o.amount)}
                    </td>
                    <td>
                      <span
                        className={
                          o.payment.status === 'paid'
                            ? 'status-pill status-completed'
                            : o.payment.status === 'failed'
                            ? 'status-pill status-pending'
                            : 'status-pill status-follow-up'
                        }
                      >
                        <span className="dot" /> {o.payment.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          o.deliveryStatus === 'received'
                            ? 'status-pill status-completed'
                            : 'status-pill status-pending'
                        }
                        onClick={() => toggleDeliveryStatus(o)}
                        disabled={busyId === o._id}
                        title="Click to toggle"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="dot" />{' '}
                        {o.deliveryStatus === 'received' ? 'received' : 'not yet'}
                      </button>
                    </td>
                    <td>
                      {o.emailSent ? (
                        <span
                          className="status-pill status-completed"
                          title={
                            o.emailSentAt
                              ? 'Sent at ' + fmtDate(o.emailSentAt)
                              : ''
                          }
                        >
                          <span className="dot" /> sent
                        </span>
                      ) : o.payment.status === 'paid' ? (
                        <span
                          className="status-pill status-pending"
                          title={o.emailError || ''}
                        >
                          <span className="dot" /> failed
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>{'\u2014'}</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-actions">
                        {o.payment.status === 'paid' && (
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => resendEmail(o._id)}
                            disabled={busyId === o._id}
                            title="Re-send the premium invoice + database PDF"
                          >
                            {busyId === o._id ? <span className="spinner" /> : '\u2709'}{' '}
                            Resend
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => setDeleteTarget(o)}
                          title="Delete this order"
                        >
                          {'\ud83d\uddd1'} Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <DeleteOrderModal
          target={deleteTarget}
          count={1}
          onClose={() => (deleting ? null : setDeleteTarget(null))}
          onConfirm={handleDeleteOne}
          busy={deleting}
        />
      )}

      {deleteSelectedOpen && (
        <DeleteOrderModal
          count={selectedCount}
          scopeLabel="you have selected"
          onClose={() => (deleting ? null : setDeleteSelectedOpen(false))}
          onConfirm={handleDeleteSelected}
          busy={deleting}
        />
      )}

      {deleteAllOpen && (
        <DeleteOrderModal
          count={orders.length}
          scopeLabel={deleteAllScopeLabel}
          onClose={() => (deleting ? null : setDeleteAllOpen(false))}
          onConfirm={handleDeleteAll}
          busy={deleting}
        />
      )}
    </div>
  )
}
`;

const final = current + remainder;
fs.writeFileSync(filePath, final, 'utf8');
console.log('Wrote ' + final.length + ' bytes to ' + filePath);
