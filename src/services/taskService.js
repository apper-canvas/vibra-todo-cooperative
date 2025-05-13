// Mapping from the application's category system to the database categories
const categoryMapping = {
  'work': 'Work',
  'personal': 'Personal',
  'shopping': 'Shopping',
  'health': 'Health',
};

// Fetch tasks from the database
export async function fetchTasks(category = null) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Build query parameters
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "title" } },
        { Field: { Name: "description" } },
        { Field: { Name: "completed" } },
        { Field: { Name: "priority" } },
        { Field: { Name: "category" } },
        { Field: { Name: "dueDate" } },
        { Field: { Name: "position" } },
        { Field: { Name: "CreatedOn" } }
      ],
      orderBy: [{ field: "position", direction: "DESC" }]
    };
    
    // Add category filter if specified
    if (category) {
      params.where = [
        {
          fieldName: "category",
          Operator: "ExactMatch",
          values: [categoryMapping[category]]
        }
      ];
    }
    
    const response = await apperClient.fetchRecords("task5", params);
    
    if (!response || !response.data) {
      return [];
    }
    
    // Map database records to application format
    return response.data.map(task => ({
      Id: task.Id,
      title: task.title || '',
      description: task.description || '',
      completed: task.completed || false,
      priority: task.priority || 'medium',
      category: Object.keys(categoryMapping).find(key => 
        categoryMapping[key] === task.category
      ) || 'personal',
      dueDate: task.dueDate || '',
      position: task.position || 0,
      createdAt: task.CreatedOn || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

// Create a new task in the database
export async function createTask(taskData) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Map task data to database format
    const record = {
      title: taskData.title,
      description: taskData.description || '',
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      category: categoryMapping[taskData.category] || 'Personal',
      dueDate: taskData.dueDate || null,
      position: taskData.position || 0
    };
    
    const params = {
      records: [record]
    };
    
    const response = await apperClient.createRecord("task5", params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create task");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Update an existing task in the database
export async function updateTask(taskId, taskData) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Map task data to database format
    const record = {
      Id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      category: categoryMapping[taskData.category] || 'Personal',
      dueDate: taskData.dueDate || null
    };
    
    // Only include position if it's provided
    if (taskData.position !== undefined) {
      record.position = taskData.position;
    }
    
    const params = {
      records: [record]
    };
    
    const response = await apperClient.updateRecord("task5", params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update task");
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Delete a task from the database
export async function deleteTask(taskId) {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [taskId]
    };
    
    const response = await apperClient.deleteRecord("task5", params);
    
    if (!response || !response.success) {
      throw new Error("Failed to delete task");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Fetch statistics about tasks
export async function fetchTaskStats() {
  try {
    const tasks = await fetchTasks();
    
    // Calculate statistics
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    
    // Calculate tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueToday = tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() === today.getTime() && !task.completed;
    }).length;
    
    return {
      completed,
      total,
      dueToday,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return {
      completed: 0,
      total: 0,
      dueToday: 0,
      progress: 0
    };
  }
}