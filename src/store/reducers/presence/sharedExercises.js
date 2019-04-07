import {GET_SHARED_EXERCISES, ADD_SHARED_EXERCISE, REMOVE_SHARED_EXERCISE, ADD_SHARED_RESULT} from "../../actionTypes";

const sharedExercises=(state = [], action)=> {
    switch (action.type) {
        case GET_SHARED_EXERCISES:
            return state;
        case ADD_SHARED_EXERCISE:
            return [...state, {...action.exercise, shared_results:[]}];
        case REMOVE_SHARED_EXERCISE:
            return state.filter(exercise => exercise.id !== action.id);
        case ADD_SHARED_RESULT:
            return state.map((exercise, i)=>{
                if(exercise.id=== action.result.id){
                    const temp= {...exercise};
                    let score_added=false;
                    temp.shared_results = temp.shared_results.map((result)=>{
                        if(result.user.name === action.result.user.name){
                            score_added=true;
                            return action.result
                        }
                        return result;
                    });
                    if(!score_added) temp.shared_results.push(action.result);
                    return temp;
                }
                return exercise;
            });
        default:
            return state
    }
};

export default sharedExercises;