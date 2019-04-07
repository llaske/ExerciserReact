import React, {Component} from "react"
import {Bar} from 'react-chartjs-2';
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
        const {score}= this.state;

        const {shared_results} = exercise;

        let users = [];
        let strokes = [];
        let fills = [];
        let scores = [];
        let times = [];

        if (score) shared_results.sort(this.compare_score);
        else  shared_results.sort(this.compare_time);


        shared_results.forEach((result, index) => {
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
            time: false
        },()=>{
            this.setChart();
        })
    };

    time = () => {
        this.setState({
            score: false,
            time: true
        },()=>{
            this.setChart();
        })
    };

    render() {

        let score_active = "";
        let time_active = "";

        if (this.state.score)
            score_active = "active";
        else
            time_active = "active";

        let score = (<button type="button" className={"score-button " + score_active} onClick={this.score}/>);
        let time = (<button type="button" className={"time-button " + time_active} onClick={this.time}/>);

        let chart="";

        if(this.state.score)
            chart= (<Bar data={this.state.chartScores.chartData} options={this.state.chartScores.options}/>);
        else
            chart= (<Bar data={this.state.chartTimes.chartData} options={this.state.chartTimes.options}/>);

        return (
            <div className="container">
                <div className="container-fluid">
                <div className="row">
                    {score}
                    {time}
                    {chart}
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