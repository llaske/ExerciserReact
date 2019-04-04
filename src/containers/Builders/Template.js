import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import "../../css/NewExerciseTemplate.css"
import {FormattedMessage} from 'react-intl';
import {
    MCQ_TEMPLATE_STRING,
    CLOZE_TEMPLATE_STRING,
    REORDER_TEMPLATE_STRING,
    CHOOSE,
    CLOZE_TEXT,
    MCQ,
    REORDER_LIST
} from "../translation";

class Template extends Component {

    mcqSelected = () => {
        this.props.history.push('/new/mcq')
    };

    clozeSelected = () => {
        this.props.history.push('/new/cloze')
    };

    reorderSelected = () => {
        this.props.history.push('/new/reorder')
    };
    
    render() {
        let styles = { "backgroundColor": this.props.current_user.colorvalue ? this.props.current_user.colorvalue.stroke : "#FFFFFF" };
        return (
            <div className="template-container" style={styles}>
                <div className="col-md-10 mx-auto">
                    <div className="row justify-content-center align-self-center">
                        <div className="col-sm-4">
                            <div className="card">
                                <div className="card-img-container">
                                    <div className="card-img-top background-mcq"/>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title"><FormattedMessage id={MCQ}/></h5>
                                    <p className="card-text">
                                        <FormattedMessage id={MCQ_TEMPLATE_STRING}/>
                                    </p>
                                    <button className="button-choose" onClick={this.mcqSelected}>
                                        <FormattedMessage id={CHOOSE}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="card">
                                <div className="card-img-container">
                                    <div className="card-img-top background-cloze"/>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title"><FormattedMessage id={CLOZE_TEXT}/></h5>
                                    <p className="card-text">
                                        <FormattedMessage id={CLOZE_TEMPLATE_STRING}/>
                                    </p>
                                    <button className="button-choose" onClick={this.clozeSelected}>
                                        <FormattedMessage id={CHOOSE}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="card">
                                <div className="card-img-container">
                                    <div className="card-img-top background-reorder"/>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title"><FormattedMessage id={REORDER_LIST}/></h5>
                                    <p className="card-text">
                                        <FormattedMessage id={REORDER_TEMPLATE_STRING}/>
                                    </p>
                                    <button className="button-choose" onClick={this.reorderSelected}>
                                        <FormattedMessage id={CHOOSE}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        current_user: state.current_user
    };
}


export default withRouter(connect(mapStateToProps)(Template));
