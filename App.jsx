
import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { SdfTable } from '@synerg/react-components';

const API_BASE = '/api/goals';

function GoalTracker() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalText, setEditGoalText] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchGoals();
  }, [page]);

  const fetchGoals = async () => {
    try {
      const res = await api.get(`${API_BASE}?pageNumber=${page}&pageSize=${pageSize}`);
      setGoals(res.data);
      console.log(res.headers['x-total-count']);
      const totalCount = parseInt(res.headers['x-total-count']);
      if (!isNaN(totalCount)) {
        setTotalPages(Math.ceil(totalCount / pageSize));
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    await api.post(API_BASE, { goalText: newGoal, isCompleted: false });
    console.log(newGoal);
    setNewGoal('');
    setPage(1); // Reset to first page
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

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🌟 Dreamify - Your Goal Tracker</h1>
      <sdf-button onClick={logout}>Logout</sdf-button>
      <br /><br />

      <sdf-input
        type="text"
        placeholder="Enter a goal"
        style={{ padding: '20px'}}

        value={newGoal}
        onsdfChange={(e) => setNewGoal(e.target.value)}
      />
      <sdf-button style={{ color: 'red'}} onClick={addGoal}>Add Goal</sdf-button>

      <br /><br />

      {goals.length === 0 ? (
        <p>No goals yet. Start dreaming!</p>
      ) : (
        <>
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
                  <td>{(page - 1) * pageSize + index + 1}</td>
                  <td>
                    {goal.isCompleted ? (
                      <s>{goal.goalText}</s>
                    ) : editGoalId === goal.id ? (
                      <sdf-input
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
                      <>
                        <sdf-button onClick={() => markComplete(goal)}>✔ Mark</sdf-button>
                        <sdf-button onClick={() => {
                          setEditGoalId(goal.id);
                          setEditGoalText(goal.goalText);
                        }}>✏ Update</sdf-button>
                      </>
                    )}
                    {editGoalId === goal.id && (
                      <sdf-button onClick={updateGoal}>💾 Save</sdf-button>
                    )}
                    <sdf-button onClick={() => deleteGoal(goal.id)}>🗑 Delete</sdf-button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ marginTop: '20px' }}>
            <sdf-button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ⬅ Previous
            </sdf-button>
            <span style={{ margin: '0 15px' }}>Page {page} of {totalPages}</span>
            <sdf-button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next ➡
            </sdf-button>
          </div>
        </>
      )}
    </div>
  );
}

export default GoalTracker;
import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import {
  SdfAlert,
  SdfBusyIndicator,
  SdfButton,
  SdfCheckbox,
  SdfFocusPane,
  SdfGrid,
  SdfIcon,
  SdfInput,
  SdfSearch,
  SdfSelectSimple,
  SdfSpotIllustration,
  } from "@synerg/react-components";

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
      <SdfInput placeholder="Email" value={email}

      onSdfChange={e=>{ setEmail(e.target.value)
      }} />
      <br/>
      <sdf-input type="password" placeholder="Password" value={password} onsdfChange={e=>setPassword(e.target.value)} />
      <br/>
      <sdf-button style = {{padding:"20px"}} onClick={submit}>Login</sdf-button>
      {err && <p style={{color:'red'}}>{err}</p>}
      <p>New here? <Link to="/signup">Create account</Link></p>
    </div>
  );
}import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { SdfButton } from '@synerg/react-components';

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
      <sdf-input placeholder="Email" value={email} onsdfChange={e=>setEmail(e.target.value)} />
      <br/>
      <sdf-input type="password" placeholder="Password" value={password} onsdfChange={e=>setPassword(e.target.value)} />
      <br/>
      <sdf-button style = {{padding:"20px"}} onClick={submit}>Create Account</sdf-button>
      {msg && <p>{msg}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5064', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else console.warn('no token in local storage');
  return config;
}
,
(error)=>Promise.reject(error));

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
