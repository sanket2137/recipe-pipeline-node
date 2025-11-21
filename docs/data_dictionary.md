# Firebase Recipe Data Dictionary

## 1. Overview
This document provides the complete **Data Dictionary** for the Firebase Recipe Analytics Pipeline.  
It is based on the ERD diagram and describes all tables, columns, data types, constraints, and relationships.

**Author:** Sanket Raut  
**Assessment Duration:** < 10 Hours

## 2. ERD Reference

![ERD Diagram](https://dbdiagram.io/d/691ed089228c5bbc1ab1690c)

*Entity-Relationship Diagram showing Users, Recipes, Ingredients, Steps, and Interactions tables.*


## 3. Data Dictionary (Table-Wise Details)

### 3.1 Users Table
Stores user profile information.

1. **user_id:** (varchar) – Primary Key  
2. **name:** (varchar, NN) – Full name of the user  
3. **email:** (varchar, NN) – Unique email address  
4. **country:** (varchar) – User’s country  
5. **created_at:** (timestamp, NN) – Account creation time  


### 3.2 Recipes Table
Stores core metadata for recipes authored by users.

1. **recipe_id:** (varchar) – Primary Key  
2. **name:** (varchar, NN) – Name of the recipe  
3. **description:** (text) – Recipe summary  
4. **servings:** (integer, NN) – Number of servings  
5. **prep_time_min:** (integer, NN) – Preparation time  
6. **cook_time_min:** (integer, NN) – Cooking time  
7. **total_time_min:** (integer) – Total time (prep + cook)  
8. **difficulty:** (varchar, NN) – easy / medium / hard  
9. **cuisine:** (varchar) – Cuisine category  
10. **tags:** (varchar) – Comma-separated tags  
11. **author_user_id:** (varchar, NN) – FK → users.user_id  
12. **created_at:** (timestamp, NN) – Recipe creation time  


### 3.3 Ingredients Table
Stores detailed ingredient information for each recipe.

1. **ingredient_id:** (varchar) – Primary Key  
2. **recipe_id:** (varchar, NN) – FK → recipes.recipe_id  
3. **name:** (varchar, NN) – Ingredient name  
4. **quantity:** (decimal) – Ingredient amount  
5. **unit:** (varchar) – Measurement unit (g, tsp, cup)  
6. **notes:** (text) – Optional notes  
7. **order:** (integer) – Display ordering  


### 3.4 Steps Table
Stores ordered step-by-step cooking instructions.

1. **step_id:** (varchar) – Primary Key  
2. **recipe_id:** (varchar, NN) – FK → recipes.recipe_id  
3. **order:** (integer, NN) – Step sequence  
4. **text:** (text, NN) – Instruction text  


### 3.5 Interactions Table
Stores user engagement events for analytics.

1. **interaction_id:** (varchar) – Primary Key  
2. **user_id:** (varchar, NN) – FK → users.user_id  
3. **recipe_id:** (varchar, NN) – FK → recipes.recipe_id  
4. **type:** (varchar, NN) – view / like / rating / cook_attempt  
5. **rating:** (integer) – 0–5 rating (if applicable)  
6. **difficulty_used:** (varchar) – Difficulty chosen by user  
7. **source:** (varchar) – web / mobile  
8. **created_at:** (timestamp, NN) – Event timestamp  


## 4. Relationship Summary
A high-level overview of table relationships in the ERD.

1. **Users → Recipes**: One user authors many recipes.  
2. **Recipes → Ingredients**: Each recipe contains multiple ingredients.  
3. **Recipes → Steps**: Each recipe contains multiple cooking steps.  
4. **Users → Interactions**: A user performs many interactions.  
5. **Recipes → Interactions**: A recipe receives many interactions.  





