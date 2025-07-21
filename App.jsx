import React from 'react';
import GoalTracker from './components/GoalTracker';

function App() {
  return (
    <div className="App">
      <GoalTracker />
    </div>
  );
}

export default App;





import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5181/api/goals'; // 🔁 Update port if needed

function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalText, setEditGoalText] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await axios.get(API_BASE);
    setGoals(res.data);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    await axios.post(API_BASE, {
      goalText: newGoal,
      isCompleted: false
    });
    setNewGoal('');
    fetchGoals();
  };

  const markComplete = async (goal) => {
    await axios.put(`${API_BASE}/${goal.id}`, {
      ...goal,
      isCompleted: true
    });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
    fetchGoals();
  };

  const updateGoal = async () => {
    await axios.put(`${API_BASE}/${editGoalId}`, {
      id: editGoalId,
      goalText: editGoalText,
      isCompleted: false
    });
    setEditGoalId(null);
    setEditGoalText('');
    fetchGoals();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🌟 Dreamify - Your Goal Tracker</h1>

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
                    <button onClick={updateGoal}>💾 Save</button>
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
