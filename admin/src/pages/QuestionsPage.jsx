import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CATEGORIES = ['Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const emptyForm = { text: '', options: ['', '', '', ''], correctAnswer: 0, category: 'Cricket', difficulty: 'medium', points: 10 };

// Parse CSV text into question objects
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const questions = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      // Handle commas inside quotes
      const cols = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const clean = cols.map(c => c.replace(/^"|"$/g, '').trim());

      const get = (name) => {
        const idx = headers.indexOf(name);
        return idx >= 0 ? clean[idx] || '' : '';
      };

      const text = get('question') || get('text');
      const optA = get('option_a') || get('option a') || get('a') || get('option1');
      const optB = get('option_b') || get('option b') || get('b') || get('option2');
      const optC = get('option_c') || get('option c') || get('c') || get('option3');
      const optD = get('option_d') || get('option d') || get('d') || get('option4');
      const correct = (get('correct_answer') || get('correct') || get('answer') || '0').toLowerCase().trim();
      const category = get('category') || 'GK';
      const difficulty = get('difficulty') || 'medium';
      const points = parseInt(get('points') || '10') || 10;

      if (!text) { errors.push(`Row ${i + 1}: Missing question text`); continue; }
      if (!optA || !optB || !optC || !optD) { errors.push(`Row ${i + 1}: All 4 options required`); continue; }

      // Correct answer: accept 0-3, A-D, or the actual option text
      let correctAnswer = 0;
      if (correct === 'a' || correct === '0') correctAnswer = 0;
      else if (correct === 'b' || correct === '1') correctAnswer = 1;
      else if (correct === 'c' || correct === '2') correctAnswer = 2;
      else if (correct === 'd' || correct === '3') correctAnswer = 3;
      else correctAnswer = parseInt(correct) || 0;

      const validCategory = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase()) || 'GK';
      const validDifficulty = DIFFICULTIES.includes(difficulty.toLowerCase()) ? difficulty.toLowerCase() : 'medium';

      questions.push({ text, options: [optA, optB, optC, optD], correctAnswer, category: validCategory, difficulty: validDifficulty, points, isActive: true });
    } catch (e) {
      errors.push(`Row ${i + 1}: Parse error - ${e.message}`);
    }
  }
  return { questions, errors };
}

// Download CSV template
function downloadTemplate() {
  const header = 'question,option_a,option_b,option_c,option_d,correct_answer,category,difficulty,points';
  const rows = [
    '"How many players are in a cricket team?","11","10","12","9","A","Cricket","easy","10"',
    '"Which country won the 2023 ODI World Cup?","Australia","India","England","Pakistan","A","Cricket","medium","10"',
    '"Who is known as the King of Football?","Pele","Messi","Ronaldo","Maradona","A","Football","easy","10"',
  ];
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bkbbquiz_questions_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuestionsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editQ, setEditQ] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [catFilter, setCatFilter] = useState('');

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkTab, setBulkTab] = useState('csv'); // 'csv' | 'json'
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', catFilter],
    queryFn: () => api.get('/admin/questions', { params: catFilter ? { category: catFilter } : {} }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editQ ? api.put(`/admin/questions/${editQ._id}`, data) : api.post('/admin/questions', data),
    onSuccess: () => { toast.success(editQ ? 'Updated' : 'Created'); qc.invalidateQueries(['admin-questions']); setShowModal(false); setForm(emptyForm); setEditQ(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/questions/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['admin-questions']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const bulkMutation = useMutation({
    mutationFn: (questions) => api.post('/admin/questions/bulk', { questions }),
    onSuccess: ({ data }) => {
      toast.success(`✅ ${data.count} questions imported successfully!`);
      qc.invalidateQueries(['admin-questions']);
      setShowBulkModal(false);
      resetBulk();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Bulk import failed'),
  });

  const openEdit = (q) => {
    setEditQ(q);
    setForm({ text: q.text, options: [...q.options], correctAnswer: q.correctAnswer, category: q.category, difficulty: q.difficulty, points: q.points });
    setShowModal(true);
  };

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const resetBulk = () => {
    setBulkFile(null);
    setBulkPreview([]);
    setBulkErrors([]);
    setJsonText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { questions, errors } = parseCSV(ev.target.result);
        setBulkPreview(questions);
        setBulkErrors(errors);
      } catch (err) {
        toast.error('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonParse = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const arr = Array.isArray(parsed) ? parsed : parsed.questions || [];
      if (!arr.length) return toast.error('No questions found in JSON');
      setBulkPreview(arr);
      setBulkErrors([]);
      toast.success(`Parsed ${arr.length} questions from JSON`);
    } catch (e) {
      toast.error('Invalid JSON: ' + e.message);
    }
  };

  const handleBulkSubmit = () => {
    if (!bulkPreview.length) return toast.error('No valid questions to import');
    if (!confirm(`Import ${bulkPreview.length} questions?`)) return;
    bulkMutation.mutate(bulkPreview);
  };

  const questions = data?.questions || [];
  const categoryCounts = data?.categoryCounts || [];

  return (
    <div style={{ padding: 24 }} className="fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Questions</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data?.total || 0} questions in database</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => { resetBulk(); setShowBulkModal(true); }}>
            <Upload size={15} /> Bulk Upload
          </button>
          <button className="btn-primary" onClick={() => { setEditQ(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus size={15} /> Add Question
          </button>
        </div>
      </div>

      {/* Category count pills */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
        <button onClick={() => setCatFilter('')} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: !catFilter ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)', color: !catFilter ? '#fff' : 'var(--text-muted)' }}>
          All ({data?.total || 0})
        </button>
        {categoryCounts.map(({ _id, count }) => (
          <button key={_id} onClick={() => setCatFilter(_id)} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: catFilter === _id ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)', color: catFilter === _id ? '#fff' : 'var(--text-muted)' }}>
            {_id} ({count})
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Category</th><th>Difficulty</th><th>Points</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="shimmer" style={{ height: 14, borderRadius: 4 }} /></td></tr>)
              ) : questions.map((q, i) => (
                <tr key={q._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                  <td style={{ maxWidth: 350 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 2 }}>✓ {q.options[q.correctAnswer]}</div>
                  </td>
                  <td><span className="badge badge-cyan">{q.category}</span></td>
                  <td><span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-orange'}`}>{q.difficulty}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{q.points}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(q)} className="btn-secondary" style={{ padding: '5px 9px' }}><Edit size={13} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(q._id); }} className="btn-danger" style={{ padding: '5px 9px' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Question Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>{editQ ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Question Text *</label>
                <textarea className="input-field" placeholder="Enter question..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {OPTION_LABELS.map((label, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: i === form.correctAnswer ? 'var(--accent-green)' : 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Option {label} {i === form.correctAnswer ? '✓ Correct' : ''}
                    </label>
                    <input className="input-field" style={{ borderColor: i === form.correctAnswer ? 'rgba(16,185,129,0.5)' : 'var(--border)' }} placeholder={`Option ${label}`} value={form.options[i]} onChange={(e) => setOption(i, e.target.value)} required />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Correct Answer *</label>
                <div className="flex gap-2">
                  {OPTION_LABELS.map((label, i) => (
                    <button key={i} type="button" onClick={() => setForm({ ...form, correctAnswer: i })} style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: form.correctAnswer === i ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: form.correctAnswer === i ? 'var(--accent-green)' : 'var(--text-muted)',
                      outline: form.correctAnswer === i ? '1px solid rgba(16,185,129,0.5)' : 'none',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Category</label>
                  <select className="select-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Difficulty</label>
                  <select className="select-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Points</label>
                  <input type="number" className="input-field" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} min={1} />
                </div>
              </div>
              <div className="flex gap-3" style={{ marginTop: 4 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <span className="spinner" /> : editQ ? 'Save' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div className="modal" style={{ maxWidth: 720, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>Bulk Upload Questions</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Import questions via CSV file or JSON</p>
              </div>
              <button onClick={() => { setShowBulkModal(false); resetBulk(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2" style={{ marginBottom: 16 }}>
              {['csv', 'json'].map(tab => (
                <button key={tab} onClick={() => { setBulkTab(tab); resetBulk(); }} style={{
                  padding: '6px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: bulkTab === tab ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))' : 'rgba(255,255,255,0.06)',
                  color: bulkTab === tab ? '#fff' : 'var(--text-muted)',
                }}>
                  {tab === 'csv' ? '📊 CSV Upload' : '{ } JSON Paste'}
                </button>
              ))}
            </div>

            {/* CSV Tab */}
            {bulkTab === 'csv' && (
              <div>
                {/* Download template */}
                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)' }}>📥 Download CSV Template</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Columns: question, option_a, option_b, option_c, option_d, correct_answer (A/B/C/D), category, difficulty, points
                    </p>
                  </div>
                  <button onClick={downloadTemplate} className="btn-secondary" style={{ flexShrink: 0, marginLeft: 12 }}>
                    <Download size={13} /> Template
                  </button>
                </div>

                {/* File upload zone */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: 28, borderRadius: 12, border: '2px dashed var(--border)',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.02)', marginBottom: 14,
                  transition: 'border-color 0.2s',
                }}>
                  <FileSpreadsheet size={32} style={{ color: 'var(--accent-cyan)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bulkFile ? bulkFile.name : 'Click to upload CSV file'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>.csv files only</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
              </div>
            )}

            {/* JSON Tab */}
            {bulkTab === 'json' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.04)', marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {`[{"text":"Q?","options":["A","B","C","D"],"correctAnswer":0,"category":"GK","difficulty":"medium","points":10}]`}
                </div>
                <textarea
                  className="input-field"
                  rows={8}
                  placeholder={'Paste JSON array of questions here...\n\nFormat:\n[\n  {\n    "text": "Question text",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": 0,\n    "category": "Cricket",\n    "difficulty": "medium",\n    "points": 10\n  }\n]'}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <button className="btn-secondary" style={{ marginTop: 8 }} onClick={handleJsonParse}>
                  Parse JSON
                </button>
              </div>
            )}

            {/* Errors */}
            {bulkErrors.length > 0 && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 14 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                  <AlertCircle size={14} style={{ color: 'var(--accent-red)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-red)' }}>{bulkErrors.length} row(s) with errors (skipped)</span>
                </div>
                <div style={{ maxHeight: 80, overflowY: 'auto' }}>
                  {bulkErrors.map((e, i) => <p key={i} style={{ fontSize: 11, color: 'var(--accent-red)', marginBottom: 2 }}>• {e}</p>)}
                </div>
              </div>
            )}

            {/* Preview */}
            {bulkPreview.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                  <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>{bulkPreview.length} questions ready to import</span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>#</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>Question</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>Correct</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>Category</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.map((q, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '7px 12px', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '7px 12px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                          <td style={{ padding: '7px 12px', color: 'var(--accent-green)', fontWeight: 600 }}>{q.options[q.correctAnswer]}</td>
                          <td style={{ padding: '7px 12px' }}><span className="badge badge-cyan" style={{ fontSize: 10 }}>{q.category}</span></td>
                          <td style={{ padding: '7px 12px' }}><span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 10 }}>{q.difficulty}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowBulkModal(false); resetBulk(); }}>Cancel</button>
              <button
                className="btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
                onClick={handleBulkSubmit}
                disabled={!bulkPreview.length || bulkMutation.isPending}
              >
                {bulkMutation.isPending
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Importing...</>
                  : <><Upload size={15} /> Import {bulkPreview.length || ''} Questions</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
