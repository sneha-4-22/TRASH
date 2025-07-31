
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
                      <>
                        <button onClick={() => markComplete(goal)}>✔ Mark</button>
                        <button onClick={() => {
                          setEditGoalId(goal.id);
                          setEditGoalText(goal.goalText);
                        }}>✏ Update</button>
                      </>
                    )}
                    {editGoalId === goal.id && (
                      <button onClick={updateGoal}>💾 Save</button>
                    )}
                    <button onClick={() => deleteGoal(goal.id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ⬅ Previous
            </button>
            <span style={{ margin: '0 15px' }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default GoalTracker;
