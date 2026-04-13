import React, { useState } from 'react';
import { Download, FileSpreadsheet, File as FilePdf, Plus, Clock, UserPlus, BookOpen } from 'lucide-react';
import { useTimetableStore } from '../store/timetableStore';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Teacher, Subject } from '../types';

export const Controls: React.FC = () => {
  const { 
    teachers, 
    subjects, 
    settings,
    setSelectedTeacher, 
    setSelectedSubject,
    addTeacher,
    addSubject,
    updateSettings
  } = useTimetableStore();

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);

  // Teacher form state
  const [teacherName, setTeacherName] = useState('');
  const [maxHours, setMaxHours] = useState(40);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Subject form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectType, setSubjectType] = useState<'theory' | 'lab'>('theory');
  const [semester, setSemester] = useState(1);
  const [duration, setDuration] = useState(45);
  const [weeklyHours, setWeeklyHours] = useState(4);

  // Time settings form state
  const [periodsPerDay, setPeriodsPerDay] = useState(settings.periodsPerDay);
  const [startTime, setStartTime] = useState('09:00');
  const [periodDuration, setPeriodDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(15);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name: teacherName,
      subjects: selectedSubjects,
      maxHours
    };
    addTeacher(newTeacher);
    setTeacherName('');
    setMaxHours(40);
    setSelectedSubjects([]);
    setShowTeacherForm(false);
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectName,
      type: subjectType,
      semester,
      duration,
      weeklyHours
    };
    addSubject(newSubject);
    setSubjectName('');
    setSubjectType('theory');
    setSemester(1);
    setDuration(45);
    setWeeklyHours(4);
    setShowSubjectForm(false);
  };

  const handleTimeSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [startHour, startMinute] = startTime.split(':').map(Number);
    
    const periods = Array(periodsPerDay).fill(null).map((_, i) => {
      const totalMinutes = i * (periodDuration + breakDuration);
      const periodStartMinutes = startHour * 60 + startMinute + totalMinutes;
      const periodEndMinutes = periodStartMinutes + periodDuration;
      
      const startTimeStr = `${Math.floor(periodStartMinutes / 60).toString().padStart(2, '0')}:${(periodStartMinutes % 60).toString().padStart(2, '0')}`;
      const endTimeStr = `${Math.floor(periodEndMinutes / 60).toString().padStart(2, '0')}:${(periodEndMinutes % 60).toString().padStart(2, '0')}`;
      
      return {
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: periodDuration
      };
    });

    updateSettings({ periodsPerDay, periods });
    setShowTimeForm(false);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, "timetable.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Timetable", 10, 10);
    doc.save("timetable.pdf");
  };

  // Get unique semesters from subjects
  const semesters = Array.from(new Set(subjects.map(s => s.semester))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded"
            onChange={(e) => setSelectedTeacher(e.target.value || null)}
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            onChange={(e) => setSelectedSubject(e.target.value || null)}
          >
            <option value="">All Subjects</option>
            {semesters.map(sem => (
              <optgroup key={sem} label={`Semester ${sem}`}>
                {subjects
                  .filter(s => s.semester === sem)
                  .map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTeacherForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <UserPlus size={20} />
            Add Teacher
          </button>

          <button
            onClick={() => setShowSubjectForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <BookOpen size={20} />
            Add Subject
          </button>

          <button
            onClick={() => setShowTimeForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            <Clock size={20} />
            Time Settings
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FileSpreadsheet size={20} />
            Export to Excel
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FilePdf size={20} />
            Export to PDF
          </button>
        </div>
      </div>

      {showTeacherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleTeacherSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Hours per Week</label>
                <input
                  type="number"
                  value={maxHours}
                  onChange={(e) => setMaxHours(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subjects</label>
                <select
                  multiple
                  value={selectedSubjects}
                  onChange={(e) => setSelectedSubjects(Array.from(e.target.selectedOptions, option => option.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                >
                  {semesters.map(sem => (
                    <optgroup key={sem} label={`Semester ${sem}`}>
                      {subjects
                        .filter(s => s.semester === sem)
                        .map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTeacherForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Teacher
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showSubjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleSubjectSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value as 'theory' | 'lab')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Hours</label>
                <input
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Subject
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showTimeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleTimeSettingsSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Time Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Periods Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Period Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  step="15"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Break Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="5"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTimeForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};