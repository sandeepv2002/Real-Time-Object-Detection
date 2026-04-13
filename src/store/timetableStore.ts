import { create } from 'zustand';

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  maxHours: number;
}

interface Subject {
  id: string;
  name: string;
  type: 'theory' | 'lab';
  semester: number;
  duration: number;
  weeklyHours: number;
}

interface Period {
  startTime: string;
  endTime: string;
  duration: number;
}

interface TimeSlot {
  teacherId: string;
  subjectId: string;
  semester: number;
  day: string;
  periodIndex: number;
}

interface TimetableSettings {
  periodsPerDay: number;
  daysPerWeek: string[];
  periods: Period[];
}

interface TimetableState {
  settings: TimetableSettings;
  teachers: Teacher[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  selectedTeacher: string | null;
  selectedSubject: string | null;
  updateSettings: (settings: Partial<TimetableSettings>) => void;
  addTeacher: (teacher: Teacher) => void;
  addSubject: (subject: Subject) => void;
  setSelectedTeacher: (teacherId: string | null) => void;
  setSelectedSubject: (subjectId: string | null) => void;
  generateTimetable: () => void;
}

const defaultSettings: TimetableSettings = {
  periodsPerDay: 8,
  daysPerWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periods: []
};

export const useTimetableStore = create<TimetableState>((set, get) => ({
  settings: defaultSettings,
  teachers: [],
  subjects: [],
  timeSlots: [],
  selectedTeacher: null,
  selectedSubject: null,

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  addTeacher: (teacher) => set((state) => ({
    teachers: [...state.teachers, teacher]
  })),

  addSubject: (subject) => set((state) => ({
    subjects: [...state.subjects, subject]
  })),

  setSelectedTeacher: (teacherId) => set({ selectedTeacher: teacherId }),

  setSelectedSubject: (subjectId) => set({ selectedSubject: subjectId }),

  generateTimetable: () => {
    const state = get();
    const timeSlots: TimeSlot[] = [];

    // Simple timetable generation algorithm
    state.subjects.forEach(subject => {
      const teacher = state.teachers.find(t => t.subjects.includes(subject.id));
      if (!teacher) return;

      let assignedHours = 0;
      let dayIndex = 0;
      let periodIndex = 0;

      while (assignedHours < subject.weeklyHours) {
        const day = state.settings.daysPerWeek[dayIndex];
        
        // Check if slot is available
        const isSlotTaken = timeSlots.some(slot => 
          slot.day === day && 
          slot.periodIndex === periodIndex &&
          (slot.teacherId === teacher.id || slot.semester === subject.semester)
        );

        if (!isSlotTaken) {
          timeSlots.push({
            teacherId: teacher.id,
            subjectId: subject.id,
            semester: subject.semester,
            day,
            periodIndex
          });
          assignedHours++;
        }

        periodIndex++;
        if (periodIndex >= state.settings.periodsPerDay) {
          periodIndex = 0;
          dayIndex++;
          if (dayIndex >= state.settings.daysPerWeek.length) {
            dayIndex = 0;
          }
        }
      }
    });

    set({ timeSlots });
  }
}));