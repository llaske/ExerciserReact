import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import '../css/Navbar.css'
import { injectIntl } from 'react-intl';
import { UNFULLSCREEN } from "../containers/translation";
import MainToolbar from './MainToolbar';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showTutorial: false
		}
	}

	// redirect to new exercise template
	directToNew = () => {
		this.props.history.push('/new');
	};

	// redirect to home screen
	directToHome = () => {
		this.props.history.push('/');
	};

	enterEditMode = () => {
		this.props.toggleEditMode(true);
	}

	exitEditMode = () => {
		this.props.toggleEditMode(false);
		this.props.history.push('/');
	}

	startTutorial = () => {
		this.setState({
			showTutorial: true
		});
	}

	stopTutorial = () => {
		this.setState({
			showTutorial: false
		});
	}

	render() {
		let unFullScreen = this.props.intl.formatMessage({ id: UNFULLSCREEN});
		let navFunctions = {
			directToNew: this.directToNew,
			directToHome: this.directToHome,
			enterEditMode: this.enterEditMode,
			exitEditMode: this.exitEditMode,
			startTutorial: this.startTutorial,
			stopTutorial: this.stopTutorial
		};
		return (
			<React.Fragment>
				<MainToolbar 
					{...this.props}
					{...navFunctions}
					showTutorial = {this.state.showTutorial}
				/>
				<button
					className={"toolbutton" + (!this.props.inFullscreenMode? " toolbar-hide" : "")}
					id="unfullscreen-button"
					title={unFullScreen}
					onClick={this.props.toggleFullscreen} />
			</React.Fragment>
		);
	}
}

function mapStateToProps(state) {
	return {
		exercises: state.exercises
	};
}

export default injectIntl(withRouter(connect(mapStateToProps)(Navbar)));
