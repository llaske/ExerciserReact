import React, {Component} from 'react';
import { connect } from "react-redux";
import {withRouter} from "react-router-dom";
import '../css/Navbar.css'
import {injectIntl} from 'react-intl';
import {MY_ACTIVITY,HOME, ADD_EXERCISE, STOP, NETWORK} from "../containers/translation";


class Navbar extends Component {

    // redirect to new exercise template
    directToNew=()=>{
        this.props.history.push('/new')
    };

    // redirect to home screen
    directToHome=()=>{
        this.props.history.push('/')
    };

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
                <button
                    className="toolbutton"
                    id="home-button"
                    title={homeTitle}
                    onClick={this.directToHome}/>
                <button
                    className="toolbutton"
                    id="add-button"
                    title={addTitle}
                    onClick={this.directToNew}/>
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