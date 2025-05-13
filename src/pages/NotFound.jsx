import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

// Icon declarations
const AlertCircleIcon = getIcon('AlertCircle');
const ArrowLeftIcon = getIcon('ArrowLeft');

function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
        <AlertCircleIcon className="w-10 h-10 text-red-500" />
      </div>
      
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
      >
        404
      </motion.h1>
      
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-2xl md:text-3xl font-bold mb-4"
      >
        Page Not Found
      </motion.h2>
      
      <motion.p 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-surface-600 dark:text-surface-400 mb-8 max-w-md"
      >
        Oops! The page you are looking for doesn't exist or has been moved.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default NotFound;