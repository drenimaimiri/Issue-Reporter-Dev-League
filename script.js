/**
 * Issue Reporter - Shared JavaScript Functions
 * Contains core data management functions used across all pages
 */

// ========================================
// Constants & Configuration
// ========================================

// Key used to store issues in localStorage
const STORAGE_KEY = 'issueReporter_issues';

// Available tags for categorization
const AVAILABLE_TAGS = ['bug', 'feature', 'enhancement', 'documentation', 'performance', 'security', 'ui', 'backend'];

// ========================================
// Toast Notification System
// ========================================

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========================================
// Data Management Functions
// ========================================

/**
 * Retrieves all issues from localStorage
 * @returns {Array} Array of issue objects
 */
function getIssuesFromStorage() {
  // Try to get issues from localStorage
  const storedIssues = localStorage.getItem(STORAGE_KEY);
  
  // If issues exist, parse and return them; otherwise return empty array
  return storedIssues ? JSON.parse(storedIssues) : [];
}

/**
 * Saves issues array to localStorage
 * @param {Array} issues - Array of issue objects to save
 */
function saveIssuesToStorage(issues) {
  // Convert issues array to JSON string and save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

/**
 * Generates a unique ID for new issues
 * Uses timestamp + random number for simplicity
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formats a date object into a readable string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} Escaped text safe for HTML insertion
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// Issue CRUD Operations
// ========================================

/**
 * Creates a new issue and adds it to storage
 * @param {Object} issueData - Object containing title, description, priority, and optional tags
 * @returns {Object} The newly created issue with id and date
 */
function createIssue(issueData) {
  // Create issue object with additional metadata
  const newIssue = {
    id: generateId(),
    title: issueData.title,
    description: issueData.description,
    priority: issueData.priority,
    tags: issueData.tags || [],
    date: new Date().toISOString(),
    resolved: false,
    views: 0
  };

  // Get existing issues and add new one at the beginning
  const issues = getIssuesFromStorage();
  issues.unshift(newIssue);
  
  // Save updated issues array
  saveIssuesToStorage(issues);
  
  return newIssue;
}

// ========================================
// Export Functions
// ========================================

/**
 * Exports all issues to JSON file
 */
function exportToJSON() {
  const issues = getIssuesFromStorage();
  const dataStr = JSON.stringify(issues, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `issues_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Issues exported to JSON', 'success');
}

/**
 * Exports all issues to CSV file
 */
function exportToCSV() {
  const issues = getIssuesFromStorage();
  
  if (issues.length === 0) {
    showToast('No issues to export', 'warning');
    return;
  }
  
  // CSV headers
  const headers = ['ID', 'Title', 'Description', 'Priority', 'Tags', 'Status', 'Date Created'];
  
  // Convert issues to CSV rows
  const rows = issues.map(issue => [
    issue.id,
    `"${(issue.title || '').replace(/"/g, '""')}"`,
    `"${(issue.description || '').replace(/"/g, '""')}"`,
    issue.priority,
    (issue.tags || []).join(';'),
    issue.resolved ? 'Resolved' : 'Open',
    new Date(issue.date).toLocaleString()
  ]);
  
  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `issues_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Issues exported to CSV', 'success');
}

// ========================================
// Statistics Functions
// ========================================

/**
 * Gets comprehensive statistics about issues
 * @returns {Object} Statistics object
 */
function getIssueStats() {
  const issues = getIssuesFromStorage();
  const total = issues.length;
  const resolved = issues.filter(i => i.resolved).length;
  const open = total - resolved;
  
  const byPriority = {
    high: issues.filter(i => i.priority === 'high').length,
    medium: issues.filter(i => i.priority === 'medium').length,
    low: issues.filter(i => i.priority === 'low').length
  };
  
  const byTag = {};
  issues.forEach(issue => {
    (issue.tags || []).forEach(tag => {
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
  });
  
  // Calculate trends (issues created in last 7 days)
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentIssues = issues.filter(i => new Date(i.date).getTime() > oneWeekAgo).length;
  
  return {
    total,
    resolved,
    open,
    byPriority,
    byTag,
    recentIssues,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
  };
}

/**
 * Deletes an issue by its ID
 * @param {string} issueId - The ID of the issue to delete
 */
function deleteIssue(issueId) {
  // Get current issues
  const issues = getIssuesFromStorage();
  
  // Filter out the issue to be deleted
  const updatedIssues = issues.filter(issue => issue.id !== issueId);
  
  // Save the filtered array
  saveIssuesToStorage(updatedIssues);
}

/**
 * Toggles the resolved status of an issue
 * @param {string} issueId - The ID of the issue to toggle
 */
function toggleResolve(issueId) {
  // Get current issues
  const issues = getIssuesFromStorage();
  
  // Find and toggle the resolved status
  const updatedIssues = issues.map(issue => {
    if (issue.id === issueId) {
      return { ...issue, resolved: !issue.resolved };
    }
    return issue;
  });
  
  // Save updated issues
  saveIssuesToStorage(updatedIssues);
}

// ========================================
// Mobile Navigation
// ========================================

// Set up mobile navigation toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (navToggle && navLinks) {
    // Toggle menu when hamburger is clicked
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
      });
    });
  }
});

