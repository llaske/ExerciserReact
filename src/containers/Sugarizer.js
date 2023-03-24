import React, { Component } from "react";
import { connect } from "react-redux";
import { MemoryRouter as Router } from "react-router-dom";

// Localization Dependencies
import { IntlProvider } from "react-intl";
import { addLocaleData } from "react-intl";
import messages from "../translations/lang";
import locale_en from "react-intl/locale-data/en";
import locale_fr from "react-intl/locale-data/fr";
import locale_es from "react-intl/locale-data/es";

import default_activities from "../default_activities";

// Sugarizer Dependencies
import activity from "lib/sugar-web/activity/activity";
import datastore from "lib/sugar-web/datastore/";
import icon from "lib/sugar-web/graphics/icon";
import env from "lib/sugar-web/env";
import presencepalette from "lib/sugar-web/graphics/presencepalette";
import humane from "lib/humane";

//Components
import Main from "./Router";
import Navbar from "../components/Navbar";

import "../css/index.css";
import "../css/libnotify.css";
import meSpeak from "mespeak";
import LZ from "lz-string";

// actions
import { setExercises, editExercise } from "../store/actions/exercises";
import {
	setUser,
	setRunAllExercise,
	setExerciseIndex,
} from "../store/actions/sugarizer";
import { setExerciseCounter } from "../store/actions/increment_counter";
import {
	setEvaluationMode,
	setEvaluationExercise,
	addEvaluationExercisesPresence,
	addEvaluationExercise,
} from "../store/actions/evaluation";
import {
	setIsHost,
	setIsShared,
	addUser,
	removeUser,
	addSharedResult,
	shareAllExercise,
	addSharedExercise,
} from "../store/actions/presence";
import { MULTIMEDIA } from "../utils";

class Sugarizer extends Component {
	constructor(props) {
		super(props);

		addLocaleData([...locale_en, ...locale_fr, ...locale_es]);

		this.language = navigator.language.split(/[-_]/)[0];

		this.isHost = false;
		this.isRunAll = false;
		this.presence = null;
		this.onNetworkDataReceived = this.onNetworkDataReceived.bind(this);
		this.onNetworkUserChanged = this.onNetworkUserChanged.bind(this);

		this.state = {
			inEditMode: false,
			inFullscreenMode: false,
		};
	}

	toggleEditMode(edit) {
		this.setState({ inEditMode: edit });
	}

	componentDidMount() {
		const {
			setExercises,
			setExerciseCounter,
			setIsHost,
			setIsShared,
			setUser,
			setRunAllExercise,
			setExerciseIndex,
			setEvaluationMode,
			setEvaluationExercise,
			shared_exercises,
		} = this.props;

		let temp = this;
		window.setTimeout(function () {
			activity.setup();
			meSpeak.loadConfig(require("../mespeak_config.json"));
			env.getEnvironment(function (err, environment) {
				if (environment.user) {
					let user = {
						name: environment.user.name,
						colorvalue: environment.user.colorvalue,
					};
					setUser(user);
					temp.language = environment.user.language;
					// setting default lang
					if (!messages[temp.language]) {
						temp.language = "en";
					}
				}

				// Load from datastore
				if (!environment.objectId) {
					// console.log("New instance");
					if (!environment.sharedId) temp.setDefaultExercises();
					temp.stopActivity();
				} else {
					activity
						.getDatastoreObject()
						.loadAsText(function (error, metadata, data) {
							if (error === null && data !== null) {
								// console.log("object found!");
								// Decompressing jsonData to be stored in Local Storage
								let uncompressedData = LZ.decompressFromUTF16(data);
								let json = JSON.parse(uncompressedData);
								setExercises(json.exercises);
								setExerciseCounter(json.counter);
								setRunAllExercise(json.is_run_all_click);
								setExerciseIndex(json.exercise_index);
								if (json.evaluation) {
									if (json.evaluation.mode === "async") {
										setEvaluationMode(json.evaluation.mode);
									} else {
										setEvaluationMode("");
									}
									setEvaluationExercise(json.evaluation.exercises);
								}
							}
						});
				}
				if (environment.sharedId) {
					// console.log("Shared instance");
					temp.presence = activity.getPresenceObject(function (error, network) {
						setIsShared(true);
						network.onDataReceived(temp.onNetworkDataReceived);
						network.onSharedActivityUserChanged(temp.onNetworkUserChanged);
					});
				}
			});

			let palette = new presencepalette.PresencePalette(
				document.getElementById("network-button"),
				undefined
			);
			palette.addEventListener("shared", function () {
				palette.popDown();
				// console.log("Want to share");
				temp.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						// console.log("Sharing error");
						return;
					}
					network.createSharedActivity(
						"org.sugarlabs.Exerciser",
						function (groupId) {
							// console.log("Activity shared");
							setIsHost(true);
							setIsShared(true);
							temp.isHost = true;
							if (temp.props.shared_exercises.length === 0) {
								temp.onShareAllExercise();
							}
							// console.log("after sharing:");
						}
					);
					network.onDataReceived(temp.onNetworkDataReceived);
					network.onSharedActivityUserChanged(temp.onNetworkUserChanged);
				});
			});
		}, 500);
	}

	componentDidUpdate() {
		if (this.props.shared_exercises.length !== 0 && !this.props.isShared) {
			document.getElementById("shared-button").click();
		}
	}

	onNetworkDataReceived(msg) {
		if (this.presence.getUserInfo().networkId === msg.user.networkId) {
			return;
		}
		switch (msg.content.action) {
			case "init":
				this.props.setExercises(msg.content.data.shared_exercises);
				this.props.setRunAllExercise(false);
				break;
			case "update":
				this.props.setExercises(msg.content.data.shared_exercises);
				if (msg.content.data.shared_exercises[0]) {
					this.props.shareAllExercise(msg.content.data.shared_exercises);
				}
				break;
			case "result":
				if (this.isHost) {
					this.props.addSharedResult(msg.content.result);
				}
				break;
			case "init_evaluation":
				this.props.setEvaluationMode(msg.content.data.mode);
				break;
			case "update_evaluation":
				this.props.addEvaluationExercisesPresence(
					msg.content.data.evaluation_exercises
				);
				break;
			default:
				break;
		}
	}

	onNetworkUserChanged(msg) {
		if (this.isHost) {
			const { shared_exercises } = this.props;
			let data = {
				shared_exercises: shared_exercises,
			};
			let presence = this.presence;
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "init",
					data: data,
				},
			});
			if (this.props.evaluationMode === "real") {
				data = {
					mode: "real",
				};
				presence.sendMessage(presence.getSharedInfo().id, {
					user: presence.getUserInfo(),
					content: {
						action: "init_evaluation",
						data: data,
					},
				});

				if (this.props.evaluationExercise.length !== 0) {
					let exercises = [];
					this.props.evaluationExercise.forEach((element) => {
						exercises.push({ ...element, evaluation: null });
					});
					data = {
						evaluation_exercises: exercises,
					};
					presence.sendMessage(presence.getSharedInfo().id, {
						user: presence.getUserInfo(),
						content: {
							action: "update_evaluation",
							data: data,
						},
					});
				}
			}
		}

		if (msg.move === 1) this.props.addUser(msg.user);
		else this.props.removeUser(msg.user);
		// console.log("User " + msg.user.name + " " + (msg.move === 1 ? "join" : "leave"));
	}

	onExerciseUpdate = () => {
		const { shared_exercises } = this.props;
		if (shared_exercises.length === 0) {
			this.onShareAllExercise();
		} else {
			let data = {
				shared_exercises: shared_exercises,
			};
			let presence = this.presence;
			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "update",
					data: data,
				},
			});
		}
	};

	toggleFullscreen = () => {
		this.setState((state) => {
			return {
				inFullscreenMode: !state.inFullscreenMode,
			};
		});
	};

	onExerciseResult = (id, score, time, userAnswers) => {
		let presence = this.presence;
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "result",
				result: {
					user: presence.getUserInfo(),
					id: id,
					score: score,
					time: time,
					userAnswers: userAnswers,
				},
			},
		});
	};

	exportAsEvaluation = () => {
		const { counter, exercises, isRunAll, exerciseIndex } = this.props;
		const translations = messages[this.language];

		let journalExercises = exercises.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});
		let evaluationExercise = this.props.evaluationExercise.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});

		let json = {
			counter: counter,
			exercises: journalExercises,
			is_run_all_click: isRunAll,
			exercise_index: exerciseIndex,
			evaluation: {
				mode: "async",
				exercises: evaluationExercise,
			},
		};
		let jsonData = JSON.stringify(json);
		// Compressing jsonData to be stored in Local Storage
		jsonData = LZ.compressToUTF16(jsonData);

		activity.getDatastoreObject().getMetadata(function (error, currentmetadata) {
			var metadata = {
				title: currentmetadata.title + " Evaluation",
				activity: "org.sugarlabs.Exerciser",
				timestamp: new Date().getTime(),
				creation_time: new Date().getTime(),
				file_size: 0
			};
			datastore.create(metadata, function() {
				humane.log(translations["Evaluation saved to journal"]);
				console.log("Export '"+metadata.title+"' done.")
			}, jsonData);
		});
	};

	evaluateExercise = () => {
		let presence = this.presence;
		let data = {
			mode: "real",
		};
		let realtime_button = document.getElementById("realtime-evaluate-button");

		icon.colorize(realtime_button, this.props.current_user.colorvalue);

		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "init_evaluation",
				data: data,
			},
		});

		if (this.props.sharedAllExercises.exercises) {
			this.presenceEvaluationExercise();
		}
	};

	onShareAllExercise = () => {
		let presence = this.presence;
		let data = {
			shared_exercises: this.props.exercises,
		};
		this.props.shareAllExercise(this.props.exercises);
		this.props.exercises.forEach((exercise) => {
			if (!this.props.shared_exercises.find((x) => x.id === exercise.id)) {
				this.props.editExercise({ ...exercise, shared: true });
				this.props.addSharedExercise({ ...exercise, shared: true });
			}
		});
		presence.sendMessage(presence.getSharedInfo().id, {
			user: presence.getUserInfo(),
			content: {
				action: "update",
				data: data,
			},
		});
		this.presenceEvaluationExercise();
	};

	presenceEvaluationExercise = (id = null) => {
		let exercise = "";
		let exercises = [];
		if (this.props.sharedAllExercises.exercises) {
			exercises = this.props.sharedAllExercises.exercises;
			exercises.forEach((element) => {
				if (!this.props.evaluationExercise.find((x) => x.id === element.id)) {
					this.props.addEvaluationExercise(element);
				}
			});
		} else {
			if (id !== null) {
				exercise = this.props.exercises.find((x) => x.id === id);
				exercises = this.props.evaluationExercise;

				if (!this.props.evaluationExercise.find((x) => x.id === exercise.id)) {
					this.props.addEvaluationExercise(exercise);
					exercises.push(exercise);
				}
			}
		}
		if (
			this.props.isShared &&
			this.props.evaluationMode === "real" &&
			this.props.isHost
		) {
			let presence = this.presence;
			exercises.forEach((element) => {
				delete element.evaluation;
			});
			let data = {
				evaluation_exercises: exercises,
			};

			presence.sendMessage(presence.getSharedInfo().id, {
				user: presence.getUserInfo(),
				content: {
					action: "update_evaluation",
					data: data,
				},
			});
		}
	};

	onRunAllExercise = () => {
		this.props.setRunAllExercise(true);
		if (this.props.evaluationMode !== "") {
			this.props.exercises.forEach((exercise) => {
				if (!this.props.evaluationExercise.find((x) => x.id === exercise.id)) {
					this.props.addEvaluationExercise(exercise);
				}
			});
		}
	};

	computeScore = (exercises) => {
		let score = 0;
		let length = 0;
		exercises.map((exercise) => {
			if (exercise.type === "MCQ") {
				length += exercise.questions.length;
			} else if (exercise.type === "CLOZE") {
				length += exercise.answers.length;
			} else if (exercise.type === "REORDER") {
				length += exercise.list.length;
			} else if (exercise.type === "GROUP_ASSIGNMENT") {
				length += exercise.questions.length;
			} else if (exercise.type === "FREE_TEXT_INPUT") {
				length += exercise.questions.length;
			} else if (exercise.type === "MATCHING_PAIR") {
				length += exercise.pairs.length;
			}
			let highest = 0;
			if (exercise.scores.length > 0) {
				exercise.scores.forEach((score) => {
					if (highest < score) {
						highest = score;
					}
				});
			}
			score += highest;
		});
		return score+"/"+length;
	}


	stopActivity() {
		const { counter, exercises, isRunAll, exerciseIndex } = this.props;

		let journalExercises = exercises.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});
		let evaluationExercise = this.props.evaluationExercise.map((exercise) => {
			return {
				...exercise,
				shared: false,
			};
		});

		let json = {
			counter: counter,
			exercises: journalExercises,
			is_run_all_click: isRunAll,
			exercise_index: exerciseIndex,
			evaluation: {
				mode: (this.props.evaluationMode === "real" && !this.props.isHost) ? "async" : this.props.evaluationMode,
				exercises: evaluationExercise,
			},
		};
		var score = this.computeScore(exercises);
		if (this.props.evaluationMode !== "async") {
			json.evaluation.exercises = {};
		}
		let jsonData = JSON.stringify(json);
		// Compressing jsonData to be stored in Local Storage
		jsonData = LZ.compressToUTF16(jsonData);
		let datastore = activity.getDatastoreObject();
		datastore.getMetadata(function(error, metadata) {
			metadata["score"] = score;
			datastore.setMetadata(metadata);
			datastore.setDataAsText(jsonData);
			datastore.save(function (error) {
				if (error === null) {
					// console.log("write done.");
				} else {
					// console.log("write failed.");
				}
			});
		});
	}

	setDefaultExercises() {
		// Default Exercises list
		let defaultExercises = default_activities;

		// Translate questions/answers

		let temp = this;
		let translate = function (text) {
			if (!messages[temp.language]) return text;
			let translated = messages[temp.language][text];
			return translated || text;
		};

		let translateItem = function (item) {
			let localized = [
				"title",
				"question",
				"clozeText",
				"answers",
				"groups",
				"list",
				"answer",
				"correctAns",
				"options",
				"correctGroup",
			];
			for (let property in item) {
				if (localized.indexOf(property) === -1) {
					continue;
				}
				if (!Array.isArray(item[property])) {
					if (
						typeof item[property] === "object" &&
						item[property].type === MULTIMEDIA.text
					)
						item[property].data = translate(item[property].data);
					else if (typeof item[property] !== "object")
						item[property] = translate(item[property]);
				} else {
					let elements = [];
					for (let j = 0; j < item[property].length; j++) {
						if (
							typeof item[property][j] === "object" &&
							item[property][j].type === MULTIMEDIA.text
						)
							item[property][j].data = translate(item[property][j].data);
						else if (typeof item[property][j] !== "object")
							item[property][j] = translate(item[property][j]);
						elements.push(translate(item[property][j]));
					}
					item[property] = elements;
				}
			}
			return item;
		};

		for (let i = 0; i < defaultExercises.length; i++) {
			let exercise = defaultExercises[i];
			exercise = translateItem(exercise);
			if (
				exercise.type === "MCQ" ||
				exercise.type === "FREE_TEXT_INPUT" ||
				exercise.type === "GROUP_ASSIGNMENT"
			) {
				for (let index = 0; index < exercise.questions.length; index++)
					exercise.questions[index] = translateItem(exercise.questions[index]);
			} else if (exercise.type === "MATCHING_PAIR") {
				for (let index = 0; index < exercise.pairs.length; index++)
					exercise.pairs[index] = translateItem(exercise.pairs[index]);
			} else if (exercise.type === "POLL") {
				translateItem(exercise.question);
				translateItem(exercise.options);
			}
		}
		// Add to Exercise list
		this.props.setExercises(defaultExercises);
		this.props.setExerciseCounter(defaultExercises.length + 1);
	}

	render() {
		return (
			<IntlProvider locale={this.language} messages={messages[this.language]}>
				<Router>
					<div className='App-container'>
						<Navbar
							onStop={() => this.stopActivity()}
							inFullscreenMode={this.state.inFullscreenMode}
							toggleFullscreen={this.toggleFullscreen}
							inEditMode={this.state.inEditMode}
							toggleEditMode={(edit) => this.toggleEditMode(edit)}
							runAllExercise={this.onRunAllExercise}
							onShareAll={this.onShareAllExercise}
							evaluate={(mode) => this.exportAsEvaluation()}
						/>
						<Main
							inFullscreenMode={this.state.inFullscreenMode}
							inEditMode={this.state.inEditMode}
							onUpdate={this.onExerciseUpdate}
							onSharedResult={this.onExerciseResult}
							setExercises={this.props.setExercises}
							presenceEvaluation={(id) => this.presenceEvaluationExercise(id)}
							runNextExercise={(id) => this.runNextExercise(id)}
							evaluate={this.evaluateExercise}
						/>
					</div>
				</Router>
			</IntlProvider>
		);
	}
}

function MapStateToProps(state) {
	return {
		counter: state.exercise_counter,
		exercises: state.exercises,
		shared_exercises: state.shared_exercises,
		isHost: state.isHost,
		isRunAll: state.isRunAll,
		exerciseIndex: state.exerciseRunning,
		isShared: state.isShared,
		evaluationMode: state.evaluation_mode,
		evaluationExercise: state.evaluation_exercise,
		sharedAllExercises: state.shared_all_exercises,
		current_user: state.current_user,
	};
}

export default connect(MapStateToProps, {
	setExercises,
	editExercise,
	setExerciseCounter,
	setRunAllExercise,
	setIsHost,
	setIsShared,
	setExerciseIndex,
	addUser,
	setUser,
	removeUser,
	addSharedResult,
	shareAllExercise,
	addSharedExercise,
	setEvaluationMode,
	setEvaluationExercise,
	addEvaluationExercise,
	addEvaluationExercisesPresence,
})(Sugarizer);
