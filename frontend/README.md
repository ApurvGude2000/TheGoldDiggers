# AccessGuru Chrome Extension 🎯

ML-Powered Accessibility Testing Extension that goes beyond basic WCAG compliance.

## 🎬 What This Does

AccessGuru combines **axe-core** (for technical WCAG compliance) with **ML models** (for semantic quality assessment) to provide:

- ✅ Standard WCAG violation detection via axe-core
- 🧠 ML-powered semantic quality scoring (alt text, link text, etc.)
- 📊 User impact prediction (% of users affected)
- 💡 Natural language explanations
- 🎯 Predictive violation analysis

## 📁 Project Structure

```
accessguru/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic + ML models (static for now)
├── background.js         # Service worker
├── content.js            # Content script (injects axe-core)
├── axe.min.js           # axe-core library (YOU NEED TO ADD THIS)
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## 🚀 Setup Instructions

### Step 1: Add axe-core

You mentioned you have `axe.min.js` from building axe-core. Copy it to the project root:

```bash
cp /path/to/your/axe.min.js /home/claude/axe.min.js
```

**Important**: The file MUST be named `axe.min.js` and placed in the root directory.

### Step 2: Update manifest.json

Add `axe.min.js` to the web_accessible_resources in `manifest.json`:

```json
{
  ...
  "web_accessible_resources": [
    {
      "resources": ["axe.min.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

I'll update this for you now.

### Step 3: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `/home/claude/` folder
5. The AccessGuru extension should now appear!

### Step 4: Test the Extension

1. Navigate to any website (try a government site or e-commerce site)
2. Click the AccessGuru icon in your Chrome toolbar
3. Click **"🔍 Run Accessibility Test"**
4. Wait for results (should take 2-5 seconds)
5. Review the violations and ML insights!

## 🧪 Testing

### Test Sites Recommendations

**Sites with known accessibility issues:**
- Government sites: `https://www.usa.gov`
- E-commerce: `https://www.amazon.com`
- News: `https://www.cnn.com`
- Education: `https://www.mit.edu`

**Good accessibility (fewer violations):**
- `https://www.gov.uk`
- `https://www.apple.com/accessibility/`

### What to Look For

1. **Violation Detection**: Does axe find violations?
2. **ML Quality Scores**: Check alt text quality scores (0-10)
3. **Impact Prediction**: % of users affected makes sense?
4. **Explanations**: Plain English explanations clear?
5. **Overall Score**: 0-100 score calculated correctly?

### Debugging

**If extension doesn't load:**
- Check Chrome DevTools for errors (`chrome://extensions/` → Details → Errors)
- Verify all files are in correct locations
- Ensure `axe.min.js` is present

**If no violations found:**
- Open DevTools Console (F12) while popup is open
- Check for JavaScript errors
- Verify axe-core loaded: `console.log(typeof axe)` should show "object"

**If popup is blank:**
- Right-click popup → "Inspect" → Check console for errors
- Verify popup.html loaded correctly

## 🧠 ML Models (Current Status)

### Static Mock Implementation ✅

Currently, the ML models use **static heuristics** (not real ML):

1. **Alt Text Quality Scorer** (`MLModels.scoreAltTextQuality`)
   - Uses simple rules: word count, generic words, filenames
   - Returns 0-10 score
   - **Location**: `popup.js` lines 2-52

2. **Impact Predictor** (`MLModels.predictImpact`)
   - Maps violation severity to user percentages
   - Returns affected user groups
   - **Location**: `popup.js` lines 54-78

3. **Natural Language Explainer** (`MLModels.generateExplanation`)
   - Template-based explanations
   - Returns what/who/why/how structure
   - **Location**: `popup.js` lines 80-125

### Integrating Real ML Models Later 🔄

When your ML models are ready, replace the `MLModels` object in `popup.js`:

```javascript
// Option 1: Call backend API
async scoreAltTextQuality(altText, context) {
  const response = await fetch('https://your-api.com/score-alt-text', {
    method: 'POST',
    body: JSON.stringify({ altText, context })
  });
  return await response.json();
}

// Option 2: Use TensorFlow.js (run model in browser)
async scoreAltTextQuality(altText, context) {
  const model = await tf.loadLayersModel('path/to/model.json');
  const features = extractFeatures(altText);
  const prediction = model.predict(features);
  return prediction;
}
```

## 📊 Understanding the Output

### Overall Score (0-100)
- **80-100**: Good accessibility, minor issues
- **60-79**: Fair, several improvements needed  
- **40-59**: Poor, significant barriers
- **0-39**: Critical, major issues

Calculation:
```
score = 100 - (critical × 15) - (serious × 10) - (others × 5)
```

### ML Analysis Per Violation

Each violation shows:
- **Quality Score**: 0-10 (for alt text, link text, etc.)
- **User Impact**: Estimated % of users affected
- **Affected Groups**: Specific disability groups
- **Suggestions**: How to fix

### Violation Severity

- 🔴 **Critical**: Blocks core functionality
- 🟠 **Serious**: Major barriers to access
- 🟡 **Moderate**: Noticeable issues
- 🟢 **Minor**: Best practice improvements

## 🔧 Development

### Modifying the UI

Edit `popup.html` and `popup.css`. Changes take effect immediately after:
- Close popup
- Click extension icon again

### Modifying Logic

Edit `popup.js`. After changes:
1. Go to `chrome://extensions/`
2. Click **"Reload"** under AccessGuru
3. Test again

### Adding New ML Models

1. Add new method to `MLModels` object in `popup.js`
2. Call it from `enhanceWithML()` function
3. Update `displayViolations()` to show new insights

### Testing Without Opening Extension

Open DevTools Console on any page and run:

```javascript
// Check if axe is loaded
console.log(typeof axe); // Should be "object"

// Run axe directly
axe.run().then(results => {
  console.log('Violations:', results.violations);
});
```

## 📦 Distribution Preparation

### Before Publishing

1. **Replace mock ML with real models**
2. **Add comprehensive error handling**
3. **Test on 20+ websites**
4. **Create privacy policy**
5. **Add rate limiting if using API**
6. **Optimize performance** (lazy load models)
7. **Add settings page** (let users configure ML features)

### File Size Considerations

- `axe.min.js` is ~230KB
- If adding TensorFlow.js models, watch bundle size
- Consider lazy loading ML models only when needed

## 🎯 Next Steps

### Phase 1: Test Current Version ✅
- [x] Load extension
- [ ] Test on 5-10 websites
- [ ] Verify axe detection works
- [ ] Check UI/UX flow
- [ ] Note any bugs

### Phase 2: Integrate Real ML
- [ ] Train alt text quality model
- [ ] Train impact prediction model
- [ ] Train explanation generation model
- [ ] Create API or use TensorFlow.js
- [ ] Replace mock functions

### Phase 3: Advanced Features
- [ ] Temporal analysis (track changes)
- [ ] Domain-specific models
- [ ] Export detailed reports
- [ ] Compare multiple pages
- [ ] Settings page

## 🐛 Known Issues / TODOs

- [ ] axe.min.js needs to be added manually
- [ ] ML models are currently static heuristics
- [ ] No persistent storage of results yet
- [ ] Export currently only exports JSON
- [ ] No settings page yet
- [ ] No user onboarding/tutorial

## 📚 Resources

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Architecture Overview

```
User clicks extension
       ↓
popup.js executes
       ↓
Inject axe-core via content.js
       ↓
Run axe.run() on page
       ↓
Get violations from axe
       ↓
Enhance with ML analysis
       ↓
Display in popup UI
```

## 🎬 Demo Script

**"We don't just detect violations—we understand them."**

1. **Show website** - Navigate to a site
2. **Run standard axe** - Point out it found N violations
3. **Show AccessGuru** - Click extension, run test
4. **Highlight ML insights**:
   - "This alt text scored 2.3/10 because it's too generic"
   - "This affects ~35% of users who are blind or have low vision"
   - "Here's how to fix it: [specific suggestions]"
5. **Show overall score** - "Your accessibility score is 42/100"
6. **Show predictions** - "Similar pages likely have 8 more violations"

---

**Built with ❤️ for a more accessible web**
