const STORAGE_KEY = "todo-app-items";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const footer = document.getElementById("footer");
const todoCount = document.getElementById("todoCount");
const clearCompleted = document.getElementById("clearCompleted");
const filters = document.getElementById("filters");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function getActiveCount() {
  return todos.filter((t) => !t.completed).length;
}

function render() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""}>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button type="button" class="btn-delete" aria-label="删除任务">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    todoList.appendChild(li);
  });

  const hasTodos = todos.length > 0;
  emptyState.classList.toggle("hidden", hasTodos);
  footer.hidden = !hasTodos;

  const active = getActiveCount();
  todoCount.textContent = `${active} 项待办`;

  const hasCompleted = todos.some((t) => t.completed);
  clearCompleted.style.visibility = hasCompleted ? "visible" : "hidden";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: generateId(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompletedTodos() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.classList.contains("todo-checkbox")) {
    toggleTodo(id);
  }

  if (e.target.closest(".btn-delete")) {
    deleteTodo(id);
  }
});

filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  currentFilter = btn.dataset.filter;

  filters.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });

  render();
});

clearCompleted.addEventListener("click", clearCompletedTodos);

render();
