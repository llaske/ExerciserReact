import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { addScoreTime } from '../../store/actions/exercises';
import "../../css/FreeTextInputPlayer.css";
import { FINISH_EXERCISE, SUBMIT_QUESTION } from "../translation";
import { FormattedMessage } from 'react-intl';
import withMultimedia from '../../components/WithMultimedia';
import { PlayerMultimediaJSX } from '../../components/MultimediaJSX';
import meSpeak from 'mespeak';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class FreeTextInputPlayer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			id: -1,
			title: '',
			questions: [],
			userans: [],
			noOfQuestions: 1,
			submitted: false,
			scores: [],
			times: [],
			currentScore: 0,
			currentTime: 0,
			intervalID: -1,
			goBackToEdit: false,
			checkans: [],
			userLanguage: '',
			userAnswers: '',
			attempted: false
		}
		this.intervalId = setInterval(this.timer, 1000);
	}

	// load the exercise from props
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, questions, scores, times, userLanguage } = this.props.location.state.exercise;

			let goBackToEdit = false;
			if (this.props.location.state.edit) goBackToEdit = true;

			let { userans } = this.state;
			userans = questions.map((quest, index) => {
				return "_____________";
			});

			let updatedQuestions = questions.map((ques) => {
				return {
					...ques,
					question: setDefaultMedia(ques.question)
				}
			})

			this.setState({
				...this.state,
				id: id,
				title: title,
				questions: updatedQuestions,
				noOfQuestions: questions.length,
				userans: userans,
				scores: scores,
				times: times,
				goBackToEdit: goBackToEdit,
				userLanguage: userLanguage
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

	// to measure time
	timer = () => {
		this.setState({ currentTime: this.state.currentTime + 1 });
	};

	// submit the exercise ( calculate score and time ) show correct/ wrong ans
	submitExercise = () => {
		const { questions, userans } = this.state;
		let checkans = [];
		let score = 0;
		questions.forEach(function (question, index) {
			if (question.answer.toLowerCase() === userans[question.id - 1].toLowerCase()) {
				score += 1;
				checkans.push(true);
			} else {
				checkans.push(false);
			}

		});

		let updatedUserAnswers = questions.map((question, index) => {
			return {
				question: question.question,
				correctAns: { type: 'text', data: question.answer },
				userAns: { type: 'text', data: userans[index] }
			}
		})

		this.setState({
			submitted: true,
			currentScore: score,
			checkans: checkans,
			userAnswers: updatedUserAnswers
		})
	};

	// redirect to scores screen/ edit screen
	finishExercise = () => {
		const { scores, currentScore, id, currentTime, times, noOfQuestions, goBackToEdit, userAnswers } = this.state;
		let exercise = this.props.location.state.exercise;

		if (goBackToEdit)
			this.props.history.push('/edit/freeText', { exercise: exercise });
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
				type: "FREE_TEXT_INPUT"
			});
		}
	};

	handleChangeAns(e) {
		let answerId = e.target.id;
		answerId = answerId.substring(answerId.indexOf('-') + 1, answerId.length);

		let { userans } = this.state;
		userans[answerId - 1] = e.target.value;
		this.setState({
			...this.state,
			userans: userans,
			attempted: true
		});
	}

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
		const { questions } = this.state;
		const { showMedia, ShowModalWindow } = this.props;
		let buttonText = <FormattedMessage id={SUBMIT_QUESTION} />;
		if (this.state.submitted) buttonText = <FormattedMessage id={FINISH_EXERCISE} />

		let freeTextQuestions = questions.map((currentQuestion, index) => {
			let questionType = currentQuestion.question.type;
			if (this.state.submitted) {
				let ans = 'wrong';
				if (this.state.checkans[index]) ans = 'right';
				return (
					<div className="col-md-3 questions" key={index + 1}>
						<div className="freetext-question-container"
							style={{ minHeight: `${(questionType === MULTIMEDIA.image || questionType === MULTIMEDIA.video) ? '80px' : ''}` }}
						>
							{index + 1}.
                            <PlayerMultimediaJSX
								questionType={questionType}
								questionData={currentQuestion.question.data}
								speak={this.speak}
								showMedia={showMedia}
								willSpeak={true}
								className={'matching-questions'}
							/>
						</div>
						<div className={"freetext-div checked-ans " + ans}>
							{this.state.userans[index]}
						</div>
					</div>
				)
			} else {
				return (
					<div className="col-md-3 questions" key={index + 1}>
						<div className="freetext-question-container"
							style={{ minHeight: `${(questionType === MULTIMEDIA.image || questionType === MULTIMEDIA.video) ? '80px' : ''}` }}
						>
							{index + 1}.
                            <PlayerMultimediaJSX
								questionType={questionType}
								questionData={currentQuestion.question.data}
								speak={this.speak}
								showMedia={showMedia}
								willSpeak={true}
								className={'matching-questions'}
							/>
						</div>
						<input
							className="input-freeText"
							type="text"
							id={`answer-${index + 1}`}
							onChange={this.handleChangeAns.bind(this)
							}
						/>
					</div>
				);
			}
		});

		return (
			<div className={"container" + (this.props.inFullscreenMode? " fullScreenMargin" : "")} id="freeText-container" >
				<div className="row align-items-center justify-content-center">
					<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
						<div className={"col-md-12" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
							<div className="jumbotron">
								<p className="lead">{this.state.title}</p>
								<hr className="my-4" />
								<div className="row align-items-center justify-content-center">
									{freeTextQuestions}
								</div>
							</div>
							<div className="d-flex flex-row-reverse">
								<div className="justify-content-end">
									<button
										onClick={() => {
											if (this.state.submitted) this.finishExercise();
											else this.submitExercise();
										}}
										className={"btn next-button"}
										disabled={!this.state.attempted && !this.state.submitted}
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
		);
	}

}

function MapStateToProps(state) {
	return {}
}

export default withMultimedia(require('../../media/template/freetext_input_image.svg'))(withRouter(
	connect(MapStateToProps, { addScoreTime })(FreeTextInputPlayer)));