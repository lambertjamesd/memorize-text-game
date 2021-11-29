
var textBlocks = [
    [
        'I am a', 'beloved son of God,', 'and', 'He has a', 'work for me to do'
    ],
    [
        'With all my', 'heart,', 'might,', 'mind,', 'and', 'strength,', 
        'I will', 'love God,', 'keep my covenants,', 'and', 
        'use His priesthood to serve others,', 'beginning in my own home',
    ],
    [
        'As I strive to', 'serve,', 'exercise faith,', 'repent,', 'and', 
        'improve each day,', ' I will qualify to', 'receive temple blessings', 
        'and', 'the enduring joy', 'of the gospel',
    ],
    [
        'I will prepare',  'to become a', 'diligent missionary,', 'loyal husband,', 
        'and', 'loving father', 'by being a', 'true disciple', 'of Jesus Christ',
    ],
    [
        'I will help prepare', 'the world for', 'the Savior\'s return by', 
        'inviting all to', 'come unto Christ', 'and', 'receive the blessings', 
        'of His Atonement',
    ],
];

function createButton(textContent, onClick, onClickData) {
    var dom = document.createElement('button');
    var result = {
        dom: dom,
        enabled: true,
        setEnabled: function(enabled) {
            result.enabled = enabled;

            if (enabled) {
                dom.classList.remove('disabled');
            } else {
                dom.classList.add('disabled');
            }
        },
        setSelected: function(selected) {
            if (selected) {
                dom.classList.add('selected');
            } else {
                dom.classList.remove('selected');
            }
        },
    };
    dom.appendChild(document.createTextNode(textContent));

    dom.classList.add('button');

    dom.addEventListener('click', function() {
        if (result.enabled) {
            onClick(result, onClickData);
        }
    });
    return result;
}

function createOptionSelector(options, initialValue, isMultiselect, onChange) {
    var dom = document.createElement('div');
    dom.classList.add('button-list');

    var result = {
        dom: dom,
        value: isMultiselect ? [] : undefined,
        buttons: [],
    };

    var selectedButton = undefined;

    function selectOption(optionValue, isSilent) {
        var optionIndex = options.findIndex(function (option) {
            return optionValue == option.value;
        });

        if (optionIndex === -1) {
            return;
        }

        var button = result.buttons[optionIndex];

        if (isMultiselect) {
            const existingIndex = result.value.indexOf(optionValue);
            if (existingIndex === -1) {
                result.value.push(optionValue);
                button.setSelected(true);
            } else {
                result.value.splice(existingIndex, 1);
                button.setSelected(false);
            }

            if (!isSilent && onChange) {
                onChange(result, result.value);
            }
        } else {
            if (result.value !== optionValue) {
                if (selectedButton) {
                    selectedButton.setSelected(false);
                }
                selectedButton = button;
                result.value = optionValue;
                button.setSelected(true);
                
                if (!isSilent && onChange) {
                    onChange(result, result.value);
                }
            }
        }
    }

    for (var i = 0; i < options.length; ++i) {
        var option = options[i];
        var button = createButton(option.label, function(button, optionValue) {
            selectOption(optionValue, false);
        }, option.value);
        dom.appendChild(button.dom);
        result.buttons.push(button);
    }

    
    result.setValue = function (value) {
        selectedButton = undefined;
        result.value = isMultiselect ? [] : undefined;
        for (var i = 0; i < result.buttons.length; ++i) {
            result.buttons[i].setSelected(false);
        }

        if (isMultiselect) {
            value.forEach(function(subValue) {
                selectOption(subValue, true);
            });
        } else {
            selectOption(value, true);
        }
    };

    result.setEnabled = function(value) {
        result.buttons.forEach(function(button) {
            button.setEnabled(value);
        })
    };

    result.setValue(initialValue);

    return result;
}

function createLabel(text) {
    var result = document.createElement('label');
    result.appendChild(document.createTextNode(text));
    return result;
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
            var difficutly = parts.data[0];

            if (difficutly !== 'E' && difficutly !== 'M' && difficutly !== 'H') {
                difficutly = 'E';
            }

            var paragraphs = parts.data.charCodeAt(1);
            var useValue = 31;

            if (paragraphs) {
                if (paragraphs >= 48 && paragraphs < 58) {
                    // 0-9
                    useValue = paragraphs - 48;
                } else if (paragraphs >= 97 && paragraphs < 123) {
                    // a-z
                    useValue = paragraphs - 97 + 10;
                }
            }

            var useParagraphs = [];
            var mask = 1;

            for (var i = 0; i < textBlocks.length; ++i) {
                if (mask & useValue) {
                    useParagraphs.push(i);
                }

                mask = mask << 1;
            }

            difficultySelector.setValue(difficutly);
            paragraphSelector.setValue(useParagraphs);
            paragraphSelector.setEnabled(difficutly !== 'E');
            checkStartEnabled();
        }
    }

    function updateRoom() {
        if (!roomInput.value) {
            return;
        }

        var paragraphCode = 0;
        var mask = 1;

        for (var i = 0; i < textBlocks.length; ++i) {
            if (paragraphSelector.value.indexOf(i) !== -1) {
                paragraphCode |= mask;
            }

            mask = mask << 1;
        }

        var paragraphChar;

        if (paragraphCode >= 0 && paragraphCode < 10) {
            paragraphChar = String.fromCharCode(paragraphCode + 48);
        } else if (paragraphCode >= 10) {
            paragraphChar = String.fromCharCode(paragraphCode + 97 - 10);
        }

        var parts = separateRoomCode();
        parts.data = difficultySelector.value + paragraphChar;

        roomInput.value = parts.code + '-' + parts.data;
        location.hash = parts.code + '-' + parts.data;
    }

    list.appendChild(createLabel('Room'));
    var roomInput = document.createElement('input');
    roomInput.addEventListener('change', function() {
        parseRoom();
        location.hash = roomInput.value;
    });
    roomInput.value = location.hash.substr(1);
    list.appendChild(roomInput);
    list.appendChild(document.createElement('hr'));

    function checkStartEnabled() {
        startButton.setEnabled(difficultySelector.value === 'E' ||
            paragraphSelector.value.length > 0);
    }
    
    list.appendChild(createLabel('Difficulty'));
    var difficultySelector = createOptionSelector([
        {label: 'Easy', value: 'E'},
        {label: 'Medium', value: 'M'},
        {label: 'Hard', value: 'H'},
    ], 'E', false, function(_, difficultyValue) {
        paragraphSelector.setEnabled(difficultyValue !== 'E');
        checkStartEnabled();
        updateRoom();
    });
    list.appendChild(difficultySelector.dom);
    list.appendChild(document.createElement('hr'));
    
    list.appendChild(createLabel('Paragraph'));
    var paragraphSelector = createOptionSelector([
        {label: '1', value: 0},
        {label: '2', value: 1},
        {label: '3', value: 2},
        {label: '4', value: 3},
        {label: '5', value: 4},
    ], [0, 1, 2, 3, 4], true, function(_, paragraphs) {
        checkStartEnabled();
        updateRoom();
    });
    list.appendChild(paragraphSelector.dom);
    paragraphSelector.setEnabled(false);
    list.appendChild(document.createElement('hr'));

    var startButton = createButton('Start', function() {
        onStart({
            difficulty: difficultySelector.value,
            paragraphs: paragraphSelector.value,
            roomID: separateRoomCode().code,
        });
    });
    list.appendChild(startButton.dom);
    parseRoom();

    return result;
}

var currentMenu = undefined;

function setCurrentMenu(newMenu) {
    if (currentMenu) {
        document.body.removeChild(currentMenu.dom);
    }

    currentMenu = newMenu;
    document.body.appendChild(newMenu.dom);
}

function showMainMenu() {
    setCurrentMenu(createMainMenu(function(gameOptions) {
        console.log(gameOptions);
    }));
}

function gameStart() {
    showMainMenu();
}