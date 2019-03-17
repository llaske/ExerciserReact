import React, {Component} from "react";
import {connect} from "react-redux";
import {incrementExerciseCounter} from "../../store/actions/increment_counter";
import {addNewExercise, editExercise} from "../../store/actions/exercises";
import {FormattedMessage} from 'react-intl';
import {withRouter} from "react-router-dom";
import activity from 'lib/sugar-web/activity/activity';
import "../../css/CLOZEForm.css";
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
    TITLE_ERROR
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
            errors: {
                question: false,
                answers: false,
                title: false,
                cloze: false
<<<<<<< Updated upstream
            }
=======
            },
            typeOfExcercise:'Cloze',
            picture: ''
>>>>>>> Stashed changes
        };
    }

    // in case of edit load the exercise
    componentDidMount() {
        if (this.props.location.state) {
            const {id, title, question, scores, times, clozeText, answers, writeIn} = this.props.location.state.exercise;
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
                nextBlank: nextBlank
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
            {answers: [...this.state.answers, '']},
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
        const {title, question, answers, clozeText} = this.state;
        let isFormValid = true;

        if (question === '') {
            isFormValid = false;
        }

        if (title === '') {
            isFormValid = false;
        }

        if (clozeText === '') {
            isFormValid = false;
        }

        answers.map((ans, i) => {
            if (ans === '') {
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
            picture: this.state.picture
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

        this.setState({
            ...this.state,
            errors: {
                ...this.state.errors,
                cloze: error
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

    // to add a blank dynamically
    addBlank = () => {
        const {clozeText, nextBlank, cursorPos} = this.state;

        String.prototype.splice = function (idx, rem, str) {
            return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
        };


        let updatedCloze = clozeText.splice(cursorPos, 0, ` -${nextBlank}- `);

        let blank = this.findNextBlank(updatedCloze);

        this.setState({
            clozeText: updatedCloze,
            nextBlank: blank,
            cursorPos: cursorPos + 5
        }, () => {

        })
    };

    insertMedia = () => {

        let backend = activity.insertMedia();
        let chooser = backend.chooser;
        let datastore = backend.datastore;
        var outputCanvas = document.getElementById('outputCanvas');
        let pictureString;
        // Display journal dialog popup
        chooser.show(function(entry) {
            // No selection
            if (!entry) {
                return;
            }
            // Get object content
            var dataentry = new datastore.DatastoreObject(entry.objectId);
            dataentry.loadAsText(function(err, metadata, text) {
                //We load the drawing inside an image element
                var element = document.createElement('img');
                element.src = text;
                pictureString = text;
                console.log(pictureString);
                element.onload = function() {
                    //We draw the drawing to the canvas
                    var ctx = outputCanvas.getContext('2d');
                    var imgWidth = element.width;
                    var imgHeight = element.height;
                    var maxWidth = outputCanvas.getBoundingClientRect().width;
                    var maxHeight = outputCanvas.getBoundingClientRect().height;
                    var ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                    var newWidth = ratio * imgWidth;
                    var newHeight = ratio * imgHeight;
                    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
                    ctx.drawImage(element, 0, 0, newWidth, newHeight);

                    // /* If the activity is shared we send the element to everyone */
                    // if (PaintApp.data.isShared) {
                    //     try {
                    //         PaintApp.collaboration.sendMessage({
                    //             action: 'toDataURL',
                    //             data: {
                    //                 width: PaintApp.elements.canvas.width / window.devicePixelRatio,
                    //                 height: PaintApp.elements.canvas.height / window.devicePixelRatio,
                    //                 src: PaintApp.collaboration.compress(PaintApp.elements.canvas.toDataURL())
                    //             }
                    //         });
                    //     } catch (e) {}
                    // }
                }
            });
        }, {mimetype: 'image/png'}, {mimetype: 'image/jpeg'});
            this.setState({
                ...this.state,
                picture: pictureString
            }, () => {
                console.log(this.state);
            });
    }

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
                                    required
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
        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-sm-10">
                            <div className="col-md-12">
                                <form onSubmit={this.handleNewEvent}>
                                    <div className="row">
                                        <div className="form-group">
                                            <label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE}/></label>
                                            <input
                                                className="input-mcq"
                                                type="text"
                                                id="title"
                                                required
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
                                                required
                                                value={this.state.question}
                                                onChange={this.handleChangeQues}
                                            />
                                            {question_error}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="form-group">
                                            <canvas id="outputCanvas"></canvas>
                                            <div onClick={this.insertMedia}>Insert Image</div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="form-group">
                                            <label><FormattedMessage id={BLANK_TYPE}/>:</label>
                                            <div className="form-check">
                                                <input type="radio" name="writeIn"
                                                       value={"WRITEIN"}
                                                       checked={this.state.writeIn === "WRITEIN"}
                                                       required
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
                                                       required
                                                       onChange={(e) => {
                                                           this.setState({writeIn: e.target.value})
                                                       }}/>
                                                <label className="form-check-label">
                                                    <FormattedMessage id={OPTIONS}/>
                                                </label>
                                        </div>
                                    </div>
                                        <div className="row">
                                            <div className="form-group">
                                                <label><FormattedMessage id={BLANK_TYPE}/>:</label>
                                                <div className="form-check">
                                                    <input type="radio" name="writeIn"
                                                        value={"WRITEIN"}
                                                        checked={this.state.writeIn === "WRITEIN"}
                                                        required
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
                                                        required
                                                        onChange={(e) => {
                                                            this.setState({writeIn: e.target.value})
                                                        }}/>
                                                    <label className="form-check-label">
                                                        <FormattedMessage id={OPTIONS}/>
                                                    </label>
                                                </div>
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
                                                required
                                                onKeyDown={this.handleKeyDown}
                                                onBlur={this.handleMouseDown}
                                                value={this.state.clozeText}
                                                onChange={this.handleChangeCloze}
                                            />
                                            {cloze_error}
                                        </div>
                                    </div>
                                    {inputs}
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