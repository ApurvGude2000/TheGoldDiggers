"""
AccessGuru ML Pipeline - Model Training and Saving
This module handles feature engineering, model training, and saving artifacts
"""

import pandas as pd
import numpy as np
import re
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from bs4 import BeautifulSoup
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import warnings

warnings.filterwarnings('ignore')


class AccessibilityFeatureExtractor:
    """Extract features from HTML and accessibility violation data"""
    
    def __init__(self):
        self.le_violation = LabelEncoder()
        self.le_tag = LabelEncoder()
        self.le_domain = LabelEncoder()
        
    def extract_everything(self, row):
        """Extract all features from a row"""
        html = str(row['affected_html_elements']).lower()
        supp = str(row['supplementary_information']).lower()
        v_name = str(row['violation_name']).lower()
        wcag = str(row['wcag_reference']).upper()

        # Tag Extraction
        tag_match = re.search(r'<([a-zA-Z0-9]+)', html)
        tag = tag_match.group(1) if tag_match else 'unknown'

        # Alt Content Analysis
        alt_match = re.search(r'alt=["\'](.*?)["\']', html)
        alt_content = alt_match.group(1).strip() if alt_match else ""

        # Technical Patterns (Heuristics)
        redundant_pat = r'(image of|photo of|picture of|link to|click here|button|graphic of)'
        placeholder_set = {'alt', 'description', 'label', 'placeholder', 'none', 'image', 'spacer', 'icon', 'dot'}

        # Technical Metrics (Contrast & Font)
        cr_match = re.search(r"contrastratio':\s*([0-9.]+)", supp)
        fs_match = re.search(r"fontsize':\s*['\"]([0-9.]+)", supp)

        return pd.Series({
            # --- Structural & Tag Features ---
            'html_tag': tag,
            'snippet_len': len(html),
            'snippet_word_count': len(html.split()),
            'tag_count': html.count('<'),
            'word_count': len(html.split()),
            'is_button_or_link': 1 if any(x in html for x in ['<a', '<button']) else 0,
            'has_id': 1 if 'id=' in html else 0,
            'has_class': 1 if 'class=' in html else 0,
            'has_role_attr': 1 if 'role=' in html else 0,
            'has_tabindex': 1 if 'tabindex=' in html else 0,

            # --- Semantic & Alt-Text Features ---
            'is_img_or_svg': 1 if any(x in html for x in ['<img', '<svg']) else 0,
            'has_alt_attr': 1 if 'alt=' in html else 0,
            'is_alt_empty': 1 if (alt_content == "" and 'alt=' in html) else 0,
            'alt_word_count': len(alt_content.split()),
            'alt_is_generic': 1 if alt_content in placeholder_set else 0,
            'alt_is_filename': 1 if re.search(r'\.(jpg|png|gif|jpeg|svg|webp)$', alt_content) else 0,
            'has_redundant_prefix': 1 if re.search(redundant_pat, html) else 0,
            'is_aria_hidden': 1 if 'aria-hidden="true"' in html else 0,
            'has_aria_label': 1 if 'aria-label=' in html else 0,

            # --- Technical & Metadata Features ---
            'contrast_ratio': float(cr_match.group(1)) if cr_match else np.nan,
            'font_size': float(fs_match.group(1)) if fs_match else np.nan,
            'is_aria_related': 1 if ('aria' in v_name or 'aria' in supp) else 0,
            'aria_density': supp.count('aria-'),
            'supp_info_len': len(supp),

            # --- WCAG Intelligence ---
            'wcag_level': 3 if 'AAA' in wcag else (2 if 'AA' in wcag else (1 if 'A' in wcag else 0))
        })

    def extract_html_features(self, html):
        """Extract features from HTML using BeautifulSoup"""
        if pd.isna(html):
            html = ""

        soup = BeautifulSoup(str(html), "html.parser")

        return {
            "num_links": len(soup.find_all('a')),
            "num_images": len(soup.find_all(['img', 'svg'])),
            "num_buttons": len(soup.find_all('button')),
            "num_inputs": len(soup.find_all('input')),
            "num_lists": len(soup.find_all(['ul', 'ol', 'li'])),
            "num_headings": len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])),
            "has_form": int(soup.find('form') is not None),
            "num_divs": len(soup.find_all('div')),
            "num_spans": len(soup.find_all('span')),
            "avg_text_len_per_tag": np.mean([len(t.get_text()) for t in soup.find_all()]) if soup.find_all() else 0,
            "has_inline_style": int(soup.find(attrs={'style': True}) is not None),
            "has_script_or_style": int(soup.find(['script', 'style']) is not None),
        }


def train_and_save_model(csv_path='Access_to_Tech_Dataset.csv', model_dir='models'):
    """
    Train the XGBoost model and save all artifacts
    
    Args:
        csv_path: Path to the training data CSV
        model_dir: Directory to save model artifacts
    """
    import os
    os.makedirs(model_dir, exist_ok=True)
    
    # Load data
    print("Loading data...")
    df = pd.read_csv(csv_path)
    
    # Clean categorical columns
    print("Preprocessing data...")
    for col in ['violation_name', 'violation_category', 'domain_category', 'violation_impact']:
        df[col] = df[col].str.strip().str.lower()

    # Map Impact to numeric
    impact_map = {'minor': 1, 'moderate': 2, 'serious': 3, 'critical': 4}
    df['impact_numeric'] = df['violation_impact'].map(impact_map).fillna(1)
    df['severity_score'] = df['impact_numeric'] / 4.0

    # Initialize feature extractor
    extractor = AccessibilityFeatureExtractor()
    
    # Extract features
    print("Extracting features...")
    feature_df = df.apply(extractor.extract_everything, axis=1)
    df = pd.concat([df, feature_df], axis=1)

    # Extract HTML features
    html_features = df['supplementary_information'].apply(extractor.extract_html_features)
    html_features_df = pd.DataFrame(list(html_features))
    df = pd.concat([df, html_features_df], axis=1)

    # Domain & URL intelligence
    df['domain_encoded'] = extractor.le_domain.fit_transform(df['domain_category'])
    df['url_depth'] = df['web_URL'].str.count('/') - 2
    df['url_len'] = df['web_URL'].str.len()
    df['is_gov'] = df['web_URL'].str.contains('.gov', case=False, na=False).astype(int)
    df['is_edu'] = df['web_URL'].str.contains('.edu', case=False, na=False).astype(int)
    df['is_org'] = df['web_URL'].str.contains('.org', case=False, na=False).astype(int)

    # Encode categorical features
    df['violation_id_enc'] = extractor.le_violation.fit_transform(df['violation_name'].astype(str))
    df['tag_enc'] = extractor.le_tag.fit_transform(df['html_tag'].astype(str))

    # Define features for model
    features = [
        'tag_enc',
        'snippet_len',
        'word_count',
        'tag_count',
        'is_button_or_link',
        'is_img_or_svg',
        'has_alt_attr',
        'has_aria_label',
        'has_role_attr',
        'is_aria_related',
        'contrast_ratio',
        'font_size',
        'num_links', 'num_images', 'num_buttons', 'num_inputs', 'num_lists',
        'num_headings', 'has_form', 'num_divs', 'num_spans',
        'avg_text_len_per_tag', 'has_inline_style', 'has_script_or_style'
    ]

    # Keep only features that exist
    available_features = [f for f in features if f in df.columns]
    
    # Prepare data
    X = df[available_features].fillna(0)
    y = df['violation_score']

    # Score mapping
    score_mapping = {2: 0, 3: 1, 4: 2, 5: 3}
    reverse_mapping = {0: 2, 1: 3, 2: 4, 3: 5}

    # Train-test split
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Map scores
    y_train_mapped = y_train.map(score_mapping)
    y_test_mapped = y_test.map(score_mapping)

    # Apply SMOTE
    print("Applying SMOTE...")
    smote = SMOTE(random_state=42)
    X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train_mapped)

    # Train model
    print("Training XGBoost model...")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=6,
        objective='multi:softprob',
        num_class=len(y_train.unique()),
        random_state=42,
        eval_metric='mlogloss'
    )
    xgb_clf.fit(X_train_smote, y_train_smote)

    # Save model and artifacts
    print(f"Saving model to {model_dir}/...")
    
    # Save XGBoost model
    xgb_clf.save_model(f'{model_dir}/xgb_model.json')
    
    # Save encoders and mappings
    artifacts = {
        'feature_names': available_features,
        'score_mapping': score_mapping,
        'reverse_mapping': reverse_mapping,
        'le_violation_classes': extractor.le_violation.classes_.tolist(),
        'le_tag_classes': extractor.le_tag.classes_.tolist(),
        'le_domain_classes': extractor.le_domain.classes_.tolist(),
    }
    
    with open(f'{model_dir}/model_artifacts.pkl', 'wb') as f:
        pickle.dump(artifacts, f)
    
    # Save as JSON for easy inspection
    with open(f'{model_dir}/model_artifacts.json', 'w') as f:
        json.dump(artifacts, f, indent=2)
    
    print("Model training complete!")
    print(f"Available features: {len(available_features)}")
    print(f"Training samples: {len(X_train_smote)}")
    print(f"Test samples: {len(X_test)}")
    
    # Test prediction
    y_pred = xgb_clf.predict(X_test)
    y_pred_original = pd.Series(y_pred).map(reverse_mapping)
    
    from sklearn.metrics import accuracy_score
    accuracy = accuracy_score(y_test, y_pred_original)
    print(f"Test Accuracy: {accuracy:.4f}")
    
    return xgb_clf, artifacts, X_test, y_test


if __name__ == "__main__":
    # Train and save the model
    model, artifacts, X_test, y_test = train_and_save_model()
    print("\nModel saved successfully!")
