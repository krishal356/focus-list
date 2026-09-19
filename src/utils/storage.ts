/**
 * FocusList Local Storage Persistence Utility
 * Implements safe, defensive JSON serialization/deserialization for Tasks and Sticky Notes.
 */

import {
  Task,
  StickyNote,
  STORAGE_KEY,
  STICKY_STORAGE_KEY,
  PriorityLevel,
  WorkflowStatus,
  StickyColor
} from '../types/task.ts';

const VALID_PRIORITIES: readonly PriorityLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
const VALID_WORKFLOW_STATUSES: readonly WorkflowStatus[] = ['todo', 'in-progress', 'done'];
const VALID_STICKY_COLORS: readonly StickyColor[] = ['yellow', 'coral', 'mint', 'lavender'];

/**
 * Helper to get local date string in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Initial 3 demo tasks seeded ONLY when the storage key does not exist.
 * Uses dynamic today date so Today's List is always populated on evaluation.
 */
function createInitialDemoTasks(): Task[] {
  const today = getTodayDateString();
  const now = new Date().toISOString();

  return [
    {
      id: 'demo-task-1',
      title: 'Finish research literature review',
      completed: false,
      priority: 'HIGH',
      workflowStatus: 'in-progress',
      dueDate: today,
      dueTime: '18:00',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'demo-task-2',
      title: 'Prepare presentation slides',
      completed: false,
      priority: 'MEDIUM',
      workflowStatus: 'todo',
      dueDate: today,
      dueTime: '14:30',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'demo-task-3',
      title: 'Submit internship application',
      completed: true,
      priority: 'LOW',
      workflowStatus: 'done',
      dueDate: today,
      dueTime: '11:00',
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Initial 3 demo sticky notes seeded ONLY when the storage key does not exist.
 */
const INITIAL_DEMO_STICKY_NOTES: readonly StickyNote[] = [
  {
    id: 'demo-sticky-1',
    text: "Today's focus\nOne thing at a time ✦",
    color: 'coral',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-sticky-2',
    text: 'Remember\nTake short breaks.',
    color: 'mint',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-sticky-3',
    text: 'Little reminder\nProgress > perfection.',
    color: 'lavender',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_FLAG_TASKS = 'focuslist_tasks_seeded_v1';
const SEED_FLAG_STICKY = 'focuslist_sticky_seeded_v1';

/**
 * Safely loads and normalizes tasks from browser localStorage.
 */
export function loadTasksFromStorage(): Task[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createInitialDemoTasks();
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    const hasBeenSeeded = localStorage.getItem(SEED_FLAG_TASKS);

    // If key does not exist or first time seeding the updated task schema
    if (raw === null || (!hasBeenSeeded && raw === '[]')) {
      const demoTasks = createInitialDemoTasks();
      persistTasks(demoTasks);
      localStorage.setItem(SEED_FLAG_TASKS, 'true');
      return demoTasks;
    }

    localStorage.setItem(SEED_FLAG_TASKS, 'true');

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validTasks: Task[] = [];

    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'title' in item &&
        'completed' in item &&
        'priority' in item &&
        typeof (item as { id: unknown }).id === 'string' &&
        typeof (item as { title: unknown }).title === 'string' &&
        typeof (item as { completed: unknown }).completed === 'boolean' &&
        typeof (item as { priority: unknown }).priority === 'string'
      ) {
        const rawTask = item as {
          id: string;
          title: string;
          completed: boolean;
          priority: string;
          workflowStatus?: unknown;
          dueDate?: unknown;
          dueTime?: unknown;
          createdAt?: unknown;
          updatedAt?: unknown;
        };

        const trimmedTitle = rawTask.title.trim();
        if (trimmedTitle.length === 0) continue;

        const priority: PriorityLevel = VALID_PRIORITIES.includes(rawTask.priority as PriorityLevel)
          ? (rawTask.priority as PriorityLevel)
          : 'MEDIUM';

        let workflowStatus: WorkflowStatus;
        if (
          typeof rawTask.workflowStatus === 'string' &&
          VALID_WORKFLOW_STATUSES.includes(rawTask.workflowStatus as WorkflowStatus)
        ) {
          workflowStatus = rawTask.workflowStatus as WorkflowStatus;
        } else {
          workflowStatus = rawTask.completed ? 'done' : 'todo';
        }

        // Keep completion in sync with workflowStatus
        const completed =
          workflowStatus === 'done'
            ? true
            : workflowStatus === 'todo' || workflowStatus === 'in-progress'
              ? false
              : rawTask.completed;

        const dueDate =
          typeof rawTask.dueDate === 'string' && rawTask.dueDate.trim() !== ''
            ? rawTask.dueDate.trim()
            : undefined;

        const dueTime =
          typeof rawTask.dueTime === 'string' && rawTask.dueTime.trim() !== ''
            ? rawTask.dueTime.trim()
            : undefined;

        validTasks.push({
          id: rawTask.id,
          title: trimmedTitle,
          completed,
          priority,
          workflowStatus,
          dueDate,
          dueTime,
          createdAt: typeof rawTask.createdAt === 'string' ? rawTask.createdAt : new Date().toISOString(),
          updatedAt: typeof rawTask.updatedAt === 'string' ? rawTask.updatedAt : new Date().toISOString()
        });
      }
    }

    return validTasks;
  } catch (err) {
    console.warn('FocusList: Unable to load tasks from localStorage:', err);
    return [];
  }
}

/**
 * Safely persists tasks array to browser localStorage.
 */
export function persistTasks(tasks: readonly Task[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (err) {
    console.warn('FocusList: Unable to persist tasks to localStorage:', err);
  }
}

/**
 * Safely loads and normalizes sticky notes from browser localStorage.
 */
export function loadStickyNotesFromStorage(): StickyNote[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...INITIAL_DEMO_STICKY_NOTES];
    }

    const raw = localStorage.getItem(STICKY_STORAGE_KEY);
    const hasBeenSeeded = localStorage.getItem(SEED_FLAG_STICKY);

    // If key does not exist or first time seeding
    if (raw === null || (!hasBeenSeeded && raw === '[]')) {
      persistStickyNotes(INITIAL_DEMO_STICKY_NOTES);
      localStorage.setItem(SEED_FLAG_STICKY, 'true');
      return [...INITIAL_DEMO_STICKY_NOTES];
    }

    localStorage.setItem(SEED_FLAG_STICKY, 'true');

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validNotes: StickyNote[] = [];

    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'text' in item &&
        'color' in item &&
        typeof (item as { id: unknown }).id === 'string' &&
        typeof (item as { text: unknown }).text === 'string' &&
        typeof (item as { color: unknown }).color === 'string'
      ) {
        const rawNote = item as {
          id: string;
          text: string;
          color: string;
          createdAt?: unknown;
          updatedAt?: unknown;
        };

        const trimmedText = rawNote.text.trim();
        if (trimmedText.length === 0) continue;

        const color: StickyColor = VALID_STICKY_COLORS.includes(rawNote.color as StickyColor)
          ? (rawNote.color as StickyColor)
          : 'yellow';

        validNotes.push({
          id: rawNote.id,
          text: trimmedText,
          color,
          createdAt: typeof rawNote.createdAt === 'string' ? rawNote.createdAt : new Date().toISOString(),
          updatedAt: typeof rawNote.updatedAt === 'string' ? rawNote.updatedAt : new Date().toISOString()
        });
      }
    }

    return validNotes;
  } catch (err) {
    console.warn('FocusList: Unable to load sticky notes from localStorage:', err);
    return [];
  }
}

/**
 * Safely persists sticky notes array to browser localStorage.
 */
export function persistStickyNotes(notes: readonly StickyNote[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STICKY_STORAGE_KEY, JSON.stringify(notes));
    }
  } catch (err) {
    console.warn('FocusList: Unable to persist sticky notes to localStorage:', err);
  }
}

/**
 * Returns a fresh copy of the canonical demo tasks and sticky notes.
 */
export function getCanonicalDemoData(): { tasks: Task[]; stickyNotes: StickyNote[] } {
  const tasks = createInitialDemoTasks();
  const stickyNotes: StickyNote[] = INITIAL_DEMO_STICKY_NOTES.map(n => ({
    ...n,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return { tasks, stickyNotes };
}

/**
 * Persists the canonical demo dataset and updates seed flags.
 */
export function enableDemoStorageData(): { tasks: Task[]; stickyNotes: StickyNote[] } {
  const data = getCanonicalDemoData();
  persistTasks(data.tasks);
  persistStickyNotes(data.stickyNotes);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SEED_FLAG_TASKS, 'true');
      localStorage.setItem(SEED_FLAG_STICKY, 'true');
    }
  } catch (err) {
    console.warn('FocusList: Unable to set seed flags in localStorage:', err);
  }
  return data;
}

/**
 * Clears all user tasks, notes, and resets local storage to an empty state.
 */
export function resetAllStorageData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(STICKY_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(SEED_FLAG_TASKS, 'true');
      localStorage.setItem(SEED_FLAG_STICKY, 'true');
    }
  } catch (err) {
    console.warn('FocusList: Unable to reset localStorage data:', err);
  }
}
