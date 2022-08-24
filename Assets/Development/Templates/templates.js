export function indexPage(data) {
    return `<h1 id="header">${data['h1']}</h1>
<!-- Pills navs -->
<div class="position">
<div id="content" class="tabContainer">
    <div id="tabs" class="tabContent">
        <ul id="tabButtons" class="ulButton">
            <li id="loginLi" class="active">
                <a id="tab-login" class=" buttons" href="#login">${data['a1']}</a>
            </li>
            <li id="registerLi" >
                <a id="tab-register" class="buttons" href="#register">${data['a2']}</a>
            </li>
        </ul>
    </div>
    <!-- Pills navs -->

    <!-- Pills content -->
    <div id="main">
        <div id="login">
            <form action="login" method="post" id="formL" >
                <!-- Email input -->
                <div id="email" >
                    <label for="loginName" ><b>${data['label1']}</b></label>
                    <input type="text" name="usernameL" placeholder="Enter Username" id="loginName" class="sizeButton" required>
                </div>

                <!-- Password input -->
                <div id="password">
                    <label for="loginPassword"><b>${data['label2']}</b></label>
                    <input type="password" name="pwdL" placeholder="Enter Password" id="loginPassword" class="sizeButton" required>
                </div>

                <!-- Submit button -->
                <button type="submit" id="submitL" name="submitL" class="sizeButton">${data['buttonL']}</button>

            </form>
        </div>

        <div id="register" hidden>
            <form action="register" method="post" id="formR">
                <!-- Name input -->
                <div >
                    <label for="registerName"><b>${data['label3']}</b></label>
                    <input type="text" name="fullname" placeholder="Enter Full Name" id="registerName" class="sizeButton" required>
                </div>

                <!-- Username input -->
                <div>
                    <label for="registerUsername"><b>${data['label4']}</b></label>
                    <input type="text" name="usernameR" placeholder="Enter Username" id="registerUsername" class="sizeButton" required>
                </div>
                <!-- Email input -->
                <div>
                    <label for="registerEmail"><b>${data['label5']}</b></label>
                    <input type="email" name="emailR" placeholder="Enter Email" id="registerEmail" class="sizeButton" required>
                </div>

                <!-- Password input -->
                <div>
                    <label for="registerPassword"><b>${data['label6']}</b></label>
                    <input type="password" name="pwdR" placeholder="Enter Password" id="registerPassword" class="sizeButton" required>
                </div>

                <!-- Submit button -->
                <button type="submit" id="submitR" name="submitR" class="sizeButton">${data['buttonS']}</button>
            </form>
        </div>
    </div>
</div>
</div>`
}

export function buildPills() {
    let tabLogin = document.getElementById('tab-login');
    let tabRegister = document.getElementById('tab-register');

    let loginForm = document.getElementById('login');
    let registerForm = document.getElementById('register');

    let loginColor = document.getElementById('loginLi');
    let registerColor = document.getElementById('registerLi');

    let submitLogin = document.getElementById('submitL')

    tabRegister.addEventListener('click', () => {
        if (!loginForm.hidden) {
            loginForm.hidden = true;
            registerForm.hidden = false;
            registerColor.className = "active";
            loginColor.classList.remove("active");
        }
    });

    tabLogin.addEventListener('click', () => {
        if (!registerForm.hidden) {
            registerForm.hidden = true;
            loginForm.hidden = false;
            loginColor.className = "active";
            registerColor.classList.remove("active");
        }
    });

}

export function loginPage(data) {
    return `<div id="div">
    <div id="logout" class="div">
    <form action="logout" method="post">
        <button type="submit" name="buttonLO" class="sizeButton">${data['buttonLO']}</button>
    </form>
    </div>
    <div id="head" class="div">
        <h1 id="header">${data['h1']}</h1>
    </div>
</div>
<div id="content" class="tabSearch">
        <div id="mainSearch">
            <div id="search">
<!--            action="history" method="post"onsubmit="return getFormData()"-->
                <form id="formSearch" class="inline">
                    <!-- City input -->
                    <div id="searchCity">
                        <input type="text" name="location" placeholder="Enter City Name" id="cityName" required>
                    </div>
                    <!-- Country input -->
                    <div id="searchCountry">
                        <input type="text" name="sCountry" placeholder="Enter Country Name" id="countryName" required>
                    </div>
                    <!-- Search Type input -->
                    <div id="searchType">
                    <select name="type" id="searchSelect" required>
                         <option value="" disabled selected>${data['optionS1']}</option>
                         <option value="weather">${data['optionS2']}</option>
                         <option value="airPollution">${data['optionS3']}</option>  
                         <option value="forecast">${data['optionS4']}</option>
                    </select>
<!--                        <input type="text" name="sType" placeholder="Enter your search" id="mySearch" required>-->

                    </div>
                    <!-- Submit button -->
                    <button type="submit" name="submitSearch" id="searchBtn">${data['buttonSearch']}</button>
                </form>
            </div>
        </div>
        </div>
    <div id="searchResult" >
    </div>`;

}

