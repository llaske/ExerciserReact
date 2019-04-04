import React, {Component} from "react"
import {Bar, Line, Pie} from 'react-chartjs-2';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {SCORES, TIME, YOUR_RESULTS} from "../translation";
import "../../css/PresenceScores.css"


class PresenceScores extends Component {

    constructor(props) {
        super(props);

        let {intl} = this.props;
        this.intl = intl;
        this.modes = {
            SCORE: 'score',
            TIME: 'time',
            DETAILS: 'details'
        };
        
        this.state = {
            mode: this.modes.SCORE,
            userDetailsIndex: 0,
            chartScores: {
                chartData: {},
                options: {
                    title: {
                        display: true,
                        text: intl.formatMessage({id: YOUR_RESULTS}),
                        fontSize: 40
                    },
                    legend: {
                        display: false,
                        position: 'right'
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                min: 0,
                                max: 100
                            }
                        }],
                        xAxes: [{
                            barThickness: 30,
                            ticks: {
                                fontSize: 15
                            }
                        }]
                    }
                }
            },
            chartTimes:{
                chartData:{},
                options: {
                    title: {
                        display: true,
                        text: intl.formatMessage({id: YOUR_RESULTS}),
                        fontSize: 40
                    },
                    legend: {
                        display: false,
                        position: 'right'
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                min: 0,
                                max: 10,
                                gridLines: {
                                    drawTicks: false,
                                }
                            }
                        }],
                        xAxes: [{
                            barThickness: 30,
                            ticks: {
                                fontSize: 15
                            }
                        }]
                    }
                }

            }
        }
    }

    compare_score=(a, b)=> {
        if (a.score < b.score){
            return 1;
        }
        if (b.score < a.score){
            return -1;
        }
        return 0;
    };

    compare_time=(a, b)=> {
        if (a.time > b.time){
            return 1;
        }
        if (b.time < a.time){
            return -1;
        }
        return 0;
    };

    componentWillReceiveProps() {
        if (this.props.location) {
            this.setChart();
        }
    }

    componentDidMount(){
        if (this.props.location) {
            this.setChart();
        }
    }

    setChart=()=>{
        const {exercise} = this.props.location.state;
        const {score, time}= this.state;

        const {shared_results} = exercise;

        let users = [];
        let strokes = [];
        let fills = [];
        let scores = [];
        let times = [];

        if (score) shared_results.sort(this.compare_score);
        else  shared_results.sort(this.compare_time);


        shared_results.map((result, index) => {
            users.push(result.user.name);
            strokes.push(result.user.colorvalue.stroke);
            fills.push(result.user.colorvalue.fill);
            scores.push(result.score);
            times.push(result.time);
        });

        if(this.state.mode == this.modes.SCORE) {
            this.setState({
                ...this.state,
                chartScores: {
                    ...this.state.chartScores,
                    chartData: {
                        labels: users,
                        datasets: [
                            {
                                label: this.intl.formatMessage({id: SCORES}),
                                yAxisID: 'A',
                                data: scores,
                                backgroundColor: fills,
                                borderColor: strokes,
                                borderWidth: 5
                            }]
                    }
                }
            })
        }else if (this.state.mode == this.modes.TIME){
            this.setState({
                ...this.state,
                chartTimes: {
                    ...this.state.chartTimes,
                    chartData: {
                        labels: users,
                        datasets: [
                            {
                                label: this.intl.formatMessage({id: TIME}),
                                yAxisID: 'A',
                                data: times,
                                backgroundColor: fills,
                                borderColor: strokes,
                                borderWidth: 5
                            }]
                    }
                }
            })
        }
    };

    score = () => {
        this.setState({
            mode: this.modes.SCORE
        }, () => {
            this.setChart();
        })
    };

    time = () => {
        this.setState({
            mode: this.modes.TIME
        }, () => {
            this.setChart();
        })
    };

    details = (event) => {
        if(event.length!=0) {
            if(this.props.location.state.exercise.type == 'CLOZE'){
                this.setState({
                    userDetailsIndex: event[0]['_index'],
                    mode: this.modes.DETAILS
                })
            }
        }
    };


    render() {
        let score_active = "";
        let time_active = "";
        let chart = "";

        if (this.state.mode == this.modes.SCORE){
            score_active = "active";
            chart = (<Bar data={this.state.chartScores.chartData} getElementAtEvent={this.details} options={this.state.chartScores.options}/>);
        }
        else if (this.state.mode == this.modes.TIME) {
            time_active = "active";
            chart = (<Bar data={this.state.chartTimes.chartData} options={this.state.chartTimes.options}/>);
        }
        else if (this.state.mode == this.modes.DETAILS) {
            const {exercise} = this.props.location.state;
            const {shared_results} = exercise;
            let users = [];
            let userans = [];
            shared_results.map((result) => {
                users.push(result.user.name);
                userans.push(result.userans);
            });

            let questions = this.props.location.state.exercise.clozeText.split(".");
            questions.splice(-1, 1);
            let resultDetails = questions.map((question, index) => {
                question = question.replace("-"+(index+1)+"-", "______");
                let response = userans[this.state.userDetailsIndex][index];
                return (
                    <tr key={index}>
                        <td className="question-row">{question}</td>
                        <td>{this.props.location.state.exercise.answers[index]}</td>
                        <td>{response}</td>
                    </tr>
                );
            });

            chart = (
            <div>
                <br></br>
                <br></br>
                <table style={{width:'100%'}}>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Correct Answer</th> 
                            <th>{users[this.state.userDetailsIndex]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultDetails}
                    </tbody> 
                </table>
            </div>
            );
        }
    
        let score = (<button type="button" className={"score-button " + score_active} onClick={this.score}/>);
        let time = (<button type="button" className={"time-button " + time_active} onClick={this.time}/>);

        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row">
                        {score}
                        {time}
                        {chart}
                    </div>
                    <div className="row button-container">
                        <button className="button-redo" onClick={this.redo}/>
                    </div>
                </div>
            </div>
        )
    }
}

function MapStateToProps(state) {
    return {}
}

export default injectIntl(withRouter(
    connect(MapStateToProps, {})(PresenceScores)));