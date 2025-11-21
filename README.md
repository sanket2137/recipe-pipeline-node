# Firebase Recipe Analytics Pipeline

A complete end-to-end **Data Engineering Pipeline** implemented using **Firebase Firestore** and **Node.js**, designed to ingest recipe data, generate synthetic datasets, validate data quality, perform analytics, and output normalized CSV tables with visual insights.

This project is built as part of the **Data Engineering Assessment**.


## 📌 Author

**Name:** Sanket Raut  
**Primary Recipe Used:** Chicken Curry (for 2 people)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Data Model](#2-data-model)
3. [Firebase Setup](#3-firebase-setup)
4. [Running the Pipeline](#4-running-the-pipeline)
5. [ETL Architecture](#5-etl-architecture)
6. [Analytics Summary](#6-analytics-summary)
7. [Output Folder Structure](#7-output-folder-structure)
8. [Project Directory Structure](#8-project-directory-structure)
9. [Known Limitations](#9-known-limitations)
10. [Conclusion](#10-conclusion)

---

## 1. Project Overview

This automated pipeline performs the following operations:

- Inserts real and synthetic data into Firebase Firestore
- Creates Users, Recipes, Ingredients, Steps, and Interactions
- Exports **5 normalized CSV tables**
- Performs comprehensive data validation
- Generates **10+ analytics insights**
- Produces **visual charts (PNG format)**
- Provides a fully normalized ERD and data dictionary

### Technology Stack

- **Node.js** - Runtime environment
- **Firebase Firestore** - NoSQL database
- **CSV Writer / CSV Parser** - Data export and import
- **Matplotlib** - Chart generation (via Python)
- **dbdiagram.io** - ERD visualization

---

## 2. Data Model

Data is stored in Firestore but exported into a fully normalized tabular structure (3NF).

### 📘 Entity Relationship Diagram

**Local ERD Image:**  
![ERD](recipe_erd_diagram.png)

**Interactive ERD:**  
[View on dbdiagram.io](https://dbdiagram.io/d/691ed089228c5bbc1ab1690c)

---

### 🧱 Tables Overview

#### 1. users
**Columns:** `user_id`, `name`, `email`, `country`, `created_at`  
**Relationships:**  
- One-to-Many with `interactions`
- One-to-Many with `recipes` (as author)

#### 2. recipes
**Columns:** `recipe_id`, `name`, `description`, `servings`, `prep_time`, `cook_time`, `difficulty`, `cuisine`, `tags`  
**Relationships:**  
- One-to-Many with `ingredients`
- One-to-Many with `steps`
- One-to-Many with `interactions`
- Many-to-One with `users` (author)

#### 3. ingredients
**Columns:** `ingredient_id`, `recipe_id`, `name`, `quantity`, `unit`, `order`

#### 4. steps
**Columns:** `step_id`, `recipe_id`, `order`, `text`

#### 5. interactions
**Columns:** `interaction_id`, `user_id`, `recipe_id`, `type`, `rating`, `difficulty_used`, `source`, `created_at`  
**Interaction Types:** `view`, `like`, `cook_attempt`, `rating`

---

## 3. Firebase Setup

### Prerequisites

- Node.js 14 or higher
- Firebase project with Firestore enabled
- Firebase Admin SDK credentials

### Installation

Install required dependencies:

```bash
npm install firebase-admin csv-writer csv-parser
```

### Service Account Setup

1. Navigate to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded file as `serviceAccountKey.json` in the project root directory

---

## 4. Running the Pipeline

### Step 1: Seed Data into Firestore

This step inserts the following data into Firestore:

- Chicken Curry recipe (primary recipe)
- 20 synthetic recipes
- 10 users
- 300+ interactions
- Ingredients and steps for each recipe

```bash
node insert_data.js
```

---

### Step 2: Export ETL (Generate CSV Files)

This step extracts data from Firestore and generates 5 normalized CSV files.

```bash
node export_etl.js
```

**Output files** (located in `/output`):

- `users.csv`
- `recipe.csv`
- `ingredients.csv`
- `steps.csv`
- `interactions.csv`

---

### Step 3: Data Validation

Runs data quality checks and generates a validation report.

```bash
node validate_data.js
```

**Output:**

- `output/validation_report.csv`

*Note: If the validation report is empty, all data passed quality checks.*

---

### Step 4: Analytics Generation

Generates analytics insights and visual charts.

```bash
node analytics.js
```

**Outputs:**

- `analytics_summary.txt` - Comprehensive analytics report
- Multiple PNG chart files

**Generated Charts:**

- Most Viewed Recipes
- Most Liked Recipes
- Top Common Ingredients
- User Growth by Month
- Countries by User Count
- Prep Time vs Likes
- Difficulty Distribution
- Users with Most Recipes

All PNG files are saved in the `/output` directory.

---

## 5. ETL Architecture

The ETL pipeline follows the **Extract → Transform → Load** paradigm.

### Extract

Fetches data from Firestore collections:

- `recipes`
- `ingredients` (subcollection)
- `steps` (subcollection)
- `users`
- `interactions`

### Transform

Data transformation operations include:

- Flattening nested subcollections
- Converting arrays to delimited strings
- Computing `total_time_min` from prep and cook times
- Sanitizing text fields
- Normalizing date formats

### Load

Writes cleaned and transformed data to CSV files in the `/output` directory.

---

## 6. Analytics Summary

The analytics module generates the following insights:

1. Most common ingredients across all recipes
2. Most viewed recipes
3. Most liked recipes
4. Most cooked recipes
5. Longest preparation time recipes
6. Average preparation time
7. Average cooking time
8. Difficulty level distribution
9. Correlation between prep time and likes
10. Ingredients with highest user engagement
11. User growth trends by month
12. Top countries by user count

**Full Report:** `output/analytics_summary.txt`

**Visual Charts:** All charts are saved as PNG files in the `/output` directory.

---

## 7. Output Folder Structure

```
output/
├── recipe.csv
├── users.csv
├── ingredients.csv
├── steps.csv
├── interactions.csv
├── validation_report.csv
├── analytics_summary.txt
├── top_liked_recipes.png
├── top_viewed_recipes.png
├── difficulty_distribution.png
├── prep_time_vs_likes.png
├── top_10_most_common_ingredients.png
├── top_countries_by_user_count.png
├── users_with_the_most_recipes.png
└── user_growth_by_month.png
```

---

## 8. Project Directory Structure

```
recipe-pipeline-node/
├── docs/
│   ├── data_dictionary.md
│   └── recipe_erd_diagram.png
├── output/
│   └── (all CSV and PNG files)
├── insert_data.js
├── export_etl.js
├── validate_data.js
├── analytics.js
├── package.json
├── package-lock.json
├── serviceAccountKey.json
└── README.md
```

---

## 9. Known Limitations

- Synthetic data randomness may produce varying chart patterns across different runs
- Analytics uses basic statistical methods rather than advanced machine learning techniques
- Large datasets may incur significant Firestore read costs
- Chart generation requires Python and Matplotlib to be installed separately

---

## 10. Conclusion

This project successfully demonstrates a complete data engineering workflow:

- Comprehensive data modeling with ERD
- Firebase-based data storage and management
- Automated ETL pipeline producing 5 normalized CSV outputs
- Robust data quality validation
- Generation of 10+ meaningful analytics insights
- Professional documentation and data dictionary
- Visual analytics through charts and graphs
- Fully normalized database schema (3NF)
- End-to-end automation using Node.js scripts

The pipeline is production-ready and can be extended to handle additional recipe data, more complex analytics, and real-time data processing requirements.

---
