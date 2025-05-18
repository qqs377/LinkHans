document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = 'https://nlblghesdlyebtsjinbx.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYmxnaGVzZGx5ZWJ0c2ppbmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyNDYsImV4cCI6MjA2MzE1MDI0Nn0.Ba_t5fWZkr5pCpPNp3i9GG6tGkdCMQt1RD3Oz02at-0';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function drawSchedule(user, schedule) {
  const canvas = document.getElementById(`${user}-canvas`);
  const ctx = canvas.getContext('2d');
  const hourHeight = 60; // pixels per hour
  const canvasWidth = canvas.width;
  const paddingLeft = 40;
  const blockWidth = canvasWidth - paddingLeft - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw time labels (12 PM to 11 PM)
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";
  for (let i = 12; i <= 23; i++) {
    const y = (i - 12) * hourHeight;
    const timeLabel = (i === 12 ? '12 PM' : (i > 12 ? `${i - 12} PM` : `${i} AM`));
    ctx.fillText(timeLabel, 2, y + 12);
    ctx.strokeStyle = "#eee";
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  // Convert to hour blocks and detect overlap
  const parsedEvents = schedule.map((e, i) => {
    const [hour, minute] = e.time.split(':').map(Number);
    return {
      ...e,
      startHour: hour + minute / 60,
      endHour: hour + minute / 60 + 1, // 1 hour default duration
      color: `hsl(${(i * 50) % 360}, 70%, 75%)`,
    };
  });

  // Optional: detect overlapping and apply offset
  parsedEvents.forEach((event, i) => {
    const y = (event.startHour - 12) * hourHeight;
    const height = (event.endHour - event.startHour) * hourHeight;
    const x = paddingLeft;

    ctx.fillStyle = event.color;
    ctx.fillRect(x, y, blockWidth, height);

    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.fillText(event.event, x + 5, y + 15);
  });
}

  
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

    drawSchedule(user, schedule);

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
