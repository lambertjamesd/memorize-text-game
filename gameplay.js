
function createWinScreen(time, isHighScore, onRetry, onMenu) {
    var dom = document.createElement('div');
    dom.classList.add('fullscreen-overlay');
    var result = {
        dom: dom,
    };

    var dialogBox = document.createElement('div');
    dialogBox.classList.add('dialog-box');
    dom.appendChild(dialogBox);

    var timeText = document.createElement('div');
    timeText.classList.add('time-display');
    timeText.appendChild(document.createTextNode(formatTime(time)));
    dialogBox.appendChild(timeText);

    if (isHighScore) {
        var highScoreLabel = document.createElement('div');
        highScoreLabel.classList.add('high-score');
        highScoreLabel.classList.add('party');
        highScoreLabel.appendChild(document.createTextNode('New high score!'));
        dialogBox.appendChild(highScoreLabel);
    }

    dialogBox.appendChild(document.createElement('hr'));

    var buttonList = document.createElement('div');
    buttonList.classList.add('button-list');
    dialogBox.appendChild(buttonList);
    buttonList.appendChild(createButton('Retry', function() {
        background.removeChild(dom);
        onRetry();
    }).dom);
    buttonList.appendChild(createButton('Menu', function() {
        background.removeChild(dom);
        onMenu();
    }).dom);

    background.appendChild(dom);

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

function createFloatingText(text, atDom) {
    var atPos = atDom.getBoundingClientRect();
    var dom = document.createElement('div');
    dom.classList.add('floating-text');
    dom.appendChild(document.createTextNode(text));

    background.appendChild(dom);

    var domSize = dom.getBoundingClientRect();

    dom.style.top = atPos.top + 'px';
    dom.style.left = (atPos.left + (atPos.width - domSize.width) * Math.random()) + 'px';

    dom.addEventListener('animationend', function() {
        background.removeChild(dom);
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
        millis: 0,
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

function findHint(solution, currentConfiguration) {
    var moveTo = 0;

    while (moveTo < solution.length && solution[moveTo] === currentConfiguration[moveTo]) {
        ++moveTo;
    }

    if (moveTo === solution.length) {
        // already solved
        return undefined;
    }

    var moveFrom = moveTo;

    while (moveFrom < currentConfiguration.length && currentConfiguration[moveFrom] !== solution[moveTo]) {
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

function shuffleBlocks(blockInput, randomSource) {
    var zipped;
    var hintCheck;

    function isInOrder(blocks) {
        for (var i = 0; i + 1 < blocks.length; ++i) {
            if (blocks[i] !== blockInput[i]) {
                return false;
            }
        }

        return true;
    }

    var attemptCount = 0;
    
    do {
        zipped = blockInput.map(function(block) {
            return {
                block: block,
                order: randomSource(),
            };
        });
        ++attemptCount;

        zipped.sort(function(a, b) {
            return a.order - b.order;
        });

        hintCheck = zipped.map(function(entry) {
            return entry.block;
        });

        // make sure it take more than one hint to
        // solve the puzzle. This means spamming
        // hint will at least garantee 3 + 5 + 7 = 15 seconds
        // making it an unviable strategy
        var singleHint = findHint(blockInput, hintCheck);

        if (singleHint) {
            if (singleHint.to > singleHint.from) {
                --singleHint.to;
            }

            hintCheck.splice(singleHint.to, 0, hintCheck.splice(singleHint.from, 1)[0]);
        }
    } while (isInOrder(hintCheck));

    return zipped.map(function(entry) {
        return entry.block;
    });
}

function createGame(textBlocks, gameType, randomSeed, saveKey) {
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
            var isHighScore = saveTime(saveKey, timer.millis);
            createWinScreen(timer.millis, isHighScore, function() {
                setCurrentMenu(createGame(textBlocks, gameType, randomSeed, saveKey));
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