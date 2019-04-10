import {SET_ALL_EXERCISES, REMOVE_EXERCISE, ADD_NEW_EXERCISE, EDIT_EXERCISE, ADD_SCORE_TIME} from "../actionTypes";

const DEFAULT_STATE=[];

const exercises = (state = DEFAULT_STATE, actions) => {
    switch (actions.type) {
        case SET_ALL_EXERCISES:
            return [...actions.exercises];
        case ADD_NEW_EXERCISE:
            return [...state, actions.exercise];
        case EDIT_EXERCISE:
            return state.map((exercise, i) => {
                return exercise.id === actions.exercise.id ? actions.exercise : exercise
            });
        case REMOVE_EXERCISE:
            return state.filter(exercise => exercise.id !== actions.id);
        case ADD_SCORE_TIME:
            return state.map((exercise, i)=>{
                if(exercise.id=== actions.id){
                    const temp = {...exercise};
                    temp.scores.push(actions.score);
                    temp.times.push(actions.time);
                    return temp;
                }
                return exercise;
            });
        default:
            return state;
    }
};

export default exercises;