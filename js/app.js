"use strict";
(() => {
  // src/types/task.ts
  var STORAGE_KEY = "focuslist_tasks_v1";
  var STICKY_STORAGE_KEY = "focuslist_sticky_notes_v1";

  // src/utils/storage.ts
  var VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
  var VALID_WORKFLOW_STATUSES = ["todo", "in-progress", "done"];
  var VALID_STICKY_COLORS = ["yellow", "coral", "mint", "lavender"];
  function getTodayDateString() {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function createInitialDemoTasks() {
    const today = getTodayDateString();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return [
      {
        id: "demo-task-1",
        title: "Finish research literature review",
        completed: false,
        priority: "HIGH",
        workflowStatus: "in-progress",
        dueDate: today,
        dueTime: "18:00",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "demo-task-2",
        title: "Prepare presentation slides",
        completed: false,
        priority: "MEDIUM",
        workflowStatus: "todo",
        dueDate: today,
        dueTime: "14:30",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "demo-task-3",
        title: "Submit internship application",
        completed: true,
        priority: "LOW",
        workflowStatus: "done",
        dueDate: today,
        dueTime: "11:00",
        createdAt: now,
        updatedAt: now
      }
    ];
  }
  var INITIAL_DEMO_STICKY_NOTES = [
    {
      id: "demo-sticky-1",
      text: "Today's focus\nOne thing at a time \u2726",
      color: "coral",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "demo-sticky-2",
      text: "Remember\nTake short breaks.",
      color: "mint",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "demo-sticky-3",
      text: "Little reminder\nProgress > perfection.",
      color: "lavender",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  var SEED_FLAG_TASKS = "focuslist_tasks_seeded_v1";
  var SEED_FLAG_STICKY = "focuslist_sticky_seeded_v1";
  function loadTasksFromStorage() {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return createInitialDemoTasks();
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      const hasBeenSeeded = localStorage.getItem(SEED_FLAG_TASKS);
      if (raw === null || !hasBeenSeeded && raw === "[]") {
        const demoTasks = createInitialDemoTasks();
        persistTasks(demoTasks);
        localStorage.setItem(SEED_FLAG_TASKS, "true");
        return demoTasks;
      }
      localStorage.setItem(SEED_FLAG_TASKS, "true");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const validTasks = [];
      for (const item of parsed) {
        if (item && typeof item === "object" && "id" in item && "title" in item && "completed" in item && "priority" in item && typeof item.id === "string" && typeof item.title === "string" && typeof item.completed === "boolean" && typeof item.priority === "string") {
          const rawTask = item;
          const trimmedTitle = rawTask.title.trim();
          if (trimmedTitle.length === 0)
            continue;
          const priority = VALID_PRIORITIES.includes(rawTask.priority) ? rawTask.priority : "MEDIUM";
          let workflowStatus;
          if (typeof rawTask.workflowStatus === "string" && VALID_WORKFLOW_STATUSES.includes(rawTask.workflowStatus)) {
            workflowStatus = rawTask.workflowStatus;
          } else {
            workflowStatus = rawTask.completed ? "done" : "todo";
          }
          const completed = workflowStatus === "done" ? true : workflowStatus === "todo" || workflowStatus === "in-progress" ? false : rawTask.completed;
          const dueDate = typeof rawTask.dueDate === "string" && rawTask.dueDate.trim() !== "" ? rawTask.dueDate.trim() : void 0;
          const dueTime = typeof rawTask.dueTime === "string" && rawTask.dueTime.trim() !== "" ? rawTask.dueTime.trim() : void 0;
          validTasks.push({
            id: rawTask.id,
            title: trimmedTitle,
            completed,
            priority,
            workflowStatus,
            dueDate,
            dueTime,
            createdAt: typeof rawTask.createdAt === "string" ? rawTask.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: typeof rawTask.updatedAt === "string" ? rawTask.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      return validTasks;
    } catch (err) {
      console.warn("FocusList: Unable to load tasks from localStorage:", err);
      return [];
    }
  }
  function persistTasks(tasks) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }
    } catch (err) {
      console.warn("FocusList: Unable to persist tasks to localStorage:", err);
    }
  }
  function loadStickyNotesFromStorage() {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return [...INITIAL_DEMO_STICKY_NOTES];
      }
      const raw = localStorage.getItem(STICKY_STORAGE_KEY);
      const hasBeenSeeded = localStorage.getItem(SEED_FLAG_STICKY);
      if (raw === null || !hasBeenSeeded && raw === "[]") {
        persistStickyNotes(INITIAL_DEMO_STICKY_NOTES);
        localStorage.setItem(SEED_FLAG_STICKY, "true");
        return [...INITIAL_DEMO_STICKY_NOTES];
      }
      localStorage.setItem(SEED_FLAG_STICKY, "true");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const validNotes = [];
      for (const item of parsed) {
        if (item && typeof item === "object" && "id" in item && "text" in item && "color" in item && typeof item.id === "string" && typeof item.text === "string" && typeof item.color === "string") {
          const rawNote = item;
          const trimmedText = rawNote.text.trim();
          if (trimmedText.length === 0)
            continue;
          const color = VALID_STICKY_COLORS.includes(rawNote.color) ? rawNote.color : "yellow";
          validNotes.push({
            id: rawNote.id,
            text: trimmedText,
            color,
            createdAt: typeof rawNote.createdAt === "string" ? rawNote.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: typeof rawNote.updatedAt === "string" ? rawNote.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      return validNotes;
    } catch (err) {
      console.warn("FocusList: Unable to load sticky notes from localStorage:", err);
      return [];
    }
  }
  function persistStickyNotes(notes) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STICKY_STORAGE_KEY, JSON.stringify(notes));
      }
    } catch (err) {
      console.warn("FocusList: Unable to persist sticky notes to localStorage:", err);
    }
  }
  function getCanonicalDemoData() {
    const tasks = createInitialDemoTasks();
    const stickyNotes = INITIAL_DEMO_STICKY_NOTES.map((n) => ({
      ...n,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    return { tasks, stickyNotes };
  }
  function enableDemoStorageData() {
    const data = getCanonicalDemoData();
    persistTasks(data.tasks);
    persistStickyNotes(data.stickyNotes);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(SEED_FLAG_TASKS, "true");
        localStorage.setItem(SEED_FLAG_STICKY, "true");
      }
    } catch (err) {
      console.warn("FocusList: Unable to set seed flags in localStorage:", err);
    }
    return data;
  }
  function resetAllStorageData() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(STICKY_STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(SEED_FLAG_TASKS, "true");
        localStorage.setItem(SEED_FLAG_STICKY, "true");
      }
    } catch (err) {
      console.warn("FocusList: Unable to reset localStorage data:", err);
    }
  }

  // src/services/state.ts
  var StateManager = class {
    tasks;
    stickyNotes;
    searchQuery = "";
    statusFilter = "ALL";
    priorityFilter = "ALL";
    editingTaskId = null;
    editingStickyId = null;
    listeners = /* @__PURE__ */ new Set();
    constructor() {
      this.tasks = loadTasksFromStorage();
      this.stickyNotes = loadStickyNotesFromStorage();
    }
    subscribe(callback) {
      this.listeners.add(callback);
      return () => {
        this.listeners.delete(callback);
      };
    }
    notify() {
      persistTasks(this.tasks);
      persistStickyNotes(this.stickyNotes);
      const snapshot = this.getStateSnapshot();
      for (const listener of this.listeners) {
        try {
          listener(snapshot);
        } catch (err) {
          console.error("FocusList: Error in state subscriber:", err);
        }
      }
    }
    getStateSnapshot() {
      const totalCount = this.tasks.length;
      const completedCount = this.tasks.filter((t) => t.completed).length;
      const pendingCount = this.tasks.filter((t) => !t.completed).length;
      const visibleTasks = this.computeVisibleTasks();
      const todaysTasks = this.computeTodaysTasks();
      const isFiltered = this.searchQuery.trim() !== "" || this.statusFilter !== "ALL" || this.priorityFilter !== "ALL";
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
    computeVisibleTasks() {
      const normalizedQuery = this.searchQuery.trim().toLowerCase();
      return this.tasks.filter((task) => {
        const matchesSearch = normalizedQuery === "" || task.title.toLowerCase().includes(normalizedQuery);
        const matchesStatus = this.statusFilter === "ALL" || this.statusFilter === "ACTIVE" && !task.completed || this.statusFilter === "COMPLETED" && task.completed;
        const matchesPriority = this.priorityFilter === "ALL" || task.priority === this.priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      });
    }
    /**
     * Derives tasks due today, sorted by dueTime ascending.
     * Tasks without time follow timed tasks.
     */
    computeTodaysTasks() {
      const today = getTodayDateString();
      const matches = this.tasks.filter((t) => t.dueDate === today);
      return matches.sort((a, b) => {
        if (a.dueTime && b.dueTime) {
          return a.dueTime.localeCompare(b.dueTime);
        }
        if (a.dueTime && !b.dueTime)
          return -1;
        if (!a.dueTime && b.dueTime)
          return 1;
        return a.createdAt.localeCompare(b.createdAt);
      });
    }
    // --- Task CRUD & Kanban Actions ---
    addTask(title, priority = "MEDIUM", workflowStatus = "todo", dueDate, dueTime) {
      const trimmed = title.trim();
      if (!trimmed) {
        return false;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const uniqueId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const completed = workflowStatus === "done";
      const newTask = {
        id: uniqueId,
        title: trimmed,
        completed,
        priority,
        workflowStatus,
        dueDate: dueDate && dueDate.trim() !== "" ? dueDate.trim() : void 0,
        dueTime: dueTime && dueTime.trim() !== "" ? dueTime.trim() : void 0,
        createdAt: now,
        updatedAt: now
      };
      this.tasks = [newTask, ...this.tasks];
      this.notify();
      return true;
    }
    toggleTaskCompletion(id) {
      let modified = false;
      this.tasks = this.tasks.map((task) => {
        if (task.id === id) {
          modified = true;
          const newCompleted = !task.completed;
          const newWorkflowStatus = newCompleted ? "done" : "todo";
          return {
            ...task,
            completed: newCompleted,
            workflowStatus: newWorkflowStatus,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        return task;
      });
      if (modified) {
        this.notify();
      }
    }
    updateTaskWorkflowStatus(id, newStatus) {
      let modified = false;
      this.tasks = this.tasks.map((task) => {
        if (task.id === id) {
          if (task.workflowStatus === newStatus)
            return task;
          modified = true;
          const completed = newStatus === "done";
          return {
            ...task,
            workflowStatus: newStatus,
            completed,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        return task;
      });
      if (modified) {
        this.notify();
      }
    }
    updateTask(id, updates) {
      const trimmed = updates.title.trim();
      if (!trimmed) {
        return false;
      }
      let modified = false;
      this.tasks = this.tasks.map((task) => {
        if (task.id === id) {
          modified = true;
          const workflowStatus = updates.workflowStatus || task.workflowStatus;
          const completed = workflowStatus === "done";
          return {
            ...task,
            title: trimmed,
            priority: updates.priority,
            workflowStatus,
            completed,
            dueDate: updates.dueDate && updates.dueDate.trim() !== "" ? updates.dueDate.trim() : void 0,
            dueTime: updates.dueTime && updates.dueTime.trim() !== "" ? updates.dueTime.trim() : void 0,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
    deleteTask(id) {
      const prevLength = this.tasks.length;
      this.tasks = this.tasks.filter((task) => task.id !== id);
      if (this.editingTaskId === id) {
        this.editingTaskId = null;
      }
      if (this.tasks.length !== prevLength) {
        this.notify();
      }
    }
    moveTask(id, direction) {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index === -1)
        return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= this.tasks.length)
        return;
      const updated = [...this.tasks];
      const [moved] = updated.splice(index, 1);
      if (moved) {
        updated.splice(targetIndex, 0, moved);
        this.tasks = updated;
        this.notify();
      }
    }
    // --- Sticky Notes CRUD Actions ---
    addStickyNote(text, color = "yellow") {
      const trimmed = text.trim();
      if (!trimmed) {
        return false;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const uniqueId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `sticky-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newNote = {
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
    updateStickyNote(id, updates) {
      const trimmed = updates.text.trim();
      if (!trimmed) {
        return false;
      }
      let modified = false;
      this.stickyNotes = this.stickyNotes.map((note) => {
        if (note.id === id) {
          modified = true;
          return {
            ...note,
            text: trimmed,
            color: updates.color,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
    deleteStickyNote(id) {
      const prevLength = this.stickyNotes.length;
      this.stickyNotes = this.stickyNotes.filter((note) => note.id !== id);
      if (this.editingStickyId === id) {
        this.editingStickyId = null;
      }
      if (this.stickyNotes.length !== prevLength) {
        this.notify();
      }
    }
    setEditingStickyId(id) {
      this.editingStickyId = id;
      this.notify();
    }
    reorderStickyNotes(sourceId, targetId) {
      if (sourceId === targetId)
        return;
      const sourceIndex = this.stickyNotes.findIndex((n) => n.id === sourceId);
      const targetIndex = this.stickyNotes.findIndex((n) => n.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1)
        return;
      const updated = [...this.stickyNotes];
      const [movedNote] = updated.splice(sourceIndex, 1);
      if (movedNote) {
        updated.splice(targetIndex, 0, movedNote);
        this.stickyNotes = updated;
        this.notify();
      }
    }
    moveStickyNoteToEnd(sourceId) {
      const sourceIndex = this.stickyNotes.findIndex((n) => n.id === sourceId);
      if (sourceIndex === -1 || sourceIndex === this.stickyNotes.length - 1)
        return;
      const updated = [...this.stickyNotes];
      const [movedNote] = updated.splice(sourceIndex, 1);
      if (movedNote) {
        updated.push(movedNote);
        this.stickyNotes = updated;
        this.notify();
      }
    }
    // --- Filter & UI State Controls ---
    setSearchQuery(query) {
      this.searchQuery = query;
      this.notify();
    }
    setStatusFilter(status) {
      this.statusFilter = status;
      this.notify();
    }
    setPriorityFilter(priority) {
      this.priorityFilter = priority;
      this.notify();
    }
    setEditingTaskId(id) {
      this.editingTaskId = id;
      this.notify();
    }
    resetAllFilters() {
      this.searchQuery = "";
      this.statusFilter = "ALL";
      this.priorityFilter = "ALL";
      this.notify();
    }
    enableDemoData() {
      const data = enableDemoStorageData();
      this.tasks = data.tasks;
      this.stickyNotes = data.stickyNotes;
      this.editingTaskId = null;
      this.editingStickyId = null;
      this.resetAllFilters();
    }
    resetAllData() {
      resetAllStorageData();
      this.tasks = [];
      this.stickyNotes = [];
      this.editingTaskId = null;
      this.editingStickyId = null;
      this.resetAllFilters();
    }
  };
  var appState = new StateManager();

  // src/main.ts
  function getElements() {
    return {
      form: document.getElementById("task-form"),
      input: document.getElementById("task-input"),
      prioritySelect: document.getElementById("task-priority-select"),
      dueDateInput: document.getElementById("task-due-date"),
      dueTimeInput: document.getElementById("task-due-time"),
      formError: document.getElementById("form-error"),
      statTotal: document.getElementById("stat-total"),
      statPending: document.getElementById("stat-pending"),
      statCompleted: document.getElementById("stat-completed"),
      searchInput: document.getElementById("search-input"),
      clearSearchBtn: document.getElementById("clear-search-btn"),
      statusTabs: document.querySelectorAll(".filter-tab"),
      priorityFilterSelect: document.getElementById("priority-filter-select"),
      filterIndicator: document.getElementById("filter-indicator"),
      filterIndicatorText: document.getElementById("filter-indicator-text"),
      resetFiltersBtn: document.getElementById("reset-all-filters-btn"),
      taskList: document.getElementById("task-list"),
      toggleAddStickyBtn: document.getElementById("toggle-add-sticky-btn"),
      stickyComposer: document.getElementById("sticky-composer"),
      stickyInput: document.getElementById("sticky-input"),
      cancelStickyBtn: document.getElementById("cancel-sticky-btn"),
      saveStickyBtn: document.getElementById("save-sticky-btn"),
      colorDots: document.querySelectorAll(".color-dot"),
      stickyNotesList: document.getElementById("sticky-notes-list"),
      todaysCount: document.getElementById("todays-count"),
      todaysTasksContainer: document.getElementById("todays-tasks-container"),
      kanbanCountTodo: document.getElementById("kanban-count-todo"),
      kanbanCountInProgress: document.getElementById("kanban-count-inprogress"),
      kanbanCountDone: document.getElementById("kanban-count-done"),
      kanbanListTodo: document.getElementById("kanban-list-todo"),
      kanbanListInProgress: document.getElementById("kanban-list-inprogress"),
      kanbanListDone: document.getElementById("kanban-list-done"),
      howToUseBtn: document.getElementById("how-to-use-btn"),
      guideModalOverlay: document.getElementById("guide-modal-overlay"),
      guideModalBackdrop: document.getElementById("guide-modal-backdrop"),
      closeGuideModalBtn: document.getElementById("close-guide-modal-btn"),
      btnCloseGuideFooter: document.getElementById("btn-close-guide-footer"),
      btnLoadDemoData: document.getElementById("btn-load-demo-data"),
      btnResetAppData: document.getElementById("btn-reset-app-data"),
      confirmModalOverlay: document.getElementById("confirm-modal-overlay"),
      confirmModalBackdrop: document.getElementById("confirm-modal-backdrop"),
      confirmModalTitle: document.getElementById("confirm-modal-title"),
      confirmModalMessage: document.getElementById("confirm-modal-message"),
      confirmModalBadge: document.getElementById("confirm-modal-badge"),
      confirmModalCancelBtn: document.getElementById("confirm-modal-cancel-btn"),
      confirmModalActionBtn: document.getElementById("confirm-modal-action-btn"),
      mobileMenuBtn: document.getElementById("mobile-menu-btn"),
      mobileDrawerOverlay: document.getElementById("mobile-drawer-overlay"),
      mobileDrawerBackdrop: document.getElementById("mobile-drawer-backdrop"),
      closeMobileDrawerBtn: document.getElementById("close-mobile-drawer-btn"),
      drawerNavItems: document.querySelectorAll(".drawer-nav-item[data-drawer-target]"),
      drawerHowToUseBtn: document.getElementById("drawer-how-to-use-btn")
    };
  }
  var elements;
  var activeComposerColor = "yellow";
  function formatTime(timeStr) {
    if (!timeStr)
      return "";
    const parts = timeStr.split(":");
    if (parts.length < 2)
      return timeStr;
    const rawHour = parts[0];
    const minutes = parts[1] ?? "00";
    if (rawHour === void 0)
      return timeStr;
    const hours = parseInt(rawHour, 10);
    if (isNaN(hours))
      return timeStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  function formatScheduleBadge(dueDate, dueTime, completed) {
    if (!dueDate)
      return { text: "", state: "none" };
    const todayStr = getTodayDateString();
    const timeFormatted = formatTime(dueTime);
    const todayDate = /* @__PURE__ */ new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);
    const tomorrowYear = tomorrowDate.getFullYear();
    const tomorrowMonth = String(tomorrowDate.getMonth() + 1).padStart(2, "0");
    const tomorrowDay = String(tomorrowDate.getDate()).padStart(2, "0");
    const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
    if (dueDate === todayStr) {
      return {
        text: timeFormatted ? `Today \xB7 ${timeFormatted}` : "Today",
        state: "today"
      };
    }
    if (dueDate === tomorrowStr) {
      return {
        text: timeFormatted ? `Tomorrow \xB7 ${timeFormatted}` : "Tomorrow",
        state: "tomorrow"
      };
    }
    if (dueDate < todayStr && !completed) {
      const dateParts2 = dueDate.split("-");
      const formattedDate = dateParts2.length === 3 && dateParts2[1] && dateParts2[2] ? `${dateParts2[1]}/${dateParts2[2]}` : dueDate;
      return {
        text: timeFormatted ? `Overdue \xB7 ${formattedDate} ${timeFormatted}` : `Overdue \xB7 ${formattedDate}`,
        state: "overdue"
      };
    }
    const dateParts = dueDate.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let friendlyDate = dueDate;
    if (dateParts.length === 3 && dateParts[1] && dateParts[2]) {
      const monthIdx = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        friendlyDate = `${months[monthIdx]} ${day}`;
      }
    }
    return {
      text: timeFormatted ? `${friendlyDate} \xB7 ${timeFormatted}` : friendlyDate,
      state: "future"
    };
  }
  function createSvgIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    if (name === "edit") {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.innerHTML = '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>';
    } else if (name === "trash") {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.innerHTML = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
    } else if (name === "chevron-up") {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.innerHTML = '<polyline points="18 15 12 9 6 15"/>';
    } else if (name === "chevron-down") {
      svg.setAttribute("width", "14");
      svg.setAttribute("height", "14");
      svg.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
    } else if (name === "notebook") {
      svg.setAttribute("width", "32");
      svg.setAttribute("height", "32");
      svg.innerHTML = '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h8"/><path d="M6 14h6"/><path d="M18 2v20"/><path d="M14 17l2 2 4-4" stroke-width="2"/>';
    } else if (name === "search-empty") {
      svg.setAttribute("width", "28");
      svg.setAttribute("height", "28");
      svg.innerHTML = '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="m8 11 6 0" stroke-dasharray="2 2"/>';
    } else if (name === "pin") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<circle cx="12" cy="12" r="5" fill="currentColor"/>';
    } else if (name === "grip") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>';
    } else if (name === "clock") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>';
    } else if (name === "calendar") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';
    }
    return svg;
  }
  function render(snapshot) {
    renderStatistics(snapshot);
    renderFilterControls(snapshot);
    renderTaskList(snapshot);
    renderStickyBoard(snapshot);
    renderTodaysList(snapshot);
    renderKanbanBoard(snapshot);
  }
  function renderStatistics({ totalCount, pendingCount, completedCount }) {
    if (elements.statTotal)
      elements.statTotal.textContent = String(totalCount);
    if (elements.statPending)
      elements.statPending.textContent = String(pendingCount);
    if (elements.statCompleted)
      elements.statCompleted.textContent = String(completedCount);
  }
  function renderFilterControls({
    searchQuery,
    statusFilter,
    priorityFilter,
    isFiltered,
    visibleTasks,
    totalCount
  }) {
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.hidden = !searchQuery;
    }
    if (elements.searchInput && elements.searchInput.value !== searchQuery) {
      elements.searchInput.value = searchQuery;
    }
    elements.statusTabs.forEach((tab) => {
      const tabStatus = tab.getAttribute("data-status");
      const isActive = tabStatus === statusFilter;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    if (elements.priorityFilterSelect && elements.priorityFilterSelect.value !== priorityFilter) {
      elements.priorityFilterSelect.value = priorityFilter;
    }
    if (elements.filterIndicator && elements.filterIndicatorText) {
      if (isFiltered) {
        elements.filterIndicator.hidden = false;
        const filterParts = [];
        if (searchQuery.trim())
          filterParts.push(`"${searchQuery.trim()}"`);
        if (statusFilter !== "ALL")
          filterParts.push(statusFilter.toLowerCase());
        if (priorityFilter !== "ALL")
          filterParts.push(`${priorityFilter.toLowerCase()} priority`);
        elements.filterIndicatorText.textContent = `Showing ${visibleTasks.length} of ${totalCount} tasks (${filterParts.join(", ")})`;
      } else {
        elements.filterIndicator.hidden = true;
      }
    }
  }
  function renderTaskList({ tasks, visibleTasks, editingTaskId }) {
    const container = elements.taskList;
    if (!container)
      return;
    container.innerHTML = "";
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
  function createTaskRow(task, canMoveUp, canMoveDown) {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.setAttribute("data-task-id", task.id);
    li.id = `task-row-${task.id}`;
    const mainDiv = document.createElement("div");
    mainDiv.className = "task-item-main";
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "task-checkbox-wrapper";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      task.completed ? `Mark task as active: ${task.title}` : `Mark task as complete: ${task.title}`
    );
    checkbox.addEventListener("change", () => {
      appState.toggleTaskCompletion(task.id);
    });
    checkboxWrapper.appendChild(checkbox);
    const contentGroup = document.createElement("div");
    contentGroup.className = "task-content-group";
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;
    contentGroup.appendChild(titleSpan);
    const metaRow = document.createElement("div");
    metaRow.className = "task-meta-row";
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
    priorityBadge.textContent = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();
    metaRow.appendChild(priorityBadge);
    if (task.dueDate) {
      const scheduleInfo = formatScheduleBadge(task.dueDate, task.dueTime, task.completed);
      if (scheduleInfo.text) {
        const scheduleBadge = document.createElement("span");
        scheduleBadge.className = `schedule-badge schedule-${scheduleInfo.state}`;
        scheduleBadge.appendChild(createSvgIcon("clock"));
        const textNode = document.createElement("span");
        textNode.textContent = scheduleInfo.text;
        scheduleBadge.appendChild(textNode);
        metaRow.appendChild(scheduleBadge);
      }
    }
    contentGroup.appendChild(metaRow);
    mainDiv.appendChild(checkboxWrapper);
    mainDiv.appendChild(contentGroup);
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-item-actions";
    if (canMoveUp) {
      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "icon-btn btn-move";
      upBtn.setAttribute("aria-label", `Move task up: ${task.title}`);
      upBtn.appendChild(createSvgIcon("chevron-up"));
      upBtn.addEventListener("click", () => {
        appState.moveTask(task.id, "up");
      });
      actionsDiv.appendChild(upBtn);
    }
    if (canMoveDown) {
      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "icon-btn btn-move";
      downBtn.setAttribute("aria-label", `Move task down: ${task.title}`);
      downBtn.appendChild(createSvgIcon("chevron-down"));
      downBtn.addEventListener("click", () => {
        appState.moveTask(task.id, "down");
      });
      actionsDiv.appendChild(downBtn);
    }
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn btn-edit";
    editBtn.setAttribute("aria-label", `Edit task: ${task.title}`);
    editBtn.appendChild(createSvgIcon("edit"));
    editBtn.addEventListener("click", () => {
      appState.setEditingTaskId(task.id);
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn btn-delete";
    deleteBtn.setAttribute("aria-label", `Delete task: ${task.title}`);
    deleteBtn.appendChild(createSvgIcon("trash"));
    deleteBtn.addEventListener("click", () => {
      appState.deleteTask(task.id);
    });
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(mainDiv);
    li.appendChild(actionsDiv);
    return li;
  }
  function createTaskEditRow(task) {
    const li = document.createElement("li");
    li.className = "task-item-editing";
    li.setAttribute("data-editing-id", task.id);
    const titleRow = document.createElement("div");
    titleRow.className = "edit-title-row";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-title-input";
    input.value = task.title;
    input.maxLength = 250;
    input.setAttribute("aria-label", `Edit title for task: ${task.title}`);
    titleRow.appendChild(input);
    const controlsRow = document.createElement("div");
    controlsRow.className = "edit-controls-row";
    const prioritySelect = document.createElement("select");
    prioritySelect.className = "form-select edit-select";
    prioritySelect.setAttribute("aria-label", "Edit priority");
    const options = [
      { value: "HIGH", label: "High" },
      { value: "MEDIUM", label: "Medium" },
      { value: "LOW", label: "Low" }
    ];
    for (const opt of options) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = `${opt.label} Priority`;
      if (task.priority === opt.value) {
        optionEl.selected = true;
      }
      prioritySelect.appendChild(optionEl);
    }
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "form-input edit-date-input";
    dateInput.value = task.dueDate || "";
    dateInput.setAttribute("aria-label", "Edit due date");
    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.className = "form-input edit-time-input";
    timeInput.value = task.dueTime || "";
    timeInput.setAttribute("aria-label", "Edit due time");
    const clearScheduleBtn = document.createElement("button");
    clearScheduleBtn.type = "button";
    clearScheduleBtn.className = "btn btn-secondary btn-xs btn-clear-date";
    clearScheduleBtn.textContent = "Clear Date";
    clearScheduleBtn.setAttribute("aria-label", "Clear due date and time");
    clearScheduleBtn.addEventListener("click", () => {
      dateInput.value = "";
      timeInput.value = "";
    });
    controlsRow.appendChild(prioritySelect);
    controlsRow.appendChild(dateInput);
    controlsRow.appendChild(timeInput);
    controlsRow.appendChild(clearScheduleBtn);
    const actionsRow = document.createElement("div");
    actionsRow.className = "edit-actions-row";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary btn-sm";
    cancelBtn.textContent = "Cancel";
    cancelBtn.setAttribute("aria-label", "Cancel editing task");
    cancelBtn.addEventListener("click", () => {
      appState.setEditingTaskId(null);
    });
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-primary btn-sm";
    saveBtn.textContent = "Save Changes";
    saveBtn.setAttribute("aria-label", "Save edited task");
    const handleSave = () => {
      const newTitle = input.value.trim();
      if (!newTitle) {
        input.focus();
        input.style.borderColor = "var(--priority-high-text)";
        return;
      }
      appState.updateTask(task.id, {
        title: newTitle,
        priority: prioritySelect.value,
        dueDate: dateInput.value.trim() || void 0,
        dueTime: timeInput.value.trim() || void 0
      });
    };
    saveBtn.addEventListener("click", handleSave);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
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
  function createGlobalEmptyState() {
    const li = document.createElement("li");
    li.className = "empty-state";
    const badgeDiv = document.createElement("div");
    badgeDiv.className = "empty-state-badge";
    badgeDiv.appendChild(createSvgIcon("notebook"));
    const title = document.createElement("h3");
    title.className = "empty-state-title";
    title.textContent = "Your list is clear";
    const desc = document.createElement("p");
    desc.className = "empty-state-desc";
    desc.textContent = "Nothing needs your attention right now. Add a task above whenever you are ready.";
    const actionDiv = document.createElement("div");
    actionDiv.className = "empty-state-action";
    const addFocusBtn = document.createElement("button");
    addFocusBtn.type = "button";
    addFocusBtn.className = "btn btn-secondary btn-sm";
    addFocusBtn.textContent = "+ Add a task";
    addFocusBtn.setAttribute("aria-label", "Focus task input field");
    addFocusBtn.addEventListener("click", () => {
      elements.input?.focus();
    });
    actionDiv.appendChild(addFocusBtn);
    li.appendChild(badgeDiv);
    li.appendChild(title);
    li.appendChild(desc);
    li.appendChild(actionDiv);
    return li;
  }
  function createFilteredEmptyState() {
    const li = document.createElement("li");
    li.className = "empty-state";
    const badgeDiv = document.createElement("div");
    badgeDiv.className = "empty-state-badge";
    badgeDiv.appendChild(createSvgIcon("search-empty"));
    const title = document.createElement("h3");
    title.className = "empty-state-title";
    title.textContent = "No matching tasks found";
    const desc = document.createElement("p");
    desc.className = "empty-state-desc";
    desc.textContent = "Try adjusting or resetting your search query and filters.";
    const actionDiv = document.createElement("div");
    actionDiv.className = "empty-state-action";
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn btn-secondary btn-sm";
    clearBtn.textContent = "Clear all filters";
    clearBtn.setAttribute("aria-label", "Clear all active search and filter controls");
    clearBtn.addEventListener("click", () => {
      appState.resetAllFilters();
    });
    actionDiv.appendChild(clearBtn);
    li.appendChild(badgeDiv);
    li.appendChild(title);
    li.appendChild(desc);
    li.appendChild(actionDiv);
    return li;
  }
  function renderStickyBoard({ stickyNotes, editingStickyId }) {
    const container = elements.stickyNotesList;
    if (!container)
      return;
    container.innerHTML = "";
    if (stickyNotes.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "sticky-board-empty";
      const emptyText = document.createElement("p");
      emptyText.className = "sticky-empty-text";
      emptyText.textContent = "No pinned notes.";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-secondary btn-xs";
      addBtn.textContent = "+ Add Note";
      addBtn.setAttribute("aria-label", "Add a sticky note");
      addBtn.addEventListener("click", () => {
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
  function createStickyNoteElement(note, index) {
    const noteEl = document.createElement("div");
    noteEl.className = `sticky-item sticky-${note.color} note-rotation-${index % 4 + 1}`;
    noteEl.setAttribute("data-sticky-id", note.id);
    noteEl.setAttribute("draggable", "true");
    noteEl.setAttribute("role", "listitem");
    noteEl.setAttribute("tabindex", "0");
    noteEl.setAttribute("aria-label", `Sticky note: ${note.text.slice(0, 40)}. Drag to reorder.`);
    noteEl.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/sticky-id", note.id);
        e.dataTransfer.effectAllowed = "move";
      }
      noteEl.classList.add("is-dragging");
      noteEl.setAttribute("aria-grabbed", "true");
    });
    noteEl.addEventListener("dragend", () => {
      noteEl.classList.remove("is-dragging");
      noteEl.setAttribute("aria-grabbed", "false");
      document.querySelectorAll(".sticky-item").forEach((el) => {
        el.classList.remove("sticky-drag-above", "sticky-drag-below");
      });
    });
    noteEl.addEventListener("dragover", (e) => {
      if (!e.dataTransfer?.types.includes("text/sticky-id"))
        return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      const rect = noteEl.getBoundingClientRect();
      const isBelow = e.clientY > rect.top + rect.height / 2;
      noteEl.classList.toggle("sticky-drag-below", isBelow);
      noteEl.classList.toggle("sticky-drag-above", !isBelow);
    });
    noteEl.addEventListener("dragleave", (e) => {
      const related = e.relatedTarget;
      if (!noteEl.contains(related)) {
        noteEl.classList.remove("sticky-drag-above", "sticky-drag-below");
      }
    });
    noteEl.addEventListener("drop", (e) => {
      if (!e.dataTransfer?.types.includes("text/sticky-id"))
        return;
      e.preventDefault();
      e.stopPropagation();
      noteEl.classList.remove("sticky-drag-above", "sticky-drag-below");
      const sourceId = e.dataTransfer.getData("text/sticky-id");
      if (sourceId && sourceId !== note.id) {
        appState.reorderStickyNotes(sourceId, note.id);
      }
    });
    const pinEl = document.createElement("div");
    pinEl.className = "sticky-pin-badge";
    pinEl.appendChild(createSvgIcon("pin"));
    noteEl.appendChild(pinEl);
    const textEl = document.createElement("p");
    textEl.className = "sticky-item-text";
    textEl.textContent = note.text;
    noteEl.appendChild(textEl);
    const actionsEl = document.createElement("div");
    actionsEl.className = "sticky-item-actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "sticky-action-btn btn-sticky-edit";
    editBtn.setAttribute("aria-label", `Edit sticky note: ${note.text.slice(0, 20)}`);
    editBtn.appendChild(createSvgIcon("edit"));
    editBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      appState.setEditingStickyId(note.id);
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "sticky-action-btn btn-sticky-delete";
    deleteBtn.setAttribute("aria-label", `Delete sticky note: ${note.text.slice(0, 20)}`);
    deleteBtn.appendChild(createSvgIcon("trash"));
    deleteBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      appState.deleteStickyNote(note.id);
    });
    actionsEl.appendChild(editBtn);
    actionsEl.appendChild(deleteBtn);
    noteEl.appendChild(actionsEl);
    return noteEl;
  }
  function createStickyNoteEditElement(note) {
    const formEl = document.createElement("div");
    formEl.className = `sticky-item sticky-editing sticky-${note.color}`;
    const textarea = document.createElement("textarea");
    textarea.className = "sticky-edit-textarea";
    textarea.value = note.text;
    textarea.rows = 3;
    textarea.maxLength = 140;
    textarea.setAttribute("aria-label", "Edit note text");
    let selectedColor = note.color;
    const colorGroup = document.createElement("div");
    colorGroup.className = "color-picker-group color-picker-sm";
    colorGroup.setAttribute("role", "radiogroup");
    colorGroup.setAttribute("aria-label", "Select note color");
    const colors = ["yellow", "coral", "mint", "lavender"];
    const dotElements = [];
    colors.forEach((c) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `color-dot color-dot-${c} ${c === selectedColor ? "active" : ""}`;
      dot.setAttribute("aria-label", `${c} color`);
      dot.setAttribute("aria-pressed", c === selectedColor ? "true" : "false");
      dot.addEventListener("click", () => {
        selectedColor = c;
        formEl.className = `sticky-item sticky-editing sticky-${c}`;
        dotElements.forEach((d) => {
          const isCurrent = d === dot;
          d.classList.toggle("active", isCurrent);
          d.setAttribute("aria-pressed", isCurrent ? "true" : "false");
        });
      });
      dotElements.push(dot);
      colorGroup.appendChild(dot);
    });
    const btnGroup = document.createElement("div");
    btnGroup.className = "composer-btn-group";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary btn-xs";
    cancelBtn.textContent = "Cancel";
    cancelBtn.setAttribute("aria-label", "Cancel note edit");
    cancelBtn.addEventListener("click", () => {
      appState.setEditingStickyId(null);
    });
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-primary btn-xs";
    saveBtn.textContent = "Save";
    saveBtn.setAttribute("aria-label", "Save note");
    const handleSave = () => {
      const newText = textarea.value.trim();
      if (!newText) {
        textarea.focus();
        return;
      }
      appState.updateStickyNote(note.id, { text: newText, color: selectedColor });
    };
    saveBtn.addEventListener("click", handleSave);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        appState.setEditingStickyId(null);
      }
    });
    const controlsRow = document.createElement("div");
    controlsRow.className = "sticky-composer-controls";
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
  function openStickyComposer() {
    if (elements.stickyComposer) {
      elements.stickyComposer.hidden = false;
      elements.stickyInput?.focus();
    }
  }
  function closeStickyComposer() {
    if (elements.stickyComposer) {
      elements.stickyComposer.hidden = true;
      if (elements.stickyInput) {
        elements.stickyInput.value = "";
      }
    }
  }
  function renderTodaysList({ todaysTasks }) {
    if (elements.todaysCount) {
      elements.todaysCount.textContent = String(todaysTasks.length);
    }
    const container = elements.todaysTasksContainer;
    if (!container)
      return;
    container.innerHTML = "";
    if (todaysTasks.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "todays-empty-hint";
      emptyEl.textContent = "No tasks due today.";
      container.appendChild(emptyEl);
      return;
    }
    todaysTasks.forEach((task) => {
      const item = document.createElement("div");
      item.className = `todays-task-item ${task.completed ? "completed" : ""}`;
      item.setAttribute("role", "listitem");
      item.setAttribute("tabindex", "0");
      item.setAttribute(
        "aria-label",
        `Due today: ${task.title}${task.dueTime ? ` at ${formatTime(task.dueTime)}` : ""}, ${task.priority} priority`
      );
      const timePill = document.createElement("span");
      timePill.className = "todays-time-pill";
      timePill.textContent = task.dueTime ? formatTime(task.dueTime) : "Today";
      const titleSpan = document.createElement("span");
      titleSpan.className = "todays-title";
      titleSpan.textContent = task.title;
      const statusDiv = document.createElement("span");
      if (task.completed) {
        statusDiv.className = "todays-check-mark";
        statusDiv.textContent = "\u2713";
        statusDiv.title = "Completed";
      } else {
        statusDiv.className = `todays-priority-dot dot-${task.priority.toLowerCase()}`;
        statusDiv.title = `${task.priority} priority`;
      }
      item.appendChild(timePill);
      item.appendChild(titleSpan);
      item.appendChild(statusDiv);
      const focusCentralTask = () => {
        const centralTaskEl = document.getElementById(`task-row-${task.id}`);
        if (centralTaskEl) {
          centralTaskEl.scrollIntoView({ behavior: "smooth", block: "center" });
          centralTaskEl.classList.add("task-highlight-flash");
          setTimeout(() => {
            centralTaskEl.classList.remove("task-highlight-flash");
          }, 1200);
        }
      };
      item.addEventListener("click", focusCentralTask);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          focusCentralTask();
        }
      });
      container.appendChild(item);
    });
  }
  function renderKanbanBoard({ tasks }) {
    const todoTasks = tasks.filter((t) => t.workflowStatus === "todo");
    const inProgressTasks = tasks.filter((t) => t.workflowStatus === "in-progress");
    const doneTasks = tasks.filter((t) => t.workflowStatus === "done");
    if (elements.kanbanCountTodo)
      elements.kanbanCountTodo.textContent = String(todoTasks.length);
    if (elements.kanbanCountInProgress)
      elements.kanbanCountInProgress.textContent = String(inProgressTasks.length);
    if (elements.kanbanCountDone)
      elements.kanbanCountDone.textContent = String(doneTasks.length);
    renderKanbanColumnList(elements.kanbanListTodo, todoTasks, "todo");
    renderKanbanColumnList(elements.kanbanListInProgress, inProgressTasks, "in-progress");
    renderKanbanColumnList(elements.kanbanListDone, doneTasks, "done");
  }
  function renderKanbanColumnList(container, tasks, columnStatus) {
    if (!container)
      return;
    container.innerHTML = "";
    if (tasks.length === 0) {
      const emptyHint = document.createElement("div");
      emptyHint.className = "kanban-empty-hint";
      emptyHint.textContent = "Drop task here";
      container.appendChild(emptyHint);
      return;
    }
    tasks.forEach((task) => {
      container.appendChild(createKanbanCard(task, columnStatus));
    });
  }
  function createKanbanCard(task, currentStatus) {
    const card = document.createElement("div");
    card.className = `kanban-card ${task.completed ? "completed" : ""}`;
    card.setAttribute("draggable", "true");
    card.setAttribute("data-task-id", task.id);
    card.setAttribute("role", "listitem");
    card.setAttribute("aria-label", `Kanban task: ${task.title} (${task.priority} priority)`);
    card.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      document.querySelectorAll(".kanban-card-list").forEach((el) => {
        el.classList.remove("drag-over");
      });
    });
    const headerDiv = document.createElement("div");
    headerDiv.className = "kanban-card-header";
    const gripIcon = document.createElement("span");
    gripIcon.className = "kanban-grip-icon";
    gripIcon.appendChild(createSvgIcon("grip"));
    const titleSpan = document.createElement("span");
    titleSpan.className = "kanban-card-title";
    titleSpan.textContent = task.title;
    headerDiv.appendChild(gripIcon);
    headerDiv.appendChild(titleSpan);
    const metaDiv = document.createElement("div");
    metaDiv.className = "kanban-card-meta";
    const badge = document.createElement("span");
    badge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
    badge.textContent = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();
    metaDiv.appendChild(badge);
    if (task.dueDate) {
      const scheduleInfo = formatScheduleBadge(task.dueDate, task.dueTime, task.completed);
      if (scheduleInfo.text) {
        const scheduleSpan = document.createElement("span");
        scheduleSpan.className = `kanban-schedule schedule-${scheduleInfo.state}`;
        scheduleSpan.textContent = scheduleInfo.text;
        metaDiv.appendChild(scheduleSpan);
      }
    }
    const footerDiv = document.createElement("div");
    footerDiv.className = "kanban-card-footer";
    const selectWrapper = document.createElement("div");
    selectWrapper.className = "kanban-status-select-wrapper";
    const select = document.createElement("select");
    select.className = "kanban-status-select";
    select.setAttribute("aria-label", `Move workflow status for task: ${task.title}`);
    const statusOptions = [
      { value: "todo", label: "Todo" },
      { value: "in-progress", label: "In Prog" },
      { value: "done", label: "Done" }
    ];
    statusOptions.forEach((opt) => {
      const optEl = document.createElement("option");
      optEl.value = opt.value;
      optEl.textContent = opt.label;
      if (opt.value === currentStatus) {
        optEl.selected = true;
      }
      select.appendChild(optEl);
    });
    select.addEventListener("change", (e) => {
      const target = e.target;
      const newStatus = target.value;
      appState.updateTaskWorkflowStatus(task.id, newStatus);
    });
    selectWrapper.appendChild(select);
    footerDiv.appendChild(selectWrapper);
    card.appendChild(headerDiv);
    card.appendChild(metaDiv);
    card.appendChild(footerDiv);
    return card;
  }
  function setupKanbanDropZones() {
    const dropZones = document.querySelectorAll(".kanban-card-list");
    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move";
        }
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", (e) => {
        const related = e.relatedTarget;
        if (!zone.contains(related)) {
          zone.classList.remove("drag-over");
        }
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");
        const targetStatus = zone.getAttribute("data-drop-zone");
        const taskId = e.dataTransfer?.getData("text/plain");
        if (taskId && targetStatus) {
          appState.updateTaskWorkflowStatus(taskId, targetStatus);
        }
      });
    });
  }
  function setupStickyDropZones() {
    const container = elements.stickyNotesList;
    if (!container)
      return;
    container.addEventListener("dragover", (e) => {
      if (e.dataTransfer?.types.includes("text/sticky-id")) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move";
        }
      }
    });
    container.addEventListener("drop", (e) => {
      const sourceId = e.dataTransfer?.getData("text/sticky-id");
      if (!sourceId)
        return;
      const targetEl = e.target;
      if (targetEl === container || targetEl?.classList.contains("sticky-board-empty") || targetEl?.classList.contains("sticky-notes-list")) {
        e.preventDefault();
        appState.moveStickyNoteToEnd(sourceId);
      }
    });
  }
  function showFormError(message) {
    if (elements.formError) {
      elements.formError.textContent = message;
      elements.formError.hidden = false;
    }
  }
  function clearFormError() {
    if (elements.formError) {
      elements.formError.textContent = "";
      elements.formError.hidden = true;
    }
  }
  var lastFocusedElement = null;
  var pendingConfirmCallback = null;
  function openGuideModal() {
    lastFocusedElement = document.activeElement;
    if (elements.guideModalOverlay) {
      elements.guideModalOverlay.hidden = false;
      elements.closeGuideModalBtn?.focus();
    }
  }
  function closeGuideModal() {
    if (elements.guideModalOverlay && !elements.guideModalOverlay.hidden) {
      elements.guideModalOverlay.hidden = true;
      lastFocusedElement?.focus();
    }
  }
  function openConfirmModal(config) {
    if (elements.confirmModalTitle)
      elements.confirmModalTitle.textContent = config.title;
    if (elements.confirmModalMessage)
      elements.confirmModalMessage.textContent = config.message;
    if (elements.confirmModalBadge)
      elements.confirmModalBadge.textContent = config.badge || "\u26A0";
    if (elements.confirmModalActionBtn) {
      elements.confirmModalActionBtn.textContent = config.actionText;
      elements.confirmModalActionBtn.className = `btn btn-sm ${config.actionIsDanger ? "btn-danger" : "btn-primary"}`;
    }
    pendingConfirmCallback = config.onConfirm;
    if (elements.confirmModalOverlay) {
      elements.confirmModalOverlay.hidden = false;
      elements.confirmModalActionBtn?.focus();
    }
  }
  function closeConfirmModal() {
    if (elements.confirmModalOverlay && !elements.confirmModalOverlay.hidden) {
      elements.confirmModalOverlay.hidden = true;
      pendingConfirmCallback = null;
    }
  }
  function openMobileDrawer() {
    if (elements.mobileDrawerOverlay) {
      elements.mobileDrawerOverlay.hidden = false;
      elements.mobileMenuBtn?.setAttribute("aria-expanded", "true");
      elements.closeMobileDrawerBtn?.focus();
    }
  }
  function closeMobileDrawer() {
    if (elements.mobileDrawerOverlay && !elements.mobileDrawerOverlay.hidden) {
      elements.mobileDrawerOverlay.hidden = true;
      elements.mobileMenuBtn?.setAttribute("aria-expanded", "false");
      elements.mobileMenuBtn?.focus();
    }
  }
  function bindEventListeners() {
    if (elements.form) {
      elements.form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearFormError();
        const raw = elements.input?.value ?? "";
        const trimmed = raw.trim();
        if (!trimmed) {
          showFormError("Please enter a task description");
          elements.input?.focus();
          return;
        }
        const priority = elements.prioritySelect?.value ?? "MEDIUM";
        const dueDate = elements.dueDateInput?.value.trim() || void 0;
        const dueTime = elements.dueTimeInput?.value.trim() || void 0;
        const success = appState.addTask(trimmed, priority, "todo", dueDate, dueTime);
        if (success) {
          if (elements.input) {
            elements.input.value = "";
            elements.input.focus();
          }
          if (elements.prioritySelect)
            elements.prioritySelect.value = "MEDIUM";
          if (elements.dueDateInput)
            elements.dueDateInput.value = "";
          if (elements.dueTimeInput)
            elements.dueTimeInput.value = "";
        }
      });
    }
    if (elements.input) {
      elements.input.addEventListener("input", () => {
        if (elements.formError && !elements.formError.hidden) {
          clearFormError();
        }
      });
    }
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", (e) => {
        const target = e.target;
        appState.setSearchQuery(target.value);
      });
      elements.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          appState.setSearchQuery("");
        }
      });
    }
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener("click", () => {
        appState.setSearchQuery("");
        elements.searchInput?.focus();
      });
    }
    elements.statusTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const status = tab.getAttribute("data-status");
        if (status === "ALL" || status === "ACTIVE" || status === "COMPLETED") {
          appState.setStatusFilter(status);
        }
      });
    });
    if (elements.priorityFilterSelect) {
      elements.priorityFilterSelect.addEventListener("change", (e) => {
        const target = e.target;
        const priority = target.value;
        if (priority === "ALL" || priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
          appState.setPriorityFilter(priority);
        }
      });
    }
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener("click", () => {
        appState.resetAllFilters();
      });
    }
    if (elements.toggleAddStickyBtn) {
      elements.toggleAddStickyBtn.addEventListener("click", () => {
        if (elements.stickyComposer?.hidden) {
          openStickyComposer();
        } else {
          closeStickyComposer();
        }
      });
    }
    if (elements.cancelStickyBtn) {
      elements.cancelStickyBtn.addEventListener("click", () => {
        closeStickyComposer();
      });
    }
    if (elements.saveStickyBtn && elements.stickyInput) {
      elements.saveStickyBtn.addEventListener("click", () => {
        const raw = elements.stickyInput?.value ?? "";
        const trimmed = raw.trim();
        if (!trimmed) {
          elements.stickyInput?.focus();
          return;
        }
        appState.addStickyNote(trimmed, activeComposerColor);
        closeStickyComposer();
      });
      elements.stickyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          elements.saveStickyBtn?.click();
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeStickyComposer();
        }
      });
    }
    elements.colorDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const color = dot.getAttribute("data-color");
        if (color) {
          activeComposerColor = color;
          elements.colorDots.forEach((d) => {
            const isCurrent = d === dot;
            d.classList.toggle("active", isCurrent);
            d.setAttribute("aria-pressed", isCurrent ? "true" : "false");
          });
        }
      });
    });
    if (elements.howToUseBtn) {
      elements.howToUseBtn.addEventListener("click", openGuideModal);
    }
    if (elements.closeGuideModalBtn) {
      elements.closeGuideModalBtn.addEventListener("click", closeGuideModal);
    }
    if (elements.btnCloseGuideFooter) {
      elements.btnCloseGuideFooter.addEventListener("click", closeGuideModal);
    }
    if (elements.guideModalBackdrop) {
      elements.guideModalBackdrop.addEventListener("click", closeGuideModal);
    }
    if (elements.btnLoadDemoData) {
      elements.btnLoadDemoData.addEventListener("click", () => {
        openConfirmModal({
          title: "Enable demo data?",
          message: "This will remove your current tasks and notes and replace them with the FocusList demo data.\n\nYour current data will be lost.",
          badge: "\u2726",
          actionText: "Enable Demo Data",
          actionIsDanger: false,
          onConfirm: () => {
            appState.enableDemoData();
            closeConfirmModal();
            closeGuideModal();
          }
        });
      });
    }
    if (elements.btnResetAppData) {
      elements.btnResetAppData.addEventListener("click", () => {
        openConfirmModal({
          title: "Reset FocusList?",
          message: "This will clear all of your tasks, sticky notes, and saved FocusList data from this browser.\n\nThis cannot be undone.",
          badge: "\u26A0",
          actionText: "Reset Everything",
          actionIsDanger: true,
          onConfirm: () => {
            appState.resetAllData();
            closeConfirmModal();
            closeGuideModal();
          }
        });
      });
    }
    if (elements.confirmModalCancelBtn) {
      elements.confirmModalCancelBtn.addEventListener("click", closeConfirmModal);
    }
    if (elements.confirmModalBackdrop) {
      elements.confirmModalBackdrop.addEventListener("click", closeConfirmModal);
    }
    if (elements.confirmModalActionBtn) {
      elements.confirmModalActionBtn.addEventListener("click", () => {
        if (pendingConfirmCallback) {
          pendingConfirmCallback();
        }
      });
    }
    if (elements.mobileMenuBtn) {
      elements.mobileMenuBtn.addEventListener("click", openMobileDrawer);
    }
    if (elements.closeMobileDrawerBtn) {
      elements.closeMobileDrawerBtn.addEventListener("click", closeMobileDrawer);
    }
    if (elements.mobileDrawerBackdrop) {
      elements.mobileDrawerBackdrop.addEventListener("click", closeMobileDrawer);
    }
    elements.drawerNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-drawer-target");
        closeMobileDrawer();
        if (target === "tasks") {
          document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
        } else if (target === "sticky") {
          document.getElementById("sticky-board-section")?.scrollIntoView({ behavior: "smooth" });
        } else if (target === "today") {
          document.getElementById("todays-list-section")?.scrollIntoView({ behavior: "smooth" });
        } else if (target === "kanban") {
          document.getElementById("kanban-wall")?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
    if (elements.drawerHowToUseBtn) {
      elements.drawerHowToUseBtn.addEventListener("click", () => {
        closeMobileDrawer();
        openGuideModal();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
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
  function init() {
    elements = getElements();
    appState.subscribe(render);
    bindEventListeners();
    render(appState.getStateSnapshot());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
