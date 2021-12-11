
var scoreHost = 'https://scores.lambertjamesd.com';

function parseBody(response) {
    return response.json().then(function(json) {
        if (json.error) {
            return Promise.reject(new Error(json.error));
        }

        if (response.status >= 200 && response.status < 300) {
            return json;
        }

        return Promise.reject(new Error('An unknown error ocurred'));
    });
}

function signUserIn(username, password) {
    return fetch(
        scoreHost + '/token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                username: username,
                password, password,
            }),
        }
    )
    .then(parseBody)
    .then(function (response) {
        var result = {
            username: username,
            token: response.token,
        };

        localStorage.setItem('current_user', JSON.stringify(result));

        return result;
    });
}

function createAccount(username, password) {
    return fetch(
        scoreHost + '/users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                username: username,
                password, password,
            }),
        }
    )
    .then(parseBody)
    .then(function () {
        return signUserIn(username, password);
    });
}

function signUserOut(appKey) {
    ['E', 'M', 'H'].forEach(function(difficulty) {
        localStorage.removeItem(appKey + 'high-score-' + difficulty);
    });

    localStorage.removeItem('current_user');
}

function getCurrentUser() {
    var result = localStorage.getItem('current_user');

    if (!result) {
        return undefined;
    }

    try {
        return JSON.parse(result);
    } catch (_) {
        return undefined;
    }
}

function getGameKey(appKey, difficulty) {
    return appKey + difficulty;
}

function createLocalScoreManager(appKey) {
    function getScore(difficulty, callback) {
        var score = localStorage.getItem(appKey + 'high-score-' + difficulty);

        if (score) {
            callback({
                score: +score,
            });
        } else {
            callback(undefined);
        }
    }

    function submitScore(difficulty, score) {
        var prevScore = localStorage.getItem(appKey + 'high-score-' + difficulty);

        var highScore = !(typeof prevScore === "number") || score < prevScore;

        if (highScore) {
            localStorage.setItem(appKey + 'high-score-' + difficulty, score);
    
            return Promise.resolve({
                score: score,
                high_score: true,
            });
        } else {
            return Promise.resolve({
                score: prevScore,
                high_score: false,
            });
        }
    }

    function deleteScore(difficulty) {
        localStorage.removeItem(appKey + 'high-score-' + difficulty);
    }

    return {
        getScore: getScore,
        submitScore: submitScore,
        deleteScore: deleteScore,
        isSignedIn: false,
    };
}

function createScoreManager(appKey, user) {
    var scoreCache = new Map();

    var localScores = createLocalScoreManager(appKey);

    function getScore(difficulty, callback) {
        const cachedValue = scoreCache.get(getGameKey(appKey, difficulty));

        if (cachedValue) {
            callback(cachedValue);
        } else {
            localScores.getScore(difficulty, callback);
        }

        if (cachedValue && cachedValue.rank === 'number') {
            return;
        }

        return fetch(
            scoreHost + '/scores/' + getGameKey(appKey, difficulty) + '/' + user.username,
            {
                method: 'GET',
                mode: 'cors',
            }
        ).then(function(response) {
            if (response.status == 404) {
                if (!cachedValue) {
                    localScores.getScore(difficulty, callback);
                }
            } else if (response.status == 200) {
                return response.json().then(function(jsonResponse) {
                    scoreCache.set(getGameKey(appKey, difficulty), jsonResponse);
                    localScores.submitScore(difficulty, jsonResponse.score);
                    callback(jsonResponse);
                });
            }
        }).catch(function() {
            if (!cachedValue) {
                localScores.getScore(difficulty, callback);
            }
        });
    }

    function submitScore(difficulty, score) {
        localScores.submitScore(difficulty, score);
        return fetch(
            scoreHost + '/scores/' + getGameKey(appKey, difficulty),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + user.token,
                },
                mode: 'cors',
                body: JSON.stringify({
                    score: score,
                }),
            }
        )
        .then(parseBody)
        .then(function(result) {
            scoreCache.set(getGameKey(appKey, difficulty), result);
            return result;
        });
    }

    function deleteScore(difficulty) {
        return fetch(
            scoreHost + '/scores/' + getGameKey(appKey, difficulty) + '/' + user.username,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + user.token,
                },
                mode: 'cors',
            }
        );
    }

    return {
        getScore: getScore,
        submitScore: submitScore,
        deleteScore: deleteScore,
        isSignedIn: true,
    };
}

function getScores(appKey, difficulty) {
    return fetch(
        scoreHost + '/scores/' + getGameKey(appKey, difficulty),
        {
            method: 'GET',
            mode: 'cors',
        }
    ).then(parseBody);
}

function resumbitScores(appKey, difficulties, scoreManager) {
    var localScores = createLocalScoreManager(appKey);
    difficulties.forEach(function(difficulty) {
        localScores.getScore(difficulty, function(score) {
            if (score) {
                scoreManager.submitScore(difficulty, score.score);
            }
        });
    });
}