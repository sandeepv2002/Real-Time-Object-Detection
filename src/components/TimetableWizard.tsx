import React, { useState } from 'react';
import { Clock, Users, BookOpen, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useTimetableStore } from '../store/timetableStore';

const steps = [
  { id: 'time', name: 'Time Settings', icon: Clock },
  { id: 'teachers', name: 'Teachers', icon: Users },
  { id: 'subjects', name: 'Subjects', icon: BookOpen },
  { id: 'timetable', name: 'Generate', icon: Calendar },
];

export const TimetableWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('time');
  const { 
    settings,
    teachers,
    subjects,
    updateSettings,
    addTeacher,
    addSubject,
    generateTimetable
  } = useTimetableStore();

  // Time Settings Form
  const [timeSettings, setTimeSettings] = useState({
    startTime: '09:00',
    endTime: '17:00',
    periodsPerDay: 8,
    periodDuration: 45,
    breakDuration: 15,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  // Teacher Form
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    department: '',
    maxHours: 30,
    preferences: {
      startTime: '09:00',
      endTime: '17:00',
      preferredDays: [] as string[]
    }
  });

  // Subject Form
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    type: 'theory',
    semester: 1,
    credits: 3,
    weeklyHours: 3,
    requiresLab: false,
    labHours: 0
  });

  const handleTimeSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(timeSettings);
    setCurrentStep('teachers');
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeacher({
      id: crypto.randomUUID(),
      ...teacherForm,
      subjects: []
    });
    setTeacherForm({
      name: '',
      department: '',
      maxHours: 30,
      preferences: {
        startTime: '09:00',
        endTime: '17:00',
        preferredDays: []
      }
    });
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      id: crypto.randomUUID(),
      ...subjectForm
    });
    setSubjectForm({
      code: '',
      name: '',
      type: 'theory',
      semester: 1,
      credits: 3,
      weeklyHours: 3,
      requiresLab: false,
      labHours: 0
    });
  };

  const handleGenerateTimetable = () => {
    generateTimetable();
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center justify-center">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={clsx(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative'
            )}>
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={clsx(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full',
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-blue-600 text-blue-600'
                  )}
                >
                  <step.icon className="h-6 w-6" />
                </button>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-6 w-full h-0.5 bg-gray-200" />
                )}
              </div>
              <div className="mt-2 text-center text-sm font-medium text-gray-900">
                {step.name}
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 'time' && (
          <form onSubmit={handleTimeSettingsSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Time Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={timeSettings.startTime}
                    onChange={(e) => setTimeSettings({ ...timeSettings, startTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={timeSettings.endTime}
                    onChange={(e) => setTimeSettings({ ...timeSettings, endTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Periods Per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={timeSettings.periodsPerDay}
                    onChange={(e) => setTimeSettings({ ...timeSettings, periodsPerDay: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Period Duration (minutes)</label>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    step="15"
                    value={timeSettings.periodDuration}
                    onChange={(e) => setTimeSettings({ ...timeSettings, periodDuration: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="5"
                    value={timeSettings.breakDuration}
                    onChange={(e) => setTimeSettings({ ...timeSettings, breakDuration: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={timeSettings.workingDays.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...timeSettings.workingDays, day]
                            : timeSettings.workingDays.filter(d => d !== day);
                          setTimeSettings({ ...timeSettings, workingDays: days });
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next: Add Teachers
              </button>
            </div>
          </form>
        )}

        {currentStep === 'teachers' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Add Teachers</h2>
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Hours per Week</label>
                  <input
                    type="number"
                    value={teacherForm.maxHours}
                    onChange={(e) => setTeacherForm({ ...teacherForm, maxHours: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Start Time</label>
                  <input
                    type="time"
                    value={teacherForm.preferences.startTime}
                    onChange={(e) => setTeacherForm({
                      ...teacherForm,
                      preferences: { ...teacherForm.preferences, startTime: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred End Time</label>
                  <input
                    type="time"
                    value={teacherForm.preferences.endTime}
                    onChange={(e) => setTeacherForm({
                      ...teacherForm,
                      preferences: { ...teacherForm.preferences, endTime: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Days</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSettings.workingDays.map(day => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={teacherForm.preferences.preferredDays.includes(day)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...teacherForm.preferences.preferredDays, day]
                              : teacherForm.preferences.preferredDays.filter(d => d !== day);
                            setTeacherForm({
                              ...teacherForm,
                              preferences: { ...teacherForm.preferences, preferredDays: days }
                            });
                          }}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('subjects')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Next: Add Subjects
                  </button>
                </div>
              </form>
            </div>

            {teachers.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Added Teachers</h3>
                <div className="divide-y divide-gray-200">
                  {teachers.map((teacher, index) => (
                    <div key={teacher.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{teacher.name}</h4>
                          <p className="text-sm text-gray-500">{teacher.department}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Max {teacher.maxHours} hrs/week
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'subjects' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Add Subjects</h2>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                    <input
                      type="text"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={subjectForm.type}
                      onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      value={subjectForm.semester}
                      onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weekly Hours</label>
                    <input
                      type="number"
                      min="1"
                      value={subjectForm.weeklyHours}
                      onChange={(e) => setSubjectForm({ ...subjectForm, weeklyHours: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={subjectForm.requiresLab}
                      onChange={(e) => setSubjectForm({ ...subjectForm, requiresLab: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Requires Lab</span>
                  </label>
                </div>
                {subjectForm.requiresLab && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lab Hours per Week</label>
                    <input
                      type="number"
                      min="1"
                      value={subjectForm.labHours}
                      onChange={(e) => setSubjectForm({ ...subjectForm, labHours: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('timetable')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Next: Generate Timetable
                  </button>
                </div>
              </form>
            </div>

            {subjects.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Added Subjects</h3>
                <div className="divide-y divide-gray-200">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                          <p className="text-sm text-gray-500">
                            {subject.code} • Semester {subject.semester} • {subject.type}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {subject.weeklyHours} hrs/week
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'timetable' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Generate Timetable</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have added:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{teachers.length} Teachers</li>
                  <li>{subjects.length} Subjects</li>
                  <li>{timeSettings.workingDays.length} Working Days</li>
                  <li>{timeSettings.periodsPerDay} Periods per Day</li>
                </ul>
                <div className="mt-6">
                  <button
                    onClick={handleGenerateTimetable}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Generate Timetable
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};