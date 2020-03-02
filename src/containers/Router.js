import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import useDimensions from "react-use-dimensions";

import ExerciseList from "./ExerciseList";
import Scores from "./Scores/Scores"

import MCQForm from "./Builders/MCQForm";
import CLOZEForm from "./Builders/CLOZEForm";
import REORDERForm from "./Builders/REORDERForm";
import GroupAssignmentForm from "./Builders/GroupAssignmentForm";
import FreeTextInputForm from "./Builders/FreeTextInputForm";
import MATCHINGPAIRForm from "./Builders/MatchingForm";

import MCQPlay from "./Players/MCQPlayer";
import CLOZEPlay from "./Players/CLOZEPlayer";
import REORDERPlay from "./Players/REORDERPlayer";
import GroupAssignmentPlayer from "./Players/GroupAssignmentPlayer";
import FreeTextInputPlayer from "./Players/FreeTextInputPlayer";
import MATCHINGPAIRPlayer from "./Players/MatchingPlayer";

import { injectIntl } from 'react-intl';
import '../css/index.css';

import NewExerciseTemplate from "./Builders/Template";
import PresenceScores from "./Scores/PresenceScores";

const Main = (props) => {
	const [ref, containerSize] = useDimensions();

	let zoom = '100%';
	if (props.inFullscreenMode){
		let boardSize = containerSize.height + (props.inFullscreenMode?55:0);
		const paddingPercent = 3;
		zoom = `${((boardSize/containerSize.height) + paddingPercent/100) * 100}%`;
	}
	const { onUpdate, onSharedResult, inEditMode, inFullscreenMode } = props;

	return (
		<div className="main-container" ref={ref} style={{zoom: zoom, padding: (props.inFullscreenMode && "0px")}}>
			<Switch>
				<Route exact path="/" render={props => <ExerciseList onUpdate={onUpdate} inEditMode={inEditMode} inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/new" render={props => <NewExerciseTemplate inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/scores" render={props => <Scores onSharedResult={onSharedResult} inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* MCQ */}
				<Route exact path="/new/mcq" render={props => <MCQForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/mcq" render={props => <MCQForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/mcq" render={props => <MCQPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* CLOZE */}
				<Route exact path="/new/cloze" render={props => <CLOZEForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/cloze" render={props => <CLOZEForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/cloze" render={props => <CLOZEPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* REORDER */}
				<Route exact path="/new/reorder" render={props => <REORDERForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/reorder" render={props => <REORDERForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/reorder" render={props => <REORDERPlay inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* // GROUP ASSIGNMENT */}
				<Route exact path="/new/group" render={props => <GroupAssignmentForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/group" render={props => <GroupAssignmentForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/group" render={props => <GroupAssignmentPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* // FREE TEXT INPUT */}
				<Route exact path="/new/freeText" render={props => <FreeTextInputForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/freeText" render={props => <FreeTextInputForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/freeText" render={props => <FreeTextInputPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				{/* MATCHING_PAIR */}
				<Route exact path="/new/match" render={props => <MATCHINGPAIRForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/edit/match" render={props => <MATCHINGPAIRForm inFullscreenMode={inFullscreenMode} {...props} />} />
				<Route exact path="/play/match" render={props => <MATCHINGPAIRPlayer inFullscreenMode={inFullscreenMode} {...props} />} />

				<Route exact path="/presence/scores" render={props => <PresenceScores inFullscreenMode={inFullscreenMode} {...props} />} />

			</Switch>
		</div>
	)
};



export default injectIntl(withRouter(Main));