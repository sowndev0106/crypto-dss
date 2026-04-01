import { SignalType } from 'shared-types';

interface Props { signal: SignalType | null; }

export function SignalBadge({ signal }: Props) {
    if (!signal) return <span className="signal-badge">—</span>;
    return (
        <span className={`signal-badge ${signal.toLowerCase()}`}>
            {signal}
        </span>
    );
}
