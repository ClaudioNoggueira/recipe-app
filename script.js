const mealsElement = document.getElementById("meals");
const favoriteContainer = document.getElementById("favorite-meals");

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

getRandomMeal();
fetchFavoriteMeals();

async function getRandomMeal() {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const responseData = await response.json();
    const meal = responseData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const responseData = await response.json();
    const meals = responseData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML =
        `<div class="meal-header">
           ${random ? `<span class="random">Veja essa nova receita</span>` : ''}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="favorite-btn"><i class="fas fa-heart"></i></button>
        </div>`;

    const btn = meal.querySelector('.meal-body .favorite-btn');
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
        } else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add('active');
        }

        fetchFavoriteMeals();
    });
    mealsElement.appendChild(meal);
}

function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

async function fetchFavoriteMeals() {
    // Clean the container
    favoriteContainer.innerHTML = '';
    const mealIds = getMealsFromLocalStorage();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        addMealToFavorites(await getMealById(mealId));
    }
}

function addMealToFavorites(mealData) {
    const favoriteMeal = document.createElement('li');

    favoriteMeal.innerHTML =
        `
        <li>
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
        </li>
        <button class="clear"><i class="fas fa-times-circle"></i></button>
        `;

    const btn = favoriteMeal.querySelector('.clear');
    btn.addEventListener('click', () => {
        removeMealFromLocalStorage(mealData.idMeal);

        fetchFavoriteMeals();
    });

    favoriteContainer.appendChild(favoriteMeal);
}

searchBtn.addEventListener('click', async () => {
    //Clean container
    mealsElement.innerHTML = '';

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});