import { useEffect, useState } from 'react';
import { Plus, Search, Download, Trash2, Edit, X } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', guardian_name: '', guardian_email: '', guardian_phone: '', class_id: '', status: 'active' });

  const load = async () => {
    const [s, c] = await Promise.all([
      db.query('students', { order: 'last_name.asc', limit: '200' }),
      db.query('classes', { limit: '100' }),
    ]);
    setStudents(s);
    setClasses(c);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', guardian_name: '', guardian_email: '', guardian_phone: '', class_id: '', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      first_name: s.first_name, last_name: s.last_name, email: s.email || '',
      phone: s.phone || '', date_of_birth: s.date_of_birth || '', gender: s.gender || '',
      guardian_name: s.guardian_name || '', guardian_email: s.guardian_email || '',
      guardian_phone: s.guardian_phone || '', class_id: s.class_id?.toString() || '', status: s.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const data = { ...form, class_id: form.class_id ? parseInt(form.class_id) : null };
    if (editing) {
      await db.update('students', { _row_id: `eq.${editing._row_id}` }, data);
      toast.success('Student updated');
    } else {
      await db.insert('students', data);
      toast.success('Student added');
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this student?')) return;
    await db.delete('students', { _row_id: `eq.${id}` });
    toast.success('Student deleted');
    load();
  };

  const getClassName = (classId: number | null) => {
    if (!classId) return '—';
    const c = classes.find(cl => cl._row_id === classId);
    return c ? `${c.name} ${c.section || ''}`.trim() : '—';
  };

  return (
    <div>
      <PageHeader title="Students" description="Manage student information and enrollment">
        <Button variant="outline" size="sm" onClick={() => exportToCSV(students, 'students')}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </PageHeader>

      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Class</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Guardian</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s._row_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{getClassName(s.class_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.guardian_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(s._row_id)} className="p-1.5 rounded hover:bg-red-50 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="mt-1" /></div>
            <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" /></div>
            <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="mt-1" /></div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={form.class_id} onValueChange={v => setForm({...form, class_id: v})}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c._row_id} value={c._row_id.toString()}>{c.name} {c.section || ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 border-t pt-3 mt-1"><p className="text-xs font-semibold text-muted-foreground mb-2">Guardian Information</p></div>
            <div><Label>Guardian Name</Label><Input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} className="mt-1" /></div>
            <div><Label>Guardian Email</Label><Input value={form.guardian_email} onChange={e => setForm({...form, guardian_email: e.target.value})} className="mt-1" /></div>
            <div><Label>Guardian Phone</Label><Input value={form.guardian_phone} onChange={e => setForm({...form, guardian_phone: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.first_name || !form.last_name}>{editing ? 'Update' : 'Add'} Student</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
