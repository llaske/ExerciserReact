import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',
	padding: grid * 2,
	margin: `0 0 ${grid}px 0`,

	// change background colour if dragging
	background: isDragging ? 'lightblue' : 'white',
	borderRadius: '10px',
	display: 'flex',
	alignItems: 'center',

	// styles we need to apply on draggables
	...draggableStyle,
});

const getListStyle = isDraggingOver => ({
	padding: grid
});

const getContentStyle = {
	textAlign: 'center',
	display: 'inline-block',
	width: '95%'
};

export default class DragList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			items: [],
		};
		this.onDragEnd = this.onDragEnd.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.items.length === 0) {
			let list = nextProps.list;
			list = list.map((li, i) => {
				return {
					id: i,
					content: li
				}
			});
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

		this.setState({
			items,
		}, () => {
			this.props.onChange(this.state.items)
		});
	}

	// Normally you would want to split things out into separate components.
	// But in this example everything is just done in one place for simplicity
	render() {
		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<Droppable droppableId="droppable">
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							style={getListStyle(snapshot.isDraggingOver)}
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
										>
											<div style={{display:'flex',width:'95%'}} {...provided.dragHandleProps}
												className="handler">
												<img style={{ width: '1.5em', objectFit: 'contain' }}
													src={require("../icons/exercise/reorder-drag.png")}
													alt="handler"
												></img>
													<div style={getContentStyle}>
												{item.content}
												</div>
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

// Put the thing into the DOM!
