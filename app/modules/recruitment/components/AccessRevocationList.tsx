'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

export default function AccessRevocationList() {
    const { user } = useAuth();
    const [revokedList, setRevokedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [revokeData, setRevokeData] = useState({ terminationId: '', employeeId: '', accessType: 'ALL_ACCESS', comments: '' });
    const [historyModal, setHistoryModal] = useState<{ show: boolean; employeeId: string; data: any }>({ show: false, employeeId: '', data: null });

    useEffect(() => {
        fetchRevokedList();
    }, []);

    const fetchRevokedList = async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.getTerminatedEmployeesWithRevokedAccess();
            setRevokedList(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to fetch revoked access list', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!revokeData.terminationId || !revokeData.employeeId) return;

        try {
            await recruitmentApi.revokeTerminatedEmployeeAccess(
                revokeData.terminationId,
                revokeData.employeeId,
                user?.userid || 'system',
                revokeData.accessType,
                revokeData.comments
            );
            alert('Access revoked successfully! Employee profile set to INACTIVE.');
            setShowRevokeModal(false);
            setRevokeData({ terminationId: '', employeeId: '', accessType: 'ALL_ACCESS', comments: '' });
            fetchRevokedList();
        } catch (e) {
            alert('Failed to revoke access');
        }
    };

    const showHistory = async (employeeId: string) => {
        try {
            const data = await recruitmentApi.getEmployeeAccessRevocationHistory(employeeId);
            setHistoryModal({ show: true, employeeId, data });
        } catch (e) {
            alert('Failed to load history');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Access Revocation Management</h3>
                <Button variant="error" onClick={() => setShowRevokeModal(true)}>
                    Revoke Access
                </Button>
            </div>

            <Card padding="md">
                <h4 style={{ marginBottom: '1rem' }}>Terminated Employees with Revoked Access</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : revokedList.length === 0 ? (
                    <p style={{ color: '#666' }}>No employees with revoked access</p>
                ) : (
                    revokedList.map((item: any) => (
                        <div
                            key={item._id || item.employeeId}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid #f3f4f6'
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 500 }}>Employee: {item.employeeId}</p>
                                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Access Type: {item.accessType || 'ALL'}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                    Revoked: {item.accessRevocationDate ? new Date(item.accessRevocationDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    fontSize: '0.8rem'
                                }}>
                                    TERMINATED
                                </span>
                                <Button size="sm" variant="outline" onClick={() => showHistory(item.employeeId)}>
                                    History
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </Card>

            {/* Revoke Access Modal */}
            {showRevokeModal && (
                <Modal isOpen={true} onClose={() => setShowRevokeModal(false)} title="Revoke Employee Access">
                    <form onSubmit={handleRevoke} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Termination ID</label>
                            <Input
                                value={revokeData.terminationId}
                                onChange={(e) => setRevokeData({ ...revokeData, terminationId: e.target.value })}
                                placeholder="Enter Termination ID"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Employee ID</label>
                            <Input
                                value={revokeData.employeeId}
                                onChange={(e) => setRevokeData({ ...revokeData, employeeId: e.target.value })}
                                placeholder="Enter Employee ID"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Access Type</label>
                            <select
                                className={styles.input}
                                value={revokeData.accessType}
                                onChange={(e) => setRevokeData({ ...revokeData, accessType: e.target.value })}
                            >
                                <option value="ALL_ACCESS">All Access</option>
                                <option value="SYSTEM_ACCESS">System Access Only</option>
                                <option value="BUILDING_ACCESS">Building Access Only</option>
                                <option value="NETWORK_ACCESS">Network Access Only</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Comments</label>
                            <textarea
                                className={styles.input}
                                value={revokeData.comments}
                                onChange={(e) => setRevokeData({ ...revokeData, comments: e.target.value })}
                                placeholder="Optional comments..."
                                rows={3}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
                            <Button type="submit" variant="error">Revoke Access</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* History Modal */}
            {historyModal.show && (
                <Modal isOpen={true} onClose={() => setHistoryModal({ show: false, employeeId: '', data: null })} title="Revocation History">
                    <div>
                        <p><strong>Employee ID:</strong> {historyModal.employeeId}</p>
                        {historyModal.data ? (
                            <div style={{ marginTop: '1rem' }}>
                                <p><strong>Status:</strong> {historyModal.data.status}</p>
                                <p><strong>Latest Revocation:</strong> {historyModal.data.latestRevocation?.revokedAt ? new Date(historyModal.data.latestRevocation.revokedAt).toLocaleString() : 'N/A'}</p>
                                <p><strong>Revoked By:</strong> {historyModal.data.latestRevocation?.revokedBy || 'N/A'}</p>
                            </div>
                        ) : (
                            <p style={{ color: '#666' }}>No history available</p>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
