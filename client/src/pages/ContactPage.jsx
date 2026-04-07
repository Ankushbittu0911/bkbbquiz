import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock, HelpCircle, AlertCircle, Trophy } from 'lucide-react';

const ContactCard = ({ icon: Icon, color, title, value, sub, href }) => (
  <a
    href={href || '#'}
    onClick={href ? undefined : (e) => e.preventDefault()}
    style={{ textDecoration: 'none' }}
  >
    <div
      className="card"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
        cursor: href ? 'pointer' : 'default',
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => { if (href) e.currentTarget.style.transform = 'scale(1.01)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  </a>
);

const FaqItem = ({ q, a }) => (
  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>❓ {q}</p>
    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</p>
  </div>
);

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Contact Us</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Hero */}
        <div style={{ borderRadius: 16, padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' }}>
          <p style={{ fontSize: 28 }}>🏆</p>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>We're Here to Help</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Have a question or issue? Reach out to us and our team will respond as soon as possible.</p>
        </div>

        {/* Contact channels */}
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Get in Touch</p>

        <ContactCard
          icon={Mail}
          color="var(--accent-cyan)"
          title="Email Support"
          value="support@bkbbquiz.com"
          sub="We reply within 24 hours"
          href="mailto:support@bkbbquiz.com"
        />
        <ContactCard
          icon={MessageCircle}
          color="var(--accent-green)"
          title="WhatsApp"
          value="+91 99999 99999"
          sub="Mon–Sat, 10 AM – 7 PM IST"
          href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20BKBBQUIZ"
        />

        {/* Response times */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <Clock size={15} style={{ color: 'var(--accent-orange)' }} />
            <p style={{ fontSize: 13, fontWeight: 700 }}>Response Times</p>
          </div>
          {[
            { label: 'General Queries', time: 'Within 24 hours' },
            { label: 'Deposit Issues', time: 'Within 4–6 hours' },
            { label: 'Withdrawal Issues', time: 'Within 24–48 hours' },
            { label: 'Account Issues', time: 'Within 12 hours' },
          ].map(({ label, time }) => (
            <div key={label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold)' }}>{time}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <HelpCircle size={15} style={{ color: 'var(--accent-purple)' }} />
          <p style={{ fontSize: 13, fontWeight: 700 }}>Frequently Asked Questions</p>
        </div>
        <div className="card" style={{ marginBottom: 20 }}>
          <FaqItem
            q="My deposit is not credited. What should I do?"
            a="Deposits are verified manually. If your deposit hasn't been credited within 6 hours of submission, please contact us via email or WhatsApp with your UTR number and we'll resolve it immediately."
          />
          <FaqItem
            q="How long does withdrawal take?"
            a="Withdrawals are processed within 24–48 working hours. Once approved, funds reach your UPI account instantly. If delayed beyond 48 hours, please contact support."
          />
          <FaqItem
            q="I joined a contest but it shows no ticket?"
            a="If the entry fee was deducted but no ticket was generated, please contact support immediately with your user ID and contest name. We'll investigate and resolve within 12 hours."
          />
          <FaqItem
            q="Can I get a refund if the contest is cancelled?"
            a="Yes. If a contest is cancelled by BKBBQUIZ, the full entry fee is refunded to your deposit balance within 24 hours."
          />
          <FaqItem
            q="How are winners selected?"
            a="Winners are selected randomly from all users who completed the quiz before the contest deadline. Every participant has an equal chance of winning regardless of score."
          />
          <FaqItem
            q="What is the minimum withdrawal amount?"
            a="The minimum withdrawal is ₹100, and only from your winnings balance. Deposit balance cannot be withdrawn — it can only be used to join contests."
          />
        </div>

        {/* Disclaimer */}
        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', gap: 10 }}>
          <AlertCircle size={14} style={{ color: 'var(--accent-red)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> BKBBQUIZ will never ask for your password or OTP. Do not share these with anyone calling on behalf of BKBBQUIZ. Beware of fraud.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
          🏆 BKBBQUIZ · Play Responsibly
        </p>
      </div>
    </div>
  );
}
