import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { addScoreTime } from '../../store/actions/exercises';
import "../../css/GroupAssignmentPlayer.css"
import { SUBMIT_QUESTION, NEXT_QUESTION, FINISH_EXERCISE } from "../translation";
import { FormattedMessage } from 'react-intl';
import meSpeak from 'mespeak';
import interact from 'interactjs'
import withMultimedia from '../../components/WithMultimedia';
import { PlayerMultimediaJSX } from '../../components/MultimediaJSX';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class GroupAssignmentPlayer extends Component {

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
			groups: [],
			currentQuestion: {
				id: 1,
				question: { type: '', data: '' },
				answer: { type: '', data: '' },
			},
			userLanguage: '',
			userans: [],
			userAnswers: []
		}
		this.colors = ["#d3f6f3", "#f9fce1", "#fee9b2", "#fbd1b7"];
		this.intervalId = setInterval(this.timer, 1000);
	}

	// load the exercise from props
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, questions, scores, times, groups, userLanguage } = this.props.location.state.exercise;

			let updatedQuestions = questions.map((ques) => {
				return {
					...ques,
					question: setDefaultMedia(ques.question),
					answer: setDefaultMedia(ques.answer)
				}
			});
			let updatedGroups = groups.map((group) => {
				return setDefaultMedia(group);
			})

			const currentQuestion = updatedQuestions[0];
			let finish = false;
			if (questions.length === 1) finish = true;

			let goBackToEdit = false;
			if (this.props.location.state.edit) goBackToEdit = true;


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
				groups: updatedGroups,
				userLanguage: userLanguage,
				currentQuestion: currentQuestion,
			}, () => {
				this.initDragDrop();
				if (userLanguage.startsWith('en'))
					meSpeak.loadVoice(require(`mespeak/voices/en/${this.state.userLanguage}.json`));
				else
					meSpeak.loadVoice(require(`mespeak/voices/${this.state.userLanguage}.json`));
			})
		}
	}

	initDragDrop = () => {
		interact('.group-options').dropzone({
			// only accept elements matching this CSS selector
			accept: '#question-drag',
			// Require a 75% element overlap for a drop to be possible
			overlap: 0.52,

			// listen for drop related events:
			ondragenter: (event) => {
				var dropzoneElement = event.target;
				dropzoneElement.classList.add("selected");
			},

			ondragleave: (event) => {
				// remove the drop feedback style
				var dropzoneElement = event.target;
				dropzoneElement.classList.remove("selected");
			},
			ondrop: (event) => {
				var dropzoneElement = event.target.id;
				let index = dropzoneElement.split('-').pop();
				let selectedAns = this.state.groups[index - 1];
				this.setState({
					...this.state,
					selectedAns: selectedAns
				});
			}
		});

		interact('#question-drag').draggable({
			inertia: true,
			modifiers: [
				interact.modifiers.restrict({
					restriction: document.getElementsByClassName('drag-drop')[0],
					endOnly: true,
					elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
				})
			],
			autoScroll: true,
			// dragMoveListener from the dragging demo above
			onmove: this.dragMoveListener
		});
	}


	componentWillUnmount() {
		clearInterval(this.intervalId);
		interact("#question-drag").unset();
		interact(".group-options").unset();
	}

	// to measure time
	timer = () => {
		this.setState({ currentTime: this.state.currentTime + 1 });
	};

	// submit the exercise ( calculate score and time ) show correct/ wrong ans
	submitQuestion = () => {
		const { currentScore, selectedAns, currentQuestion, userans } = this.state;
		const { answer } = currentQuestion;
		let score = currentScore;
		let updatedUserans = userans;
		updatedUserans.push(selectedAns);
		if (selectedAns.type === answer.type && selectedAns.data === answer.data) score = score + 1;
		this.setState({
			selected: false,
			submitted: true,
			userans: updatedUserans,
			currentScore: score
		});
	};

	// move to next question
	nextQuestion = () => {
		const { currentQuestionNo, questions } = this.state;
		let nextQuestionNo = currentQuestionNo + 1;
		if (nextQuestionNo > questions.length) {
			this.finishExercise();
		} else {
			const nextQuestion = questions[nextQuestionNo - 1];
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
					answer: nextQuestion.answer,
				}
			}, () => {
				interact("#question-drag").draggable(true);
				// this.initDragDrop();
			})
		}

	};

	// redirect to scores screen/ edit screen
	finishExercise = () => {
		const { scores, currentScore, id, currentTime, times, noOfQuestions, goBackToEdit, questions, userans } = this.state;
		let exercise = this.props.location.state.exercise;

		let updatedUserAnswers = questions.map((question, index) => {
			return {
				question: question.question,
				correctAns: question.answer,
				userAns: userans[index]
			}
		})

		if (goBackToEdit)
			this.props.history.push('/edit/group', { exercise: exercise });
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
				userAnswers: updatedUserAnswers,
				type: "GROUP_ASSIGNMENT"
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


	dragMoveListener = (event) => {

		this.setState({
			...this.state,
			selected: true
		});

		var target = event.target,
			// keep the dragged position in the data-x/data-y attributes
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// translate the element
		target.style.webkitTransform = target.style.transform =
			'translate(' + x + 'px, ' + y + 'px)';

		// update the posiion attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}

	render() {
		const { currentQuestion, groups, selectedAns } = this.state;
		const { showMedia, ShowModalWindow } = this.props;
		const { id, answer } = currentQuestion;
		const questionType = currentQuestion.question.type;
		const questionData = currentQuestion.question.data;

		let groupOptions = groups.map((group, index) => {
			let groupElement;
			if (group.type === MULTIMEDIA.text)
				groupElement = <span>{group.data}</span>
			if (group.type === MULTIMEDIA.image)
				groupElement = (
					<div className="matching-questions">
						<img src={group.data}
							className="matching-questions"
							onClick={() => { showMedia(group.data) }}
							alt="Question" />
					</div>
				)
			return (
				<div className={`group-options col-md-${12 / groups.length}`}
					style={{ backgroundColor: this.colors[index] }}
					id={`group-${index + 1}`}
					key={`group-${index + 1}`}>
					{groupElement}
				</div>
			)
		});


		let btnClass;
		if (this.state.submitted) {
			if (selectedAns.type === answer.type && selectedAns.data === answer.data)
				btnClass = 'correct-group';
			else
				btnClass = 'wrong-group';
			interact("#question-drag").draggable(false);
		}

		let question = (
			<div name={id} id="question-drag"
				className='before-drag'
				answer={currentQuestion.answer}>
				{(this.state.selected || this.state.submitted) && <div className="marker"></div>}
				<div className={`box box-width ${btnClass}`} id="on-click"
					onClick={(e) => {
						if (questionType === MULTIMEDIA.textToSpeech) {
							let elem = e.target;
							if (e.target.getAttribute("id"))
								elem = e.target.children[0];
							this.speak(elem, currentQuestion.question.data);
						}
					}}
				>
					<PlayerMultimediaJSX
						questionType={questionType || 'text'}
						questionData={questionData}
						speak={this.speak}
						showMedia={showMedia}
						willSpeak={false}
						className='matching-questions'
					/>;
                </div>
			</div>
		)

		let buttonText = <FormattedMessage id={SUBMIT_QUESTION} />;
		if (this.state.submitted) {
			buttonText = <FormattedMessage id={NEXT_QUESTION} />;
			if (this.state.finish) buttonText = <FormattedMessage id={FINISH_EXERCISE} />;
		}

		if ((!(this.state.submitted || this.state.selected) && document.getElementById("question-drag"))) {
			let drag_object = document.getElementById("question-drag");
			drag_object.style.webkitTransform = drag_object.style.transform =
				'translate(' + 0 + 'px, ' + 0 + 'px)';
			drag_object.setAttribute('data-x', 0);
			drag_object.setAttribute('data-y', 0);
		}

		return (
			<div className="container" id={(this.props.inFullscreenMode? "fullScreenMargin" : "group-container")} >
				<div className="row align-items-center justify-content-center">
					<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
						<div className={"col-md-12" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
							<div className="jumbotron">
								<p className="lead">{this.state.title}</p>
								<hr className="my-4" />
								<div className="drag-drop"
									style={{ position: "relative", display: 'flex' }}>
									{groupOptions}
									{question}
								</div>
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

export default withMultimedia(require('../../media/template/group_image.svg'))(withRouter(
	connect(MapStateToProps, { addScoreTime })(GroupAssignmentPlayer)));