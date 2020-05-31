var app = {
    version: 1,
    source: new EventSource('http://localhost:3001/events'),
    board: $(""+
        "<!--- Strikes --->"+
        "<div class='strikes'></div>"+

        "<!--- Game Board --->" +
        "<div class='gameBoard'>" +
                
            "<!--- Scores --->"+
            "<div class='score' id='boardScore'></div>" +
            "<div class='score' id='team1Score'></div>" +
            "<div class='score' id='team2Score'></div>" +
            
            "<!--- Question --->" +
            "<div class='questionHolder'>" +
                "<span class='question'></span>" +
            "</div>" +
                
            "<!--- Answers --->" +
            "<div class='colHolder'>" +
                "<div class='col1'></div>" +
                "<div class='col2'></div>" +
            "</div>" +
        "</div>"+
        "<audio id='sound' src='media/Illberd- Sloppy.mp3' muted='muted'></audio>"
    ),
    data: [],
    cardStates: [0,0,0,0,0,0,0,0],
    strikes: 0,
    team1Name: "",
    team2Name: "",
    team1Score: 0,
    team2Score: 0,

    buildBoard() {
        let boardScore = this.board.find("#boardScore");
        let team1 = this.board.find("#team1Score");
        let team2 = this.board.find("#team2Score");
        let question = this.board.find(".question");
        let col1 = this.board.find(".col1");
        let col2 = this.board.find(".col2");
        boardScore.html(0);
        team1.html(this.team1Score);
        team2.html(this.team2Score);
        question.html("WELCOME!");
        col1.empty();
        col2.empty();
        $('body').append(this.board);
    },

    startListener() {
        this.source.addEventListener('message', message => {
            console.clear();
            console.log('Got', message);
            if (message.data !== "[]") {
                this.data = JSON.parse(message.data);
                
                if (message.data.includes("[")) {
                    this.data = this.data[this.data.length - 1];
                }
                
                //app.updateBoard();
                app.updateBoardRotate();
            }
        });
    },

    updateBoardRotate() {
        gsap.config({
            nullTargetWarn: false
        });
        let boardScore = $("#boardScore");
        let team1 = $("#team1Score");
        let team2 = $("#team2Score");
        let question = $(".question");
        let col1 = $(".col1");
        let col2 = $(".col2");
        col1.empty();
        col2.empty();

        team1.html(this.data.Team1Score);
        team2.html(this.data.Team2Score);
        question.html(this.data.Question.replace(/&x22;/gi,'"'));
        let boardScoreValue = 0;
        let visible = false;
        for (let i = 0; i < 8; i++) {
            let cardHolderDiv;
            if (this.data.Responses > i) {
                let pic = i + 1;
                let c = this.data.Answers[i];
                visible = c.Visible === 1 ? true : false;
                cardHolderDiv = app.cardHolderFill(c, pic);
                boardScoreValue += visible ? c.Value : 0;
            }
            else {
                cardHolderDiv = app.cardHolderBlank();
            }
            let parentDiv = (i < 4) ? col1 : col2;
            let cardHolders = cardHolderDiv.find('.cardHolder')
            let cards       = cardHolderDiv.find('.card')
            let backs       = cardHolderDiv.find('.back')
            let cardSides   = cardHolderDiv.find('.card>div')

            gsap.set(cardHolders , {perspective:800});
            gsap.set(cards       , {transformStyle:"preserve-3d"});
            gsap.set(backs       , {rotationX:this.cardStates[i] === 1 ? 0 : 180});
            gsap.set(cardSides   , {backfaceVisibility:"hidden"});

            // TESTING
            let flipped = this.cardStates[i] === 1 ? true : false;
            $(cardHolderDiv).appendTo(parentDiv);

            if (visible && flipped == false) {
                let cardRotate = -180;
                gsap.to(cards, 1, {rotationX:cardRotate, ease:backs.easeOut});
                this.cardStates[i] = 1;
                flipped = true;
            }
            else if (!visible && flipped) {
                let cardRotate = 180;
                gsap.to(cards, 1, {rotationX:cardRotate, ease:backs.easeOut});
                this.cardStates[i] = 0;
                flipped = false;
            }
            $(cards).data("flipped", flipped);
            boardScore.html(boardScoreValue);
        }

        let dataStrikes = this.data.Strikes;
        if (this.strikes < dataStrikes) {
            app.wrongAnswer();
        }
    },
    
    cardHolderFill(data, picNum) {
        let cardHolderDiv = $("" + 
        "<div class='cardHolder'>"+
            "<div class='card' style=\"background: url(img/0" + picNum + ".png)\">"+
                "<div class='front'>"+
            
                "</div>"+
                "<div class='back DBG'>"+
                    "<span>"+data.Answer+"</span>"+
                    "<b class='LBG'>"+data.Value+"</b>"+
                "</div>"+
            "</div>"+
        "</div>");

        return cardHolderDiv;
    },

    cardHolderBlank() {
        let cardHolderDiv = $("" +
            "<div class='cardHolder empty'>" + 
                "<div>" +
                "</div>" +
            "</div>"
        );
        return cardHolderDiv;
    },

    wrongAnswer() {
        if (this.strikes < 3) {
            this.strikes++;
            var strikeSpan = $('<span class="strikex">X</span>');
            var strikeDiv = $('.strikes');
            strikeDiv.append(strikeSpan);
            app.playBuzzer();// <- This is the sound effect when I get it working.
            gsap.to(".strikes", {duration: 1, opacity: 100});
            gsap.to(".strikes", {duration: 1, opacity: 0, ease:"power2.inOut"});
        }
    },

    playBuzzer() {
        let x = document.getElementById('sound');
        //x.muted = true;
        x.play();
    },
    
    // Startup
    init(){
        app.buildBoard();
        app.startListener();
    }
}
app.init();