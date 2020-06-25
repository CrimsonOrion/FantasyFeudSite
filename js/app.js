var app = {
    version: 1,
    //source: new EventSource('http://localhost:3001/events'),
    source: new EventSource('https://fierce-citadel-94246.herokuapp.com/events'),
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
        "</div>" +
        
        "<!--- Teams --->" +
        "<div class='team'>" +
            "<ul class='teamMembers' id='team1Members'>" +
                "<li id='team1Name'>Team 1</li>" +
            "</ul>" +
        "</div>" +
        "<div class='team'>" +
            "<ul class='teamMembers' id='team2Members'>" +
                "<li id='team2Name'>Team 2</li>" +
            "</ul>" +
        "</div>"
    ),
    data: [],
    cardStates: [0,0,0,0,0,0,0,0],
    strikes: 0,
    team1Name: "Team 1",
    team2Name: "Team 2",
    team1Score: 0,
    team2Score: 0,
    team1Members: [],
    team2Members: [],

    buildBoard() {
        gsap.registerPlugin(TextPlugin);
        let boardScore = this.board.find("#boardScore");
        let team1Score = this.board.find("#team1Score");
        let team2Score = this.board.find("#team2Score");
        let team1Name = this.board.find("#team1Name");
        let team2Name = this.board.find("#team2Name");
        let question = this.board.find(".question");
        let col1 = this.board.find(".col1");
        let col2 = this.board.find(".col2");
        boardScore.html(0);
        team1Score.html(this.team1Score);
        team2Score.html(this.team2Score);
        team1Name.html(this.team1Name);
        team2Name.html(this.team2Name);
        //question.html("Welcome to Fantasy Feud!");
        gsap.to(question, {
            delay: 1,
            duration: 2.5, 
            text: {
                value: "Welcome to Fantasy Feud!"
            }
        });
        col1.empty();
        col2.empty();
        $('#mutedImg').click(this.toggleMuteAll);
        $('body').append(this.board);
    },

    startListener() {
        this.source.addEventListener('message', message => {
            console.clear();
            console.log('Got update');
            
            let messageOrigin = message.origin + '/events';
            if (messageOrigin !== this.source.url) {
                console.log('Invalid updated from ' + message.origin);
                return;
            }

            if (message.data !== "[]") {
                this.data = JSON.parse(message.data);
                
                if (this.data.length > 1) {
                    this.data = this.data[this.data.length - 1];
                }
                
                app.updateBoardRotate();
            }
        });
    },

    updateBoardRotate() {
        gsap.config({
            nullTargetWarn: false
        });
        let boardScore = $("#boardScore");
        let team1Score = $("#team1Score");
        let team2Score = $("#team2Score");
        let team1Name = $("#team1Name");
        let team2Name = $("#team2Name");
        let team1Members = $("#team1Members");
        let team2Members = $("#team2Members");
        let question = $(".question");
        let col1 = $(".col1");
        let col2 = $(".col2");
        col1.empty();
        col2.empty();
        team1Members.empty();
        team2Members.empty();
        team1Score.html(this.data.Team1Score);
        team2Score.html(this.data.Team2Score);
        team1Name.html(this.data.Team1Name);
        team2Name.html(this.data.Team2Name);
        team1Members.append(team1Name);
        team2Members.append(team2Name);
        app.insertTeamMembers(team1Members, this.data.Team1Members);
        app.insertTeamMembers(team2Members, this.data.Team2Members);
        question.html(this.data.Question);//.replace(/&x22;/gi,'"'));
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

            let flipped = this.cardStates[i] === 1 ? true : false;
            $(cardHolderDiv).appendTo(parentDiv);

            if (visible && !flipped) {
                let cardRotate = -180;
                gsap.to(cards, 1, {rotationX:cardRotate, ease:backs.easeOut});
                this.cardStates[i] = 1;
                let sound = $('#sound');
                let src = 'media/Moogles_Answer_Right.mp3';
                sound.attr('src', src);
                app.playBuzzer();
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
        if (this.strikes < this.data.Strikes) {
            app.wrongAnswer();
        } else if (this.data.Strikes < this.strikes) {
            this.strikes = this.data.Strikes;
            $('.strikes').empty();
        }
    },

    insertTeamMembers(teamMembersUL, teamMembers) {
        for (let i = 0; i < teamMembers.length; i++) {
            let member = teamMembers[i];
            let memberNameLI = "<li" + (member.Active === 1 ? " id='active'>" : ">") + member.Name + "</li>";
            teamMembersUL.append(memberNameLI);
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
            "</div>"
        );

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
        let src;
        switch (++this.strikes){
            case 1:
            case 2:
            case 3:
                src = 'media/Nope.mp3'
                break;
            case 4:
                src = 'media/Illberd-Sloppy.mp3'
                break;
            default:
                console.log('switch statement didn\'t work.')
                break;
        }
        let sound = $('#sound');
        sound.attr('src', src);
        var strikeSpan = $('<span class="strikex">X</span>');
        var strikeDiv = $('.strikes');
        strikeDiv.append(strikeSpan);
        app.playBuzzer();
        gsap.to(".strikes", {duration: 1, opacity: 100});
        gsap.to(".strikes", {duration: 1, opacity: 0, ease:"power2.inOut"});
    },

    playBuzzer() {
        let x = document.getElementById('sound').play();

        if (x !== undefined) {
            x.then(_ => {
                console.log("Success! Music is playing!")
                //autoplay started!
            }).catch(error => {
                console.log(error);
                // autoplay was prevented
            })
        }
        //x.muted = true;
        //x.play();
    },

    toggleMuteAll() {
        let audio = $('audio');
        let muted = audio[0].muted;
        audio.each( elem => app.toggleMute(audio[elem], muted));
        let muteButtonImg = !muted ? "img/muted.png" : "img/unmuted.png";
        $('#mutedImg').attr("src", muteButtonImg);
    },

    toggleMute(elem, muted) {
        elem.muted = !muted;
        console.log(`${elem.id}.muted = ${elem.muted}`);
    },
    
    // Startup
    init(){
        app.buildBoard();
        app.startListener();
    }
}
app.init();