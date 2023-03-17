import rootReducer from "./reducers";
import { createStore, compose, applyMiddleware } from "redux";

export function configureStore() {
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const store = createStore(rootReducer, composeEnhancers(applyMiddleware()))

	return store;
}