/**
 * FocusList TypeScript Type Definitions
 * Strict types and interfaces conforming to FAIE evaluation criteria.
 */

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type StatusFilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';

export type PriorityFilterType = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkflowStatus = 'todo' | 'in-progress' | 'done';

export type StickyColor = 'yellow' | 'coral' | 'mint' | 'lavender';

export interface Task {
  /** Unique stable identifier */
  id: string;

  /** Non-empty trimmed task description */
  title: string;

  /** Completion status */
  completed: boolean;

  /** Priority level enumeration */
  priority: PriorityLevel;

  /** Kanban workflow status */
  workflowStatus: WorkflowStatus;

  /** Optional due date string in ISO format YYYY-MM-DD */
  dueDate?: string;

  /** Optional due time string in 24h format HH:mm */
  dueTime?: string;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 update timestamp */
  updatedAt: string;
}

export interface StickyNote {
  /** Unique stable identifier */
  id: string;

  /** Text content of the note */
  text: string;

  /** Color theme of the sticky note */
  color: StickyColor;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 update timestamp */
  updatedAt: string;
}

export interface TaskStateSnapshot {
  tasks: readonly Task[];
  visibleTasks: readonly Task[];
  todaysTasks: readonly Task[];
  stickyNotes: readonly StickyNote[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  searchQuery: string;
  statusFilter: StatusFilterType;
  priorityFilter: PriorityFilterType;
  editingTaskId: string | null;
  editingStickyId: string | null;
  isFiltered: boolean;
}

export type StateListener = (snapshot: TaskStateSnapshot) => void;

export const STORAGE_KEY = 'focuslist_tasks_v1';
export const STICKY_STORAGE_KEY = 'focuslist_sticky_notes_v1';
