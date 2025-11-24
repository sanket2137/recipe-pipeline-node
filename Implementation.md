# Data Engineering Assessment – Firebase-Based Recipe Analytics Pipeline

This README provides a **complete, beginner-friendly guide** for building and running a data engineering pipeline using **Firebase Firestore** and **Node.js**.

It includes **data modeling, Firebase setup, ETL, validation, analytics, and full execution steps**, so even a new learner can implement the entire pipeline successfully.

---

# 1. Overview

This project implements an end-to-end **Data Engineering Pipeline** using Firebase Firestore as the data source.

The pipeline:

- Loads my own recipe **Chicken Curry (serves 2 people)** as the seed dataset  
- Generates **20 synthetic recipes**  
- Adds **users and interactions** (views, likes, cook attempts, ratings)  
- Exports Firestore collections into **normalized CSVs**  
- Validates the exported data using custom data quality rules  
- Produces **10+ analytics insights**  

This project follows the requirements from the assessment document *“Data Engineering Assessment (Firebase-Based Recipe Analytics Pipeline)”*.

---

# 2. Tech Stack

- **Node.js** – scripting & automation  
- **Firebase Firestore** – database  
- **Firebase Admin SDK** – backend connection  
- **csv-writer** – CSV creation  
- **csv-parser** – CSV reading for validation & analytics  

---

# 3. Data Model

The system contains **five main entities**:

### 3.1 Entities & Fields

#### **1. recipes**
- recipe_id  
- name  
- description  
- servings  
- prep_time_min  
- cook_time_min  
- total_time_min (auto-calculated if missing)  
- difficulty (easy | medium | hard)  
- cuisine  
- tags  
- author_user_id  
- created_at  

#### **2. ingredients**
- ingredient_id  
- recipe_id  
- name  
- quantity  
- unit  
- notes  
- order  

#### **3. steps**
- step_id  
- recipe_id  
- order  
- text  

#### **4. users**
- user_id  
- name  
- email  
- country  
- created_at  

#### **5. interactions**
- interaction_id  
- user_id  
- recipe_id  
- type (view | like | cook_attempt | rating)  
- rating (0–5, optional)  
- difficulty_used  
- source  
- created_at  

---

### 3.2 ERD (Entity Relationship Diagram)

```
 users ----< interactions >---- recipes ----< ingredients
                                 |
                                 └----< steps
```

---

# 4. Firebase Source Data Setup

Implemented in: **insert_data.js**

### The script:

### 1. Inserts Chicken Curry recipe
- Adds metadata  
- Adds all ingredients  
- Adds all cooking steps  

### 2. Generates 20 synthetic recipes
- Random difficulty  
- Random prep/cook time  
- Random tags  

### 3. Creates users
- `user_sanket`  
- 10 synthetic users  

### 4. Inserts 300 interactions
- views  
- likes  
- cook_attempts  
- ratings  

This initializes the entire Firestore dataset.

---

# 5. ETL / ELT Pipeline

Implemented in: **export_etl.js**

### Extract
Reads:

- Recipes  
- Ingredients (subcollection)  
- Steps (subcollection)  
- Interactions  

### Transform
- flattens nested documents  
- converts timestamps to strings  
- derives `total_time_min`  
- cleans arrays and text  

### Load
Creates normalized CSVs:

- recipe.csv  
- ingredients.csv  
- steps.csv  
- interactions.csv  

Saved in `output/`.

---

# 6. Data Quality Validation

Implemented in: **validate_data.js**

### Validation Rules

#### **Required fields**
- recipe_id, name  
- ingredient name  
- step text  
- interaction type  

#### **Positive numeric rules**
- servings > 0  
- quantity ≥ 0  
- prep/cook times ≥ 0  
- step order ≥ 1  

#### **Difficulty**
Must be one of:
```
easy, medium, hard
```

#### **Rating**
If present:
```
0 ≤ rating ≤ 5
```

#### **Interaction type**
Must be:
```
view, like, cook_attempt, rating
```

### Output
Validation results stored in:

```
output/validation_report.csv
```

---

# 7. Analytics Requirements

Implemented in: **analytics.js**

Generates insights such as:

1. Most common ingredients  
2. Most viewed recipe  
3. Most liked recipe  
4. Most cooked recipe  
5. Average prep time  
6. Average cook time  
7. Difficulty distribution  
8. Ratings analysis  
9. Prep time vs likes correlation  
10. Ingredients in highest-engagement recipes  

Saved in:

```
output/analytics_summary.txt
```

---

# 8. Project Structure

```
recipe-pipeline-node/
│
├── insert_data.js          
├── export_etl.js           
├── validate_data.js        
├── analytics.js            
│
├── serviceAccountKey.json  
│
├── output/
│   ├── recipe.csv
│   ├── ingredients.csv
│   ├── steps.csv
│   ├── interactions.csv
│   ├── validation_report.csv
│   └── analytics_summary.txt
│
└── README.md
```

---

# 9. Beginner-Friendly Step-by-Step Setup

## Step 1 — Install Node.js

Download from:  
https://nodejs.org/

Verify:

```bash
node -v
npm -v
```

---

## Step 2 — Install Firebase CLI (optional but useful)

```bash
npm install -g firebase-tools
firebase login
```

---

## Step 3 — Create Firebase Project

1. Go to Firebase Console  
2. Click **Add Project**  
3. Click **Continue**  
4. Select **Firestore Database → Create Database**  
5. Select **Production Mode**  
6. Click **Enable**  

---

## Step 4 — Download Firebase Admin Key

1. Go to **Project Settings**  
2. Select **Service Accounts**  
3. Click **Generate New Private Key**  
4. Save file as:

```
serviceAccountKey.json
```

Put it inside the project folder.

---

## Step 5 — Install Dependencies

Inside your project folder:

```bash
npm install firebase-admin csv-writer csv-parser
```

---

# 10. How to Run the Complete Pipeline

Run scripts in order:

## ✔ 1. Insert all data into Firestore

```bash
node insert_data.js
```

## ✔ 2. Export normalized CSV files

```bash
node export_etl.js
```

## ✔ 3. Validate data quality

```bash
node validate_data.js
```

## ✔ 4. Generate analytics

```bash
node analytics.js
```

---

# 11. Review Outputs

Check the **output/** folder:

```
recipe.csv
ingredients.csv
steps.csv
interactions.csv
validation_report.csv
analytics_summary.txt
```

---

# 12. Known Constraints & Limitations

- Synthetic data may produce different analytics each run  
- Firestore free tier has read/write limits  
- Analytics are batch-mode only  
- No dashboards included  
- Missing pagination support for very large datasets  

---

# 13. Conclusion

You now have a complete end-to-end Data Engineering Pipeline:

✔ Data Modeling  
✔ Firebase Setup  
✔ Data Seeding  
✔ ETL → Normalized CSVs  
✔ Data Validation  
✔ BI Analytics  
✔ Beginner-friendly documentation  

