# Firebase Recipe Analytics Pipeline

A complete end-to-end **Data Engineering Pipeline** implemented using **Firebase Firestore** and **Node.js**, designed to ingest recipe data, generate synthetic datasets, validate data quality, perform analytics, and output normalized CSV tables with visual insights.

This project is built as part of the **Data Engineering Assessment** :contentReference[oaicite:1]{index=1}.

---

## 📌 **Author**
**Name:** Sanket Raut  
**Primary Recipe Used:** Chicken Curry (for 2 people)

---

# 1. Project Overview

This automated pipeline:

✔ Inserts real + synthetic data into Firebase  
✔ Creates Users, Recipes, Ingredients, Steps, Interactions  
✔ Exports **5 normalized CSV tables**  
✔ Performs Data Validation  
✔ Generates **10+ analytics insights**  
✔ Produces **visual charts (PNG)**  
✔ Provides a fully normalized ERD and data dictionary

Technology Stack:

- **Node.js**
- **Firebase Firestore (NoSQL)**
- **CSV Writer / CSV Parser**
- **Matplotlib (used via Python for charts)**
- **dbdiagram.io** for ERD

---

# 2. Data Model

Data is stored in Firestore but exported into a fully normalized tabular structure (3NF).

## 📘 Entity Relationship Diagram  
**Local ERD Image:**  
![ERD](recipe_erd_diagram.png)

**Interactive ERD:**  
https://dbdiagram.io/d/691ed089228c5bbc1ab1690c

---

## 🧱 **Tables Overview**

### **1. users**
Columns: user_id, name, email, country, created_at  
Relationships: 1 → MANY interactions, 1 → MANY recipes (author)

### **2. recipes**
Columns: recipe_id, name, description, servings, prep_time, cook_time, difficulty, cuisine, tags  
Relationships:  
- 1 → MANY ingredients  
- 1 → MANY steps  
- 1 → MANY interactions  
- MANY → 1 (author user)

### **3. ingredients**
Columns: ingredient_id, recipe_id, name, quantity, unit, order

### **4. steps**
Columns: step_id, recipe_id, order, text

### **5. interactions**
Columns: interaction_id, user_id, recipe_id, type, rating, difficulty_used, source, created_at  
Types: view, like, cook_attempt, rating

---

# 3. Firebase Setup

### Prerequisites
- Node.js 14+  
- Firebase project  
- Firestore enabled  
- Run:

```
npm install firebase-admin csv-writer csv-parser
```

### Service Account Setup
Download API key:

1. Project Settings → Service Accounts  
2. Generate New Private Key  
3. Save as:

```
serviceAccountKey.json


---

# 4. Running the Pipeline

## **Step 1 — Seed Data into Firestore**
Inserts:

- Chicken Curry recipe  
- 20 synthetic recipes  
- 10 users  
- 300+ interactions  
- Ingredients + Steps for each recipe

Run:

```
node insert_data.js
```

---

## **Step 2 — Export ETL (Generates 5 CSV Files)**

```
node export_etl.js
```

Outputs (in `/output`):

- users.csv  
- recipe.csv  
- ingredients.csv  
- steps.csv  
- interactions.csv  

---

## **Step 3 — Data Validation**

```
node validate_data.js
```

Output:

```
output/validation_report.csv
```

If empty → data is clean.

---

## **Step 4 — Analytics Generation**

```
node analytics.js
```

Outputs:

- analytics_summary.txt  
- Visual charts (`.png`)  

Generated charts include:

- Most Viewed Recipes  
- Most Liked Recipes  
- Top Common Ingredients  
- User Growth by Month  
- Countries by User Count  
- Prep Time vs Likes  
- Difficulty Distribution  
- Users with Most Recipes  

All PNGs located inside `/output`.

---

# 5. ETL Architecture

The ETL pipeline follows **Extract → Transform → Load**.

### **Extract**
Fetches data from:

- recipes
- ingredients (subcollection)
- steps (subcollection)
- users
- interactions

### **Transform**
- Flatten nested subcollections  
- Convert arrays → strings  
- Compute `total_time_min`  
- Sanitize text  

### **Load**
Writes clean CSV files to `/output`.

---

# 6. Analytics Summary

Analytics includes:

1. Most common ingredients  
2. Most viewed recipes  
3. Most liked recipes  
4. Most cooked recipes  
5. Longest-prep recipes  
6. Average preparation time  
7. Average cooking time  
8. Difficulty distribution  
9. Prep time ↔ likes correlation  
10. Ingredients with highest engagement  
11. User growth by month  
12. Top countries by user count  

Full report:  
📄 `output/analytics_summary.txt`

Charts saved as PNG inside `/output`.

---

# 7. Output Folder Structure

```
output/
│── recipe.csv
│── users.csv
│── ingredients.csv
│── steps.csv
│── interactions.csv
│── validation_report.csv
│── analytics_summary.txt
│── top_liked_recipes.png
│── top_viewed_recipes.png
│── difficulty_distribution.png
│── prep_time_vs_likes.png
│── top_10_most_common_ingredients.png
│── top_countries_by_user_count.png
│── users_with_the_most_recipes.png
│── user_growth_by_month.png
```

---

# 8. Project Directory Structure

```
recipe-pipeline-node/
│── docs/
│   ├── data_dictionary.md
│   ├── recipe_erd_diagram.png
│
│── output/
│   ├── (all CSV + PNG files)
│
│── insert_data.js
│── export_etl.js
│── validate_data.js
│── analytics.js
│── package.json
│── package-lock.json
│── serviceAccountKey.json
│── README.md
```

---

# 9. Known Limitations

- Synthetic data randomness may affect chart shapes  
- Analytics uses simple statistics (not ML-based)  
- Firestore read costs apply for large datasets  

---

# 10. Conclusion


✔ Data modeling with ERD  
✔ Firebase source data setup  
✔ ETL pipeline (5 CSV outputs)  
✔ Data quality validation  
✔ 10+ analytics insights  
✔ Clean documentation  
✔ Charts + visuals  
✔ Normalized schema  
✔ Automated Node.js scripts  

