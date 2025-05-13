import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
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
  id: '',
  title: '',
  description: '',
  completed: false,
  priority: 'medium',
  categoryId: 'personal',
  dueDate: '',
  colorCode: '',
};

function MainFeature({ onTasksChange }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('vibraTodoTasks');
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        title: "Welcome to VibraToDo!",
        description: "This is your first task. Try completing it by clicking the checkbox.",
        completed: false,
        priority: "medium",
        categoryId: "personal",
        dueDate: "",
        colorCode: "",
        createdAt: new Date().toISOString()
      }
    ];
  });
  
  const [newTask, setNewTask] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vibraTodoTasks', JSON.stringify(tasks));
    onTasksChange?.(tasks);
  }, [tasks, onTasksChange]);
  
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const addNewTask = (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      colorCode: categories.find(cat => cat.id === newTask.categoryId)?.color || '',
    };
    
    setTasks((prev) => [taskToAdd, ...prev]);
    setNewTask(emptyTask);
    setFormVisible(false);
    toast.success("Task added successfully!");
  };
  
  const toggleComplete = (id) => {
    setTasks((prev) => 
      prev.map((task) => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.success("Task deleted successfully!");
  };
  
  const startEditing = (task) => {
    setEditingTask(task);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask((prev) => ({ ...prev, [name]: value }));
  };
  
  const saveEdit = () => {
    if (!editingTask.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }
    
    setTasks((prev) => 
      prev.map((task) => 
        task.id === editingTask.id ? {
          ...editingTask,
          colorCode: categories.find(cat => cat.id === editingTask.categoryId)?.color || ''
        } : task
      )
    );
    
    setEditingTask(null);
    toast.success("Task updated successfully!");
  };
  
  const moveTask = (id, direction) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if ((direction === 'up' && taskIndex === 0) || 
        (direction === 'down' && taskIndex === tasks.length - 1)) {
      return;
    }
    
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    
    // Swap tasks
    [newTasks[taskIndex], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[taskIndex]];
    setTasks(newTasks);
  };
  
  // Filter tasks based on selected category
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.categoryId === selectedCategory);

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
                  <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={newTask.categoryId}
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
        {filteredTasks.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-surface-500 dark:text-surface-400">No tasks found. Add a new task to get started!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`card p-4 ${task.completed ? 'opacity-70' : ''}`}
            >
              {editingTask && editingTask.id === task.id ? (
                // Edit Mode
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
                        name="categoryId"
                        value={editingTask.categoryId}
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
                      onClick={() => setEditingTask(null)}
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
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => toggleComplete(task.id)}
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
                            style={{ backgroundColor: task.categoryId === 'work' ? 'rgba(82, 113, 255, 0.2)' : 
                                    task.categoryId === 'personal' ? 'rgba(255, 87, 87, 0.2)' : 
                                    task.categoryId === 'shopping' ? 'rgba(76, 175, 80, 0.2)' : 
                                    'rgba(156, 39, 176, 0.2)' }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.id === task.categoryId)?.color }} />
                            {categories.find(c => c.id === task.categoryId)?.name}
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
                          onClick={() => moveTask(task.id, 'up')}
                          className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                        >
                          <ArrowUpCircleIcon className="w-5 h-5 text-surface-500" />
                        </button>
                        <button 
                          onClick={() => moveTask(task.id, 'down')}
                          className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                        >
                          <ArrowDownCircleIcon className="w-5 h-5 text-surface-500" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => startEditing(task)}
                        className="p-1.5 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                      >
                        <EditIcon className="w-5 h-5 text-surface-500" />
                      </button>
                      
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainFeature;