# 🚀 Quick Start Guide - AccessGuru

Get up and running in 5 minutes!

## ⚡ Fast Track Setup

### Step 1: Replace axe.min.js (CRITICAL)
```bash
# Copy your built axe.min.js file here
cp /path/to/your/axe.min.js /home/claude/axe.min.js
```

**Don't have axe.min.js yet?** Download it:
```bash
cd /home/claude
curl -o axe.min.js https://cdn.jsdelivr.net/npm/axe-core@4.8.3/axe.min.js
```

### Step 2: Load Extension in Chrome

1. **Open Chrome** and navigate to: `chrome://extensions/`

2. **Enable Developer Mode**  
   Toggle the switch in the top-right corner

3. **Load Extension**  
   Click "Load unpacked" button  
   Select folder: `/home/claude/`

4. **Verify Installation**  
   You should see "AccessGuru" card appear with the icon

### Step 3: Test It!

1. **Go to a test website**  
   Try: `https://example.com` or `https://www.usa.gov`

2. **Click the AccessGuru icon**  
   Should be in your Chrome toolbar (puzzle piece icon → pin it)

3. **Run Test**  
   Click "🔍 Run Accessibility Test"  
   Wait 3-5 seconds

4. **Review Results**  
   - Overall Score (0-100)
   - Violations found
   - ML insights
   - Suggestions

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Extension appears in `chrome://extensions/`
- [ ] Icon appears in Chrome toolbar
- [ ] Popup opens when clicked
- [ ] "Run Test" button works
- [ ] Results appear (violations or "no violations")
- [ ] ML Analysis section shows data
- [ ] Export Report downloads JSON
- [ ] No console errors

## 🐛 Quick Troubleshooting

### "axe is not defined" error
**Problem**: axe.min.js not loaded  
**Solution**: 
1. Check file exists: `ls -lh /home/claude/axe.min.js`
2. File should be ~200KB+, not 1KB (placeholder)
3. Replace with actual axe-core library

### Extension won't load
**Problem**: Manifest or file errors  
**Solution**:
1. Check `chrome://extensions/` for error messages
2. Click "Errors" button if shown
3. Verify all files present: `ls /home/claude/`

### Popup is blank
**Problem**: JavaScript error in popup  
**Solution**:
1. Right-click extension icon → Inspect popup
2. Check Console tab for errors
3. Ensure popup.js loaded correctly

### No violations found on bad site
**Problem**: axe not running correctly  
**Solution**:
1. Open page DevTools (F12)
2. Console → type: `typeof axe`
3. Should return "object", not "undefined"
4. Try: `axe.run().then(r => console.log(r))`

## 📊 First Test Recommendations

### Easy Sites (Few Violations)
- `https://www.gov.uk` - Well-designed
- `https://www.apple.com/accessibility/` - Good practices

### Moderate Sites (Some Violations)
- `https://example.com` - Simple test case
- `https://www.wikipedia.org` - Generally decent

### Challenging Sites (Many Violations)
- `https://www.amazon.com` - Complex, many elements
- `https://www.cnn.com` - Lots of dynamic content
- Most small business sites - Often poor accessibility

## 🎯 What to Look For

### On First Run

1. **Violations Tab**
   - Should show list of issues
   - Each with severity badge
   - Description of problem

2. **ML Analysis Section**
   - Quality scores (for alt text)
   - User impact percentages
   - Affected user groups
   - Fix suggestions

3. **Overall Score**
   - Number out of 100
   - Interpretation text
   - Stats grid (violations, critical, etc.)

4. **ML Insights Box**
   - Predictive analysis
   - User impact estimate
   - Priority recommendations

### Expected Behavior

✅ Loading shows spinner  
✅ Results appear in 3-10 seconds  
✅ Violations grouped by severity  
✅ Each violation has ML analysis  
✅ Export creates downloadable JSON  
✅ "Run Again" resets to start  

## 🎬 Demo Flow

Perfect for showing others:

```
1. Pick a site: "Let's test CNN.com"
2. Click extension: "Here's AccessGuru"
3. Run test: "Running analysis..."
4. Show score: "Score: 47/100 - needs work!"
5. Pick violation: "Look at this alt text..."
6. Show ML: "Scored 2.3/10 - too generic"
7. Show impact: "Affects 35% of users"
8. Show fix: "Here's how to improve it"
9. Export: "Save full report as JSON"
```

## 📝 Next Steps

After verifying it works:

1. **Read full README.md** - Detailed documentation
2. **Run through TESTING.md** - Complete test suite
3. **Note any bugs** - Document issues found
4. **Test multiple sites** - Build confidence
5. **Plan ML integration** - When ready to add real models

## 🆘 Need Help?

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| Blank popup | Check Console: Right-click icon → Inspect |
| No violations on bad site | Verify axe.min.js is real file (not placeholder) |
| "Cannot access chrome:// URL" | Normal - extension can't run on Chrome pages |
| Slow performance | Expected on huge sites (Amazon, etc.) |
| ML scores all the same | Using heuristics now - will improve with real ML |

## 🎉 Success Criteria

You're ready to move forward when:

- ✅ Extension loads without errors
- ✅ Runs on 5+ different websites successfully
- ✅ Violations detected correctly
- ✅ ML insights make sense
- ✅ UI is responsive and clear
- ✅ No console errors
- ✅ Export functionality works

**Once validated**, you can:
- Start integrating real ML models
- Customize UI/features
- Test on your 448-site dataset
- Prepare for deployment

---

**Time Investment**: ~5 minutes to load, ~30 minutes to test thoroughly

**Difficulty**: Beginner-friendly (if you can copy files and use Chrome)

**Reward**: Foundation for ML-powered accessibility testing! 🎯
