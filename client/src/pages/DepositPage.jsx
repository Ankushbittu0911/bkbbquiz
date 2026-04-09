import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, QrCode, Copy, CheckCheck, Info, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 50000;

// Detect iPhone/iPad running Safari (not Chrome/Firefox)
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isSafari = isIOS && /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/i.test(navigator.userAgent);

export default function DepositPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings/public').then(r => r.data),
  });

  const settings = settingsData?.settings || { merchantUpiId: 'bkbbquiz@upi', merchantName: 'BKBBQUIZ' };
  const upiId = settings.merchantUpiId;
  const merchantName = settings.merchantName;

  // UPI deep link
  const amountNum = parseFloat(amount) || 0;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`;

  const PRESETS = [50, 100, 200, 500, 1000, 2000];

  const depositMutation = useMutation({
    mutationFn: (formData) => api.post('/deposits', formData),
    onSuccess: () => {
      toast.success('Deposit request submitted! Admin will approve shortly.');
      qc.invalidateQueries(['wallet']);
      navigate('/wallet');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amountNum <= 0) return toast.error('Enter a valid amount');
    if (amountNum < MIN_AMOUNT) return toast.error(`Minimum deposit amount is ₹${MIN_AMOUNT}`);
    if (amountNum > MAX_AMOUNT) return toast.error(`Maximum deposit amount is ₹${MAX_AMOUNT.toLocaleString('en-IN')}`);
    if (!txId.trim()) return toast.error('Enter UTR / Transaction ID');
    if (txId.trim().length !== 12) return toast.error('UTR number must be exactly 12 digits');
    depositMutation.mutate({ amount, transactionId: txId.trim(), upiId });
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID copied!');
  };

  return (
    <div className="page pb-nav fade-in">
      <div className="header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Add Money</h1>
        </div>
      </div>

      {/* iOS Safari warning */}
      {isSafari && (
        <div style={{
          margin: '0 16px',
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'rgba(234,179,8,0.12)',
          border: '1px solid rgba(234,179,8,0.4)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <AlertTriangle size={16} style={{ color: '#eab308', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#fef08a', lineHeight: 1.6, margin: 0 }}>
            <strong>iPhone users:</strong> Safari does not support opening UPI apps (GPay, PhonePe, etc.).
            Please open this page in <strong>Chrome</strong> for UPI payments to work.
          </p>
        </div>
      )}

      <div style={{ padding: 16 }}>
        {/* Amount selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Enter Amount (₹)</label>
          <div className="relative" style={{ marginBottom: 6 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)' }}>₹</span>
            <input
              type="number"
              className="input-field"
              style={{ paddingLeft: 36, fontSize: 20, fontWeight: 800 }}
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') { setAmount(''); return; }
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  if (num > MAX_AMOUNT) setAmount(String(MAX_AMOUNT));
                  else setAmount(String(num));
                }
              }}
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
            />
          </div>
          <p style={{ fontSize: 11, color: amountNum > 0 && (amountNum < MIN_AMOUNT || amountNum > MAX_AMOUNT) ? '#f87171' : 'var(--text-muted)', marginBottom: 12 }}>
            Min ₹{MIN_AMOUNT} &nbsp;·&nbsp; Max ₹{MAX_AMOUNT.toLocaleString('en-IN')}
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(String(p))} style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${amount == p ? 'var(--accent-orange)' : 'var(--border)'}`,
                background: amount == p ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
                color: amount == p ? 'var(--accent-orange)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}>₹{p}</button>
            ))}
          </div>
        </div>

        {/* QR Code & UPI */}
        {amountNum >= MIN_AMOUNT && amountNum <= MAX_AMOUNT && (
          <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>Scan QR or pay with your UPI app</p>

            {/* QR Code */}
            <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12, marginBottom: 12 }}>
              <QRCodeSVG value={upiLink} size={160} />
            </div>

            {/* UPI ID Row */}
            <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
              <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)', padding: '4px 12px', background: 'rgba(6,182,212,0.1)', borderRadius: 8 }}>{upiId}</code>
              <button onClick={copyUpi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {copied ? <CheckCheck size={16} style={{ color: 'var(--accent-green)' }} /> : <Copy size={16} />}
              </button>
            </div>

            {/* UPI App Buttons — works on Android & iOS */}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Tap to open your UPI app:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                {
                  name: 'Google Pay',
                  emoji: '🟢',
                  // Android: tez://upi/pay, iOS: gpay://upi/pay
                  getLink: () => /iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`
                    : `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`,
                },
                {
                  name: 'PhonePe',
                  emoji: '🟣',
                  getLink: () => `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`,
                },
                {
                  name: 'Paytm',
                  emoji: '🔵',
                  getLink: () => `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`,
                },
                {
                  name: 'BHIM',
                  emoji: '🟠',
                  getLink: () => `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=BKBBQUIZ+Deposit`,
                },
              ].map((app) => (
                <button
                  key={app.name}
                  onClick={() => { window.location.href = app.getLink(); }}
                  style={{
                    padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{app.emoji}</span> {app.name}
                </button>
              ))}
            </div>

            {/* Generic fallback for Android */}
            <button
              onClick={() => { window.location.href = upiLink; }}
              className="btn-primary"
              style={{ width: '100%', marginBottom: 4 }}
            >
              <QrCode size={15} /> Open Any UPI App
            </button>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
              💡 On iPhone: install the app first, then tap its button above.
            </p>
          </div>
        )}


        {/* Info */}
        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: 16, display: 'flex', gap: 8 }}>
          <Info size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            After paying via UPI, enter the UTR / Transaction ID. Admin will approve your deposit within a few hours.
          </p>
        </div>

        {/* Proof form — UTR only */}
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>UTR / Transaction ID *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter 12-digit UTR number"
              value={txId}
              onChange={(e) => setTxId(e.target.value.replace(/\D/g, '').slice(0, 12))}
              maxLength={12}
              inputMode="numeric"
              pattern="\d{12}"
              required
            />
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Find UTR in your UPI app under transaction history</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={depositMutation.isPending || !amount || !txId.trim()}>
            {depositMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Submit Deposit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
