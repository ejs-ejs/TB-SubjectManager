var stringBundle;

var bakSubjectsList;
var bakSubjectPickedBehaviour;
var bakSubjectPickedBeginningEnd;
var bakSubjectPickedEndBeginning;
var bakSubjectsListCaseSensitive;
var bakSubjectsAdvancedMode;
var bakHandleSubjectsIdentities;
var bakDefaultSubjects;
var bakGlobalCounterSettings;
var bakHandleCounterIdentities;
var bakIndividualCountersSettings;
var bakIncludeReplyPrefixes;
var bakReplyPrefixesList;
var bakIncludeForwardPrefixes;
var bakForwardPrefixesList;
var bakIncludeOtherPrefixes;
var bakOtherPrefixesList;
var bakRemoveAutoPrefixes;
var bakKeep1stPrefix;
var bakReplace1stReplyPrefix;
var bakReplyReplacementPrefix;
var bakReplace1stForwardPrefix;
var bakForwardReplacementPrefix;
var bakFilterSubjectsSettings;
var bakSubjectBoxAutoCompleteEnabled;
var bakSubjectBoxAutoCompleteCaseSensitive;
var bakSubjectBoxButtonEnabled;
var bakSubjectBoxButtonLabelReplaced;
var bakFocusEmailBodyOnceSubjectPicked
var bakDebugMode;
var bakDebugMode;
var bakDebugModeToFile;
var bakDebugFileName;

var subjectsListBoxChanged;
var subjectsListSorted;

var defaultSubjectsChanged;

var individualCountersChanged;

var subjectsList;

var filterSubjectsList = {};
var oldFilterSubjectsList = null;
var selectedFilterKey = "";

function sendMessageToConsole(source, message, msgType)
{
	msgType = ( typeof(msgType) !== "undefined" ) ? msgType : "information";

	SubjectManager.debugMode = document.getElementById("debugModeCheckBox").checked;
	SubjectManager.debugModeToFile = document.getElementById("debugModeToFileCheckBox").checked;
	SubjectManager.debugFileName = unescape(document.getElementById("debugFileName").value); // decodes string

	switch ( msgType ) {
		case "warning":
			SubjectManager.localConsole.logWarning(source, message);
			break;
		case "error":
			SubjectManager.localConsole.logError(source, message);
			break;
		case "information":
		default:
			SubjectManager.localConsole.logInformation(source, message);
			break;
	}
}

function initializeSettings()
{
	// initializations
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions." + SubjectManager.addOnName + ".");

	SubjectManager.resetAllCounters(prefs);

	stringBundle = document.getElementById("subjectManagerOptionsStringBundle");

	cleanIndividualCountersSettings();

	//
	if ( (window.arguments != null) && (window.arguments[0] != "") ) { // (JSCTSABT)
		if ( window.arguments[0] < document.getElementById("subjectManagerTabBox").tabs.itemCount - 1 ) {
			document.getElementById("subjectManagerTabBox").selectedIndex = window.arguments[0];
		}
	}

	// tab 'subjects list' > group 'subjects'
	subjectsList = document.getElementById("subjectsList").value;
	bakSubjectsList = subjectsList;

	subjectsListBoxChanged = false;
	document.getElementById("subjectsListChanged").value = false;
	subjectsListSorted = 0;

	initializeSubjectsList2();

	var simulateSubjectParsingLabelSize = document.getElementById("simulateSubjectParsingHBox").clientWidth - document.getElementById("sortSubjectsButton").clientWidth; // computes max width
	document.getElementById("simulateSubjectParsingLabel").setAttribute('maxwidth', simulateSubjectParsingLabelSize);

	onClickSubjectPickedRadioGroup();

	// tab 'subjects list' > group 'miscellaneous'
	bakSubjectsListCaseSensitive = document.getElementById("subjectsListCaseSensitive").value;
	bakSubjectsAdvancedMode = document.getElementById("subjectsAdvancedMode").value;

	onClickSubjectsAdvancedModeCheckBox(bakSubjectsAdvancedMode);

	// tab 'subjects list' > group 'when a subject is picked from the list'
	bakSubjectPickedBehaviour = document.getElementById("subjectPickedBehaviour").value;
	bakSubjectPickedBeginningEnd = document.getElementById("subjectPickedBeginningEnd").value;
	bakSubjectPickedEndBeginning = document.getElementById("subjectPickedEndBeginning").value;

	// tab 'default subjects'
	bakHandleSubjectsIdentities = document.getElementById("handleSubjectsIdentities").value;
	bakDefaultSubjects = document.getElementById("defaultSubjects").value;

	defaultSubjectsChanged = false;

	initializeDefaultSubjects2();
	reinitializeDefaultSubjectObjects(false);

	// tab 'counters' > group 'global counter'
	bakGlobalCounterSettings = document.getElementById("globalCounterSettings").value;

	initializeGlobalCounterSettings();

	// tab 'counters' > group 'individual counters'
	bakHandleCounterIdentities = document.getElementById("handleCounterIdentities").value;
	bakIndividualCountersSettings = document.getElementById("individualCountersSettings").value;

	individualCountersChanged = false;

	initializeIndividualCounters();
	reinitializeIndividualCounterObjects(false);

	// tab 'automatic prefixes'
	bakIncludeReplyPrefixes = document.getElementById("includeReplyPrefixes").value;
	bakReplyPrefixesList = document.getElementById("replyPrefixesList").value;
	bakIncludeForwardPrefixes = document.getElementById("includeForwardPrefixes").value;
	bakForwardPrefixesList = document.getElementById("forwardPrefixesList").value;
	bakIncludeOtherPrefixes = document.getElementById("includeOtherPrefixes").value;
	bakOtherPrefixesList = document.getElementById("otherPrefixesList").value;
	bakRemoveAutoPrefixes = document.getElementById("removeAutoPrefixes").value;

	document.getElementById("replyPrefixesListTextBox").value = unescape(bakReplyPrefixesList);
	document.getElementById("forwardPrefixesListTextBox").value = unescape(bakForwardPrefixesList);
	document.getElementById("otherPrefixesListTextBox").value = unescape(bakOtherPrefixesList);

	onClickReplyPrefixesCheckBox(bakIncludeReplyPrefixes);
	onClickForwardPrefixesCheckBox(bakIncludeForwardPrefixes);
	onClickOtherPrefixesCheckBox(bakIncludeOtherPrefixes);

	// tab 'automatic prefixes' > group 'keep first automatic prefix'
	bakKeep1stPrefix = document.getElementById("keep1stPrefix").value;
	bakReplace1stReplyPrefix = document.getElementById("replace1stReplyPrefix").value;
	bakReplyReplacementPrefix = document.getElementById("replyReplacementPrefix").value;
	bakReplace1stForwardPrefix = document.getElementById("replace1stForwardPrefix").value;
	bakForwardReplacementPrefix = document.getElementById("forwardReplacementPrefix").value;

	document.getElementById("replyReplacementPrefixTextBox").value = unescape(bakReplyReplacementPrefix);
	document.getElementById("forwardReplacementPrefixTextBox").value = unescape(bakForwardReplacementPrefix);

	onClickKeep1stPrefixCheckBox(bakKeep1stPrefix);

	// tab 'message filters'
	bakFilterSubjectsSettings = document.getElementById("filterSubjectsSettings").value;

	document.getElementById("filterSettingsCaption").label = stringBundle.getString('filterSettingsLabel');

	selectedFilterKey = "";

	initializeFilterSubjectsSettings();

	createFiltersCheckBoxes(true);
	reinitializeFilterSubjectObjects();

	// tab 'miscellaneous' > group 'options of subject field of message composing window'
	bakSubjectBoxAutoCompleteEnabled = document.getElementById("subjectBoxAutoCompleteEnabled").value;
	bakSubjectBoxAutoCompleteCaseSensitive = document.getElementById("subjectBoxAutoCompleteCaseSensitive").value;
	bakSubjectBoxButtonEnabled = document.getElementById("subjectBoxButtonEnabled").value;
	bakSubjectBoxButtonLabelReplaced = document.getElementById("subjectBoxButtonLabelReplaced").value;
	bakFocusEmailBodyOnceSubjectPicked = document.getElementById("focusEmailBodyOnceSubjectPicked").value;

	onClickSubjectBoxAutoCompleteEnabledCheckBox(bakSubjectBoxAutoCompleteEnabled);
	onClickSubjectBoxButtonEnabledCheckBox(bakSubjectBoxButtonEnabled);

	// tab 'miscellaneous' > group 'help and support'
	bakDebugMode = document.getElementById("debugMode").value;
	bakDebugModeToFile = document.getElementById("debugModeToFile").value;
	bakDebugFileName = unescape(document.getElementById("debugFileName").value); // decodes string
	document.getElementById("debugModeToFileTextBox").value = bakDebugFileName;

	onClickDebugModeCheckBox(bakDebugMode);

	//
	if ( !SubjectManager.isTBVersionEqualOrHigherThan("3.0a1pre") ) { // if TB version is prior to v3
		document.getElementById("subjectBoxAutoCompleteEnabledCheckBox").hidden = true; // disables autocompletion checkbox
		document.getElementById("subjectBoxAutoCompleteCaseSensitiveCheckBox").hidden = true; // disables autocompletion case sensitive checkbox
		document.getElementById("focusEmailBodyOnceSubjectPickedCheckBox").hidden = true; // disables focus checkbox
		document.getElementById("reInitAutoCompletionButton").hidden = true; // disables reinit autocompletion button
	}

	if ( SubjectManager.isTBVersionEqualOrHigherThan("5.0b1") ) { // if TB version is posterior or equal to v5
		document.getElementById("reInitAutoCompletionButton").hidden = true; // disables autocompletion checkbox
	}

	sendMessageToConsole("options.initializeSettings", "Settings have been initialized");
}

function saveSettings()
{
	// tab 'subjects list' > group 'subjects'
	var subjectsListBox = document.getElementById("subjectsListBox");

	// update of subjects list
	if ( subjectsListBox != null ) { // (JSCTSABT)
		if ( subjectsListBoxChanged ) { // if any change has been made
			var subjectsString = "";
			var subjectsArray = new Array();

			// creation of subjects string
			for ( var idx = 0 ; idx < subjectsListBox.getRowCount() ; idx++ ) { // for each subject of subjects listbox
				subjectsArray.push(subjectsListBox.getItemAtIndex(idx).getAttribute('label')); // adds subject into array
			}

			subjectsString = SubjectManager.escapeArray(subjectsArray).join(document.getElementById("subjectsListSeparator").value); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string

			sendMessageToConsole("options.accept", "Subjects list has been modified: " + subjectsString);

			document.getElementById("subjectsList").value = subjectsString; // saves subjects list
			document.getElementById("subjectsListChanged").value = true;
		}
		else {
			sendMessageToConsole("options.accept", "Subjects list has not been modified");
		}
	}

	// tab 'default subjects'
	saveDefaultSubjects();

	// tab 'counters'

	// tab 'counters' > group 'global counter'
	var tempUpdateCounter = 0;
	if ( document.getElementById("updateGlobalCounterCheckBox1").checked ) {
		tempUpdateCounter += 1;
	}
	if ( document.getElementById("updateGlobalCounterCheckBox2").checked ) {
		tempUpdateCounter += 2;
	}
	if ( document.getElementById("updateGlobalCounterCheckBox3").checked ) {
		tempUpdateCounter += 4;
	}

	var tempGlobalCounterArray = {};

	tempGlobalCounterArray['global'] = new SubjectManager.CounterSettings(
		document.getElementById("globalCounterValueTextBox").value,
		tempUpdateCounter,
		document.getElementById("globalCounterFormatTextBox").value,
		document.getElementById("globalCounterResetMenuList").value
	); // creates a new global counter object

	document.getElementById("globalCounterSettings").value = JSON.stringify(tempGlobalCounterArray); // saves global counter settings

	// tab 'counters' > group 'individual counters'
	onClickUpdateIndividualCounterButton();
	saveIndividualCounters();

	// tab 'automatic prefixes'
	document.getElementById("replyPrefixesList").value = escape(document.getElementById("replyPrefixesListTextBox").value);
	document.getElementById("forwardPrefixesList").value = escape(document.getElementById("forwardPrefixesListTextBox").value);
	document.getElementById("otherPrefixesList").value = escape(document.getElementById("otherPrefixesListTextBox").value);

	if ( document.getElementById("replyPrefixesList").value === "" ) {
		document.getElementById("includeReplyPrefixes").value = false;
	}
	if ( document.getElementById("forwardPrefixesList").value === "" ) {
		document.getElementById("includeForwardPrefixes").value = false;
	}
	if ( document.getElementById("otherPrefixesList").value === "" ) {
		document.getElementById("includeOtherPrefixes").value = false;
	}

	// tab 'automatic prefixes' > group 'keep first automatic prefix'
	document.getElementById("replyReplacementPrefix").value = escape(document.getElementById("replyReplacementPrefixTextBox").value);
	document.getElementById("forwardReplacementPrefix").value = escape(document.getElementById("forwardReplacementPrefixTextBox").value);

	// tab 'message filters'
	saveFilterSubjectsSettings(selectedFilterKey);

	var filtersHBoxRows = document.getElementById("filtersHBoxRows");

	if ( (filtersHBoxRows != null) && filtersHBoxRows.hasChildNodes() ) { // (JSCTSABT) if filters groupbox exists and has children
		var xulElement = filtersHBoxRows.firstChild; // gets first element

		while ( xulElement != null ) { // while there is a next element
			if ( (xulElement.nodeName === "row") && xulElement.hasChildNodes() ) {
				var rowElement = xulElement.firstChild; // gets first element

				while ( rowElement != null ) { // while there is a next row element
					if ( rowElement.nodeName === "checkbox" ) { // if child is a checkbox
						var rowElementId = rowElement.id;

						var filterKey = rowElementId.substring(rowElementId.indexOf("-") + 1); // gets filter key
						var accountKey = rowElementId.substring(rowElementId.indexOf("-") + 1, rowElementId.indexOf("_")); // gets account key
						var filterName = rowElementId.substring(rowElementId.indexOf("_") + 1); // gets filter name

						filterSubjectsList[filterKey].enabled = rowElement.checked;
					}

					rowElement = rowElement.nextSibling; // gets next row element
				}
			}

			xulElement = xulElement.nextSibling; // gets next element
		}
	}

	var filterSubjectsSettings = SubjectManager.JSONstringify(filterSubjectsList, SubjectManager.preProcessSaveSettings, new Array("subject")); // converts filter subjects settings list into JSON string
	document.getElementById("filterSubjectsSettings").value = filterSubjectsSettings; // saves profiles settings

	sendMessageToConsole("options.saveSettings", "Filter subjects settings are: '" + filterSubjectsSettings + "'");

	// tab 'miscellaneous' > group 'help and support'
	if ( document.getElementById("debugModeToFileTextBox").value == "" ) {
		document.getElementById("debugModeToFile").value = false;
	}
	document.getElementById("debugFileName").value = escape(document.getElementById("debugModeToFileTextBox").value); // encodes string

	//
	sendMessageToConsole("options.saveSettings", "Settings have been saved");
}

function resetSettings()
{
	// tab 'subjects list' > group 'subjects'
	document.getElementById("subjectEditTextBox").value = "";
	document.getElementById("subjectsList").value = bakSubjectsList;
	subjectsList = bakSubjectsList;

	subjectsListBoxChanged = false;
	document.getElementById("subjectsListChanged").value = false;
	subjectsListSorted = 0;

	initializeSubjectsList2();

	onClickSubjectPickedRadioGroup();

	// tab 'subjects list' > group 'miscellaneous'
	document.getElementById("subjectsListCaseSensitive").value = bakSubjectsListCaseSensitive;
	document.getElementById("subjectsAdvancedMode").value = bakSubjectsAdvancedMode;

	onClickSubjectsAdvancedModeCheckBox(bakSubjectsAdvancedMode);

	// tab 'subjects list' > group 'when a subject is picked from the list'
	document.getElementById("subjectPickedBehaviour").value = bakSubjectPickedBehaviour;
	document.getElementById("subjectPickedBeginningEnd").value = bakSubjectPickedBeginningEnd;
	document.getElementById("subjectPickedEndBeginning").value = bakSubjectPickedEndBeginning;

	// tab 'default subjects'
	document.getElementById("handleSubjectsIdentities").value = bakHandleSubjectsIdentities;
	document.getElementById("defaultSubjects").value = bakDefaultSubjects;

	defaultSubjectsChanged = false;

	initializeDefaultSubjects2();
	reinitializeDefaultSubjectObjects(false);

	// tab 'counters' > group 'global counter'
	document.getElementById("globalCounterSettings").value = bakGlobalCounterSettings;

	initializeGlobalCounterSettings();

	// tab 'counters' > group 'individual counters'
	document.getElementById("handleCounterIdentities").value = bakHandleCounterIdentities;
	document.getElementById("individualCountersSettings").value = bakIndividualCountersSettings;

	individualCountersChanged = false;

	initializeIndividualCounters();
	reinitializeIndividualCounterObjects(false);

	// tab 'automatic prefixes'
	document.getElementById("includeReplyPrefixes").value = bakIncludeReplyPrefixes;
	// document.getElementById("replyPrefixesList").value = bakReplyPrefixesList;
	document.getElementById("includeForwardPrefixes").value = bakIncludeForwardPrefixes;
	// document.getElementById("forwardPrefixesList").value = bakForwardPrefixesList;
	document.getElementById("includeOtherPrefixes").value = bakIncludeOtherPrefixes;
	// document.getElementById("otherPrefixesList").value = bakOtherPrefixesList;
	document.getElementById("removeAutoPrefixes").value = bakRemoveAutoPrefixes;

	document.getElementById("replyPrefixesListTextBox").value = unescape(bakReplyPrefixesList);
	document.getElementById("forwardPrefixesListTextBox").value = unescape(bakForwardPrefixesList);
	document.getElementById("otherPrefixesListTextBox").value = unescape(bakOtherPrefixesList);

	onClickReplyPrefixesCheckBox(bakIncludeReplyPrefixes);
	onClickForwardPrefixesCheckBox(bakIncludeForwardPrefixes);
	onClickOtherPrefixesCheckBox(bakIncludeOtherPrefixes);

	// tab 'automatic prefixes' > group 'keep first automatic prefix'
	document.getElementById("keep1stPrefix").value = bakKeep1stPrefix;
	document.getElementById("replace1stReplyPrefix").value = bakReplace1stReplyPrefix;
	// document.getElementById("replyReplacementPrefix").value = bakReplyReplacementPrefix;
	document.getElementById("replace1stForwardPrefix").value = bakReplace1stForwardPrefix;
	// document.getElementById("forwardReplacementPrefix").value = bakForwardReplacementPrefix;

	document.getElementById("replyReplacementPrefixTextBox").value = unescape(bakReplyReplacementPrefix);
	document.getElementById("forwardReplacementPrefixTextBox").value = unescape(bakForwardReplacementPrefix);

	onClickKeep1stPrefixCheckBox(bakKeep1stPrefix);

	// tab 'miscellaneous' > group 'options of subject field of message composing window'
	document.getElementById("subjectBoxAutoCompleteEnabled").value = bakSubjectBoxAutoCompleteEnabled;
	document.getElementById("subjectBoxAutoCompleteCaseSensitive").value = bakSubjectBoxAutoCompleteCaseSensitive;
	document.getElementById("subjectBoxButtonEnabled").value = bakSubjectBoxButtonEnabled;
	document.getElementById("subjectBoxButtonLabelReplaced").value = bakSubjectBoxButtonLabelReplaced;
	document.getElementById("focusEmailBodyOnceSubjectPicked").value = bakFocusEmailBodyOnceSubjectPicked;

	onClickSubjectBoxAutoCompleteEnabledCheckBox(bakSubjectBoxAutoCompleteEnabled);
	onClickSubjectBoxButtonEnabledCheckBox(bakSubjectBoxButtonEnabled);

	// tab 'message filters'
	// document.getElementById("filterSubjectsSettings").value = bakFilterSubjectsSettings;

	document.getElementById("filterSettingsCaption").label = stringBundle.getString('filterSettingsLabel');

	oldFilterSubjectsList = null;
	selectedFilterKey = "";

	initializeFilterSubjectsSettings();

	createFiltersCheckBoxes();
	reinitializeFilterSubjectObjects();

	// tab 'miscellaneous' > group 'help and support'
	document.getElementById("debugMode").value = bakDebugMode;
	document.getElementById("debugModeToFile").value = bakDebugModeToFile;
	document.getElementById("debugModeToFileTextBox").value = bakDebugFileName;

	onClickDebugModeCheckBox(bakDebugMode);

	//
	sendMessageToConsole("options.resetSettings", "Settings have been resetted", "warning");
}

/*
 *  //'subjects list' functions
 *function initializeSubjectsList()
 *{
 *	var subjectsListBox = document.getElementById("subjectsListBox");
 *
 *	if ( subjectsListBox != null ) { // (JSCTSABT)
 *		// clearance of subjects list
 *	//	for ( var idx = subjectsListBox.getRowCount() - 1 ; idx >= 0 ; idx-- ) { // for each subject of the listbox (reverse order)
 *	 	for ( var idx = subjectsListBox.length - 1 ; idx >= 0 ; idx-- ) { // for each subject of the listbox (reverse order)
 *			subjectsListBox.removeItemAt(idx); // removes last item
 *		}
 *
 *		// extraction of subjects list
 *		var subjectsArray = null;
 *
 *		if ( (subjectsList == null) || (subjectsList == "") ) { // if subjects list is undefined or empty
 *			subjectsArray = new Array();
 *		}
 *		else {
 *			subjectsArray = SubjectManager.unescapeArray(subjectsList.split(new RegExp(document.getElementById("subjectsListSeparator").value, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects
 *		}
 *
 *		// filling of subjects list
 *		for ( var idx = 0 ; idx < subjectsArray.length ; idx++ ) { // for each subject
 *			subjectsListBox.appendItem(subjectsArray[idx]); // adds it to subjects listbox
 *		}
 *
 *		sendMessageToConsole("options.initializeSubjectsList", subjectsListBox.length + " subjects have been loaded");
 *	}
 *}
 */

// 'subjects list' functions
function initializeSubjectsList2()
{
	var subjectsListBox = document.getElementById("subjectsListBox");

	if ( subjectsListBox != null ) { // (JSCTSABT)
		// clear the subjects list
	for ( var idx = subjectsListBox.length - 1 ; idx >= 0 ; idx-- ) { // for each subject of the listbox (reverse order)
			subjectsListBox.removeItemAt(idx); // removes last item
		}

		// extraction of subjects list
		var subjectsArray = null;

		if ( (subjectsList == null) || (subjectsList == "") ) { // if subjects list is undefined or empty
			subjectsArray = new Array();
		}
		else {
			subjectsArray = SubjectManager.unescapeArray(subjectsList.split(new RegExp(document.getElementById("subjectsListSeparator").value, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects
		}

		// filling of subjects list
		for ( var idx = 0 ; idx < subjectsArray.length ; idx++ ) { // for each subject
			subjectsListBox.appendItem(subjectsArray[idx]); // adds it to subjects listbox
		}

		sendMessageToConsole("options.initializeSubjectsList2 ", subjectsListBox.length + " subjects have been loaded", "warning");
	} else {
	sendMessageToConsole("options.initializeSubjectsList2 ", " no subjects have been loaded", "warning");
	}
}

function parseSubjectPt23(subject0, advancedMode)
{
	var subject = subject0;

	if ( advancedMode ) {
		// parsing of global counter
		if ( subject.indexOf("%g") != -1 ) { // if subject contains global counter metadata
			var globalCounter = document.getElementById("globalCounterValueTextBox").value;

			subject = SubjectManager.replacePattern(subject, "%", "g", SubjectManager.formatNumber(globalCounter, document.getElementById("globalCounterFormatTextBox").value));
		}

		// parsing of individual counter
		if ( subject.indexOf("%i") != -1 ) { // if subject contains individual counter metadata
			subject = SubjectManager.replacePattern(subject, "%", "i", SubjectManager.formatNumber(123, document.getElementById("individualCounterFormatTextBox").value));
		}

		// parsing of '%%'
		subject = SubjectManager.replacePattern(subject, "%", "%", "%");
	}

	return subject;
}

function updateParsingSimulation(selectedSubject)
{
	var simulateSubjectParsingLabel = document.getElementById("simulateSubjectParsingLabel");
	var subjectsAdvancedModeCheckBox = document.getElementById("subjectsAdvancedModeCheckBox");

	if ( (simulateSubjectParsingLabel != null) && (subjectsAdvancedModeCheckBox != null) ) { // (JSCTSABT)
		if ( subjectsAdvancedModeCheckBox.checked ) {
			selectedSubject = SubjectManager.parseSubjectPt10(selectedSubject, subjectsAdvancedModeCheckBox.checked);
			selectedSubject = parseSubjectPt23(selectedSubject, subjectsAdvancedModeCheckBox.checked);
			selectedSubject = SubjectManager.parseSubjectPt40(selectedSubject, subjectsAdvancedModeCheckBox.checked);

			simulateSubjectParsingLabel.value = selectedSubject; // parses subject
			simulateSubjectParsingLabel.setAttribute('tooltiptext', selectedSubject);
		}
	}
}

function onChangeSubjectEditTextBox()
{
	var subjectEditTextBox = document.getElementById("subjectEditTextBox");

	if ( subjectEditTextBox != null ) { // (JSCTSABT)
		updateParsingSimulation(subjectEditTextBox.value);
	}
}

function onSelectSubject()
{
	var subjectsListBox = document.getElementById("subjectsListBox");
	var subjectEditTextBox = document.getElementById("subjectEditTextBox");

	if ( (subjectsListBox != null) && (subjectEditTextBox != null) ) { // (JSCTSABT)
		if ( subjectsListBox.selectedIndex != -1 ) { // if a subject is selected in subjects list
			var selectedSubject = subjectsListBox.selectedItem.label;
			subjectEditTextBox.value = selectedSubject; // copies select subject of the list into input textbox

			updateParsingSimulation(selectedSubject);
		}
	}
}

function onClickSubjectAddButton()
{
	var subjectEditTextBox = document.getElementById("subjectEditTextBox");

	if ( subjectEditTextBox != null ) { // (JSCTSABT)
		addSubject(subjectEditTextBox.value, true);

		document.getElementById("subjectEditTextBox").focus(); // brings back focus to input textbox
	}
}

function addSubject(newSubject, addImport)
{
	var subjectsListBox = document.getElementById("subjectsListBox");
	var subjectEditTextBox = document.getElementById("subjectEditTextBox");
	var subjectsListCaseSensitiveCheckBox = document.getElementById("subjectsListCaseSensitiveCheckBox");

	if ( (subjectsListBox != null) && (subjectEditTextBox != null) && (subjectsListCaseSensitiveCheckBox != null) ) { // (JSCTSABT)
		if ( newSubject != "" ) { // if new subject is not empty
			var tmpNewSubject = ( subjectsListCaseSensitiveCheckBox.checked ) ? newSubject : newSubject.toLowerCase();
			var found = false;

			// search of new subject into current subjects list
			var tmpSubject = "";

			for ( var idx = 0 ; (idx < subjectsListBox.getRowCount()) && !found ; idx++ ) { // for each subject of subjects listbox
				tmpSubject = ( subjectsListCaseSensitiveCheckBox.checked ) ? subjectsListBox.getItemAtIndex(idx).getAttribute('label') : subjectsListBox.getItemAtIndex(idx).getAttribute('label').toLowerCase();
				if ( tmpSubject == tmpNewSubject ) { // if new subject is the same as an existing subject
					found = true;
				}
			}

			// update of listbox
			if ( !found ) { // if new subject has not been found in subjects listbox
				subjectsListBox.appendItem(newSubject); // adds new subject to subjects listbox
				subjectsListBox.ensureIndexIsVisible(subjectsListBox.getRowCount() - 1); // ensures added item is visible

				if ( addImport ) {
					document.getElementById("subjectEditTextBox").value = ""; // clears input textbox
				}

				subjectsListBoxChanged = true;
				subjectsListSorted = 0;
				subjectsListBox.selectedIndex = -1; // unselects subject in list

				// update of related lists
				resetDefaultSubjectMenuList();
				resetFilterSubjectMenuList(true);

				sendMessageToConsole("options.add", "Subject '" + newSubject + "' has been added to subjects list");
			}
			else {
				SubjectManager.localConsole.logWarning("options.add", "Subject '" + newSubject + "' already exists in subjects list");
			}
		}
	}

	return !found;
}

function onClickSubjectModifyButton()
{
	var subjectsListBox = document.getElementById("subjectsListBox");
	var subjectEditTextBox = document.getElementById("subjectEditTextBox");
	var subjectsListCaseSensitiveCheckBox = document.getElementById("subjectsListCaseSensitiveCheckBox");

	if ( (subjectsListBox != null) && (subjectEditTextBox != null) && (subjectsListCaseSensitiveCheckBox != null) ) { // (JSCTSABT)
		if ( subjectsListBox.selectedIndex != -1 ) { // if a subject is selected in list
			var newSubject = subjectEditTextBox.value;
			var tmpNewSubject = ( subjectsListCaseSensitiveCheckBox.checked ) ? newSubject : newSubject.toLowerCase();

			if ( newSubject != "" ) { // if modified subject is not empty
				var found = false;

				// search of modified subject into current subjects list
				for ( var idx = 0 ; (idx < subjectsListBox.getRowCount()) && !found ; idx++ ) { // for each subject of subjects listbox
					var tmpSubject = "";

					if ( idx != subjectsListBox.selectedIndex ) { // if subject item is not the one selected
						tmpSubject = ( subjectsListCaseSensitiveCheckBox.checked ) ? subjectsListBox.getItemAtIndex(idx).getAttribute('label') : subjectsListBox.getItemAtIndex(idx).getAttribute('label').toLowerCase();
						if ( tmpSubject == tmpNewSubject ) { // if modified subject is the same as an existing subject
							found = true;
						}
					}
				}

				// update of listbox
				if ( !found ) { // if modified subject has not been found in subjects listbox
					subjectsListBox.selectedItem.label = newSubject; // modifies selected subject
					subjectsListBox.ensureIndexIsVisible(subjectsListBox.selectedIndex); // ensures modified item is visible

					document.getElementById("subjectEditTextBox").value = ""; // clears input textbox

					subjectsListBoxChanged = true;
					subjectsListSorted = 0;
					subjectsListBox.selectedIndex = -1; // unselects subject in list

					// update of related lists
					resetDefaultSubjectMenuList();
					resetFilterSubjectMenuList(true);

					sendMessageToConsole("options.onClickSubjectModifyButton", "Subject '" + newSubject + "' has been modified");
				}
				else {
					SubjectManager.localConsole.logWarning("options.onClickSubjectModifyButton", "Subject '" + newSubject + "' already exists in subjects list");
				}
			}

			document.getElementById("subjectEditTextBox").focus(); // brings back focus to input textbox
		}
	}
}

function onClickSubjectUpButton()
{
	var subjectsListBox = document.getElementById("subjectsListBox");

	if ( subjectsListBox != null ) { // (JSCTSABT)
		var selectedIdx = subjectsListBox.selectedIndex;

		if ( (selectedIdx != -1) && (selectedIdx > 0) ) { // if an item is selected and is not the first one
			var oldSubject = subjectsListBox.selectedItem.label; // backups label

			subjectsListBox.removeItemAt(selectedIdx); // removes item
			subjectsListBox.insertItemAt(selectedIdx - 1, oldSubject); // inserts backuped label

			subjectsListBox.ensureIndexIsVisible(selectedIdx - 1); // ensures item is visible (nb: this seems necessary not to get unexpected behaviour)
			subjectsListBox.selectedIndex = selectedIdx - 1; // selects moved item again

			subjectsListBoxChanged = true;
			subjectsListSorted = 0;

			// update of related lists
			resetDefaultSubjectMenuList();
			resetFilterSubjectMenuList(true);
		}
	}
}

function onClickSubjectDownButton()
{
	var subjectsListBox = document.getElementById("subjectsListBox");

	if ( subjectsListBox != null ) { // (JSCTSABT)
		var selectedIdx = subjectsListBox.selectedIndex;

		if ( (selectedIdx != -1) && (selectedIdx < subjectsListBox.getRowCount() - 1) ) { // if an item is selected and is not the last one
			var oldSubject = subjectsListBox.selectedItem.label; // backups label

			subjectsListBox.removeItemAt(selectedIdx); // removes item
			if ( selectedIdx + 1 == subjectsListBox.getRowCount() ) { // if removed item was the penultimate one
				subjectsListBox.appendItem(oldSubject); // adds backuped label
			}
			else {
				subjectsListBox.insertItemAt(selectedIdx + 1, oldSubject); // inserts backuped label
			}

			subjectsListBox.ensureIndexIsVisible(selectedIdx + 1); // ensures item is visible (nb: this seems necessary not to get unexpected behaviour)
			subjectsListBox.selectedIndex = selectedIdx + 1; // selects moved item again

			subjectsListBoxChanged = true;
			subjectsListSorted = 0;

			// update of related lists
			resetDefaultSubjectMenuList();
			resetFilterSubjectMenuList(true);
		}
	}
}

function isLowerCase(chr)
{
	var res = 0;
	var asciiChr = chr.charCodeAt(0);

	if ( (asciiChr >= 97) && (asciiChr <= 122) ) {
		res = 1;
	}

	return res;
}

function isUpperCase(chr)
{
	var res = 0;
	var asciiChr = chr.charCodeAt(0);

	if ( (asciiChr >= 65) && (asciiChr <= 90) ) {
		res = 1;
	}

	return res;
}

function isCharacter(chr)
{
	var res = 0;

	if ( isLowerCase(chr) || isUpperCase(chr) ) {
		res = 1;
	}

	return res;
}

function isNumber(chr)
{
	var res = 0;
	var asciiChr = chr.charCodeAt(0);

	if ( (asciiChr >= 48) && (asciiChr <= 57) ) {
		res = 1;
	}

	return res;
}

function isAlphaNumeric(chr)
{
	var res = 0;

	if ( isNumber(chr) || isCharacter(chr) ) {
		res = 1;
	}

	return res;
}

function buildChunks(str)
{
	var strChunks = new Array();

	var chr;
	var previousValueChr = 0;
	var valueChr;
	var chunk = "";

	chr = str.charAt(0);
	previousValueChr = (isAlphaNumeric(chr)) ? (1 * isNumber(chr) + 2 * isCharacter(chr)) : 4; // computes value which stands for character type of first string character

	for ( var i = 0 ; i < str.length ; i++ ) { // for each character of string
		chr = str.charAt(i); // gets charachter

		valueChr = (isAlphaNumeric(chr)) ? (1 * isNumber(chr) + 2 * isCharacter(chr)) : 4; // computes value which stands for character type

		if ( valueChr != previousValueChr ) { // if current character type is different than previous character type
			strChunks.push(chunk); // adds chunk to chunks array
			chunk = chr; // starts next chunk

			previousValueChr = valueChr; // backups character type value
		}
		else { // if current character type and previous character type are identical
			chunk += chr; // appends current chunk
		}
	}

	strChunks.push(chunk); // adds last chunk to chunks array

	return strChunks;
}

function compareNonNumericalStrings(str1, str2)
{
	var res = 0;

	var lstr1 = str1.length;
	var lstr2 = str2.length;

	for ( var i = 0 ; (i < lstr1) && (i < lstr2) && (res == 0) ; i++ ) {
		var chr1 = str1.charAt(i);
		var chr2 = str2.charAt(i);

		res = ( chr1 < chr2 ) ? -1 : (( chr1 > chr2 ) ? 1 : 0 );
	}

	if ( res == 0 ) { // if strings are equal
		res = ( lstr1 < lstr2 ) ? -1 : (( lstr1 > lstr2 ) ? 1 : 0 );
	}

	return res;
}

function compareNumericalStrings(str1, str2)
{
	var res = 0;

	var intValue1 = parseInt(str1);
	var intValue2 = parseInt(str2);

	res = ( intValue1 < intValue2 ) ? -1 : (( intValue1 > intValue2 ) ? 1 : 0 );

	return res;
}

/**
 * Compares strings naturally
 * Sorting rules and priority are: <number> / <uppercase> OR <lowercase> / <other character>
 *
 * @return (integer) -1/+1 if first string is "lower"/"greater" than second one; 0 if strings are equal
 */
function compareStringsNaturally(str1, str2)
{
	var res = 0;

	var chunksArray1 = ( document.getElementById("subjectsListCaseSensitiveCheckBox").checked ) ? buildChunks(str1) : buildChunks(str1.toLowerCase());
	var chunksArray2 = ( document.getElementById("subjectsListCaseSensitiveCheckBox").checked ) ? buildChunks(str2) : buildChunks(str2.toLowerCase());

	// filling of chunks array with empty strings if both chunks have not the exact same size
	for ( var i = 0 ; i < chunksArray1.length - chunksArray2.length ; i++ ) {
		chunksArray2.push("");
	}
	for ( var i = 0 ; i < chunksArray2.length - chunksArray1.length ; i++ ) {
		chunksArray1.push("");
	}

	// comparison of chunks one by one
	for ( var i = 0 ; (i < chunksArray1.length) && (i < chunksArray2.length) && (res == 0) ; i++ ) {
		var chr1 = chunksArray1[i].charAt(0);
		var chr2 = chunksArray2[i].charAt(0);

		var valueChr1 = (isAlphaNumeric(chr1)) ? (1 * isNumber(chr1) + 2 * isCharacter(chr1)) : 4;
		var valueChr2 = (isAlphaNumeric(chr2)) ? (1 * isNumber(chr2) + 2 * isCharacter(chr2)) : 4;

		if ( valueChr1 != valueChr2 ) {
			res = ( chr1 < chr2 ) ? -1 : (( chr1 > chr2 ) ? 1 : 0 );
		}
		else {
			switch ( valueChr1 ) {
				case 1:
					res = compareNumericalStrings(chunksArray1[i], chunksArray2[i]);
					break;
				default:
					res = compareNonNumericalStrings(chunksArray1[i], chunksArray2[i]);
			}
		}
	}

	return res;
}

function onClickSortSubjectsButton()
{
	var subjectsListBox = document.getElementById("subjectsListBox");
	var subjectsArray = new Array();

	if ( subjectsListBox != null ) { // (JSCTSABT)
		// creation of subjects array
		for ( var i = 0 ; i < subjectsListBox.getRowCount() ; i++ ) { // for each subject of subjects listbox
			subjectsArray.push(subjectsListBox.getItemAtIndex(i).getAttribute('label')); // adds subject into array (nb: use attribute rather than property because property might not be initialized correctly if not visible)
		}

		// sort of subjects
		subjectsArray.sort(compareStringsNaturally); // sorts array
		if ( subjectsListSorted == 1 ) {
			subjectsArray.reverse();
			subjectsListSorted = 2;
		}
		else {
			subjectsListSorted = 1;
		}

		// clearance of current subjects list
		for ( var i = subjectsListBox.getRowCount() - 1 ; i >= 0 ; i-- ) { // for each subject of the listbox (reverse order)
			subjectsListBox.removeItemAt(i); // remove last item
		}

		// updates subjects listbox
		for ( var i = 0 ; i < subjectsArray.length ; i++ ) { // for each subject of array
			subjectsListBox.appendItem(subjectsArray[i]); // adds subject into subjects listbox
		}

		subjectsListBoxChanged = true;

		// update of related lists
		resetDefaultSubjectMenuList();
		resetFilterSubjectMenuList(true);
	}
}

function onClickSubjectRemoveButton()
{
	var subjectsListBox = document.getElementById("subjectsListBox");

	if ( subjectsListBox != null ) { // (JSCTSABT)
		var selectedIdx = subjectsListBox.selectedIndex;

		if ( selectedIdx != -1 ) { // if an item is selected
			var oldSubject = subjectsListBox.selectedItem.label;

			// removal of item
			subjectsListBox.removeItemAt(selectedIdx);
			document.getElementById("subjectEditTextBox").value = "";

			// selection of one of other left items
			if ( selectedIdx == subjectsListBox.getRowCount() ) { // if removed item was the last one
				selectedIdx--; // chooses the current last item (was formerly the penultimate one)
			}

			if ( subjectsListBox.getRowCount() > 0 ) { // if there is one item left
				subjectsListBox.selectedIndex = selectedIdx; // selects it
			}
			else {
				document.getElementById("simulateSubjectParsingLabel").value = "";
				document.getElementById("simulateSubjectParsingLabel").setAttribute('tooltiptext', "");				
			}

			sendMessageToConsole("options.remove", "Subject '" + oldSubject + "' has been removed from subjects list");

			subjectsListBoxChanged = true;
			subjectsListSorted = 0;

			// update of related lists
			resetDefaultSubjectMenuList();
			resetFilterSubjectMenuList(true);
		}
	}
}

function onClickSubjectsAdvancedModeCheckBox(state)
{
	var tooltiptxt = ( state ) ? stringBundle.getString('subjectTextBoxToolTip') : "";
	document.getElementById("subjectEditTextBox").setAttribute('tooltiptext', tooltiptxt);

	if ( state ) {
		var subjectEditTextBox = document.getElementById("subjectEditTextBox");

		if ( subjectEditTextBox != null ) { // (JSCTSABT)
			updateParsingSimulation(subjectEditTextBox.value);
		}
	}
	else {
		document.getElementById("simulateSubjectParsingLabel").value = "";
		document.getElementById("simulateSubjectParsingLabel").setAttribute('tooltiptext', "");
	}
}

function onClickSubjectsAdvancedModeHelpButton()
{
	SubjectManager.displayMessageDialog(stringBundle.getString('advancedModeHelp'));

	document.getElementById("subjectsAdvancedModeCheckBox").focus();
}

function onClickSubjectPickedRadioGroup()
{
	var state = ( document.getElementById("subjectPickedRadioGroup").selectedIndex == 1 ) ? false : true;
	document.getElementById("appendBeginningEndCheckBox").disabled = state;

	state = ( document.getElementById("subjectPickedRadioGroup").selectedIndex == 2 ) ? false : true;
	document.getElementById("appendEndBeginningCheckBox").disabled = state;
}

// 'default subjects' functions
/**
 *function initializeDefaultSubjects()
 *{
 *	// building of existing accounts list
 *	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");
 *
 *	if ( defaultSubjectsListBox != null ) { // (JSCTSABT)
 *		// clearance of default subjects list
 *		for ( var idx = defaultSubjectsListBox.getRowCount() - 1 ; idx >= 0 ; idx-- ) { // for each default subject of the listbox (reverse order)
 *			defaultSubjectsListBox.removeItemAt(idx); // removes last item
 *		}
 *
 *		// building of default subjects array
 *		var defaultSubjectsObj = null;
 *
 *		if ( (bakDefaultSubjects == null) || (bakDefaultSubjects == "") ) { // if default subjects string is empty
 *			defaultSubjectsObj = {};
 *		}
 *		else {
 *			defaultSubjectsObj = JSON.parse(bakDefaultSubjects);
 *		}
 *
 *		var defaultSubjectsCount = 0;
 *
 *		for ( var propty in defaultSubjectsObj ) {
 *			defaultSubjectsCount++;
 *		}
 *
 *		// filling of string list
 *		var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
 *								.getService(Components.interfaces.nsIMsgAccountManager);
 *
 *		var handleSubjectsIdentitiesCheckBox = document.getElementById("handleSubjectsIdentitiesCheckBox");
 *		var handleSubjectsIdentities = false;
 *		if ( handleSubjectsIdentitiesCheckBox != null ) {
 *			handleSubjectsIdentities = handleSubjectsIdentitiesCheckBox.checked;
 *		}
 *
 *		var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // gets accounts list
 *		var account = null;
 *		var accountIdentities = null;
 *		var accountIdentity = null;
 *
 *		var newRow = null;
 *		var newCellRow = null;
 *		var newCell = null;
 *		var newCheckBox = null;
 *
 *		var defSubject = "";
 *		var ifEmpty = false;
 *		var enabled = false;
 *
 *		for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
 *			account = accounts.queryAt(idx); // gets account
 *
 *			if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
 *				accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities
 *
 *				for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) { // for each identity of current account
 *					accountIdentity = accountIdentities.queryAt(jdx); // gets identity object
 *
 *					if ( (accountIdentity.key == account.defaultIdentity.key) || handleSubjectsIdentities ) { // if current identity is default identity or if all identities have to be handled
 *						newRow = document.createElement('listitem');
 *						newRow.setAttribute('id', "defaultSubjectRow-" + accountIdentity.key); // sets id
 *						newRow.setAttribute('allowevents', true); // allows to transfer events to embedded objects
 *						if ( accountIdentity.key != account.defaultIdentity.key ) { // if current identity is a secondary identity (= not default identity of current account)
 *							newRow.style.setProperty("font-style", "italic", null);
 *						}
 *
 *						defSubject = ( defaultSubjectsObj[accountIdentity.key] != null ) ? unescape(defaultSubjectsObj[accountIdentity.key].defaultSubject) : "";
 *						ifEmpty = ( defaultSubjectsObj[accountIdentity.key] != null ) ? defaultSubjectsObj[accountIdentity.key].onlyIfEmpty : true;
 *						enabled = ( defaultSubjectsObj[accountIdentity.key] != null ) ? defaultSubjectsObj[accountIdentity.key].onOff : false;
 *
 *						// account id
 *						newCell = document.createElement('listcell');
 *						newCell.setAttribute('label', accountIdentity.key);
 *						newCell.setAttribute('disabled', !enabled);
 *						newRow.appendChild(newCell); // adds account id
 *
 *						// account name
 *						newCell = document.createElement('listcell');
 *						newCell.setAttribute('label', accountIdentity.identityName);
 *						newCell.setAttribute('tooltiptext', accountIdentity.identityName);
 *						newCell.setAttribute('disabled', !enabled);
 *						newRow.appendChild(newCell); // adds account label
 *
 *						// subject
 *						newCell = document.createElement('listcell');
 *						newCell.setAttribute('label', defSubject);
 *						newCell.setAttribute('tooltiptext', defSubject);
 *						newCell.setAttribute('disabled', !enabled);
 *						newRow.appendChild(newCell); // adds default subject
 *
 *						// 'only if empty' checkbox
 *						// to avoid propagation of events from parent (row) to embedded objects (checkbox), the trick is to insert another listitem into main listitem
 *						newCellRow = document.createElement('listitem');
 *						newCellRow.setAttribute('allowevents', false); // does not to allow to transfer events to embedded objects
 *
 *						newCheckBox = document.createElement('checkbox');
 *						newCheckBox.setAttribute('checked', ifEmpty);
 *						newCheckBox.setAttribute('disabled', !enabled);
 *
 *						newCellRow.appendChild(newCheckBox);
 *						newRow.appendChild(newCellRow); // adds 'if empty' value
 *
 *						// 'enabled' checkbox
 *						newCell = document.createElement('listcell');
 *						newCheckBox = document.createElement('checkbox');
 *						newCheckBox.setAttribute('id', "enabledDefaultSubjectCheckBox-" + accountIdentity.key); // sets id
 *						newCheckBox.setAttribute('checked', enabled);
 *						newCheckBox.addEventListener("command", function() { onSelectEnabledDefaultSubjectCheckBox(this.id); }, false); // sets related action
 *
 *						newCell.appendChild(newCheckBox);
 *						newRow.appendChild(newCell); // adds 'enabled' value
 *
 *						defaultSubjectsListBox.appendChild(newRow); // adds account's default subject to listbox
 *					}
 *				}
 *			}
 *		}
 *
 *		sendMessageToConsole("options.initializeDefaultSubjects", defaultSubjectsCount + " default subjects have been loaded");
 *	}
 *
 *	sendMessageToConsole("options.initializeDefaultSubjects", "Default subjects have been initialized");
 *}

 */
 
 function initializeDefaultSubjects2()
{
	// building of existing accounts list
	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");

	if ( defaultSubjectsListBox != null ) { // (JSCTSABT)
		// clearance of default subjects list
		for ( var idx = defaultSubjectsListBox.count() - 1 ; idx >= 0 ; idx-- ) { // for each default subject of the listbox (reverse order)
			defaultSubjectsListBox.removeItemAt(idx); // removes last item
		}

		// building of default subjects array
		var defaultSubjectsObj = null;

		if ( (bakDefaultSubjects == null) || (bakDefaultSubjects == "") ) { // if default subjects string is empty
			defaultSubjectsObj = {};
		}
		else {
			defaultSubjectsObj = JSON.parse(bakDefaultSubjects);
		}

		var defaultSubjectsCount = 0;

		for ( var propty in defaultSubjectsObj ) {
			defaultSubjectsCount++;
		}

		// filling of string list
		var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
								.getService(Components.interfaces.nsIMsgAccountManager);

		var handleSubjectsIdentitiesCheckBox = document.getElementById("handleSubjectsIdentitiesCheckBox");
		var handleSubjectsIdentities = false;
		if ( handleSubjectsIdentitiesCheckBox != null ) {
			handleSubjectsIdentities = handleSubjectsIdentitiesCheckBox.checked;
		}

		var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // gets accounts list
		var account = null;
		var accountIdentities = null;
		var accountIdentity = null;

		var newRow = null;
		var newCellRow = null;
		var newCell = null;
		var newCheckBox = null;

		var defSubject = "";
		var ifEmpty = false;
		var enabled = false;

		for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
			account = accounts.queryAt(idx); // gets account

			if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
				accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

				for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) { // for each identity of current account
					accountIdentity = accountIdentities.queryAt(jdx); // gets identity object

					if ( (accountIdentity.key == account.defaultIdentity.key) || handleSubjectsIdentities ) { // if current identity is default identity or if all identities have to be handled
						newRow = document.createElement('listitem');
						newRow.setAttribute('id', "defaultSubjectRow-" + accountIdentity.key); // sets id
						newRow.setAttribute('allowevents', true); // allows to transfer events to embedded objects
						if ( accountIdentity.key != account.defaultIdentity.key ) { // if current identity is a secondary identity (= not default identity of current account)
							newRow.style.setProperty("font-style", "italic", null);
						}

						defSubject = ( defaultSubjectsObj[accountIdentity.key] != null ) ? unescape(defaultSubjectsObj[accountIdentity.key].defaultSubject) : "";
						ifEmpty = ( defaultSubjectsObj[accountIdentity.key] != null ) ? defaultSubjectsObj[accountIdentity.key].onlyIfEmpty : true;
						enabled = ( defaultSubjectsObj[accountIdentity.key] != null ) ? defaultSubjectsObj[accountIdentity.key].onOff : false;

						// account id
						newCell = document.createElement('listcell');
						newCell.setAttribute('label', accountIdentity.key);
						newCell.setAttribute('disabled', !enabled);
						newRow.appendChild(newCell); // adds account id

						// account name
						newCell = document.createElement('listcell');
						newCell.setAttribute('label', accountIdentity.identityName);
						newCell.setAttribute('tooltiptext', accountIdentity.identityName);
						newCell.setAttribute('disabled', !enabled);
						newRow.appendChild(newCell); // adds account label

						// subject
						newCell = document.createElement('listcell');
						newCell.setAttribute('label', defSubject);
						newCell.setAttribute('tooltiptext', defSubject);
						newCell.setAttribute('disabled', !enabled);
						newRow.appendChild(newCell); // adds default subject

						// 'only if empty' checkbox
						// to avoid propagation of events from parent (row) to embedded objects (checkbox), the trick is to insert another listitem into main listitem
						newCellRow = document.createElement('listitem');
						newCellRow.setAttribute('allowevents', false); // does not to allow to transfer events to embedded objects

						newCheckBox = document.createElement('checkbox');
						newCheckBox.setAttribute('checked', ifEmpty);
						newCheckBox.setAttribute('disabled', !enabled);

						newCellRow.appendChild(newCheckBox);
						newRow.appendChild(newCellRow); // adds 'if empty' value

						// 'enabled' checkbox
						newCell = document.createElement('listcell');
						newCheckBox = document.createElement('checkbox');
						newCheckBox.setAttribute('id', "enabledDefaultSubjectCheckBox-" + accountIdentity.key); // sets id
						newCheckBox.setAttribute('checked', enabled);
						newCheckBox.addEventListener("command", function() { onSelectEnabledDefaultSubjectCheckBox(this.id); }, false); // sets related action

						newCell.appendChild(newCheckBox);
						newRow.appendChild(newCell); // adds 'enabled' value

						defaultSubjectsListBox.appendChild(newRow); // adds account's default subject to listbox
					}
				}
			}
		}

		sendMessageToConsole("options.initializeDefaultSubjects2", defaultSubjectsCount + " default subjects have been loaded");
	}

	sendMessageToConsole("options.initializeDefaultSubjects2", "Default subjects have been initialized");
}

 
function saveDefaultSubjects()
{
	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");

	if ( (defaultSubjectsListBox != null) && defaultSubjectsChanged ) {
		var defaultSubjectsString = "";
		var defaultSubjectsObj = {};

		for ( var idx = 0 ; idx < defaultSubjectsListBox.getRowCount() ; idx++ ) { // for each individual default subject of listbox
			defaultSubjectsObj[defaultSubjectsListBox.getItemAtIndex(idx).children[0].getAttribute('label')] =
				new SubjectManager.DefaultSubject(
					escape(defaultSubjectsListBox.getItemAtIndex(idx).children[2].getAttribute('label')), // encodes subject
					defaultSubjectsListBox.getItemAtIndex(idx).children[3].children[0].checked,
					defaultSubjectsListBox.getItemAtIndex(idx).children[4].children[0].checked
				); // adds default subject to the default subjects array
		}
		defaultSubjectsString = JSON.stringify(defaultSubjectsObj);

		document.getElementById("defaultSubjects").value = defaultSubjectsString; // saves default subjects setting

		sendMessageToConsole("options.saveSettings", "Default subjects list has been modified: " + defaultSubjectsString);
	}
}

function onClickHandleSubjectsIdentitiesCheckBox(state)
{
	var tmpBakDefaultSubjects = bakDefaultSubjects; // backups backuped default subjects settings to their value before opening settings dialog

	saveDefaultSubjects(); // saves default subjects list before reloading it from saved settings
	bakDefaultSubjects = document.getElementById("defaultSubjects").value; // propagates saving for default subjects list reloading

	initializeDefaultSubjects2(); // reloads default subjects
	bakDefaultSubjects = tmpBakDefaultSubjects; // restores backuped default subjects settings to their value before opening settings dialog
}

function onSelectEnabledDefaultSubjectCheckBox(selId)
{
	var enabledCheckBox = document.getElementById(selId);

	var rowId = "defaultSubjectRow-" + selId.substring(selId.indexOf("-") + 1);
	var defaultSubjectRow = document.getElementById(rowId);

	if ( (defaultSubjectRow != null) && (enabledCheckBox != null) ) { // (JSCTSABT)
		defaultSubjectRow.children[0].setAttribute('disabled', !enabledCheckBox.checked);
		defaultSubjectRow.children[1].setAttribute('disabled', !enabledCheckBox.checked);
		defaultSubjectRow.children[2].setAttribute('disabled', !enabledCheckBox.checked);
		defaultSubjectRow.children[3].children[0].setAttribute('disabled', !enabledCheckBox.checked);

		defaultSubjectsChanged = true;
	}
}

function onSelectDefaultSubject()
{
	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");

	if ( defaultSubjectsListBox != null ) { // (JSCTSABT)
		var selRow = defaultSubjectsListBox.selectedItem;

		if ( selRow != null ) { // if an item is selected
			if ( selRow.children[1] != null ) { // if first child object is not null (usefull because the event might be sent by the 'if empty' checkbox inside the listitem inside the listitem)
				reinitializeDefaultSubjectObjects(true);

				document.getElementById("subjectAccountTextBox").value = selRow.children[1].getAttribute('label'); // copies selected default subject account of the list into textbox
				document.getElementById("insertOnlyIfEmptyCheckBox").checked = selRow.children[3].children[0].checked; // copies selected 'if empty' checkbox value of the list into input checkbox

				resetDefaultSubjectMenuList(); // loads current subjects list into menulist
			}
		}
	}
}

function onClickUpdateDefaultSubjectButton()
{
	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");
	var subjectAccountTextBox = document.getElementById("subjectAccountTextBox");
	var defaultSubjectMenuList = document.getElementById("defaultSubjectMenuList");
	var insertOnlyIfEmptyCheckBox = document.getElementById("insertOnlyIfEmptyCheckBox");

	if ( (defaultSubjectsListBox != null) && (subjectAccountTextBox != null) && (defaultSubjectMenuList != null) && (insertOnlyIfEmptyCheckBox != null) ) { // (JSCTSABT)
		var selectedDefaultSubjectItem = defaultSubjectsListBox.selectedItem;

		if ( selectedDefaultSubjectItem != null ) { // if a default subject is selected
			// update of listbox
			selectedDefaultSubjectItem.children[2].setAttribute('label', defaultSubjectMenuList.label); // saves default subject
			selectedDefaultSubjectItem.children[3].children[0].setAttribute('checked', insertOnlyIfEmptyCheckBox.checked); // saves 'if empty' value

			// clearance of fields
			reinitializeDefaultSubjectObjects(false);

			defaultSubjectsChanged = true;
		}
	}
}

function reinitializeDefaultSubjectObjects(state)
{
	document.getElementById("subjectAccountLabel").disabled = !state;
	document.getElementById("subjectAccountTextBox").disabled = !state;
	document.getElementById("insertOnlyIfEmptyCheckBox").disabled = !state;
	document.getElementById("defaultSubjectLabel").disabled = !state;
	document.getElementById("defaultSubjectMenuList").disabled = !state;
	document.getElementById("updateDefaultSubjectButton").disabled = !state;

	if ( !state ) {
		document.getElementById("subjectAccountTextBox").value = "";
		document.getElementById("insertOnlyIfEmptyCheckBox").checked = false; // clears input checkbox
		clearDefaultSubjectMenuList();
		document.getElementById("defaultSubjectMenuList").selectedIndex = -1;

		document.getElementById("defaultSubjectsListBox").selectedIndex = -1;
	}
}

function resetDefaultSubjectMenuList()
{
	clearDefaultSubjectMenuList();
	fillDefaultSubjectMenuList();
}

function clearDefaultSubjectMenuList()
{
	var defaultSubjectMenuPopUp = document.getElementById("defaultSubjectMenuPopUp");

	if ( defaultSubjectMenuPopUp != null ) { // (JSCTSABT)
		// clearance of existing items
		while ( defaultSubjectMenuPopUp.firstChild ) {
			defaultSubjectMenuPopUp.removeChild(defaultSubjectMenuPopUp.firstChild);
		}
	}
}

function fillDefaultSubjectMenuList()
{
	var subjectsListBox = document.getElementById("subjectsListBox");
	var defaultSubjectsListBox = document.getElementById("defaultSubjectsListBox");
	var defaultSubjectMenuList = document.getElementById("defaultSubjectMenuList");
	var defaultSubjectMenuPopUp = document.getElementById("defaultSubjectMenuPopUp");

	if ( (subjectsListBox != null) && (defaultSubjectsListBox != null) && (defaultSubjectMenuList != null) && (defaultSubjectMenuPopUp != null) ) { // (JSCTSABT)
		var selRow = defaultSubjectsListBox.selectedItem;

		if ( selRow != null ) { // if an item is selected
			if ( selRow.children[1] != null ) { // if first child object is not null (usefull because the event might be sent by the 'if empty' checkbox inside the listitem inside the listitem)
				var selIdx = -1;
				var defaultSubjectMenuItem = null;

				// checking if saved default subject for current account is into the main subjects list
				for ( var idx = 0 ; (idx < subjectsListBox.getRowCount()) && (selIdx == -1) ; idx++ ) { // for each subject of subjects listbox
					if ( selRow.children[2].getAttribute('label') == subjectsListBox.getItemAtIndex(idx).getAttribute('label') ) {
						selIdx = idx;
					}
				}

				// add of saved default subject for current account into the menulist in case it is not one of the subject from the main subjects list
				if ( selIdx == -1 ) {
					defaultSubjectMenuItem = document.createElement("menuitem"); // creates a new menuitem
					defaultSubjectMenuItem.setAttribute('label', selRow.children[2].getAttribute('label')); // sets subject as menuitem label

					defaultSubjectMenuPopUp.appendChild(defaultSubjectMenuItem); // adds subject into menulist

					selIdx = 0; // selects
				}

				// filling of default subject menu list
				for ( var idx = 0 ; idx < subjectsListBox.getRowCount() ; idx++ ) { // for each subject of main subjects listbox
					defaultSubjectMenuItem = document.createElement("menuitem"); // creates a new menuitem
					defaultSubjectMenuItem.setAttribute('label', subjectsListBox.getItemAtIndex(idx).getAttribute('label')); // sets subject as menuitem label

					defaultSubjectMenuPopUp.appendChild(defaultSubjectMenuItem); // adds subject into menulist

					if ( selRow.children[2].getAttribute('label') == subjectsListBox.getItemAtIndex(idx).getAttribute('label') ) {
						selIdx = idx;
					}
				}

				defaultSubjectMenuList.selectedIndex = selIdx;
			}
		}
	}
}

// 'counters' functions
function initializeGlobalCounterSettings()
{
	var globalCounterSettingsObj = null;

	if ( (bakGlobalCounterSettings == null) || (bakGlobalCounterSettings == "") ) { // if global counter settings is empty
		globalCounterSettingsObj = {};
	}
	else {
		globalCounterSettingsObj = JSON.parse(bakGlobalCounterSettings);
	}

	var globalCounterSettings = globalCounterSettingsObj['global'];

	if ( globalCounterSettings != null ) {
		document.getElementById("globalCounterValueTextBox").value = globalCounterSettings.value;
		document.getElementById("updateGlobalCounterCheckBox1").checked = ( (globalCounterSettings.update & 1) == 1 );
		document.getElementById("updateGlobalCounterCheckBox2").checked = ( (globalCounterSettings.update & 2) == 2 );
		document.getElementById("updateGlobalCounterCheckBox3").checked = ( (globalCounterSettings.update & 4) == 4 );
		document.getElementById("globalCounterFormatTextBox").value = globalCounterSettings.format;
		document.getElementById("globalCounterResetMenuList").value = globalCounterSettings.reset;
	}
}

function cleanIndividualCountersSettings()
{
	var individualCountersObj = {};
	var individualCountersSettings = document.getElementById("individualCountersSettings").value;

	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);

	var accountsList = new Array();
	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list

	var account = null;
	var accountIdentities = null;
	var accountIdentity = null;

	var handleCounterIdentitiesCheckBox = document.getElementById("handleCounterIdentitiesCheckBox");
	var handleCounterIdentities = false;
	if ( handleCounterIdentitiesCheckBox != null ) {
		handleCounterIdentities = handleCounterIdentitiesCheckBox.checked;
	}

	// building of existing accounts list
	for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
		account = accounts.queryAt(idx); // gets account object

		if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
			accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

			if ( handleCounterIdentities ) { // if identities have to be handled
				for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) {
					accountIdentity = accountIdentities.queryAt(jdx); // gets identity object
					accountsList.push(accountIdentity.key);
				}
			}
			else {
				accountsList.push(account.defaultIdentity.key);
			}
		}
	}

	// removal of non-existing accounts from individual counters settings list
	if ( individualCountersSettings != "" ) { // if individual counters list is not empty
		var individualCountersSettingsTmp = {};

		if ( individualCountersSettings != "" ) { // if individual counters string is not empty
			try {
			sendMessageToConsole("options.cleanIndividualCountersSettings", "individualCountersSettings:  '" + individualCountersSettings + "'", "warning");
				individualCountersSettingsTmp = JSON.parse(individualCountersSettings); // parses individual counters settings as JSON string
			}
			catch ( err ) {
				sendMessageToConsole("options.cleanIndividualCountersSettings", err, "error");
			}

			for ( var accountKey in individualCountersSettingsTmp ) { // for each individual counter
				if ( accountsList.indexOf(accountKey) != -1 ) { // if account is an available account
					individualCountersObj[accountKey] = new SubjectManager.CounterSettings(individualCountersSettingsTmp[accountKey]); // adds related individual counter settings
					sendMessageToConsole("options.cleanIndividualCountersSettings", "Account '" + accountKey + "' settings updated", "warning");
				}
				else {
					sendMessageToConsole("options.cleanIndividualCountersSettings", "Account '" + accountKey + "' cannot be found: deletion of related individual counter settings", "warning");
				}
			}
		}
	}

	// add of new-existing accounts in individual counters list
	for ( var idx = 0 ; idx < accountsList.length ; idx++ ) { // for each account of accounts list
		if ( individualCountersObj[accountsList[idx]] == null ) { // if individual counter settings don't exist for current account
			individualCountersObj[accountsList[idx]] = new SubjectManager.CounterSettings(
				1,		// value
				1,		// update
				"0",	// format
				0		// reset
			); // creates a new individual counter settings object

			sendMessageToConsole("options.cleanIndividualCountersSettings", "Account '" + accountsList[idx] + "' is a new account: creation of related individual counter settings", "warning");
		}
	}

	var individualCountersSettingsTmp = JSON.stringify(individualCountersObj);
	if ( individualCountersSettingsTmp !== individualCountersSettings ) {
		sendMessageToConsole("options.cleanIndividualCountersSettings", "Individual counters settings has been updated: " + individualCountersSettingsTmp, "warning");

		document.getElementById("individualCountersSettings").value = individualCountersSettingsTmp; // updates individual counters settings
	}
}

function initializeIndividualCounters()
{
	// building of existing accounts list
	var individualCountersListBox = document.getElementById("individualCountersListBox");

	if ( individualCountersListBox != null ) { // (JSCTSABT)
		var individualCountersCount = 0;

		// clearance of individual counters list
		for ( var idx = individualCountersListBox.getRowCount() - 1 ; idx >= 0 ; idx-- ) { // for each individual counter of the listbox (reverse order)
			individualCountersListBox.removeItemAt(idx); // removes last item
		}

		// building of individual counters array
		var individualCountersObj = {};

		if ( bakIndividualCountersSettings != "" ) { // if individual counters string is not empty
			try {
				individualCountersObj = JSON.parse(bakIndividualCountersSettings); // parses individual counters settings as JSON string
			}
			catch ( err ) {
				sendMessageToConsole("options.initializeIndividualCounters", err, "error");
			}

			if ( individualCountersObj != null ) { // if individual counters settings string can be parsed
				individualCountersCount = Object.keys(individualCountersObj).length;
			}
		}

		// filling of individual counters list
		var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
								.getService(Components.interfaces.nsIMsgAccountManager);

		var handleCounterIdentitiesCheckBox = document.getElementById("handleCounterIdentitiesCheckBox");
		var handleCounterIdentities = false;
		if ( handleCounterIdentitiesCheckBox != null ) {
			handleCounterIdentities = handleCounterIdentitiesCheckBox.checked;
		}

		var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // gets accounts list
		var account = null;
		var accountIdentities = null;
		var accountIdentity = null;

		var newRow = null;
		var newCell = null;

		var counterValue = 0;
		var counterUpdate = 0;
		var counterFormat = "0";
		var counterReset = 0;

		for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
			account = accounts.queryAt(idx); // gets account

			if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
				accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

				for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) { // for each identity of current account
					counterValue = 0;
					counterUpdate = 0;
					counterFormat = "0";
					counterReset = 0;

					accountIdentity = accountIdentities.queryAt(jdx); // gets identity object

					if ( (accountIdentity.key == account.defaultIdentity.key) || handleCounterIdentities ) { // if current identity is default identity or if all identities have to be handled
						newRow = document.createElement('listitem');
						if ( accountIdentity.key != account.defaultIdentity.key ) { // if current identity is a secondary identity (= not default identity of current account)
							newRow.style.setProperty("font-style", "italic", null);
						}

						if ( individualCountersObj[accountIdentity.key] != null ) {
							counterValue = individualCountersObj[accountIdentity.key].value;
							counterUpdate = individualCountersObj[accountIdentity.key].update;
							counterFormat = individualCountersObj[accountIdentity.key].format;
							counterReset = individualCountersObj[accountIdentity.key].reset;
						}

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', accountIdentity.key);
						newRow.appendChild(newCell); // adds account id

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', accountIdentity.identityName);
						newRow.appendChild(newCell); // adds account label

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', counterValue);
						newRow.appendChild(newCell); // adds account counter value

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', counterUpdate);
						newRow.appendChild(newCell); // adds account counter value

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', counterFormat);
						newRow.appendChild(newCell); // adds account counter value

						newCell = document.createElement('listcell');
						newCell.setAttribute('label', counterReset);
						newRow.appendChild(newCell); // adds account counter value

						individualCountersListBox.appendChild(newRow); // adds new individual counter to counters listbox
					}
				}
			}
		}

		sendMessageToConsole("options.initializeIndividualCounters", bakIndividualCountersSettings);
		sendMessageToConsole("options.initializeIndividualCounters", individualCountersCount + " individual counters have been loaded");
	}

	sendMessageToConsole("options.initializeIndividualCounters", "Individual counters have been initialized");
}

function saveIndividualCounters()
{
	var individualCountersListBox = document.getElementById("individualCountersListBox");

	// update of individual counters list
	if ( (individualCountersListBox != null) && individualCountersChanged ) {
		var individualCountersArray = {};

		for ( var idx = 0 ; idx < individualCountersListBox.getRowCount() ; idx++ ) { // for each individual counter of listbox
			individualCountersArray[individualCountersListBox.getItemAtIndex(idx).children[0].getAttribute('label')] = new SubjectManager.CounterSettings(
				individualCountersListBox.getItemAtIndex(idx).children[2].getAttribute('label'),	// value
				individualCountersListBox.getItemAtIndex(idx).children[3].getAttribute('label'),	// update
				individualCountersListBox.getItemAtIndex(idx).children[4].getAttribute('label'),	// format
				individualCountersListBox.getItemAtIndex(idx).children[5].getAttribute('label')		// reset
			); // creates a new individual counter settings object
		}

		sendMessageToConsole("options.saveIndividualCounters", JSON.stringify(individualCountersArray));

		document.getElementById("individualCountersSettings").value = JSON.stringify(individualCountersArray); // saves individual counters values
	}
}

function onClickCounterFormatHelpButton(eltId)
{
	SubjectManager.displayMessageDialog(stringBundle.getString('counterFormatHelp'));

	var eltRef = eltId.match(new RegExp("^(.+)HelpButton$"));

	if ( eltRef != null ) {
		document.getElementById(eltRef[1] + "TextBox").focus();
	}
}

function onClickHandleCounterIdentitiesCheckBox()
{
	var tmpBakIndividualCountersSettings = bakIndividualCountersSettings; // backups backuped individual counters settings to their value before opening settings dialog

	saveIndividualCounters(); // saves individual counters list before reloading it from saved settings
	bakIndividualCountersSettings = document.getElementById("individualCountersSettings").value; // propagates saving for individual counters list reloading

	initializeIndividualCounters(); // reloads individual counters
	bakIndividualCountersSettings = tmpBakIndividualCountersSettings; // restores backuped individual counters settings to their values before opening settings dialog
}

function onSelectIndividualCounter()
{
	var individualCountersListBox = document.getElementById("individualCountersListBox");

	if ( individualCountersListBox != null ) { // (JSCTSABT)
		var selRow = individualCountersListBox.selectedItem;

		if ( selRow != null ) { // if an item is selected
			reinitializeIndividualCounterObjects(true);

			document.getElementById("individualCounterAccountTextBox").value = selRow.children[1].getAttribute('label');

			// copy of selected individual counter settings into textboxes
			document.getElementById("individualCounterValueTextBox").value = selRow.children[2].getAttribute('label');
			document.getElementById("updateIndividualCounterCheckBox1").checked = ( (selRow.children[3].getAttribute('label') & 1) == 1 );
			document.getElementById("updateIndividualCounterCheckBox2").checked = ( (selRow.children[3].getAttribute('label') & 2) == 2 );
			document.getElementById("individualCounterFormatTextBox").value = selRow.children[4].getAttribute('label');
			document.getElementById("individualCounterResetMenuList").selectedIndex = selRow.children[5].getAttribute('label');
		}
	}
}

function onClickUpdateIndividualCounterButton()
{
	var individualCountersListBox = document.getElementById("individualCountersListBox");

	if ( individualCountersListBox != null ) { // (JSCTSABT)
		var selectedIndividualCounterIndex = individualCountersListBox.selectedIndex;

		if ( selectedIndividualCounterIndex != -1 ) { // if an individual counter is selected
			// update of listbox
			var item = individualCountersListBox.getItemAtIndex(selectedIndividualCounterIndex);
			var tempUpdateCounter = 0;

			if ( document.getElementById("updateIndividualCounterCheckBox1").checked ) {
				tempUpdateCounter += 1;
			}
			if ( document.getElementById("updateIndividualCounterCheckBox2").checked ) {
				tempUpdateCounter += 2;
			}

			item.children[2].setAttribute('label', document.getElementById("individualCounterValueTextBox").value);
			item.children[3].setAttribute('label', tempUpdateCounter);
			item.children[4].setAttribute('label', document.getElementById("individualCounterFormatTextBox").value);
			item.children[5].setAttribute('label', document.getElementById("individualCounterResetMenuList").selectedIndex);

			reinitializeIndividualCounterObjects(false);

			individualCountersChanged = true;
		}
	}
}

function reinitializeIndividualCounterObjects(state)
{
	document.getElementById("individualCounterAccountLabel").disabled = !state;
	document.getElementById("individualCounterAccountTextBox").disabled = !state;
	document.getElementById("individualCounterValueLabel").disabled = !state;
	document.getElementById("individualCounterValueTextBox").disabled = !state;

	document.getElementById("updateIndividualCounterLabel").disabled = !state;
	document.getElementById("updateIndividualCounterCheckBox1").disabled = !state;
	document.getElementById("updateIndividualCounterCheckBox2").disabled = !state;

	document.getElementById("individualCounterFormatLabel").disabled = !state;
	document.getElementById("individualCounterFormatTextBox").disabled = !state;
	document.getElementById("individualCounterFormatHelpButton").disabled = !state;
	document.getElementById("individualCounterResetLabel").disabled = !state;
	document.getElementById("individualCounterResetMenuList").disabled = !state;

	document.getElementById("updateIndividualCounterButton").disabled = !state;

	if ( !state ) {
		document.getElementById("individualCounterAccountTextBox").value = "";
		document.getElementById("individualCounterValueTextBox").value = "";

		document.getElementById("individualCountersListBox").selectedIndex = -1;
	}
}

// 'automatic prefixes' functions
function prefixesInfoHelpButton()
{
	SubjectManager.displayMessageDialog(stringBundle.getString('prefixesInfoHelp'));
}

function prefixesHelpButton(eltId)
{
	SubjectManager.displayMessageDialog(stringBundle.getString('prefixesHelp'));

	var eltRef = eltId.match(new RegExp("^(.+)HelpButton$"));

	if ( eltRef != null ) {
		document.getElementById(eltRef[1] + "TextBox").focus();
	}
}

function onClickReplyPrefixesCheckBox(state)
{
	document.getElementById("replyPrefixesListTextBox").disabled = !state;
	document.getElementById("replyPrefixesListHelpButton").disabled = !state;
}

function onClickForwardPrefixesCheckBox(state)
{
	document.getElementById("forwardPrefixesListTextBox").disabled = !state;
	document.getElementById("forwardPrefixesListHelpButton").disabled = !state;
}

function onClickOtherPrefixesCheckBox(state)
{
	document.getElementById("otherPrefixesListTextBox").disabled = !state;
	document.getElementById("otherPrefixesListHelpButton").disabled = !state;
}

function onClickKeep1stPrefixCheckBox(state)
{
	if ( state ) {
		document.getElementById("1stReplyPrefixReplacementCheckBox").disabled = !state;
		document.getElementById("1stForwardPrefixReplacementCheckBox").disabled = !state;

		onClick1stReplyPrefixReplacementCheckBox(document.getElementById("1stReplyPrefixReplacementCheckBox").checked);
		onClick1stForwardPrefixReplacementCheckBox(document.getElementById("1stForwardPrefixReplacementCheckBox").checked);
	}
	else {
		onClick1stReplyPrefixReplacementCheckBox(state);
		onClick1stForwardPrefixReplacementCheckBox(state);
		document.getElementById("1stReplyPrefixReplacementCheckBox").disabled = !state;
		document.getElementById("1stForwardPrefixReplacementCheckBox").disabled = !state;
	}
}

function onClick1stReplyPrefixReplacementCheckBox(state)
{
	document.getElementById("replyReplacementPrefixLabel").disabled = !state;
	document.getElementById("replyReplacementPrefixTextBox").disabled = !state;
}

function onClick1stForwardPrefixReplacementCheckBox(state)
{
	document.getElementById("forwardReplacementPrefixLabel").disabled = !state;
	document.getElementById("forwardReplacementPrefixTextBox").disabled = !state;
}

// 'message filters' functions
function initializeFilterSubjectsSettings()
{
	var filterSubjectsSettings = document.getElementById("filterSubjectsSettings").value;
	if ( filterSubjectsSettings == "" ) {
		filterSubjectsSettings = "{}";
	}

	filterSubjectsList = SubjectManager.JSONparse(filterSubjectsSettings, SubjectManager.preProcessLoadSettings, new Array("subject")); // parses filter subjects settings as JSON string

	if ( typeof(filterSubjectsList) !== 'object' ) { // if result is not an object (nb: arrays are objects)
		filterSubjectsList = {};
	}

	var filterSubjectsCount = 0;

	for ( var propty in filterSubjectsList ) {
		filterSubjectsCount++;
	}

	sendMessageToConsole("options.initializeFilterSubjectsSettings", filterSubjectsSettings);
	sendMessageToConsole("options.initializeFilterSubjectsSettings", filterSubjectsCount + " filter subjects have been loaded");
}

function createFiltersCheckBoxes(firstStart)
{
	firstStart = ( typeof(firstStart) !== "undefined" ) ? firstStart : false;

	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);
	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list
	var account = null; // account object
	var accountServer = null; // related server

	var filtersHBoxRows = document.getElementById("filtersHBoxRows");

	var optionsCommands = document.getElementById("subjectManagerOptionsCmds");

	var filtersList = null;
	var actionValue = false;
	var filterFullName = "";
	var filterKey = "";
	var filterEnabledTxt = "";

	var filtersCount = 0;
	var selectedFiltersCount = 0;
	var checkBoxFlag = false;

	var newCheckBox = null;
	var newButtonSettings = null;
	var newButtonFilters = null;
	var newCommand = null;
	var newSpacer = null;

	var newRow = null;

	if ( filtersHBoxRows != null ) { // (JSCTSABT) if filters groupbox exists
		// setting of height of rows
		var filtersTab = document.getElementById("filtersTab");
		var filtersGroupBox = document.getElementById("filtersGroupBox");
		var selectAllFiltersCheckBox = document.getElementById("selectAllFiltersCheckBox");
		var filtersMenuSeparator = document.getElementById("filtersMenuSeparator");

		if ( firstStart ) {
			filtersHBoxRows.maxHeight = filtersTab.clientHeight - filtersGroupBox.clientHeight - selectAllFiltersCheckBox.clientHeight - filtersMenuSeparator.clientHeight;
		}

		//
		if ( oldFilterSubjectsList == null ) {
			oldFilterSubjectsList = SubjectManager.cloneObj(filterSubjectsList, "filterSubjectsList");
		}

		// clearance of rows
		if ( filtersHBoxRows.hasChildNodes() ) { // if filters groupbox has children
			while ( filtersHBoxRows.firstChild != null ) { // while there is a first element
				filtersHBoxRows.removeChild(filtersHBoxRows.firstChild); // removes the first element (then the former 2nd one becomes the 1st)
			}
		}

		// clearance of settings
		filterSubjectsList = {}; // empties filter subjects settings

		// creation of filters checkboxes
		var vFilter = null;

		for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account
			account = accounts.queryAt(idx); // gets account object
			accountServer = account.incomingServer; // gets related server

			if ( account.defaultIdentity != null ) { // if current account has a default identity (skips "Local Folder")
				filtersList = accountServer.rootFolder.getFilterList(null); // gets filters list for current account

				for ( var jdx = 0 ; jdx < filtersList.filterCount ; jdx++ ) { // for each filter
					vFilter = new SubjectManager.VirtualFilter(filtersList.getFilterAt(jdx));

					actionValue = "";

					for ( var kdx = 0 ; (kdx < vFilter.actionsCount()) && (actionValue == "") ; kdx++ ) { // searches for a 'reply with template' action
						action = vFilter.realFilterObj.getActionAt(kdx);

						if ( (action.type == Components.interfaces.nsMsgFilterAction.Reply) && (action.strValue != "") ) { // if filter action is a 'reply with template' one (code = 9) and template message is set
							actionValue = action.strValue; // saves uri of template message
						}
					}

					if ( actionValue != "" ) { // if uri of template message is defined
						filtersCount++;
						filterKey = accountServer.key + "_" + vFilter.realFilterObj.filterName;

						// creation of list element
						filterSubjectsList[filterKey] = new SubjectManager.FilterSubjectSettings(accountServer.key, vFilter.realFilterObj.filterName, "", false); // adds a new filter subject settings object

						if ( oldFilterSubjectsList[filterKey] != null ) {
							filterSubjectsList[filterKey].subject = oldFilterSubjectsList[filterKey].subject; // retrieves previous subject of the filter with the same key
							filterSubjectsList[filterKey].enabled = oldFilterSubjectsList[filterKey].enabled; // retrieves previous enabled state of the filter with the same key

							if ( filterSubjectsList[filterKey].enabled ) {
								selectedFiltersCount++;
							}
						}

						// creation of row and nested elements
						filterFullName = accountServer.prettyName + " > " + vFilter.realFilterObj.filterName;
						filterEnabledTxt = ( vFilter.realFilterObj.enabled ) ? "normal" : "italic";

						newRow = document.createElement("row"); // creates a new row

						// checkbox
						newCheckBox = document.createElement("checkbox"); // creates a new checkbox
						newCheckBox.setAttribute('id', "filterSubjectSettingsCheckBox-" + filterKey); // sets checkbox id
						newCheckBox.setAttribute('label', filterFullName); // sets account name and filter name as checkbox label
						newCheckBox.setAttribute('tooltiptext', account.defaultIdentity.email + " / " + vFilter.realFilterObj.filterName + " : \n" + actionValue); // sets additional information as checkbox tooltip text
						newCheckBox.setAttribute('checked', filterSubjectsList[filterKey].enabled); // initializes checkbox state
						newCheckBox.setAttribute('style', "font-style:" + filterEnabledTxt); // initializes checkbox display
						newCheckBox.addEventListener("command", function() { onClickFilterSubjectSettingsCheckBox(this.id); }, false); // sets related action

						newRow.appendChild(newCheckBox); // adds checkbox to row

						// button filter settings
						newButtonSettings = document.createElement("button"); // creates a new button
						newButtonSettings.setAttribute('id', "filterSubjectSettingsButton-" + filterKey); // sets button id
						newButtonSettings.setAttribute('image', "chrome://SubjectManager/skin/icon_settings.png"); // sets button image
						newButtonSettings.setAttribute('tooltiptext', stringBundle.getString('filterSettingsToolTipSta') + filterFullName + stringBundle.getString('filterSettingsToolTipEnd')); // sets button tooltip text
						newButtonSettings.setAttribute('style', "min-width:10px;"); // sets button style

						if ( optionsCommands != null ) { // (JSCTSABT) if graphical objects exist
							newCommand = document.createElement("command"); // creates a new command
							newCommand.setAttribute('id', "filterSubjectSettingsButtonCmd-" + filterKey); // sets id
							newCommand.addEventListener("command", function() { onClickFilterSubjectSettingsButton(this.id); }, false); // sets related action

							optionsCommands.appendChild(newCommand); // appends command to commands

							newButtonSettings.setAttribute('command', "filterSubjectSettingsButtonCmd-" + filterKey);
						}

						newRow.appendChild(newButtonSettings); // adds button to row

						// button message filter settings
						newButtonFilters = document.createElement("button"); // creates a new button
						newButtonFilters.setAttribute('id', "msgFilterSettingsButton-" + filterKey); // sets button id
						newButtonFilters.setAttribute('image', "chrome://SubjectManager/skin/icon_filter.png"); // sets button immage
						newButtonFilters.setAttribute('tooltiptext', stringBundle.getString('msgFilterSettingsToolTipSta') + filterFullName + stringBundle.getString('msgFilterSettingsToolTipEnd')); // sets button tooltip text
						newButtonFilters.setAttribute('style', "min-width:10px;"); // sets button style

						if ( optionsCommands != null ) { // (JSCTSABT) if graphical objects exist
							newCommand = document.createElement("command"); // creates a new command
							newCommand.setAttribute('id', "msgFilterSettingsButtonCmd-" + filterKey); // sets id
							newCommand.addEventListener("command", function() { onClickMsgFilterSettingsButton(this.id); }, false); // sets related action

							optionsCommands.appendChild(newCommand); // appends command to commands

							newButtonFilters.setAttribute('command', "msgFilterSettingsButtonCmd-" + filterKey);
						}

						newRow.appendChild(newButtonFilters); // adds button to row

						// spacer
						// this spacer is useful if vertical scrollbar is displayed: in this case, button is overlayed by scrollbar and is not fully visible
						// this trick allows to add an invisible item (spacer) which is the one overlayed by scrollbar
						// its width is computed automatically once all items have been added
						newSpacer = document.createElement("spacer"); // creates a new spacer

						newRow.appendChild(newSpacer); // adds spacer to row

						filtersHBoxRows.appendChild(newRow); // appends row (checkbox + buttons + spacer) to accounts groupbox
					}
				}
			}
		}

		// setting of width of spacer
		if ( newSpacer != null ) {
			var spacerWidth = filtersHBoxRows.scrollWidth - filtersHBoxRows.clientWidth + 1;
			newSpacer.setAttribute('style', "width: " + spacerWidth + "px");
		}

		oldFilterSubjectsList = SubjectManager.cloneObj(filterSubjectsList, "filterSubjectsList");

		// sets 'select all filters' checkbox state
		document.getElementById("selectAllFiltersCheckBox").checked = ( (filtersCount > 0) && (selectedFiltersCount == filtersCount) );
	}
}

function onClickSelectAllFiltersCheckBox(state)
{
	var filtersHBoxRows = document.getElementById("filtersHBoxRows");

	if ( (filtersHBoxRows != null) && filtersHBoxRows.hasChildNodes() ) { // (JSCTSABT) if filters groupbox exists and has children
		var xulElement = filtersHBoxRows.firstChild; // gets first element
		var filterKey = "";

		while ( xulElement != null ) { // while there is a next element
			if ( (xulElement.nodeName === "row") && xulElement.hasChildNodes() ) {
				var rowElement = xulElement.firstChild; // gets first element

				while ( rowElement != null ) { // while there is a next row element
					if ( rowElement.nodeName === "checkbox" ) { // if child is a checkbox
						rowElement.checked = state; // changes checkbox state

						filterKey = rowElement.id.substring(rowElement.id.indexOf("-") + 1);
						oldFilterSubjectsList[filterKey].enabled = state; // saves state
					}

					rowElement = rowElement.nextSibling; // gets next row element
				}
			}

			xulElement = xulElement.nextSibling; // gets next element
		}
	}
}

function onClickAllFiltersButton()
{
	window.openDialog("chrome://messenger/content/FilterListDialog.xul", "", "chrome,modal,resizable,status,centerscreen,dialog=no", { folder: null });
	createFiltersCheckBoxes(); // updates filters settings
}

function reinitializeFilterSubjectObjects()
{
	document.getElementById("filterSubjectLabel").disabled = true;
	document.getElementById("filterSubjectMenuList").selectedIndex = -1;
	document.getElementById("filterSubjectMenuList").disabled = true;
}

function resetFilterSubjectMenuList(forceFlag)
{
	if ( subjectsListBoxChanged || forceFlag ) { // if any change has been made
		clearFilterSubjectMenuList(); // clears filter subject menulist
		fillFilterSubjectMenuList(); // fills filter subject menulist
	}
}

function clearFilterSubjectMenuList()
{
	var filterSubjectMenuPopUp = document.getElementById("filterSubjectMenuPopUp");

	if ( filterSubjectMenuPopUp != null ) { // (JSCTSABT)
		// clearance of existing items
		while ( filterSubjectMenuPopUp.firstChild ) {
			filterSubjectMenuPopUp.removeChild(filterSubjectMenuPopUp.firstChild);
		}
	}
}

function fillFilterSubjectMenuList()
{
	var filterSubjectMenuList = document.getElementById("filterSubjectMenuList");
	var filterSubjectMenuPopUp = document.getElementById("filterSubjectMenuPopUp");
	var subjectsListBox = document.getElementById("subjectsListBox");

	if ( (filterSubjectMenuList != null) && (filterSubjectMenuPopUp != null) && (subjectsListBox != null) && (filterSubjectsList[selectedFilterKey] != null) ) { // (JSCTSABT)
		var selIdx = -1;
		var filterSubjectMenuItem = null;

		var selectedFilterSubject = unescape(filterSubjectsList[selectedFilterKey].subject); // decodes subject

		// checking if saved default subject for current account is into the main subjects list
		for ( var idx = 0 ; (idx < subjectsListBox.getRowCount()) && (selIdx == -1) ; idx++ ) { // for each subject of subjects listbox
			if ( selectedFilterSubject == subjectsListBox.getItemAtIndex(idx).getAttribute('label') ) {
				selIdx = idx;
			}
		}

		// add of saved default subject for current account into the menulist in case it is not one of the subject from the main subjects list
		if ( selIdx == -1 ) {
			filterSubjectMenuItem = document.createElement("menuitem"); // creates a new menuitem
			filterSubjectMenuItem.setAttribute('label', selectedFilterSubject); // sets subject as menuitem label

			filterSubjectMenuPopUp.appendChild(filterSubjectMenuItem); // adds subject into menulist

			selIdx = 0; // selects
		}

		// filling of default subject menu list
		for ( var idx = 0 ; idx < subjectsListBox.getRowCount() ; idx++ ) { // for each subject of main subjects listbox
			filterSubjectMenuItem = document.createElement("menuitem"); // creates a new menuitem
			filterSubjectMenuItem.setAttribute('label', subjectsListBox.getItemAtIndex(idx).getAttribute('label')); // sets subject as menuitem label

			filterSubjectMenuPopUp.appendChild(filterSubjectMenuItem); // adds subject into menulist

			if ( selectedFilterSubject == subjectsListBox.getItemAtIndex(idx).getAttribute('label') ) {
				selIdx = idx;
			}
		}

		filterSubjectMenuList.selectedIndex = selIdx;
	}
}

function onClickFilterSubjectSettingsCheckBox(objId)
{
	var filterKey = objId.substring(objId.indexOf("-") + 1);
	var filterSubjectSettingsCheckBox = document.getElementById(objId);

	if ( (oldFilterSubjectsList[filterKey] != null) && (filterSubjectSettingsCheckBox != null) ) { // (JSCTSABT)
		oldFilterSubjectsList[filterKey].enabled = filterSubjectSettingsCheckBox.checked;
	}
}

function onClickFilterSubjectSettingsButton(objId)
{
	var filterKey = objId.substring(objId.indexOf("-") + 1);

	// saving of settings for previously selected filter
	saveFilterSubjectsSettings(selectedFilterKey);

	if ( filterKey != selectedFilterKey ) { // if selected filter is not the same as previous one
		// clearance of graphical objects
		selectedFilterKey = filterKey;
		resetFilterSubjectMenuList(true);

		document.getElementById("filterSettingsCaption").label = stringBundle.getString('filterSettingsLabel') + " : " + document.getElementById("filterSubjectSettingsCheckBox-" + filterKey).label; // updates groupbox title

		document.getElementById("filterSubjectLabel").disabled = false;
		document.getElementById("filterSubjectMenuList").disabled = false;

		sendMessageToConsole("options.onClickFilterSubjectSettingsButton", "Settings for filter '" + filterKey + "' have been loaded");
	}
}

function saveFilterSubjectsSettings(selFilterKey)
{
	if ( selFilterKey != "" ) {
		var filterSubjectMenuList = document.getElementById("filterSubjectMenuList");

		// subject
		if ( filterSubjectMenuList != null ) { // (JSCTSABT) if headers fetching menulist exists
			filterSubjectsList[selFilterKey].subject = escape(filterSubjectMenuList.label); // updates encoded filter subject value

			sendMessageToConsole("options.saveFilterSubjectsSettings", "Settings for filter '" + selFilterKey + "' have been saved");
		}
	}
}

function onClickMsgFilterSettingsButton(objId)
{
	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);
	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list
	var tmpAccount = null;
	var accountServer = null; // related server

	// loading of settings for current server
	var selectedServerKey = objId.substring(objId.indexOf("-") + 1, objId.indexOf("_")); // gets server key

	for ( var idx = 0 ; (idx < accounts.count()) && (accountServer == null) ; idx++ ) { // for each account
		tmpAccount = accounts.queryAt(idx); // gets account object

		if ( tmpAccount.incomingServer.key == selectedServerKey ) {
			accountServer = tmpAccount.incomingServer;
		}
	}

	var filterName = objId.substring(objId.indexOf("_") + 1);

	if ( accountServer != null ) {
		var filtersList = null;
		var vFilter = null;
		var filterObj = null;

		filtersList = accountServer.rootFolder.getFilterList(null); // gets filters list for current account

		for ( var jdx = 0 ; (jdx < filtersList.filterCount) && (filterObj == null) ; jdx++ ) { // for each filter
			vFilter = new SubjectManager.VirtualFilter(filtersList.getFilterAt(jdx));

			if ( vFilter.realFilterObj.filterName == filterName ) {
				filterObj = vFilter.realFilterObj;
			}
		}

		window.openDialog("chrome://messenger/content/FilterListDialog.xul", "", "chrome,modal,resizable,status,centerscreen,dialog=no", { folder: accountServer.rootFolder, filter: filterObj });
		createFiltersCheckBoxes(); // updates filters settings
	}
	else {
		sendMessageToConsole("options.onClickMsgFilterSettingsButton", "No matching account for \"" + selectedServerKey + "\" has been found", "error");
	}
}

function filtersSubjectsInfoHelpButton()
{
	SubjectManager.displayMessageDialog(stringBundle.getString('filtersSubjectsHelp'));
}

// 'miscellaneous' functions
function onClickSubjectBoxAutoCompleteEnabledCheckBox(state)
{
	document.getElementById("subjectBoxAutoCompleteCaseSensitiveCheckBox").disabled = !state;
}

function onClickSubjectBoxButtonEnabledCheckBox(state)
{
	document.getElementById("subjectBoxButtonLabelReplacementCheckBox").disabled = !state;
}

function onClickExportSubjectsButton()
{
	var filePicker = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(Components.interfaces.nsIFilePicker);
	var homeDir = null;
	var defaultName = SubjectManager.temporaryRoot + "_subjects.txt";

	homeDir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsIFile);

	filePicker.appendFilter("Subjects files", "*.txt");
	filePicker.init(window, stringBundle.getString('chooseSubjectsFile'), Components.interfaces.nsIFilePicker.modeSave);
	filePicker.displayDirectory = homeDir;
	filePicker.defaultString = defaultName;

	// nsIFilePicker.show() is deprecated for TB >= v17
	// nsIFilePicker.open() has been introduced in TB v17 but behaves awkwardly for TB v17.* (callback function has to be a component with a method named 'done', exception message is: [Exception... "'Javascript component does not have a method named: "done"' when calling method: nsIFilePickerShownCallback::done" nsresult: "0×805700300 (NS_ERROR_XPC_JSOBJECT_HAS_NO_FUNCTION_NAMED)" location: "<unknown>" data: no]
	if ( SubjectManager.isTBVersionEqualOrHigherThan("18.0a1") ) {
		filePicker.open(function() {
			onClickExportSubjectsButton2(filePicker);
		});
	}
	else {
		var filePickerReturnVal = filePicker.show();

		if ( (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnOK) || (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnReplace) ) {
			onClickExportSubjectsButton2(filePicker);
		}
	}
}

function onClickExportSubjectsButton2(filePicker)
{
	if ( filePicker.file != null ) { // if a file has been chosen
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions." + SubjectManager.addOnName + ".");

		var settingName = "subjectsList";

		try {
			prefs.QueryInterface(Components.interfaces.nsIPrefBranch);

			// check of existence of subjects file
			var settingsFile = SubjectManager.VirtualLocalFile();
			settingsFile.initWithPath(filePicker.file.path);

			if ( !settingsFile.exists() ) {
				settingsFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
			}

			// writing of subjects into file
			var subjectsFileStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
									.createInstance(Components.interfaces.nsIFileOutputStream);

			subjectsFileStream.init(settingsFile, SubjectManager.PR_WRONLY | SubjectManager.PR_TRUNCATE, 0664, 0);

			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
							.createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(subjectsFileStream, "UTF-8", 0, 0);

			converter.writeString(prefs.getCharPref(settingName) + "\n");

			converter.close(); // closes subjectsFileStream too
		}
		catch ( err ) {
			sendMessageToConsole("options.onClickExportSubjectsButton2", "Error while writing setting '" + settingName + "' to file (" + err + ")", "error");
		}
	}
}

function onClickImportSubjectsButton()
{
	var filePicker = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(Components.interfaces.nsIFilePicker);
	var homeDir = null;
	var defaultName = SubjectManager.temporaryRoot + "_subjects.txt";

	homeDir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsIFile);

	filePicker.appendFilter("Subjects files", "*.txt");
	filePicker.appendFilter("All files", "*.*");
	filePicker.init(window, stringBundle.getString('chooseSubjectsFile'), Components.interfaces.nsIFilePicker.modeOpen);
	filePicker.displayDirectory = homeDir;
	filePicker.defaultString = defaultName;

	// nsIFilePicker.show() is deprecated for TB >= v17
	// nsIFilePicker.open() has been introduced in TB v17 but behaves awkwardly for TB v17.* (callback function has to be a component with a method named 'done', exception message is: [Exception... "'Javascript component does not have a method named: "done"' when calling method: nsIFilePickerShownCallback::done" nsresult: "0×805700300 (NS_ERROR_XPC_JSOBJECT_HAS_NO_FUNCTION_NAMED)" location: "<unknown>" data: no]
	if ( SubjectManager.isTBVersionEqualOrHigherThan("18.0a1") ) {
		filePicker.open(function() {
			onClickImportSubjectsButton2(filePicker);
		});
	}
	else {
		var filePickerReturnVal = filePicker.show();

		if ( (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnOK) || (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnReplace) ) {
			onClickImportSubjectsButton2(filePicker);
		}
	}
}

function onClickImportSubjectsButton2(filePicker)
{
	if ( filePicker.file != null ) { // if a file has been chosen
		var settingName = "subjectsList";
		var importedSubjects = "";
		var importedSubjectsList = new Array();

		try {
			// check of existence of subjects file
			var subjectsFile = SubjectManager.VirtualLocalFile();
			subjectsFile.initWithPath(filePicker.file.path);

			if ( subjectsFile.exists() ) {
				// reading of subjects from file
				var subjectsFileStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
										.createInstance(Components.interfaces.nsIFileInputStream);

				subjectsFileStream.init(subjectsFile, SubjectManager.PR_RDONLY, 0444, 0);

				var converter = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
								.createInstance(Components.interfaces.nsIConverterInputStream);
				converter.init(subjectsFileStream, "UTF-8", 0, 0);
				converter.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);

				var line = {};

				if (converter instanceof Components.interfaces.nsIUnicharLineInputStream) {
					converter.readLine(line);

					importedSubjects = line.value;
					importedSubjectsList = SubjectManager.unescapeArray(importedSubjects.split(new RegExp(document.getElementById("subjectsListSeparator").value, "g"))); // parses subjects list

					var importedSubjectsCount = importedSubjectsList.length;

					sendMessageToConsole("options.onClickImportSubjectsButton2", importedSubjects);
					sendMessageToConsole("options.onClickImportSubjectsButton2", importedSubjectsCount + " subjects have been read from import file");

					var msg1 = stringBundle.getString('importSubjectsConfirm1Sta') + " " + importedSubjectsCount + " " + stringBundle.getString('importSubjectsConfirm1End');

					if ( importedSubjectsCount > 0 ) { // if a subject has actually been found
						msg1 += "\r\n" + stringBundle.getString('importSubjectsConfirm2');

						if ( SubjectManager.displayConfirmDialog(msg1) ) { // displays a general confirmation dialog, and if 'ok' is selected
							var subjectsListBox = document.getElementById("subjectsListBox");
							var subjectsListCaseSensitiveCheckBox = document.getElementById("subjectsListCaseSensitiveCheckBox");

							var importedSubjectsCount2 = 0;
							var found = false;
							var newSubject = "";
							var tmpNewSubject = "";
							var subjectToImport = "";

							for ( var jdx = 0 ; jdx < importedSubjectsCount ; jdx++ ) { // for each subject to import
								if ( addSubject(importedSubjectsList[jdx], false) ) {
									importedSubjectsCount2++;
								}
							}

							if ( importedSubjectsCount2 > 0 ) {
								subjectsListBoxChanged = true;
							}

							sendMessageToConsole("options.onClickImportSubjectsButton2", importedSubjectsCount2 + " subjects have been imported");

							var msg3 = stringBundle.getString('importSubjectsConfirm4Sta') + " " + importedSubjectsCount2 + " " + stringBundle.getString('importSubjectsConfirm4End');
							SubjectManager.displayMessageDialog(msg3);
						}
					}
					else { // if no subject has been found in import file
						SubjectManager.displayMessageDialog(msg1);
					}
				}
				else { // if contents of file cannot be read
					sendMessageToConsole("options.onClickImportSubjectsButton2", "Contents of file '" + filePicker.file.path + "' cannot be read", "error");
				}

				converter.close(); // closes subjectsFileStream too
			}
			else { // if import file does not exist
				sendMessageToConsole("options.onClickImportSubjectsButton2", "File '" + filePicker.file.path + "' does not exist or cannot be read", "error");
			}
		}
		catch ( err ) {
			sendMessageToConsole("options.onClickImportSubjectsButton2", "Error while reading setting '" + settingName + "' from file '" + filePicker.file.path + "' (" + err + ")", "error");
		}
	}
}

function onClickDebugModeCheckBox(state)
{
	document.getElementById("debugModeToFileCheckBox").disabled = !state;
	if ( !state ) {
		document.getElementById("debugModeToFileTextBox").disabled = true;
		document.getElementById("debugModeToFileButton").disabled = true;
	}
	else {
		document.getElementById("debugModeToFileTextBox").disabled = !document.getElementById("debugModeToFileCheckBox").checked;
		document.getElementById("debugModeToFileButton").disabled = !document.getElementById("debugModeToFileCheckBox").checked;
	}
}

function onClickDebugModeToFileCheckBox(state)
{
	document.getElementById("debugModeToFileTextBox").disabled = !state;
	document.getElementById("debugModeToFileButton").disabled = !state;
}

function onClickDebugModeToFileButton()
{
	var filePicker = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(Components.interfaces.nsIFilePicker);
	var homeDir = null;
	var defaultName = "";

	var debugFileName = document.getElementById("debugModeToFileTextBox").value;

	if ( debugFileName != "" ) {
		try {
			homeDir = SubjectManager.VirtualLocalFile();
			homeDir.initWithPath(debugFileName);
			defaultName = homeDir.leafName; // should be called before 'homeDir = homeDir.parent;'
			homeDir = homeDir.parent;
		}
		catch ( err ) {
			debugFileName = "";
		}
	}

	if ( debugFileName == "" ) {
		homeDir = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("Home", Components.interfaces.nsIFile);

		defaultName = SubjectManager.temporaryRoot + "_logfile.log";
	}

	filePicker.appendFilter("Log files", "*.log;*.txt");
	filePicker.init(window, stringBundle.getString('chooseDebugLogFile'), Components.interfaces.nsIFilePicker.modeSave);
	filePicker.displayDirectory = homeDir;
	filePicker.defaultString = defaultName;

	// nsIFilePicker.show() is deprecated for TB >= v17
	// nsIFilePicker.open() has been introduced in TB v17 but behaves awkwardly for TB v17.* (callback function has to be a component with a method named 'done', exception message is: [Exception... "'Javascript component does not have a method named: "done"' when calling method: nsIFilePickerShownCallback::done" nsresult: "0×805700300 (NS_ERROR_XPC_JSOBJECT_HAS_NO_FUNCTION_NAMED)" location: "<unknown>" data: no]
	if ( SubjectManager.isTBVersionEqualOrHigherThan("18.0a1") ) {
		filePicker.open(function() {
			onClickDebugModeToFileButton2(filePicker);
		});
	}
	else {
		var filePickerReturnVal = filePicker.show();

		if ( (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnOK) || (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnReplace) ) {
			onClickDebugModeToFileButton2(filePicker);
		}
	}
}

function onClickDebugModeToFileButton2(filePicker)
{
	if ( filePicker.file != null ) {
		document.getElementById("debugModeToFileTextBox").value = filePicker.file.path;
	}
}

function onClickReInitAutoCompleteButton()
{
	var filenames = new Array("compreg.dat", "xpti.dat");
	var file = null;
	var ok = true;

	for ( var idx = 0 ; idx < filenames.length ; idx++ ) {
		file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
		file.append(filenames[idx]);

		if ( file.exists() && file.isFile() ) {
			file.remove(false);
			sendMessageToConsole("options.onClickReInitAutoCompleteButton", "File \"" + file.path + "\" has been removed");
		}
		else {
			ok = false;

			SubjectManager.localConsole.logWarning("options.onClickReInitAutoCompleteButton", "File \"" + file.path + "\" has not been found");
		}
	}

	if ( ok ) {
		SubjectManager.displayAlertDialog(stringBundle.getString('afterResetDefaults'));
	}
}

function onClickResetDefaultsButton()
{
	if ( SubjectManager.displayConfirmDialog(stringBundle.getString('beforeResetDefaults')) ) { // displays a confirmation dialog, and if 'ok' is selected
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch(null);

		prefs.deleteBranch("extensions." + SubjectManager.addOnName);

		SubjectManager.displayAlertDialog(stringBundle.getString('afterResetDefaults'));

		window.close();
	}
}

function onClickExportSettingsButton()
{
	var filePicker = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(Components.interfaces.nsIFilePicker);
	var homeDir = null;
	var defaultName = SubjectManager.temporaryRoot + "_settings.txt";

	homeDir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsIFile);

	filePicker.appendFilter("Settings files", "*.txt");
	filePicker.init(window, stringBundle.getString('chooseSettingsFile'), Components.interfaces.nsIFilePicker.modeSave);
	filePicker.displayDirectory = homeDir;
	filePicker.defaultString = defaultName;

	// nsIFilePicker.show() is deprecated for TB >= v17
	// nsIFilePicker.open() has been introduced in TB v17 but behaves awkwardly for TB v17.* (callback function has to be a component with a method named 'done', exception message is: [Exception... "'Javascript component does not have a method named: "done"' when calling method: nsIFilePickerShownCallback::done" nsresult: "0×805700300 (NS_ERROR_XPC_JSOBJECT_HAS_NO_FUNCTION_NAMED)" location: "<unknown>" data: no]
	if ( SubjectManager.isTBVersionEqualOrHigherThan("18.0a1") ) {
		filePicker.open(function() {
			onClickExportSettingsButton2(filePicker);
		});
	}
	else {
		var filePickerReturnVal = filePicker.show();

		if ( (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnOK) || (filePickerReturnVal == Components.interfaces.nsIFilePicker.returnReplace) ) {
			onClickExportSettingsButton2(filePicker);
		}
	}
}

function onClickExportSettingsButton2(filePicker)
{
	if ( filePicker.file != null ) { // if a file has been chosen
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions." + SubjectManager.addOnName + ".");
		var branch = prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		var settings = branch.getChildList("", {});

		var settingName = "";
		var settingVal = null;

		try {
			// check existence of settings file
			var settingsFile = SubjectManager.VirtualLocalFile();
			settingsFile.initWithPath(filePicker.file.path);

			if ( !settingsFile.exists() ) {
				settingsFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
			}

			// writing of settings into file
			var settingsFileStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
									.createInstance(Components.interfaces.nsIFileOutputStream);

			settingsFileStream.init(settingsFile, SubjectManager.PR_WRONLY | SubjectManager.PR_TRUNCATE, 0664, 0);

			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
							.createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(settingsFileStream, "UTF-8", 0, 0);

			for ( var settingId in settings ) { // for each settings
				settingName = settings[settingId];
				
				switch ( branch.getPrefType(settingName) ) {
					// PREF_STRING = 32
					// PREF_INT = 64
					// PREF_BOOL = 128
					// PREF_INVALID = ?
					case 32: settingVal = "'" + prefs.getCharPref(settingName) + "'"; break;
					case 64: settingVal = prefs.getIntPref(settingName); break;
					case 128: settingVal = prefs.getBoolPref(settingName); break;
					default: settingVal = null;
				}

				if ( settingVal != null ) {
					if ( SubjectManager.exportSettingsMode == "PREFS" ) {
						converter.writeString("user_pref(\"extensions." + SubjectManager.addOnName + "." + settingName + "\", " + settingVal + ");\n");
					}
					else {
						converter.writeString(settingName + "=" + settingVal + "\n");
					}
				}
				else {
					sendMessageToConsole("options.onClickExportSettingsButton2", "Type of setting '" + settingName + "' = '" + branch.getPrefType(settingName) + "' is not handled", "error");
				}
			}

			converter.close(); // closes settingsFileStream too
		}
		catch ( err ) {
			sendMessageToConsole("options.onClickExportSettingsButton2", "Error while writing setting '" + settingsName + "' to file (" + err + ")", "error");
		}
	}
}
