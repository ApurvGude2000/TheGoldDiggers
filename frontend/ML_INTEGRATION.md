# 🧠 ML Model Integration Guide

How to replace static heuristics with real ML models in AccessGuru.

## Current State vs. Target State

### Current (Heuristic-Based)
```javascript
// popup.js - Lines 2-125
const MLModels = {
  scoreAltTextQuality(altText, context) {
    // Simple rules: word count, generic words, etc.
    let score = 5.0;
    if (genericWords.includes(altText)) score -= 3;
    return { score, issues, suggestions };
  }
}
```

### Target (Real ML Models)
```javascript
const MLModels = {
  async scoreAltTextQuality(altText, context) {
    // Option A: Call your trained model API
    const response = await fetch('https://api.yourservice.com/score', {
      method: 'POST',
      body: JSON.stringify({ altText, context })
    });
    return await response.json();
    
    // Option B: TensorFlow.js in-browser
    const model = await tf.loadLayersModel('/models/alt-quality.json');
    const features = this.extractFeatures(altText);
    const prediction = model.predict(features);
    return this.formatPrediction(prediction);
  }
}
```

## Integration Options

### Option 1: Backend API (Recommended for Complex Models) ⭐⭐⭐

**Best for**: Large models (BERT, GPT-based), complex pipelines

**Architecture**:
```
Extension → API Gateway → ML Service → Return JSON
```

**Pros**:
- Can use heavy models (transformers, etc.)
- Easy to update models without updating extension
- Can log predictions for retraining
- Better security (models not exposed)

**Cons**:
- Requires backend infrastructure
- Network latency
- Costs money (hosting)
- Requires API key management

**Implementation**:

```javascript
// Add to popup.js
const API_CONFIG = {
  baseUrl: 'https://your-api.com/v1',
  apiKey: 'your-api-key-here' // Or use chrome.storage to store user's key
};

const MLModels = {
  async scoreAltTextQuality(altText, context) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/score-alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          alt_text: altText,
          context: {
            html: context.html,
            src: context.src,
            surrounding_text: context.surrounding_text
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        score: result.quality_score,
        issues: result.detected_issues,
        suggestions: result.improvement_suggestions,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('ML API error:', error);
      // Fallback to heuristic
      return this.heuristicAltTextScore(altText);
    }
  },
  
  // Keep heuristic as fallback
  heuristicAltTextScore(altText) {
    // ... existing code
  }
};
```

**Backend Example (FastAPI)**:
```python
# api/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load your trained model
alt_quality_model = joblib.load('models/alt_quality_model.pkl')
vectorizer = joblib.load('models/vectorizer.pkl')

class AltTextRequest(BaseModel):
    alt_text: str
    context: dict

@app.post("/v1/score-alt-text")
async def score_alt_text(request: AltTextRequest):
    # Extract features
    features = extract_features(request.alt_text, request.context)
    
    # Predict
    score = alt_quality_model.predict([features])[0]
    
    # Generate explanations
    issues = detect_issues(request.alt_text, features)
    suggestions = generate_suggestions(request.alt_text, issues)
    
    return {
        "quality_score": float(score),
        "detected_issues": issues,
        "improvement_suggestions": suggestions,
        "confidence": 0.85
    }
```

---

### Option 2: TensorFlow.js (In-Browser) ⭐⭐

**Best for**: Smaller models, offline usage, privacy-focused

**Pros**:
- No backend needed
- Works offline
- No API costs
- Instant predictions (no network latency)
- User data never leaves browser

**Cons**:
- Model size limited (ideally < 10MB)
- Slower on first load (download model)
- Can't use large transformer models
- Updates require extension update

**Implementation**:

1. **Convert your model to TensorFlow.js format**:
```python
# Python - Convert your trained model
import tensorflowjs as tfjs

# If you have Keras model
model.save('keras_model.h5')
tfjs.converters.save_keras_model(model, 'tfjs_model')

# If you have scikit-learn model
# Use sklearn-porter or onnx-js instead
```

2. **Add to extension**:
```javascript
// popup.js
// Import TensorFlow.js
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
document.head.appendChild(script);

const MLModels = {
  model: null,
  
  async loadModel() {
    if (!this.model) {
      this.model = await tf.loadLayersModel('/models/alt-quality/model.json');
      console.log('Model loaded');
    }
    return this.model;
  },
  
  async scoreAltTextQuality(altText, context) {
    const model = await this.loadModel();
    
    // Extract features (must match training)
    const features = this.extractFeatures(altText, context);
    
    // Convert to tensor
    const inputTensor = tf.tensor2d([features]);
    
    // Predict
    const prediction = model.predict(inputTensor);
    const score = await prediction.data();
    
    // Cleanup
    inputTensor.dispose();
    prediction.dispose();
    
    return {
      score: score[0] * 10, // Scale 0-1 to 0-10
      confidence: 0.85,
      issues: this.interpretScore(score[0]),
      suggestions: this.generateSuggestions(score[0])
    };
  },
  
  extractFeatures(altText, context) {
    // Must match your training feature extraction!
    const words = altText.split(/\s+/);
    return [
      words.length,                           // word_count
      altText.length,                         // char_count
      this.hasNumbers(altText) ? 1 : 0,      // has_numbers
      this.isGeneric(altText) ? 1 : 0,       // is_generic
      // ... all other features from your model
    ];
  }
};
```

3. **Add model files to extension**:
```
models/
├── alt-quality/
│   ├── model.json        # Model architecture
│   ├── group1-shard1of1.bin  # Model weights
│   └── metadata.json
```

4. **Update manifest.json**:
```json
{
  "web_accessible_resources": [
    {
      "resources": [
        "axe.min.js",
        "models/*/*.json",
        "models/*/*.bin"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

### Option 3: Hybrid Approach ⭐⭐⭐

**Best for**: Production apps

**Strategy**:
- Use TensorFlow.js for fast, simple models (alt text scoring)
- Use API for complex models (NLP explanation generation)
- Fallback to heuristics if both fail

**Implementation**:
```javascript
const MLModels = {
  async scoreAltTextQuality(altText, context) {
    try {
      // Try TensorFlow.js first (fast, offline)
      return await this.tfJsScore(altText, context);
    } catch (error) {
      console.warn('TF.js failed, trying API:', error);
      try {
        // Fallback to API
        return await this.apiScore(altText, context);
      } catch (apiError) {
        console.warn('API failed, using heuristic:', apiError);
        // Final fallback to heuristic
        return this.heuristicScore(altText);
      }
    }
  }
};
```

---

## Feature Extraction Consistency ⚠️

**CRITICAL**: Your extension's feature extraction must **exactly match** your training pipeline!

### In Training (Python):
```python
def extract_features(row):
    return {
        'word_count': len(alt.split()),
        'char_count': len(alt),
        'has_numbers': bool(re.search(r'\d', alt)),
        'is_generic': alt.lower() in ['image', 'picture', 'photo'],
        # ... 20 more features
    }
```

### In Extension (JavaScript):
```javascript
extractFeatures(altText) {
  return [
    altText.split(/\s+/).length,           // word_count
    altText.length,                        // char_count  
    /\d/.test(altText) ? 1 : 0,           // has_numbers
    ['image','picture','photo'].includes(altText.toLowerCase()) ? 1 : 0, // is_generic
    // ... SAME 20 features in SAME ORDER
  ];
}
```

**Tips**:
- Document feature order clearly
- Use same regex patterns
- Test with known inputs
- Add feature validation

---

## Model Serving Options

### For Backend API:

1. **FastAPI + Docker** (Recommended)
   - Fast, lightweight
   - Easy to deploy
   - Great for ML models

2. **AWS Lambda + API Gateway**
   - Serverless (pay per use)
   - Auto-scaling
   - Can use SageMaker

3. **Google Cloud Run**
   - Containerized
   - Auto-scaling
   - Good free tier

4. **Hugging Face Inference API**
   - Managed hosting
   - Great for transformers
   - $$$

### Deployment Example (FastAPI + Render.com):

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# render.yaml
services:
  - type: web
    name: accessguru-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
```

---

## Testing Your Integration

### Unit Tests
```javascript
// test/ml-models.test.js
describe('MLModels.scoreAltTextQuality', () => {
  test('scores generic alt text low', async () => {
    const result = await MLModels.scoreAltTextQuality('image', {});
    expect(result.score).toBeLessThan(4);
  });
  
  test('scores descriptive alt text high', async () => {
    const result = await MLModels.scoreAltTextQuality(
      'Q3 2024 sales revenue by region showing 23% increase',
      {}
    );
    expect(result.score).toBeGreaterThan(7);
  });
});
```

### Integration Tests
```javascript
// test/integration.test.js
test('real website analysis', async () => {
  const page = await loadTestPage();
  const results = await runAccessGuru(page);
  
  expect(results.violations.length).toBeGreaterThan(0);
  expect(results.violations[0].mlAnalysis).toBeDefined();
  expect(results.score).toBeGreaterThan(0);
  expect(results.score).toBeLessThanOrEqual(100);
});
```

---

## Performance Optimization

### For API Calls
```javascript
// Batch multiple predictions
async batchPredict(items) {
  const response = await fetch(`${API_CONFIG.baseUrl}/batch-predict`, {
    method: 'POST',
    body: JSON.stringify({ items })
  });
  return await response.json();
}

// Cache results
const cache = new Map();
async scoreWithCache(altText) {
  const cacheKey = `alt:${altText}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const result = await this.scoreAltTextQuality(altText);
  cache.set(cacheKey, result);
  return result;
}
```

### For TensorFlow.js
```javascript
// Preload model on extension install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Preloading ML models...');
  await MLModels.loadModel();
});

// Use Web Workers for heavy computation
const worker = new Worker('ml-worker.js');
worker.postMessage({ altText, context });
worker.onmessage = (e) => {
  const result = e.data;
  // Update UI
};
```

---

## Migration Checklist

When you're ready to integrate real ML:

- [ ] Train models on your 3,500 violations dataset
- [ ] Export models in compatible format (TF.js or pickle)
- [ ] Set up backend API (if using Option 1)
- [ ] Update `MLModels` object in popup.js
- [ ] Match feature extraction exactly
- [ ] Add error handling & fallbacks
- [ ] Test on 20+ websites
- [ ] Measure performance (latency, accuracy)
- [ ] Add loading indicators for async operations
- [ ] Update UI to show "Powered by ML" badges
- [ ] Document model versions & update process

---

## Example: Complete Alt Text Scorer

```javascript
// popup.js - Full production implementation
const MLModels = {
  apiBaseUrl: 'https://api.accessguru.com/v1',
  tfModel: null,
  
  async init() {
    // Load TF.js model on startup
    try {
      this.tfModel = await tf.loadLayersModel('/models/alt-quality/model.json');
      console.log('✅ TF.js model loaded');
    } catch (error) {
      console.warn('⚠️ TF.js model failed to load, will use API');
    }
  },
  
  async scoreAltTextQuality(altText, context) {
    const startTime = performance.now();
    
    try {
      // Try local TF.js model first (fastest)
      if (this.tfModel) {
        const result = await this.tfJsPredict(altText, context);
        console.log(`TF.js prediction: ${performance.now() - startTime}ms`);
        return result;
      }
    } catch (error) {
      console.warn('TF.js prediction failed:', error);
    }
    
    try {
      // Fallback to API
      const result = await this.apiPredict(altText, context);
      console.log(`API prediction: ${performance.now() - startTime}ms`);
      return result;
    } catch (error) {
      console.warn('API prediction failed:', error);
    }
    
    // Final fallback to heuristic
    console.warn('Using heuristic fallback');
    return this.heuristicScore(altText);
  },
  
  async tfJsPredict(altText, context) {
    const features = this.extractFeatures(altText, context);
    const inputTensor = tf.tensor2d([features]);
    const prediction = this.tfModel.predict(inputTensor);
    const [score] = await prediction.data();
    
    inputTensor.dispose();
    prediction.dispose();
    
    return this.formatResult(score, altText);
  },
  
  async apiPredict(altText, context) {
    const response = await fetch(`${this.apiBaseUrl}/score-alt-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt_text: altText, context })
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  },
  
  extractFeatures(altText, context) {
    // Match your training pipeline exactly!
    const words = altText.trim().split(/\s+/);
    return [
      words.length,
      altText.length,
      words.length > 0 ? altText.length / words.length : 0,
      /\d/.test(altText) ? 1 : 0,
      /(px|%|pt|em|cm)/.test(altText) ? 1 : 0,
      ['image', 'picture', 'photo', 'graphic'].includes(altText.toLowerCase()) ? 1 : 0,
      /\.(jpg|png|gif|jpeg|svg)/i.test(altText) ? 1 : 0,
      // ... add all 15-20 features from your model
    ];
  },
  
  formatResult(score, altText) {
    const normalizedScore = score * 10; // 0-1 to 0-10
    return {
      score: parseFloat(normalizedScore.toFixed(1)),
      issues: this.detectIssues(normalizedScore, altText),
      suggestions: this.generateSuggestions(normalizedScore, altText),
      confidence: 0.87
    };
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  MLModels.init();
});
```

---

**Next Steps**: Start with Option 1 (Backend API) for quick iteration, then migrate to Option 3 (Hybrid) for production.
