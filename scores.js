
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
        scoreHost + '/users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application.json',
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
        return {
            username: username,
            token: response.token,
        };
    });
} 