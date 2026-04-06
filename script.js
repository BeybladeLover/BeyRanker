// Initialize combo database
let comboDB = JSON.parse(localStorage.getItem('comboDB')) || {};

// Banned words & safe names
const bannedWords = ["badword1","badword2","shit","fuck"];
const safeNames = ["BladerA","BladerB","XChampion","GearMaster","BladeKing"];

// Save database
function saveDB() {
    localStorage.setItem('comboDB', JSON.stringify(comboDB));
}

// Clean display name
function cleanName(name) {
    const words = name.toLowerCase().split(" ");
    for(let w of words) {
        if(bannedWords.includes(w)) {
            return safeNames[Math.floor(Math.random()*safeNames.length)];
        }
    }
    return name || "Player";
}

// Calculate average rating
function getAverage(ratings) {
    return ratings.reduce((a,b)=>a+b,0)/ratings.length;
}

// Fuzzy search helper: Levenshtein distance
function levenshtein(a, b) {
    const dp = Array(b.length + 1).fill(null).map(()=>Array(a.length + 1).fill(0));
    for(let i=0;i<=b.length;i++) dp[i][0] = i;
    for(let j=0;j<=a.length;j++) dp[0][j] = j;
    for(let i=1;i<=b.length;i++){
        for(let j=1;j<=a.length;j++){
            dp[i][j] = b[i-1] === a[j-1] 
                ? dp[i-1][j-1] 
                : 1 + Math.min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j]);
        }
    }
    return dp[b.length][a.length];
}

// Fuzzy search function
function searchCombo() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    const details = document.getElementById('comboDetails');
    const suggestionsDiv = document.getElementById('suggestions');
    details.value = "";
    suggestionsDiv.innerHTML = "";

    if(!input) return;

    let matches = Object.keys(comboDB);
    let exact = matches.find(k => k.toLowerCase() === input);
    
    if(exact){
        const data = comboDB[exact];
        details.value = `Found!\nBlade: ${data.blade}\nRatchet: ${data.ratchet}\nBit: ${data.bit}\nAvg Rank: ${getAverage(data.ratings).toFixed(1)}/10`;
    } else {
        // Fuzzy search: show close matches
        let scored = matches.map(k=>({key:k, score:levenshtein(input, k.toLowerCase())}));
        scored.sort((a,b)=>a.score - b.score);
        scored = scored.slice(0,5); // top 5 matches

        if(scored.length){
            suggestionsDiv.innerHTML = "Suggestions:<br>" + scored.map(m => `<a onclick="fillFromSuggestion('${m.key}')">${m.key}</a>`).join("<br>");
        } else {
            details.value = "Combo not found.";
        }
    }
}

// Fill input from suggestion
function fillFromSuggestion(name){
    document.getElementById('searchInput').value = name;
    searchCombo();
}

// Add or rate combo
function addCombo(){
    const blade = document.getElementById('blade').value;
    const ratchet = document.getElementById('ratchet').value;
    const bit = document.getElementById('bit').value;
    const name = cleanName(document.getElementById('nameInput').value);
    const rating = parseFloat(document.getElementById('ratingInput').value);

    if(isNaN(rating) || rating < 1 || rating > 10){
        alert("Rating must be 1–10");
        return;
    }

    const comboName = `${blade} ${ratchet} ${bit}`;
    if(comboDB[comboName]){
        comboDB[comboName].ratings.push(rating);
    } else {
        comboDB[comboName] = {blade, ratchet, bit, name, ratings:[rating]};
    }

    saveDB();
    alert(`Combo saved: ${comboName}`);
    document.getElementById('comboDetails').value = "";
    document.getElementById('searchInput').value = "";
    document.getElementById('nameInput').value = "";
    document.getElementById('ratingInput').value = "";
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchCombo);
document.getElementById('addBtn').addEventListener('click', addCombo);
document.getElementById('searchInput').addEventListener('keyup', searchCombo);
