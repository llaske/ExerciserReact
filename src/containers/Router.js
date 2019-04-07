import React from "react";
import {Switch, Route, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import ExerciseList from "./ExerciseList";
import Scores from "./Scores/Scores"

import MCQForm from "./Builders/MCQForm";
import CLOZEForm from "./Builders/CLOZEForm";
import REORDERForm from "./Builders/REORDERForm";
import FreeTextInputForm from "./Builders/FreeTextInputForm";

import MCQPlay from "./Players/MCQPlayer";
import CLOZEPlay from "./Players/CLOZEPlayer";
import REORDERPlay from "./Players/REORDERPlayer";
import FreeTextInputPlay from "./Players/FreeTextInputPlayer";

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
                <Route exact path="/new" component={NewExerciseTemplate} {...props}/>
                <Route exact path="/scores" render={()=> <Scores onSharedResult={onSharedResult}/>} {...props}/>

                // MCQ
                <Route exact path="/new/mcq" component={MCQForm} {...props}/>
                <Route exact path="/edit/mcq" component={MCQForm} {...props}/>
                <Route exact path="/play/mcq" component={MCQPlay} {...props}/>

                // CLOZE
                <Route exact path="/new/cloze" component={CLOZEForm} {...props}/>
                <Route exact path="/edit/cloze" component={CLOZEForm} {...props}/>
                <Route exact path="/play/cloze" component={CLOZEPlay} {...props}/>

                // REORDER
                <Route exact path="/new/reorder" component={REORDERForm} {...props}/>
                <Route exact path="/edit/reorder" component={REORDERForm} {...props}/>
                <Route exact path="/play/reorder" component={REORDERPlay} {...props}/>

                // FREE TEXT INPUT
                <Route exact path="/new/freetextInput" component={FreeTextInputForm} {...props}/>
                <Route exact path="/edit/freetextInput" component={FreeTextInputForm} {...props}/>
                <Route exact path="/play/freetextInput" component={FreeTextInputPlay} {...props}/>

                <Route exact path="/presence/scores" component={PresenceScores} {...props}/>
            </Switch>
        </div>
    )
};

function MapStateToProps(state) {
    return {

    }
}

export default injectIntl(withRouter(connect(MapStateToProps)(Main)));