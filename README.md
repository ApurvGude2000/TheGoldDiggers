# TheGoldDiggers
Submission for Datathon 2026



Chrome Extension
Rectangles around areas with accessibility issues
Color of rectangles based on severity
Deep Explanation of severity
Overall website accessibility score
ML models and Rule Based models

ML:
* ML Use Case 1: Semantic Quality Scoring
Model Type: Multi-task Regression Neural Network
What It Does:
Evaluates the usefulness of accessibility attributes that technically exist but may be poor quality.
        1A. Alt Text Quality Scorer
        1B. Link Text Quality Scorer
        1C. Button Label Quality Scorer

* ML Use Case 3: Domain-Specific Risk Prediction
Model Type: Multi-label Classification + Time Series
What It Does:
Predicts what violations are likely to occur based on page structure and domain patterns.

* ML Use Case 4: Natural Language Explanation Generation
* ML Use Case 5: Explainability with SHAP

* ML Use Case 7: LLM-Powered Contextual Suggestions
Model Type: API calls to GPT-4 / Claude (or run locally with Llama)
What It Does:
Generates context-aware, specific fix suggestions based on page content and violation.
