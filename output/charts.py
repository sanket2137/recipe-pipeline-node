import pandas as pd
import matplotlib.pyplot as plt
import os

# ============================
# Load CSV Files
# ============================
recipe = pd.read_csv("recipe.csv")
ingredients = pd.read_csv("ingredients.csv")
interactions = pd.read_csv("interactions.csv")
users = pd.read_csv("users.csv")   # ⭐ NEW


# ============================
# Helper Function to Save Charts
# ============================
def save_chart(title):
    filename = title.replace(" ", "_").lower() + ".png"
    plt.savefig(filename, bbox_inches='tight')
    plt.close()
    print(f"Saved: {filename}")


# ============================
# 1. Most Common Ingredients
# ============================
top_ing = ingredients["name"].value_counts().head(10)

plt.figure(figsize=(8, 5))
top_ing.plot(kind="bar")
plt.title("Top 10 Most Common Ingredients")
plt.xlabel("Ingredient")
plt.ylabel("Count")

save_chart("Top 10 Most Common Ingredients")


# ============================
# 2. Difficulty Distribution
# ============================
plt.figure(figsize=(6, 6))
recipe["difficulty"].value_counts().plot(kind="pie", autopct="%1.1f%%")
plt.title("Difficulty Distribution")

save_chart("Difficulty Distribution")


# ============================
# 3. Most Viewed Recipes
# ============================
views = interactions[interactions["type"] == "view"]
views_count = views["recipe_id"].value_counts().head(10)

plt.figure(figsize=(8, 5))
views_count.plot(kind="bar")
plt.title("Top Viewed Recipes")
plt.xlabel("Recipe ID")
plt.ylabel("Views")

save_chart("Top Viewed Recipes")


# ============================
# 4. Most Liked Recipes
# ============================
likes = interactions[interactions["type"] == "like"]
likes_count = likes["recipe_id"].value_counts().head(10)

plt.figure(figsize=(8, 5))
likes_count.plot(kind="bar")
plt.title("Top Liked Recipes")
plt.xlabel("Recipe ID")
plt.ylabel("Likes")

save_chart("Top Liked Recipes")


# ============================
# 5. Prep Time vs Likes (Correlation Plot)
# ============================
likes_per_recipe = likes["recipe_id"].value_counts()

merged = recipe.merge(
    likes_per_recipe.rename("likes"),
    how="left",
    left_on="recipe_id",
    right_index=True
)

merged["likes"] = merged["likes"].fillna(0)

plt.figure(figsize=(7, 5))
plt.scatter(merged["prep_time_min"], merged["likes"])
plt.title("Prep Time vs Likes")
plt.xlabel("Preparation Time (min)")
plt.ylabel("Likes")

save_chart("Prep Time vs Likes")


# ============================
# 6. ⭐ Users by Month (Growth Trend)
# ============================
users["created_at"] = pd.to_datetime(users["created_at"], errors="coerce")
users["month"] = users["created_at"].dt.to_period("M")

users_per_month = users["month"].value_counts().sort_index()

plt.figure(figsize=(8, 5))
users_per_month.plot(kind="line", marker="o")
plt.title("User Growth by Month")
plt.xlabel("Month")
plt.ylabel("New Users")

save_chart("User Growth by Month")


# ============================
# 7. ⭐ Users by Country
# ============================
if "country" in users.columns:
    country_counts = users["country"].value_counts().head(10)

    plt.figure(figsize=(8, 5))
    country_counts.plot(kind="bar")
    plt.title("Top Countries by User Count")
    plt.xlabel("Country")
    plt.ylabel("Users")

    save_chart("Top Countries by User Count")


# ============================
# 8. ⭐ Recipes Created per User
# ============================
recipes_per_user = recipe["author_user_id"].value_counts().head(10)

plt.figure(figsize=(8, 5))
recipes_per_user.plot(kind="bar")
plt.title("Users With the Most Recipes")
plt.xlabel("User ID")
plt.ylabel("Number of Recipes")

save_chart("Users With the Most Recipes")


print("\nAll charts generated successfully!")
