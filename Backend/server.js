const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = 'https://nlblghesdlyebtsjinbx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYmxnaGVzZGx5ZWJ0c2ppbmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyNDYsImV4cCI6MjA2MzE1MDI0Nn0.Ba_t5fWZkr5pCpPNp3i9GG6tGkdCMQt1RD3Oz02at-0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(bodyParser.json());

app.get('/data/:user', async (req, res) => {
  const { user } = req.params;

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

  res.json({ schedule, todos });
});

app.post('/schedule/:user', async (req, res) => {
  const { user } = req.params;
  const { time, event } = req.body;

  const { data, error } = await supabase
    .from('schedule')
    .insert([{ user, time, event }]);

  res.json({ success: !error });
});

app.post('/todo/:user', async (req, res) => {
  const { user } = req.params;
  const { task } = req.body;

  const { data, error } = await supabase
    .from('todo')
    .insert([{ user, task, done: false }]);

  res.json({ success: !error });
});

app.patch('/todo/:user/:id/toggle', async (req, res) => {
  const { id } = req.params;

  const { data: [todo] } = await supabase
    .from('todo')
    .select('*')
    .eq('id', id)
    .limit(1);

  const { error } = await supabase
    .from('todo')
    .update({ done: !todo.done })
    .eq('id', id);

  res.json({ success: !error });
});

app.delete('/todo/:user/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('todo')
    .delete()
    .eq('id', id);

  res.json({ success: !error });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
