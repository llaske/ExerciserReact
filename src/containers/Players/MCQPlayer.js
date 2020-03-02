import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { addScoreTime } from '../../store/actions/exercises';
import "../../css/MCQPlayer.css"
import { SUBMIT_QUESTION, NEXT_QUESTION, FINISH_EXERCISE } from "../translation";
import { FormattedMessage } from 'react-intl';
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';
import { PlayerMultimediaJSX } from '../../components/MultimediaJSX';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class MCQPlayer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			id: -1,
			title: '',
			questions: [],
			noOfQuestions: 1,
			currentQuestionNo: 1,
			submitted: false,
			selected: false,
			selectedAns: { type: '', data: '' },
			scores: [],
			times: [],
			currentTime: 0,
			intervalID: -1,
			goBackToEdit: false,
			currentScore: 0,
			finish: false,
			userLanguage: '',
			currentQuestion: {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				options: [],
				correctAns: { type: '', data: '' }
			},
			userAnswers: []
		}
		this.intervalId = setInterval(this.timer, 1000);
	}

	// load the exercise from props
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, questions, scores, times, userLanguage } = this.props.location.state.exercise;

			let updatedQuestions = questions.map((ques) => {
				let updatedOptions = ques.options.map((option) => {
					return setDefaultMedia(option);
				})
				return {
					...ques,
					question: setDefaultMedia(ques.question),
					options: updatedOptions
				}
			})
			const currentQuestion = updatedQuestions[0];

			let finish = false;
			if (questions.length === 1) finish = true;

			let goBackToEdit = false;
			if (this.props.location.state.edit) goBackToEdit = true;

			let options = currentQuestion.options.slice();
			this.shuffleArray(options);

			this.setState({
				...this.state,
				id: id,
				title: title,
				questions: updatedQuestions,
				noOfQuestions: questions.length,
				scores: scores,
				times: times,
				finish: finish,
				goBackToEdit: goBackToEdit,
				userLanguage: userLanguage,
				currentQuestion: {
					id: currentQuestion.id,
					question: currentQuestion.question,
					options: options,
					correctAns: currentQuestion.correctAns
				}
			}, () => {
				if (userLanguage.startsWith('en'))
					meSpeak.loadVoice(require(`mespeak/voices/en/${this.state.userLanguage}.json`));
				else
					meSpeak.loadVoice(require(`mespeak/voices/${this.state.userLanguage}.json`));
			})
		}
	}

	componentWillUnmount() {
		clearInterval(this.intervalId);
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
		}
	}

	choiceSelected = choice => {
		if (!this.state.submitted) {
			this.setState({
				selectedAns: {
					type: choice.type,
					data: choice.data
				},
				selected: true
			})
		}
	};

	// to measure time
	timer = () => {
		this.setState({ currentTime: this.state.currentTime + 1 });
	};

	// submit the exercise ( calculate score and time ) show correct/ wrong ans
	submitQuestion = () => {
		const { currentScore, selectedAns, currentQuestion, userAnswers } = this.state;
		const { correctAns } = currentQuestion;
		let score = currentScore;
		if (selectedAns.data === correctAns.data) score = score + 1;

		let updatedUserAnswers = userAnswers;
		updatedUserAnswers[currentQuestion.id - 1] = {
			question: currentQuestion.question,
			correctAns: currentQuestion.correctAns,
			userAns: selectedAns
		}

		this.setState({
			selected: false,
			submitted: true,
			currentScore: score,
			userAnswers: updatedUserAnswers
		})
	};

	// move to next question
	nextQuestion = () => {
		const { currentQuestionNo, questions } = this.state;
		let nextQuestionNo = currentQuestionNo + 1;
		if (nextQuestionNo > questions.length) {
			this.finishExercise();
		} else {
			const nextQuestion = questions[nextQuestionNo - 1];
			let options = nextQuestion.options;
			this.shuffleArray(options);
			let finish = false;
			if (nextQuestionNo === questions.length) finish = true;
			this.setState({
				...this.state,
				currentQuestionNo: nextQuestionNo,
				submitted: false,
				selected: false,
				selectedAns: { type: '', data: '' },
				finish: finish,
				currentQuestion: {
					id: nextQuestion.id,
					question: nextQuestion.question,
					options: options,
					correctAns: nextQuestion.correctAns
				}
			})
		}

	};

	// redirect to scores screen/ edit screen
	finishExercise = () => {
		const { scores, currentScore, id, currentTime, times, noOfQuestions, goBackToEdit, userAnswers } = this.state;
		let exercise = this.props.location.state.exercise;

		if (goBackToEdit)
			this.props.history.push('/edit/mcq', { exercise: exercise });
		else {
			scores.push(currentScore);
			times.push(currentTime);
			this.props.addScoreTime(id, currentScore, currentTime);
			this.props.history.push('/scores', {
				scores: scores,
				userScore: currentScore,
				times: times,
				userTime: currentTime,
				noOfQuestions: noOfQuestions,
				exercise: exercise,
				userAnswers: userAnswers,
				type: "MCQ",
			});
		}
	};

	speak = (elem, text) => {
		let audioElem = elem;
		let myDataUrl = meSpeak.speak(text, { rawdata: 'data-url' });
		let sound = new Audio(myDataUrl);
		audioElem.classList.remove("button-off");
		audioElem.classList.add("button-on");
		sound.play();
		sound.onended = () => {
			audioElem.classList.remove("button-on");
			audioElem.classList.add("button-off");
		}
	}

	render() {
		const { currentQuestion } = this.state;
		const { showMedia, ShowModalWindow } = this.props;
		const { id } = currentQuestion;
		const questionType = currentQuestion.question.type;
		const questionData = currentQuestion.question.data;

		let choices = currentQuestion.options.map((option, i) => {
			let btn = 'btn-outline-secondary';
			if (this.state.selectedAns.data === option.data) {
				btn = 'btn-selected';
			}
			if (this.state.submitted) {
				if (this.state.selectedAns.data === this.state.currentQuestion.correctAns.data) {
					if (option.data === this.state.selectedAns.data) {
						btn = 'btn-success';
					}
				} else {
					if (option.data === this.state.currentQuestion.correctAns.data) {
						btn = 'btn-success';
					}
					if (this.state.selectedAns.data === option.data) {
						btn = 'btn-danger';
					}
				}
			}
			let optionType = option.type;
			let optionData = option.data;
			return (
				<div className="choices col-md-6" key={`answers-${i}`}>
					<input type="radio"
						className="options-radio"
						checked={option.data === this.state.selectedAns.data}
						onChange={() => {
							this.setState({
								...this.state,
								selectedAns: {
									type: option.type,
									data: option.data
								},
								selected: true
							})
						}}
						disabled={this.state.submitted}
					/>
					<button
						className={"btn choices-but " + btn}
						type="button"
						id={`answer-${i}`}
						onClick={(e) => {
							if (optionType === MULTIMEDIA.textToSpeech) {
								let elem = e.target;
								if (e.target.getAttribute("type") === 'button')
									elem = e.target.children[0];
								this.speak(elem, option.data);
							}
							this.choiceSelected(option)
						}
						}
					>
						<PlayerMultimediaJSX
							questionType={optionType || 'text'}
							questionData={optionData}
							speak={this.speak}
							showMedia={showMedia}
							willSpeak={false}
							className=''
							height='100px'
						/>
					</button>
				</div>
			)
		});

		let buttonText = <FormattedMessage id={SUBMIT_QUESTION} />;
		if (this.state.submitted) {
			buttonText = <FormattedMessage id={NEXT_QUESTION} />;
			if (this.state.finish) buttonText = <FormattedMessage id={FINISH_EXERCISE} />;
		}

		return (
			<div className="container" id={(this.props.inFullscreenMode? "fullScreenMargin" : "mcq-container")} >
				<div className="row align-items-center justify-content-center">
					<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
						<div className={"col-md-12" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
							<div className="jumbotron">
								<p className="lead">{this.state.title}</p>
								<hr className="my-4" />
								<div>
									{id}.
                                    <div style={{ textAlign: "center" }}>
										<PlayerMultimediaJSX
											questionType={questionType || 'text'}
											questionData={questionData}
											speak={this.speak}
											showMedia={showMedia}
											willSpeak={true}
											className=''
											height='100px'
										/>
									</div>
								</div>
							</div>
							<div className="col-md-12">
								{choices}
							</div>
							<div className="d-flex flex-row-reverse">
								<div className="justify-content-end">
									<button
										onClick={() => {
											if (this.state.selected) this.submitQuestion();
											else if (this.state.submitted) this.nextQuestion();
										}}
										className={"btn next-button"}
										disabled={!this.state.selected && !this.state.submitted}
									>
										{buttonText}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ShowModalWindow />
			</div>
		)
	}

}

function MapStateToProps(state) {
	return {}
}

export default withMultimedia(require('../../media/template/mcq_image.svg'))(withRouter(
	connect(MapStateToProps, { addScoreTime })(MCQPlayer)));