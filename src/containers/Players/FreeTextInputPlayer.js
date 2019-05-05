import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {addScoreTime} from '../../store/actions/exercises';
import "../../css/FreeTextInputPlayer.css";
import {FINISH_EXERCISE, SUBMIT_QUESTION} from "../translation";
import {FormattedMessage} from 'react-intl';


class FreeTextInputPlayer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: -1,
            title: '',
            questions: [],
            userans: [],
            noOfQuestions: 1,
            submitted: false,
            scores: [],
            times: [],
            currentScore: 0,
            currentTime: 0,
            intervalID: -1,
            goBackToEdit: false,
            checkans: []
        }
    }

    // load the exercise from props
    componentDidMount() {
        if (this.props.location.state) {
            let intervalId = setInterval(this.timer, 1000);
            const {id, title, questions, scores, times} = this.props.location.state.exercise;

            let goBackToEdit = false;
            if (this.props.location.state.edit) goBackToEdit = true;

            let {userans} = this.state;
            userans = questions.map((quest, index)=>{
                return "Wrong";
            });

            this.setState({
                ...this.state,
                id: id,
                title: title,
                questions: questions,
                noOfQuestions: questions.length,
                userans: userans,
                noOfQuestions: questions.length,
                intervalID: intervalId,
                scores: scores,
                times: times,
                goBackToEdit: goBackToEdit
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    // to measure time
    timer = () => {
        this.setState({currentTime: this.state.currentTime + 1});
    };
    
    // submit the exercise ( calculate score and time ) show correct/ wrong ans
    submitExercise = () => {
        const {questions, userans} = this.state;
        let checkans = [];
        let score = 0;
        questions.forEach(function(question, index){
            if(question.answer.toLowerCase() == userans[question.id - 1].toLowerCase()) {
                score += 1;
                checkans.push(true);
            } else {
                checkans.push(false);
            }
                
        });
        this.setState({
            submitted: true,
            currentScore: score,
            checkans:checkans
        })
    };

    // redirect to scores screen/ edit screen
    finishExercise = () => {
        const {scores, currentScore, id, currentTime, times, noOfQuestions, goBackToEdit} = this.state;
        let exercise = this.props.location.state.exercise;

        if (goBackToEdit)
            this.props.history.push('/edit/freetextInput', {exercise: exercise});
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
                type: "Freetext Input"
            });
        }
    };

    handleChangeAns(e){
        let answerId = e.target.id;
        answerId = answerId.substring(answerId.indexOf('-') + 1, answerId.length);

        let {userans} = this.state;
        userans[answerId-1] = e.target.value;
        this.setState({
            ...this.state,
            userans: userans
        });
    }

    render() {
        const {questions} = this.state;
        let buttonText = <FormattedMessage id={SUBMIT_QUESTION}/>;
        if (this.state.submitted) buttonText = <FormattedMessage id={FINISH_EXERCISE}/>

        let freeTextQuestions = questions.map((quest, index) => {
            if (this.state.submitted) {
                let ans = 'wrong';
                if (this.state.checkans[index]) ans = 'right';
                return (
                    <div className="col-md-3 questions" key={index+1}>
                        <div>
                            {index+1}.{quest.question}
                        </div>
                        <div className={"freetext-div checked-ans " + ans}>
                            {this.state.userans[index]}
                        </div>
                    </div>                
                )
            } else {
                return(
                    <div className="col-md-3 questions" key={index+1}>
                        <div>
                            {index+1}.{quest.question}
                        </div>
                        <input
                            className="input-freeText"
                            type="text"
                            id={`answer-${index+1}`}
                            onChange={this.handleChangeAns.bind(this)
                            }
                        />
                    </div>
                );
            }
        });

        return (
            <div className="container freeText-container">
                <div className="row align-items-center justify-content-center">
                    <div className="col-sm-10">
                        <div className="col-md-12">
                            <div className="jumbotron">
                                <p className="lead">{this.state.title}</p>
                                <hr className="my-4"/>
                                <div className="row align-items-center justify-content-center">
                                {freeTextQuestions}
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
            </div>
        );
    }

}

function MapStateToProps(state) {
    return {}
}

export default withRouter(
    connect(MapStateToProps, {addScoreTime})(FreeTextInputPlayer));