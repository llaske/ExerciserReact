import React, { Component } from 'react'
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { addScoreTime } from '../../store/actions/exercises';
import { SUBMIT_QUESTION, FINISH_EXERCISE } from "../translation";
import { FormattedMessage } from 'react-intl';
import DragList from "../../components/DragList";
import "../../css/REORDERPlayer.css"
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';
import { PlayerMultimediaJSX } from '../../components/MultimediaJSX';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class REORDERPlayer extends Component {

	constructor(props) {
		super(props);

		this.state = {
			id: -1,
			title: '',
			question: {
				type: '',
				data: ''
			},
			list: [],
			userAns: [],
			checkAns: [],
			submitted: false,
			scores: [],
			score: 0,
			goBackToEdit: false,
			times: [],
			userLanguage: '',
			currentTime: 0,
			intervalID: -1,
			userAnswers: []
		}
		this.intervalId = setInterval(this.timer, 1000);
	}

	// load the exercise from props
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, question, scores, times, list, userLanguage } = this.props.location.state.exercise;

			let goBackToEdit = false;
			if (this.props.location.state.edit) goBackToEdit = true;

			let updatedQuestion = setDefaultMedia(question);
			let updatedList = list.map((li) => {
				return setDefaultMedia(li);
			});

			let userAns = this.shuffleArray(updatedList.slice());
			let checkAns = list.map(() => false);

			this.setState({
				...this.state,
				id: id,
				title: title,
				question: updatedQuestion,
				scores: scores,
				times: times,
				list: updatedList,
				userAns: userAns,
				goBackToEdit: goBackToEdit,
				checkAns: checkAns,
				userLanguage: userLanguage
			}, () => {
				if (userLanguage.startsWith('en'))
					meSpeak.loadVoice(require(`mespeak/voices/en/${this.state.userLanguage}.json`));
				else
					meSpeak.loadVoice(require(`mespeak/voices/${this.state.userLanguage}.json`));
			})
		}
	}

	timer = () => {
		this.setState({ currentTime: this.state.currentTime + 1 });
	};

	componentWillUnmount() {
		clearInterval(this.intervalId);
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
		}
		return array;
	}

	onListChange = (list) => {
		let newlist = list.map((li, i) => {
			return { type: li.content.props.type, data: li.content.props.data }
		});
		this.setState({
			...this.state,
			userAns: newlist
		});

	};

	// submit the exercise ( calculate score and time ) show correct/ wrong ans
	submitExercise = () => {
		const { userAns, list } = this.state;
		let checkAns = [];
		let score = 0;
		for (let i = 0; i < list.length; i++) {
			if (list[i].data.toLowerCase() === userAns[i].data.toLowerCase()) {
				checkAns.push(true);
				score++;
			} else {
				checkAns.push(false)
			}
		}

		let userAnswers = list.map((li, index) => {
			return {
				question: (index === 0) ? this.state.question : { type: 'text', data: '' },
				correctAns: li,
				userAns: userAns[index]
			}
		});

		this.setState({
			...this.state,
			submitted: true,
			checkAns: checkAns,
			score: score,
			userAnswers: userAnswers
		})
	};

	// redirect to scores screen/ edit screen
	finishExercise = () => {
		const { scores, score, id, currentTime, times, list, goBackToEdit, userAnswers } = this.state;
		let exercise = this.props.location.state.exercise;
		let noOfQuestions = list.length;

		if (goBackToEdit)
			this.props.history.push('/edit/reorder', { exercise: exercise });
		else {
			scores.push(score);
			times.push(currentTime);
			this.props.addScoreTime(id, score, currentTime);
			this.props.history.push('/scores', {
				scores: scores,
				userScore: score,
				times: times,
				userTime: currentTime,
				noOfQuestions: noOfQuestions,
				exercise: exercise,
				userAnswers: userAnswers,
				type: "REORDER"
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
		const { showMedia, ShowModalWindow } = this.props;
		const { checkAns, userAns } = this.state;
		const questionType = this.state.question.type;
		const questionData = this.state.question.data;

		let buttonText = <FormattedMessage id={SUBMIT_QUESTION} />;
		if (this.state.submitted) buttonText = <FormattedMessage id={FINISH_EXERCISE} />;

		let options = userAns.map((option, i) => {
			const optionType = option.type;
			const optionData = option.data;
			return (
				<div type={optionType} data={optionData}
					id={`answer-${i}`}
					onClick={(e) => {
						if (optionType === MULTIMEDIA.textToSpeech) {
							let elem = e.target;
							if (e.target.getAttribute("id"))
								elem = e.target.children[0];
							this.speak(elem, optionData);
						} else if (optionType === MULTIMEDIA.video) {
							let videoElem = e.target;
							if (!(videoElem.getAttribute("id")) && videoElem.paused) {
								videoElem.pause();
							}
							showMedia(optionData, MULTIMEDIA.video);
						}
					}}
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
				</div>
			);
		})


		let list = (<DragList list={options} onChange={this.onListChange} />);

		if (this.state.submitted) {
			list = checkAns.map((bool, i) => {
				let className = 'btn-danger';
				if (bool) className = 'btn-success';
				return (
					<div className={"list-item " + className} key={`list-item${i}`}>
						{options[i]}
					</div>
				)
			});
		}

		return (
			<div className={"container" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
				<div className="container-fluid" id={(this.props.inFullscreenMode? "fullScreenMargin" : "reorder-player")}>
					<div className="row align-items-center justify-content-center">
						<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")} >
							<div className="jumbotron">
								<p className="lead">{this.state.title}</p>
								<hr className="my-4" />
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
								<div>
									{list}
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

export default withMultimedia(require('../../media/template/list_reorder_image.svg'))(withRouter(
	connect(MapStateToProps, { addScoreTime })(REORDERPlayer)));