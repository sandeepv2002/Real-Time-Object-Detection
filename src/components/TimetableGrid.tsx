import React from 'react';
import { useTimetableStore } from '../store/timetableStore';

export const TimetableGrid: React.FC = () => {
  const { settings, timeSlots, teachers, subjects, selectedTeacher, selectedSubject } = useTimetableStore();

  const getSlotContent = (day: string, periodIndex: number) => {
    const slot = timeSlots.find(s => 
      s.day === day && 
      s.periodIndex === periodIndex &&
      (!selectedTeacher || s.teacherId === selectedTeacher) &&
      (!selectedSubject || s.subjectId === selectedSubject)
    );

    if (!slot) return null;

    const subject = subjects.find(s => s.id === slot.subjectId);
    const teacher = teachers.find(t => t.id === slot.teacherId);

    const isBreak = subject?.type === 'break';
    const isLab = subject?.type === 'lab';

    return (
      <div className={`p-2 rounded ${isBreak ? 'bg-gray-100' : isLab ? 'bg-purple-100' : 'bg-blue-100'}`}>
        <div className="font-semibold">{subject?.name}</div>
        {!isBreak && (
          <div className="text-sm text-gray-600">
            {teacher?.name} • Sem {slot.semester}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Time</th>
            {settings.daysPerWeek.map(day => (
              <th key={day} className="border p-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {settings.periods.map((period, index) => (
            <tr key={index}>
              <td className="border p-2 whitespace-nowrap">
                {period.startTime} - {period.endTime}
              </td>
              {settings.daysPerWeek.map(day => (
                <td key={day} className="border p-2 min-w-[200px] h-[100px]">
                  {getSlotContent(day, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};