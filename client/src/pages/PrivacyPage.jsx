import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h2>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Privacy Policy</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>Last Updated: April 2024</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Your privacy matters to us. This policy explains how we handle your data.</p>
        </div>

        <div className="card">
          <Section title="1. Information We Collect">
            <p><strong style={{ color: 'var(--text-primary)' }}>Personal Information:</strong></p>
            <p>• Full name, username, mobile number, email address</p>
            <p>• Date of birth (for age verification)</p>
            <p>• UPI ID (for withdrawals only)</p>
            <p style={{ marginTop: 8 }}><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong></p>
            <p>• Contest participation history and quiz results</p>
            <p>• Transaction history (deposits, withdrawals, winnings)</p>
            <p>• Device type and app usage patterns</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>• To create and maintain your account.</p>
            <p>• To process deposits, withdrawals, and prize distributions.</p>
            <p>• To verify your identity and prevent fraud.</p>
            <p>• To send important account and contest notifications via email.</p>
            <p>• To improve our platform features and user experience.</p>
            <p>• To comply with legal obligations under Indian law.</p>
          </Section>

          <Section title="3. Data Sharing">
            <p>We do <strong style={{ color: 'var(--text-primary)' }}>NOT</strong> sell, trade, or rent your personal information to third parties.</p>
            <p style={{ marginTop: 8 }}>We may share data only in these cases:</p>
            <p>• With payment processors to facilitate UPI transactions.</p>
            <p>• With law enforcement if legally required.</p>
            <p>• With service providers (email, cloud storage) under strict confidentiality agreements.</p>
          </Section>

          <Section title="4. Data Security">
            <p>• Passwords are encrypted using industry-standard bcrypt hashing.</p>
            <p>• All data is transmitted over HTTPS (SSL/TLS encrypted).</p>
            <p>• Database access is restricted and monitored.</p>
            <p>• We regularly audit our systems for vulnerabilities.</p>
            <p style={{ marginTop: 8 }}>No system is 100% secure. We encourage you to use a strong, unique password for your account.</p>
          </Section>

          <Section title="5. Data Retention">
            <p>• Active account data is retained as long as your account is active.</p>
            <p>• Transaction records are retained for 7 years as required by Indian financial regulations.</p>
            <p>• Deleted accounts have their personal data anonymized within 30 days.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <p>• Access the personal data we hold about you.</p>
            <p>• Request correction of inaccurate data.</p>
            <p>• Request deletion of your account and personal data.</p>
            <p>• Opt out of promotional communications (transaction emails cannot be opted out).</p>
            <p style={{ marginTop: 8 }}>To exercise these rights, contact us at <span style={{ color: 'var(--accent-cyan)' }}>support@bkbbquiz.com</span></p>
          </Section>

          <Section title="7. Cookies &amp; Tracking">
            BKBBQUIZ is a mobile web app that uses local storage to maintain your login session. We do not use tracking cookies or third-party advertising pixels.
          </Section>

          <Section title="8. Children's Privacy">
            Our platform is strictly for users 18 years and older. We do not knowingly collect data from minors. If we discover a minor has created an account, it will be immediately terminated.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of the platform constitutes acceptance.
          </Section>

          <Section title="10. Contact Us">
            For privacy-related concerns: <span style={{ color: 'var(--accent-cyan)' }}>privacy@bkbbquiz.com</span>
          </Section>
        </div>
      </div>
    </div>
  );
}
