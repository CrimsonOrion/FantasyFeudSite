class card {
    constructor(answers) {
        this.answer = answers.Answer;
        this.value = answers.Value;
        this.visible = answers.Visible;
    }
}
const _card = card;
export { _card as card };