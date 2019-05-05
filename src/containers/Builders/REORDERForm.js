import React, {Component} from "react";
import {connect} from "react-redux";
import {incrementExerciseCounter} from "../../store/actions/increment_counter";
import {addNewExercise, editExercise} from "../../store/actions/exercises";
import {FormattedMessage} from 'react-intl';
import {withRouter} from "react-router-dom"
import {
    FINISH_EXERCISE,
    QUESTION,
    TITLE_OF_EXERCISE,
    TEST_EXERCISE,
    QUESTION_ERROR,
    ITEM,
    LIST_ERROR, TITLE_ERROR, REORDER_LIST,
} from "../translation";
import "../../css/REORDERForm.css";

class REORDERForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            id: -1,
            title: '',
            question: '',
            list: ['',''],
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
            const {id, title, question, scores, times, list} = this.props.location.state.exercise;
            this.setState({
                ...this.state,
                id: id,
                title: title,
                edit: true,
                isFormValid: true,
                question: question,
                scores: scores,
                times: times,
                list: list
            });
        }
    }

    handleChangeAns = e => {
        const index = Number(e.target.name.split('-')[1]);
        const newlist = this.state.list.map((item, i) => (
            i === index ? e.target.value : item
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
        const {list} = this.state;
        if (list.length > 2) {
            list.pop();
            this.setState(
                {list: list},
                () => {
                    this.checkFormValidation();
                }
            )
        }
    };

    handleNewAns = () => {
        this.setState(
            {list: [...this.state.list, '']},
            () => {
                this.checkFormValidation();
            }
        )
    };

    changeOrder= (curr, next) => {
        const {list}= this.state;

        if(next> list.length-1 || next<0) return;
        let newList= list.slice();
        let temp= newList[curr];
        newList[curr]= newList[next];
        newList[next]= temp;


        this.setState({list: newList})
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
            question: e.target.value
        }, () => {
            this.checkFormValidation();
        });
    };

    checkFormValidation = () => {
        const {title, question, list} = this.state;
        let isFormValid = true;

        if (question === '') {
            isFormValid = false;
        }

        if (title === '') {
            isFormValid = false;
        }

        list.forEach((item, i) => {
            if (item === '') {
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
            scores: this.state.scores,
        };


        if (this.state.edit) {
            this.props.editExercise(exercise);
        } else {
            this.props.addNewExercise(exercise);
            this.props.incrementExerciseCounter();
        }

        if(bool)
            this.props.history.push('/play/reorder', {exercise: exercise, edit: true});
        else
            this.props.history.push('/')
    };

    render() {
        const {errors, list} = this.state;

        let lists = list.map((ans, i) => {
            return (
                <div className="row" key={`answers-${i}`}>
                    <div className="col-md-6">
                        <div className="form-group item">
                            <label htmlFor={`answer-${i}`}>
                                {i + 1}
                            </label>
                            <FormattedMessage id={ITEM} values={{number:(i + 1)}}>
                                {placeholder => <input
                                    className="answers input-ans"
                                    name={`answer-${i}`}
                                    type="text"
                                    value={ans}
                                    placeholder={`${placeholder}`}
                                    onChange={this.handleChangeAns}
                                />}
                            </FormattedMessage>
                            <button className="up-down-button up-button" onClick={()=>this.changeOrder(i,i-1)}/>
                            <button className="up-down-button down-button" onClick={()=>this.changeOrder(i,i+1)}/>
                        </div>
                    </div>
                </div>
            )
        });

        let title_error = '';
        let question_error = '';
        let list_error = '';

        if (errors['title']) {
            title_error = <span style={{color: "red"}}><FormattedMessage id={TITLE_ERROR}/></span>;
        }
        if (errors['question']) {
            question_error = <span style={{color: "red"}}><FormattedMessage id={QUESTION_ERROR}/></span>;
        }
        if (errors['list']) {
            list_error = <span style={{color: "red"}}><FormattedMessage id={LIST_ERROR}/></span>;
        }


        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-sm-10">
                        <div>
                        <p><strong><FormattedMessage id={REORDER_LIST}/></strong></p>
                            <hr className="my-3"/>
                            <div className="col-md-12">
                                <form onSubmit={this.handleNewEvent}>
                                    <div className="row">
                                        <div className="form-group">
                                            <label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE}/></label>
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
                                            <label htmlFor="question"><FormattedMessage id={QUESTION}/>:</label>
                                            <input
                                                className="input-mcq"
                                                type="text"
                                                id="question"
                                                value={this.state.question}
                                                onChange={this.handleChangeQues}
                                            />
                                            {question_error}
                                        </div>
                                    </div>
                                    {lists}
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
                                        <br/>
                                        <div className="justify-content-end">
                                            <button
                                                onClick={(e)=>this.submitExercise(false,e)}
                                                className={"btn button-finish"}
                                                disabled={!this.state.isFormValid}
                                            >
                                                <FormattedMessage id={FINISH_EXERCISE}/>
                                            </button>
                                            <button
                                                onClick={(e)=>this.submitExercise(true, e)}
                                                className={"btn button-finish"}
                                                disabled={!this.state.isFormValid}
                                            >
                                                <FormattedMessage id={TEST_EXERCISE}/>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    }

}

function MapStateToProps(state) {
    return {
        counter: state.exercise_counter
    }
}

export default withRouter(
    connect(MapStateToProps,
        {addNewExercise, incrementExerciseCounter, editExercise}
    )(REORDERForm));