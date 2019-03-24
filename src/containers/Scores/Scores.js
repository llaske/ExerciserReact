import React, {Component} from "react"
import {Bar, Line, Pie} from 'react-chartjs-2';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {addScore} from "../../store/actions/exercises";
import {injectIntl} from 'react-intl';
import {SCORES, TIME, YOUR_RESULTS} from "../translation";
import "../../css/PresenceScores.css"
import "../../css/Scores.css"


class Scores extends Component {

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
            chartTimes: {
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

    componentDidMount() {
        if (this.props.location) {
            const {userScore, userTime, noOfQuestions, exercise} = this.props.location.state;
            let score = Math.ceil(userScore / noOfQuestions * 100);
            let time = Math.ceil(userTime / 60);
            if (this.props.isShared) {
                this.props.onSharedResult(exercise.id, score, time);
            }
            this.setChart();
        }
    }

    setChart = () => {
        const {userScore, userTime, noOfQuestions, exercise} = this.props.location.state;
        const {stroke, fill} = this.props.current_user.colorvalue ? this.props.current_user.colorvalue : {stroke: "#00FFFF", fill: "#800080"};

        let score = Math.ceil(userScore / noOfQuestions * 100);
        let time = Math.ceil(userTime / 60);

        const {name} = this.props.current_user;

        this.setState({
            ...this.state,
            chartScores: {
                ...this.state.chartScores,
                chartData: {
                    labels: [name],
                    datasets: [
                        {
                            label: this.intl.formatMessage({id: SCORES}),
                            yAxisID: 'A',
                            data: [score],
                            backgroundColor: fill,
                            borderColor: stroke,
                            borderWidth: 5
                        }]
                }
            },
            chartTimes: {
                ...this.state.chartTimes,
                chartData: {
                    labels: [name],
                    datasets: [
                        {
                            label: this.intl.formatMessage({id: TIME}),
                            yAxisID: 'A',
                            data: [time],
                            backgroundColor: fill,
                            borderColor: stroke,
                            borderWidth: 5
                        }]
                }
            }

        })

    };

    redo = () => {
        const {type, exercise} = this.props.location.state;
        if (type === 'MCQ') {
            this.props.history.push('/play/mcq', {exercise: exercise})
        }
        if (type === 'CLOZE') {
            this.props.history.push('/play/cloze', {exercise: exercise})
        }
        if (type === 'REORDER') {
            this.props.history.push('/play/reorder', {exercise: exercise})
        }
    };

    score = () => {
        this.setState({
            score: true,
            time: false
        }, () => {
            this.setChart();
        })
    };

    time = () => {
        this.setState({
            score: false,
            time: true
        }, () => {
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

        let chart = "";

        if (this.state.score)
            chart = (<Bar data={this.state.chartScores.chartData} options={this.state.chartScores.options}/>);
        else
            chart = (<Bar data={this.state.chartTimes.chartData} options={this.state.chartTimes.options}/>);

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
    return {
        current_user: state.current_user,
        isShared: state.isShared
    }
}

export default injectIntl(withRouter(
    connect(MapStateToProps, {})(Scores)));