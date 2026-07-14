let selectedGroup = [];
const MAX_GROUP_SIZE = 7;

const drinksContainer = document.getElementById('drinks-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const notFoundMsg = document.getElementById('not-found-msg');
const groupCountEl = document.getElementById('group-count');
const groupListEl = document.getElementById('group-list');
const groupPlaceholder = document.getElementById('group-empty-placeholder');
const loadingSpinner = document.getElementById('loading-spinner');

const modal = document.getElementById('details-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalAlcoholic = document.getElementById('modal-alcoholic');
const modalGlass = document.getElementById('modal-glass');
const modalInstructions = document.getElementById('modal-instructions');
const closeModalBtn = document.getElementById('close-modal-btn');

window.addEventListener('DOMContentLoaded', () => {
    fetchDrinks('a', 10);

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});

async function fetchDrinks(query, limit = null) {
    loadingSpinner.classList.remove('hidden');
    drinksContainer.innerHTML = '';
    notFoundMsg.classList.add('hidden');

    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();

        if (data.drinks) {
            const drinksToShow = limit ? data.drinks.slice(0, limit) : data.drinks;
            displayDrinks(drinksToShow);
        } else {
            notFoundMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        notFoundMsg.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        fetchDrinks(searchTerm);
    } else {
        fetchDrinks('a', 10);
    }
}

function displayDrinks(drinks) {
    drinksContainer.innerHTML = drinks.map(drink => {
        const originalInstructions = drink.strInstructions || "No instructions provided.";
        const truncatedInstructions = originalInstructions.length > 15
            ? originalInstructions.substring(0, 15) + '...'
            : originalInstructions;

        const escapedName = drink.strDrink.replace(/'/g, "&apos;");

        return `
            <div class="drink-card">
                <div>
                    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="card-thumb">
                    <div class="card-body">
                        <h3 class="card-name">${drink.strDrink}</h3>
                        <span class="card-category">${drink.strCategory || 'Uncategorized'}</span>
                        <div class="card-instructions">
                            <span class="card-instructions-label">Instructions:</span>
                            <span title="${originalInstructions}">${truncatedInstructions}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button
                        onclick="addToGroup('${drink.idDrink}', '${escapedName}')"
                        class="btn btn-primary"
                    >
                        Add to group
                    </button>
                    <button
                        onclick="showDetails('${drink.idDrink}')"
                        class="btn btn-secondary"
                    >
                        Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addToGroup(id, name) {
    if (selectedGroup.some(item => item.id === id)) {
        alert("This drink is already in your group selection!");
        return;
    }

    if (selectedGroup.length >= MAX_GROUP_SIZE) {
        alert("Warning: You cannot add more than 7 drinks to a single group!");
        return;
    }

    selectedGroup.push({ id, name });
    updateGroupUI();
}

function removeFromGroup(index) {
    selectedGroup.splice(index, 1);
    updateGroupUI();
}

function updateGroupUI() {
    groupCountEl.innerText = `${selectedGroup.length}/${MAX_GROUP_SIZE}`;

    if (selectedGroup.length === 0) {
        groupPlaceholder.classList.remove('hidden');
        groupListEl.innerHTML = '';
        return;
    }
    groupPlaceholder.classList.add('hidden');

    groupListEl.innerHTML = selectedGroup.map((item, index) => `
        <li class="group-item">
            <div class="group-item-title">
                <span class="group-item-num">${index + 1}</span>
                <span>${item.name}</span>
            </div>
            <button onclick="removeFromGroup(${index})" class="btn-remove">Remove</button>
        </li>
    `).join('');
}

async function showDetails(id) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();

        if (data.drinks && data.drinks.length > 0) {
            const drink = data.drinks[0];

            modalImg.src = drink.strDrinkThumb;
            modalImg.alt = drink.strDrink;
            modalTitle.innerText = drink.strDrink;
            modalCategory.innerText = drink.strCategory || "N/A";
            modalAlcoholic.innerText = drink.strAlcoholic || "N/A";
            modalGlass.innerText = drink.strGlass || "N/A";
            modalInstructions.innerText = drink.strInstructions || "No instructions available.";

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error(error);
    }
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}
