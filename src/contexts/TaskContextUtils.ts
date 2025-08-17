import { Task, TaskStatus } from '../types/task';

export const getTodayTasks = (tasks: Task[]) => {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = (task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate()).toISOString().split('T')[0];
    return taskDate === today;
  });
};

export const getUpcomingTasks = (tasks: Task[], days: number = 7) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate();
    return taskDate > now && taskDate <= futureDate;
  });
};

export const getOverdueTasks = (tasks: Task[]) => {
  const now = new Date();
  return tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return (task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate()) < now;
  });
};

export const getTasksByStatus = (tasks: Task[], status: TaskStatus) => {
  return tasks.filter(task => task.status === status);
};