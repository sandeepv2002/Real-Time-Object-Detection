export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  maxHours: number;
}

export interface Subject {
  id: string;
  name: string;
  type: 'theory' | 'lab';
  semester: number;
  duration: number;
  weeklyHours: number;
}

export interface Period {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface TimeSlot {
  teacherId: string;
  subjectId: string;
  semester: number;
  day: string;
  periodIndex: number;
}

export interface TimetableSettings {
  periodsPerDay: number;
  daysPerWeek: string[];
  periods: Period[];
}