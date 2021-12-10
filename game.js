
var savePrefix;
var textSource;
var background;
var currentSaveManager;

var currentMenu = undefined;

function setCurrentMenu(newMenu) {
    if (currentMenu) {
        background.removeChild(currentMenu.dom);
    }

    currentMenu = newMenu;
    background.appendChild(newMenu.dom);
}

function startEasyGame(paragraphs, roomID, saveKey) {
    paragraphs = textSource.map(function(textArray) {
        return textArray.join(' ');
    });

    setCurrentMenu(createGame([paragraphs], 'paragraph', roomID, saveKey));
}

function startMediumGame(paragraphs, roomID, saveKey) {
    setCurrentMenu(createGame(paragraphs, 'word', roomID, saveKey));
}


function startHardGame(paragraphs, roomID, saveKey) {
    setCurrentMenu(createGame(paragraphs.map(function(paragraph) {
        return paragraph.map(function(chunk) {
            return chunk.split(' ');
        }).flat();
    }), 'word', roomID, saveKey));
}

function gameStart(title, parent, prefix, source) {
    var currentUser = getCurrentUser();

    if (currentUser) {
        currentSaveManager = createScoreManager(prefix, currentUser);
    } else {
        currentSaveManager = createLocalScoreManager(prefix);
    }

    background = document.createElement('div');
    background.classList.add('background');
    parent.appendChild(background);

    savePrefix = prefix;
    textSource = source;
    showMainMenu();
}