'use client';

import { Suspense, useState } from 'react';
import { Button, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import OffboardingChecklist from '../components/OffboardingChecklist';
import styles from '../page.module.css';

function OffboardingPageContent() {
    const [terminationId, setTerminationId] = useState('');
    const [showChecklist, setShowChecklist] = useState(false);
    const [createNew, setCreateNew] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (terminationId.trim()) {
            setShowChecklist(true);
            setCreateNew(false);
        }
    };

    const handleCreateChecklist = async () => {
        if (!terminationId.trim()) {
            alert('Enter a Termination ID first');
            return;
        }
        try {
            await recruitmentApi.createOffboardingChecklist(terminationId);
            alert('Offboarding checklist created!');
            setShowChecklist(true);
        } catch (e) {
            alert('Failed to create checklist (may already exist)');
            setShowChecklist(true); // Try to show existing
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Offboarding Management</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 0 2rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <Input
                            placeholder="Enter Termination ID"
                            value={terminationId}
                            onChange={(e) => { setTerminationId(e.target.value); setShowChecklist(false); }}
                        />
                        <Button type="submit" variant="primary">
                            View Checklist
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCreateChecklist}>
                            Create New
                        </Button>
                    </form>
                </div>

                {showChecklist && terminationId && (
                    <OffboardingChecklist
                        terminationId={terminationId}
                        onRefresh={() => setShowChecklist(true)}
                    />
                )}
            </div>
        </div>
    );
}

export default function OffboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OffboardingPageContent />
        </Suspense>
    );
}
