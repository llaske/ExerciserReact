import React, { Component } from "react";
import "../css/Exercise.css";
import { FormattedMessage } from "react-intl";
import {
	QUESTIONS,
	BEST_SCORE,
	MCQ,
	REORDER_LIST,
	CLOZE_TEXT,
	GROUP_ASSIGNMENT,
	FREE_TEXT_INPUT,
	POLL,
	QUESTION_SINGULAR,
	PLAY,
	EDIT,
	DELETE,
	MATCHING_PAIR,
} from "../containers/translation";
import cloze_background from "../media/template/cloze_image.svg";
import mcq_background from "../media/template/mcq_image.svg";
import reorder_background from "../media/template/list_reorder_image.svg";
import group_assignment_background from "../media/template/group_image.svg";
import free_text_input_background from "../media/template/freetext_input_image.svg";
import macthing_pair_background from "../media/template/matching_pair_image.svg";

class Exercise extends Component {
	constructor(props) {
		super(props);
		const { id } = this.props;

		this.state = {
			id: id,
		};

		this.background = {
			CLOZE: cloze_background,
			MCQ: mcq_background,
			REORDER: reorder_background,
			GROUP_ASSIGNMENT: group_assignment_background,
			FREE_TEXT_INPUT: free_text_input_background,
			MATCHING_PAIR: macthing_pair_background,
		};
	}

	// when play button is clicked
	playExercise = () => {
		this.props.onPlay(this.state.id);
	};

	// when edit button is clicked
	editExercise = () => {
		this.props.onEdit(this.state.id);
	};

	// when delete button is clicked
	deleteExercise = () => {
		this.props.onDelete(this.state.id);
	};

	// when shared button is clicked
	shareExercise = () => {
		this.props.onShare(this.state.id, !this.props.shared);
	};

	// when result button is clicked during presence
	result = () => {
		this.props.presenceResult(this.state.id);
	};
	evaluateExercise = () => {
		this.props.onEvaluate(this.state.id);
	};

	render() {
		const {
			title,
			type,
			questions,
			scores,
			answers,
			list,
			isShared,
			isHost,
			shared,
			pairs,
		} = this.props;
		let { thumbnail } = this.props;

		let highest = 0;
		if (scores.length > 0) {
			scores.forEach((score) => {
				if (highest < score) {
					highest = score;
				}
			});
		}

		if (
			thumbnail &&
			!thumbnail.startsWith("data:image") &&
			!thumbnail.includes("/static/")
		)
			thumbnail = require(`../media/defaultExerciseThumbnail/images/${thumbnail}`);

		let play = (
			<FormattedMessage id={PLAY} defaultMessage={PLAY}>
				{(msg) => (
					<button
						type='button'
						title={msg}
						className='play-button'
						onClick={this.playExercise}
					/>
				)}
			</FormattedMessage>
		);
		let edit = (
			<FormattedMessage id={EDIT} defaultMessage={EDIT}>
				{(msg) => (
					<button
						type='button'
						title={msg}
						disabled={shared}
						className='edit-button'
						onClick={this.editExercise}
					/>
				)}
			</FormattedMessage>
		);
		let cross = (
			<FormattedMessage id={DELETE} defaultMessage={DELETE}>
				{(msg) => (
					<button
						type='button'
						title={msg}
						disabled={shared}
						className='delete-button float-right'
						onClick={this.deleteExercise}
					/>
				)}
			</FormattedMessage>
		);

		let share = "";
		let results = "";

		if (isShared && !isHost) {
			edit = "";
			cross = "";

			if (this.props.run_all_share) {
				play = "";
			}
		}
		if (!isShared) {
			share = (
				<button
					type='button'
					className={"share-button"}
					onClick={this.shareExercise}
				/>
			);
		}
		if (isShared && isHost) {
			let bg = "non-shared-exercise";
			if (shared) {
				bg = "shared-exercise";
				results = (
					<button
						type='button'
						className={"result-button"}
						onClick={this.result}
					/>
				);
			}
			share = (
				<button
					type='button'
					className={"share-button " + bg}
					onClick={this.shareExercise}
				/>
			);
		}
		if (this.props.allowEvaluation) {
			play = (
				<button
					type='button'
					className='evaluate-button'
					onClick={this.evaluateExercise}
				/>
			);
		}

		if (this.props.evaluationMode === "async") {
			share = "";
		}

		let length = 0;
		let localized_type = "";

		if (type === "MCQ") {
			length = questions.length;
			localized_type = MCQ;
		}
		if (type === "CLOZE") {
			length = answers.length;
			localized_type = CLOZE_TEXT;
		}
		if (type === "REORDER") {
			length = list.length;
			localized_type = REORDER_LIST;
		}
		if (type === "GROUP_ASSIGNMENT") {
			length = questions.length;
			localized_type = GROUP_ASSIGNMENT;
		}
		if (type === "FREE_TEXT_INPUT") {
			length = questions.length;
			localized_type = FREE_TEXT_INPUT;
		}
		if (type === "MATCHING_PAIR") {
			length = pairs.length;
			localized_type = MATCHING_PAIR;
		}
		if (type === "POLL") {
			length = this.props.options.length;
			localized_type = POLL;
		}

		let question_string = (
			<FormattedMessage id={QUESTIONS} values={{ number: length }} />
		);
		if (length === 1)
			question_string = (
				<FormattedMessage id={QUESTION_SINGULAR} values={{ number: length }} />
			);

		return (
			<div className='col-md-10'>
				<div className={`card ${this.props.inEditMode && "draggable-card"}`}>
					{this.props.allowDraggable && (
						<div {...this.props.allowDraggable} className='handler my-1'>
							<img
								style={{ width: "1.5em" }}
								src={require("../icons/exercise/reorder-drag.png")}
								alt='handler'
							></img>
						</div>
					)}
					<div className='card-img-container'>
						<img
							className='card-img-top'
							src={thumbnail !== "" ? thumbnail : this.background[type]}
							alt='Exercise Thumbnail'
						/>
					</div>
					<div className='card-body'>
						<h3 className='card-title'>{title}</h3>
						<div>
							<strong>
								<FormattedMessage id={localized_type} />
							</strong>
						</div>
						<span className='card-text'>
							<div className='exercise-card-question'>{question_string}</div>
							{this.props.evaluationMode === "" && (
								<div className='exercise-card-hiscore'>
									<FormattedMessage id={BEST_SCORE} />: {highest}/{length}
								</div>
							)}
						</span>
						<div className='buttons'>
							{this.props.inEditMode ? (
								<React.Fragment>
									{edit}
									{cross}
									{results}
								</React.Fragment>
							) : (
								<React.Fragment>
									{play}
									{share}
									{results}
								</React.Fragment>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Exercise;
