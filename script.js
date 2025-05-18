document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://xx.supabase.co";
  const SUPABASE_KEY = "your-anon-key"; // Use anon/public key for frontend
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  ['link', 'hans'].forEach(user => {
    loadUserData(user);

    document.querySelector(`.add-form[data-user="${user}"]`).addEventListener('submit', async e => {
      e.preventDefault();
      const time = e.target.time.value;
      const event = e.target.event.value;
      await supabase.from('schedule').insert([{ user, time, event }]);
      loadUserData(user);
      e.target.reset();
    });

    document.querySelector(`.todo-form[data-user="${user}"]`).addEventListener('submit', async e => {
      e.preventDefault();
      const task = e.target.task.value;
      await supabase.from('todo').insert([{ user, task, done: false }]);
      loadUserData(user);
      e.target.reset();
    });
  });

  async function loadUserData(user) {
    const { data: schedule } = await supabase
      .from('schedule')
      .select('*')
      .eq('user', user)
      .order('time');

    const { data: todos } = await supabase
      .from('todo')
      .select('*')
      .eq('user', user)
      .order('id');

    const scheduleDiv = document.getElementById(`${user}-schedule`);
    const todoList = document.getElementById(`${user}-todo`);
    scheduleDiv.innerHTML = '';
    todoList.innerHTML = '';

    schedule.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'schedule-entry';
      div.textContent = `${entry.time} - ${entry.event}`;
      scheduleDiv.appendChild(div);
    });

    todos.forEach(todo => {
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

  window.toggleTodo = async function(user, id) {
    const { data: [todo] } = await supabase
      .from('todo')
      .select('*')
      .eq('id', id)
      .single();

    await supabase
      .from('todo')
      .update({ done: !todo.done })
      .eq('id', id);

    loadUserData(user);
  };

  window.deleteTodo = async function(user, id) {
    await supabase
      .from('todo')
      .delete()
      .eq('id', id);

    loadUserData(user);
  };
});
