import { Metadata } from 'next';
import UserAgentAnalyzer from '@/features/tools/user-agent/components/UserAgentAnalyzer';

export const metadata: Metadata = {
  title: 'User-Agent Parser & Analyzer | Deep Telemetry Inspector',
  description:
    'Comprehensive real-time User-Agent parser, bot detector, device fingerprint inspector, batch processor, and comparison tool.',
};

export default function UserAgentPage() {
  return <UserAgentAnalyzer />;
}