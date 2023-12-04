//Stuff to call when page is loaded
document.addEventListener("DOMContentLoaded", function() {
  populateChoices();
});

//Populate the puzzle options
function populateChoices() {
  let select = document.getElementById("puzzlechoice");
  if (!select) return; // Validation to ensure select element exists

  //Calculate how many puzzles to populate, set default to the current day puzzle
  const xmasDay = new Date('2023-12-25');
  const today = new Date();
  let daysTilXmas = Math.floor((xmasDay - today) / (1000 * 60 * 60 * 24));
  let adventDays = Math.min(25, 24 - daysTilXmas);
  for (let i = 1; i <= adventDays; i++) {
    select.appendChild(createOption(`Day ${i}`, `day${i}`));
  }
  select.selectedIndex = (adventDays - 1);
}

//Create one option element
function createOption(text, value) {
  let option = document.createElement("option");
  option.textContent = text;
  option.value = value;
  return option;
}

//Clear input / output
function clearText() {
  document.getElementById("puzzleinput").value = "";
  document.getElementById("puzzleoutput").innerHTML = "";
  document.getElementById("puzzleinput").readOnly = false;
}

//reset puzzle
function resetPuzzle() {
  clearText();
}

//saves puzzle input to local storage
function savePuzzleInput(puzzleIndex) {
  let currentPuzzleInput = document.getElementById("puzzleinput").value
  console.log(currentPuzzleInput);
  let currentPuzzleIndex = document.getElementById("puzzlechoice").selectedIndex;
  console.log(currentPuzzleIndex);
  localStorage.setItem("PuzzleInput" + currentPuzzleIndex, currentPuzzleInput);
}

//attempts to retrieve puzzle input from local storage
function loadPuzzleInput(puzzleIndex) {
  let savedPuzzleInput = localStorage.getItem("PuzzleInput" + puzzleIndex);
  if (savedPuzzleInput) {
    document.getElementById("puzzleinput").value = savedPuzzleInput;
  }
}