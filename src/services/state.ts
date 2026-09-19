/**
 * FocusList State Service (TypeScript)
 * Single Source of Truth implementation with pure derived computations, Kanban workflow sync, and Sticky Notes state.
 */

import {
  Task,
  StickyNote,
  TaskStateSnapshot,
  StateListener,
  PriorityLevel,
  WorkflowStatus,
  StickyColor,
  StatusFilterType,
  PriorityFilterType
} from '../types/task.ts';
import {
  loadTasksFromStorage,
  persistTasks,
  loadStickyNotesFromStorage,
  persistStickyNotes,
  enableDemoStorageData,
  resetAllStorageData,
  getTodayDateString
} from '../utils/storage.ts';

export class StateManager {
  private tasks: Task[];
  private stickyNotes: StickyNote[];
  private searchQuery: string = '';
  private statusFilter: StatusFilterType = 'ALL';
  private priorityFilter: PriorityFilterType = 'ALL';
  private editingTaskId: string | null = null;
  private editingStickyId: string | null = null;
  private readonly listeners: Set<StateListener> = new Set();

  constructor() {
    this.tasks = loadTasksFromStorage();
    this.stickyNotes = loadStickyNotesFromStorage();
  }

  public subscribe(callback: StateListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    persistTasks(this.tasks);
    persistStickyNotes(this.stickyNotes);
    const snapshot = this.getStateSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('FocusList: Error in state subscriber:', err);
      }
    }
  }

  public getStateSnapshot(): TaskStateSnapshot {
    const totalCount = this.tasks.length;
    const completedCount = this.tasks.filter(t => t.completed).length;
    const pendingCount = this.tasks.filter(t => !t.completed).length;
    const visibleTasks = this.computeVisibleTasks();
    const todaysTasks = this.computeTodaysTasks();
    const isFiltered =
      this.searchQuery.trim() !== '' ||
      this.statusFilter !== 'ALL' ||
      this.priorityFilter !== 'ALL';

    return {
      tasks: [...this.tasks],
      visibleTasks,
      todaysTasks,
      stickyNotes: [...this.stickyNotes],
      totalCount,
      completedCount,
      pendingCount,
      searchQuery: this.searchQuery,
      statusFilter: this.statusFilter,
      priorityFilter: this.priorityFilter,
      editingTaskId: this.editingTaskId,
      editingStickyId: this.editingStickyId,
      isFiltered
    };
  }

  private computeVisibleTasks(): Task[] {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();

    return this.tasks.filter(task => {
      // 1. Search filter
      const matchesSearch =
        normalizedQuery === '' ||
        task.title.toLowerCase().includes(normalizedQuery);

      // 2. Status filter
      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && !task.completed) ||
        (this.statusFilter === 'COMPLETED' && task.completed);

      // 3. Priority filter
      const matchesPriority =
        this.priorityFilter === 'ALL' || task.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  /**
   * Derives tasks due today, sorted by dueTime ascending.
   * Tasks without time follow timed tasks.
   */
  private computeTodaysTasks(): Task[] {
    const today = getTodayDateString();
    const matches = this.tasks.filter(t => t.dueDate === today);

    return matches.sort((a, b) => {
      // If both have dueTime, sort by time string (e.g. '09:00' < '14:30')
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      // Timed tasks come before untimed tasks
      if (a.dueTime && !b.dueTime) return -1;
      if (!a.dueTime && b.dueTime) return 1;
      // If neither has time, preserve order or sort by createdAt
      return a.createdAt.localeCompare(b.createdAt);
    });
  }

  // --- Task CRUD & Kanban Actions ---

  public addTask(
    title: string,
    priority: PriorityLevel = 'MEDIUM',
    workflowStatus: WorkflowStatus = 'todo',
    dueDate?: string,
    dueTime?: string
  ): boolean {
    const trimmed = title.trim();
    if (!trimmed) {
      return false;
    }

    const now = new Date().toISOString();
    const uniqueId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const completed = workflowStatus === 'done';

    const newTask: Task = {
      id: uniqueId,
      title: trimmed,
      completed,
      priority,
      workflowStatus,
      dueDate: dueDate && dueDate.trim() !== '' ? dueDate.trim() : undefined,
      dueTime: dueTime && dueTime.trim() !== '' ? dueTime.trim() : undefined,
      createdAt: now,
      updatedAt: now
    };

    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return true;
  }

  public toggleTaskCompletion(id: string): void {
    let modified = false;
    this.tasks = this.tasks.map(task => {
      if (task.id === id) {
        modified = true;
        const newCompleted = !task.completed;
        const newWorkflowStatus: WorkflowStatus = newCompleted ? 'done' : 'todo';
        return {
          ...task,
          completed: newCompleted,
          workflowStatus: newWorkflowStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });

    if (modified) {
      this.notify();
    }
  }

  public updateTaskWorkflowStatus(id: string, newStatus: WorkflowStatus): void {
    let modified = false;
    this.tasks = this.tasks.map(task => {
      if (task.id === id) {
        if (task.workflowStatus === newStatus) return task;
        modified = true;
        const completed = newStatus === 'done';
        return {
          ...task,
          workflowStatus: newStatus,
          completed,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });

    if (modified) {
      this.notify();
    }
  }

  public updateTask(
    id: string,
    updates: {
      title: string;
      priority: PriorityLevel;
      workflowStatus?: WorkflowStatus;
      dueDate?: string;
      dueTime?: string;
    }
  ): boolean {
    const trimmed = updates.title.trim();
    if (!trimmed) {
      return false;
    }

    let modified = false;
    this.tasks = this.tasks.map(task => {
      if (task.id === id) {
        modified = true;
        const workflowStatus = updates.workflowStatus || task.workflowStatus;
        const completed = workflowStatus === 'done';
        return {
          ...task,
          title: trimmed,
          priority: updates.priority,
          workflowStatus,
          completed,
          dueDate: updates.dueDate && updates.dueDate.trim() !== '' ? updates.dueDate.trim() : undefined,
          dueTime: updates.dueTime && updates.dueTime.trim() !== '' ? updates.dueTime.trim() : undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });

    if (modified) {
      this.editingTaskId = null;
      this.notify();
      return true;
    }
    return false;
  }

  public deleteTask(id: string): void {
    const prevLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    if (this.editingTaskId === id) {
      this.editingTaskId = null;
    }
    if (this.tasks.length !== prevLength) {
      this.notify();
    }
  }

  public moveTask(id: string, direction: 'up' | 'down'): void {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.tasks.length) return;

    const updated = [...this.tasks];
    const [moved] = updated.splice(index, 1);
    if (moved) {
      updated.splice(targetIndex, 0, moved);
      this.tasks = updated;
      this.notify();
    }
  }

  // --- Sticky Notes CRUD Actions ---

  public addStickyNote(text: string, color: StickyColor = 'yellow'): boolean {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }

    const now = new Date().toISOString();
    const uniqueId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sticky-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newNote: StickyNote = {
      id: uniqueId,
      text: trimmed,
      color,
      createdAt: now,
      updatedAt: now
    };

    this.stickyNotes = [newNote, ...this.stickyNotes];
    this.notify();
    return true;
  }

  public updateStickyNote(id: string, updates: { text: string; color: StickyColor }): boolean {
    const trimmed = updates.text.trim();
    if (!trimmed) {
      return false;
    }

    let modified = false;
    this.stickyNotes = this.stickyNotes.map(note => {
      if (note.id === id) {
        modified = true;
        return {
          ...note,
          text: trimmed,
          color: updates.color,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    });

    if (modified) {
      this.editingStickyId = null;
      this.notify();
      return true;
    }
    return false;
  }

  public deleteStickyNote(id: string): void {
    const prevLength = this.stickyNotes.length;
    this.stickyNotes = this.stickyNotes.filter(note => note.id !== id);
    if (this.editingStickyId === id) {
      this.editingStickyId = null;
    }
    if (this.stickyNotes.length !== prevLength) {
      this.notify();
    }
  }

  public setEditingStickyId(id: string | null): void {
    this.editingStickyId = id;
    this.notify();
  }

  public reorderStickyNotes(sourceId: string, targetId: string): void {
    if (sourceId === targetId) return;
    const sourceIndex = this.stickyNotes.findIndex(n => n.id === sourceId);
    const targetIndex = this.stickyNotes.findIndex(n => n.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...this.stickyNotes];
    const [movedNote] = updated.splice(sourceIndex, 1);
    if (movedNote) {
      updated.splice(targetIndex, 0, movedNote);
      this.stickyNotes = updated;
      this.notify();
    }
  }

  public moveStickyNoteToEnd(sourceId: string): void {
    const sourceIndex = this.stickyNotes.findIndex(n => n.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === this.stickyNotes.length - 1) return;
    const updated = [...this.stickyNotes];
    const [movedNote] = updated.splice(sourceIndex, 1);
    if (movedNote) {
      updated.push(movedNote);
      this.stickyNotes = updated;
      this.notify();
    }
  }

  // --- Filter & UI State Controls ---

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.notify();
  }

  public setStatusFilter(status: StatusFilterType): void {
    this.statusFilter = status;
    this.notify();
  }

  public setPriorityFilter(priority: PriorityFilterType): void {
    this.priorityFilter = priority;
    this.notify();
  }

  public setEditingTaskId(id: string | null): void {
    this.editingTaskId = id;
    this.notify();
  }

  public resetAllFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.priorityFilter = 'ALL';
    this.notify();
  }

  public enableDemoData(): void {
    const data = enableDemoStorageData();
    this.tasks = data.tasks;
    this.stickyNotes = data.stickyNotes;
    this.editingTaskId = null;
    this.editingStickyId = null;
    this.resetAllFilters();
  }

  public resetAllData(): void {
    resetAllStorageData();
    this.tasks = [];
    this.stickyNotes = [];
    this.editingTaskId = null;
    this.editingStickyId = null;
    this.resetAllFilters();
  }
}

export const appState = new StateManager();
