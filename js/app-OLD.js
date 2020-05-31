var app = {
    version: 1,
    server: 'http://localhost:3001/events',
    board: $(
        "<div class='gameBoard'>" +

        "<!--- Scores --->" +
        "<div class='score' id='boardScore'>0</div>" +
        "<div class='score' id='team1' >0</div>" +
        "<div class='score' id='team2' >0</div>" +

        "<!--- Question --->" +
        "<div class='questionHolder'>" +
        "<span class='question'></span>" +
        "</div>" +

        "<!--- Answers --->" +
        "<div class='colHolder'>" +
            "<div class='col1'></div>" +
            "<div class='col2'></div>" +
        "</div>"
    ),
    // Utility functions
    jsonLoaded: function (data) {
        console.clear();
        app.allData = data;
        app.question = data.Question;
        app.makeQuestion(app.question);
        $('body').append(app.board);
    },
    // Action functions
    makeQuestion: function (q) {
        var qText = q;
        var qAnswers = app.allData.Answers;
        var qNum = qAnswers.length;
        qNum = (qNum > 8) ? 8 : qNum;
        qNum = (qNum % 2 !== 0) ? qNum + 1 : qNum;

        var boardScore = app.board.find("#boardScore");
        var question = app.board.find(".question");
        var col1 = app.board.find(".col1");
        var col2 = app.board.find(".col2");

        boardScore.html(0);
        question.html(qText);
        col1.empty();
        col2.empty();

        for (var i = 0; i < qNum; i++) {
            var aLI;
            var pic = i + 1;
            if (qAnswers[i]) {
                aLI = $("<div class='cardHolder'>" +
                    "<div class='card' style=\"background: url(./0" + pic + ".png);\">" +
                    "<div class='front'>" +

                    "</div>" +
                    "<div class='back DBG'>" +
                    "<span>" + qAnswr[i][0] + "</span>" +
                    "<b class='LBG'>" + qAnswr[i][1] + "</b>" +
                    "</div>" +
                    "</div>" +
                    "</div>")
            } else {
                aLI = $("<div class='cardHolder empty'><div></div></div>");
            }
            var parentDiv = (i < (qNum / 2)) ? col1 : col2;
            $(aLI).appendTo(parentDiv);
        }

        var cardHolders = app.board.find('.cardHolder');
        var cards = app.board.find('.card');
        var backs = app.board.find('.back');
        var cardSides = app.board.find('.card>div');

        TweenLite.set(cardHolders, { perspective: 800 });
        TweenLite.set(cards, { transformStyle: "preserve-3d" });
        TweenLite.set(backs, { rotationX: 180 });
        TweenLite.set(cardSides, { backfaceVisibility: "hidden" });

        cards.data("flipped", false);

        function showCard() {
            var card = $('.card', this);
            var flipped = $(card).data("flipped");
            var cardRotate = (flipped) ? 0 : -180;
            TweenLite.to(card, 1, { rotationX: cardRotate, ease: Back.easeOut });
            flipped = !flipped;
            $(card).data("flipped", flipped);
            app.getBoardScore();
        };
        cardHolders.on('click', showCard);
    },
    getBoardScore: function () {
        var cards = app.board.find('.card');
        var boardScore = app.board.find('#boardScore');
        var currentScore = { var: boardScore.html() };
        var score = 0;
        function tallyScore() {
            if ($(this).data("flipped")) {
                var value = $(this).find("b").html();
                score += parseInt(value);
            }
        };
        $.each(cards, tallyScore);
        TweenMax.to(currentScore, 1, {
            var: score,
            onUpdate: function () {
                boardScore.html(Math.round(currentScore.var));
            },
            ease: Power3.easeOut,
        });
    },
    awardPoints: function (num) {
        var num = $(this).attr("data-team");
        var boardScore = app.board.find('#boardScore');
        var currentScore = { var: parseInt(boardScore.html()) };
        var team = app.board.find("#team" + num);
        var teamScore = { var: parseInt(team.html()) };
        var teamScoreUpdated = (teamScore.var + currentScore.var);
        TweenMax.to(teamScore, 1, {
            var: teamScoreUpdated,
            onUpdate: function () {
                team.html(Math.round(teamScore.var));
            },
            ease: Power3.easeOut,
        });

        TweenMax.to(currentScore, 1, {
            var: 0,
            onUpdate: function () {
                boardScore.html(Math.round(currentScore.var));
            },
            ease: Power3.easeOut,
        });
    },
    // Initial function
    init: function () {
        $.getJSON(app.server, app.jsonLoaded);
    }
}
app.init();