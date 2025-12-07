'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute';
import s from './page.module.css';
import Link from 'next/link';

export default function TimeManagementPage() {
    const pathname = usePathname();
    const href = `${pathname}/shifts`;
    return (
    <div className={s.container}>
        <div className={s.glow}></div>
        <div className={s.glow} style={{ top: "200px", right: "-100px", background: "radial-gradient(circle, rgba(165, 255, 80, 0.2), transparent 70%)" }}></div>

        <Link href={href} className={s.button}>
            Shifts
        </Link>





        
    </div>
    





























    );
}