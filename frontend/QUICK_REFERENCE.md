# AccessGuru - Quick Reference Card

## 🚀 30-Second Setup
```bash
# 1. Add axe-core
cp /your/path/axe.min.js ./axe.min.js

# 2. Load in Chrome
# chrome://extensions/ → Developer mode ON → Load unpacked → Select folder

# 3. Test
# Click extension icon → Run Test → Done!
```

## 📁 File Structure
```
accessguru/
├── manifest.json       ← Extension config
├── popup.html/css/js   ← UI and logic  
├── background.js       ← Service worker
├── content.js          ← Injects axe-core
├── axe.min.js          ← ⚠️ ADD THIS FILE
└── icons/              ← Extension icons
```

## 🎯 Key Features
| Feature | Status | Location |
|---------|--------|----------|
| WCAG Violation Detection | ✅ Working | Uses axe-core |
| Alt Text Quality (0-10) | 🟡 Heuristic | `popup.js` line 2 |
| Impact Prediction (%) | 🟡 Heuristic | `popup.js` line 54 |
| Plain English Explanations | 🟡 Template | `popup.js` line 80 |
| Overall Score (0-100) | ✅ Working | Calculated |

🟡 = Static heuristics now, ready for real ML

## 🧠 ML Integration (Future)

**Replace these functions in `popup.js`:**

```javascript
// Current (line 2-52)
scoreAltTextQuality(altText, context) {
  // Simple rules...
}

// Future
async scoreAltTextQuality(altText, context) {
  // Option A: Call your API
  const res = await fetch('https://api.../score', {...});
  
  // Option B: TensorFlow.js
  const model = await tf.loadLayersModel('/models/...');
  const prediction = model.predict(features);
}
```

## 🧪 Test Commands

**In Chrome DevTools Console (on any page):**
```javascript
// Check if axe loaded
typeof axe  // Should be "object"

// Run axe directly
axe.run().then(r => console.log(r.violations))

// Test ML scorer (in popup console)
MLModels.scoreAltTextQuality('image', {})
// Should return: { score: 2.0, issues: [...], ... }
```

## 📊 Score Calculation
```
Score = 100 
        - (critical violations × 15)
        - (serious violations × 10)  
        - (other violations × 5)
```

## 🐛 Quick Debug
| Issue | Check | Fix |
|-------|-------|-----|
| Extension won't load | `chrome://extensions/` errors | Fix manifest |
| Popup is blank | Right-click → Inspect popup | Check console |
| No violations found | DevTools: `typeof axe` | Replace axe.min.js |
| Slow performance | Try simpler site first | Expected on huge sites |

## 📚 Documentation
- **PROJECT_SUMMARY.md** ← Start here!
- **QUICKSTART.md** ← 5-min setup
- **README.md** ← Full docs  
- **TESTING.md** ← Test plan
- **ML_INTEGRATION.md** ← Add real ML

## 🎬 Demo Script
1. Open site (e.g., cnn.com)
2. Click AccessGuru
3. "Run Accessibility Test"
4. Point out ML insights:
   - "This alt text scored 2.3/10"
   - "Affects 35% of users"
   - "Here's how to fix it"
5. "Your score: 42/100"

## ⚡ Performance Targets
- Simple page: < 3s
- Medium page: < 5s
- Complex page: < 10s

## 🔒 Permissions Needed
- `activeTab` - Run on current page
- `scripting` - Inject axe-core
- `storage` - Save settings (future)

## 🎯 Next Actions
- [ ] Add axe.min.js file  
- [ ] Load in Chrome
- [ ] Test on 5 sites
- [ ] Train ML models
- [ ] Integrate models
- [ ] Ship it!

---
**Version**: 1.0.0-foundation  
**Status**: Ready for testing  
**ML**: Heuristics → Real models soon
