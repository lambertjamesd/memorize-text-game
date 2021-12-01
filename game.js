
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
        'improve each day,', 'I will qualify to', 'receive temple blessings', 
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

            var useValue = parseInt(parts.data[1] || 'v', 32);
            if (isNaN(useValue)) {
                useValue = 31;
            }

            var useParagraphs = [];
            var mask = 1;

            for (var i = 0; i < textSource.length; ++i) {
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

        for (var i = 0; i < textSource.length; ++i) {
            if (paragraphSelector.value.indexOf(i) !== -1) {
                paragraphCode |= mask;
            }

            mask = mask << 1;
        }

        var parts = separateRoomCode();
        parts.data = difficultySelector.value + paragraphCode.toString(32);

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

function createWinScreen(time, onRetry, onMenu) {
    var dom = document.createElement('div');
    dom.classList.add('fullscreen-overlay');
    var result = {
        dom: dom,
    };

    var dialogBox = document.createElement('div');
    dialogBox.classList.add('dialog-box');
    dom.appendChild(dialogBox);

    var timeText = document.createElement('div');
    timeText.appendChild(document.createTextNode(formatTime(time)));
    dialogBox.appendChild(timeText);

    dialogBox.appendChild(document.createElement('hr'));

    var buttonList = document.createElement('div');
    buttonList.classList.add('button-list');
    dialogBox.appendChild(buttonList);
    buttonList.appendChild(createButton('Retry', function() {
        document.body.removeChild(dom);
        onRetry();
    }).dom);
    buttonList.appendChild(createButton('Menu', function() {
        document.body.removeChild(dom);
        onMenu();
    }).dom);

    document.body.appendChild(dom);

    return result
}

function createDraggableBlock(textContent, type, dragInfo, allBlocks, moveBlock) {
    var dom = document.createElement('div');
    dom.classList.add(type);

    function isPointBefore(block, x, y) {
        var blockPos = block.dom.getBoundingClientRect();

        var top = blockPos.top - parseInt(block.dom.style.top || '0', 10);
        var left = blockPos.left - parseInt(block.dom.style.left || '0', 10);

        if (type === 'paragraph') {
            return y < top + blockPos.height * 0.5;
        } else {
            return y < top || y < top + blockPos.height && x < left + blockPos.width * 0.5;
        }
    }

    function animateFrom(posBefore) {
        var posAfter = dom.getBoundingClientRect()
        if (posBefore.top !== posAfter.top || posBefore.left !== posAfter.left) {
            dom.classList.remove('animate-pos');
            dom.style.top = (posBefore.top - posAfter.top) + 'px';
            dom.style.left = (posBefore.left - posAfter.left) + 'px';
            // force a relayout
            dom.getBoundingClientRect();
            dom.classList.add('animate-pos');
            dom.style.top = '0px';
            dom.style.left = '0px';
        }
    }
    
    var result = {
        dom: dom,
        text: textContent,
        animateFrom: animateFrom,
    };

    function handleTouch(downEvent, touchMoveName, touchEndName, eventFilter) {
        dragInfo.cancel();

        downEvent = eventFilter(downEvent);

        if (downEvent.touches.length > 1) {
            return;
        }

        var startTouch = downEvent.touches[0];

        var startY = startTouch.clientY;
        var startX = startTouch.clientX;

        function onDragMove(moveEvent) {
            moveEvent = eventFilter(moveEvent);
            var newPos = moveEvent.touches[0];

            var currentIndex = allBlocks.indexOf(result);

            if (currentIndex === -1) {
                return;
            }

            var newIndex = 0;

            while (newIndex < allBlocks.length && (newIndex === currentIndex || !isPointBefore(allBlocks[newIndex], newPos.clientX, newPos.clientY))) {
                ++newIndex;
            }

            var posBefore = dom.getBoundingClientRect();

            moveBlock(currentIndex, newIndex, result);
            
            var posAfter = dom.getBoundingClientRect();
            startY += posAfter.top - posBefore.top;
            startX += posAfter.left - posBefore.left;
            
            dom.style.top = (newPos.clientY - startY) + 'px';
            dom.style.left = (newPos.clientX - startX) + 'px';
        }

        function onDragEnd() {
            dragInfo.cancel();
        }

        document.body.addEventListener(touchMoveName, onDragMove);
        document.body.addEventListener(touchEndName, onDragEnd);

        dom.style.position = 'relative';
        dom.style.zIndex = '1';
        dom.classList.remove('animate-pos');

        dragInfo.currentBlock = result;
        dragInfo.cancel = function() {
            if (dragInfo.currentBlock === result) {
                dom.classList.add('animate-pos');
                // force a relayout
                dom.getBoundingClientRect();
                dom.style.position = 'relative';
                dom.style.top = '0px';
                dom.style.left = '0px';
                dom.style.zIndex = '';
                        
                document.body.removeEventListener(touchMoveName, onDragMove);
                document.body.removeEventListener(touchEndName, onDragEnd);

                dragInfo.currentBlock = undefined;
                dragInfo.cancel = function() {};
            }
        };
    }

    if ('ontouchstart' in document.documentElement) {
        dom.addEventListener('touchstart', function(event) {
            handleTouch(event, 'touchmove', 'touchend', function(event) {
                return event;
            });
        });
    } else {
        dom.addEventListener('mousedown', function(event) {
            handleTouch(event, 'mousemove', 'mouseup', function(mouseEvent) {
                return {
                    touches: [{identifier: 0, clientX: mouseEvent.clientX, clientY: mouseEvent.clientY}],
                };
            });
        });
    }

    allBlocks.push(result);

    dom.appendChild(document.createTextNode(textContent));

    return result;
}

function createWordList(textBlocks, parent, type) {
    var dragInfo = {
        currentBlock: undefined, 
        cancel: function () {},
    };

    var allBlocks = [];

    function moveBlock(from, to, dragging) {
        if (from === to) {
            return;
        }
        
        if (to > from) {
            --to;
        }

        var posBefore = allBlocks.map(function(block) {
            return block.dom.getBoundingClientRect();
        });

        var blockToMove = allBlocks[from];

        allBlocks.splice(to, 0, allBlocks.splice(from, 1)[0]);
        posBefore.splice(to, 0, posBefore.splice(from, 1)[0]);

        parent.removeChild(blockToMove.dom);
        if (to + 1 < allBlocks.length) {
            parent.insertBefore(blockToMove.dom, allBlocks[to + 1].dom);
        } else {
            parent.append(blockToMove.dom);
        }

        for (var i = 0; i < posBefore.length; ++i) {
            var block = allBlocks[i];
            if (block !== dragging) {
                block.animateFrom(posBefore[i]);
            }
        }
    }

    for (var i = 0; i < textBlocks.length; ++i) {
        var block = createDraggableBlock(textBlocks[i], type, dragInfo, allBlocks, moveBlock);
        parent.appendChild(block.dom);
    }

    return {
        getText: function() {
            return allBlocks.map(function(block) {
                return block.text;
            }).join(' ');
        },
        getTextArray: function() {
            return allBlocks.map(function(block) {
                return block.text;
            });
        },
        move: moveBlock,
    };
}

function createCountdownTimer(seconds, onTimeout) {
    var dom = document.createElement('div');
    dom.classList.add('fullscreen-overlay');

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

function createFloatingText(text, atDom) {
    var atPos = atDom.getBoundingClientRect();
    var dom = document.createElement('div');
    dom.classList.add('floating-text');
    dom.appendChild(document.createTextNode(text));

    document.body.appendChild(dom);

    var domSize = dom.getBoundingClientRect();

    dom.style.top = atPos.top + 'px';
    dom.style.left = (atPos.left + (atPos.width - domSize.width) * Math.random()) + 'px';

    dom.addEventListener('animationend', function() {
        document.body.removeChild(dom);
    });
}

var timerAnimationNames = ['timer-penalty-0', 'timer-penalty-1', 'timer-penalty-2', 'timer-penalty-3'];

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

    result.addTime = function(amount) {
        if (startTime) {
            createFloatingText('+' + (amount / 1000).toFixed(1), dom);

            startTime -= amount; 
            replaceTime(result.millis);

            timerAnimationNames.forEach(function(anim) {
                dom.classList.remove(anim);
            });
            
            // relayout
            dom.getBoundingClientRect();
            
            var anim = timerAnimationNames[Math.floor(Math.random() * timerAnimationNames.length)]
            dom.classList.add(anim);
        }
    }

    return result;
}

function xmur3(str) {
    var i;
    var h;
    for(i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function shuffleBlocks(blockInput, randomSource) {
    var zipped;

    function isInOrder(zippedBlocks) {
        for (var i = 0; i + 1 < zippedBlocks.length; ++i) {
            if (zippedBlocks[i].order > zippedBlocks[i+1].order) {
                return false;
            }
        }

        return true;
    }
    
    do {
        zipped = blockInput.map(function(block) {
            return {
                block: block,
                order: randomSource(),
            };
        });
    } while (isInOrder(zipped));

    zipped.sort(function(a, b) {
        return a.order - b.order;
    });

    return zipped.map(function(entry) {
        return entry.block;
    });
}

function findHint(solution, currentConfiguration) {
    var moveTo = 0;

    while (moveTo < solution.length && solution[moveTo] === currentConfiguration[moveTo]) {
        ++moveTo;
    }

    if (moveTo === solution.length) {
        // already solved
        return undefined;
    }

    var searchFor = solution[moveTo];
    var moveFrom = moveTo;

    while (moveFrom < currentConfiguration.length && currentConfiguration[moveFrom] !== searchFor) {
        ++moveFrom;
    }

    if (moveFrom === currentConfiguration.length) {
        // shouldn't happen
        return undefined;
    }

    return {
        to: moveTo,
        from: moveFrom,
    };
}

function createGame(textBlocks, gameType, randomSeed) {
    var dom = document.createElement('div');
    dom.classList.add('app');
    var result = {
        dom: dom,
    };

    var randomSource = xmur3(randomSeed || String(Date.now()));

    var currentParagraph = 0;
    var rootList;
    var wordList;
    var currentSolution;
    var currentHintCost = 3;

    function renderCurrentParagraph() {
        var insertBefore;

        if (rootList) {
            insertBefore = rootList.nextSibling;
            dom.removeChild(rootList);
        }

        rootList = document.createElement('div');
        rootList.classList.add('paragraph-list');
        dom.insertBefore(rootList, insertBefore);
    
        currentSolution = textBlocks[currentParagraph].join(' ');

        var targetList = rootList;
        
        if (gameType === 'word') {
            var words = document.createElement('div');
            words.classList.add('word-list');
            rootList.appendChild(words);
            targetList = words;
        }
    
        wordList = createWordList(shuffleBlocks(textBlocks[currentParagraph], randomSource), targetList, gameType);
    }

    renderCurrentParagraph(0);

    dom.appendChild(document.createElement('hr'));

    var buttons = document.createElement('div');
    buttons.classList.add('button-list');

    var timer = createTimer();
    buttons.appendChild(timer.dom);

    function triggerVictory() {
        ++currentParagraph;
        if (currentParagraph < textBlocks.length) {
            renderCurrentParagraph();
        } else {
            timer.stop();
            createWinScreen(timer.millis, function() {
                setCurrentMenu(createGame(textBlocks, gameType, randomSeed));
            }, function() {
                showMainMenu();
            });
        }
    }

    var hintButton = createButton('Hint', function() {
        var hint = findHint(textBlocks[currentParagraph], wordList.getTextArray());
        timer.addTime(currentHintCost * 1000);
        currentHintCost += 2;

        if (!hint) {
            triggerVictory();
            return;
        }

        wordList.move(hint.from, hint.to);
    });
    buttons.appendChild(hintButton.dom);

    
    var checkButton = createButton('Check', function() {
        if (currentSolution === wordList.getText()) {
            triggerVictory();
        } else {
            timer.addTime(1000);
        }
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
        var filteredParagraphs = gameOptions.paragraphs.map(function(index) {
            return textSource[index];
        });

        if (gameOptions.difficulty === 'E') {
            startEasyGame(gameOptions.roomID);
        } else if (gameOptions.difficulty === 'M') {
            startMediumGame(filteredParagraphs, gameOptions.roomID);
        } else {
            startHardGame(filteredParagraphs, gameOptions.roomID);
        }
    }));
}

function startEasyGame(roomID) {
    var paragraphs = textSource.map(function(textArray) {
        return textArray.join(' ');
    });

    setCurrentMenu(createGame([paragraphs], 'paragraph', roomID));
}

function startMediumGame(filteredParagraphs, roomID) {
    setCurrentMenu(createGame(filteredParagraphs, 'word', roomID));
}


function startHardGame(filteredParagraphs, roomID) {
    setCurrentMenu(createGame(filteredParagraphs.map(function(paragraph) {
        return paragraph.map(function(chunk) {
            return chunk.split(' ');
        }).flat();
    }), 'word', roomID));
}

function gameStart() {
    showMainMenu();
}