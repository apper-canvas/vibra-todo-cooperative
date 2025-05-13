import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const AlertCircleIcon = getIcon('AlertCircle');

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md p-8 bg-white dark:bg-surface-800 rounded-lg shadow-lg text-center"
      >
        <div className="flex justify-center mb-4">
          <AlertCircleIcon className="w-16 h-16 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-surface-800 dark:text-white">Page Not Found</h1>
        <p className="mb-6 text-surface-600 dark:text-surface-300">The page you are looking for doesn't exist or has been moved.</p>
        
        <Link to="/" className="btn btn-primary inline-block">
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;