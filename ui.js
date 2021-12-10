

function createButtonPress(inButton, clientX, clientY) {
    var dom = document.createElement('div');
    dom.classList.add('button-press');

    background.appendChild(dom);

    dom.style.top = (clientY - 4) + 'px';
    dom.style.left = (clientX - 4) + 'px';

    dom.addEventListener('animationend', function() {
        background.removeChild(dom);
    })
}

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

    dom.addEventListener('mousedown', function(event) {
        if (result.enabled) {
            createButtonPress(result, event.clientX, event.clientY);
        }
    });

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

function loadTime(key) {
    return localStorage.getItem(savePrefix + 'high-score-' + key);
}

function saveTime(key, time) {
    var prevScore = loadTime(key);

    if (!prevScore || prevScore > time) {
        localStorage.setItem(savePrefix + 'high-score-' + key, time);
        return true;
    }

    return false;
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