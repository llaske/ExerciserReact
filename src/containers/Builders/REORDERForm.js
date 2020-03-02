import React, { Component } from "react";
import { connect } from "react-redux";
import { incrementExerciseCounter } from "../../store/actions/increment_counter";
import { addNewExercise, editExercise } from "../../store/actions/exercises";
import { FormattedMessage } from 'react-intl';
import { withRouter } from "react-router-dom";
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';
import { QuestionOptionsJSX, QuestionJSX, AnswerOptionsJSX } from '../../components/MultimediaJSX';
import {
	FINISH_EXERCISE,
	QUESTION,
	TITLE_OF_EXERCISE,
	TEST_EXERCISE,
	QUESTION_ERROR,
	LIST_ERROR, TITLE_ERROR, REORDER_LIST,
} from "../translation";
import "../../css/REORDERForm.css";
import { MULTIMEDIA, setDefaultMedia } from '../../utils';

class REORDERForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
			edit: false,
			id: -1,
			title: '',
			question: {
				type: '',
				data: ''
			},
			list: [{ type: '', data: '' },
			{ type: '', data: '' }],
			scores: [],
			times: [],
			isFormValid: false,
			errors: {
				question: false,
				list: false,
				title: false,
			}
		}
	}

	// in case of edit load the exercise
	componentDidMount() {
		if (this.props.location.state) {
			const { id, title, question, scores, times, list } = this.props.location.state.exercise;

			let updatedQuestion = setDefaultMedia(question);
			let updatedList = list.map((li) => {
				return setDefaultMedia(li);
			});

			this.setState({
				...this.state,
				id: id,
				title: title,
				edit: true,
				isFormValid: true,
				question: updatedQuestion,
				scores: scores,
				times: times,
				list: updatedList
			});
		}
	}

	handleChangeOption = e => {
		const index = Number(e.target.name.split('-')[1]);
		const newlist = this.state.list.map((item, i) => (
			i === index ? { type: item.type, data: e.target.value } : item
		));
		let error = false;
		if (e.target.value === '') {
			error = true;
		}
		this.setState({
			...this.state,
			list: newlist,
			errors: {
				...this.state.errors,
				list: error
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

	handleRemoveAns = () => {
		const { list } = this.state;
		if (list.length > 2) {
			list.pop();
			this.setState(
				{ list: list },
				() => {
					this.checkFormValidation();
				}
			)
		}
	};

	handleNewAns = () => {
		this.setState(
			{
				list: [...this.state.list, { type: '', data: '' }]
			},
			() => {
				this.checkFormValidation();
			}
		)
	};

	changeOrder = (curr, next) => {
		const { list } = this.state;

		if (next > list.length - 1 || next < 0) return;
		let newList = list.slice();
		let temp = newList[curr];
		newList[curr] = newList[next];
		newList[next] = temp;


		this.setState({ list: newList })
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
			question: {
				...this.state.question,
				data: e.target.value
			}
		}, () => {
			this.checkFormValidation();
		});
	};

	checkFormValidation = () => {
		const { title, question, list } = this.state;
		let isFormValid = true;

		if (question.type === '' || question.data === '') {
			isFormValid = false;
		}

		if (title === '') {
			isFormValid = false;
		}

		list.forEach((item, i) => {
			if (item.type === '' || item.data === '') {
				isFormValid = false;
			}
		});

		this.setState({
			...this.state,
			isFormValid: isFormValid
		})
	};

	handleNewEvent = event => {
		event.preventDefault();

	};

	submitExercise = (bool, e) => {
		e.preventDefault();
		const { srcThumbnail, userLanguage } = this.props;
		let id = this.state.id;

		if (this.state.id === -1) {
			id = this.props.counter;
		}

		let exercise = {
			title: this.state.title,
			id: id,
			type: "REORDER",
			times: this.state.times,
			question: this.state.question,
			list: this.state.list,
			thumbnail: srcThumbnail,
			userLanguage: userLanguage,
			scores: this.state.scores,
		};


		if (this.state.edit) {
			this.props.editExercise(exercise);
		} else {
			this.props.addNewExercise(exercise);
			this.props.incrementExerciseCounter();
		}

		if (bool)
			this.props.history.push('/play/reorder', { exercise: exercise, edit: true });
		else
			this.props.history.push('/')
	};

	showJournalChooser = (mediaType, options = false, optionNo = -1) => {
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
								this.props.showMedia(text, 'img', this.setListSourceFromImageEditor(optionNo));

							let { list } = this.state;
							list[optionNo] = { type: mediaType, data: text };
							this.setState({
								...this.state,
								list: list
							}, () => {
								this.checkFormValidation();
							});
						} else {
							if (mediaType === MULTIMEDIA.image)
								this.props.showMedia(text, 'img', this.setQuestionSourceFromImageEditor);

							this.setState({
								...this.state,
								question: {
									type: mediaType,
									data: text
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
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			this.setState({
				...this.state,
				question: {
					type: mediaType,
					data: ''
				}
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType, false)
		}
	}

	selectOptionType = (mediaType, optionNo) => {
		if (mediaType === MULTIMEDIA.text || mediaType === MULTIMEDIA.textToSpeech) {
			let { list } = this.state;
			list[optionNo] = { type: mediaType, data: '' };
			this.setState({
				...this.state,
				list: list
			}, () => {
				this.checkFormValidation();
			});
		} else {
			this.showJournalChooser(mediaType, true, optionNo)
		}
	}

	resetOption = (OptionNo) => {
		const { list } = this.state;
		list[OptionNo] = { type: '', data: '' };
		this.setState({
			...this.state,
			list: list
		});
	}

	setQuestionSourceFromImageEditor = (url) => {
		this.setState({
			...this.state,
			question: {
				...this.state.question,
				data: url
			}
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}

	setListSourceFromImageEditor = (index) => (url) => {
		const { list } = this.state;
		let updatedList = list;
		updatedList[index].data = url;
		this.setState({
			...this.state,
			list: updatedList
		}, () => {
			this.checkFormValidation();
			this.props.closeModal();
		});
	}

	render() {
		const { errors, list } = this.state;
		const { thumbnail, insertThumbnail, showMedia, ShowEditableModalWindow } = this.props;
		let questionType = this.state.question.type;

		let title_error = '';
		let question_error = '';
		let list_error = '';

		if (errors['title']) {
			title_error = <span style={{ color: "red" }}><FormattedMessage id={TITLE_ERROR} /></span>;
		}
		if (errors['question']) {
			question_error = <span style={{ color: "red" }}><FormattedMessage id={QUESTION_ERROR} /></span>;
		}
		if (errors['list']) {
			list_error = <span style={{ color: "red" }}><FormattedMessage id={LIST_ERROR} /></span>;
		}

		return (
			<div className="container" id={(this.props.inFullscreenMode? "fullScreenPaddingMargin" : "reorder-form")}>
				<div className="container-fluid">
					<div className="row align-items-center justify-content-center">
						<div className={"col-sm-10" + (this.props.inFullscreenMode? " fullScreenPadding" : "")}>
							<div>
								<p><strong><FormattedMessage id={REORDER_LIST} /></strong></p>
								<hr className="my-3" />
								<div className="col-md-12">
									<form onSubmit={this.handleNewEvent}>
										<div className="row">
											<div className="form-group">
												<div className="thumbnail">
													<button style={{ display: 'none' }} />
													{thumbnail}
												</div>
												<label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE} /></label>
												<button className="btn button-finish button-thumbnail"
													onClick={insertThumbnail} />
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
												<label htmlFor="question"><FormattedMessage id={QUESTION} />:</label>
												{questionType && <button className="btn button-edit"
													onClick={() => { this.setState({ ...this.state, question: { type: '', data: '' } }) }}>
												</button>}
												{!questionType &&
													<QuestionOptionsJSX
														selectQuestionType={this.selectQuestionType}
													/>}
												{questionType &&
													<QuestionJSX
														questionType={this.state.question.type}
														questionData={this.state.question.data}
														showMedia={showMedia}
														handleChangeQues={this.handleChangeQues}
														speak={this.speak}
														setImageEditorSource={this.setQuestionSourceFromImageEditor}
													/>
												}
												{question_error}
											</div>
										</div>
										<AnswerOptionsJSX
											selectOptionType={this.selectOptionType}
											resetOption={this.resetOption}
											showMedia={showMedia}
											speak={this.speak}
											options={list}
											changeOrder={this.changeOrder}
											handleChangeOption={this.handleChangeOption}
											templateType="REORDER"
											setImageEditorSource={this.setListSourceFromImageEditor}
										/>
										<div>
											{list_error}
										</div>
										<div className="row">
											<div className="form-group">
												<button
													type="button"
													onClick={this.handleNewAns}
													className="btn button-choices-add">

												</button>
												<button
													type="button"
													onClick={this.handleRemoveAns}
													className="btn button-choices-sub">

												</button>
											</div>
										</div>
										<div className="form-group row justify-content-between">
											<br />
											<div className="justify-content-end">
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

export default withMultimedia(require('../../media/template/list_reorder_image.svg'))(withRouter(
	connect(MapStateToProps,
		{ addNewExercise, incrementExerciseCounter, editExercise }
	)(REORDERForm)));
