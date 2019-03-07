import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {withRouter} from "react-router-dom";
import '../css/Navbar.css'
import {injectIntl} from 'react-intl';
import {MY_ACTIVITY,HOME, ADD_EXERCISE, STOP, NETWORK} from "../containers/translation";


class Navbar extends Component {

    constructor(props){
        super(props);

        let {intl} = this.props;
        this.state = {
            displayHomeButton: false,
            displayAddExerciseButton: true
        }
    }

    // redirect to new exercise template
    directToNew=()=>{
        this.props.history.push('/new')
        this.toggleButtons();
    };

    // redirect to home screen
    directToHome=()=>{
        this.props.history.push('/')
        this.toggleButtons();
    };

    toggleButtons=()=>{
        this.setState({
            displayHomeButton: !this.state.displayHomeButton,
            displayAddExerciseButton: !this.state.displayAddExerciseButton
        })
    }	

    HomeButton=(homeTitle)=>{
        if(this.state.displayHomeButton){
            return <button
                        className="toolbutton"
                        id="home-button"
                        title={homeTitle}
                        onClick={this.directToHome}/>
        }
    }

    AddExerciseButton=(addTitle)=>{
        if(this.state.displayAddExerciseButton){
            return <button
                        className="toolbutton"
                        id="add-button"
                        title={addTitle}
                        onClick={this.directToNew}/>
        }
    }


    render() {
        let {intl} = this.props;

        let activityTitle= intl.formatMessage({id: MY_ACTIVITY});
        let homeTitle= intl.formatMessage({id: HOME});
        let addTitle= intl.formatMessage({id: ADD_EXERCISE});
        let networkTitle= intl.formatMessage({id: NETWORK});
        let stopTitle= intl.formatMessage({id: STOP});

        return (
            <div id="main-toolbar" className="toolbar">
                <button
                    className="toolbutton"
                    id="activity-button"
                    title={activityTitle}/>
                {this.HomeButton()}
                {this.AddExerciseButton()}
                <button
                    className="toolbutton"
                    id="network-button"
                    title={networkTitle}/>
                <button
                    className="toolbutton pull-right"
                    id="stop-button"
                    title={stopTitle}
                    onClick={this.props.onStop}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        exercises: state.exercises
    };
}

export default injectIntl(withRouter(connect(mapStateToProps)(Navbar)));