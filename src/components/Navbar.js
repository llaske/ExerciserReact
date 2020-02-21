import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import '../css/Navbar.css'
import { injectIntl } from 'react-intl';
import { MY_ACTIVITY, HOME, ADD_EXERCISE, STOP, NETWORK, HELP, EDITOR, PLAY, FULLSCREEN, UNFULLSCREEN } from "../containers/translation";
import Tutorial from '../components/Tutorial';

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
		let { intl } = this.props;
		let activityTitle = intl.formatMessage({ id: MY_ACTIVITY });
		let homeTitle = intl.formatMessage({ id: HOME });
		let addTitle = intl.formatMessage({ id: ADD_EXERCISE });
		let networkTitle = intl.formatMessage({ id: NETWORK });
		let stopTitle = intl.formatMessage({ id: STOP });
		let helpTitle = intl.formatMessage({ id: HELP });
		let editorButton = intl.formatMessage({ id: EDITOR});
		let playButton = intl.formatMessage({ id: PLAY});
		let fullScreen = intl.formatMessage({ id: FULLSCREEN});
		let unFullScreen = intl.formatMessage({ id: UNFULLSCREEN});

		return (
			!this.props.inFullscreenMode? 
				(<div id="main-toolbar" className="toolbar">
					<button
						className="toolbutton"
						id="activity-button"
						title={activityTitle} />
					<button
						className="toolbutton"
						id="network-button"
						title={networkTitle} />
					{!this.props.inEditMode &&
					!this.props.location.pathname.startsWith('/edit') &&
					!this.props.location.pathname.startsWith('/play') &&
					!this.props.location.pathname.startsWith('/scores') &&
						<button
							className="toolbutton"
							id="editor-button"
							title={editorButton}
							onClick={this.enterEditMode} />
					}	
					{this.props.inEditMode &&
						<button
							className="toolbutton"
							id="play-button"
							title={playButton}
							onClick={this.exitEditMode} />
					}
					{this.props.location.pathname !== '/' &&
						<button
							className="toolbutton"
							id="home-button"
							title={homeTitle}
							onClick={this.directToHome} />
					}
					{!this.props.location.pathname.startsWith('/new') &&
					!this.props.location.pathname.startsWith('/edit') &&
					!this.props.location.pathname.startsWith('/play') &&
					!this.props.location.pathname.startsWith('/scores') &&
					this.props.inEditMode &&
						<button
							className="toolbutton"
							id="add-button"
							title={addTitle}
							onClick={this.directToNew} />
					}
					<button
						className="toolbutton pull-right"
						id="fullscreen-button"
						title={fullScreen}
						onClick={this.props.toggleFullscreen} />
					<button
						className="toolbutton pull-right"
						id="stop-button"
						title={stopTitle}
						onClick={this.props.onStop} />
					<button
						className="toolbutton pull-right"
						id="help-button"
						title={helpTitle}
						onClick={this.startTutorial} />
					{this.state.showTutorial &&
						<Tutorial unmount={this.stopTutorial}
							pathname={this.props.history.location.pathname}
					/>}
				</div>)
				:(<button
					className="toolbutton"
					id="unfullscreen-button"
					title={unFullScreen}
					onClick={this.props.toggleFullscreen} />)
		);
	}
}

function mapStateToProps(state) {
	return {
		exercises: state.exercises
	};
}

export default injectIntl(withRouter(connect(mapStateToProps)(Navbar)));
