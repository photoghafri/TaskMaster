import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { formatDate } from '../utils/dateUtils';

// Local implementation of toJsDate
function toJsDate(date: any): Date | null {
  if (!date) return null;

  try {
    // Already a Date object
    if (date instanceof Date) {
      return date;
    }

    // String date (ISO format or other string representation)
    if (typeof date === 'string') {
      // Handle ISO dates
      if (date.match(/^\d{4}-\d{2}-\d{2}/) || date.includes('T00:00:00')) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      // Try to parse as a date anyway
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Numeric timestamp (milliseconds since epoch)
    if (typeof date === 'number') {
      return new Date(date);
    }

    // Firebase Timestamp with toDate() method
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    // Firebase Timestamp-like object with seconds and nanoseconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000);
    }

    // Stringified object that might contain a timestamp
    if (typeof date === 'string' && (date.includes('"seconds"') || date.includes('"nanoseconds"'))) {
      try {
        const parsed = JSON.parse(date);
        if (parsed && typeof parsed === 'object' && 'seconds' in parsed) {
          return new Date(parsed.seconds * 1000);
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error converting to JS Date:', error);
  }

  return null;
}

// Project log type definition
export interface ProjectLog {
  id: string;
  projectId: string;
  action: 'STATUS_CHANGE' | 'SUBSTATUS_CHANGE' | 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'NOTE_ADDED';
  description: string;
  changes: Record<string, { from: any; to: any }>;
  note?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

// Convert Firestore document to ProjectLog object
const projectLogConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot): ProjectLog {
    const data = snapshot.data();

    // Ensure we have a valid date for createdAt
    let createdAt = new Date();
    try {
      if (data.createdAt) {
        const dateFromFirestore = toJsDate(data.createdAt);
        if (dateFromFirestore && !isNaN(dateFromFirestore.getTime())) {
          createdAt = dateFromFirestore;
        }
      }
    } catch (error) {
      console.warn(`Error converting createdAt for log ${snapshot.id}:`, error);
    }

    // Ensure changes is a properly structured object
    let changes = {};
    try {
      if (data.changes && typeof data.changes === 'object') {
        changes = Object.entries(data.changes).reduce((acc, [key, value]) => {
          const change = value as any;
          if (change && typeof change === 'object' && ('from' in change || 'to' in change)) {
            // Handle Firebase Timestamp objects in from/to values
            let fromValue = change.from;
            let toValue = change.to;

            // Don't convert Firebase timestamps to avoid issues
            if (typeof fromValue === 'object' && fromValue !== null && 'seconds' in fromValue) {
              // Keep as is
            }

            if (typeof toValue === 'object' && toValue !== null && 'seconds' in toValue) {
              // Keep as is
            }

            acc[key] = {
              from: fromValue !== undefined ? fromValue : '',
              to: toValue !== undefined ? toValue : ''
            };
          }
          return acc;
        }, {} as Record<string, { from: any; to: any }>);
      }
    } catch (error) {
      console.warn(`Error processing changes for log ${snapshot.id}:`, error);
    }

    return {
      id: snapshot.id,
      projectId: data.projectId || '',
      action: data.action || 'PROJECT_UPDATED',
      description: data.description || '',
      changes: changes,
      note: data.note || '',
      createdBy: data.createdBy || '',
      createdByName: data.createdByName || '',
      createdAt
    };
  },
  toFirestore(log: Omit<ProjectLog, 'id' | 'createdAt'>): DocumentData {
    return {
      projectId: log.projectId,
      action: log.action,
      description: log.description,
      changes: log.changes || {},
      note: log.note || '',
      createdBy: log.createdBy,
      createdByName: log.createdByName,
      createdAt: serverTimestamp()
    };
  }
};

// Collection reference
const projectLogsCollection = collection(db, 'projectLogs');

// Create new project log
export async function createProjectLog(logData: Omit<ProjectLog, 'id' | 'createdAt'>): Promise<ProjectLog> {
  try {
    console.log('Creating log with data:', JSON.stringify(logData, null, 2));

    // Validate required fields
    if (!logData.projectId) {
      throw new Error('projectId is required');
    }

    if (!logData.action) {
      throw new Error('action is required');
    }

    if (!logData.description) {
      throw new Error('description is required');
    }

    // Ensure changes is an object
    const changes = logData.changes || {};

    // Ensure dates are properly converted
    const data = projectLogConverter.toFirestore({
      ...logData,
      changes
    });

    const docRef = await addDoc(projectLogsCollection, data);
    console.log('Log created with ID:', docRef.id);

    // Return the created log (we'll simulate the timestamp for immediate return)
    return {
      ...logData,
      id: docRef.id,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error creating project log:', error);
    throw error;
  }
}

// Get logs for a specific project
export async function getProjectLogs(projectId: string): Promise<ProjectLog[]> {
  try {
    console.log('Fetching logs for project ID:', projectId);

    // First try with a simpler query that doesn't require a composite index
    try {
      const simpleQuery = query(
        projectLogsCollection,
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(simpleQuery);
      console.log(`Found ${snapshot.docs.length} logs for project ${projectId}`);

      // Convert and sort on the client side
      const logs = snapshot.docs.map(doc => projectLogConverter.fromFirestore(doc));
      return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (simpleQueryError) {
      console.warn('Simple query failed, attempting with composite index:', simpleQueryError);

      // Fall back to the original query with orderBy which requires a composite index
      const q = query(
        projectLogsCollection,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} logs for project ${projectId}`);
      return snapshot.docs.map(doc => projectLogConverter.fromFirestore(doc));
    }
  } catch (error) {
    console.error(`Error getting logs for project ${projectId}:`, error);

    // Enhanced error handling for index errors
    if (error instanceof Error && error.message.includes('index')) {
      console.error('Index error detected. Please create the required Firestore index by following the link in the error message above.');
      console.error('After creating the index, it may take a few minutes to become active.');
    }

    throw error;
  }
}

// Get all logs (for admin view)
export async function getAllProjectLogs(): Promise<ProjectLog[]> {
  try {
    console.log('Fetching all project logs');
    const q = query(projectLogsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} total project logs`);
    return snapshot.docs.map(doc => projectLogConverter.fromFirestore(doc));
  } catch (error) {
    console.error('Error getting all project logs:', error);
    throw error;
  }
}

// Helper function to create status change log
export async function logStatusChange(
  projectId: string,
  fromStatus: string,
  toStatus: string,
  note: string,
  userId: string,
  userName: string
): Promise<ProjectLog> {
  try {
    console.log(`Logging status change for project ${projectId} from ${fromStatus} to ${toStatus}`);
    const logData: Omit<ProjectLog, 'id' | 'createdAt'> = {
      projectId,
      action: 'STATUS_CHANGE',
      description: `Status changed from "${fromStatus}" to "${toStatus}"`,
      changes: {
        status: { from: fromStatus, to: toStatus }
      },
      note,
      createdBy: userId,
      createdByName: userName
    };

    return createProjectLog(logData);
  } catch (error) {
    console.error(`Error logging status change for project ${projectId}:`, error);
    throw error;
  }
}

// Helper function to create sub-status change log
export async function logSubStatusChange(
  projectId: string,
  fromSubStatus: string,
  toSubStatus: string,
  userId: string,
  userName: string
): Promise<ProjectLog> {
  try {
    console.log(`Logging sub-status change for project ${projectId} from ${fromSubStatus} to ${toSubStatus}`);
    const logData: Omit<ProjectLog, 'id' | 'createdAt'> = {
      projectId,
      action: 'SUBSTATUS_CHANGE',
      description: `Sub-status changed from "${fromSubStatus}" to "${toSubStatus}"`,
      changes: {
        subStatus: { from: fromSubStatus, to: toSubStatus }
      },
      createdBy: userId,
      createdByName: userName
    };

    return createProjectLog(logData);
  } catch (error) {
    console.error(`Error logging sub-status change for project ${projectId}:`, error);
    throw error;
  }
}

// Helper function to log project creation
export async function logProjectCreation(
  projectId: string,
  projectTitle: string,
  userId: string,
  userName: string
): Promise<ProjectLog> {
  try {
    console.log(`Logging project creation for project ${projectId} - ${projectTitle}`);
    const logData: Omit<ProjectLog, 'id' | 'createdAt'> = {
      projectId,
      action: 'PROJECT_CREATED',
      description: `Project "${projectTitle}" was created`,
      changes: {},
      createdBy: userId,
      createdByName: userName
    };

    return createProjectLog(logData);
  } catch (error) {
    console.error(`Error logging project creation for ${projectId}:`, error);
    throw error;
  }
}

// Helper function to log general project updates
export async function logProjectUpdate(
  projectId: string,
  description: string,
  changes: Record<string, { from: any; to: any }>,
  userId: string,
  userName: string
): Promise<ProjectLog> {
  try {
    console.log(`Logging project update for project ${projectId}: ${description}`);
    const logData: Omit<ProjectLog, 'id' | 'createdAt'> = {
      projectId,
      action: 'PROJECT_UPDATED',
      description,
      changes,
      createdBy: userId,
      createdByName: userName
    };

    return createProjectLog(logData);
  } catch (error) {
    console.error(`Error logging project update for ${projectId}:`, error);
    throw error;
  }
}

// Delete a specific log entry
export async function deleteProjectLog(logId: string): Promise<boolean> {
  try {
    console.log(`Deleting log with ID: ${logId}`);
    const logRef = doc(db, 'projectLogs', logId);
    await deleteDoc(logRef);
    console.log(`Log ${logId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting log ${logId}:`, error);
    throw error;
  }
}

// Delete all logs for a specific project
export async function deleteAllProjectLogs(projectId: string): Promise<number> {
  try {
    console.log(`Deleting all logs for project ID: ${projectId}`);

    // Get all logs for the project
    const logs = await getProjectLogs(projectId);

    // Delete each log
    const deletePromises = logs.map(log => deleteProjectLog(log.id));
    await Promise.all(deletePromises);

    console.log(`Deleted ${logs.length} logs for project ${projectId}`);
    return logs.length;
  } catch (error) {
    console.error(`Error deleting all logs for project ${projectId}:`, error);
    throw error;
  }
}