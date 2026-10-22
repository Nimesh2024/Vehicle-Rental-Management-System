import React from 'react';

export default function AuditLogsTab({ auditLogs = [] }) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">🛡️ System Activity & Security Audit Logs</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time immutable security audit trail recording system events and administrative mutations
          </div>
        </div>
      </div>

      <div className="audit-list">
        {auditLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records logged yet.
          </div>
        ) : (
          auditLogs.map((log) => (
            <div key={log.LogID} className="audit-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className={`audit-tag ${(log.ActionType || '').toLowerCase()}`}>
                  {log.ActionType}
                </span>
                <div>
                  <strong>[{log.TableName}]</strong> {log.Description}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {new Date(log.ActionTimestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
