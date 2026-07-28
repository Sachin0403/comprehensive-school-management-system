import { useEffect, useState } from 'react';
import { Plus, Download, Trash2, Edit } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function GradebookPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [form, setForm] = useState({ student_id: '', subject_id: '', assignment_name: '', score: '', max_score: '100', grade_type: 'assignment', term: 'Term 1', date: new Date().toISOString().split('T')[0], notes: '' });

  const load = async () => {
    const [g, s, sub] = await Promise.all([
      db.query('grades', { order: '_created_at.desc', limit: '200' }),
      db.query('students', { status: 'eq.active', order: 'last_name.asc', limit: '500' }),
      db.query('subjects', { limit: '100' }),
    ]);
    setGrades(g); setStudents(s); setSubjects(sub);
  };

  useEffect(() => { load(); }, []);

  const filtered = filterSubject ? grades.filter(g => g.subject_id === parseInt(filterSubject)) : grades;

  const getStudentName = (id: number) => { const s = students.find(st => st._row_id === id); return s ? `${s.first_name} ${s.last_name}` : '—'; };
  const getSubjectName = (id: number) => { const s = subjects.find(sub => sub._row_id === id); return s ? s.name : '—'; };

  const openNew = () => {
    setEditing(null);
    setForm({ student_id: '', subject_id: '', assignment_name: '', score: '', max_score: '100', grade_type: 'assignment', term: 'Term 1', date: new Date().toISOString().split('T')[0], notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (g: any) => {
    setEditing(g);
    setForm({
      student_id: g.student_id.toString(), subject_id: g.subject_id.toString(),
      assignment_name: g.assignment_name, score: g.score?.toString() || '', max_score: g.max_score.toString(),
      grade_type: g.grade_type, term: g.term, date: g.date, notes: g.notes || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const data = { ...form, student_id: parseInt(form.student_id), subject_id: parseInt(form.subject_id), score: parseFloat(form.score), max_score: parseFloat(form.max_score) };
    if (editing) {
      await db.update('grades', { _row_id: `eq.${editing._row_id}` }, data);
      toast.success('Grade updated');
    } else {
      await db.insert('grades', data);
      toast.success('Grade added');
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this grade?')) return;
    await db.delete('grades', { _row_id: `eq.${id}` });
    toast.success('Grade deleted');
    load();
  };

  const getPercent = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return { text: 'A', color: 'text-emerald-600 bg-emerald-50' };
    if (pct >= 80) return { text: 'B', color: 'text-sky-600 bg-sky-50' };
    if (pct >= 70) return { text: 'C', color: 'text-amber-600 bg-amber-50' };
    if (pct >= 60) return { text: 'D', color: 'text-orange-600 bg-orange-50' };
    return { text: 'F', color: 'text-red-600 bg-red-50' };
  };

  return (
    <div>
      <PageHeader title="Gradebook" description="Manage student grades and assessments">
        <Button variant="outline" size="sm" onClick={() => exportToCSV(grades.map(g => ({
          student: getStudentName(g.student_id), subject: getSubjectName(g.subject_id),
          assignment: g.assignment_name, score: g.score, max_score: g.max_score,
          percent: `${((g.score / g.max_score) * 100).toFixed(1)}%`, term: g.term, date: g.date,
        })), 'gradebook')}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Add Grade
        </Button>
      </PageHeader>

      <div className="mb-4">
        <Select value={filterSubject || 'all'} onValueChange={v => setFilterSubject(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Subjects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(s => <SelectItem key={s._row_id} value={s._row_id.toString()}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assignment</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Term</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No grades recorded yet</td></tr>
              ) : filtered.map(g => {
                const pct = getPercent(g.score, g.max_score);
                return (
                  <tr key={g._row_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{getStudentName(g.student_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getSubjectName(g.subject_id)}</td>
                    <td className="px-4 py-3">{g.assignment_name}</td>
                    <td className="px-4 py-3 text-center">{g.score}/{g.max_score}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pct.color}`}>{pct.text}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{g.term}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded hover:bg-muted"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(g._row_id)} className="p-1.5 rounded hover:bg-red-50 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Grade' : 'Add Grade'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Student *</Label>
              <Select value={form.student_id} onValueChange={v => setForm({...form, student_id: v})}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s._row_id} value={s._row_id.toString()}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select value={form.subject_id} onValueChange={v => setForm({...form, subject_id: v})}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s._row_id} value={s._row_id.toString()}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assignment Name *</Label><Input value={form.assignment_name} onChange={e => setForm({...form, assignment_name: e.target.value})} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Score *</Label><Input type="number" value={form.score} onChange={e => setForm({...form, score: e.target.value})} className="mt-1" /></div>
              <div><Label>Max Score</Label><Input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: e.target.value})} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.grade_type} onValueChange={v => setForm({...form, grade_type: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Term</Label>
                <Select value={form.term} onValueChange={v => setForm({...form, term: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.student_id || !form.subject_id || !form.assignment_name || !form.score}>
              {editing ? 'Update' : 'Add'} Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
