import React from "react";
import {Switch, Route, withRouter} from "react-router-dom";

import ExerciseList from "./ExerciseList";
import Scores from "./Scores/Scores"

import MCQForm from "./Builders/MCQForm";
import CLOZEForm from "./Builders/CLOZEForm";
import REORDERForm from "./Builders/REORDERForm"

import MCQPlay from "./Players/MCQPlayer";
import CLOZEPlay from "./Players/CLOZEPlayer";
import REORDERPlay from "./Players/REORDERPlayer"

import {injectIntl} from 'react-intl';
import '../css/index.css';

import NewExerciseTemplate from "./Builders/Template";
import PresenceScores from "./Scores/PresenceScores";

const Main = props => {

    const {onUpdate, onSharedResult}= props;

    return(
        <div className="main-container">
            <Switch>
                <Route exact path="/" render={props=> <ExerciseList onUpdate={onUpdate} {...props}/>}/>
                <Route exact path="/new" render={props=> <NewExerciseTemplate {...props}/>} />
                <Route exact path="/scores" render={props=> <Scores onSharedResult={onSharedResult} {...props}/>} />

                {/* // MCQ */}
                <Route exact path="/new/mcq" render={props=> <MCQForm {...props}/>} />
                <Route exact path="/edit/mcq" render={props=> <MCQForm {...props}/>} />
                <Route exact path="/play/mcq" render={props=> <MCQPlay {...props}/>} />

                {/* // CLOZE */}
                <Route exact path="/new/cloze" render={props=> <CLOZEForm {...props}/>} />
                <Route exact path="/edit/cloze" render={props=> <CLOZEForm {...props}/>} />
                <Route exact path="/play/cloze" render={props=> <CLOZEPlay {...props}/>} />

                {/* // REORDER */}
                <Route exact path="/new/reorder" render={props=> <REORDERForm {...props}/>} />
                <Route exact path="/edit/reorder" render={props=> <REORDERForm {...props}/>} />
                <Route exact path="/play/reorder" render={props=> <REORDERPlay {...props}/>} />

                <Route exact path="/presence/scores" render={props=> <PresenceScores {...props}/>} />

            </Switch>
        </div>
    )
};



export default injectIntl(withRouter(Main));