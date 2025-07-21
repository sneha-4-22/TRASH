import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://localhost:5001/api/goals';

export default function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    axios.get(API).then(res => setGoals(res.data));
  }, []);

  const addGoal = async () => {
    if (newGoal.trim()) {
      const res = await axios.post(API, { goalText: newGoal, isCompleted: false });
      setGoals([...goals, res.data]);
      setNewGoal('');
    }
  };

  const toggleComplete = async (goal) => {
    await axios.put(`${API}/${goal.id}`, { ...goal, isCompleted: !goal.isCompleted });
    setGoals(goals.map(g => g.id === goal.id ? { ...g, isCompleted: !g.isCompleted } : g));
  };

  const deleteGoal = async (id) => {
    await axios.delete(`${API}/${id}`);
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="App">
      <h2>🌟 Dreamify - Goal Tracker</h2>
      <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Enter a goal" />
      <button onClick={addGoal}>Add Goal</button>

      <ul>
        {goals.map(goal => (
          <li key={goal.id}>
            <span style={{ textDecoration: goal.isCompleted ? 'line-through' : 'none' }}>
              {goal.goalText}
            </span>
            <button onClick={() => toggleComplete(goal)}>✔</button>
            <button onClick={() => deleteGoal(goal.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
