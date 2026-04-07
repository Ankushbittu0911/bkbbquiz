import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Terms &amp; Conditions</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600 }}>Last Updated: April 2024</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Please read these terms carefully before using BKBBQUIZ.</p>
        </div>

        <div className="card">
          <Section title="1. Acceptance of Terms">
            By accessing or using the BKBBQUIZ platform ("App"), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you may not use our services.
          </Section>

          <Section title="2. Eligibility">
            <p>• You must be at least 18 years old to participate in paid contests.</p>
            <p>• This platform is only available to users residing in India.</p>
            <p>• You must have a valid UPI-enabled bank account to deposit or withdraw funds.</p>
            <p>• Multiple accounts per person are strictly prohibited.</p>
          </Section>

          <Section title="3. Nature of the Platform">
            <p>BKBBQUIZ is a skill-based quiz contest platform. Winners are selected randomly from a pool of eligible participants who have completed their quiz. This is NOT gambling — it is a skill/luck-based contest.</p>
            <p style={{ marginTop: 8 }}>Participation is voluntary and users are aware of the entry fee before joining any contest.</p>
          </Section>

          <Section title="4. Deposits &amp; Withdrawals">
            <p>• Minimum deposit: ₹10 | Maximum deposit: ₹50,000 per transaction.</p>
            <p>• Deposits are credited after admin verification (usually within a few hours).</p>
            <p>• Withdrawals are processed only from winnings balance.</p>
            <p>• Minimum withdrawal: ₹100 | Maximum: ₹10,000 per request.</p>
            <p>• Withdrawal processing time: up to 24–48 business hours.</p>
            <p>• Deposit balances are non-refundable once used to join a contest.</p>
          </Section>

          <Section title="5. Contest Rules">
            <p>• Entry fees are deducted immediately upon joining a contest.</p>
            <p>• Once a quiz has started, the entry fee is non-refundable.</p>
            <p>• Each user may participate in a contest once per account.</p>
            <p>• Winners are drawn randomly from users who completed the quiz.</p>
            <p>• Prize pool is distributed based on the declared prize structure.</p>
            <p>• BKBBQUIZ retains a platform fee from the total prize pool.</p>
          </Section>

          <Section title="6. Fair Play">
            <p>• Use of bots, scripts, or automated tools is strictly prohibited.</p>
            <p>• Creating fake accounts to manipulate contests will result in permanent ban.</p>
            <p>• BKBBQUIZ reserves the right to disqualify users suspected of cheating.</p>
            <p>• Winnings may be withheld pending investigation of suspicious activity.</p>
          </Section>

          <Section title="7. Account Termination">
            BKBBQUIZ reserves the right to suspend or permanently ban any account that violates these terms, engages in fraudulent activity, or is found to be operating multiple accounts. Banned accounts forfeit all remaining balances.
          </Section>

          <Section title="8. Limitation of Liability">
            BKBBQUIZ is not liable for any technical failures, payment delays, or losses incurred during platform use. We do not guarantee winnings and all contest results are final once declared.
          </Section>

          <Section title="9. Changes to Terms">
            We reserve the right to update these Terms &amp; Conditions at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
          </Section>

          <Section title="10. Contact">
            For any questions regarding these terms, contact us at: <span style={{ color: 'var(--accent-cyan)' }}>support@bkbbquiz.com</span>
          </Section>
        </div>
      </div>
    </div>
  );
}
