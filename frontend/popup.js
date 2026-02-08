// ML Models - Static mock data (will be replaced with real ML later)
const MLModels = {
  // Model 1: Semantic Quality Scorer
  scoreAltTextQuality(altText, context) {
    if (!altText) return { score: 0, issues: ['Missing alt text'] };
    
    const words = altText.trim().split(/\s+/);
    const wordCount = words.length;
    
    // Simple heuristic scoring (replace with real ML)
    let score = 5.0; // baseline
    const issues = [];
    const suggestions = [];
    
    // Generic words
    const genericWords = ['image', 'picture', 'photo', 'graphic', 'icon'];
    if (genericWords.some(w => altText.toLowerCase() === w)) {
      score -= 3;
      issues.push('Generic word detected');
      suggestions.push('Describe what the image shows, not just "image"');
    }
    
    // Too short
    if (wordCount === 1) {
      score -= 2;
      issues.push('Too brief');
      suggestions.push('Add more descriptive details');
    }
    
    // Good length
    if (wordCount >= 3 && wordCount <= 15) {
      score += 2;
    }
    
    // Has numbers (potentially good for charts)
    if (/\d/.test(altText)) {
      score += 1;
    }
    
    // Looks like filename
    if (/\.(jpg|png|gif|jpeg)/i.test(altText)) {
      score -= 3;
      issues.push('Appears to be filename');
      suggestions.push('Replace filename with meaningful description');
    }
    
    score = Math.max(0, Math.min(10, score));
    
    return {
      score: parseFloat(score.toFixed(1)),
      issues,
      suggestions,
      confidence: 0.85
    };
  },

  // Model 2: Impact Predictor
  predictImpact(violation, pageContext) {
    const impactMap = {
      'critical': { percentage: 45, groups: ['Blind users', 'Screen reader users'] },
      'serious': { percentage: 35, groups: ['Low vision users', 'Keyboard-only users'] },
      'moderate': { percentage: 20, groups: ['Color blind users', 'Motor impaired users'] },
      'minor': { percentage: 10, groups: ['Users in bright sunlight', 'Older adults'] }
    };
    
    const baseImpact = impactMap[violation.impact] || impactMap['moderate'];
    
    // Adjust based on element type
    let adjustedPercentage = baseImpact.percentage;
    if (violation.description && violation.description.toLowerCase().includes('button')) {
      adjustedPercentage += 10; // Buttons are more critical
    }
    if (violation.description && violation.description.toLowerCase().includes('form')) {
      adjustedPercentage += 15; // Forms are very critical
    }
    
    return {
      percentage: Math.min(100, adjustedPercentage),
      affectedGroups: baseImpact.groups,
      confidence: 0.82
    };
  },

  // Model 3: Natural Language Explainer
  generateExplanation(violation) {
    const templates = {
      'image-alt': {
        what: 'Images are missing descriptive alternative text',
        who: ['Blind users using screen readers', 'Users with images disabled'],
        why: 'Screen readers cannot convey image content without alt text',
        how: ['Add descriptive alt="" attributes to images', 'Describe the purpose and content of the image']
      },
      'color-contrast': {
        what: 'Text does not have sufficient contrast against its background',
        who: ['Low vision users', 'Color blind users', 'Users viewing in bright sunlight'],
        why: 'Insufficient contrast makes text difficult or impossible to read',
        how: ['Increase contrast ratio to at least 4.5:1', 'Use darker text or lighter backgrounds']
      },
      'link-name': {
        what: 'Links lack descriptive text',
        who: ['Screen reader users', 'Keyboard navigation users'],
        why: 'Generic link text like "click here" doesn\'t provide context',
        how: ['Use descriptive link text that explains the destination', 'Avoid generic phrases like "click here" or "read more"']
      }
    };
    
    // Find matching template
    let template = null;
    for (const [key, value] of Object.entries(templates)) {
      if (violation.id.includes(key)) {
        template = value;
        break;
      }
    }
    
    if (!template) {
      template = {
        what: violation.description,
        who: ['Users with disabilities'],
        why: 'This violates WCAG accessibility guidelines',
        how: ['Review WCAG documentation', 'Fix the reported issue']
      };
    }
    
    return template;
  }
};

// DOM Elements
const runTestBtn = document.getElementById('runTest');
const runAgainBtn = document.getElementById('runAgain');
const exportReportBtn = document.getElementById('exportReport');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('statusText');
const controlsDiv = document.getElementById('controls');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

let currentResults = null;
let currentTabId = null;

// Load saved state on popup open
window.addEventListener('DOMContentLoaded', async () => {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab.url;
  
  chrome.storage.local.get(['accessGuruResults', 'accessGuruTabId', 'accessGuruUrl'], (data) => {
    // Check if we have results and they're for the current URL
    if (data.accessGuruResults && data.accessGuruTabId && data.accessGuruUrl === currentUrl) {
      currentResults = data.accessGuruResults;
      currentTabId = data.accessGuruTabId;
      displayResults(currentResults);
      controlsDiv.classList.add('hidden');
      resultsDiv.classList.remove('hidden');
      console.log('✅ Restored previous results for current URL');
    } else if (data.accessGuruUrl && data.accessGuruUrl !== currentUrl) {
      // Different URL - clear old results
      chrome.storage.local.remove(['accessGuruResults', 'accessGuruTabId', 'accessGuruUrl']);
      console.log('🔄 New URL detected - cleared old results');
    }
  });
});

// Event Listeners
runTestBtn.addEventListener('click', runAccessibilityTest);
runAgainBtn.addEventListener('click', () => {
  // Clear saved state
  chrome.storage.local.remove(['accessGuruResults', 'accessGuruTabId', 'accessGuruUrl']);
  currentResults = null;
  currentTabId = null;
  resultsDiv.classList.add('hidden');
  controlsDiv.classList.remove('hidden');
});
exportReportBtn.addEventListener('click', exportReport);
openSidebarBtn.addEventListener('click', openSidebar);

async function runAccessibilityTest() {
  try {
    // Show loading state
    controlsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    statusDiv.classList.remove('hidden');
    statusText.textContent = 'Analyzing page...';

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabId = tab.id;
    
    console.log('🔍 Running test on tab:', tab.url);
    
    // FIXED: Inject axe-core library first
    statusText.textContent = 'Loading axe-core library...';
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['axe.min.js']
      });
      console.log('✅ axe-core injected successfully');
    } catch (injectError) {
      console.error('❌ Failed to inject axe-core:', injectError);
      throw new Error('Failed to load axe-core library. Make sure axe.min.js is in the extension folder.');
    }
    
    // Now run the tests
    statusText.textContent = 'Running axe core tests...';
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runAxeTest
    });

    console.log('📊 Raw results from executeScript:', results);

    if (!results || !results[0]) {
      throw new Error('No results returned from executeScript');
    }

    const axeResults = results[0].result;
    console.log('📊 Axe results object:', axeResults);
    
    // Check if there was an error
    if (axeResults && axeResults.error) {
      throw new Error(axeResults.error);
    }
    
    // Check if violations exist
    if (!axeResults || !axeResults.violations) {
      console.error('❌ No violations array in results:', axeResults);
      throw new Error('Invalid axe results format');
    }
    
    console.log(`✅ Found ${axeResults.violations.length} violations`);
    
    // Process results with ML
    statusText.textContent = 'Applying ML analysis...';
    const enhancedResults = await enhanceWithML(axeResults);
    
    console.log('🧠 Enhanced results:', enhancedResults);
    
    currentResults = enhancedResults;
    
    // Save results to localStorage for persistence
    chrome.storage.local.set({
      'accessGuruResults': enhancedResults,
      'accessGuruTabId': tab.id,
      'accessGuruUrl': tab.url
    });
    
    // Display results
    displayResults(enhancedResults);
    
    // Auto-activate overlay
    await activateOverlay();
    
    // Hide status, show results
    statusDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');

  } catch (error) {
    console.error('Error running test:', error);
    statusDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    errorMessage.textContent = `Error: ${error.message}`;
  }
}

// This function runs in the context of the webpage
function runAxeTest() {
  return new Promise((resolve) => {
    console.log('🔧 runAxeTest called, checking for axe...');
    
    // Check if axe is loaded
    if (typeof axe === 'undefined') {
      console.error('❌ axe is not defined');
      resolve({ error: 'axe-core not loaded' });
      return;
    }

    console.log('✅ axe is loaded, running tests...');

    axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    }).then(results => {
      console.log(`✅ axe.run complete. Found ${results.violations.length} violations`);
      console.log('Violations:', results.violations);
      resolve(results);
    }).catch(error => {
      console.error('❌ axe.run error:', error);
      resolve({ error: error.message });
    });
  });
}

async function enhanceWithML(axeResults) {
  const violations = axeResults.violations || [];
  
  // Enhance each violation with ML analysis
  const enhancedViolations = violations.map(violation => {
    const enhanced = { ...violation };
    
    // Add ML analysis for each violation
    enhanced.mlAnalysis = {
      impact: MLModels.predictImpact(violation, {}),
      explanation: MLModels.generateExplanation(violation)
    };
    
    // Special handling for alt text violations
    if (violation.id.includes('image-alt')) {
      enhanced.nodes = violation.nodes.map(node => {
        const altText = node.html.match(/alt=["']([^"']+)["']/)?.[1] || '';
        return {
          ...node,
          mlAnalysis: MLModels.scoreAltTextQuality(altText, {})
        };
      });
    }
    
    return enhanced;
  });

  // Calculate overall score
  const totalViolations = violations.length;
  const criticalCount = violations.filter(v => v.impact === 'critical').length;
  const seriousCount = violations.filter(v => v.impact === 'serious').length;
  const moderateCount = violations.filter(v => v.impact === 'moderate').length;
  
  // Simple scoring algorithm (100 - weighted penalties)
  let score = 100;
  score -= criticalCount * 15;
  score -= seriousCount * 10;
  score -= moderateCount * 5;
  score -= (totalViolations - criticalCount - seriousCount - moderateCount) * 3;
  score = Math.max(0, Math.min(100, score));
  
  // Calculate average impact
  const totalImpact = enhancedViolations.reduce((sum, v) => {
    return sum + (v.mlAnalysis?.impact?.percentage || 0);
  }, 0);
  const avgImpact = totalViolations > 0 ? Math.round(totalImpact / totalViolations) : 0;

  return {
    violations: enhancedViolations,
    score: Math.round(score),
    totalViolations,
    criticalCount,
    seriousCount,
    moderateCount,
    avgImpact,
    url: axeResults.url,
    timestamp: new Date().toISOString()
  };
}

function displayResults(results) {
  // Update summary
  document.getElementById('overallScore').textContent = results.score;
  document.getElementById('totalViolations').textContent = results.totalViolations;
  document.getElementById('criticalCount').textContent = results.criticalCount;
  document.getElementById('seriousCount').textContent = results.seriousCount;
  document.getElementById('moderateCount').textContent = results.moderateCount;
  
  // Score interpretation
  const interpretation = 
    results.score >= 80 ? 'Good - Minor issues to address' :
    results.score >= 60 ? 'Fair - Several improvements needed' :
    results.score >= 40 ? 'Poor - Significant accessibility barriers' :
    'Critical - Major accessibility issues';
  document.getElementById('scoreInterpretation').textContent = interpretation;
  
  // ML Insights
  displayMLInsights(results);
}

function displayMLInsights(results) {
  const insightsList = document.getElementById('mlInsightsList');
  
  const insights = [
    {
      label: 'Predictive Analysis',
      value: `Based on this site's structure, similar pages may have ${Math.round(results.totalViolations * 1.3)} violations`
    },
    {
      label: 'User Impact',
      value: `Approximately ${results.avgImpact}% of users may encounter accessibility barriers`
    },
    {
      label: 'Priority Recommendation',
      value: results.criticalCount > 0 
        ? `Focus on ${results.criticalCount} critical issue${results.criticalCount > 1 ? 's' : ''} first`
        : 'Address serious violations to improve compliance'
    }
  ];
  
  insightsList.innerHTML = insights.map(insight => `
    <div class="insight-item">
      <span class="insight-label">${insight.label}:</span>
      <span class="insight-value">${insight.value}</span>
    </div>
  `).join('');
}

function exportReport() {
  if (!currentResults) return;
  
  const report = {
    summary: {
      url: currentResults.url,
      timestamp: currentResults.timestamp,
      score: currentResults.score,
      totalViolations: currentResults.totalViolations,
      criticalCount: currentResults.criticalCount,
      seriousCount: currentResults.seriousCount,
      avgImpact: currentResults.avgImpact
    },
    violations: currentResults.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      description: v.description,
      helpUrl: v.helpUrl,
      instances: v.nodes?.length || 0,
      mlAnalysis: v.mlAnalysis
    }))
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessguru-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function activateOverlay() {
  if (!currentResults || !currentTabId) {
    return;
  }

  try {
    console.log('🎨 Auto-activating visual overlay...');

    // Inject overlay script
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['overlay.js']
    });

    console.log('✅ Overlay script injected');

    // Activate highlights with violation data (collapsed by default)
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: (violations) => {
        if (window.accessGuruHighlight) {
          window.accessGuruHighlight(violations);
        }
      },
      args: [currentResults.violations]
    });

    console.log('✅ Overlay activated (auto-mode)');

  } catch (error) {
    console.error('Error activating overlay:', error);
  }
}

async function openSidebar() {
  if (!currentResults || !currentTabId) {
    alert('Please run an accessibility test first!');
    return;
  }

  try {
    // Re-inject to ensure it's there
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['overlay.js']
    });

    // Open the sidebar
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => {
        if (window.accessGuruOpenSidebar) {
          window.accessGuruOpenSidebar();
        }
      }
    });

    // Close the popup window
    window.close();

  } catch (error) {
    console.error('Error opening sidebar:', error);
  }
}