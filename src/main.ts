/**
 * FocusList Main DOM Controller (TypeScript)
 * Type-safe DOM event handling, rendering, accessibility, and focus management.
 * Coordinates Sticky Board, Today's Schedule, FocusList Task Workspace, and Kanban Workflow Board.
 */

import {
  Task,
  StickyNote,
  TaskStateSnapshot,
  PriorityLevel,
  WorkflowStatus,
  StickyColor
} from './types/task.ts';
import { appState } from './services/state.ts';
import { getTodayDateString } from './utils/storage.ts';

interface AppElements {
  // FocusList Central Workspace
  form: HTMLFormElement | null;
  input: HTMLInputElement | null;
  prioritySelect: HTMLSelectElement | null;
  dueDateInput: HTMLInputElement | null;
  dueTimeInput: HTMLInputElement | null;
  formError: HTMLElement | null;

  statTotal: HTMLElement | null;
  statPending: HTMLElement | null;
  statCompleted: HTMLElement | null;

  searchInput: HTMLInputElement | null;
  clearSearchBtn: HTMLButtonElement | null;
  statusTabs: NodeListOf<HTMLButtonElement>;
  priorityFilterSelect: HTMLSelectElement | null;
  filterIndicator: HTMLElement | null;
  filterIndicatorText: HTMLElement | null;
  resetFiltersBtn: HTMLButtonElement | null;

  taskList: HTMLUListElement | null;

  // Left Wall — Sticky Board
  toggleAddStickyBtn: HTMLButtonElement | null;
  stickyComposer: HTMLElement | null;
  stickyInput: HTMLTextAreaElement | null;
  cancelStickyBtn: HTMLButtonElement | null;
  saveStickyBtn: HTMLButtonElement | null;
  colorDots: NodeListOf<HTMLButtonElement>;
  stickyNotesList: HTMLElement | null;

  // Left Wall — Today's List
  todaysCount: HTMLElement | null;
  todaysTasksContainer: HTMLElement | null;

  // Right Wall — Kanban Board
  kanbanCountTodo: HTMLElement | null;
  kanbanCountInProgress: HTMLElement | null;
  kanbanCountDone: HTMLElement | null;
  kanbanListTodo: HTMLElement | null;
  kanbanListInProgress: HTMLElement | null;
  kanbanListDone: HTMLElement | null;

  // How to Use & Data Controls Modals
  howToUseBtn: HTMLButtonElement | null;
  guideModalOverlay: HTMLElement | null;
  guideModalBackdrop: HTMLElement | null;
  closeGuideModalBtn: HTMLButtonElement | null;
  btnCloseGuideFooter: HTMLButtonElement | null;
  btnLoadDemoData: HTMLButtonElement | null;
  btnResetAppData: HTMLButtonElement | null;

  // Confirmation Dialog
  confirmModalOverlay: HTMLElement | null;
  confirmModalBackdrop: HTMLElement | null;
  confirmModalTitle: HTMLElement | null;
  confirmModalMessage: HTMLElement | null;
  confirmModalBadge: HTMLElement | null;
  confirmModalCancelBtn: HTMLButtonElement | null;
  confirmModalActionBtn: HTMLButtonElement | null;

  // Mobile Drawer Navigation
  mobileMenuBtn: HTMLButtonElement | null;
  mobileDrawerOverlay: HTMLElement | null;
  mobileDrawerBackdrop: HTMLElement | null;
  closeMobileDrawerBtn: HTMLButtonElement | null;
  drawerNavItems: NodeListOf<HTMLButtonElement>;
  drawerHowToUseBtn: HTMLButtonElement | null;
}

function getElements(): AppElements {
  return {
    form: document.getElementById('task-form') as HTMLFormElement | null,
    input: document.getElementById('task-input') as HTMLInputElement | null,
    prioritySelect: document.getElementById('task-priority-select') as HTMLSelectElement | null,
    dueDateInput: document.getElementById('task-due-date') as HTMLInputElement | null,
    dueTimeInput: document.getElementById('task-due-time') as HTMLInputElement | null,
    formError: document.getElementById('form-error'),

    statTotal: document.getElementById('stat-total'),
    statPending: document.getElementById('stat-pending'),
    statCompleted: document.getElementById('stat-completed'),

    searchInput: document.getElementById('search-input') as HTMLInputElement | null,
    clearSearchBtn: document.getElementById('clear-search-btn') as HTMLButtonElement | null,
    statusTabs: document.querySelectorAll<HTMLButtonElement>('.filter-tab'),
    priorityFilterSelect: document.getElementById('priority-filter-select') as HTMLSelectElement | null,
    filterIndicator: document.getElementById('filter-indicator'),
    filterIndicatorText: document.getElementById('filter-indicator-text'),
    resetFiltersBtn: document.getElementById('reset-all-filters-btn') as HTMLButtonElement | null,

    taskList: document.getElementById('task-list') as HTMLUListElement | null,

    toggleAddStickyBtn: document.getElementById('toggle-add-sticky-btn') as HTMLButtonElement | null,
    stickyComposer: document.getElementById('sticky-composer'),
    stickyInput: document.getElementById('sticky-input') as HTMLTextAreaElement | null,
    cancelStickyBtn: document.getElementById('cancel-sticky-btn') as HTMLButtonElement | null,
    saveStickyBtn: document.getElementById('save-sticky-btn') as HTMLButtonElement | null,
    colorDots: document.querySelectorAll<HTMLButtonElement>('.color-dot'),
    stickyNotesList: document.getElementById('sticky-notes-list'),

    todaysCount: document.getElementById('todays-count'),
    todaysTasksContainer: document.getElementById('todays-tasks-container'),

    kanbanCountTodo: document.getElementById('kanban-count-todo'),
    kanbanCountInProgress: document.getElementById('kanban-count-inprogress'),
    kanbanCountDone: document.getElementById('kanban-count-done'),
    kanbanListTodo: document.getElementById('kanban-list-todo'),
    kanbanListInProgress: document.getElementById('kanban-list-inprogress'),
    kanbanListDone: document.getElementById('kanban-list-done'),

    howToUseBtn: document.getElementById('how-to-use-btn') as HTMLButtonElement | null,
    guideModalOverlay: document.getElementById('guide-modal-overlay'),
    guideModalBackdrop: document.getElementById('guide-modal-backdrop'),
    closeGuideModalBtn: document.getElementById('close-guide-modal-btn') as HTMLButtonElement | null,
    btnCloseGuideFooter: document.getElementById('btn-close-guide-footer') as HTMLButtonElement | null,
    btnLoadDemoData: document.getElementById('btn-load-demo-data') as HTMLButtonElement | null,
    btnResetAppData: document.getElementById('btn-reset-app-data') as HTMLButtonElement | null,

    confirmModalOverlay: document.getElementById('confirm-modal-overlay'),
    confirmModalBackdrop: document.getElementById('confirm-modal-backdrop'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    confirmModalBadge: document.getElementById('confirm-modal-badge'),
    confirmModalCancelBtn: document.getElementById('confirm-modal-cancel-btn') as HTMLButtonElement | null,
    confirmModalActionBtn: document.getElementById('confirm-modal-action-btn') as HTMLButtonElement | null,

    mobileMenuBtn: document.getElementById('mobile-menu-btn') as HTMLButtonElement | null,
    mobileDrawerOverlay: document.getElementById('mobile-drawer-overlay'),
    mobileDrawerBackdrop: document.getElementById('mobile-drawer-backdrop'),
    closeMobileDrawerBtn: document.getElementById('close-mobile-drawer-btn') as HTMLButtonElement | null,
    drawerNavItems: document.querySelectorAll<HTMLButtonElement>('.drawer-nav-item[data-drawer-target]'),
    drawerHowToUseBtn: document.getElementById('drawer-how-to-use-btn') as HTMLButtonElement | null
  };
}

let elements: AppElements;
let activeComposerColor: StickyColor = 'yellow';

/**
 * Format due time (HH:mm) into 12-hour friendly time (e.g. 6:00 PM).
 */
function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const rawHour = parts[0];
  const minutes = parts[1] ?? '00';
  if (rawHour === undefined) return timeStr;
  const hours = parseInt(rawHour, 10);
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Computes human-friendly schedule badge text and visual state.
 */
function formatScheduleBadge(dueDate?: string, dueTime?: string, completed?: boolean): {
  text: string;
  state: 'today' | 'tomorrow' | 'overdue' | 'future' | 'none';
} {
  if (!dueDate) return { text: '', state: 'none' };

  const todayStr = getTodayDateString();
  const timeFormatted = formatTime(dueTime);

  // Calculate tomorrow
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrowYear = tomorrowDate.getFullYear();
  const tomorrowMonth = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
  const tomorrowDay = String(tomorrowDate.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;

  if (dueDate === todayStr) {
    return {
      text: timeFormatted ? `Today · ${timeFormatted}` : 'Today',
      state: 'today'
    };
  }

  if (dueDate === tomorrowStr) {
    return {
      text: timeFormatted ? `Tomorrow · ${timeFormatted}` : 'Tomorrow',
      state: 'tomorrow'
    };
  }

  if (dueDate < todayStr && !completed) {
    // Overdue
    const dateParts = dueDate.split('-');
    const formattedDate = dateParts.length === 3 && dateParts[1] && dateParts[2] ? `${dateParts[1]}/${dateParts[2]}` : dueDate;
    return {
      text: timeFormatted ? `Overdue · ${formattedDate} ${timeFormatted}` : `Overdue · ${formattedDate}`,
      state: 'overdue'
    };
  }

  // Future date
  const dateParts = dueDate.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let friendlyDate = dueDate;
  if (dateParts.length === 3 && dateParts[1] && dateParts[2]) {
    const monthIdx = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
      friendlyDate = `${months[monthIdx]} ${day}`;
    }
  }

  return {
    text: timeFormatted ? `${friendlyDate} · ${timeFormatted}` : friendlyDate,
    state: 'future'
  };
}

function createSvgIcon(
  name: 'edit' | 'trash' | 'chevron-up' | 'chevron-down' | 'notebook' | 'search-empty' | 'pin' | 'grip' | 'clock' | 'calendar'
): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  if (name === 'edit') {
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.innerHTML = '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>';
  } else if (name === 'trash') {
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.innerHTML =
      '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
  } else if (name === 'chevron-up') {
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.innerHTML = '<polyline points="18 15 12 9 6 15"/>';
  } else if (name === 'chevron-down') {
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
  } else if (name === 'notebook') {
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.innerHTML =
      '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h8"/><path d="M6 14h6"/><path d="M18 2v20"/><path d="M14 17l2 2 4-4" stroke-width="2"/>';
  } else if (name === 'search-empty') {
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.innerHTML =
      '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="m8 11 6 0" stroke-dasharray="2 2"/>';
  } else if (name === 'pin') {
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.innerHTML = '<circle cx="12" cy="12" r="5" fill="currentColor"/>';
  } else if (name === 'grip') {
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.innerHTML = '<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>';
  } else if (name === 'clock') {
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.innerHTML = '<circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>';
  } else if (name === 'calendar') {
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.innerHTML = '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';
  }

  return svg;
}

function render(snapshot: TaskStateSnapshot): void {
  renderStatistics(snapshot);
  renderFilterControls(snapshot);
  renderTaskList(snapshot);
  renderStickyBoard(snapshot);
  renderTodaysList(snapshot);
  renderKanbanBoard(snapshot);
}

// --- 1. Statistics Rendering ---
function renderStatistics({ totalCount, pendingCount, completedCount }: TaskStateSnapshot): void {
  if (elements.statTotal) elements.statTotal.textContent = String(totalCount);
  if (elements.statPending) elements.statPending.textContent = String(pendingCount);
  if (elements.statCompleted) elements.statCompleted.textContent = String(completedCount);
}

// --- 2. Filter Controls Rendering ---
function renderFilterControls({
  searchQuery,
  statusFilter,
  priorityFilter,
  isFiltered,
  visibleTasks,
  totalCount
}: TaskStateSnapshot): void {
  if (elements.clearSearchBtn) {
    elements.clearSearchBtn.hidden = !searchQuery;
  }

  if (elements.searchInput && elements.searchInput.value !== searchQuery) {
    elements.searchInput.value = searchQuery;
  }

  elements.statusTabs.forEach(tab => {
    const tabStatus = tab.getAttribute('data-status');
    const isActive = tabStatus === statusFilter;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  if (elements.priorityFilterSelect && elements.priorityFilterSelect.value !== priorityFilter) {
    elements.priorityFilterSelect.value = priorityFilter;
  }

  if (elements.filterIndicator && elements.filterIndicatorText) {
    if (isFiltered) {
      elements.filterIndicator.hidden = false;
      const filterParts: string[] = [];
      if (searchQuery.trim()) filterParts.push(`"${searchQuery.trim()}"`);
      if (statusFilter !== 'ALL') filterParts.push(statusFilter.toLowerCase());
      if (priorityFilter !== 'ALL') filterParts.push(`${priorityFilter.toLowerCase()} priority`);

      elements.filterIndicatorText.textContent = `Showing ${visibleTasks.length} of ${totalCount} tasks (${filterParts.join(', ')})`;
    } else {
      elements.filterIndicator.hidden = true;
    }
  }
}

// --- 3. Main FocusList Task List Rendering ---
function renderTaskList({ tasks, visibleTasks, editingTaskId }: TaskStateSnapshot): void {
  const container = elements.taskList;
  if (!container) return;

  container.innerHTML = '';

  if (tasks.length === 0) {
    container.appendChild(createGlobalEmptyState());
    return;
  }

  if (visibleTasks.length === 0) {
    container.appendChild(createFilteredEmptyState());
    return;
  }

  visibleTasks.forEach((task, index) => {
    if (editingTaskId === task.id) {
      container.appendChild(createTaskEditRow(task));
    } else {
      const canMoveUp = index > 0;
      const canMoveDown = index < visibleTasks.length - 1;
      container.appendChild(createTaskRow(task, canMoveUp, canMoveDown));
    }
  });
}

function createTaskRow(task: Task, canMoveUp: boolean, canMoveDown: boolean): HTMLLIElement {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.setAttribute('data-task-id', task.id);
  li.id = `task-row-${task.id}`;

  const mainDiv = document.createElement('div');
  mainDiv.className = 'task-item-main';

  const checkboxWrapper = document.createElement('div');
  checkboxWrapper.className = 'task-checkbox-wrapper';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    'aria-label',
    task.completed ? `Mark task as active: ${task.title}` : `Mark task as complete: ${task.title}`
  );
  checkbox.addEventListener('change', () => {
    appState.toggleTaskCompletion(task.id);
  });

  checkboxWrapper.appendChild(checkbox);

  const contentGroup = document.createElement('div');
  contentGroup.className = 'task-content-group';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'task-title';
  titleSpan.textContent = task.title;
  contentGroup.appendChild(titleSpan);

  // Meta row: Priority Badge + Schedule Badge
  const metaRow = document.createElement('div');
  metaRow.className = 'task-meta-row';

  const priorityBadge = document.createElement('span');
  priorityBadge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
  priorityBadge.textContent = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();
  metaRow.appendChild(priorityBadge);

  if (task.dueDate) {
    const scheduleInfo = formatScheduleBadge(task.dueDate, task.dueTime, task.completed);
    if (scheduleInfo.text) {
      const scheduleBadge = document.createElement('span');
      scheduleBadge.className = `schedule-badge schedule-${scheduleInfo.state}`;
      scheduleBadge.appendChild(createSvgIcon('clock'));
      const textNode = document.createElement('span');
      textNode.textContent = scheduleInfo.text;
      scheduleBadge.appendChild(textNode);
      metaRow.appendChild(scheduleBadge);
    }
  }

  contentGroup.appendChild(metaRow);

  mainDiv.appendChild(checkboxWrapper);
  mainDiv.appendChild(contentGroup);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-item-actions';

  if (canMoveUp) {
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'icon-btn btn-move';
    upBtn.setAttribute('aria-label', `Move task up: ${task.title}`);
    upBtn.appendChild(createSvgIcon('chevron-up'));
    upBtn.addEventListener('click', () => {
      appState.moveTask(task.id, 'up');
    });
    actionsDiv.appendChild(upBtn);
  }

  if (canMoveDown) {
    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'icon-btn btn-move';
    downBtn.setAttribute('aria-label', `Move task down: ${task.title}`);
    downBtn.appendChild(createSvgIcon('chevron-down'));
    downBtn.addEventListener('click', () => {
      appState.moveTask(task.id, 'down');
    });
    actionsDiv.appendChild(downBtn);
  }

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'icon-btn btn-edit';
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.appendChild(createSvgIcon('edit'));
  editBtn.addEventListener('click', () => {
    appState.setEditingTaskId(task.id);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn btn-delete';
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.appendChild(createSvgIcon('trash'));
  deleteBtn.addEventListener('click', () => {
    appState.deleteTask(task.id);
  });

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(mainDiv);
  li.appendChild(actionsDiv);

  return li;
}

function createTaskEditRow(task: Task): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'task-item-editing';
  li.setAttribute('data-editing-id', task.id);

  const titleRow = document.createElement('div');
  titleRow.className = 'edit-title-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-title-input';
  input.value = task.title;
  input.maxLength = 250;
  input.setAttribute('aria-label', `Edit title for task: ${task.title}`);
  titleRow.appendChild(input);

  // Edit controls row: Priority, Due Date, Due Time
  const controlsRow = document.createElement('div');
  controlsRow.className = 'edit-controls-row';

  const prioritySelect = document.createElement('select');
  prioritySelect.className = 'form-select edit-select';
  prioritySelect.setAttribute('aria-label', 'Edit priority');

  const options: { value: PriorityLevel; label: string }[] = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];

  for (const opt of options) {
    const optionEl = document.createElement('option');
    optionEl.value = opt.value;
    optionEl.textContent = `${opt.label} Priority`;
    if (task.priority === opt.value) {
      optionEl.selected = true;
    }
    prioritySelect.appendChild(optionEl);
  }

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'form-input edit-date-input';
  dateInput.value = task.dueDate || '';
  dateInput.setAttribute('aria-label', 'Edit due date');

  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.className = 'form-input edit-time-input';
  timeInput.value = task.dueTime || '';
  timeInput.setAttribute('aria-label', 'Edit due time');

  const clearScheduleBtn = document.createElement('button');
  clearScheduleBtn.type = 'button';
  clearScheduleBtn.className = 'btn btn-secondary btn-xs btn-clear-date';
  clearScheduleBtn.textContent = 'Clear Date';
  clearScheduleBtn.setAttribute('aria-label', 'Clear due date and time');
  clearScheduleBtn.addEventListener('click', () => {
    dateInput.value = '';
    timeInput.value = '';
  });

  controlsRow.appendChild(prioritySelect);
  controlsRow.appendChild(dateInput);
  controlsRow.appendChild(timeInput);
  controlsRow.appendChild(clearScheduleBtn);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'edit-actions-row';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary btn-sm';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.setAttribute('aria-label', 'Cancel editing task');
  cancelBtn.addEventListener('click', () => {
    appState.setEditingTaskId(null);
  });

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'btn btn-primary btn-sm';
  saveBtn.textContent = 'Save Changes';
  saveBtn.setAttribute('aria-label', 'Save edited task');

  const handleSave = (): void => {
    const newTitle = input.value.trim();
    if (!newTitle) {
      input.focus();
      input.style.borderColor = 'var(--priority-high-text)';
      return;
    }
    appState.updateTask(task.id, {
      title: newTitle,
      priority: prioritySelect.value as PriorityLevel,
      dueDate: dateInput.value.trim() || undefined,
      dueTime: timeInput.value.trim() || undefined
    });
  };

  saveBtn.addEventListener('click', handleSave);

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      appState.setEditingTaskId(null);
    }
  });

  actionsRow.appendChild(cancelBtn);
  actionsRow.appendChild(saveBtn);

  li.appendChild(titleRow);
  li.appendChild(controlsRow);
  li.appendChild(actionsRow);

  setTimeout(() => {
    input.focus();
    input.select();
  }, 0);

  return li;
}

function createGlobalEmptyState(): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'empty-state';

  const badgeDiv = document.createElement('div');
  badgeDiv.className = 'empty-state-badge';
  badgeDiv.appendChild(createSvgIcon('notebook'));

  const title = document.createElement('h3');
  title.className = 'empty-state-title';
  title.textContent = 'Your list is clear';

  const desc = document.createElement('p');
  desc.className = 'empty-state-desc';
  desc.textContent =
    'Nothing needs your attention right now. Add a task above whenever you are ready.';

  const actionDiv = document.createElement('div');
  actionDiv.className = 'empty-state-action';

  const addFocusBtn = document.createElement('button');
  addFocusBtn.type = 'button';
  addFocusBtn.className = 'btn btn-secondary btn-sm';
  addFocusBtn.textContent = '+ Add a task';
  addFocusBtn.setAttribute('aria-label', 'Focus task input field');
  addFocusBtn.addEventListener('click', () => {
    elements.input?.focus();
  });

  actionDiv.appendChild(addFocusBtn);

  li.appendChild(badgeDiv);
  li.appendChild(title);
  li.appendChild(desc);
  li.appendChild(actionDiv);

  return li;
}

function createFilteredEmptyState(): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'empty-state';

  const badgeDiv = document.createElement('div');
  badgeDiv.className = 'empty-state-badge';
  badgeDiv.appendChild(createSvgIcon('search-empty'));

  const title = document.createElement('h3');
  title.className = 'empty-state-title';
  title.textContent = 'No matching tasks found';

  const desc = document.createElement('p');
  desc.className = 'empty-state-desc';
  desc.textContent = 'Try adjusting or resetting your search query and filters.';

  const actionDiv = document.createElement('div');
  actionDiv.className = 'empty-state-action';

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-secondary btn-sm';
  clearBtn.textContent = 'Clear all filters';
  clearBtn.setAttribute('aria-label', 'Clear all active search and filter controls');
  clearBtn.addEventListener('click', () => {
    appState.resetAllFilters();
  });

  actionDiv.appendChild(clearBtn);

  li.appendChild(badgeDiv);
  li.appendChild(title);
  li.appendChild(desc);
  li.appendChild(actionDiv);

  return li;
}

// --- 4. Sticky Board Rendering & Interaction ---
function renderStickyBoard({ stickyNotes, editingStickyId }: TaskStateSnapshot): void {
  const container = elements.stickyNotesList;
  if (!container) return;

  container.innerHTML = '';

  if (stickyNotes.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'sticky-board-empty';
    const emptyText = document.createElement('p');
    emptyText.className = 'sticky-empty-text';
    emptyText.textContent = 'No pinned notes.';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-secondary btn-xs';
    addBtn.textContent = '+ Add Note';
    addBtn.setAttribute('aria-label', 'Add a sticky note');
    addBtn.addEventListener('click', () => {
      openStickyComposer();
    });

    emptyDiv.appendChild(emptyText);
    emptyDiv.appendChild(addBtn);
    container.appendChild(emptyDiv);
    return;
  }

  stickyNotes.forEach((note, index) => {
    if (editingStickyId === note.id) {
      container.appendChild(createStickyNoteEditElement(note));
    } else {
      container.appendChild(createStickyNoteElement(note, index));
    }
  });
}

function createStickyNoteElement(note: StickyNote, index: number): HTMLElement {
  const noteEl = document.createElement('div');
  noteEl.className = `sticky-item sticky-${note.color} note-rotation-${(index % 4) + 1}`;
  noteEl.setAttribute('data-sticky-id', note.id);
  noteEl.setAttribute('draggable', 'true');
  noteEl.setAttribute('role', 'listitem');
  noteEl.setAttribute('tabindex', '0');
  noteEl.setAttribute('aria-label', `Sticky note: ${note.text.slice(0, 40)}. Drag to reorder.`);

  // Drag & drop event listeners
  noteEl.addEventListener('dragstart', (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/sticky-id', note.id);
      e.dataTransfer.effectAllowed = 'move';
    }
    noteEl.classList.add('is-dragging');
    noteEl.setAttribute('aria-grabbed', 'true');
  });

  noteEl.addEventListener('dragend', () => {
    noteEl.classList.remove('is-dragging');
    noteEl.setAttribute('aria-grabbed', 'false');
    document.querySelectorAll('.sticky-item').forEach(el => {
      el.classList.remove('sticky-drag-above', 'sticky-drag-below');
    });
  });

  noteEl.addEventListener('dragover', (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('text/sticky-id')) return;
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    const rect = noteEl.getBoundingClientRect();
    const isBelow = e.clientY > rect.top + rect.height / 2;
    noteEl.classList.toggle('sticky-drag-below', isBelow);
    noteEl.classList.toggle('sticky-drag-above', !isBelow);
  });

  noteEl.addEventListener('dragleave', (e: DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!noteEl.contains(related)) {
      noteEl.classList.remove('sticky-drag-above', 'sticky-drag-below');
    }
  });

  noteEl.addEventListener('drop', (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('text/sticky-id')) return;
    e.preventDefault();
    e.stopPropagation();
    noteEl.classList.remove('sticky-drag-above', 'sticky-drag-below');
    const sourceId = e.dataTransfer.getData('text/sticky-id');
    if (sourceId && sourceId !== note.id) {
      appState.reorderStickyNotes(sourceId, note.id);
    }
  });

  // Pin decoration
  const pinEl = document.createElement('div');
  pinEl.className = 'sticky-pin-badge';
  pinEl.appendChild(createSvgIcon('pin'));
  noteEl.appendChild(pinEl);

  // Text content
  const textEl = document.createElement('p');
  textEl.className = 'sticky-item-text';
  textEl.textContent = note.text;
  noteEl.appendChild(textEl);

  // Hover/Focus Action toolbar
  const actionsEl = document.createElement('div');
  actionsEl.className = 'sticky-item-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'sticky-action-btn btn-sticky-edit';
  editBtn.setAttribute('aria-label', `Edit sticky note: ${note.text.slice(0, 20)}`);
  editBtn.appendChild(createSvgIcon('edit'));
  editBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appState.setEditingStickyId(note.id);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'sticky-action-btn btn-sticky-delete';
  deleteBtn.setAttribute('aria-label', `Delete sticky note: ${note.text.slice(0, 20)}`);
  deleteBtn.appendChild(createSvgIcon('trash'));
  deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appState.deleteStickyNote(note.id);
  });

  actionsEl.appendChild(editBtn);
  actionsEl.appendChild(deleteBtn);
  noteEl.appendChild(actionsEl);

  return noteEl;
}

function createStickyNoteEditElement(note: StickyNote): HTMLElement {
  const formEl = document.createElement('div');
  formEl.className = `sticky-item sticky-editing sticky-${note.color}`;

  const textarea = document.createElement('textarea');
  textarea.className = 'sticky-edit-textarea';
  textarea.value = note.text;
  textarea.rows = 3;
  textarea.maxLength = 140;
  textarea.setAttribute('aria-label', 'Edit note text');

  let selectedColor = note.color;

  const colorGroup = document.createElement('div');
  colorGroup.className = 'color-picker-group color-picker-sm';
  colorGroup.setAttribute('role', 'radiogroup');
  colorGroup.setAttribute('aria-label', 'Select note color');

  const colors: StickyColor[] = ['yellow', 'coral', 'mint', 'lavender'];
  const dotElements: HTMLButtonElement[] = [];

  colors.forEach(c => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `color-dot color-dot-${c} ${c === selectedColor ? 'active' : ''}`;
    dot.setAttribute('aria-label', `${c} color`);
    dot.setAttribute('aria-pressed', c === selectedColor ? 'true' : 'false');
    dot.addEventListener('click', () => {
      selectedColor = c;
      formEl.className = `sticky-item sticky-editing sticky-${c}`;
      dotElements.forEach(d => {
        const isCurrent = d === dot;
        d.classList.toggle('active', isCurrent);
        d.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });
    });
    dotElements.push(dot);
    colorGroup.appendChild(dot);
  });

  const btnGroup = document.createElement('div');
  btnGroup.className = 'composer-btn-group';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-secondary btn-xs';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.setAttribute('aria-label', 'Cancel note edit');
  cancelBtn.addEventListener('click', () => {
    appState.setEditingStickyId(null);
  });

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'btn btn-primary btn-xs';
  saveBtn.textContent = 'Save';
  saveBtn.setAttribute('aria-label', 'Save note');

  const handleSave = (): void => {
    const newText = textarea.value.trim();
    if (!newText) {
      textarea.focus();
      return;
    }
    appState.updateStickyNote(note.id, { text: newText, color: selectedColor });
  };

  saveBtn.addEventListener('click', handleSave);

  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      appState.setEditingStickyId(null);
    }
  });

  const controlsRow = document.createElement('div');
  controlsRow.className = 'sticky-composer-controls';
  controlsRow.appendChild(colorGroup);
  controlsRow.appendChild(btnGroup);

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(saveBtn);

  formEl.appendChild(textarea);
  formEl.appendChild(controlsRow);

  setTimeout(() => {
    textarea.focus();
  }, 0);

  return formEl;
}

function openStickyComposer(): void {
  if (elements.stickyComposer) {
    elements.stickyComposer.hidden = false;
    elements.stickyInput?.focus();
  }
}

function closeStickyComposer(): void {
  if (elements.stickyComposer) {
    elements.stickyComposer.hidden = true;
    if (elements.stickyInput) {
      elements.stickyInput.value = '';
    }
  }
}

// --- 5. Today's List Rendering & Interconnection ---
function renderTodaysList({ todaysTasks }: TaskStateSnapshot): void {
  if (elements.todaysCount) {
    elements.todaysCount.textContent = String(todaysTasks.length);
  }

  const container = elements.todaysTasksContainer;
  if (!container) return;
  container.innerHTML = '';

  if (todaysTasks.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'todays-empty-hint';
    emptyEl.textContent = 'No tasks due today.';
    container.appendChild(emptyEl);
    return;
  }

  todaysTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `todays-task-item ${task.completed ? 'completed' : ''}`;
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute(
      'aria-label',
      `Due today: ${task.title}${task.dueTime ? ` at ${formatTime(task.dueTime)}` : ''}, ${task.priority} priority`
    );

    // Time pill
    const timePill = document.createElement('span');
    timePill.className = 'todays-time-pill';
    timePill.textContent = task.dueTime ? formatTime(task.dueTime) : 'Today';

    // Title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'todays-title';
    titleSpan.textContent = task.title;

    // Priority Indicator / Check status
    const statusDiv = document.createElement('span');
    if (task.completed) {
      statusDiv.className = 'todays-check-mark';
      statusDiv.textContent = '✓';
      statusDiv.title = 'Completed';
    } else {
      statusDiv.className = `todays-priority-dot dot-${task.priority.toLowerCase()}`;
      statusDiv.title = `${task.priority} priority`;
    }

    item.appendChild(timePill);
    item.appendChild(titleSpan);
    item.appendChild(statusDiv);

    // Clicking / Enter scrolls to and highlights corresponding task in FocusList
    const focusCentralTask = (): void => {
      const centralTaskEl = document.getElementById(`task-row-${task.id}`);
      if (centralTaskEl) {
        centralTaskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        centralTaskEl.classList.add('task-highlight-flash');
        setTimeout(() => {
          centralTaskEl.classList.remove('task-highlight-flash');
        }, 1200);
      }
    };

    item.addEventListener('click', focusCentralTask);
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        focusCentralTask();
      }
    });

    container.appendChild(item);
  });
}

// --- 6. Kanban Board Rendering & Real Drag-and-Drop ---
function renderKanbanBoard({ tasks }: TaskStateSnapshot): void {
  const todoTasks = tasks.filter(t => t.workflowStatus === 'todo');
  const inProgressTasks = tasks.filter(t => t.workflowStatus === 'in-progress');
  const doneTasks = tasks.filter(t => t.workflowStatus === 'done');

  if (elements.kanbanCountTodo) elements.kanbanCountTodo.textContent = String(todoTasks.length);
  if (elements.kanbanCountInProgress)
    elements.kanbanCountInProgress.textContent = String(inProgressTasks.length);
  if (elements.kanbanCountDone) elements.kanbanCountDone.textContent = String(doneTasks.length);

  renderKanbanColumnList(elements.kanbanListTodo, todoTasks, 'todo');
  renderKanbanColumnList(elements.kanbanListInProgress, inProgressTasks, 'in-progress');
  renderKanbanColumnList(elements.kanbanListDone, doneTasks, 'done');
}

function renderKanbanColumnList(
  container: HTMLElement | null,
  tasks: readonly Task[],
  columnStatus: WorkflowStatus
): void {
  if (!container) return;
  container.innerHTML = '';

  if (tasks.length === 0) {
    const emptyHint = document.createElement('div');
    emptyHint.className = 'kanban-empty-hint';
    emptyHint.textContent = 'Drop task here';
    container.appendChild(emptyHint);
    return;
  }

  tasks.forEach(task => {
    container.appendChild(createKanbanCard(task, columnStatus));
  });
}

function createKanbanCard(task: Task, currentStatus: WorkflowStatus): HTMLElement {
  const card = document.createElement('div');
  card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
  card.setAttribute('draggable', 'true');
  card.setAttribute('data-task-id', task.id);
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', `Kanban task: ${task.title} (${task.priority} priority)`);

  // Drag and Drop listeners
  card.addEventListener('dragstart', (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    }
    card.classList.add('is-dragging');
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('is-dragging');
    document.querySelectorAll('.kanban-card-list').forEach(el => {
      el.classList.remove('drag-over');
    });
  });

  // Card Header / Grip + Title
  const headerDiv = document.createElement('div');
  headerDiv.className = 'kanban-card-header';

  const gripIcon = document.createElement('span');
  gripIcon.className = 'kanban-grip-icon';
  gripIcon.appendChild(createSvgIcon('grip'));

  const titleSpan = document.createElement('span');
  titleSpan.className = 'kanban-card-title';
  titleSpan.textContent = task.title;

  headerDiv.appendChild(gripIcon);
  headerDiv.appendChild(titleSpan);

  // Card Meta: Priority + Schedule
  const metaDiv = document.createElement('div');
  metaDiv.className = 'kanban-card-meta';

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
  badge.textContent = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();
  metaDiv.appendChild(badge);

  if (task.dueDate) {
    const scheduleInfo = formatScheduleBadge(task.dueDate, task.dueTime, task.completed);
    if (scheduleInfo.text) {
      const scheduleSpan = document.createElement('span');
      scheduleSpan.className = `kanban-schedule schedule-${scheduleInfo.state}`;
      scheduleSpan.textContent = scheduleInfo.text;
      metaDiv.appendChild(scheduleSpan);
    }
  }

  // Card Footer: Accessible Move Select
  const footerDiv = document.createElement('div');
  footerDiv.className = 'kanban-card-footer';

  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'kanban-status-select-wrapper';

  const select = document.createElement('select');
  select.className = 'kanban-status-select';
  select.setAttribute('aria-label', `Move workflow status for task: ${task.title}`);

  const statusOptions: { value: WorkflowStatus; label: string }[] = [
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In Prog' },
    { value: 'done', label: 'Done' }
  ];

  statusOptions.forEach(opt => {
    const optEl = document.createElement('option');
    optEl.value = opt.value;
    optEl.textContent = opt.label;
    if (opt.value === currentStatus) {
      optEl.selected = true;
    }
    select.appendChild(optEl);
  });

  select.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newStatus = target.value as WorkflowStatus;
    appState.updateTaskWorkflowStatus(task.id, newStatus);
  });

  selectWrapper.appendChild(select);
  footerDiv.appendChild(selectWrapper);

  card.appendChild(headerDiv);
  card.appendChild(metaDiv);
  card.appendChild(footerDiv);

  return card;
}

function setupKanbanDropZones(): void {
  const dropZones = document.querySelectorAll<HTMLElement>('.kanban-card-list');

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e: DragEvent) => {
      const related = e.relatedTarget as Node | null;
      if (!zone.contains(related)) {
        zone.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const targetStatus = zone.getAttribute('data-drop-zone') as WorkflowStatus | null;
      const taskId = e.dataTransfer?.getData('text/plain');

      if (taskId && targetStatus) {
        appState.updateTaskWorkflowStatus(taskId, targetStatus);
      }
    });
  });
}

function setupStickyDropZones(): void {
  const container = elements.stickyNotesList;
  if (!container) return;

  container.addEventListener('dragover', (e: DragEvent) => {
    if (e.dataTransfer?.types.includes('text/sticky-id')) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    }
  });

  container.addEventListener('drop', (e: DragEvent) => {
    const sourceId = e.dataTransfer?.getData('text/sticky-id');
    if (!sourceId) return;

    // If dropped on the container background or empty state, move note to the end
    const targetEl = e.target as HTMLElement | null;
    if (targetEl === container || targetEl?.classList.contains('sticky-board-empty') || targetEl?.classList.contains('sticky-notes-list')) {
      e.preventDefault();
      appState.moveStickyNoteToEnd(sourceId);
    }
  });
}

function showFormError(message: string): void {
  if (elements.formError) {
    elements.formError.textContent = message;
    elements.formError.hidden = false;
  }
}

function clearFormError(): void {
  if (elements.formError) {
    elements.formError.textContent = '';
    elements.formError.hidden = true;
  }
}

let lastFocusedElement: HTMLElement | null = null;
let pendingConfirmCallback: (() => void) | null = null;

function openGuideModal(): void {
  lastFocusedElement = document.activeElement as HTMLElement | null;
  if (elements.guideModalOverlay) {
    elements.guideModalOverlay.hidden = false;
    elements.closeGuideModalBtn?.focus();
  }
}

function closeGuideModal(): void {
  if (elements.guideModalOverlay && !elements.guideModalOverlay.hidden) {
    elements.guideModalOverlay.hidden = true;
    lastFocusedElement?.focus();
  }
}

function openConfirmModal(config: {
  title: string;
  message: string;
  badge?: string;
  actionText: string;
  actionIsDanger?: boolean;
  onConfirm: () => void;
}): void {
  if (elements.confirmModalTitle) elements.confirmModalTitle.textContent = config.title;
  if (elements.confirmModalMessage) elements.confirmModalMessage.textContent = config.message;
  if (elements.confirmModalBadge) elements.confirmModalBadge.textContent = config.badge || '⚠';
  if (elements.confirmModalActionBtn) {
    elements.confirmModalActionBtn.textContent = config.actionText;
    elements.confirmModalActionBtn.className = `btn btn-sm ${config.actionIsDanger ? 'btn-danger' : 'btn-primary'}`;
  }

  pendingConfirmCallback = config.onConfirm;

  if (elements.confirmModalOverlay) {
    elements.confirmModalOverlay.hidden = false;
    elements.confirmModalActionBtn?.focus();
  }
}

function closeConfirmModal(): void {
  if (elements.confirmModalOverlay && !elements.confirmModalOverlay.hidden) {
    elements.confirmModalOverlay.hidden = true;
    pendingConfirmCallback = null;
  }
}

function openMobileDrawer(): void {
  if (elements.mobileDrawerOverlay) {
    elements.mobileDrawerOverlay.hidden = false;
    elements.mobileMenuBtn?.setAttribute('aria-expanded', 'true');
    elements.closeMobileDrawerBtn?.focus();
  }
}

function closeMobileDrawer(): void {
  if (elements.mobileDrawerOverlay && !elements.mobileDrawerOverlay.hidden) {
    elements.mobileDrawerOverlay.hidden = true;
    elements.mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    elements.mobileMenuBtn?.focus();
  }
}

function bindEventListeners(): void {
  // FocusList Task Form
  if (elements.form) {
    elements.form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      clearFormError();

      const raw = elements.input?.value ?? '';
      const trimmed = raw.trim();

      if (!trimmed) {
        showFormError('Please enter a task description');
        elements.input?.focus();
        return;
      }

      const priority = (elements.prioritySelect?.value ?? 'MEDIUM') as PriorityLevel;
      const dueDate = elements.dueDateInput?.value.trim() || undefined;
      const dueTime = elements.dueTimeInput?.value.trim() || undefined;

      const success = appState.addTask(trimmed, priority, 'todo', dueDate, dueTime);

      if (success) {
        if (elements.input) {
          elements.input.value = '';
          elements.input.focus();
        }
        if (elements.prioritySelect) elements.prioritySelect.value = 'MEDIUM';
        if (elements.dueDateInput) elements.dueDateInput.value = '';
        if (elements.dueTimeInput) elements.dueTimeInput.value = '';
      }
    });
  }

  if (elements.input) {
    elements.input.addEventListener('input', () => {
      if (elements.formError && !elements.formError.hidden) {
        clearFormError();
      }
    });
  }

  // Search
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      appState.setSearchQuery(target.value);
    });

    elements.searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        appState.setSearchQuery('');
      }
    });
  }

  if (elements.clearSearchBtn) {
    elements.clearSearchBtn.addEventListener('click', () => {
      appState.setSearchQuery('');
      elements.searchInput?.focus();
    });
  }

  // Filter Tabs
  elements.statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const status = tab.getAttribute('data-status');
      if (status === 'ALL' || status === 'ACTIVE' || status === 'COMPLETED') {
        appState.setStatusFilter(status);
      }
    });
  });

  // Priority Filter
  if (elements.priorityFilterSelect) {
    elements.priorityFilterSelect.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const priority = target.value;
      if (
        priority === 'ALL' ||
        priority === 'HIGH' ||
        priority === 'MEDIUM' ||
        priority === 'LOW'
      ) {
        appState.setPriorityFilter(priority);
      }
    });
  }

  // Reset Filters
  if (elements.resetFiltersBtn) {
    elements.resetFiltersBtn.addEventListener('click', () => {
      appState.resetAllFilters();
    });
  }

  // Sticky Board Composer Events
  if (elements.toggleAddStickyBtn) {
    elements.toggleAddStickyBtn.addEventListener('click', () => {
      if (elements.stickyComposer?.hidden) {
        openStickyComposer();
      } else {
        closeStickyComposer();
      }
    });
  }

  if (elements.cancelStickyBtn) {
    elements.cancelStickyBtn.addEventListener('click', () => {
      closeStickyComposer();
    });
  }

  if (elements.saveStickyBtn && elements.stickyInput) {
    elements.saveStickyBtn.addEventListener('click', () => {
      const raw = elements.stickyInput?.value ?? '';
      const trimmed = raw.trim();
      if (!trimmed) {
        elements.stickyInput?.focus();
        return;
      }
      appState.addStickyNote(trimmed, activeComposerColor);
      closeStickyComposer();
    });

    elements.stickyInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        elements.saveStickyBtn?.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeStickyComposer();
      }
    });
  }

  elements.colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color') as StickyColor | null;
      if (color) {
        activeComposerColor = color;
        elements.colorDots.forEach(d => {
          const isCurrent = d === dot;
          d.classList.toggle('active', isCurrent);
          d.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });
      }
    });
  });

  // How to Use & Modal Controls
  if (elements.howToUseBtn) {
    elements.howToUseBtn.addEventListener('click', openGuideModal);
  }

  if (elements.closeGuideModalBtn) {
    elements.closeGuideModalBtn.addEventListener('click', closeGuideModal);
  }

  if (elements.btnCloseGuideFooter) {
    elements.btnCloseGuideFooter.addEventListener('click', closeGuideModal);
  }

  if (elements.guideModalBackdrop) {
    elements.guideModalBackdrop.addEventListener('click', closeGuideModal);
  }

  // Demo Data Trigger
  if (elements.btnLoadDemoData) {
    elements.btnLoadDemoData.addEventListener('click', () => {
      openConfirmModal({
        title: 'Enable demo data?',
        message: 'This will remove your current tasks and notes and replace them with the FocusList demo data.\n\nYour current data will be lost.',
        badge: '✦',
        actionText: 'Enable Demo Data',
        actionIsDanger: false,
        onConfirm: () => {
          appState.enableDemoData();
          closeConfirmModal();
          closeGuideModal();
        }
      });
    });
  }

  // Reset Everything Trigger
  if (elements.btnResetAppData) {
    elements.btnResetAppData.addEventListener('click', () => {
      openConfirmModal({
        title: 'Reset FocusList?',
        message: 'This will clear all of your tasks, sticky notes, and saved FocusList data from this browser.\n\nThis cannot be undone.',
        badge: '⚠',
        actionText: 'Reset Everything',
        actionIsDanger: true,
        onConfirm: () => {
          appState.resetAllData();
          closeConfirmModal();
          closeGuideModal();
        }
      });
    });
  }

  // Confirmation Dialog Actions
  if (elements.confirmModalCancelBtn) {
    elements.confirmModalCancelBtn.addEventListener('click', closeConfirmModal);
  }

  if (elements.confirmModalBackdrop) {
    elements.confirmModalBackdrop.addEventListener('click', closeConfirmModal);
  }

  if (elements.confirmModalActionBtn) {
    elements.confirmModalActionBtn.addEventListener('click', () => {
      if (pendingConfirmCallback) {
        pendingConfirmCallback();
      }
    });
  }

  // Mobile Drawer Events
  if (elements.mobileMenuBtn) {
    elements.mobileMenuBtn.addEventListener('click', openMobileDrawer);
  }

  if (elements.closeMobileDrawerBtn) {
    elements.closeMobileDrawerBtn.addEventListener('click', closeMobileDrawer);
  }

  if (elements.mobileDrawerBackdrop) {
    elements.mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
  }

  elements.drawerNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-drawer-target');
      closeMobileDrawer();

      if (target === 'tasks') {
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'sticky') {
        document.getElementById('sticky-board-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'today') {
        document.getElementById('todays-list-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'kanban') {
        document.getElementById('kanban-wall')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (elements.drawerHowToUseBtn) {
    elements.drawerHowToUseBtn.addEventListener('click', () => {
      closeMobileDrawer();
      openGuideModal();
    });
  }

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (elements.confirmModalOverlay && !elements.confirmModalOverlay.hidden) {
        e.preventDefault();
        closeConfirmModal();
        return;
      }
      if (elements.guideModalOverlay && !elements.guideModalOverlay.hidden) {
        e.preventDefault();
        closeGuideModal();
        return;
      }
      if (elements.mobileDrawerOverlay && !elements.mobileDrawerOverlay.hidden) {
        e.preventDefault();
        closeMobileDrawer();
        return;
      }
      const snapshot = appState.getStateSnapshot();
      if (snapshot.editingTaskId) {
        appState.setEditingTaskId(null);
      }
      if (snapshot.editingStickyId) {
        appState.setEditingStickyId(null);
      }
    }
  });

  setupKanbanDropZones();
  setupStickyDropZones();
}

function init(): void {
  elements = getElements();
  appState.subscribe(render);
  bindEventListeners();
  render(appState.getStateSnapshot());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
