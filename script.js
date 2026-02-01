/**
 * Issue Reporter - Shared JavaScript Functions
 * Contains core data management functions used across all pages
 */

// ========================================
// Constants & Configuration
// ========================================

// Key used to store issues in localStorage
const STORAGE_KEY = 'issueReporter_issues';

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
 * @param {Object} issueData - Object containing title, description, and priority
 * @returns {Object} The newly created issue with id and date
 */
function createIssue(issueData) {
  // Create issue object with additional metadata
  const newIssue = {
    id: generateId(),
    title: issueData.title,
    description: issueData.description,
    priority: issueData.priority,
    date: new Date().toISOString(),
    resolved: false
  };

  // Get existing issues and add new one at the beginning
  const issues = getIssuesFromStorage();
  issues.unshift(newIssue);
  
  // Save updated issues array
  saveIssuesToStorage(issues);
  
  return newIssue;
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

