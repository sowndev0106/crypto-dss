export function SkeletonSignalCard() {
    return (
        <div className="signal-card">
            {/* Gauge circle skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div
                    className="skeleton animate-skeleton"
                    style={{ width: 200, height: 200, borderRadius: '50%' }}
                />
            </div>

            {/* Signal type skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div
                    className="skeleton animate-skeleton"
                    style={{ width: 120, height: 48, borderRadius: 6 }}
                />
            </div>

            {/* Rule vs AI comparison skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="skeleton animate-skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
                    <div className="skeleton animate-skeleton" style={{ width: 48, height: 20, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="skeleton animate-skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
                    <div className="skeleton animate-skeleton" style={{ width: 48, height: 20, borderRadius: 4 }} />
                </div>
            </div>

            {/* Reasoning skeleton */}
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton animate-skeleton" style={{ width: '100%', height: 10, borderRadius: 4 }} />
                <div className="skeleton animate-skeleton" style={{ width: '85%', height: 10, borderRadius: 4 }} />
                <div className="skeleton animate-skeleton" style={{ width: '70%', height: 10, borderRadius: 4 }} />
            </div>

            {/* Button skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="skeleton animate-skeleton" style={{ width: 140, height: 34, borderRadius: 4 }} />
            </div>
        </div>
    );
}
