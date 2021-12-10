
var prevSettings = {
    difficulty: 'E',
};

function createScoreBar(parent, difficulty) {
    var scoreRow = document.createElement('div');
    scoreRow.classList.add('score-row');
    parent.appendChild(scoreRow);

    var highScoreBlock = document.createElement('div');
    scoreRow.appendChild(highScoreBlock);

    highScoreBlock.appendChild(createLabel('High Score'));

    var highScore = document.createElement('div');
    highScore.classList.add('high-score-display');
    highScore.appendChild(document.createTextNode('N/A'));
    highScoreBlock.appendChild(highScore);

    var rankBlock = document.createElement('div');
    scoreRow.appendChild(rankBlock);

    rankBlock.appendChild(createLabel('Rank'));

    var rank = document.createElement('div');
    rank.classList.add('high-score-display');
    rank.appendChild(document.createTextNode('-'));
    rankBlock.appendChild(rank);

    var updateHighScore = function(gameKey) {
        currentSaveManager.getScore(gameKey, function(score) {
            if (score) {
                highScore.innerText = formatTime(score.score);
                rank.innerText = score.rank ? String(score.rank) : '-';
            } else {
                highScore.innerText = '-';
                rank.innerText = '-';
            }
        });
    };

    var scoreActions = document.createElement('div');
    scoreActions.classList.add('button-list');
    parent.appendChild(scoreActions);

    var signInButton = createButton('Sign In', function() {

    });
    scoreActions.appendChild(signInButton.dom);

    var scoreboardButton = createButton('Scoreboard', function() {

    });
    scoreActions.appendChild(scoreboardButton.dom);

    return {
        dom: scoreRow,
        updateHighScore: updateHighScore,
    };
}

function createMainMenu(onStart) {
    var dom = document.createElement('div');
    dom.classList.add('app');
    var result = {
        dom: dom,
    };

    var list = document.createElement('div');
    list.classList.add('paragraph-list');
    dom.appendChild(list);

    function separateRoomCode() {
        var parts = roomInput.value.split('-');

        if (parts.length > 1) {
            return {
                code: parts.slice(0, parts.length - 1).join('-'),
                data: parts[parts.length - 1],
            }
        } else {
            return {
                code: parts.join('-'),
                data: '',
            };
        }
    }

    function parseRoom() {
        var parts = separateRoomCode();

        if (parts.data) {
            var difficulty = parts.data[0];

            if (difficulty !== 'E' && difficulty !== 'M' && difficulty !== 'H') {
                difficulty = 'E';
            }

            difficultySelector.setValue(difficulty);
        }
    }

    function calculateSettingsKey() {
        return difficultySelector.value;
    }

    function updateRoom() {
        if (!roomInput.value) {
            return;
        }

        var parts = separateRoomCode();
        parts.data = calculateSettingsKey();

        roomInput.value = parts.code + '-' + parts.data;
        location.hash = parts.code + '-' + parts.data;
    }
    
    list.appendChild(createLabel('Difficulty'));
    var difficultySelector = createOptionSelector([
        {label: 'Easy', value: 'E'},
        {label: 'Medium', value: 'M'},
        {label: 'Hard', value: 'H'},
    ], 'E', false, function() {
        updateRoom();
        scoreBar.updateHighScore(calculateSettingsKey());
    });
    list.appendChild(difficultySelector.dom);
    
    list.appendChild(document.createElement('hr'));

    var scoreBar = createScoreBar(list);
    
    list.appendChild(document.createElement('hr'));

    list.appendChild(createLabel('RNG Seed (Optional)'));
    var roomInput = document.createElement('input');
    roomInput.addEventListener('change', function() {
        parseRoom();
        location.hash = roomInput.value;
    });
    roomInput.value = location.hash.substr(1);
    list.appendChild(roomInput);
    list.appendChild(document.createElement('hr'));

    var startButton = createButton('Start', function() {
        prevSettings.difficulty = difficultySelector.value;

        onStart({
            saveKey: calculateSettingsKey(),
            difficulty: difficultySelector.value,
            roomID: separateRoomCode().code,
        });
    });
    list.appendChild(startButton.dom);
    difficultySelector.setValue(prevSettings.difficulty);
    parseRoom();
    scoreBar.updateHighScore(calculateSettingsKey());

    return result;
}

function showMainMenu() {
    setCurrentMenu(createMainMenu(function(gameOptions) {
        if (gameOptions.difficulty === 'E') {
            startEasyGame(textSource, gameOptions.roomID, gameOptions.saveKey);
        } else if (gameOptions.difficulty === 'M') {
            startMediumGame(textSource, gameOptions.roomID, gameOptions.saveKey);
        } else {
            startHardGame(textSource, gameOptions.roomID, gameOptions.saveKey);
        }
    }));
}