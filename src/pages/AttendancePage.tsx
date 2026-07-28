import { useEffect, useState } from 'react';
import { Check, X, Clock, Download } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  present: { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  absent: { icon: X, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  late: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  excused: { icon: Check, color: 'text-sky-500', bg: 'bg-sky-50 border-sky-200' },
};

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.query('classes', { limit: '100' }).then(setClasses);
    db.query('students', { status: 'eq.active', order: 'last_name.asc', limit: '500' }).then(setStudents);
  }, []);

  const classStudents = selectedClass ? students.filter(s => s.class_id === parseInt(selectedClass)) : students;

  useEffect(() => {
    if (!date) return;
    const params: any = { date: `eq.${date}`, limit: '500' };
    if (selectedClass) params.class_id = `eq.${selectedClass}`;
    db.query('attendance', params).then(records => {
      setExistingRecords(records);
      const map: Record<number, string> = {};
      records.forEach((r: any) => { map[r.student_id] = r.status; });
      setAttendance(map);
    });
  }, [date, selectedClass]);

  const setStatus = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    const classId = selectedClass ? parseInt(selectedClass) : null;

    for (const student of classStudents) {
      const status = attendance[student._row_id] || 'present';
      const existing = existingRecords.find(r => r.student_id === student._row_id);
      if (existing) {
        await db.update('attendance', { _row_id: `eq.${existing._row_id}` }, { status });
      } else {
        await db.insert('attendance', { student_id: student._row_id, class_id: classId || student.class_id || 0, date, status });
      }
    }
    toast.success('Attendance saved!');
    setSaving(false);
  };

  const exportAttendance = () => {
    const data = classStudents.map(s => ({
      name: `${s.first_name} ${s.last_name}`,
      date,
      status: attendance[s._row_id] || 'not marked',
    }));
    exportToCSV(data, `attendance-${date}`);
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Track daily student attendance">
        <Button variant="outline" size="sm" onClick={exportAttendance}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
        <Button size="sm" onClick={saveAttendance} disabled={saving || classStudents.length === 0}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
        <Select value={selectedClass || 'all'} onValueChange={v => setSelectedClass(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c._row_id} value={c._row_id.toString()}>{c.name} {c.section || ''}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classStudents.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  {selectedClass ? 'No students in this class' : 'No active students. Add students first.'}
                </td></tr>
              ) : classStudents.map(s => {
                const currentStatus = attendance[s._row_id] || '';
                return (
                  <tr key={s._row_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {Object.entries(statusConfig).map(([key, cfg]) => {
                          const Icon = cfg.icon;
                          const active = currentStatus === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setStatus(s._row_id, key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                                active ? `${cfg.bg} ${cfg.color} border-current` : 'bg-white text-muted-foreground border-border hover:border-muted-foreground/30'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline capitalize">{key}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
