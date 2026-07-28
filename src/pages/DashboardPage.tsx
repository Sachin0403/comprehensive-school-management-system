import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, BookOpen, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
  const [stats, setStats] = useState({ students: 0, attendance: 0, grades: 0, messages: 0 });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [studentsArr, attendanceArr, gradesArr, messagesArr] = await Promise.all([
        db.query('students', { select: 'count' }),
        db.query('attendance', { select: 'count' }),
        db.query('grades', { select: 'count' }),
        db.query('messages', { select: 'count' }),
      ]);
      console.log('counts:', studentsArr, attendanceArr, gradesArr, messagesArr);
      const extract = (arr: any) => {
        if (typeof arr === 'number') return arr;
        if (Array.isArray(arr) && arr.length > 0) return arr[0].count ?? 0;
        return 0;
      };
      setStats({ students: extract(studentsArr), attendance: extract(attendanceArr), grades: extract(gradesArr), messages: extract(messagesArr) });
      const recent = await db.query('students', { order: '_created_at.desc', limit: '5' });
      setRecentStudents(recent);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your school at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} icon={Users} color="primary" />
        <StatCard label="Attendance Records" value={stats.attendance} icon={ClipboardCheck} color="success" />
        <StatCard label="Grade Entries" value={stats.grades} icon={BookOpen} color="warning" />
        <StatCard label="Messages" value={stats.messages} icon={MessageSquare} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Recently Added Students</h3>
          </div>
          <div className="divide-y">
            {recentStudents.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                No students yet. Add your first student to get started.
              </div>
            ) : (
              recentStudents.map((s) => (
                <div key={s._row_id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email || 'No email'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Add Student', path: '/students', icon: Users, color: 'bg-primary/10 text-primary' },
              { label: 'Take Attendance', path: '/attendance', icon: ClipboardCheck, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Enter Grades', path: '/gradebook', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
              { label: 'Send Message', path: '/messages', icon: MessageSquare, color: 'bg-sky-50 text-sky-600' },
            ].map((a) => (
              <a key={a.label} href={a.path} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent hover:border-border hover:shadow-sm transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
