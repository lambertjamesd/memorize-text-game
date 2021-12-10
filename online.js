
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