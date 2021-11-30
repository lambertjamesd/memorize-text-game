
var textSource = [
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

function createDraggableBlock(textContent, type, dragInfo, allBlocks) {
    var dom = document.createElement('div');
    var result = {
        dom: dom,
        text: textContent,
    };
    dom.classList.add(type);

    function isPointBefore(block, x, y) {
        var blockPos = block.dom.getBoundingClientRect();
        if (type === 'paragraph') {
            return y < blockPos.top + blockPos.height * 0.5;
        } else {
            // TODO
            return true;
        }
    }

    dom.addEventListener('touchstart', function(event) {
        dragInfo.cancel();

        if (event.touches.length > 1) {
            return;
        }

        var startTouch = event.touches.item(0);

        var startY = startTouch.clientY;
        var startX = startTouch.clientX;

        function onDragMove(event) {
            var newPos = event.touches.item(0);

            var currentIndex = allBlocks.indexOf(result);

            if (currentIndex === -1) {
                return;
            }

            var newIndex = 0;

            while (newIndex < allBlocks.length && (newIndex === currentIndex || !isPointBefore(allBlocks[newIndex], newPos.clientX, newPos.clientY))) {
                ++newIndex;
            }

            if (newIndex > currentIndex) {
                --newIndex;
            }

            if (newIndex !== currentIndex) {
                var posBefore = dom.getBoundingClientRect();

                allBlocks.splice(currentIndex, 1);
                allBlocks.splice(newIndex, 0, result);

                var parent = dom.parentElement;
                parent.removeChild(dom);

                if (newIndex + 1 < allBlocks.length) {
                    parent.insertBefore(dom, allBlocks[newIndex + 1].dom);
                } else {
                    parent.append(dom);
                }

                var posAfter = dom.getBoundingClientRect();

                startY += posAfter.top - posBefore.top;
                startX += posAfter.left - posBefore.left;
            }
            
            dom.style.top = (newPos.clientY - startY) + 'px';
            dom.style.left = (newPos.clientX - startX) + 'px';
        }

        function onDragEnd() {
            dragInfo.cancel();
        }

        document.body.addEventListener('touchmove', onDragMove);
        document.body.addEventListener('touchend', onDragEnd);

        dom.style.position = 'relative';
        dom.style.zIndex = '1';

        dragInfo.currentBlock = result;
        dragInfo.touchId = startTouch.identifier;
        dragInfo.cancel = function() {
            if (dragInfo.currentBlock === result) {
                dom.style.position = 'relative';
                dom.style.top = '0px';
                dom.style.left = '0px';
                dom.style.zIndex = '';
                        
                document.body.removeEventListener('touchmove', onDragMove);
                document.body.removeEventListener('touchend', onDragEnd);

                dragInfo.currentBlock = undefined;
                dragInfo.touchId = undefined;
                dragInfo.cancel = function() {};
            }
        };
    });

    allBlocks.push(result);

    dom.appendChild(document.createTextNode(textContent));

    return result;
}

function createWordList(textBlocks, parent, type) {
    var dragInfo = {
        currentBlock: undefined, 
        touchId: undefined,
        cancel: function () {},
    };

    var allBlocks = [];

    for (var i = 0; i < textBlocks.length; ++i) {
        var block = createDraggableBlock(textBlocks[i], type, dragInfo, allBlocks);
        parent.appendChild(block.dom);
    }
}

function createCountdownTimer(seconds, onTimeout) {
    var dom = document.createElement('div');
    dom.classList.add('countdown-container');

    var numberDisplay;

    function showNumber(value) {
        numberDisplay = document.createElement('div');
        numberDisplay.classList.add('countdown-number');
        numberDisplay.appendChild(document.createTextNode(String(value)));
        dom.appendChild(numberDisplay);
    }

    var intervalId = setInterval(function() {
        dom.removeChild(numberDisplay);
        --seconds;
        if (seconds) {
            showNumber(seconds);
        } else {
            clearInterval(intervalId);
            onTimeout();
        }
    }, 1000);
    showNumber(seconds);

    var result = {
        dom: dom,
    };

    return result;
}

function formatTime(millis) {
    var minutes = Math.floor(millis / (60 * 1000));
    var seconds = (millis - minutes * 60 * 1000) / 1000;
    var secondsAsString = seconds.toFixed(1);
    if (secondsAsString.length < 4) {
        secondsAsString = '0' + secondsAsString;
    }

    return String(minutes) + ':' + secondsAsString;
}

function createTimer() {
    var dom = document.createElement('div');
    dom.classList.add('timer');
    dom.appendChild(document.createTextNode('0:00.0'));

    function replaceTime(millis) {
        dom.removeChild(dom.firstChild);
        dom.appendChild(document.createTextNode(formatTime(millis)));
    }

    var result = {
        dom: dom,
    };

    var timerId = undefined;
    var startTime = undefined;

    result.start = function() {
        if (!timerId) {
            startTime = Date.now();
            timerId = setInterval(function() {
                result.millis = Date.now() - startTime;
                replaceTime(result.millis);
            }, 100);
        }
    };

    result.stop = function() {
        if (timerId) {
            result.millis = Date.now() - startTime;
            replaceTime(result.millis);
            clearInterval(timerId);
            startTime = undefined;
            timerId = undefined;
        }
    };

    return result;
}

function createGame(textBlocks, gameType) {
    var dom = document.createElement('div');
    dom.classList.add('app');
    var result = {
        dom: dom,
    };

    var list = document.createElement('div');
    list.classList.add('paragraph-list');
    dom.appendChild(list);

    createWordList(textBlocks[0], list, gameType);

    dom.appendChild(document.createElement('hr'));

    var buttons = document.createElement('div');
    buttons.classList.add('button-list');

    var timer = createTimer();
    buttons.appendChild(timer.dom);
    
    var checkButton = createButton('Check', function() {
        
    });
    buttons.appendChild(checkButton.dom);

    dom.appendChild(buttons);

    var countdown = createCountdownTimer(3, function() {
        timer.start();
        dom.removeChild(countdown.dom);
    });

    dom.appendChild(countdown.dom);

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
        if (gameOptions.difficulty === 'E') {
            startParagraphGame();
        }
    }));
}

function startParagraphGame() {
    var paragraphs = textSource.map(function(textArray) {
        return textArray.join(' ');
    });

    setCurrentMenu(createGame([paragraphs], 'paragraph'));
}

function gameStart() {
    showMainMenu();
}