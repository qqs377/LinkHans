const API_BASE = 'https://your-backend-url.com';

document.addEventListener('DOMContentLoaded', () => {
  ['link', 'hans'].forEach(user => {
    loadUserData(user);

    document.querySelector(`.add-form[data-user="${user}"]`).addEventListener('submit', e => {
      e.preventDefault();
      const time = e.target.time.value;
      const event = e.target.event.value;
      addSchedule(user, time, event);
      e.target.reset();
    });

    document.querySelector(`.todo-form[data-user="${user}"]`).addEventListener('submit', e => {
      e.preventDefault();
      const task = e.target.task.value;
      addTodo(user, task);
      e.target.reset();
    });
  });
});

async function loadUserData(user) {
  const res = await fetch(`${API_BASE}/data/${user}`);
  const data = await res.json();
  const scheduleDiv = document.getElementById(`${user}-schedule`);
  const todoList = document.getElementById(`${user}-todo`);

  scheduleDiv.innerHTML = '';
  todoList.innerHTML = '';

  data.schedule.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'schedule-entry';
    div.textContent = `${entry.time} - ${entry.event}`;
    scheduleDiv.appendChild(div);
  });

  data.todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.innerHTML = `
      <span>${todo.task}</span>
      <div>
        <button onclick="toggleTodo('${user}', ${todo.id})">✓</button>
        <button onclick="deleteTodo('${user}', ${todo.id})">🗑</button>
      </div>
    `;
    todoList.appendChild(li);
  });
}

async function addSchedule(user, time, event) {
  await fetch(`${API_BASE}/schedule/${user}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time, event })
  });
  loadUserData(user);
}

async function addTodo(user, task) {
  await fetch(`${API_BASE}/todo/${user}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task })
  });
  loadUserData(user);
}

async function toggleTodo(user, id) {
  await fetch(`${API_BASE}/todo/${user}/${id}/toggle`, { method: 'PATCH' });
  loadUserData(user);
}

async function deleteTodo(user, id) {
  await fetch(`${API_BASE}/todo/${user}/${id}`, { method: 'DELETE' });
  loadUserData(user);
}
