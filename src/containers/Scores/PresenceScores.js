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

        this.state = {
            score: true,
            time: false,
            details: false,
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

        if(score) {
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
        }else{
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
            score: true,
            time: false,
            details:false
        }, () => {
            this.setChart();
        })
    };

    time = () => {
        this.setState({
            score: false,
            time: true,
            details: false
        }, () => {
            this.setChart();
        })
    };

    details = () => {
        this.setState({
            score: false,
            time: false,
            details: true
        })
    };

    render() {
        let score_active = "";
        let time_active = "";
        let details_active = "";

        if (this.state.score == true)
            score_active = "active";
        else if (this.state.time == true)
            time_active = "active";
        else if (this.state.details == true)
            details_active = "active";

        let score = (<button type="button" className={"score-button " + score_active} onClick={this.score}/>);
        let time = (<button type="button" className={"time-button " + time_active} onClick={this.time}/>);
        let details = (<button type="button" className={"details-button " + details_active} onClick={this.details}/>);


        const {exercise} = this.props.location.state;
        const {shared_results} = exercise;
        let users = [];
        let userans = [];
        shared_results.map((result, index) => {
            users.push(result.user.name);
            userans.push(result.userans);
        });

        let chart = "";

        if (this.state.score == true)
            chart = (<Bar data={this.state.chartScores.chartData} options={this.state.chartScores.options}/>);
        else if (this.state.time == true)
            chart = (<Bar data={this.state.chartTimes.chartData} options={this.state.chartTimes.options}/>);
        else if (this.state.details == true) {
            
            users = users.map(function(user, index){
                return (<th key={index}>{user}</th>);
            });
            
            let questions = this.props.location.state.exercise.clozeText.split(".");
            questions.splice(-1, 1);
            let resultDetails = questions.map(function(question, index){
                question = question.replace("-"+(index+1)+"-", "______");
                let eachQuestionResponses = userans.map(function(userans){
                    return (
                        <td>{userans[index]}</td>
                    );
                })
                return (
                    <tr key={index}>
                        <td className="question-row">{question}</td>
                        <td>{this.props.location.state.exercise.answers[index]}</td> 
                        {eachQuestionResponses}
                    </tr>
                );
            }.bind(this));

            chart = (
            <div>
                <br></br>
                <br></br>
                <table style={{width:'100%'}}>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Correct Answer</th> 
                            {users}
                        </tr>
                    </thead>
                    <tbody>
                        {resultDetails}
                    </tbody> 
                </table>
            </div>
            );
        }

        return (
            <div className="container">
                <div className="container-fluid">
                    <div className="row">
                        {score}
                        {time}
                        {this.props.location.state.exercise.type == "CLOZE"?details:''}
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