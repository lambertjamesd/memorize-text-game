
function createSignInDialog() {
    var dom = document.createElement('div');
    dom.classList.add('fullscreen-overlay');
    var result = {
        dom: dom,
    };

    var dialogBox = document.createElement('div');
    dialogBox.classList.add('dialog-box');
    dom.appendChild(dialogBox);

    var list = document.createElement('div');
    list.classList.add('paragraph-list');
    dialogBox.appendChild(list);
    
    list.appendChild(createLabel('Username'));
    var username = document.createElement('input');
    list.appendChild(username);

    list.appendChild(createLabel('Password'));
    var password = document.createElement('input');
    password.type = 'password';
    list.appendChild(password);

    var errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    list.appendChild(errorMessage);
    
    list.appendChild(document.createElement('hr'));

    var signInButton = createButton('Sign In', function() {
        signUserIn(username.value, password.value)
            .then(function() {
                updateSaveManager();
                showMainMenu();
                background.removeChild(dom);
            }).catch(function (err) {
                errorMessage.innerText = err.message;
            });
    });
    list.appendChild(signInButton.dom);

    var signInButton = createButton('Create Account', function() {
        createAccount(username.value, password.value)
            .then(function() {
                updateSaveManager();
                showMainMenu();
                background.removeChild(dom);
            }).catch(function (err) {
                errorMessage.innerText = err.message;
            });
    });
    list.appendChild(signInButton.dom);

    var signInButton = createButton('Cancel', function() {
        background.removeChild(dom);
    });
    signInButton.dom.classList.add('secondary');
    list.appendChild(signInButton.dom);

    background.appendChild(dom);

    return result;
}

function createScoreRow(scoreData) {
    var scoreRow = document.createElement('div');
    scoreRow.classList.add('score-row');

    var username = document.createElement('div');
    username.classList.add('score-username');
    username.appendChild(document.createTextNode(scoreData.username));
    scoreRow.appendChild(username);

    var score = document.createElement('div');
    score.classList.add('score-score');
    var scoreAsString = typeof scoreData.score === 'number' ? formatTime(scoreData.score) : scoreData.score;
    score.appendChild(document.createTextNode(scoreAsString));
    scoreRow.appendChild(score);

    var rank = document.createElement('div');
    rank.classList.add('score-rank');
    rank.appendChild(document.createTextNode(scoreData.rank));
    scoreRow.appendChild(rank);

    return scoreRow;
}

function createScoresMenu(appKey, difficulty) {
    var currentUser = getCurrentUser();

    var dom = document.createElement('div');
    dom.classList.add('app');
    var result = {
        dom: dom,
    };

    var itemList = document.createElement('div');
    itemList.classList.add('paragraph-list');
    dom.appendChild(itemList);

    var scoreRowTitle = createScoreRow({
        username: 'Username',
        score: 'Score',
        rank: 'Rank',
    });
    scoreRowTitle.classList.add('title');

    itemList.appendChild(scoreRowTitle);

    getScores(appKey, difficulty).then(function(scores) {
        scores.forEach(function(score) {
            var scoreRow = createScoreRow(score);

            if (currentUser && score.username === currentUser.username) {
                scoreRow.style.fontWeight = 'bold';
            }

            itemList.appendChild(scoreRow);
        })
    }).catch(function(err) {
        var errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        itemList.appendChild(errorMessage);
        errorMessage.appendChild(document.createTextNode(err.message));
    });

    dom.appendChild(document.createElement('hr'));

    var bottomButtonRow = document.createElement('div');
    bottomButtonRow.classList.add('button-list');
    dom.appendChild(bottomButtonRow);

    var mainMenu = createButton('Back', function() {
        showMainMenu();
    });
    mainMenu.dom.style.flexGrow = '1';
    bottomButtonRow.appendChild(mainMenu.dom);

    return result;
}