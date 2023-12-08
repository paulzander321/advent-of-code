//Main function to determine which puzzle to run based on input
function runPuzzle() {
  let functionName = document.getElementById("puzzlechoice").value
  if (typeof window[functionName] === "function") {
    window[functionName]();
  } else {
    document.getElementById("puzzleoutput").innerText = "Puzzle not implemented yet!";
  }
}

//#region Solved Puzzles

//Wowzers, my math minor means nothing anymore!
function day8() {
  let input = document.getElementById("puzzleinput").value;
  let lines = input.split("\n");

  //Create a map of each map node which points to its left and right
  //Also save an array of new map nodes for each of these
  let directionIdMapping = new Map();
  let nodeArray = new Array();
  for (let i = 2; i < lines.length; i++) {
    let lineSplit = lines[i].replace("= (", "").replace(",", "").replace(")", "").split(' ');
    directionIdMapping.set(lineSplit[0], { left: lineSplit[1], right: lineSplit[2]});
    nodeArray.push(new MapNode(lineSplit[0]));
  }

  //For each map node in our array, connect to the nodes corresponding to the left / right
  for (let i = 0; i < nodeArray.length; i++) {
    let leftNodeId = directionIdMapping.get(nodeArray[i].nodeId).left;
    let rightNodeId = directionIdMapping.get(nodeArray[i].nodeId).right;
    if (nodeArray[i].nodeId != leftNodeId) {
      nodeArray[i].left = findNode(leftNodeId, nodeArray);
    }
    if (nodeArray[i].nodeId != rightNodeId) {
      nodeArray[i].right = findNode(rightNodeId, nodeArray);
    }
  }

  //Part 1: Find the number of steps required to go from "AAA" to "ZZZ" nodes
  let directionPattern = lines[0].split('');
  let startNode = findNode("AAA", nodeArray);
  let finishNodeId = "ZZZ";
  let currentNode = startNode;
  let stepCount = 0;
  if (startNode != null) {
    while (currentNode.nodeId != finishNodeId) {
      let direction = directionPattern[stepCount % (directionPattern.length)];
      if (direction == "L") {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
      stepCount++;
    }
  }

  //Part 2: Find the counts required for all starting positions (ends with 'A') to get to the first ending node (ends with 'Z')
  //Stores an array of the starting positions and a map from starting position to the step count (as array)
  const countsOfCountsToFind = 1;
  let stepCountMap = new Map();
  let startPositions = new Array();
  for (let i = 0; i < nodeArray.length; i++) {
    if (nodeArray[i].nodeId.substr(nodeArray[i].nodeId.length - 1) == 'A') {
      stepCountMap.set(nodeArray[i].nodeId, getStepsToFinish(nodeArray[i], directionPattern, countsOfCountsToFind));
      startPositions.push(nodeArray[i].nodeId);
    }
  }

  //Figure out the least common multiple (LCM) of the values gathered
  //This is largely based on the puzzle input and would not work for a general solution
  //since there could be inputs where we end at more than one 'XYZ' node for a given start node
  let lcmAllFirstFinishCounts = 0;
  for (let i = 0; i < startPositions.length; i++) {
    if (i == 0) {
      lcmAllFirstFinishCounts = stepCountMap.get(startPositions[i]);
    } else {
      lcmAllFirstFinishCounts = lcm(lcmAllFirstFinishCounts, stepCountMap.get(startPositions[i]));
    }
  }

  //Return values
  document.getElementById("puzzleoutput").innerText = "Part 1: Answer = " + stepCount;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Answer = \n" + lcmAllFirstFinishCounts;
}

//Least Common Multiple
//returns the least common multiple of two integers
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

//Greatest Common Divisor
//returns the greatest common divisor of two integers
//using Euclidean Algorithm for this, had to look it up on wikipedia
function gcd(a, b) {
  if (b == 0) {
    return a;
  } else {
    return gcd(b, a % b);
  }
}

//Return array of the number of steps it takes to get to node ending with "Z"
//numStepLoops determines how many times we continue after finding the first end node
function getStepsToFinish(startNode, directionPattern, numStepLoops) {
  let counts = new Array();
  let loopCount = 0;
  let stepCount = 0;
  while (loopCount < numStepLoops) {
    if (startNode.nodeId.substr(startNode.nodeId.length - 1) == "Z") {
      counts.push(stepCount);
      loopCount++;
    }
    let direction = directionPattern[stepCount % (directionPattern.length)];
    if (direction == "L") {
      startNode = startNode.left;
    } else {
      startNode = startNode.right;
    }
    stepCount++;
  }
  return counts;
}

//Search node array for specified node ID
function findNode(nodeSearchId, nodeArray) {
  for (let i = 0; i < nodeArray.length; i++) {
    if (nodeArray[i].nodeId == nodeSearchId) {
      return nodeArray[i];
    }
  }
}

//Basic data structure for map node, contains left and right path nodes
class MapNode {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.left = null;
    this.right = null;
  }
}

//Value mapping for the camel game hand types
const camelHandTypes = new Map([
  ["5X", 6], ["4X", 5], ["FH", 4], ["3X", 3], ["2P", 2], ["1P", 1], ["HC", 0]
]);

//Card type value mapping
const camelCardTypes = new Map([
  ["A", 14],  ["K", 13],  ["Q", 12],  ["J", 11],  ["T", 10],  ["9", 9],  ["8", 8],
  ["7", 7],  ["6", 6],  ["5", 5],  ["4", 4],  ["3", 3],  ["2", 2]
]);

//Card type value mapping for part 2 (J value changed)
const camelCardTypesPart2 = new Map([
  ["A", 14],  ["K", 13],  ["Q", 12],  ["T", 10],  ["9", 9],  ["8", 8],
  ["7", 7],  ["6", 6],  ["5", 5],  ["4", 4],  ["3", 3],  ["2", 2], ["J", 1]
]);

//day 7 puzzle solution
function day7() {
  let input = document.getElementById("puzzleinput").value;
  let lines = input.split("\n");
  
  //Parse the hands from input file
  let hands = new Array();
  for (let i = 0; i < lines.length; i++) {
    let lineSplit = lines[i].split(' ');
    hands.push(new CamelGameHand(lineSplit[0], parseInt(lineSplit[1])));
  }

  //Sort all hands by the type / card values from left to right
  hands.sort(function(a, b) {
    return a.compareTo(b);
  });

  //Sum up the total winnings using the hand rank + bid amount
  let totalWinningsPartOne = 0;
  for (let i = hands.length - 1; i >= 0; i--) {
    totalWinningsPartOne += (hands[i].bid * (i + 1));
  }

  //Part 2
  hands.sort(function(a, b) {
    return a.compareToPartTwo(b);
  });
  let totalWinningsPartTwo = 0;
  for (let i = hands.length - 1; i >= 0; i--) {
    totalWinningsPartTwo += (hands[i].bid * (i + 1));
  }

  //Return values
  document.getElementById("puzzleoutput").innerText = "Part 1: Answer = " + totalWinningsPartOne;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Answer = " + totalWinningsPartTwo;
}

class CamelGameHand {
  constructor(cards, bid) {
    this.hand = cards;
    this.cards = cards.split('');
    this.bid = bid;
    this.cardFrequencies = getFrequencies(this.cards);
    this.handType = determineHandType(this.cardFrequencies, this.cards);
    this.handTypePart2 = this.handType;

    //Part Two: make some adjustments to the "J"s
    if (cards.includes('J')) {
      let maxFreqOtherThanJ = 0;
      let maxFreqValue = "";
      for (let i = 0; i < this.hand.length; i++) {
        if (this.hand[i] != 'J') {
          if (this.cardFrequencies.get(this.cards[i]) > maxFreqOtherThanJ) {
            maxFreqOtherThanJ = this.cardFrequencies.get(this.cards[i])
            maxFreqValue = this.cards[i];
          } else if (this.cardFrequencies.get(this.cards[i]) == maxFreqOtherThanJ) {
            let cardCompare = camelCardTypesPart2.get(this.cards[i]) - camelCardTypesPart2.get(maxFreqValue);
            if (cardCompare > 0) {
              maxFreqOtherThanJ = this.cardFrequencies.get(this.cards[i])
              maxFreqValue = this.cards[i];
            }
          }
        }
      }
      //An all-J hand should remain as-is
      if (maxFreqOtherThanJ > 0) {
        let newHand = cards.replaceAll('J', maxFreqValue).split('')
        this.handTypePart2 = determineHandType(getFrequencies(newHand), newHand);
      }
    }
  }

  //Function to determine if one hand is better than another (wins based on hand type / card values)
  compareTo(otherHand) {
    let handCompare = camelHandTypes.get(this.handType) - camelHandTypes.get(otherHand.handType);
    if (handCompare == 0) {
      for (let i = 0; i < 5; i++) {
        let cardCompare = camelCardTypes.get(this.cards[i]) - camelCardTypes.get(otherHand.cards[i]);
        if (cardCompare == 0) {
          //Do nothing
        } else {
          return cardCompare;
        }
      }
    } else {
      return handCompare;
    }
  }

  compareToPartTwo(otherHand) {
    let handCompare = camelHandTypes.get(this.handTypePart2) - camelHandTypes.get(otherHand.handTypePart2);
    if (handCompare == 0) {
      for (let i = 0; i < 5; i++) {
        let cardCompare = camelCardTypesPart2.get(this.cards[i]) - camelCardTypesPart2.get(otherHand.cards[i]);
        if (cardCompare == 0) {
          //Do nothing
        } else {
          return cardCompare;
        }
      }
    } else {
      return handCompare;
    }
  }
}

//Get the frequencies of cards in hand
function getFrequencies(cardArray) {
  let cardFrequencies = new Map();
  for (let j = 0; j < cardArray.length; j++) {
    if (cardFrequencies.has(cardArray[j])) {
      cardFrequencies.set(cardArray[j], cardFrequencies.get(cardArray[j]) + 1);
    } else {
      cardFrequencies.set(cardArray[j], 1);
    }
  }
  return cardFrequencies;
}

//Determine the hand type for given hand and card frequencies
function determineHandType(cardFrequencies, cardArray) {
    let handType = "HC";
    if (cardFrequencies.size == 1) {
      handType = "5X";
    } else if (cardFrequencies.size == 2) {
      //Get one of the frequencies (just grab first one)
      let arbitraryFreq = cardFrequencies.get(cardArray[0]);
      if (arbitraryFreq == 1 || arbitraryFreq == 4) {
        handType = "4X";
      } else {
        handType = "FH";
      }
    } else if (cardFrequencies.size == 3) {
      let maxFreq = 0;
      for (let k = 0; k < cardArray.length; k++) {
        if (cardFrequencies.get(cardArray[k]) > maxFreq) {
          maxFreq = cardFrequencies.get(cardArray[k])
        }
      }
      if (maxFreq == 3) {
        handType = "3X";
      } else {
        handType = "2P";
      }
    } else if (cardFrequencies.size == 4) {
      handType = "1P";
    }
    return handType;
}

//Find the number of ways to win a boat race
//given the time allowed and the record winning distance
//each ms boat is held back it gains 1ms speed
function day6() {
  let input = document.getElementById("puzzleinput").value;
  let lines = input.split("\n");

  let waysToWin = 0;
  letWaysToWinPart2 = 0;
  if (lines.length > 0 && lines[0] != '') {

    //parse the times
    let times = new Array();
    let timePart2 = "";
    let lineSplitOne = lines[0].split(' ');
    for (let i = 0; i < lineSplitOne.length; i++) {
      if (lineSplitOne[i] != '' && !isNaN(lineSplitOne[i])) {
        times.push(parseInt(lineSplitOne[i]));
        timePart2 += lineSplitOne[i];
      }
    }

    //parse the distances
    let distances = new Array();
    let distancePart2 = "";
    let lineSplitTwo = lines[1].split(' ');
    for (let i = 0; i < lineSplitTwo.length; i++) {
      if (lineSplitTwo[i] != '' && !isNaN(lineSplitTwo[i])) {
        distances.push(parseInt(lineSplitTwo[i]));
        distancePart2 += lineSplitTwo[i];
      }
    }

    //Iterate through the games
    for (let i = 0; i < times.length; i++) {
      let time = times[i];
      let distance = distances[i];
      let waysToWinThisGame = 0;

      for (let j = 0; j <= time; j++) {
        let secondsHeld = j;
        let distanceTraveled = secondsHeld * (time - secondsHeld);
        if (distanceTraveled > distance) {
          waysToWinThisGame++;
        }
      }

      if (waysToWin == 0) {
        waysToWin = waysToWinThisGame;
      } else {
        waysToWin *= waysToWinThisGame;
      }
    }

    //part 2 - one big game
    timePart2 = parseInt(timePart2);
    distancePart2 = parseInt(distancePart2);
    for (let j = 0; j <= timePart2; j++) {
      let secondsHeld = j;
      let distanceTraveled = secondsHeld * (timePart2 - secondsHeld);
      if (distanceTraveled > distancePart2) {
        letWaysToWinPart2++;
      }
    }
  }

  document.getElementById("puzzleoutput").innerText = "Part 1: Answer = " + waysToWin;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Answer = " + letWaysToWinPart2;
}

//Day 5 - Ugh
function day5() {
  let input = document.getElementById("puzzleinput").value;
  let lines = input.split("\n");
  
  //our starting values
  let seeds = lines[0].split(' ');

  //build the maps from almanac
  let seedSoilMap = new AlmanacMap("seed", "soil", lines);
  let soilFertMap = new AlmanacMap("soil", "fertilizer", lines);
  let fertWaterMap = new AlmanacMap("fertilizer", "water", lines);
  let WaterLightMap = new AlmanacMap("water", "light", lines);
  let lightTempMap = new AlmanacMap("light", "temperature", lines);
  let tempHumidityMap = new AlmanacMap("temperature", "humidity", lines);
  let humidityLocationMap = new AlmanacMap("humidity", "location", lines);

  //part one, get the minimum value from seeds as basic numbers
  let minLocation = 0;
  for (let i = 0; i < seeds.length; i++) {
    if (!isNaN(seeds[i])) {
      let seed = parseInt(seeds[i]);
      let soil = seedSoilMap.translateSourceValue(seed);
      let fert = soilFertMap.translateSourceValue(soil);
      let water = fertWaterMap.translateSourceValue(fert);
      let light = WaterLightMap.translateSourceValue(water);
      let temp = lightTempMap.translateSourceValue(light);
      let humidity = tempHumidityMap.translateSourceValue(temp);
      let location = humidityLocationMap.translateSourceValue(humidity);
      if (minLocation == 0) {
        minLocation = location;
      } else if (location < minLocation) {
        minLocation = location;
      }
    }
  }

  // Build out reverse map to get the direct seed -> locations........... Is what I SHOULD do :)
  // Dear reader... listen, I will look to make a nicer solution eventually.
  // I did however discover that my gaming laptop is suitable for crypto mining so that's something!
  let part2MinLocation = 0;
  for (let i = 1; i < seeds.length; i = i + 2) {
    let seedStart = parseInt(seeds[i]);
    let seedCount = parseInt(seeds[i + 1]);
    console.log(i);
    for (let j = seedStart; j < seedStart + seedCount; j++) {
      let soil = seedSoilMap.translateSourceValue(j);
      let fert = soilFertMap.translateSourceValue(soil);
      let water = fertWaterMap.translateSourceValue(fert);
      let light = WaterLightMap.translateSourceValue(water);
      let temp = lightTempMap.translateSourceValue(light);
      let humidity = tempHumidityMap.translateSourceValue(temp);
      let location = humidityLocationMap.translateSourceValue(humidity);
      if (part2MinLocation == 0) {
        part2MinLocation = location;
      } else if (location < part2MinLocation) {
        part2MinLocation = location;
      }
    }
  }

  document.getElementById("puzzleoutput").innerText = "Part 1: Minimum Location = " + minLocation;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Minimum Location = " + part2MinLocation;
}

//Almanac Map Class
class AlmanacMap {
  //Create new almanac map reading from the given input string array for the specified map
  constructor(dataTypeFrom, dataTypeTo, lines) {
    this.ranges = new Array();
    this.dataTypeFrom = dataTypeFrom;
    this.dataTypeTo = dataTypeTo;

    //Parse the map out from the given lines if provided
    if (lines != "") {
      let mapStarted = false;
      for (let i = 0; i < lines.length; i++) {
        let lineSplit = lines[i].split(' ');
        if (mapStarted) {
          if (lineSplit.length == 3) {
            this.ranges.push(new AlmanacRange(lineSplit[0], lineSplit[1], lineSplit[2]));
          } else {
            //finished parsing map
            break;
          }
        } else if (lineSplit[0] == this.dataTypeFrom + '-to-' + this.dataTypeTo) {
          mapStarted = true;
        }
      }
    }
  }
  //Push the given almanac range to map
  pushRange(range) {
    if (range.range == 0) {
      console.log("Help!");
    }
    this.ranges.push(range);
  }
  //Prints this almanac map
  print() {
    let printValue = "";
    for (let i = 0; i < this.ranges.length; i++) {
      printValue += this.ranges[i].print() + ',';
    }
    return printValue;
  }
  //Translate given source value using this map's ranges
  translateSourceValue(sourceValue) {
    for (let i = 0; i < this.ranges.length; i++) {
      if (this.ranges[i].isSrcValueInRange(sourceValue)) {
        return this.ranges[i].translateSourceValue(sourceValue);
      }
    }
    return sourceValue;
  }
}

//Almanac Range Class
class AlmanacRange {
  //Constructs new almanac range with given input values
  constructor(outputStart, inputStart, range) {
    this.range = parseInt(range);
    this.inputStart = parseInt(inputStart);
    this.inputEnd = this.inputStart + this.range - 1;
    this.outputStart = parseInt(outputStart);
    this.outputEnd = this.outputStart + this.range - 1;
  }
  //Returns true if the given source value is within this ranges input value range
  isSrcValueInRange(srcValue) {
    if (srcValue >= this.inputStart && srcValue <= this.inputStart + this.range - 1) {
      return true;
    }
    return false;
  }
  //Translates given source value input using the map
  translateSourceValue(srcValue) {
    return this.outputStart + (srcValue - this.inputStart);
  }
  //Prints out the AlmanacRange
  print() {
    return "{ inputStart: " + this.inputStart + ", range: " + this.range + ", outputStart: " + this.outputStart + '}';
  }
}

//Part 1: Calculates the point total for given scratch tickets
//Part 2: Calculate total number of tickets, including copies generated from wins
function day4() {

  let input = document.getElementById("puzzleinput").value;
  let lines = input.split("\n");

  let pointTotal = 0;
  let cardCopyCounts = new Array(lines.length).fill(0);
  let scratchCardCount = lines.length;
  for (let i = 0; i < lines.length; i++) {
    let winners = [];
    let scratchNumbers = [];
    let scratchSplit = lines[i].split(' ');
    let x = 2
    while (scratchSplit[x] != '|' && x < scratchSplit.length) {
      winners.push(scratchSplit[x]);
      x++;
    }

    x++;
    while (x < scratchSplit.length) {
      scratchNumbers.push(scratchSplit[x]);
      x++;
    }

    let winningNumCount = 0;
    for (let j = 0; j < scratchNumbers.length; j++) {
      if (scratchNumbers[j].trim() != '' && winners.includes(scratchNumbers[j])) {
        winningNumCount++;
      }
    }

    if (winningNumCount > 0) {
      pointTotal += Math.pow(2, winningNumCount - 1);
    }

    for (let k = 1; k <= winningNumCount; k++) {
      if (i + k < cardCopyCounts.length) {
        cardCopyCounts[i + k] += 1;
      }
    }

    for (let p = 0; p < cardCopyCounts[i]; p++) {
      for (let b = 1; b <= winningNumCount; b++) {
        if (i + b < cardCopyCounts.length) {
          cardCopyCounts[i + b] += 1;
        }
      }
    }
  }

  for (let y = 0; y < cardCopyCounts.length; y++) {
    scratchCardCount += cardCopyCounts[y];
  }

  //Set the puzzle output
  document.getElementById("puzzleoutput").innerText = "Part 1: Scratch ticket point total = " + pointTotal;
  document.getElementById("puzzleoutput").innerText += '\n' + "Part 2: Total number of tickets (including copies) = " + scratchCardCount;
}

//Part 1: Calculates the values of all valid parts in given schematics
//Part 2: Calculate the gear ratio for given schematics
function day3() {
  let input = document.getElementById("puzzleinput").value;
  let schematics = [];
  let schematicsMatrix = input.split("\n");
  for (let i = 0; i < schematicsMatrix.length; i++) {
    schematics.push(schematicsMatrix[i].split(''));
  }

  //Part 2: Create a new matrix to map out where the parts are in the schematics
  let partIdIterator = 0;
  let partValues = new Map();
  let validPartLocations = new Array(schematicsMatrix.length);
  for (let r = 0; r < schematicsMatrix.length; r++) {
    validPartLocations[r] = new Array(schematicsMatrix[r].length);
  }

  let validPartsSumValue = 0;
  for (let j = 0; j < schematics.length; j++) {
    let partValue = "";
    let validPartNum = false;

    for (let h = 0; h < schematics[j].length; h++) {
      if (!isNaN(schematics[j][h])) {
        partValue += schematics[j][h];
        if (validPartNum == false) {
          //try to verify if part num is valid
          for (let a = j - 1; a <= j + 1; a++) {
            for (let b = h - 1; b <= h + 1; b++) {
              if (a >= 0 && b >= 0 && a < schematics.length && b < schematics[j].length) {
                if (schematics[a][b] != '.' && isNaN(schematics[a][b])) {
                  validPartNum = true;
                }
              }
            }
          }
        }
        //if next character is end of line then reset
        if (h + 1 >= schematics[j].length) {
          if (validPartNum) {
            validPartsSumValue += parseInt(partValue);
            partValues.set(partIdIterator, parseInt(partValue));
            for (let g = 0; g < partValue.length; g++) {
              validPartLocations[j][h - g] = partIdIterator;
            }
            partIdIterator++;
          }
          //reset part logic
          partValue = "";
          validPartNum = false;
        }
      } else if (partValue != "") {
        //we reached the end of the part in the buffer, add to map if it was a valid part
        if (validPartNum) {
          validPartsSumValue += parseInt(partValue);
          partValues.set(partIdIterator, parseInt(partValue));
          for (let g = 1; g <= partValue.length; g++) {
            validPartLocations[j][h - g] = partIdIterator;
          }
          partIdIterator++;
        }
        //reset part logic
        partValue = "";
        validPartNum = false;
      }
    }
  }

  //Using matrix of the schematics; matrix of the part locations
  //Find all the gears ('*' next to exactly two numbers is a gear)
  //Each gear will have gear ratio (the product of the two adjacent numbers)
  //The goal is to find the sum of all the gear ratios in the schematics
  let gearRatioSum = 0;
  for (let j = 0; j < schematicsMatrix.length; j++) {
    for (let h = 0; h < schematicsMatrix[j].length; h++) {
      let partsAdjacent = new Array();
      if (schematicsMatrix[j][h] == '*') {
        //start determining if this is a gear
        for (let a = j - 1; a <= j + 1; a++) {
          for (let b = h - 1; b <= h + 1; b++) {
            if (a >= 0 && b >= 0 && a < validPartLocations.length && b < validPartLocations[a].length) {
              if (validPartLocations[a][b] != null) {
                //we found a part, write down the part number
                if (!partsAdjacent.includes(validPartLocations[a][b])) {
                  partsAdjacent.push(validPartLocations[a][b]);
                }
              }
            }
          }
        }
        //Only add gear ratio is gear is valid (exactly two adjacent parts)
        if (partsAdjacent.length == 2) {
          gearRatioSum += partValues.get(partsAdjacent[0]) * partValues.get(partsAdjacent[1]);
        }
      }
    }
  }

  //Return to user the calculated part value sum and the gear ratio sum
  document.getElementById("puzzleoutput").innerText = "Part 1: Valid Parts Value = " + validPartsSumValue;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Gear Ratio Sum = " + gearRatioSum;
}

//For games of colored cubes pulled out of a bag (red, green, blue)
//Part 1: Determine the sum total of game IDs where the games were plausible for given max values of each cube color
//Part 2: Determine the minimum number of cubes of each color and for each game calculate the sum of the three minimums
function day2() {
  const cubeMaxValuesMap = new Map([
    ["red", 12], ["green", 13], ["blue", 14]
  ]);

  let input = document.getElementById("puzzleinput").value;
  let games = input.split("\n");
  let plausibleGameIdSum = 0;
  let minimumSetPowerTotal = 0;

  for (var i = 0; i < games.length; i++) {
    const cubeMinValuesMap = new Map([
      ["red", 0], ["green", 0], ["blue", 0]
    ]);
    let gameSplit = games[i].split(" ");
    let gameId = parseInt(gameSplit[1]);
    let gamePlausible = true;
    for (var j = 2; j < gameSplit.length; j = j + 2) {
      let cubeCount = parseInt(gameSplit[j]);
      let cubeColor = gameSplit[j + 1].replace(";", "").replace(",", "");
      if (cubeMaxValuesMap.get(cubeColor) < cubeCount) {
        gamePlausible = false;
      }
      if (cubeCount > cubeMinValuesMap.get(cubeColor)) {
        cubeMinValuesMap.set(cubeColor, cubeCount);
      }
    }
    minimumSetPowerTotal += (cubeMinValuesMap.get("red") * cubeMinValuesMap.get("green") * cubeMinValuesMap.get("blue"));
    if (gamePlausible) {
      plausibleGameIdSum += gameId;
    }
  }
  document.getElementById("puzzleoutput").innerText = "Part 1: Total number of plausible games = " + plausibleGameIdSum;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Minimum cubes = " + minimumSetPowerTotal;
}

//Part 1: Given a list of launch codes, calculates the sum total of the first and last digits
//Part 2: for each line of code, with any digit spelled or numeric character being counted. 
function day1() {
  let input = document.getElementById("puzzleinput").value;
  const launchCodeLines = input.split("\n");

  let calibrationSum = 0;
  let calibrationSumIncludeTextNums = 0;

  for (let i = 0; i < launchCodeLines.length; i++) {
    let launchCodeCharSplit = launchCodeLines[i].split('');
    let stringMem = "";
    
    let firstDig = "";
    let firstDigIncText = "";
    for (let j = 0; j < launchCodeCharSplit.length; j++) {
      if (!isNaN(launchCodeCharSplit[j])) {
        firstDig = launchCodeCharSplit[j];
        if (firstDigIncText == "") {
          firstDigIncText = launchCodeCharSplit[j];
        }
        break;
      } else if (firstDigIncText == "") {
        stringMem += launchCodeCharSplit[j];
        if (isNumSpelledOut(stringMem) > 0) {
          firstDigIncText = isNumSpelledOut(stringMem);
          stringMem = "";
        }
      }
    } 

    let lastDig = "";
    let lastDigIncText = "";
    for (let h = launchCodeCharSplit.length - 1; h >= 0; h--) {
      if (!isNaN(launchCodeCharSplit[h])) {
        lastDig = launchCodeCharSplit[h];
        if (lastDigIncText == "") {
          lastDigIncText = launchCodeCharSplit[h];
        }
        break;
      } else if (lastDigIncText == "") {
        stringMem = launchCodeCharSplit[h] + stringMem;
        if (isNumSpelledOut(stringMem) > 0) {
          lastDigIncText = isNumSpelledOut(stringMem);
          stringMem = "";
        }
      }
    }

    //Add to the calibration sums, skip if we are missing a digit
    if (firstDig != "" && lastDig != "") {
      calibrationSum += parseInt(firstDig + '' + lastDig);
    }
    calibrationSumIncludeTextNums += parseInt(firstDigIncText + '' + lastDigIncText);
  }

  //Set the output to user
  document.getElementById("puzzleoutput").innerText = "Part 1: Sum of first / last digits = " + calibrationSum;
  document.getElementById("puzzleoutput").innerText += "\nPart 2: Sum of first / last digits (including text nums) = " + calibrationSumIncludeTextNums;
}

function isNumSpelledOut(numString) {
  if (numString.includes("one")) {
    return 1;
  } else if (numString.includes("two")) {
    return 2;
  } else if (numString.includes("three")) {
    return 3;
  } else if (numString.includes("four")) {
    return 4;
  } else if (numString.includes("five")) {
    return 5;
  } else if (numString.includes("six")) {
    return 6;
  } else if (numString.includes("seven")) {
    return 7;
  } else if (numString.includes("eight")) {
    return 8;
  } else if (numString.includes("nine")) {
    return 9;
  } else {
    return -1;
  }
}
//#endregion