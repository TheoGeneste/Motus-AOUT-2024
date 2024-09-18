document.addEventListener('DOMContentLoaded', async () => {
    const startButton = document.getElementById('start');
    const grid = document.getElementById('grid');
    const defaultTryNumber = 6;
    let randomWord = "";

    const letters = document.getElementsByClassName('btn-letter');
    let indexRow = 0;
    let indexColumn = 1;
    const enterButton = document.getElementById('enter');
    const backspaceButton = document.getElementById('backspace');
    let goodLetters = [];

    backspaceButton.addEventListener('click', () => {
        deleteLetter();
    })

    startButton.addEventListener('click', () => {
        play();
        startButton.style.display = "none";
    })

    enterButton.addEventListener('click', () => {
        submitResponse();
    })

    async function play() {
        for (let index = 0; index < letters.length; index++) {
            letters[index].className = "btn-letter";

        }
        randomWord = await fetch("https://trouve-mot.fr/api/random")
            .then((response) => response.json())
            .then((words) => words[0].name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());
        console.log(randomWord);
        goodLetters = [];
        grid.innerHTML = '';
        for (let index = 0; index < defaultTryNumber; index++) {
            let tr = document.createElement('tr');
            grid.appendChild(tr);
            for (let i = 0; i < randomWord.length; i++) {
                let td = document.createElement('td');
                if (i == 0) {
                    td.textContent = randomWord[i];
                } else {
                    td.textContent = "-";
                }
                tr.appendChild(td);
            }
        }
        grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.add('cursor');
    }

    for (let index = 0; index < letters.length; index++) {
        letters[index].addEventListener('click', () => {
            addLetter(letters[index].innerText)
        })
    }

    function addLetter(letter) {
        if (indexColumn < randomWord.length) {
            grid.getElementsByTagName('tr')[indexRow].children[indexColumn].innerText = letter;
            // grid.getElementsByTagName('tr')[indexRow].getElementsByTagName('td')[indexColumn].innerText = letters[index].innerText;
            grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.remove('cursor');
            indexColumn++;
            if (indexColumn != randomWord.length) {
                grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.add('cursor');
            }
            // indexColumn = indexColumn +1;
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key.match(/[a-z]/) && e.key.length == 1) {
            addLetter(e.key.toUpperCase())
        } else if (e.key == "Enter") {
            submitResponse();
        } else if (e.key == "Backspace") {
            deleteLetter();
        }
    })

    function deleteLetter() {
        if (indexColumn > 0) {
            if (indexColumn != randomWord.length) {
                grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.remove('cursor');
            }
            indexColumn--;
            grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.add('cursor');
            grid.getElementsByTagName('tr')[indexRow].children[indexColumn].innerText = "-";

        }
    }

    function submitResponse() {
        if (indexColumn == randomWord.length) {
            let wordGrid = grid.getElementsByTagName('tr')[indexRow].children;
            let nextWordGrid = [];
            if (indexRow < defaultTryNumber - 1) {
                nextWordGrid = grid.getElementsByTagName('tr')[indexRow + 1].children;
            }
            let wordSplit = randomWord.toUpperCase().split("");
            let numberIterationOfLetter = {};
            wordSplit.forEach(element => {
                if (numberIterationOfLetter[element]) {
                    numberIterationOfLetter[element] += 1;
                } else {
                    numberIterationOfLetter[element] = 1;
                }
            });

            let countGoodLetter = 0;
            for (let index = 0; index < wordGrid.length; index++) {
                let buttonLetter = document.querySelectorAll("[data-letter='" + wordGrid[index].innerText.toUpperCase() + "']");
                if (wordGrid[index].innerText.toUpperCase() == wordSplit[index].toUpperCase()) {
                    if (numberIterationOfLetter[wordGrid[index].innerText.toUpperCase()] > 0) {
                        wordGrid[index].classList.add('good-place');
                        buttonLetter[0].classList.add('good-place');
                    }
                    goodLetters[index] = wordGrid[index].innerText;
                    numberIterationOfLetter[wordGrid[index].innerText.toUpperCase()] -= 1;
                    countGoodLetter++;
                }
            }
            for (let index = 0; index < wordGrid.length; index++) {
                let buttonLetter = document.querySelectorAll("[data-letter='" + wordGrid[index].innerText.toUpperCase() + "']");
                if (wordSplit.includes(wordGrid[index].innerText.toUpperCase())) {
                    if (numberIterationOfLetter[wordGrid[index].innerText.toUpperCase()] > 0) {
                        wordGrid[index].classList.add('bad-place');
                        buttonLetter[0].classList.add('bad-place');
                    }else{
                        if (!wordGrid[index].classList.contains('good-place') && !wordGrid[index].classList.contains('bad-place')) {
                            wordGrid[index].classList.add('no-place');
                            buttonLetter[0].classList.add('no-place');
                        }
                    }
                    numberIterationOfLetter[wordGrid[index].innerText.toUpperCase()] -= 1;
                } else {
                    wordGrid[index].classList.add('no-place');
                    buttonLetter[0].classList.add('no-place');
                }
            }
            console.log(numberIterationOfLetter);
            
            setTimeout(() => {
                if (countGoodLetter == randomWord.length) {
                    alert('Victoire !!!')
                    indexColumn = 1;
                    indexRow = 0;
                    play();
                } else if (indexRow + 1 == defaultTryNumber) {
                    alert('Vous avez perdu le mot était : ' + randomWord);
                    indexColumn = 1;
                    indexRow = 0;
                    play();
                } else {
                    for (let index = 0; index < goodLetters.length; index++) {
                        if (goodLetters[index] != undefined) {
                            nextWordGrid[index].innerText = goodLetters[index];
                        }
                    }

                    grid.getElementsByTagName('tr')[indexRow].children[indexColumn - 1].classList.remove('cursor');


                    indexColumn = 1;
                    indexRow++;
                    grid.getElementsByTagName('tr')[indexRow].children[indexColumn].classList.add('cursor');
                }
            }, 50)



        } else {
            alert("Le mot n'est pas complet");
        }
    }

})