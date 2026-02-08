# AccessGuru Testing Guide 🧪

## Pre-Test Checklist

- [ ] axe.min.js file is in project root
- [ ] Extension loaded in Chrome (`chrome://extensions/`)
- [ ] Developer mode is enabled
- [ ] No console errors on extension page

## Test Plan

### Test 1: Basic Functionality ✅

**Goal**: Verify extension loads and runs

1. Navigate to `https://example.com`
2. Click AccessGuru icon
3. Click "Run Accessibility Test"
4. **Expected**: Loading spinner appears
5. **Expected**: Results appear within 5 seconds
6. **Expected**: Some violations or "No violations" message

**Pass Criteria**: Extension runs without errors

---

### Test 2: Violation Detection 🔍

**Goal**: Verify axe-core detects real violations

**Test Site**: `http://www.accessibilitychecker.org/audit/` (intentionally bad accessibility)

1. Run AccessGuru on test site
2. **Expected**: Multiple violations found (10+)
3. **Expected**: Mix of severity levels (critical, serious, moderate, minor)
4. **Expected**: Each violation has description and help text

**Pass Criteria**: 
- Violations detected ✓
- Different severity levels ✓
- Descriptions readable ✓

---

### Test 3: ML Alt Text Quality Scoring 🧠

**Goal**: Verify ML quality scoring works

**Create Test Page**:
```html
<!DOCTYPE html>
<html>
<body>
  <!-- Bad alt text - should score LOW -->
  <img src="test.jpg" alt="image">
  
  <!-- Medium alt text - should score MEDIUM -->
  <img src="test.jpg" alt="A chart">
  
  <!-- Good alt text - should score HIGH -->
  <img src="test.jpg" alt="Q3 2024 sales revenue by region showing 23% increase">
</body>
</html>
```

**Test Steps**:
1. Save above as test.html, open in browser
2. Run AccessGuru
3. Check violations for image-alt
4. **Expected**: Quality scores differ:
   - "image" → 1-3/10
   - "A chart" → 4-6/10
   - Descriptive → 7-9/10

**Pass Criteria**:
- Different scores for different quality levels ✓
- Suggestions provided ✓
- Issues identified correctly ✓

---

### Test 4: Impact Prediction 📊

**Goal**: Verify user impact predictions make sense

1. Run on site with violations
2. Check each violation's ML Analysis
3. **Expected**: 
   - Critical violations → Higher % affected (30-50%)
   - Minor violations → Lower % affected (5-20%)
   - Affected groups listed
   - Percentages add context

**Pass Criteria**:
- Impact percentages logical ✓
- User groups identified ✓
- Higher severity = higher impact ✓

---

### Test 5: Overall Score Calculation 🎯

**Goal**: Verify scoring algorithm

**Manual Calculation**:
```
If site has:
- 2 critical violations
- 3 serious violations  
- 5 moderate violations

Score = 100 - (2×15) - (3×10) - (5×5)
Score = 100 - 30 - 30 - 25 = 15
```

**Test Steps**:
1. Find site with known violations
2. Count violations by severity
3. Calculate expected score manually
4. Run AccessGuru
5. Compare

**Pass Criteria**: Score matches manual calculation (±5 points)

---

### Test 6: Natural Language Explanations 💡

**Goal**: Verify explanations are helpful

1. Run on site with color contrast violation
2. Read ML Analysis explanation
3. **Expected**:
   - "What's wrong" - Clear description
   - "Who this affects" - User groups listed
   - "Why it matters" - Context provided
   - "How to fix" - Actionable steps

**Pass Criteria**:
- Explanations in plain English ✓
- Non-technical user can understand ✓
- Actionable suggestions ✓

---

### Test 7: UI/UX Flow 🎨

**Goal**: Verify user experience is smooth

1. Open extension on new site
2. **Expected**: Clean, professional UI
3. Click "Run Test"
4. **Expected**: Clear loading state
5. View results
6. **Expected**: Well-organized, scannable
7. Click "Export Report"
8. **Expected**: JSON file downloads
9. Click "Run Again"
10. **Expected**: Returns to start screen

**Pass Criteria**:
- UI clear and professional ✓
- No layout issues ✓
- All buttons work ✓
- Export works ✓

---

### Test 8: Error Handling 🚨

**Goal**: Verify graceful error handling

**Test Case A: No axe-core**
1. Temporarily rename axe.min.js
2. Try to run test
3. **Expected**: Clear error message

**Test Case B: Invalid page**
1. Go to `chrome://extensions/`
2. Try to run test
3. **Expected**: Error or "Cannot run on this page"

**Test Case C: Very large page**
1. Go to complex site (e.g., amazon.com)
2. Run test
3. **Expected**: Completes without timeout

**Pass Criteria**:
- Errors don't crash extension ✓
- Error messages helpful ✓
- Extension recovers ✓

---

### Test 9: Performance ⚡

**Goal**: Verify acceptable performance

**Benchmark Sites**:
- Simple page: < 3 seconds
- Medium page: < 5 seconds  
- Complex page: < 10 seconds

**Test Steps**:
1. Start timer when clicking "Run Test"
2. Stop when results appear
3. Record time

**Pass Criteria**:
- Most sites complete in < 5 seconds ✓
- No crashes on large sites ✓
- UI remains responsive ✓

---

### Test 10: Cross-Site Consistency 🌐

**Goal**: Verify works across different domains

**Test Sites** (variety):
1. Government: `https://www.usa.gov`
2. E-commerce: `https://www.etsy.com`
3. News: `https://www.bbc.com`
4. Education: `https://www.stanford.edu`
5. Tech: `https://www.github.com`

**For Each Site**:
1. Run AccessGuru
2. Verify violations detected
3. Verify ML insights generated
4. Note any site-specific issues

**Pass Criteria**:
- Works on all domains ✓
- Consistent results quality ✓
- No site-specific crashes ✓

---

## Bug Report Template

If you find issues, document them:

```
**Bug**: [Short description]
**Severity**: Critical | High | Medium | Low
**Steps to Reproduce**:
1. 
2.
3.

**Expected Behavior**: 
**Actual Behavior**:
**Browser**: Chrome [version]
**Site URL**: 
**Console Errors**: [paste any errors]
**Screenshots**: [if applicable]
```

---

## Test Results Log

| Test | Status | Notes | Date |
|------|--------|-------|------|
| 1. Basic Functionality | ⬜ | | |
| 2. Violation Detection | ⬜ | | |
| 3. ML Alt Quality | ⬜ | | |
| 4. Impact Prediction | ⬜ | | |
| 5. Score Calculation | ⬜ | | |
| 6. Explanations | ⬜ | | |
| 7. UI/UX Flow | ⬜ | | |
| 8. Error Handling | ⬜ | | |
| 9. Performance | ⬜ | | |
| 10. Cross-Site | ⬜ | | |

Legend: ⬜ Not tested | ✅ Pass | ❌ Fail | ⚠️ Issues noted

---

## Post-Testing

After completing tests:

1. **Document all bugs** in bug tracker
2. **Calculate pass rate**: `(tests passed / total tests) × 100%`
3. **Prioritize fixes**: Critical bugs first
4. **Re-test** after fixes applied
5. **Update this document** with findings

**Target Pass Rate**: 90%+ before moving to ML integration phase

---

## Automated Testing (Future)

Consider adding:
- Unit tests for ML model functions
- Integration tests with Puppeteer
- Performance benchmarks
- Regression tests

Example:
```javascript
// test/ml-models.test.js
test('Alt text quality scorer', () => {
  const result = MLModels.scoreAltTextQuality('image', {});
  expect(result.score).toBeLessThan(4);
  expect(result.issues.length).toBeGreaterThan(0);
});
```
