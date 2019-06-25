import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {addScoreTime} from '../../store/actions/exercises';
import "../../css/CLOZEPlayer.css"
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {SUBMIT_QUESTION, FINISH_EXERCISE} from "../translation";
import {FormattedMessage} from 'react-intl';
import meSpeak from 'mespeak';
import withMultimedia from '../../components/WithMultimedia';

class CLOZEPlayer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: -1,
            title: '',
            question: {
                type:'',
                data: ''
            },
            writeIn: "OPTIONS",
            cloze: [],
            answers: [],
            userans: [],
            checkans: [],
            options: [],
            submitted: false,
            scores: [],
            score: 0,
            times: [],
            goBackToEdit: false,
            currentTime: 0,
            intervalID: -1,
            userLanguage: '',
        }

        this.multimedia = {
            text: 'text',
            image: 'image',
            audio: 'audio',
            textToSpeech: 'text-to-speech',
            video: 'video'
        };
    }

    // load the exercise from props
    componentDidMount() {
        if (this.props.location.state) {
            let intervalId = setInterval(this.timer, 1000);
            const {id, title, question, scores, times, answers, clozeText, writeIn, userLanguage} = this.props.location.state.exercise;

            let goBackToEdit = false;
            if (this.props.location.state.edit) goBackToEdit = true;

            let userans = answers.map(() => "");

            let checkans = answers.map(() => false);

            let cloze = clozeText.split('\n').join(' <br/> ').split(/(-[0-9]*-)/);

            let options = [];

            // array to remove duplicate answers
            let noduplicates= [];
            
            answers.forEach((ans, i)=> {
                if(noduplicates.indexOf(ans)===-1){
                    noduplicates.push(ans);
                    options.push({
                        value: ans,
                        label: ans
                    })
                }
            });

            this.shuffleArray(options);

            this.setState({
                ...this.state,
                id: id,
                title: title,
                question: question,
                scores: scores,
                times: times,
                answers: answers,
                userans: userans,
                cloze: cloze,
                options: options,
                intervalId: intervalId,
                checkans: checkans,
                writeIn: writeIn,
                goBackToEdit: goBackToEdit,
                userLanguage: userLanguage
            }, () => {
                if(userLanguage.startsWith('en'))
                    meSpeak.loadVoice(require(`mespeak/voices/en/${this.state.userLanguage}.json`));
                else
                    meSpeak.loadVoice(require(`mespeak/voices/${this.state.userLanguage}.json`));
            })
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    handleChangeAnsSelect = (text, name) => {
        const index = Number(name.split('-')[1]);


        let value = '';
        if (text === null) {
            value = ''
        } else {
            value = text.value
        }

        const ans = this.state.userans.map((ans, i) => (
            i === index - 1 ? value : ans
        ));
        this.setState({
            ...this.state,
            userans: ans
        }, () => {

        });
    };

    handleChangeAnsInput = (e) => {
        const index = Number(e.target.name.split('-')[1]);
        const ans = this.state.userans.map((ans, i) => (
            i === index - 1 ? e.target.value : ans
        ));
        this.setState({
            ...this.state,
            userans: ans
        }, () => {

        });
    };

    // submit the exercise ( calculate score and time ) show correct/ wrong ans
    submitExercise = () => {
        const {userans, answers} = this.state;
        let checkans = [];
        let score = 0;
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].toLowerCase().trim() === userans[i].toLowerCase().trim()) {
                checkans.push(true);
                score++;
            } else {
                checkans.push(false)
            }
        }

        this.setState({
            ...this.state,
            submitted: true,
            checkans: checkans,
            score: score
        })
    };

    // redirect to scores screen/ edit screen
    finishExercise = () => {
        const {scores, score, id, currentTime, times, answers, goBackToEdit} = this.state;
        let exercise = this.props.location.state.exercise;
        let noOfQuestions = answers.length;

        if (goBackToEdit)
            this.props.history.push('/edit/cloze', {exercise: exercise});
        else {
            scores.push(score);
            times.push(currentTime);
            this.props.addScoreTime(id, score, currentTime);
            this.props.history.push('/scores', {
                scores: scores,
                userScore: score,
                times: times,
                userTime: currentTime,
                noOfQuestions: noOfQuestions,
                exercise: exercise,
                type: "CLOZE"
            });
        }
    };

    timer = () => {
        this.setState({currentTime: this.state.currentTime + 1});
    };

    speak = (elem, text) => {
        let audioElem = elem;
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

    render() {
        const {showMedia} = this.props;

        let question;
        let questionType = this.state.question.type; 
        if( questionType === this.multimedia.text)
            question = (
               this.state.question.data
            );
        if( questionType === this.multimedia.image)
            question = (
                <p style = {{textAlign: 'center'}}>
                    <img src = {this.state.question.data}
                        style = {{height: '200px'}}
                        onClick = {()=>{showMedia(this.state.question.data)}}
                        alt="Question"/>
                </p>
            );
        if( questionType === this.multimedia.audio)
            question = (
                <p style = {{textAlign: 'center'}}>
                    <audio src={this.state.question.data} controls>
                    </audio>
                </p>
                
            );
        if( questionType === this.multimedia.textToSpeech) {
            question = (
                <p style={{textAlign: 'center'}}>
                    <img className="button-off"
                        onClick={(e)=>{this.speak(e.target, this.state.question.data)}}
                        alt="text-to-speech-question"
                    />
                </p>
                
            );
        }
        if( questionType === this.multimedia.video)
            question = (
                <p style = {{textAlign: 'center'}}>
                    <video src={this.state.question.data} controls
                        height="250px">
                    </video>
                </p>
            );

        let buttonText = <FormattedMessage id={SUBMIT_QUESTION}/>;
        if (this.state.submitted) buttonText = <FormattedMessage id={FINISH_EXERCISE}/>


        let clozetext = this.state.cloze.map((text, i) => {
            // if (text === '</br>') return (<span key={`break${i}`}><br/></span>)

            if (text[0] === '-' && (text[2] === '-' || text[3] === '-')) {
                let no = text[1];
                if (text[2] !== '-') no = no + text[2];

                let ans = 'wrong';
                if (this.state.checkans[no - 1]) ans = 'right';

                if (!this.state.submitted) {
                    if (this.state.writeIn === "OPTIONS") {
                        return (
                            <Select
                                key={`answer-${no}`}
                                className="answers input-ans"
                                name={`answer-${no}`}
                                value={this.state.userans[no - 1]}
                                placeholder=''
                                onChange={value => this.handleChangeAnsSelect(value, `answer-${no}`)}
                                options={this.state.options}
                            />
                        )
                    } else {
                        return (
                            <input
                                key={`answer-${no}`}
                                className="answers input-ans"
                                name={`answer-${no}`}
                                value={this.state.userans[no - 1]}
                                placeholder=''
                                onChange={this.handleChangeAnsInput}
                            />
                        )
                    }
                } else {
                    let useranswer = this.state.userans[no - 1];
                    if (useranswer === "") useranswer = "___________________";

                    return (
                        <span className={"cloze-span checked-ans " + ans} key={`cloze-${i}`}>{useranswer}</span>
                    )
                }
            } else {
                let final = text.split(/( )/).map((item, key) => {
                    if (item === '<br/>')
                        return <span key={key}><br/></span>
                    return <span key={key}>{item}</span>
                });
                return (
                    final
                )
            }
        });

        return (
            <div className="container cloze-container">
                <div className="row align-items-center justify-content-center">
                    <div className="col-sm-10">
                        <div className="jumbotron">
                            <p className="lead">{this.state.title}</p>
                            <hr className="my-4"/>
                            <div style={{marginBottom: "20px"}}>
                                {question}
                            </div>
                            <div>
                                {clozetext}
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
        )
    }
}

function MapStateToProps(state) {
    return {}
}

export default withMultimedia(require('../../images/list_reorder_image.svg'))(withRouter(
    connect(MapStateToProps, {addScoreTime})(CLOZEPlayer)));

