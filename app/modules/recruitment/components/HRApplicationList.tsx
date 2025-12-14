'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobApplication } from '../types';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import RejectionModal from './RejectionModal';
import AdvanceStageModal from './AdvanceStageModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import InterviewListModal from './InterviewListModal';
import ReferralModal from './ReferralModal';
import ConsentModal from './ConsentModal';
import CreateOfferModal from './CreateOfferModal';
import PreboardingModal from './PreboardingModal';
import OnboardingProfileModal from './OnboardingProfileModal';
import styles from './RecruitmentForms.module.css';

export default function HRApplicationList() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state targets
    const [rejectionTarget, setRejectionTarget] = useState<{ id: string, name: string } | null>(null);
    const [advanceTarget, setAdvanceTarget] = useState<{ id: string, name: string, currentStage: string } | null>(null);
    const [interviewTarget, setInterviewTarget] = useState<{ id: string, name: string } | null>(null);
    const [listInterviewsTarget, setListInterviewsTarget] = useState<{ id: string, name: string } | null>(null);
    const [referralTarget, setReferralTarget] = useState<{ candidateId: string, name: string } | null>(null);
    const [consentTarget, setConsentTarget] = useState<{ candidateId: string, name: string } | null>(null);
    const [offerTarget, setOfferTarget] = useState<{ applicationId: string, candidateId: string, name: string } | null>(null);
    const [preboardingTarget, setPreboardingTarget] = useState<{ offerId: string, candidateName: string } | null>(null);
    const [onboardingTarget, setOnboardingTarget] = useState<{ contractId: string, candidateName: string } | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listApplications();
            setApplications(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading applications...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <Card padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Applications</h2>
                <Button variant="primary" onClick={fetchApplications}>Refresh</Button>
            </div>

            <div className={styles.listContainer}>
                {applications.map(app => (
                    <div key={app._id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemTitle}>
                                {app.candidateId}
                                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#666', marginLeft: '0.5rem' }}>
                                    applying for {app.requisitionId || 'Unknown'}
                                </span>
                            </h3>
                            <div className={styles.itemMeta}>
                                <ApplicationStatusBadge status={app.status} />
                                <span>Stage: {app.stage}</span>
                                <span>Date: {new Date(app.appliedDate).toLocaleDateString()}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConsentTarget({ candidateId: app.candidateId, name: `Candidate ${app.candidateId}` })}
                                    style={{ fontSize: '0.75rem', padding: '0 0.5rem', height: 'auto', marginLeft: '0.5rem' }}
                                >
                                    Manage Consent
                                </Button>
                            </div>
                        </div>
                        <div className={styles.itemActions}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReferralTarget({ candidateId: app.candidateId, name: `Candidate ${app.candidateId}` })}
                            >
                                Tag Referral
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setListInterviewsTarget({ id: app._id, name: `Candidate ${app.candidateId}` })}>
                                Interviews / Feedback
                            </Button>
                            {app.status === 'active' && (
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setInterviewTarget({ id: app._id, name: `Candidate ${app.candidateId}` })}
                                    >
                                        Schedule
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setAdvanceTarget({ id: app._id, name: `Candidate ${app.candidateId}`, currentStage: app.stage })}
                                    >
                                        Advance
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOfferTarget({ applicationId: app._id, candidateId: app.candidateId, name: `Candidate ${app.candidateId}` })}
                                    >
                                        Create Offer
                                    </Button>
                                </div>
                            )}

                            {/* Pre-boarding Action for Accepted Offers */}
                            {(app.status === 'offer_accepted' || app.status === 'hired') && (
                                <div className={styles.actions}>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={async () => {
                                            // Hack: We need offerId. Try fetching offers for this app.
                                            try {
                                                const offers = await recruitmentApi.listOffers(app._id);
                                                if (offers && offers.length > 0) {
                                                    // Use the latest offer
                                                    const latestOffer = offers[offers.length - 1];
                                                    setPreboardingTarget({ offerId: latestOffer._id, candidateName: `Candidate ${app.candidateId}` });
                                                } else {
                                                    alert('No offer found for this application.');
                                                }
                                            } catch (e) {
                                                alert('Failed to fetch offer details.');
                                            }
                                        }}
                                    >
                                        Pre-boarding
                                    </Button>

                                    {/* ONB-004: Create Employee Profile */}
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={async () => {
                                            // Hack: Using offerId as contractId for now
                                            try {
                                                const offers = await recruitmentApi.listOffers(app._id);
                                                if (offers && offers.length > 0) {
                                                    const latestOffer = offers[offers.length - 1];
                                                    setOnboardingTarget({ contractId: latestOffer._id, candidateName: `Candidate ${app.candidateId}` });
                                                } else {
                                                    alert('No accepted offer found.');
                                                }
                                            } catch (e) {
                                                alert('Failed to fetch offer details.');
                                            }
                                        }}
                                        style={{ marginLeft: '0.5rem' }}
                                    >
                                        Create Profile
                                    </Button>
                                </div>
                            )}

                            {app.status !== 'rejected' && app.status !== 'hired' && (
                                <Button
                                    variant="error"
                                    size="sm"
                                    onClick={() => setRejectionTarget({ id: app._id, name: `Candidate ${app.candidateId}` })}
                                >
                                    Reject
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {rejectionTarget && (
                <RejectionModal
                    applicationId={rejectionTarget.id}
                    candidateName={rejectionTarget.name}
                    onClose={() => setRejectionTarget(null)}
                    onSuccess={() => { fetchApplications(); }}
                />
            )}

            {advanceTarget && (
                <AdvanceStageModal
                    applicationId={advanceTarget.id}
                    candidateName={advanceTarget.name}
                    currentStage={advanceTarget.currentStage}
                    onClose={() => setAdvanceTarget(null)}
                    onSuccess={() => { fetchApplications(); }}
                />
            )}

            {interviewTarget && (
                <ScheduleInterviewModal
                    applicationId={interviewTarget.id}
                    candidateName={interviewTarget.name}
                    onClose={() => setInterviewTarget(null)}
                    onSuccess={() => { fetchApplications(); }}
                />
            )}

            {listInterviewsTarget && (
                <InterviewListModal
                    applicationId={listInterviewsTarget.id}
                    candidateName={listInterviewsTarget.name}
                    onClose={() => setListInterviewsTarget(null)}
                />
            )}

            {referralTarget && (
                <ReferralModal
                    candidateId={referralTarget.candidateId}
                    candidateName={referralTarget.name}
                    onClose={() => setReferralTarget(null)}
                    onSuccess={() => { alert('Referral tagged successfully'); }}
                />
            )}

            {consentTarget && (
                <ConsentModal
                    candidateId={consentTarget.candidateId}
                    candidateName={consentTarget.name}
                    onClose={() => setConsentTarget(null)}
                />
            )}

            {offerTarget && (
                <CreateOfferModal
                    applicationId={offerTarget.applicationId}
                    candidateId={offerTarget.candidateId}
                    candidateName={offerTarget.name}
                    onClose={() => setOfferTarget(null)}
                    onSuccess={() => { fetchApplications(); }}
                />
            )}

            {preboardingTarget && (
                <PreboardingModal
                    offerId={preboardingTarget.offerId}
                    candidateName={preboardingTarget.candidateName}
                    onClose={() => setPreboardingTarget(null)}
                />
            )}

            {onboardingTarget && (
                <OnboardingProfileModal
                    contractId={onboardingTarget.contractId}
                    candidateName={onboardingTarget.candidateName}
                    onClose={() => setOnboardingTarget(null)}
                    onSuccess={() => fetchApplications()}
                />
            )}
        </Card>
    );
}
