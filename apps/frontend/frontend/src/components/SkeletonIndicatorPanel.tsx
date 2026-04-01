export function SkeletonIndicatorPanel() {
    return (
        <div className="indicator-panel">
            {/* Skeleton tab buttons */}
            <div className="tab-list" style={{ gap: 4, padding: '0 8px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton animate-skeleton"
                        style={{ width: 72, height: 36, borderRadius: 4, margin: '8px 4px' }}
                    />
                ))}
            </div>

            {/* Skeleton rows */}
            <div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="indicator-row">
                        <div className="skeleton animate-skeleton" style={{ width: 80, height: 12, borderRadius: 4 }} />
                        <div className="skeleton animate-skeleton" style={{ width: 60, height: 12, borderRadius: 4 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
