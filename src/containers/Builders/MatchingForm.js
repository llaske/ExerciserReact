import React, {Component} from "react";
import {connect} from "react-redux";
import {incrementExerciseCounter} from "../../store/actions/increment_counter";
import {addNewExercise, editExercise} from "../../store/actions/exercises";
import {FormattedMessage} from 'react-intl';
import {
    FINISH_EXERCISE,
    TITLE_OF_EXERCISE,
    NEXT_QUESTION,
    PREVIOUS_QUESTION,
    TEST_EXERCISE,
    TITLE_ERROR,
    QUESTION_ERROR,
    MATCHING_PAIR,
    ANSWER_ERROR,
    TEXT,
    MATCH_ITEM,
    MATCHING_ITEM
} from "../translation";
import {withRouter} from "react-router-dom";
import "../../css/MatchingForm.css";
import withMultimedia from '../../components/WithMultimedia';
import datastore from 'lib/sugar-web/datastore';
import chooser from 'lib/sugar-web/graphics/journalchooser';
import env from 'lib/sugar-web/env';
import meSpeak from 'mespeak';

class MATCHING_PAIRForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            id: -1,
            title: '',
            noOfPairs: 0,
            currentPairNo: 1,
            pairs: [],
            scores: [],
            times: [],
            isFormValid: false,
            errors: {
                question: false,
                answer: false,
                title: false
            },
            currentPair: {
                id: 1,
                question: {
                    type:'',
                    data: ''
                },
                answer:  {
                    type:'',
                    data: ''
                },
            }
        };

        this.multimedia = {
            text: 'text',
            image: 'image',
            audio: 'audio',
            textToSpeech: 'text-to-speech',
            video: 'video'
        };
    }

    // in case of edit load the exercise
    componentDidMount() {
        if (this.props.location.state) {
            const {id, title, pairs, scores, times} = this.props.location.state.exercise;
            const currentPair = pairs[0];
            this.setState({
                ...this.state,
                id: id,
                title: title,
                edit: true,
                isFormValid: true,
                pairs: pairs,
                scores: scores,
                times: times,
                noOfPairs: pairs.length,
                currentPair: currentPair
            });
        }
    }

    handleChangeAns = e => {
        let error = false;
        if (e.target.value === '') {
            error = true;
        }
        this.setState({
            ...this.state,
            currentPair: {
                ...this.state.currentPair,
                answer: {
                    ...this.state.currentPair.answer,
                    data: e.target.value
                }
            },
            errors: {
                ...this.state.errors,
                answer: error
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
            currentPair: {
                ...this.state.currentPair,
                question: {
                    ...this.state.currentPair.question,
                    data: e.target.value
                }
            }
        }, () => {
            this.checkFormValidation();
        });
    };

    handleNewEvent = event => {
        event.preventDefault();
    };

    // save current question
    saveCurrentPair = () => {
        this.checkFormValidation();

        if (this.state.isFormValid) {
            const {currentPairNo, noOfPairs, currentPair} = this.state;

            if (currentPairNo > noOfPairs) {
                this.setState({
                    ...this.state,
                    pairs: [
                        ...this.state.pairs,
                        currentPair
                    ],
                    isFormValid: false,
                    noOfPairs: currentPair.id,
                    currentPairNo: currentPair.id + 1,
                    currentPair: {
                        id: currentPair.id + 1,
                        question: {
                            type:'',
                            data: ''
                        },
                        answer:  {
                            type:'',
                            data: ''
                        },
                    }
                });
            }
            else {
                const {pairs} = this.state;
                let index = currentPairNo;

                const updatedPairs = pairs.map((pair, i) => (
                    pair.id === index ? currentPair : pair
                ));

                if (currentPairNo === noOfPairs) {
                    this.setState({
                        ...this.state,
                        pairs: updatedPairs,
                        isFormValid: false,
                        currentPairNo: currentPairNo + 1,
                        currentPair: {
                            id: currentPairNo + 1,
                            question: {
                                type:'',
                                data: ''
                            },
                            answer:  {
                                type:'',
                                data: ''
                            },
                        }
                    });
                } else {
                    const {question, answer} = this.state.pairs[index];
                    this.setState({
                        ...this.state,
                        pairs: updatedPairs,
                        isFormValid: true,
                        currentPairNo: index + 1,
                        currentPair: {
                            id: index + 1,
                            question: question,
                            answer: answer,
                        }
                    });
                }
            }
        }
    };

    // check if current form is valid
    checkFormValidation = () => {
        const {currentPair, title} = this.state;
        const {question, answer} = currentPair;
        let isFormValid = true;

        if (question.type === '' || question.data === '') {
            isFormValid = false;
        }

        if (title === '') {
            isFormValid = false;
        }

        if (answer.type === '' || answer.data === '') {
            isFormValid = false;
        }

        this.setState({
            ...this.state,
            isFormValid: isFormValid
        });
    };

    // submit exercise
    submitExercise = (bool,e) => {
        e.preventDefault();
        const {srcThumbnail, userLanguage} = this.props;
        const {currentPair} = this.state;
        let {pairs} = this.state;

        let id = this.state.id;
        if (this.state.id === -1) {
            id = this.props.counter;
        }

        // To save changes before testing the exercise
        if(currentPair.id <= pairs.length){
            let updatedCurrentPair = {
                id: currentPair.id,
                question: currentPair.question,
                answer: currentPair.answer
            };
            pairs[currentPair.id -1] = updatedCurrentPair;
        } else {
            pairs.push({
                id: currentPair.id,
                question: currentPair.question,
                answer: currentPair.answer
            });
        }

        let exercise = {
            title: this.state.title,
            id: id,
            type: "MATCHING_PAIR",
            pairs: pairs,
            scores: this.state.scores,
            times: this.state.times,
            thumbnail: srcThumbnail,
            userLanguage: userLanguage
        };

        if (this.state.edit) {
            this.props.editExercise(exercise);
        } else {
            this.props.addNewExercise(exercise);
            this.props.incrementExerciseCounter();
        }

        if(bool)
            this.props.history.push('/play/match', {exercise: exercise, edit: true});
        else
            this.props.history.push('/')
    };

    // move to previous question
    previousPair = () => {
        const {currentPairNo, pairs} = this.state;
        let previousPairNo = currentPairNo - 1;
        let previousPair = pairs[previousPairNo - 1];

        this.setState({
            ...this.state,
            isFormValid: true,
            currentPairNo: previousPairNo,
            currentPair: previousPair
        })
    };

    showJournalChooser = (mediaType, answer = false) => {
        const {currentPair} = this.state;

        let image, audio, video = false;
        if(mediaType === this.multimedia.image)
            image = true;
        if(mediaType === this.multimedia.audio)
            audio = true;
        if(mediaType === this.multimedia.video)
            video = true;
        env.getEnvironment((err, environment) => {
            if(environment.user) {
                // Display journal dialog popup
                chooser.show((entry) => {
                    if (!entry) {
                          return;
                    }
                    var dataentry = new datastore.DatastoreObject(entry.objectId);
                    dataentry.loadAsText((err, metadata, text) => {
                        if(answer){
                            this.setState({
                                ...this.state,
                                currentPair:{
                                    ...currentPair,
                                    answer: {
                                        type: mediaType,
                                        data: text
                                    }
                                }
                            },() => {
                                this.checkFormValidation();
                            });
                        } else{
                            this.setState({
                                ...this.state,
                                currentPair:{
                                    ...currentPair,
                                    question:{
                                        type: mediaType,
                                        data: text
                                    }
                                }
                            },() => {
                                this.checkFormValidation();
                            });
                        }
                    });
                }, (image?{mimetype: 'image/png'}:null),
                    (image?{mimetype: 'image/jpeg'}:null),
                    (audio?{mimetype: 'audio/wav'}:null),
                    (video?{mimetype: 'video/webm'}:null));
            }
        });
    };

    speak = (e, text) => {
        let audioElem = e.target;
        let myDataUrl = meSpeak.speak(text, {rawdata: 'data-url'});
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
        const {currentPair} = this.state;
        if(mediaType === this.multimedia.text || mediaType === this.multimedia.textToSpeech) {
            this.setState({
                ...this.state,
                currentPair:{
                    ...currentPair,
                    question: {
                        type: mediaType,
                        data: ''
                    }
                }
            },() => {
                this.checkFormValidation();
            });
        } else {
            this.showJournalChooser(mediaType, false)
        }
    }

    selectAnswerType = (mediaType) => {
        const {currentPair} = this.state;
        if(mediaType === this.multimedia.text || mediaType === this.multimedia.textToSpeech) {
            this.setState({
                ...this.state,
                currentPair:{
                    ...currentPair,
                    answer: {
                        type: mediaType,
                        data: ''
                    }
                }
            },() => {
                this.checkFormValidation();
            });
        } else {
            this.showJournalChooser(mediaType, true)
        }
    }

    resetAnswer = () => {
        const {currentPair} = this.state;
        this.setState({
            ...this.state,
            currentPair: {
                ...currentPair,
                answer: {
                    type: '',
                    data: ''
                }
            }
        });
    }

    render() {
        const {currentPair, errors} = this.state;
        const {thumbnail, insertThumbnail, showMedia} = this.props

        //Question-Options
        let questionOptions = (
            <div className="question-options">
                <button className="btn button-question-options button-text col-md-2" 
                    onClick={() => {
                            this.selectQuestionType(this.multimedia.text)
                        }}>
                    <FormattedMessage id={TEXT}/>
                </button>
                <button className="btn button-question-options button-image col-md-2" 
                    onClick={() => {
                        this.selectQuestionType(this.multimedia.image);
                    }}>
                </button>
                <button className="btn button-question-options button-audio col-md-2" 
                    onClick={() => {
                        this.selectQuestionType(this.multimedia.audio);
                    }}>
                </button>
                <button className="btn button-question-options button-text-to-speech col-md-2" 
                    onClick={() => {
                        this.selectQuestionType(this.multimedia.textToSpeech);
                        }}>
                </button>
                <button className="btn button-question-options button-video col-md-2" 
                    onClick={() => {
                        this.selectQuestionType(this.multimedia.video);
                    }}>
                </button>
            </div>
        );
        
        let question;
        let questionType = currentPair.question.type; 
        if( questionType === this.multimedia.text)
            question = (
                <input
                    className="input-mcq"
                    type="text"
                    id="question"
                    value={currentPair.question.data}
                    onChange={this.handleChangeQues}
                />
            );
        if( questionType === this.multimedia.image)
            question = (
                <div className = "media-background">
                   <img src = {currentPair.question.data}
                        style = {{height: '200px'}}
                        onClick = {()=>{showMedia(currentPair.question.data)}}
                        alt="Question"/>
                </div>
            );
        if( questionType === this.multimedia.audio)
            question = (
                <audio src={currentPair.question.data} controls
                        style={{width: '-webkit-fill-available'}}>
                </audio>
            );
        if( questionType === this.multimedia.textToSpeech)
            question = (
                <div>
                    <input
                        className="input-text-to-speech"
                        id="question"
                        value={currentPair.question.data}
                        onChange={this.handleChangeQues}
                    />
                    <button className="btn button-finish button-speaker button-off" 
                            onClick={(e)=>{this.speak(e, currentPair.question.data)}}>
                    </button>
                </div>
            );
        if( questionType === this.multimedia.video)
            question = (
                <div className="media-background">
                    <video src={currentPair.question.data} controls
                            height="250px">
                    </video>
                </div>
            );

        let answer;
        let answerType;
        // Answer-Options
        if(!currentPair.answer.type)
            answer = (
                <div className="question-options">
                    <button className="btn button-question-options button-text col-md-2" 
                        onClick={() => {
                                this.selectAnswerType(this.multimedia.text);
                            }}>
                        <FormattedMessage id={TEXT}/>
                    </button>
                    <button className="btn button-question-options button-image col-md-2" 
                        onClick={() => {
                            this.selectAnswerType(this.multimedia.image);
                        }}>                            
                    </button>
                    <button className="btn button-question-options button-audio col-md-2" 
                        onClick={() => {
                            this.selectAnswerType(this.multimedia.audio);
                            }}>                        
                    </button>
                    <button className="btn button-question-options button-text-to-speech col-md-2" 
                        onClick={() => {
                            this.selectAnswerType(this.multimedia.textToSpeech)}}>
                    </button>
                    <button className="btn button-question-options button-video col-md-2" 
                        onClick={() => {
                            this.selectAnswerType(this.multimedia.video);
                        }}>
                    </button>
                </div>
            );
        else {
            let answerElement;
            answerType = currentPair.answer.type;
            if( answerType === this.multimedia.text)
                answerElement = (
                    <input
                        className="input-mcq"
                        type="text"
                        id="answer"
                        value={currentPair.answer.data}
                        onChange={this.handleChangeAns}
                    />
                );
            if( answerType === this.multimedia.image)
                answerElement = (
                    <div className = "media-background">
                    <img src = {currentPair.answer.data}
                            style = {{height: '200px'}}
                            onClick = {()=>{showMedia(currentPair.answer.data)}}
                            alt="Question"/>
                    </div>
                );
            if( answerType === this.multimedia.audio)
                answerElement = (
                    <audio src={currentPair.answer.data} controls
                            style={{width: '-webkit-fill-available'}}>
                    </audio>
                );
            if( answerType === this.multimedia.textToSpeech)
                answerElement = (
                    <div>
                        <input
                            className="input-text-to-speech"
                            id="answer"
                            value={currentPair.answer.data}
                            onChange={this.handleChangeAns}
                        />
                        <button className="btn button-finish button-speaker button-off" 
                                onClick={(e)=>{this.speak(e, currentPair.answer.data)}}>
                        </button>
                    </div>
                );
            if( answerType === this.multimedia.video)
                answerElement = (
                    <div className="media-background">
                        <video src={currentPair.answer.data} controls
                                height="250px">
                        </video>
                    </div>
                );
            answer = (
                <div className="option">
                    {answerElement}
                </div>
            )
        };

        let title_error = '';
        let question_error = '';
        let answer_error = '';

        if (errors['title']) {
            title_error = <span style={{color: "red"}}><FormattedMessage id={TITLE_ERROR}/></span>;
        }
        if (errors['question']) {
            question_error = <span style={{color: "red"}}><FormattedMessage id={QUESTION_ERROR}/></span>;
        }
        if (errors['answers']) {
            answer_error = <span style={{color: "red"}}><FormattedMessage id={ANSWER_ERROR}/></span>;
        }

        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-sm-10">
                            <div>
                                <p><strong><FormattedMessage id={MATCHING_PAIR}/></strong></p>
                                <hr className="my-3"/>
                                <div className="col-md-12">
                                    <form onSubmit={this.handleNewEvent}>
                                        <div className="row">
                                            <div className="form-group">
                                                {thumbnail}
                                                <label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE}/></label>
                                                <button style={{display: 'none'}}/>
                                                <button className="btn button-finish button-thumbnail" 
                                                        onClick={insertThumbnail}
                                                />
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
                                                <p><strong>Pair - {currentPair.id}</strong></p>
                                                <hr className="my-3"/>
                                                <label htmlFor="question"><FormattedMessage id={MATCH_ITEM}/>:</label>
                                                {questionType && <button className="btn button-edit" 
                                                  onClick={() => {this.setState({...this.state, currentPair: {...currentPair, question:{type:'', data:''}}})}}>
                                                </button>}
                                                {!questionType && questionOptions}
                                                {questionType && question}
                                                {question_error}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="form-group">
                                                <label htmlFor="answer"><FormattedMessage id={MATCHING_ITEM}/>:</label>
                                                {answerType && <button className="btn button-edit" 
                                                        style={{marginLeft: '5px'}}                               
                                                        onClick={()=>{this.resetAnswer()}}>
                                                </button>}
                                                {answer}
                                                {answer_error}
                                            </div>
                                        </div>
                                        <div className="form-group row justify-content-between">
                                            <button
                                                onClick={this.previousPair}
                                                className={"btn button-previous"}
                                                disabled={this.state.currentPairNo === 1}
                                            >
                                                <FormattedMessage id={PREVIOUS_QUESTION}/>
                                            </button>
                                            <div className="justify-content-end">
                                                <button
                                                    onClick={this.saveCurrentPair}
                                                    className={"btn button-next"}
                                                    disabled={!this.state.isFormValid}
                                                >
                                                    <FormattedMessage id={NEXT_QUESTION}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group row justify-content-between">
                                            <button
                                                onClick={(e)=>this.submitExercise(false,e)}
                                                className={"btn button-finish"}
                                                disabled={!this.state.isFormValid}
                                            >
                                                <FormattedMessage id={FINISH_EXERCISE}/>
                                            </button>
                                            <button
                                                onClick={(e)=> this.submitExercise(true,e)}
                                                className={"btn button-finish"}
                                                disabled={!this.state.isFormValid}
                                            >
                                                <FormattedMessage id={TEST_EXERCISE}/>
                                            </button>
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

export default withMultimedia(require("../../images/list_reorder_image.svg"))(withRouter(
    connect(MapStateToProps,
        {addNewExercise, incrementExerciseCounter, editExercise}
    )(MATCHING_PAIRForm)));