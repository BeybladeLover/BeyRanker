let comboDB = JSON.parse(localStorage.getItem('comboDB')) || {};
const bannedWords = ["badword1","badword2","shit","fuck"];
const safeNames = ["BladerA","BladerB","XChampion","GearMaster","BladeKing"];

function saveDB() {
    localStorage.setItem('comboDB', JSON.stringify(comboDB));
}

function cleanName(name) {
    if (!name) return "Player";
    const words = name.toLowerCase().split(" ");
    for (let w of words) if (bannedWords.includes(w)) return safeNames[Math.floor(Math.random()*safeNames.length)];
    return name;
}

function getAverage(ratings) {
    return ratings.reduce((a,b)=>a+b,0)/ratings.length;
}

function searchCombo() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    const details = document.getElementById('comboDetails');
    const suggestionsDiv = document.getElementById('suggestions');
    details.value = "";
    suggestionsDiv.innerHTML = "";

    if(comboDB[input]) {
        const data = comboDB[input];
        details.value = `Found!\nBlade: ${data.blade}\nRatchet: ${data.ratchet}\nBit: ${data.bit}\nAvg Rank: ${getAverage(data.ratings).toFixed(1)}/10\nAdded by: ${data.name}`;
    } else {
        let matches = Object.keys(comboDB).filter(k => k.includes(input));
        if(matches.length > 0){
            suggestionsDiv.innerHTML = "Suggestions:<br>" + matches.map(m => `<a onclick="fillFromSuggestion('${m}')">${m}</a>`).join("<br>");
        } else {
            details.value = "Combo not found.";
        }
    }
}

function fillFromSuggestion(name) {
    document.getElementById('searchInput').value = name;
    searchCombo();
}

function addCombo() {
    const blade = document.getElementById('blade').value;
    const ratchet = document.getElementById('ratchet').value;
    const bit = document.getElementById('bit').value;
    const name = cleanName(document.getElementById('nameInput').value);
    const rating = parseFloat(document.getElementById('ratingInput').value);

    if(isNaN(rating) || rating < 1 || rating > 10) {
        alert("Rating must be 1–10");
        return;
    }

    const comboName = `${blade} ${ratchet} ${bit}`.toLowerCase();
    if(comboDB[comboName]){
        comboDB[comboName].ratings.push(rating);
    } else {
        comboDB[comboName] = {blade, ratchet, bit, name, ratings: [rating]};
    }

    saveDB();
    alert(`Combo saved: ${comboName}`);
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchCombo);
document.getElementById('addBtn').addEventListener('click', addCombo);