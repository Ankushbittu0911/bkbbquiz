import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Timer, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function QuizPage() {
  const { contestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const ticketId = location.state?.ticketId;

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 min default
  const [startTime] = useState(Date.now());
  const timerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quiz-questions', contestId],
    queryFn: () => api.get(`/contests/${contestId}/questions`).then(r => r.data),
    onSuccess: (d) => { if (d.quizDuration) setTimeLeft(d.quizDuration); },
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => api.post(`/contests/${contestId}/submit`, data),
    onSuccess: ({ data }) => {
      clearInterval(timerRef.current);
      navigate(`/quiz/${contestId}/result`, { state: { ticket: data.ticket }, replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed'),
  });

  useEffect(() => {
    if (!data?.quizDuration) return;
    setTimeLeft(data.quizDuration);
  }, [data?.quizDuration]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [data]);

  const handleSubmit = (autoSubmit = false) => {
    if (!ticketId) {
      toast.error('Invalid session. Please rejoin.');
      navigate('/');
      return;
    }
    const questions = data?.questions || [];
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
    }));
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    submitMutation.mutate({ ticketId, answers, timeTaken });
  };

  if (!ticketId) {
    navigate('/');
    return null;
  }

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading questions...</p>
    </div>
  );

  const questions = data?.questions || [];
  const question = questions[currentQ];
  const totalQ = questions.length;
  const progressPct = ((currentQ + 1) / totalQ) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Quiz header */}
      <div style={{
        background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Question</span>
            <span style={{ fontSize: 14, fontWeight: 800, marginLeft: 6 }}>{currentQ + 1}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{totalQ}</span>
          </div>

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 10, border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(249,115,22,0.3)'}`,
            background: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
          }}>
            <Timer size={14} style={{ color: isUrgent ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
            <span style={{
              fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
              color: isUrgent ? 'var(--accent-red)' : 'var(--accent-orange)',
              animation: isUrgent ? 'pulse-glow 0.5s ease-in-out infinite' : 'none',
            }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent-orange), var(--accent-gold))',
            borderRadius: 4, transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>
        <div className="glass slide-up" style={{ borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {question?.text}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question?.options?.map((opt, i) => {
            const isSelected = selectedAnswers[question._id] === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedAnswers({ ...selectedAnswers, [question._id]: i })}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: 0,
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  borderRadius: 12, transition: 'all 0.15s ease',
                  border: `1.5px solid ${isSelected ? 'var(--accent-orange)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, fontWeight: 800, fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isSelected ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                  }}>
                    {optionLabels[i]}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {opt}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3" style={{ marginTop: 'auto', paddingTop: 24 }}>
          {currentQ > 0 && (
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setCurrentQ(q => q - 1)}>← Prev</button>
          )}
          {currentQ < totalQ - 1 ? (
            <button className="btn-primary" style={{ flex: 2 }} onClick={() => setCurrentQ(q => q + 1)}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)' }}
              onClick={() => handleSubmit(false)}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '✓ Submit Quiz'}
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 justify-center" style={{ marginTop: 16 }}>
          {questions.map((q, i) => (
            <button key={i} onClick={() => setCurrentQ(i)} style={{
              width: 26, height: 26, borderRadius: 6, fontSize: 10, fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: i === currentQ ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))'
                : selectedAnswers[q._id] !== undefined ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)',
              color: i === currentQ ? '#fff' : selectedAnswers[q._id] !== undefined ? '#10b981' : 'var(--text-muted)',
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
