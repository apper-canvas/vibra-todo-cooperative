import { 
  Check, X, Plus, Edit, Save, Trash, Calendar, Tag, 
  CheckCircle, AlertCircle, PlusCircle, Activity,
  ChevronDown, ChevronUp, Clock, ArrowUpCircle, 
  ArrowDownCircle, LogOut, Loader
} from 'lucide-react';

// Icon mapping for easy import and usage
const iconMap = {
  Check,
  X,
  Plus,
  Edit,
  Save,
  Trash,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  LogOut,
  Loader
};

// Function to get icon by name
export default function getIcon(name) {
  return iconMap[name];
}