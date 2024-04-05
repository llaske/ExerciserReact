import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Exercise from "./Exercise";
import "../css/ExerciseDragList.css";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
};

const grid = 12;

const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: "none",
	margin: `0 0 ${grid}px 0`,

	// change background colour if dragging
	background: isDragging ? "lightblue" : "transparent",
	borderRadius: "10px",
	display: "flex",
	alignItems: "center",

	// styles we need to apply on draggables
	...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
	padding: grid,
});

export default class ExerciseDragList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			items: this.props.list,
		};
		this.onDragEnd = this.onDragEnd.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.items.length === 0) {
			let list = nextProps.list;
			list = list.map((li, i) => li);
			this.setState({ items: list });
		}
	}

	onDragEnd(result) {
		// dropped outside the list
		if (!result.destination) {
			return;
		}
		const items = reorder(
			this.state.items,
			result.source.index,
			result.destination.index
		);
		this.props.updateExercises(items);
		this.setState({ items });
	}

	onDelete(state,props,item) {
		props.onDelete(item.id);
		var items = [];
		for (var i = 0 ; i < state.items.length ; i++) {
			if (state.items[i].id != item.id) {
				items.push(state.items[i]);
			}
		}
		this.setState({ items: items });
	}

	// Normally you would want to split things out into separate components.
	// But in this example everything is just done in one place for simplicity
	render() {
		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<Droppable droppableId='droppable'>
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							style={getListStyle(snapshot.isDraggingOver)}
							className='d-flex flex-wrap'
						>
							{this.state.items.map((item, index) => (
								<Draggable key={item.id} draggableId={item.id} index={index}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											style={getItemStyle(
												snapshot.isDragging,
												provided.draggableProps.style
											)}
											className='drag-exercise'
										>
											<div className='col-md-11 exercise-div draggable-exercise'>
												<Exercise
													onDelete={() => this.onDelete(this.state,this.props,item)}
													onPlay={this.props.onPlay}
													onEdit={this.props.onEdit}
													isHost={this.props.isHost}
													isShared={this.props.isShared}
													onShare={this.props.onShare}
													presenceResult={this.props.presenceResult}
													inEditMode={this.props.inEditMode}
													allowDraggable={provided.dragHandleProps}
													{...item}
												/>
											</div>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}
}
