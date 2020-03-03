import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementExerciseCounter } from "../../store/actions/increment_counter";
import { addNewExercise, editExercise } from "../../store/actions/exercises";
import { FormattedMessage } from 'react-intl';
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';
import { QuestionOptionsJSX, AnswerOptionsJSX, QuestionJSX } from '../../components/MultimediaJSX';
import {
	QUESTION,
	FINISH_EXERCISE,
	TITLE_OF_EXERCISE,
	NEXT_QUESTION,
	PREVIOUS_QUESTION,
	TEST_EXERCISE,
	TITLE_ERROR,
	QUESTION_ERROR,
	ANSWER_ERROR,
	MCQ,
} from "../translation";
import { withRouter } from "react-router-dom"
import "../../css/MCQForm.css"
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class MCQForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			edit: false,
			id: -1,
			title: '',
			noOfQuestions: 0,
			currentQuestionNo: 1,
			questions: [],
			scores: [],
			times: [],
			isFormValid: false,
			errors: {
				question: false,
				options: false,
				title: false
			},
			currentQuestion: {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				options: [{ type: '', data: '' }, { type: '', data: '' }]
			}
		};
	}

	// in case of edit load the exercise
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, questions, scores, times } = this.props.location.state.exercise;

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
			this.setState({
				...this.state,
				id: id,
				title: title,
				edit: true,
				isFormValid: true,
				questions: updatedQuestions,
				scores: scores,
				times: times,
				noOfQuestions: questions.length,
				currentQuestion: currentQuestion
			});
		}
	}

	handleChangeOption = e => {
		const index = Number(e.target.name.split('-')[1]);
		const options = this.state.currentQuestion.options.map((option, i) => (
			i === index ? { type: option.type, data: e.target.value } : option
		));

		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			currentQuestion: {
				...this.state.currentQuestion,
				options: options
			},
			errors: {
				...this.state.errors,
				options: error
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
			currentQuestion: {
				...this.state.currentQuestion,
				question: {
					...this.state.currentQuestion.question,
					data: e.target.value
				}
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	handleRemoveOption = () => {
		let { currentQuestion } = this.state;
		let { options } = currentQuestion;
		if (options.length > 2) {
			options.pop();
			this.setState({
				...this.state,
				currentQuestion: {
					...currentQuestion,
					options: options
				}
			}, () => {
				this.checkFormValidation();
			}
			)
		}
	};

	handleNewOption = () => {
		const { currentQuestion } = this.state;
		this.setState({
			...this.state,
			currentQuestion: {
				...currentQuestion,
				options: [...currentQuestion.options, { type: '', data: '' }]
			}
		},
			() => {
				this.checkFormValidation();
			}
		)
	};

	handleNewEvent = event => {
		event.preventDefault();
	};

	// save current question
	saveCurrentForm = () => {
		this.checkFormValidation();

		if (this.state.isFormValid) {
			const { currentQuestionNo, noOfQuestions } = this.state;
			const { question, options } = this.state.currentQuestion;

			const correctAns = options[0];
			const id = currentQuestionNo;

			let Ques = {
				id: id,
				options: options,
				question: question,
				correctAns: correctAns
			};

			let isFormValid = false;
			if (currentQuestionNo + 1 <= noOfQuestions)
				isFormValid = true;

			if (currentQuestionNo > noOfQuestions) {
				this.setState({
					...this.state,
					questions: [
						...this.state.questions,
						Ques
					],
					isFormValid: isFormValid,
					noOfQuestions: id,
					currentQuestionNo: id + 1,
					currentQuestion: {
						id: id + 1,
						question: {
							type: '',
							data: ''
						},
						options: [{ type: '', data: '' }, { type: '', data: '' }]
					}
				});
			}
			else {
				const { questions } = this.state;
				let index = currentQuestionNo;

				const updatedQuestions = questions.map((ques, i) => (
					ques.id === index ? Ques : ques
				));
				if (currentQuestionNo === noOfQuestions) {
					this.setState({
						...this.state,
						questions: updatedQuestions,
						isFormValid: isFormValid,
						currentQuestionNo: currentQuestionNo + 1,
						currentQuestion: {
							id: currentQuestionNo + 1,
							question: {
								type: '',
								data: ''
							},
							options: [{ type: '', data: '' }, { type: '', data: '' }]
						}
					});
				} else {
					const { question, options, correctAns } = this.state.questions[index];
					let correct = correctAns;
					if (correctAns.data === '') {
						correct = options[0];
					}

					this.setState({
						...this.state,
						questions: updatedQuestions,
						isFormValid: isFormValid,
						currentQuestionNo: index + 1,
						currentQuestion: {
							id: index + 1,
							question: question,
							options: options,
							correctAns: correct
						}
					});
				}
			}
		}
	};

	// check if current form is valid
	checkFormValidation = () => {
		const { currentQuestion, title } = this.state;
		const { question, options } = currentQuestion;
		let isFormValid = true;

		if (!question.type)
			isFormValid = false;

		if ((question.type === MULTIMEDIA.text || question.type === MULTIMEDIA.textToSpeech)
			&& question.data === '') {
			isFormValid = false;
		}

		if (title === '') {
			isFormValid = false;
		}

		options.forEach((option, i) => {
			if (option.data === '') {
				isFormValid = false;
			}
		});

		this.setState({
			...this.state,
			isFormValid: isFormValid
		});
	};

	// submit exercise
	submitExercise = (bool, e) => {
		e.preventDefault();
		const { srcThumbnail, userLanguage } = this.props;
		const { currentQuestion } = this.state;
		let { questions } = this.state;

		let id = this.state.id;
		if (this.state.id === -1) {
			id = this.props.counter;
		}

		// To save changes before testing the exercise
		if (currentQuestion.id <= questions.length) {
			let Ques = {
				id: currentQuestion.id,
				options: currentQuestion.options,
				question: currentQuestion.question,
				correctAns: currentQuestion.options[0]
			};
			questions[currentQuestion.id - 1] = Ques;
		} else {
			questions.push({
				id: currentQuestion.id,
				options: currentQuestion.options,
				question: currentQuestion.question,
				correctAns: currentQuestion.options[0]
			})
		}

		let exercise = {
			title: this.state.title,
			id: id,
			type: "MCQ",
			questions: questions,
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
			this.props.history.push('/play/mcq', { exercise: exercise, edit: true });
		else
			this.props.history.push('/')
	};

	// move to previous question
	previousQues = () => {
		const { currentQuestionNo } = this.state;
		let previousQuestionNo = currentQuestionNo - 1;
		let previousQuestion = this.state.questions[previousQuestionNo - 1];

		const { id, question, options } = previousQuestion;
		let updatedCurrentQuestion = {
			id: id,
			question: question,
			options: options
		};

		this.setState({
			...this.state,
			isFormValid: true,
			currentQuestionNo: id,
			currentQuestion: updatedCurrentQuestion
		})
	};

	showJournalChooser = (mediaType, options = true, optionNo = -1) => {
		const { currentQuestion } = this.state;

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
						if (options) {
							if (mediaType === MULTIMEDIA.image)
								this.props.showMedia(text, 'img', this.setOptionSourceFromImageEditor(optionNo));

							let options = currentQuestion.options;
							options[optionNo] = { type: mediaType, data: text };
							this.setState({
								...this.state,
								currentQuestion: {
									...currentQuestion,
									options: options
								}
							}, () => {
								this.checkFormValidation();
							});
						} else {
							if (mediaType === MULTIMEDIA.image)
								this.props.showMedia(text, 'img', this.setQuestionSourceFromImageEditor);

							this.setState({
								...this.state,
								currentQuestion: {
									...currentQuestion,
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
		const { currentQuestion } = this.state;
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			this.setState({
				...this.state,
				currentQuestion: {
					...currentQuestion,
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

	selectOptionType = (mediaType, optionNo) => {
		const { currentQuestion } = this.state;
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			let { options } = currentQuestion;
			options[optionNo] = { type: mediaType, data: '' };
			this.setState({
				...this.state,
				currentQuestion: {
					...currentQuestion,
					options: options
				}
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType, true, optionNo)
		}
	}

	resetOption = (OptionNo) => {
		const { currentQuestion } = this.state;
		let { options } = currentQuestion;
		options[OptionNo] = { type: '', data: '' };
		this.setState({
			...this.state,
			currentQuestion: {
				...currentQuestion,
				options: options
			}
		});
	}

	setQuestionSourceFromImageEditor = (url) => {
		this.setState({
			...this.state,
			currentQuestion: {
				...this.state.currentQuestion,
				question: {
					...this.state.currentQuestion.question,
					data: url
				}
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}

	setOptionSourceFromImageEditor = (index) => (url) => {
		const { options } = this.state.currentQuestion;
		let updatedOptions = options;
		updatedOptions[index].data = url;
		this.setState({
			...this.state,
			currentQuestion: {
				...this.state.currentQuestion,
				options: updatedOptions
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}

	onDeleteQuestion = () => {
		const { currentQuestion, questions } = this.state;
		let updatedQuestions = [];
		let newCurrentQuestion;

		if ((questions.length === 0 || questions.length === 1) && currentQuestion.id === 1) {
			updatedQuestions = [];
			newCurrentQuestion = {
				id: 1,
				question: {
					type: '',
					data: ''
				},
				options: [{ type: '', data: '' }, { type: '', data: '' }]
			}
		}
		else if (currentQuestion.id > questions.length) {
			newCurrentQuestion = questions[questions.length - 1];
			updatedQuestions = questions;
		} else {
			questions.forEach((question) => {
				if (question.id !== currentQuestion.id)
					updatedQuestions.push(question);
			})
			updatedQuestions = updatedQuestions.map((question, index) => {
				if (question.id !== (index + 1)) {
					question.id = index + 1;
					return question;
				}
				return question;
			})

			if (currentQuestion.id === (updatedQuestions.length + 1)) {
				newCurrentQuestion = updatedQuestions[currentQuestion.id - 2];
			} else {
				newCurrentQuestion = updatedQuestions[currentQuestion.id - 1];
			}
		}

		this.setState({
			...this.state,
			questions: updatedQuestions,
			noOfQuestions: updatedQuestions.length,
			currentQuestion: newCurrentQuestion,
			currentQuestionNo: newCurrentQuestion.id
		}, () => {
			this.checkFormValidation();
		})
	}

	render() {
		const { currentQuestion, errors } = this.state;
		const { id, options } = currentQuestion;
		const { thumbnail, insertThumbnail, showMedia, ShowEditableModalWindow } = this.props;
		let questionType = currentQuestion.question.type;

		let title_error = '';
		let question_error = '';
		let options_error = '';

		if (errors['title']) {
			title_error = <span style={{ color: "red" }}><FormattedMessage id={TITLE_ERROR} /></span>;
		}
		if (errors['question']) {
			question_error = <span style={{ color: "red" }}><FormattedMessage id={QUESTION_ERROR} /></span>;
		}
		if (errors['options']) {
			options_error = <span style={{ color: "red" }}><FormattedMessage id={ANSWER_ERROR} /></span>;
		}

		return (
			<div className={"container" + (this.props.inFullscreenMode? " fullScreenPaddingMargin" : "")} id="mcq-form">
				<div className="container-fluid">
					<div className="row align-items-center justify-content-center">
						<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")}>
							<div>
								<p><strong><FormattedMessage id={MCQ} /></strong></p>
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
												<label htmlFor="question">{id}. <FormattedMessage id={QUESTION} />:</label>
												<button className="btn button-delete"
													onClick={this.onDeleteQuestion}
													disabled={this.state.questions.length === 0}
												/>
												{questionType && <button className="btn button-edit"
													onClick={() => { this.setState({ ...this.state, currentQuestion: { ...currentQuestion, question: { type: '', data: '' } } }) }}>
												</button>}
												{!questionType &&
													<QuestionOptionsJSX
														selectQuestionType={this.selectQuestionType}
													/>}
												{questionType &&
													<QuestionJSX
														questionType={questionType}
														questionData={this.state.currentQuestion.question.data}
														showMedia={showMedia}
														handleChangeQues={this.handleChangeQues}
														speak={this.speak}
														setImageEditorSource={this.setQuestionSourceFromImageEditor}
													/>
												}
												{questionType === MULTIMEDIA.text && question_error}
											</div>
										</div>
										<AnswerOptionsJSX
											selectOptionType={this.selectOptionType}
											resetOption={this.resetOption}
											showMedia={showMedia}
											speak={this.speak}
											options={options}
											changeOrder={this.changeOrder}
											handleChangeOption={this.handleChangeOption}
											templateType="MCQ"
											setImageEditorSource={this.setOptionSourceFromImageEditor}
										/>
										<div>
											{options_error}
										</div>
										<div className="row">
											<div className="form-group">
												<button
													type="button"
													onClick={this.handleNewOption}
													className="btn button-choices-add">

												</button>
												<button
													type="button"
													onClick={this.handleRemoveOption}
													className="btn button-choices-sub">

												</button>
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<button
												onClick={this.previousQues}
												className={"btn button-previous"}
												disabled={this.state.currentQuestionNo === 1}
											>
												<FormattedMessage id={PREVIOUS_QUESTION} />
											</button>
											<div className="justify-content-end">
												<button
													onClick={this.saveCurrentForm}
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

export default withMultimedia(require('../../media/template/mcq_image.svg'))(withRouter(
	connect(MapStateToProps,
		{ addNewExercise, incrementExerciseCounter, editExercise }
	)(MCQForm)));