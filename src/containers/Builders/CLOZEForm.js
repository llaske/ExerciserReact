import React, {Component} from "react";
import {connect} from "react-redux";
import {incrementExerciseCounter} from "../../store/actions/increment_counter";
import {addNewExercise, editExercise} from "../../store/actions/exercises";
import {FormattedMessage} from 'react-intl';
import {withRouter} from "react-router-dom"
import "../../css/CLOZEForm.css"
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import picoModal from 'picomodal';
import {
    FINISH_EXERCISE,
    QUESTION,
    TITLE_OF_EXERCISE,
    CLOZE,
    CLOZE_TEXT,
    BLANK_TYPE,
    WRITE_IN,
    OPTIONS,
    ADD_BLANK,
    TEST_EXERCISE,
    CLOZE_ERROR,
    ANSWER_ERROR,
    QUESTION_ERROR,
    TITLE_ERROR,
    BLANKS_ERROR,
    BLANK_REUSED_ERROR
} from "../translation";

class CLOZEForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            id: -1,
            title: '',
            question: '',
            clozeText: '',
            scores: [],
            times: [],
            nextBlank: 1,
            cursorPos: 0,
            isFormValid: false,
            answers: [''],
            writeIn: "OPTIONS",
            thumbnail: '',
            errors: {
                question: false,
                answers: false,
                title: false,
                cloze: false,
                unevenBlanks: false,
                blankReused: false
            },
            typeOfExcercise:'Cloze'
        };
    }

    // in case of edit load the exercise
    componentDidMount() {
        if (this.props.location.state) {
            const {id, title, question, scores, times, clozeText, answers, writeIn, thumbnail} = this.props.location.state.exercise;
            let nextBlank = answers.length + 1;

            this.setState({
                ...this.state,
                id: id,
                title: title,
                edit: true,
                isFormValid: true,
                question: question,
                scores: scores,
                times: times,
                clozeText: clozeText,
                answers: answers,
                writeIn: writeIn,
                nextBlank: nextBlank,
                thumbnail: thumbnail
            });
        }
    }

    handleChangeAns = e => {
        const index = Number(e.target.name.split('-')[1]);
        const ans = this.state.answers.map((ans, i) => (
            i === index ? e.target.value : ans
        ));
        let error = false;
        if (e.target.value === '') {
            error = true;
        }
        this.setState({
            ...this.state,
            answers: ans,
            errors: {
                ...this.state.errors,
                answers: error
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
        const {answers} = this.state;
        if (answers.length > 1) {
            answers.pop();
            this.setState(
                {answers: answers},
                () => {
                    this.checkFormValidation();
                }
            )
        }
    };

    handleNewAns = () => {
        const {answers} = this.state;
        this.setState(
            { answers: [...answers, ''] },
            () => {
                this.checkFormValidation();
            }
        )
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

    // to check for validation
    checkFormValidation = () => {
        const {title, question, answers, clozeText, nextBlank, errors} = this.state;
        let isFormValid = true;
        let unevenBlanks = false;

        if (question === '') {
            isFormValid = false;
        }

        if (title === '') {
            isFormValid = false;
        }

        if (clozeText === '') {
            isFormValid = false;
        }

        answers.forEach((ans, i) => {
            if (ans === '') {
                isFormValid = false;
            }
        });

        if (answers.length < (nextBlank-1)) {
            isFormValid = false;
            unevenBlanks = true;
        }

        if (errors['blankReused'])
            isFormValid = false;

        this.setState({
            ...this.state,
            errors: {
                ...this.state.errors,
                unevenBlanks: unevenBlanks
            },
            isFormValid: isFormValid
        })
    };

    handleNewEvent = event => {
        event.preventDefault();
    };

    // submit and exercise and redirect
    submitExercise = (bool, e) => {
        e.preventDefault();

        let id = this.state.id;
        if (this.state.id === -1) {
            id = this.props.counter;
        }

        let exercise = {
            title: this.state.title,
            id: id,
            type: "CLOZE",
            times: this.state.times,
            question: this.state.question,
            clozeText: this.state.clozeText,
            answers: this.state.answers,
            scores: this.state.scores,
            writeIn: this.state.writeIn,
            thumbnail: this.state.thumbnail
        };


        if (this.state.edit) {
            this.props.editExercise(exercise);
        } else {
            this.props.addNewExercise(exercise);
            this.props.incrementExerciseCounter();
        }

        if (bool)
            this.props.history.push('/play/cloze', {exercise: exercise, edit: true});
        else
            this.props.history.push('/')
    };

    handleChangeCloze = e => {
        let error = false;

        if (e.target.value === '') {
            error = true;
        }

        let nextBlank = this.findNextBlank(e.target.value);
        let blankReused = this.checkReusedBlank(e.target.value);
        
        this.setState({
            ...this.state,
            errors: {
                ...this.state.errors,
                cloze: error,
                blankReused: blankReused
            },
            clozeText: e.target.value,
            nextBlank: nextBlank
        }, () => {
            this.checkFormValidation();
        });
    };

    handleKeyDown = (event) => {
        if (event.keyCode) {
            let pos = event.target.selectionStart;
            this.setState({cursorPos: pos})
        }
    };

    handleMouseDown = (event) => {
        let pos = event.target.selectionStart;
        this.setState({cursorPos: pos})
    };

    // to find next blank number in cloze text
    findNextBlank = (clozeText) => {
        let cloze = clozeText.split(' ');
        let blanks = [];
        let blank_no = 1;

        for (let i = 0; i < cloze.length; i++) {
            let text = cloze[i];
            if (text[0] === '-') {
                if (text[2] === '-') {
                    blanks[text[1]] = true;
                } else {
                    blanks[text[1] + text[2]] = true;
                }
            }
        }

        for (let i = 1; i < blanks.length; i++) {
            if (!blanks[i]) {
                blank_no = i;
                break;
            }
            if (i === blanks.length - 1) {
                blank_no = blanks.length;
                break;
            }
        }
        return blank_no
    };

    // to find if a blank is reused
    checkReusedBlank = (clozeText) => {
        let cloze = clozeText.split(' ');
        let blanks = [];

        for (let i = 0; i < cloze.length; i++) {
            let text = cloze[i];
            if (text[0] === '-') {
                if (text[2] === '-') {
                    if( blanks[text[1]] && text[2] === '-')
                        return true;
                    else
                        blanks[text[1]] = true;
                } else {
                    if( blanks[text[1] + text[2]] && text[3] === '-')
                        return true;
                    else
                        blanks[text[1] + text[2]] = true;
                }
            }
        }

        return false;
    }

    // to add a blank dynamically
    addBlank = () => {
       const {clozeText, nextBlank, cursorPos} = this.state;

        let updatedCloze = `${clozeText} -${nextBlank}- `;
        
        let blank = this.findNextBlank(updatedCloze);

        this.setState({
            clozeText: updatedCloze,
            nextBlank: blank,
            cursorPos: cursorPos + 5
        }, () => {
            this.checkFormValidation();
        });
    };

    insertThumbnail = () => {
        env.getEnvironment( (err, environment) => {
            if(environment.user) {
                // Display journal dialog popup
                chooser.show((entry) => {
                    if (!entry) {
                          return;
                    }
                    var dataentry = new datastore.DatastoreObject(entry.objectId);
                    dataentry.loadAsText((err, metadata, text) => {
                        this.setState({
                            ...this.state,
                            thumbnail: text
                        }); 
                    });
                }, {mimetype: 'image/png'}, {mimetype: 'image/jpeg'});
            }
        });
    };

    showThumbnail = () => {
        let {thumbnail} = this.state;
        thumbnail = (thumbnail?thumbnail:require('../../images/cloze_image.svg'));
        picoModal({
            content: (
                `<img src = ${thumbnail} \
                    style='max-height: 100%;\
                        max-width: 100%;\
                        margin: auto;\
                        left: 0;\
                        right: 0;\
                        top: 0;\
                        bottom: 0;\
                        position: absolute;'>\
                </img>\
                <button id='close-button' style='background-image: url(${require('../../icons/exercise/delete.svg')});\
                        position: absolute; right: 0px; width: 50px; height: 50px; margin-top: 5px;\
                        border-radius: 25px; background-position: center; background-size: contain; \
                        background-repeat: no-repeat'>\
                </button>`),
			closeButton: false,
			modalStyles: {
				backgroundColor: "#e5e5e5",
				height: "400px",
				width: "600px",
				maxWidth: "90%"
			}
        })
        .afterShow(function(modal) {
            let closeButton = document.getElementById('close-button');
            closeButton.addEventListener('click', function() {
				modal.close();
			});
		})
		.afterClose((modal) => {
			modal.destroy();
		})
		.show();
    };

    render() {
        const {errors, answers} = this.state;
        let inputs = answers.map((ans, i) => {
            return (
                <div className="row" key={`answers-${i}`}>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor={`answer-${i}`}>
                                {i + 1}
                            </label>
                            <FormattedMessage id={CLOZE} values={{number:(i+1)}}>
                                {placeholder => <input
                                    className="answers input-ans"
                                    name={`answer-${i}`}
                                    type="text"
                                    value={ans}
                                    placeholder={`${placeholder}`}
                                    onChange={this.handleChangeAns}/>}
                            </FormattedMessage>
                        </div>
                    </div>
                </div>
            )
        });

        let title_error = '';
        let question_error = '';
        let answer_error = '';
        let cloze_error = '';
        let uneven_blanks_error = '';
        let blank_reused_error = '';

        if (errors['title']) {
            title_error = <span style={{color: "red"}}><FormattedMessage id={TITLE_ERROR}/></span>;
        }
        if (errors['question']) {
            question_error = <span style={{color: "red"}}><FormattedMessage id={QUESTION_ERROR}/></span>;
        }
        if (errors['answers']) {
            answer_error = <span style={{color: "red"}}><FormattedMessage id={ANSWER_ERROR}/></span>;
        }
        if (errors['cloze']) {
            cloze_error = <span style={{color: "red"}}><FormattedMessage id={CLOZE_ERROR}/></span>;
        }
        if (errors['unevenBlanks']) {
            uneven_blanks_error = <span style={{color: "red"}}><FormattedMessage id={BLANKS_ERROR}/></span>;
        }
        if (errors['blankReused']) {
            blank_reused_error = <span style={{color: "red"}}><FormattedMessage id={BLANK_REUSED_ERROR}/></span>;
        }

        let thumbnail;
        if(this.state.thumbnail === '') {
            thumbnail = <img src = {require('../../images/cloze_image.svg')}
                        style = {{height: '200px'}}
                        onClick = {this.showThumbnail}
                        alt="Thumbnail"/> 
        } else {
            thumbnail = <img src = {this.state.thumbnail}
                        style = {{height: '200px'}}
                        onClick = {this.showThumbnail}
                        alt="Thumbnail"/>
        }
        
        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-sm-10">
                            <div>
                            <p><strong><FormattedMessage id={CLOZE_TEXT}/></strong></p>
                            <hr className="my-3"/>
                                <div className="col-md-12">
                                    <form onSubmit={this.handleNewEvent}>
                                        <div className="row">
                                            <div className="form-group">
                                                <div className = "thumbnail">
                                                    {thumbnail}
                                                    {this.state.thumbnail &&
                                                    <button className="btn button-cancel" 
                                                    onClick={() => {this.setState({...this.state, thumbnail:''})}}
                                                    >
                                                    </button>}
                                                </div>
                                                <label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE}/></label>
                                                <button className="btn button-finish button-thumbnail" 
                                                    onClick={this.insertThumbnail}/>
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
                                        <div className="row">
                                            <div className="form-group">
                                                <label><FormattedMessage id={BLANK_TYPE}/>:</label>
                                                <div className="form-check">
                                                    <input type="radio" name="writeIn"
                                                        value={"WRITEIN"}
                                                        checked={this.state.writeIn === "WRITEIN"}
                                                        onChange={(e) => {
                                                            this.setState({writeIn: e.target.value})
                                                        }}/>
                                                    <label className="form-check-label">
                                                        <FormattedMessage id={WRITE_IN}/>
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="radio" name="writeIn"
                                                        value={"OPTIONS"}
                                                        checked={this.state.writeIn === "OPTIONS"}
                                                        onChange={(e) => {
                                                            this.setState({writeIn: e.target.value})
                                                        }}/>
                                                    <label className="form-check-label">
                                                        <FormattedMessage id={OPTIONS}/>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="form-group">
                                                <div className="cloze row  justify-content-between">
                                                    <label htmlFor="cloze-text"><FormattedMessage id={CLOZE_TEXT}/>:</label>
                                                    <div className="justify-content-end">
                                                        <button
                                                            onClick={this.addBlank}
                                                            className={"btn button-finish"}
                                                        >
                                                            <FormattedMessage id={ADD_BLANK}/>
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    className="input-mcq"
                                                    rows="5"
                                                    id="cloze-text"
                                                    onKeyDown={this.handleKeyDown}
                                                    onBlur={this.handleMouseDown}
                                                    value={this.state.clozeText}
                                                    onChange={this.handleChangeCloze}
                                                />
                                                {cloze_error}
                                            </div>
                                        </div>
                                        { uneven_blanks_error }
                                        <div>
                                            { blank_reused_error }
                                        </div>
                                        { inputs }
                                        <div>
                                            {answer_error}
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
                                                    onClick={(e) => this.submitExercise(false, e)}
                                                    className={"btn button-finish"}
                                                    disabled={!this.state.isFormValid}
                                                >
                                                    <FormattedMessage id={FINISH_EXERCISE}/>
                                                </button>
                                                <button
                                                    onClick={(e) => this.submitExercise(true, e)}
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
    )(CLOZEForm));
