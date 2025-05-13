import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

// Icon declarations
const CheckCircleIcon = getIcon('CheckCircle');
const PlusCircleIcon = getIcon('PlusCircle');
const CalendarIcon = getIcon('Calendar');
const ActivityIcon = getIcon('Activity');

function Home() {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Update stats when tasks change
  const updateStats = (tasks) => {
    setTotalTasks(tasks.length);
    setCompletedTasks(tasks.filter(task => task.completed).length);
  };
  
  return (
    <div className="space-y-6">
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Manage Your Tasks with Vibrant Style
          </h1>
          <p className="text-surface-600 dark:text-surface-300 text-base md:text-lg max-w-2xl">
            Stay organized and boost your productivity with our colorful task management app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="neu-card p-4 flex items-center"
          >
            <div className="p-3 rounded-full bg-primary/10 mr-3">
              <CheckCircleIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Completed Tasks</p>
              <p className="text-xl font-semibold">{completedTasks}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="neu-card p-4 flex items-center"
          >
            <div className="p-3 rounded-full bg-secondary/10 mr-3">
              <PlusCircleIcon className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Total Tasks</p>
              <p className="text-xl font-semibold">{totalTasks}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="neu-card p-4 flex items-center"
          >
            <div className="p-3 rounded-full bg-accent/10 mr-3">
              <CalendarIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Due Today</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="neu-card p-4 flex items-center"
          >
            <div className="p-3 rounded-full bg-purple-500/10 mr-3">
              <ActivityIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Progress</p>
              <p className="text-xl font-semibold">
                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-primary-light/5 via-secondary-light/5 to-accent/5 dark:from-primary-dark/10 dark:via-secondary-dark/10 dark:to-accent/10 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
        >
          <MainFeature onTasksChange={updateStats} />
        </motion.div>
      </section>
    </div>
  );
}

export default Home;