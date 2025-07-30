import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5181', // change if your backend runs on another port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoalTracker from './components/GoalTracker';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoalTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setErr('Invalid email or password');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <br/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <br/>
      <button onClick={submit}>Login</button>
      {err && <p style={{color:'red'}}>{err}</p>}
      <p>New here? <Link to="/signup">Create account</Link></p>
    </div>
  );
}
import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await api.post('/api/auth/register', { email, password });
      setMsg('Account created. Redirecting to login...');
      setTimeout(()=>navigate('/login'), 700);
    } catch {
      setMsg('Failed. Email may already exist.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign up</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <br/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <br/>
      <button onClick={submit}>Create Account</button>
      {msg && <p>{msg}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/goals';

function GoalTracker() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalText, setEditGoalText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await api.get(API_BASE);
    setGoals(res.data);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    await api.post(API_BASE, { goalText: newGoal, isCompleted: false });
    setNewGoal('');
    fetchGoals();
  };

  const markComplete = async (goal) => {
    await api.put(`${API_BASE}/${goal.id}`, { ...goal, isCompleted: true });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await api.delete(`${API_BASE}/${id}`);
    fetchGoals();
  };

  const updateGoal = async () => {
    await api.put(`${API_BASE}/${editGoalId}`, {
      id: editGoalId,
      goalText: editGoalText,
      isCompleted: false
    });
    setEditGoalId(null);
    setEditGoalText('');
    fetchGoals();
  };

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🌟 Dreamify - Your Goal Tracker</h1>
      <button onClick={logout}>Logout</button>
      <br /><br />

      <input
        type="text"
        placeholder="Enter a goal"
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
      />
      <button onClick={addGoal}>Add Goal</button>

      <br /><br />

      {goals.length === 0 ? (
        <p>No goals yet. Start dreaming!</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>#</th>
              <th>Goal</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, index) => (
              <tr key={goal.id}>
                <td>{index + 1}</td>
                <td>
                  {goal.isCompleted ? (
                    <s>{goal.goalText}</s>
                  ) : editGoalId === goal.id ? (
                    <input
                      value={editGoalText}
                      onChange={(e) => setEditGoalText(e.target.value)}
                    />
                  ) : (
                    goal.goalText
                  )}
                </td>
                <td>{goal.isCompleted ? '✅ Done' : '⏳ Pending'}</td>
                <td>
                  {!goal.isCompleted && editGoalId !== goal.id && (
                    <button onClick={() => markComplete(goal)}>✔ Mark</button>
                  )}
                  {!goal.isCompleted && editGoalId !== goal.id && (
                    <button onClick={() => {
                      setEditGoalId(goal.id);
                      setEditGoalText(goal.goalText);
                    }}>✏ Update</button>
                  )}
                  {editGoalId === goal.id && (
                    <buton onClick={updateGoal}>💾 Save</button>
                  )}
                  <button onClick={() => deleteGoal(goal.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GoalTracker;
