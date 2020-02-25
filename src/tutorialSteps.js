
export const tutorialSteps = (pathname, intl) => {
	let steps;
	switch (pathname) {
		// Exercise List
		case "/":
			steps = [];
			if (!(document.getElementsByClassName("share-button")[0]) && document.getElementById("editor-button")){
				steps = [
					{
						selector: "",
						content: [intl.formatMessage({ id: "Exerciser" }), intl.formatMessage({ id: "This activity is an academic focused activity for the Sugarizer platform. It provides teachers to build interactive exercises for students, using multiple templates, and share them with their students using the sugarizer-server." })]
					},
					
					{
						selector: "#network-button",
						content: [intl.formatMessage({ id: "Network Button" }), intl.formatMessage({ id: "Lets you share your exercises with other users." })]
					},
					{
						selector: "#editor-button",
						content: [intl.formatMessage({ id: "Editor Button" }), intl.formatMessage({ id: "Press this button to enter editor mode and edit/add/delete your exercises" })]
					},
					{
						selector: "#fullscreen-button",
						content: [intl.formatMessage({ id: "Fullscreen Button" }), intl.formatMessage({ id: "Press this button to enter Fullscreen mode." })]
					},
					{
						selector: "#stop-button",
						content: [intl.formatMessage({ id: "Stop Button" }), intl.formatMessage({ id: "Press this button to stop the activity, don\"t worry your changes will be saved in the Journal." })]
					},
					{
						selector: ".play-button",
						content: [intl.formatMessage({ id: "Play Button" }), intl.formatMessage({ id: "Use this button if you want to play the Exercise." })]
					},
				];
			} else if (document.getElementById("play-button")) {
				steps = [
					{
						selector: "#play-button",
						content: [intl.formatMessage({ id: "Play button" }), intl.formatMessage({ id: "Press this button to exit edit mode and return to the play mode." })]
					},
					{
						selector: "#add-button",
						content: [intl.formatMessage({ id: "Add Exercises" }), intl.formatMessage({ id: "This button takes you to a list of templates from which you can choose a one to work with." })]
					},
					{
						selector: ".edit-button",
						content: [intl.formatMessage({ id: "Edit Button" }), intl.formatMessage({ id: "Use this button if you want to edit the Exercise." })]
					},
					{
						selector: ".delete-button",
						content: [intl.formatMessage({ id: "Delete Button" }), intl.formatMessage({ id: "Use this button if you want to delete the Exercise." })]
					}
				]
			}
			if (document.getElementsByClassName("share-button")[0]) {
				steps.push({
					selector: ".share-button",
					content: [intl.formatMessage({ id: "Share Button" }), intl.formatMessage({ id: "Use this button if you want to share this Exercise." })]
				});
			}
			if (document.getElementsByClassName("result-button")[0]) {
				steps.push({
					selector: ".result-button",
					content: [intl.formatMessage({ id: "Result Button" }), intl.formatMessage({ id: "Use this button to see results of all the users." })]
				});
			}
			if (document.getElementsByClassName("user-list-button")[0]) {
				steps.push({
					selector: ".user-list-button",
					content: [intl.formatMessage({ id: "User List Button" }), intl.formatMessage({ id: "Use this button to see list of all the users." })]
				});
			}
			break;

		// Add new Exercise
		case "/new": steps = [
			{
				selector: ".button-choose",
				content: [intl.formatMessage({ id: "Select Template" }), intl.formatMessage({ id: "Click on this button to build an exercise using this template." })]
			}
		];
			break;

		// Scores
		case "/scores": steps = [
			{
				selector: ".score-button",
				content: [intl.formatMessage({ id: "Scores" }), intl.formatMessage({ id: "Shows a graphical representation of the fraction of questions answered correctly." })]
			},
			{
				selector: ".time-button",
				content: [intl.formatMessage({ id: "Time" }), intl.formatMessage({ id: "Shows a graphical representation of the time taken." })]
			},
			{
				selector: ".detail-button",
				content: [intl.formatMessage({ id: "Detailed Result" }), intl.formatMessage({ id: "Comparison of your answers against the correct answers." })]
			}
		];
			break;

		// Shared Scores
		case "/presence/scores": steps = [
			{
				selector: ".score-button",
				content: [intl.formatMessage({ id: "Scores" }), intl.formatMessage({ id: "Shows a graphical representation of the fraction of questions answered correctly." })]
			},
			{
				selector: ".time-button",
				content: [intl.formatMessage({ id: "Time" }), intl.formatMessage({ id: "Shows a graphical representation of the time taken." })]
			},
			{
				selector: ".detail-button",
				content: [intl.formatMessage({ id: "Detailed Result" }), intl.formatMessage({ id: "Comparison of answers of all users against the correct answers." })]
			}
		];
			break;

		// MCQ
		case "/new/mcq": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Question Menu" }), intl.formatMessage({ id: "Select the type of question you want to insert." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/edit/mcq": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Question" }), intl.formatMessage({ id: "Use this button to change the type of Question." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/play/mcq": steps = [
			{
				selector: ".choices",
				content: [intl.formatMessage({ id: "Select Choices" }), intl.formatMessage({ id: "Select one of the options as your answer." })]
			}
		];
			break;

		// Cloze
		case "/new/cloze": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Question Menu" }), intl.formatMessage({ id: "Select the type of question you want to insert." })]
			},
			{
				selector: ".type-write",
				content: [intl.formatMessage({ id: "Blank Type" }), intl.formatMessage({ id: "Let's user write answers in blanks." })]
			},
			{
				selector: ".type-options",
				content: [intl.formatMessage({ id: "Blank Type" }), intl.formatMessage({ id: "Let's user select answer from a drop down menu." })]
			},
			{
				selector: ".button-add-blank",
				content: [intl.formatMessage({ id: "Add Blank" }), intl.formatMessage({ id: "Click on this button to insert blanks in the questions. The number of blanks should be less than the number of options." })]
			},
			{
				selector: "#cloze-text",
				content: [intl.formatMessage({ id: "Cloze Text" }), intl.formatMessage({ id: "The string represented by -{Number}- is replaced by a blank or a drop down menu in the preview, also the ith blank's answer is represented by the ith option field." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/edit/cloze": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Question" }), intl.formatMessage({ id: "Use this button to change the type of Question." })]
			},
			{
				selector: ".type-write",
				content: [intl.formatMessage({ id: "Blank Type" }), intl.formatMessage({ id: "Let's user write answers in blanks." })]
			},
			{
				selector: ".type-options",
				content: [intl.formatMessage({ id: "Blank Type" }), intl.formatMessage({ id: "Let's user select answer from a drop down menu." })]
			},
			{
				selector: ".button-add-blank",
				content: [intl.formatMessage({ id: "Add Blank" }), intl.formatMessage({ id: "Click on this button to insert blanks in the questions. The number of blanks should be less than the number of options." })]
			},
			{
				selector: "#cloze-text",
				content: [intl.formatMessage({ id: "Cloze Text" }), intl.formatMessage({ id: "The string represented by -{Number}- is replaced by a blank or a drop down menu in the preview, also the ith blank's answer is represented by the ith option field." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/play/cloze": steps = [
			{
				selector: ".answers",
				content: [intl.formatMessage({ id: "Cloze Answer" }), intl.formatMessage({ id: "Select an option from the drop down or type your answer." })]
			}
		];
			break;

		// Reorder
		case "/new/reorder": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Question Menu" }), intl.formatMessage({ id: "Select the type of question you want to insert." })]
			},
			{
				selector: ".up-button",
				content: [intl.formatMessage({ id: "Move option Up" }), intl.formatMessage({ id: "Use this button to move the option up." })]
			},
			{
				selector: ".down-button",
				content: [intl.formatMessage({ id: "Move option down" }), intl.formatMessage({ id: "Use this button to move the option down." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/edit/reorder": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Question" }), intl.formatMessage({ id: "Use this button to change the type of Question." })]
			},
			{
				selector: ".up-button",
				content: [intl.formatMessage({ id: "Move option Up" }), intl.formatMessage({ id: "Use this button to move the option up." })]
			},
			{
				selector: ".down-button",
				content: [intl.formatMessage({ id: "Move option Down" }), intl.formatMessage({ id: "Use this button to move the option down." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			}
		];
			break;
		case "/play/reorder": steps = [
			{
				selector: ".handler",
				content: [intl.formatMessage({ id: "Drag Handler" }), intl.formatMessage({ id: "Use this handler to drag options up and down." })]
			}
		];
			break;

		// Group Assignment
		case "/new/group": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".group-option-type",
				content: [intl.formatMessage({ id: "Group Type" }), intl.formatMessage({ id: "Select between group type to be text or image." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Question Menu" }), intl.formatMessage({ id: "Select the type of question you want to insert." })]
			},
			{
				selector: ".answers",
				content: [intl.formatMessage({ id: "Select Group" }), intl.formatMessage({ id: "Select the group from the dropdown to which this question belong." })]
			}
		];
			break;
		case "/edit/group": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-choices-edit",
				content: [intl.formatMessage({ id: "Edit Group Type" }), intl.formatMessage({ id: "Edit group type to select between text and image." })]
			},
			{
				selector: ".button-choices-add",
				content: [intl.formatMessage({ id: "Add Option" }), intl.formatMessage({ id: "Use this button to add another option field." })]
			},
			{
				selector: ".button-choices-sub",
				content: [intl.formatMessage({ id: "Remove Option" }), intl.formatMessage({ id: "Use this button to remove the last option field." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Question" }), intl.formatMessage({ id: "Use this button to change the type of Question." })]
			},
			{
				selector: ".group-answer",
				content: [intl.formatMessage({ id: "Select Group" }), intl.formatMessage({ id: "Select the group from the dropdown to which this question belong." })]
			}
		];
			break;
		case "/play/group": steps = [
			{
				selector: ".box",
				content: [intl.formatMessage({ id: "Item" }), intl.formatMessage({ id: "Drag this item to its correct group." })]
			}
		];
			break;


		// Free Text Input
		case "/new/freeText": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Question Menu" }), intl.formatMessage({ id: "Select the type of question you want to insert." })]
			},
			{
				selector: ".answers",
				content: [intl.formatMessage({ id: "Answer" }), intl.formatMessage({ id: "Type the answer here." })]
			}
		];
			break;
		case "/edit/freeText": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Question" }), intl.formatMessage({ id: "Use this button to change the type of Question." })]
			},
			{
				selector: ".answers",
				content: [intl.formatMessage({ id: "Answer" }), intl.formatMessage({ id: "Type the answer here." })]
			}
		];
			break;
		case "/play/freeText": steps = [
			{
				selector: ".input-freeText",
				content: [intl.formatMessage({ id: "Answer Box" }), intl.formatMessage({ id: "Type the answer in this box." })]
			}
		];
			break;

		// Matching Pair
		case "/new/match": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".question-options",
				content: [intl.formatMessage({ id: "Item Menu" }), intl.formatMessage({ id: "Select the type of item you want to insert." })]
			}
		];
			break;
		case "/edit/match": steps = [
			{
				selector: ".button-thumbnail",
				content: [intl.formatMessage({ id: "Select Thumbnail" }), intl.formatMessage({ id: "Choose a different thumbnail from the Journal Chooser." })]
			},
			{
				selector: ".button-edit",
				content: [intl.formatMessage({ id: "Edit Item" }), intl.formatMessage({ id: "Use this button to change the type of the item." })]
			}
		];
			break;
		case "/play/match": steps = [
			{
				selector: ".box",
				content: [intl.formatMessage({ id: "Draw Connection" }), intl.formatMessage({ id: "Select and drag the semicircle to its corresponding match." })]
			}
		];
			break;

		default: steps = [];
			break;
	}
	return steps;
}