document.addEventListener('DOMContentLoaded', () => {
    //Start with cards all showing question mark image & board unlocked so it can be clicked. Set the variables for first and second cards flipped to use in the match check.
    var flippedCard = false;
    var lockBoard = false;
    var firstFlip, secondFlip;

    //Set variables for counting the moves, which are each pair of cards flipped.
    var moveCounts = 0;
    var getCurrentMoves = document.querySelector("#moves_counter");

    //Set game timer variables
    var second = 0;
    var interval;

    var jsonCards;

    // Get the cards.txt file and convert it to JSON. The cardsTXT defined in the index.html is used here as a variable.
    function getCards() {
        fetch(cardsTXT) //This variable is defined in the block script in index.html because I cannot access it using the static Django variable within the JavaScript but can if it is universally defined prior.
            .then((response) => response.text())  //Using text rather than JSON because it is a text file being grabbed and converte to JSON.
            .then((gameCards) => {
                //Creating the lines for each match, and defining the headers.
                let cardLines = gameCards.split("\r\n");
                let cardHeaders = cardLines[0].split("\t");

                var allCards = []; //Creating an empty array.

                //For each of the matches in cardLines (should be 10), create an object that splits the line by tab, and then uses the header as the key and the corresponding input as the value.
                for (let i = 1; i < cardLines.length - 1; i++) {

                    let obj = {};
                    let currentline = cardLines[i].split("\t");

                    for (let j = 0; j < cardHeaders.length; j++) {
                        obj[cardHeaders[j]] = currentline[j];
                    }

                    allCards.push(obj); //Push all of the created objects to the allCards variable created in index.html, which will be used as the JSON.

                }
                buildGameBoard(allCards); //Pass the new JSON to build the game board.
            });
    }

    function buildGameBoard(allCards) {
        var eachCardDiv = document.getElementsByClassName("each_card"); //Create the variable for grabbing the each_card divs.
        var gameBoardSection = document.getElementById("game_board"); //Create the variable for getting the game_board section.

        jsonCards = allCards;

        //Create a containing div for each card and a div that contains the card content for each card, and append them to the game board.
        for (h = 0; h < allCards.length; h++) {
            //Though they are very similar, A and B versions are needed because of the class lists and data-keys.
            let createCardA = document.createElement("div");
            let createCardADiv = document.createElement("div");

            let createCardB = document.createElement("div");
            let createCardBDiv = document.createElement("div");

            createCardA.classList.add("each_card");
            createCardA.setAttribute("data-id", allCards[h].id);
            createCardADiv.classList.add("card");
            createCardADiv.classList.add("carda");
            createCardADiv.classList.add("cardIdentity");
            createCardADiv.setAttribute("data-key", "carda");

            createCardB.classList.add("each_card");
            createCardB.setAttribute("data-id", allCards[h].id);
            createCardBDiv.classList.add("card");
            createCardBDiv.classList.add("cardb");
            createCardBDiv.classList.add("cardIdentity");
            createCardBDiv.setAttribute("data-key", "cardb");

            gameBoardSection.appendChild(createCardA);
            createCardA.appendChild(createCardADiv);

            gameBoardSection.appendChild(createCardB);
            createCardB.appendChild(createCardBDiv);
        }

        //Add the text from the JSON to the cards by targeting the matching ID and whether it has been designated as carda or cardb.
        for (let i = 0; i < allCards.length; i++) {
            let currentCardId = allCards[i].id;
            let cardaDiv = document.querySelector('[data-id = ' + CSS.escape(currentCardId) + '] > [data-key = "carda"]');
            let cardbDiv = document.querySelector('[data-id = ' + CSS.escape(currentCardId) + '] > [data-key = "cardb"]');

            cardaDiv.innerHTML = allCards[i].carda;
            cardbDiv.innerHTML = allCards[i].cardb;
        }

        //Create the card back image for each card.
        for (j = 0; j < eachCardDiv.length; j++) {
            let cardBack = document.createElement("img");
            cardBack.classList.add("card_back");
            cardBack.setAttribute("src", cardBackImg);
            cardBack.setAttribute("alt", "Card Back");
            eachCardDiv[j].appendChild(cardBack);
        }

        setGameBoard(); //After cards are built, they can be shuffled and given an event listener.
    }

    // Shuffle the cards using the random generator to make the game different each time, and apply an event listener to each card.
    function setGameBoard() {
        var builtCards = document.querySelectorAll('.each_card'); //Get each card.

        //For each card apply a randomly generated number.
        builtCards.forEach(card => {
            var cardOrder = Math.floor(Math.random() * 20); //Set to 20 cards but potentially could be different if number of matches changed though not ideal for the design/purpose I've defined.
            card.style.order = cardOrder;
        });

        builtCards.forEach(card => card.addEventListener("click", cardFlip)); //Add listener for each card to see when it is clicked.

    }

    function cardFlip() {
        if (lockBoard) return;

        //Add the class for flipping the card to the first card clicked, and prevent the same card from being clicked twice for false match.
        if (this === firstFlip) return;

        this.classList.toggle("flip");

        //If no cards are flipped, apply "this" to the firstFlip variable and flip it.
        if (!flippedCard) {
            flippedCard = true;
            firstFlip = this;
            return;
        }

        //Apply "this" to the second card flipped and lock board until cards are evaluated for a match.
        secondFlip = this;
        lockBoard = true;

        matchAttempts(); //Add one "move" for every match set attempt.
        cardMatch(); //Check if the flipped cards match.
    }

    function cardMatch() {
        let cardsMatch = firstFlip.dataset.id === secondFlip.dataset.id; //Check if the data-id matches between the two, which is the ID from the JSON.

        //If the cards match, keep the text showing, and add a class of "match," which is used to determine when the game is won; otherwise flip them back.
        if (cardsMatch) {
            matchedCards();
        } else {
            returnCards();
        }
    }

    //If the cards match, leave with text showing and remove event listener. Add class of match to help determine end of game.
    function matchedCards() {
        let firstInnerCard = firstFlip.querySelector(".cardIdentity");
        let secondInnerCard = secondFlip.querySelector(".cardIdentity");
        let getCardId = firstFlip.getAttribute("data-id"); //This provides the card ID from the div container, which will be used with -1 to get the feedback from the correct JSON object.
        let checkMatches = document.getElementsByClassName("match");
        let feedbackModal = new bootstrap.Modal(document.getElementById("feedback_modal")); //This targets the modal to show it with the feedback.
        let feedbackContent = document.querySelector(".match_feedback"); //Grab the p tag where the feedback should go.

        firstFlip.classList.add("match");
        firstInnerCard.classList.add("matchedcard");
        secondFlip.classList.add("match");
        secondInnerCard.classList.add("matchedcard");
        firstFlip.removeEventListener("click", cardFlip);
        secondFlip.removeEventListener("click", cardFlip);

        feedbackContent.innerHTML = jsonCards[getCardId - 1].feedback; //Add the feedback from the p tag.
        feedbackModal.show(); //Display the feedback modal.

        //Check for 20 matches indicating the game has been won.
        if (checkMatches.length == 20) {
            //If 20 cards have the match class, show the winner message.
            let finalMoves = document.getElementById("moves_counter").innerHTML;
            let finalTime = document.getElementById("seconds_only").innerHTML;
            let profile_name = document.getElementById("profile_link").innerHTML
            const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

            //Stop the game timer.
            clearInterval(interval);

            //Put the game's moves and time to the gamewon view, and display a message that the user won.
            fetch(`profile/${profile_name}/win`, {
                method: 'PUT',
                body: JSON.stringify({
                    gameMoves: finalMoves,
                    gameTime: finalTime
                }),
                headers: {
                    "X-CSRFToken": token
                }
            })
                .then(() => {
                    let winMessage = document.getElementById("winner");
                    let playAgainButton = document.getElementById("playagain");
                    winMessage.style.display = "block";
                    playAgainButton.setAttribute("style", "display: inline;")
                    console.log("success");
                });

        } else {
            nextFlips();
        }
    }

    //If cards do not match, flip back over by removing flip class.
    function returnCards() {
        setTimeout(() => {
            firstFlip.classList.remove("flip");
            secondFlip.classList.remove("flip");

            nextFlips();
        }, 1200);
    }

    //Except for matched cards reset variables for cards, and unlock board. Set first and second cards to null since none have been selected.
    function nextFlips() {
        flippedCard = false;
        lockBoard = false;
        firstFlip = null;
        secondFlip = null;
    }

    //Add a move for each match attempt and update the moves counter on the game board.
    function matchAttempts() {
        moveCounts++;
        getCurrentMoves.innerHTML = moveCounts;

        //Reset for timer to start on first move
        if (moveCounts == 1) {
            second = 1;

            gameTime();
        }
    }

    //Track the time for the game and pass the values to the game board - once as a formatted and once hidden as just seconds for database. 
    function gameTime() {
        let lapsedGameTime = document.querySelector("#played_time");
        let secondsOnly = document.querySelector("#seconds_only");
        interval = setInterval(function () {
            second++;
            lapsedGameTime.innerHTML = new Date(second * 1000).toISOString().substr(11, 8);
            secondsOnly.innerHTML = second;
        }, 1000);
    }

    // On onload initiate text fetch and conversion.
    window.onload = getCards;
})

//Play Again game button. This is outside the DOM element because it is used after game play to reset the game.
function playAgain() {
    window.location.reload();
}