import mongoose from "mongoose";

export  const sampleTodos = [
  {
    title: "Buy groceries",
    description: "Milk, bread, eggs, and fruits",
    priority: "medium",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
        completed: false,

  },
  {
    title: "Finish project report",
    description: "Complete the final section and review",
    priority: "high",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        completed: false,

  },
  {
    title: "Weekly workout",
    description: "3 sessions this week",
    priority: "low",
    completed: false,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days

  },
] as const;

export const sampleTodosWithIds = sampleTodos.map((todo) => ({
  ...todo,
  _id: new mongoose.Types.ObjectId(),
}));




