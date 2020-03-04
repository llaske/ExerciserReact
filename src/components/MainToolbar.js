import React from 'react';
import { injectIntl } from 'react-intl';
import Tutorial from '../components/Tutorial';
import { MY_ACTIVITY, HOME, ADD_EXERCISE, STOP, NETWORK, HELP, EDITOR, PLAY, FULLSCREEN } from "../containers/translation";


const MainToolbar = (props) => {
    let { intl } = props;
    let activityTitle = intl.formatMessage({ id: MY_ACTIVITY });
    let homeTitle = intl.formatMessage({ id: HOME });
    let addTitle = intl.formatMessage({ id: ADD_EXERCISE });
    let networkTitle = intl.formatMessage({ id: NETWORK });
    let stopTitle = intl.formatMessage({ id: STOP });
    let helpTitle = intl.formatMessage({ id: HELP });
    let editorButton = intl.formatMessage({ id: EDITOR});
    let playButton = intl.formatMessage({ id: PLAY});
    let fullScreen = intl.formatMessage({ id: FULLSCREEN});
    return(
        <div id="main-toolbar" className={"toolbar" + (props.inFullscreenMode ? " toolbar-hide" : "")}>
            <button
                className="toolbutton"
                id="activity-button"
                title={activityTitle} />
            <button
                className="toolbutton"
                id="network-button"
                title={networkTitle} />
            {!props.inEditMode &&
            !props.location.pathname.startsWith('/edit') &&
            !props.location.pathname.startsWith('/play') &&
            !props.location.pathname.startsWith('/scores') &&
                <button
                    className="toolbutton"
                    id="editor-button"
                    title={editorButton}
                    onClick={props.enterEditMode} />
            }	
            {props.inEditMode &&
                <button
                    className="toolbutton"
                    id="play-button"
                    title={playButton}
                    onClick={props.exitEditMode} />
            }
            {props.location.pathname !== '/' &&
                <button
                    className="toolbutton"
                    id="home-button"
                    title={homeTitle}
                    onClick={props.directToHome} />
            }
            {!props.location.pathname.startsWith('/new') &&
            !props.location.pathname.startsWith('/edit') &&
            !props.location.pathname.startsWith('/play') &&
            !props.location.pathname.startsWith('/scores') &&
            props.inEditMode &&
            <button
                className="toolbutton"
                id="add-button"
                title={addTitle}
                onClick={props.directToNew} />
            }
            <button
                className="toolbutton pull-right"
                id="stop-button"
                title={stopTitle}
                onClick={props.onStop} />
            <button
                className="toolbutton pull-right"
                id="fullscreen-button"
                title={fullScreen}
                onClick={props.toggleFullscreen} />
            <button
                className="toolbutton pull-right"
                id="help-button"
                title={helpTitle}
                onClick={props.startTutorial} />
            {props.showTutorial &&
                <Tutorial unmount={props.stopTutorial}
                    pathname={props.history.location.pathname}
            />}
        </div>
    );
}

export default injectIntl(MainToolbar);