import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import getIcon from '../utils/iconUtils';

// Icon declarations
const PlusIcon = getIcon('Plus');
const CheckIcon = getIcon('Check');
const XIcon = getIcon('X');
const TrashIcon = getIcon('Trash');
const EditIcon = getIcon('Edit');
const SaveIcon = getIcon('Save');
const CalendarIcon = getIcon('Calendar');
const TagIcon = getIcon('Tag');
const AlertCircleIcon = getIcon('AlertCircle');
const ArrowUpCircleIcon = getIcon('ArrowUpCircle');
const ArrowDownCircleIcon = getIcon('ArrowDownCircle');
const LoaderIcon = getIcon('Loader');

// Priority color mapping
const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

// Task categories
const categories = [
  { id: 'work', name: 'Work', color: '#5271FF' },
  { id: 'personal', name: 'Personal', color: '#FF5757' },
  { id: 'shopping', name: 'Shopping', color: '#4CAF50' },
  { id: 'health', name: 'Health', color: '#9C27B0' },
];

const emptyTask = {
  title: '',
  description: '',
  completed: false,
  priority: 'medium',
  category: 'personal',
  dueDate: '',
};

function TaskList({ onTasksChange }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from API
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTasks(selectedCategory !== 'all' ? selectedCategory : null);
      setTasks(data);
      onTasksChange?.();
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks when category changes
  useEffect(() => {
    loadTasks();
  }, [selectedCategory]);
  
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const addNewTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    try {
      await createTask({
        ...newTask,
        position: tasks.length > 0 ? tasks[0].position + 1 : 1, // Add at the beginning
      });
      
      setNewTask(emptyTask);
      setFormVisible(false);
      toast.success("Task added successfully!");
      await loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };
  
  const toggleComplete = async (task) => {
    try {
      await updateTask(task.Id, {
        ...task,
        completed: !task.completed,
      });
      
      // Optimistic UI update
      setTasks(prev => 
        prev.map(t => t.Id === task.Id ? { ...t, completed: !t.completed } : t)
      );
      
      onTasksChange?.();
    } catch (error) {
      console.error("Error updating task completion:", error);
      toast.error("Failed to update task. Please try again.");
      // Revert optimistic update
      await loadTasks();
    }
  };
  
  const deleteTaskHandler = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        // Optimistic UI update
        setTasks(prev => prev.filter(t => t.Id !== taskId));
        toast.success("Task deleted successfully!");
        onTasksChange?.();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task. Please try again.");
        // Revert optimistic update
        await loadTasks();
      }
    }
  };
  
  const startEditing = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask((prev) => ({ ...prev, [name]: value }));
  };
  
  const saveEdit = async () => {
    if (!editingTask.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }
    
    try {
      await updateTask(editingTask.Id, editingTask);
      
      // Optimistic UI update
      setTasks(prev => 
        prev.map(t => t.Id === editingTask.Id ? editingTask : t)
      );
      
      setEditingTask(null);
      toast.success("Task updated successfully!");
      onTasksChange?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
      // Revert optimistic update
      await loadTasks();
    }
  };
  
  const moveTask = async (task, direction) => {
    const taskIndex = tasks.findIndex(t => t.Id === task.Id);
    if ((direction === 'up' && taskIndex === 0) || 
        (direction === 'down' && taskIndex === tasks.length - 1)) {
      return;
    }
    
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    const targetTask = newTasks[targetIndex];
    
    // Swap positions
    const currentPosition = task.position;
    
    try {
      // Update positions in database
      await updateTask(task.Id, { ...task, position: targetTask.position });
      await updateTask(targetTask.Id, { ...targetTask, position: currentPosition });
      
      // Swap tasks for UI update
      [newTasks[taskIndex], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[taskIndex]];
      
      // Update positions in local array
      newTasks[taskIndex].position = targetTask.position;
      newTasks[targetIndex].position = currentPosition;
      
      setTasks(newTasks);
    } catch (error) {
      console.error("Error moving task:", error);
      toast.error("Failed to reorder tasks. Please try again.");
      await loadTasks();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <TagIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormVisible(!formVisible)}
            className="btn btn-primary flex items-center gap-2"
          >
            {formVisible ? (
              <>
                <XIcon className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                <span>Add Task</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* New Task Form */}
      <AnimatePresence>
        {formVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={addNewTask} className="neu-card p-4 md:p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Task Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  placeholder="Enter task title..."
                  className="input"
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-red-500 text-sm flex items-center gap-1">
                    <AlertCircleIcon className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  placeholder="Enter task description..."
                  rows="2"
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      name="priority"
                      value={newTask.priority}
                      onChange={handleNewTaskChange}
                      className="input appearance-none pr-8"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-current pointer-events-none" 
                      style={{ color: newTask.priority === 'low' ? '#4CAF50' : newTask.priority === 'medium' ? '#FF9800' : '#F44336' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={newTask.category}
                      onChange={handleNewTaskChange}
                      className="input appearance-none pr-8"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <TagIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={newTask.dueDate}
                      onChange={handleNewTaskChange}
                      className="input"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setFormVisible(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="card p-6 flex items-center justify-center">
            <LoaderIcon className="animate-spin w-8 h-8 text-primary" />
            <span className="ml-2 text-surface-600 dark:text-surface-400">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-surface-500 dark:text-surface-400">No tasks found. Add a new task to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem 
              key={task.Id} 
              task={task} 
              onToggleComplete={toggleComplete}
              onDelete={deleteTaskHandler}
              onEdit={startEditing}
              onMove={moveTask}
              editingTask={editingTask}
              handleEditChange={handleEditChange}
              saveEdit={saveEdit}
              cancelEdit={() => setEditingTask(null)}
              categories={categories}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Task item component
function TaskItem({ 
  task, onToggleComplete, onDelete, onEdit, onMove, 
  editingTask, handleEditChange, saveEdit, cancelEdit,
  categories 
}) {
  const isEditing = editingTask && editingTask.Id === task.Id;
  
  if (isEditing) {
    return (
      <motion.div layout className="card p-4">
        <div className="space-y-3">
          <input
            type="text"
            name="title"
            value={editingTask.title}
            onChange={handleEditChange}
            className="input font-medium text-lg w-full"
            autoFocus
          />
          
          <textarea
            name="description"
            value={editingTask.description}
            onChange={handleEditChange}
            rows="2"
            className="input w-full"
            placeholder="Task description..."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-surface-500 block mb-1">Priority</label>
              <select
                name="priority"
                value={editingTask.priority}
                onChange={handleEditChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-1">Category</label>
              <select
                name="category"
                value={editingTask.category}
                onChange={handleEditChange}
                className="input"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-surface-500 block mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={editingTask.dueDate}
                onChange={handleEditChange}
                className="input"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={cancelEdit}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="btn btn-primary flex items-center gap-2"
            >
              <SaveIcon className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`card p-4 ${task.completed ? 'opacity-70' : ''}`}
    >
      <div>
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button 
              onClick={() => onToggleComplete(task)}
              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1
                ${task.completed 
                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                  : 'border-surface-300 dark:border-surface-600 hover:border-green-500'
                }`}
            >
              {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-lg truncate ${task.completed ? 'line-through text-surface-500' : ''}`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={`mt-1 text-surface-600 dark:text-surface-400 text-sm line-clamp-2 ${task.completed ? 'line-through opacity-75' : ''}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div 
                  className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]} text-white flex items-center gap-1 whitespace-nowrap`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </div>
                
                <div 
                  className="text-xs px-2 py-0.5 rounded text-surface-800 dark:text-white flex items-center gap-1 whitespace-nowrap"
                  style={{ 
                    backgroundColor: task.category === 'work' ? 'rgba(82, 113, 255, 0.2)' : 
                      task.category === 'personal' ? 'rgba(255, 87, 87, 0.2)' : 
                      task.category === 'shopping' ? 'rgba(76, 175, 80, 0.2)' : 
                      'rgba(156, 39, 176, 0.2)' 
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.id === task.category)?.color }} />
                  {categories.find(c => c.id === task.category)?.name}
                </div>
                
                {task.dueDate && (
                  <div className="text-xs px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 flex items-center gap-1 whitespace-nowrap">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center">
              <button 
                onClick={() => onMove(task, 'up')}
                className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <ArrowUpCircleIcon className="w-5 h-5 text-surface-500" />
              </button>
              <button 
                onClick={() => onMove(task, 'down')}
                className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <ArrowDownCircleIcon className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            
            <button 
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <EditIcon className="w-5 h-5 text-surface-500" />
            </button>
            
            <button 
              onClick={() => onDelete(task.Id)}
              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskList;