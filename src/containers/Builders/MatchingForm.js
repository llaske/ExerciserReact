import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementExerciseCounter } from "../../store/actions/increment_counter";
import { addNewExercise, editExercise } from "../../store/actions/exercises";
import { FormattedMessage } from 'react-intl';
import {
	FINISH_EXERCISE,
	TITLE_OF_EXERCISE,
	NEXT_QUESTION,
	PREVIOUS_QUESTION,
	TEST_EXERCISE,
	TITLE_ERROR,
	QUESTION_ERROR,
	MATCHING_PAIR,
	ANSWER_ERROR,
	MATCH_ITEM,
	MATCHING_ITEM
} from "../translation";
import { withRouter } from "react-router-dom";
import "../../css/MatchingForm.css";
import withMultimedia from '../../components/WithMultimedia';
import { QuestionOptionsJSX } from '../../components/MultimediaJSX';
import { QuestionJSX } from '../../components/MultimediaJSX';
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import meSpeak from 'mespeak';
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class MATCHING_PAIRForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			edit: false,
			id: -1,
			title: '',
			noOfPairs: 0,
			currentPairNo: 1,
			pairs: [],
			scores: [],
			times: [],
			isFormValid: false,
			errors: {
				question: false,
				answer: false,
				title: false
			},
			currentPair: {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				answer: {
					type: '',
					data: ''
				},
			}
		};
	}

	// in case of edit load the exercise
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, pairs, scores, times } = this.props.location.state.exercise;

			let updatedPairs = pairs.map((pair) => {
				return {
					...pair,
					question: setDefaultMedia(pair.question),
					answer: setDefaultMedia(pair.answer)
				}
			})

			const currentPair = updatedPairs[0];
			this.setState({
				...this.state,
				id: id,
				title: title,
				edit: true,
				isFormValid: true,
				pairs: updatedPairs,
				scores: scores,
				times: times,
				noOfPairs: pairs.length,
				currentPair: currentPair
			});
		}
	}

	handleChangeAns = e => {
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			currentPair: {
				...this.state.currentPair,
				answer: {
					...this.state.currentPair.answer,
					data: e.target.value
				}
			},
			errors: {
				...this.state.errors,
				answer: error
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleChangeTitle = e => {
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			title: e.target.value,
			errors: {
				...this.state.errors,
				title: error
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleChangeQues = e => {
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			errors: {
				...this.state.errors,
				question: error
			},
			currentPair: {
				...this.state.currentPair,
				question: {
					...this.state.currentPair.question,
					data: e.target.value
				}
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleNewEvent = event => {
		event.preventDefault();
	};

	// save current question
	saveCurrentPair = () => {
		this.checkFormValidation();

		if (this.state.isFormValid) {
			const { currentPairNo, noOfPairs, currentPair } = this.state;

			if (currentPairNo > noOfPairs) {
				this.setState({
					...this.state,
					pairs: [
						...this.state.pairs,
						currentPair
					],
					isFormValid: false,
					noOfPairs: currentPair.id,
					currentPairNo: currentPair.id + 1,
					currentPair: {
						id: currentPair.id + 1,
						question: {
							type: '',
							data: ''
						},
						answer: {
							type: '',
							data: ''
						},
					}
				});
			}
			else {
				const { pairs } = this.state;
				let index = currentPairNo;

				const updatedPairs = pairs.map((pair, i) => (
					pair.id === index ? currentPair : pair
				));

				if (currentPairNo === noOfPairs) {
					this.setState({
						...this.state,
						pairs: updatedPairs,
						isFormValid: false,
						currentPairNo: currentPairNo + 1,
						currentPair: {
							id: currentPairNo + 1,
							question: {
								type: '',
								data: ''
							},
							answer: {
								type: '',
								data: ''
							},
						}
					});
				} else {
					const { question, answer } = this.state.pairs[index];
					this.setState({
						...this.state,
						pairs: updatedPairs,
						isFormValid: true,
						currentPairNo: index + 1,
						currentPair: {
							id: index + 1,
							question: question,
							answer: answer,
						}
					});
				}
			}
		}
	};

	// check if current form is valid
	checkFormValidation = () => {
		const { currentPair, title } = this.state;
		const { question, answer } = currentPair;
		let isFormValid = true;

		if (question.type === '' || question.data === '') {
			isFormValid = false;
		}

		if (title === '') {
			isFormValid = false;
		}

		if (answer.type === '' || answer.data === '') {
			isFormValid = false;
		}

		this.setState({
			...this.state,
			isFormValid: isFormValid
		});
	};

	// submit exercise
	submitExercise = (bool, e) => {
		e.preventDefault();
		const { srcThumbnail, userLanguage } = this.props;
		const { currentPair } = this.state;
		let { pairs } = this.state;

		let id = this.state.id;
		if (this.state.id === -1) {
			id = this.props.counter;
		}

		// To save changes before testing the exercise
		if (currentPair.id <= pairs.length) {
			let updatedCurrentPair = {
				id: currentPair.id,
				question: currentPair.question,
				answer: currentPair.answer
			};
			pairs[currentPair.id - 1] = updatedCurrentPair;
		} else {
			pairs.push({
				id: currentPair.id,
				question: currentPair.question,
				answer: currentPair.answer
			});
		}

		let exercise = {
			title: this.state.title,
			id: id,
			type: "MATCHING_PAIR",
			pairs: pairs,
			scores: this.state.scores,
			times: this.state.times,
			thumbnail: srcThumbnail,
			userLanguage: userLanguage
		};

		if (this.state.edit) {
			this.props.editExercise(exercise);
		} else {
			this.props.addNewExercise(exercise);
			this.props.incrementExerciseCounter();
		}

		if (bool)
			this.props.history.push('/play/match', { exercise: exercise, edit: true });
		else
			this.props.history.push('/')
	};

	// move to previous question
	previousPair = () => {
		const { currentPairNo, pairs } = this.state;
		let previousPairNo = currentPairNo - 1;
		let previousPair = pairs[previousPairNo - 1];

		this.setState({
			...this.state,
			isFormValid: true,
			currentPairNo: previousPairNo,
			currentPair: previousPair
		})
	};

	showJournalChooser = (mediaType, answer = false) => {
		const { currentPair } = this.state;

		let image, audio, video = false;
		if (mediaType === MULTIMEDIA.image)
			image = true;
		if (mediaType === MULTIMEDIA.audio)
			audio = true;
		if (mediaType === MULTIMEDIA.video)
			video = true;
		env.getEnvironment((err, environment) => {
			if (environment.user) {
				// Display journal dialog popup
				chooser.show((entry) => {
					if (!entry) {
						return;
					}
					var dataentry = new datastore.DatastoreObject(entry.objectId);
					dataentry.loadAsText((err, metadata, text) => {
						if (answer) {
							if (mediaType === MULTIMEDIA.image)
								this.props.showMedia(text, 'img', this.setAnswerSourceFromImageEditor);
							this.setState({
								...this.state,
								currentPair: {
									...currentPair,
									answer: {
										type: mediaType,
										data: text
									}
								}
							}, () => {
								this.checkFormValidation();
							});
						} else {
							if (mediaType === MULTIMEDIA.image)
								this.props.showMedia(text, 'img', this.setQuestionSourceFromImageEditor);

							this.setState({
								...this.state,
								currentPair: {
									...currentPair,
									question: {
										type: mediaType,
										data: text
									}
								}
							}, () => {
								this.checkFormValidation();
							});
						}
					});
				}, (image ? { mimetype: 'image/png' } : audio ? { mimetype: 'audio/mp3' } : null),
					(image ? { mimetype: 'image/jpeg' } : audio ? { mimetype: 'audio/mpeg' } : null),
					(audio ? { mimetype: 'audio/wav' } : video ? { mimetype: 'video/mp4' } : null),
					(video ? { mimetype: 'video/webm' } : null));
			}
		});
	};

	speak = (e, text) => {
		let audioElem = e.target;
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

	selectQuestionType = (mediaType) => {
		const { currentPair } = this.state;
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			this.setState({
				...this.state,
				currentPair: {
					...currentPair,
					question: {
						type: mediaType,
						data: ''
					}
				}
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType, false)
		}
	}

	selectAnswerType = (mediaType) => {
		const { currentPair } = this.state;
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			this.setState({
				...this.state,
				currentPair: {
					...currentPair,
					answer: {
						type: mediaType,
						data: ''
					}
				}
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType, true)
		}
	}


	resetAnswer = () => {
		const { currentPair } = this.state;
		this.setState({
			...this.state,
			currentPair: {
				...currentPair,
				answer: {
					type: '',
					data: ''
				}
			}
		});
	}

	setQuestionSourceFromImageEditor = (url) => {
		this.setState({
			...this.state,
			currentPair: {
				...this.state.currentPair,
				question: {
					...this.state.currentPair.question,
					data: url
				}
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}

	setAnswerSourceFromImageEditor = (url) => {
		this.setState({
			...this.state,
			currentPair: {
				...this.state.currentPair,
				answer: {
					...this.state.currentPair.answer,
					data: url
				}
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}


	onDeletePair = () => {
		const { currentPair, pairs } = this.state;
		let updatedPair = [];
		let newCurrentPair;

		if ((pairs.length === 0 || pairs.length === 1) && currentPair.id === 1) {
			updatedPair = [];
			newCurrentPair = {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				answer: {
					type: '',
					data: ''
				}
			}
		}
		else if (currentPair.id > pairs.length) {
			newCurrentPair = pairs[pairs.length - 1];
			updatedPair = pairs;
		} else {
			pairs.forEach((pair) => {
				if (pair.id !== currentPair.id)
					updatedPair.push(pair);
			})
			updatedPair = updatedPair.map((pair, index) => {
				if (pair.id !== (index + 1)) {
					pair.id = index + 1;
					return pair;
				}
				return pair;
			})

			if (currentPair.id === (updatedPair.length + 1)) {
				newCurrentPair = updatedPair[currentPair.id - 2];
			} else {
				newCurrentPair = updatedPair[currentPair.id - 1];
			}
		}

		this.setState({
			...this.state,
			pairs: updatedPair,
			noOfQuestions: updatedPair.length,
			currentPair: newCurrentPair,
			currentPairNo: newCurrentPair.id
		}, () => {
			this.checkFormValidation();
		})
	}

	render() {
		const { currentPair, errors } = this.state;
		const { thumbnail, insertThumbnail, showMedia, ShowEditableModalWindow } = this.props
		let questionType = this.state.currentPair.question.type;
		let answerType = this.state.currentPair.answer.type;

		let title_error = '';
		let question_error = '';
		let answer_error = '';

		if (errors['title']) {
			title_error = <span style={{ color: "red" }}><FormattedMessage id={TITLE_ERROR} /></span>;
		}
		if (errors['question']) {
			question_error = <span style={{ color: "red" }}><FormattedMessage id={QUESTION_ERROR} /></span>;
		}
		if (errors['answers']) {
			answer_error = <span style={{ color: "red" }}><FormattedMessage id={ANSWER_ERROR} /></span>;
		}

		return (
			<div className={"container" + (this.props.inFullscreenMode? " fullScreenMargin" : "")} id="matching-form">
				<div className="container-fluid">
					<div className="row align-items-center justify-content-center">
						<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")}>
							<div>
								<p><strong><FormattedMessage id={MATCHING_PAIR} /></strong></p>
								<hr className="my-3" />
								<div className="col-md-12">
									<form onSubmit={this.handleNewEvent}>
										<div className="row">
											<div className="form-group">
												{thumbnail}
												<label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE} /></label>
												<button style={{ display: 'none' }} />
												<button className="btn button-finish button-thumbnail"
													onClick={insertThumbnail}
												/>
												<input
													className="input-mcq"
													type="text"
													id="title"
													value={this.state.title}
													onChange={this.handleChangeTitle}
												/>
												{title_error}
											</div>
										</div>
										<div className="row">
											<div className="form-group">
												<p><strong>Pair - {currentPair.id}</strong></p>
												<hr className="my-3" />
												<label htmlFor="question"><FormattedMessage id={MATCH_ITEM} />:</label>
												<button className="btn button-delete"
													onClick={this.onDeletePair}
													disabled={this.state.pairs.length === 0}
												/>
												{questionType && <button className="btn button-edit"
													onClick={() => { this.setState({ ...this.state, currentPair: { ...currentPair, question: { type: '', data: '' } } }) }}>
												</button>}
												{!questionType &&
													<QuestionOptionsJSX
														selectQuestionType={this.selectQuestionType}
													/>}
												{questionType &&
													<QuestionJSX
														questionType={this.state.currentPair.question.type}
														questionData={this.state.currentPair.question.data}
														showMedia={showMedia}
														handleChangeQues={this.handleChangeQues}
														speak={this.speak}
														setImageEditorSource={this.setQuestionSourceFromImageEditor}
													/>
												}
												{question_error}
											</div>
										</div>
										<div className="row">
											<div className="form-group">
												<label htmlFor="answer"><FormattedMessage id={MATCHING_ITEM} />:</label>
												{answerType && <button className="btn button-edit"
													style={{ marginLeft: '5px' }}
													onClick={() => { this.resetAnswer() }}>
												</button>}
												{!answerType &&
													<QuestionOptionsJSX
														selectQuestionType={this.selectAnswerType}
													/>}
												{answerType &&
													<QuestionJSX
														questionType={this.state.currentPair.answer.type}
														questionData={this.state.currentPair.answer.data}
														showMedia={showMedia}
														handleChangeQues={this.handleChangeAns}
														speak={this.speak}
														setImageEditorSource={this.setAnswerSourceFromImageEditor}
													/>
												}
												{answer_error}
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<button
												onClick={this.previousPair}
												className={"btn button-previous"}
												disabled={this.state.currentPairNo === 1}
											>
												<FormattedMessage id={PREVIOUS_QUESTION} />
											</button>
											<div className="justify-content-end">
												<button
													onClick={this.saveCurrentPair}
													className={"btn button-next"}
													disabled={!this.state.isFormValid}
												>
													<FormattedMessage id={NEXT_QUESTION} />
												</button>
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<button
												onClick={(e) => this.submitExercise(false, e)}
												className={"btn button-finish"}
												disabled={!this.state.isFormValid}
											>
												<FormattedMessage id={FINISH_EXERCISE} />
											</button>
											<button
												onClick={(e) => this.submitExercise(true, e)}
												className={"btn button-finish"}
												disabled={!this.state.isFormValid}
											>
												<FormattedMessage id={TEST_EXERCISE} />
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ShowEditableModalWindow />
			</div>
		)
	}

}

function MapStateToProps(state) {
	return {
		counter: state.exercise_counter
	}
}

export default withMultimedia(require("../../media/template/matching_pair_image.svg"))(withRouter(
	connect(MapStateToProps,
		{ addNewExercise, incrementExerciseCounter, editExercise }
	)(MATCHING_PAIRForm)));