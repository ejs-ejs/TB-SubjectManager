if ( !SubjectManager ) var SubjectManager = {};


/**********
 * Add-on variables
 */

// attributes are defined in SubjectManager0.js

SubjectManager.firstComposingSession = true;

SubjectManager.subjectsArray = null;
SubjectManager.subjectsListChanged = true;
SubjectManager.insertionPoint = 0;

SubjectManager.globalCounterInserted = false;
SubjectManager.individualCounterInserted = false;
SubjectManager.identityNameObj = {};
SubjectManager.identitiesObj = {};

SubjectManager.unparsedSubject = "";


/**********
 * Command methods
 */

/**
 * Reads add-on settings
 */
SubjectManager.readSettings = function ()
{
	this.subjectsList = this.prefs.getCharPref("subjectsList");
	this.subjectsListSeparator = this.prefs.getCharPref("subjectsListSeparator");
	this.defaultSubjects = this.prefs.getCharPref("defaultSubjects");
	this.subjectPickedBehaviour = this.prefs.getIntPref("subjectPickedBehaviour");
	this.subjectPickedBeginningEnd = this.prefs.getBoolPref("subjectPickedBeginningEnd");
	this.subjectPickedEndBeginning = this.prefs.getBoolPref("subjectPickedEndBeginning");
	this.subjectsListCaseSensitive = this.prefs.getBoolPref("subjectsListCaseSensitive");
	this.subjectsAdvancedMode = this.prefs.getBoolPref("subjectsAdvancedMode");
	this.handleSubjectsIdentities = this.prefs.getBoolPref("handleSubjectsIdentities");
	this.globalCounterSettings = this.prefs.getCharPref("globalCounterSettings");
	this.handleCounterIdentities = this.prefs.getBoolPref("handleCounterIdentities");
	this.individualCountersSettings = this.prefs.getCharPref("individualCountersSettings");
	this.includeReplyPrefixes = this.prefs.getBoolPref("includeReplyPrefixes");
	this.replyPrefixesList = unescape(this.prefs.getCharPref("replyPrefixesList"));
	this.includeForwardPrefixes = this.prefs.getBoolPref("includeForwardPrefixes");
	this.forwardPrefixesList = unescape(this.prefs.getCharPref("forwardPrefixesList"));
	this.includeOtherPrefixes = this.prefs.getBoolPref("includeOtherPrefixes");
	this.otherPrefixesList = unescape(this.prefs.getCharPref("otherPrefixesList"));
	this.removeAutoPrefixes = this.prefs.getBoolPref("removeAutoPrefixes");
	this.keep1stPrefix = this.prefs.getBoolPref("keep1stPrefix");
	this.replace1stReplyPrefix = this.prefs.getBoolPref("replace1stReplyPrefix");
	this.replyReplacementPrefix = unescape(this.prefs.getCharPref("replyReplacementPrefix"));
	this.replace1stForwardPrefix = this.prefs.getBoolPref("replace1stForwardPrefix");
	this.forwardReplacementPrefix = unescape(this.prefs.getCharPref("forwardReplacementPrefix"));
	this.subjectBoxAutoCompleteEnabled = this.prefs.getBoolPref("subjectBoxAutoCompleteEnabled");
	this.subjectBoxAutoCompleteCaseSensitive = this.prefs.getBoolPref("subjectBoxAutoCompleteCaseSensitive");
	this.subjectBoxButtonEnabled = this.prefs.getBoolPref("subjectBoxButtonEnabled");
	this.subjectBoxButtonLabelReplaced = this.prefs.getBoolPref("subjectBoxButtonLabelReplaced");
	this.focusEmailBodyOnceSubjectPicked = this.prefs.getBoolPref("focusEmailBodyOnceSubjectPicked");
	this.debugMode = this.prefs.getBoolPref("debugMode");
	this.debugModeToFile = this.prefs.getBoolPref("debugModeToFile");
	this.debugFileName = unescape(this.prefs.getCharPref("debugFileName")); // decodes string

	if ( !this.isTBVersionEqualOrHigherThan("3.0a1pre") ) { // if TB version is prior to v3
		this.subjectBoxAutoCompleteEnabled = false;
	}
};

/**
 * Shows or hides button of subject box
 *
 * @param state (boolean) true/false if button of subject box must be displayed/hidden
 */
SubjectManager.showSubjectBoxButton = function (state)
{
	var subjectBoxButton = document.getElementById("subjectManagerSubjectBoxButton");
	var subjectTextBox = document.getElementById("msgSubject"); // native textbox aimed to enter text for subject

	// initialization of 'subjects' button
	if ( subjectBoxButton == null ) { // (JSCTSABT)
		// creation of subject box button
		var subjectBoxButton = document.createElement("button");
		subjectBoxButton.id = "subjectManagerSubjectBoxButton";
		subjectBoxButton.setAttribute('label', document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonLabel'));
		subjectBoxButton.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonTooltip');
		subjectBoxButton.setAttribute('type', "menu");

		// initialization of subject box button context menu
		var subjectBoxButtonMenuPopUp = document.createElement("menupopup");
		subjectBoxButtonMenuPopUp.id = "subjectManagerSubjectBoxButtonMenuPopUp";
		subjectBoxButtonMenuPopUp.addEventListener("popupshowing", function() { SubjectManager.updateSubjectsList(); }, false);

		subjectBoxButton.appendChild(subjectBoxButtonMenuPopUp);

		this.localConsole.logInformation("showSubjectBoxButton", "Custom 'Subject' button has been created");
	}

	// placement of 'subjects' button
	if ( subjectTextBox != null ) { // (JSCTSABT) if native subject textbox exists
		this.localConsole.logInformation("showSubjectBoxButton", "Native 'Subject' textbox has been found");

		var subjectBox = document.getElementById("subject-box"); // gets subject box using its id

		if ( subjectBox == null ) { // if subject box can not be identified using its id
			subjectBox = subjectTextBox.parentNode; // retrieves id of native subject box (which does not necessarily have a predefined id ('subject-box')) using one of its child ("msgSubject")
		}

		if ( subjectBox != null ) { // (JSCTSABT) if native subject box exists
			this.localConsole.logInformation("showSubjectBoxButton", "Native 'Subject' box has been found");

			// search of subject box label
			var subjectBoxLabel = document.getElementById("subjectLabel"); // gets subject label using its id

			if ( subjectBoxLabel == null ) { // if subject label can not be identified using its id
				var xulElement = subjectBox.lastChild; // initializes xul element to last child (useful for search of subject box label)

				while ( (xulElement != null) && (subjectBoxLabel == null) ) { // while there is a previous element and native subject box label has not been found
					if ( xulElement.nodeName == "label" ) { // if element is a label
						subjectBoxLabel = xulElement; // sets native subject box label reference
					}
					// for TB >= v5 only (label has been embedded into a hbox)
					else if ( xulElement.nodeName == "hbox" ) { // if element is a horizontal container
						var xulElement2 = xulElement.lastChild; // initializes xul element to last child

						while ( (xulElement2 != null) && (subjectBoxLabel == null) ) { // while there is a previous element and native subject box label has not been found
							if ( xulElement2.nodeName == "label" ) { // if element is a label
								subjectBoxLabel = xulElement; // sets native subject box label reference
							}
							else {
								xulElement2 = xulElement2.previousSibling; // gets previous child
							}
						}
					}
					else {
						xulElement = xulElement.previousSibling; // gets native subject box previous child
					}
				}
			}
			// for TB >= v5 only (label has been embedded into a hbox)
			else if ( SubjectManager.isTBVersionEqualOrHigherThan("5.0b1") ) {
				subjectBoxLabel = subjectBoxLabel.parentNode; // gets hbox
			}

			if ( subjectBoxLabel != null ) { // if native subject box label has been found
				this.localConsole.logInformation("showSubjectBoxButton", "Native 'Subject:' label has been found");

				// addition of custom subject box button
				if ( subjectBoxButton.parentNode != null ) { // (JSCTSABT) if custom subject box button has a parent
					subjectBox.removeChild(subjectBoxButton); // removes it from GUI
				}

				subjectBoxButton.hidden = !state;

				if ( this.subjectBoxButtonLabelReplaced ) { // if native subject label has been found (JSCTSABT) and must be replaced
					subjectBoxLabel.hidden = true && state; // hides subject label only if custom subject box button must be displayed
					subjectBox.insertBefore(subjectBoxButton, subjectBoxLabel); // inserts custom subject box button before subject label
				}
				else {
					subjectBoxLabel.hidden = false; // shows subject label
					subjectBox.appendChild(subjectBoxButton); // inserts custom subject box button after subject textbox
				}

				this.subjectBoxButtonEnabled = state; // updates custom subject box button state
			}
			else {
				this.localConsole.logWarning("showSubjectBoxButton", "Native 'Subject:' label has not been found");
			}
		}
		else {
			this.localConsole.logWarning("showSubjectBoxButton", "Native 'Subject' box has not been found");
		}
	}
	else {
		this.localConsole.logWarning("showSubjectBoxButton", "Native 'Subject' textbox has not been found");
	}
};

/**
 * Initializes add-on when starting Thunderbird composing session
 */
SubjectManager.initializeComposerOverLayStartup = function ()
{
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions." + this.addOnName + ".");

	if ( this.isTBVersionEqualOrHigherThan("13.0a1") ) { // if current TB version uses gecko engine v13.0
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
	}
	else {
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	}

	this.prefs.addObserver("", this, false); // receives notifications if any preference changes

	this.identityNameObj = this.buildIdentityNameTable();
	this.identitiesObj = this.buildIdentitiesTable();

	// reset of counters
	this.resetAllCounters(this.prefs);

	// management of version update
	var subjectManagerComposerOverlayButton = document.getElementById("subjectManagerComposerOverlayButton");

	if ( this.prefs.prefHasUserValue("newVersion") && (this.prefs.getIntPref("newVersion") > 0) ) { // if version has been updated
		if ( this.prefs.getIntPref("newVersion") >= 2 ) { // if this is first run
			// add of addon toolbar button
			var toolbar = document.getElementById("composeToolbar"); // toolbar for TB >= v3
			var attachButton = document.getElementById("button-attach");

			if ( toolbar == null ) { // if toolbar is null (= this is not TB v3)
				toolbar = document.getElementById("composeToolbar2"); // toolbar for TB v2
			}

			if ( (toolbar != null) && (attachButton != null) && (subjectManagerComposerOverlayButton == null) ) { // if toolbar is not null and attach button is not null and custom button is not already added to toolbar
				toolbar.insertItem("subjectManagerComposerOverlayButton", attachButton, null, false); // adds custom button
				toolbar.setAttribute('currentset', toolbar.currentSet);
				document.persist(toolbar.id, "currentset");

				this.localConsole.logInformation("initializeComposerOverLayStartup", "Composer overlay button has been displayed", true);
			}
		}

		this.prefs.setIntPref("newVersion", 0);
	}

	// initialization of settings
	this.readSettings(); // reads settings
	this.individualCountersSettingsObj = this.createIndividualCountersSettingsObject(this.prefs.getCharPref("individualCountersSettings"));

	// management of subject box button
	this.showSubjectBoxButton(this.subjectBoxButtonEnabled);

	this.handleComposingSessionInitializationPostTreatments(); // this should be executed before setting textbox autocomplete mode on
	this.firstComposingSession = false;

	// management of subject textbox autocompletion
	this.enableSubjectTextBoxAutoComplete(this.subjectBoxAutoCompleteEnabled);

	this.updateSubjectsList(); // ensures lists are updated at start

	this.localConsole.logInformation("initializeComposerOverLayStartup", "Initialization has been completed", true);
};

/**
 * Initializes composing session
 */
SubjectManager.initializeComposingSession = function ()
{
	this.insertionPoint = 0;
	this.unparsedSubject = "";

	if ( !this.firstComposingSession ) {
		this.handleComposingSessionInitializationPostTreatments();
	}
};

SubjectManager.handleComposingSessionInitializationPostTreatments = function ()
{
	var subjectTextBox = document.getElementById("msgSubject");

	if ( this.removeAutoPrefixes ) { // if automatic removal of automatic prefixes is enabled
		this.launchRemovePrefixes();
	}

	// insertion of default subjects
	if ( subjectTextBox != null ) { // (JSCTSABT)
		var msgIdentityMenuList = document.getElementById("msgIdentity");

		if ( (this.defaultSubjects == null) || (this.defaultSubjects == "") ) { // if default subjects string is not valid
			this.defaultSubjects = "{}";

			this.localConsole.logWarning("handleComposingSessionInitializationPostTreatments", "Default subjects string is not valid");
		}

		var defaultSubjectsObj = JSON.parse(this.defaultSubjects);

		if ( (msgIdentityMenuList != null) && (defaultSubjectsObj != null) ) { // (JSCTSABT)
			var defltSubject = "";
			var accountId = null;
			var accountId2 = null;

			// for TB >= v38 msgIdentityMenuList.value holds identity name (ex.: 'john doe <jdoe@nowhere.com>')
			// for TB < v38 msgIdentityMenuList.value holds identity id (ex.: 'id2')
			if ( SubjectManager.isTBVersionEqualOrHigherThan("38.0a1") ) { // if TB version is posterior or equal to v38
				for ( var idx in this.identityNameObj ) {
					if ( (this.identityNameObj[idx] == msgIdentityMenuList.value) && (accountId == null) ) {
						accountId = idx;
					}
				}
			}
			else {
				accountId = msgIdentityMenuList.value;
			}

			accountId2 = accountId;
			if ( !this.handleSubjectsIdentities && !this.handleCounterIdentities ) { // if identities should not be handled
				accountId2 = this.identitiesObj[accountId]; // gets default identity of current identity
			}
			if ( accountId2 == null ) { // if account id has not been found
				accountId2 = accountId;
			}

			defltSubject = defaultSubjectsObj[accountId2]; // gets default subject setting
			if ( defltSubject != null ) {
				if ( defltSubject.onOff && (!defltSubject.onlyIfEmpty || (subjectTextBox.value == "")) ) { // if automatic insertion of subject is enabled
					this.insertSubject(unescape(defltSubject.defaultSubject)); // inserts default subject into subject textbox
				}
			}
		}
	}
};

/**
 * Enables or disables autocompletion for subject textbox
 *
 * @param state (boolean) true/false if subject box autocompletion has to be enabled/disabled
 */
SubjectManager.enableSubjectTextBoxAutoComplete = function (state)
{
	var subjectTextBox = document.getElementById("msgSubject");
	var currentSubject = "";

	if ( subjectTextBox != null ) { // (JSCTSABT)
		currentSubject = subjectTextBox.value; // backups current subject

		if ( state ) { // if subject box autocompletion has to be enabled
			subjectTextBox.setAttribute('type', "autocomplete");
			subjectTextBox.tabScrolling = true;
			subjectTextBox.maxRows = 5;
			subjectTextBox.setAttribute('autocompletesearch', "subjectmanager-autocompletion");
			subjectTextBox.setAttribute('minheight', "20");
		}
		else { // if subject box autocompletion has to be disabled
			subjectTextBox.removeAttribute('type');
			subjectTextBox.removeAttribute('tabScrolling');
			subjectTextBox.removeAttribute('maxRows');
			subjectTextBox.removeAttribute('autocompletesearch');
			subjectTextBox.removeAttribute('autocompletesearchparam');
			subjectTextBox.removeAttribute('minheight');
		}

		this.subjectBoxAutoCompleteEnabled = state;

		subjectTextBox.setAttribute('value', currentSubject); // restores backuped subject
	}
};

/**
 * Updates subjects list
 */
SubjectManager.updateSubjectsList = function ()
{
	if ( this.subjectsListChanged ) { // if subjects list has been changed
		var subjectsListMenuPopUp = document.getElementById("subjectManagerSubjectsListMenuPopUp"); // menu of toolbar button
		var nativeComposeCommands = document.getElementById("composeCommands"); // native composer commands
		var subjectBoxButtonMenuPopUp = document.getElementById("subjectManagerSubjectBoxButtonMenuPopUp"); // menu of subject box button
		var subjectTextBox = document.getElementById("msgSubject"); // subject textbox

		if ( ((subjectsListMenuPopUp != null) && (nativeComposeCommands != null))
			 || (subjectBoxButtonMenuPopUp != null)
			 || ((subjectTextBox != null) && this.subjectBoxAutoCompleteEnabled) )
		{ // (JSCTSABT)
			if ( this.subjectBoxAutoCompleteEnabled ) { // if subject textbox autocompletion is enabled
				var autoCompletionArray = new Array();
			}

			// clearance of existing items
			if ( subjectsListMenuPopUp != null ) { // if toolbar button is displayed
				while ( subjectsListMenuPopUp.firstChild != null ) { // while there is a first element in subjects list
					subjectsListMenuPopUp.removeChild(subjectsListMenuPopUp.firstChild); // removes the first element (then the former 2nd one becomes the 1st)
				}
			}

			if ( subjectBoxButtonMenuPopUp != null ) { // if subject box button is displayed
				while ( subjectBoxButtonMenuPopUp.firstChild != null ) { // while there is a first element in subject box button
					subjectBoxButtonMenuPopUp.removeChild(subjectBoxButtonMenuPopUp.firstChild); // removes the first element (then the former 2nd one becomes the 1st)
				}

				// creation and insertion of 'Add subject' menuitem
				var addMenuItem = document.createElement("menuitem"); // creates a new menuitem
				addMenuItem.setAttribute('label', document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem1Label')); // sets menuitem label
				addMenuItem.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem1Tooltip');
				addMenuItem.addEventListener("command", function() { SubjectManager.addSubject(); }, false); // sets menuitem command
				subjectBoxButtonMenuPopUp.appendChild(addMenuItem);

				// creation and insertion of 'Clear subject' menuitem
				var clearMenuItem = document.createElement("menuitem"); // creates a new menuitem
				clearMenuItem.setAttribute('label', document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem2Label')); // sets menuitem label
				clearMenuItem.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem2Tooltip');
				clearMenuItem.addEventListener("command", function() { SubjectManager.clearSubject(); }, false); // sets menuitem command
				subjectBoxButtonMenuPopUp.appendChild(clearMenuItem);

				// creation and insertion of 'Update subject' menuitem
				var updateMenuItem = document.createElement("menuitem"); // creates a new menuitem
				updateMenuItem.setAttribute('id', "subjectManagerUpdateSubjectButton"); // sets menuitem id
				updateMenuItem.setAttribute('label', document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Label')); // sets menuitem label
				updateMenuItem.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Tooltip');
				updateMenuItem.addEventListener("command", function() { SubjectManager.updateCurrentSubject(); }, false); // sets menuitem command
				subjectBoxButtonMenuPopUp.appendChild(updateMenuItem);

				var separatorMenuItem = document.createElement("menuseparator"); // creates a new menuitem
				subjectBoxButtonMenuPopUp.appendChild(separatorMenuItem);
			}

			// extraction of subjects list
			if ( this.subjectsList == "" ) { // if subjects list is empty
				this.subjectsArray = new Array();
			}
			else {
				this.subjectsArray = this.unescapeArray(this.subjectsList.split(new RegExp(this.subjectsListSeparator, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects
			}

			// filling of subjects lists
			var subjectCommand = null;
			var buttonMenuItem = null;
			var buttonMenuItem2 = null;

			for ( var idx = 0 ; idx < this.subjectsArray.length ; idx++ ) { // for each subject
				if ( nativeComposeCommands != null ) {
					// creation of a command
					subjectCommand = document.createElement("command");
					subjectCommand.setAttribute('id', "subjectManagerSubjectCmd" + idx);
					subjectCommand.addEventListener("command", function() { SubjectManager.onSubjectPicked(this.id); }, false); // sets menuitem command

					nativeComposeCommands.appendChild(subjectCommand); // appends command to native composer commands

					// creation of a menuitem
					buttonMenuItem = document.createElement("menuitem"); // creates a new menuitem
					buttonMenuItem.setAttribute('label', this.subjectsArray[idx]); // sets subject as menuitem label
					buttonMenuItem.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectMenuItemTooltip'); // sets tooltip text
					buttonMenuItem.setAttribute('command', "subjectManagerSubjectCmd" + idx); // sets related command

					// filling of context menu of toolbar button
					if ( subjectsListMenuPopUp != null ) { // if toolbar button is displayed
						subjectsListMenuPopUp.appendChild(buttonMenuItem); // appends new menuitem to button context menu
					}

					// filling of context menu of subject box button
					if ( subjectBoxButtonMenuPopUp != null ) { // if subject box button is displayed
						buttonMenuItem2 = buttonMenuItem.cloneNode(true); // creates a cloned menuitem

						subjectBoxButtonMenuPopUp.appendChild(buttonMenuItem2); // appends new menuitem to subject box button
					}
				}

				// filling of autocomplete search of subject textbox
				if ( this.subjectBoxAutoCompleteEnabled ) { // if subject textbox autocompletion is enabled
					autoCompletionArray.push("{\"value\":\"" + escape(this.subjectsArray[idx]) + "\"}"); // adds encoded subject to autocompletion list
				}
			}

			if ( this.subjectBoxAutoCompleteEnabled ) { // if subject textbox autocompletion is enabled
				subjectTextBox.setAttribute('autocompletesearchparam', "[" + autoCompletionArray.join(",") + "]"); // initializes autocompletion strings

				this.localConsole.logInformation("updateSubjectsList", "[" + autoCompletionArray.join(",") + "]");
			}

			this.subjectsListChanged = false; // marks subjects list as unchanged

			this.localConsole.logInformation("updateSubjectsList", "Subjects list has been updated");
		}
	}
};

/**
 * Adds picked subject to subject textbox
 *
 * @param pickedSubject (string) picked subject
 */
SubjectManager.onSubjectPicked = function (pickedSubjectRef)
{
	// gets index of picked subject
	// '[^0-9]+': anything but a figure 1 or several times
	// '([0-9]+)': 1 number (index) -> group #1
	// '$': end of string
	var pickedSubjectIdx = pickedSubjectRef.match(new RegExp("^[^0-9]+([0-9]+)$"));
	var subjectTextBox = document.getElementById("msgSubject");

	if ( (pickedSubjectIdx != null) && (subjectTextBox != null) ) { // if picked subject exists and subject textbox exists (JSCTSABT)
		var idx = pickedSubjectIdx[1];
		var pickedSubject = this.subjectsArray[idx];

		this.insertSubject(pickedSubject); // inserts picked subject into subject textbox

		if ( this.focusEmailBodyOnceSubjectPicked ) { // if email body has to be focused
			var bodyTextBox = document.getElementById("content-frame");

			if ( bodyTextBox != null ) { // (JSCTSABT)
				bodyTextBox.focus(); // focuses body
			}
		}
		else {
			subjectTextBox.focus();
		}
	}
};

/**
 * Builds subject
 *
 * @param unparsedSubject (string) subject to parse
 * @return (string) parsed subject
 */
SubjectManager.buildSubject = function (unparsedSubject)
{
	var subject = unparsedSubject;

	this.globalCounterInserted = false;
	this.individualCounterInserted = false;

	// parsing of picked subject
	subject = this.parseSubjectPt10(subject, this.subjectsAdvancedMode); // parses date/time metadata
	subject = this.parseSubjectPt22(subject, this.subjectsAdvancedMode); // parses counters metadata
	subject = this.parseSubjectPt40(subject, this.subjectsAdvancedMode); // cleans metadata

	return subject;
};

/**
 * Finalizes subject
 *
 * @param unfinalizedSubject (string) subject to finalize
 * @return (string) finalized subject
 */
SubjectManager.finalizeSubject = function (unfinalizedSubject)
{
	var subjectTextBox = document.getElementById("msgSubject");

	var finalizedSubject = unfinalizedSubject;

	if ( (subjectTextBox != null) && (unfinalizedSubject != "") ) { // (JSCTSABT)
		// finalization of picked subject
		switch ( this.subjectPickedBehaviour ) {
			case 1: // appends to the beginning
				var prefixPart = subjectTextBox.value.substring(0, this.insertionPoint); // gets prefix part
				var subjectPart = subjectTextBox.value.substring(this.insertionPoint); // gets subject part

				if ( this.subjectPickedBeginningEnd ) { // if subject has to be appended to the end of previous picked subject
					finalizedSubject = prefixPart + unfinalizedSubject + subjectPart;
				}
				else { // if subject has to be appended to the beginning of previous picked subject (= beginning of the whole subject)
					finalizedSubject = unfinalizedSubject + prefixPart + subjectPart;
				}

				this.insertionPoint = prefixPart.length + unfinalizedSubject.length; // updates new insertion point
				break;

			case 2: // appends to the end
				var subjectPart = subjectTextBox.value.substring(0, subjectTextBox.value.length - this.insertionPoint); // gets subject part
				var suffixPart = subjectTextBox.value.substring(subjectTextBox.value.length - this.insertionPoint); // gets suffix part

				if ( this.subjectPickedEndBeginning ) { // if subject has to be appended to the beginning of previous picked subject
					finalizedSubject = subjectPart + unfinalizedSubject + suffixPart;
				}
				else { // if subject has to be appended to the end of previous picked subject (= end of the whole subject)
					finalizedSubject = subjectPart + suffixPart + unfinalizedSubject;
				}

				this.insertionPoint = unfinalizedSubject.length + suffixPart.length; // updates new insertion point
				break;

			default: // replaces (and all other values)
				finalizedSubject = unfinalizedSubject;
		}
	}

	return finalizedSubject;
};

/**
 * Inserts given subject into subject textbox
 *
 * @param subject (string) subject to insert
 */
SubjectManager.insertSubject = function (subject)
{
	var subjectTextBox = document.getElementById("msgSubject");

	// backup of unparsed subject
	this.unparsedSubject = subject;

	switch ( this.subjectPickedBehaviour ) {
		case 1: // appends to the beginning
			var prefixPart = subjectTextBox.value.substring(0, this.insertionPoint); // gets prefix part
			var subjectPart = subjectTextBox.value.substring(this.insertionPoint); // gets subject part

			if ( this.subjectPickedBeginningEnd ) { // if subject has to be appended to the end of previous picked subject
				this.unparsedSubject = prefixPart + subject + subjectPart;
			}
			else { // if subject has to be appended to the beginning of previous picked subject (= beginning of the whole subject)
				this.unparsedSubject = subject + prefixPart + subjectPart;
			}
			break;

		case 2: // appends to the end
			var subjectPart = subjectTextBox.value.substring(0, subjectTextBox.value.length - this.insertionPoint); // gets subject part
			var suffixPart = subjectTextBox.value.substring(subjectTextBox.value.length - this.insertionPoint); // gets suffix part

			if ( this.subjectPickedEndBeginning ) { // if subject has to be appended to the beginning of previous picked subject
				this.unparsedSubject = subjectPart + subject + suffixPart;
			}
			else { // if subject has to be appended to the end of previous picked subject (= end of the whole subject)
				this.unparsedSubject = subjectPart + suffixPart + subject;
			}
			break;

		default: // replaces (and all other values)
			this.unparsedSubject = subject;
	}

	// insertion of subject
	if ( (subjectTextBox != null) && (subject != "") ) { // (JSCTSABT)
		// analysis and building of subject
		subject = this.buildSubject(subject);
		subject = this.finalizeSubject(subject);

		// insertion of picked subject
		subjectTextBox.value = subject;

		SetComposeWindowTitle(); // updates compose window title

		// update of tooltiptext of update menuitem
		var updateSubjectButton = document.getElementById("subjectManagerUpdateSubjectButton"); // label

		if ( updateSubjectButton != null ) { // (JSCTSABT)
			updateSubjectButton.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Tooltip') + ": " + subject;
		}
		else {
			// tooltip text of update menuitem is updated in another thread using a timer with a delay of 0 milliseconds
			// this trick allows the GUI to be refreshed at first start, when composing dialog is not fully initialized yet
			var updTimer = Components.classes["@mozilla.org/timer;1"]
							.createInstance(Components.interfaces.nsITimer);
			updTimer.initWithCallback(new SubjectManager.UpdateMenuItemTooltipTextTimer(updTimer, subject), 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT); // programs
		}
	}
};

/**
 * Adds current subject to subjects list
 */
SubjectManager.addSubject = function ()
{
	var subjectTextBox = document.getElementById("msgSubject");

	if ( subjectTextBox != null ) { // (JSCTSABT)
		var newSubject = subjectTextBox.value;
		var tmpNewSubject = ( this.subjectsListCaseSensitive ) ? newSubject : newSubject.toLowerCase(); // makes necessary changes if 'case-sensitive' mode is enabled

		if ( newSubject != "" ) { // if new subject is not empty
			var found = false;

			for ( var idx in this.subjectsArray ) { // for each subject of subjects list
				var tmpSubject = ( this.subjectsListCaseSensitive ) ? this.subjectsArray[idx] : this.subjectsArray[idx].toLowerCase(); // makes necessary changes if 'case-sensitive' mode is enabled
				if ( tmpSubject == tmpNewSubject ) { // if new subject is the same as an existing subject
					found = true;
				}
			}

			// update of subjects list
			if ( !found ) { // if new subject has not been found in subjects list
				this.subjectsArray.push(newSubject); // adds new subject to subjects array

				// creation of subjects string
				this.subjectsList = this.escapeArray(this.subjectsArray).join(this.subjectsListSeparator); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string
				this.prefs.setCharPref("subjectsList", this.subjectsList); // saves subjects list in preferences

				this.localConsole.logInformation("addSubject", "Subject '" + newSubject + "' has been added to subjects list");
				this.localConsole.logInformation("addSubject", "Subjects list has been modified: " + this.subjectsList);

				this.subjectsListChanged = true; // marks subjects list as 'dirty'
				this.updateSubjectsList(); // updates subjects list
			}
			else {
				this.localConsole.logWarning("addSubject", "Subject '" + newSubject + "' already exists in subjects list");
			}
		}
	}
};

/**
 * Clears subject field
 */
SubjectManager.clearSubject = function ()
{
	var subjectTextBox = document.getElementById("msgSubject");

	if ( subjectTextBox != null ) { // (JSCTSABT)
		subjectTextBox.value = ""; // clears current subject
		this.insertionPoint = 0; // re-initializes insertion point
	}
};

/**
 * Updates subject field
 */
SubjectManager.updateCurrentSubject = function ()
{
	var subjectTextBox = document.getElementById("msgSubject");

	if ( (subjectTextBox != null) && (this.unparsedSubject != "") ) { // (JSCTSABT)
		// analysis and building of subject
		subject = this.buildSubject(this.unparsedSubject);

		// insertion of picked subject
		subjectTextBox.value = subject;

		SetComposeWindowTitle(); // updates compose window title

		// update of tooltiptext of update menuitem
		var updateSubjectButton = document.getElementById("subjectManagerUpdateSubjectButton"); // label
		if ( updateSubjectButton != null ) { // (JSCTSABT)
			updateSubjectButton.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Tooltip') + ": " + subject;
		}
	}
};

/**
 * Handles removal of automatic prefixes from current subject
 */
SubjectManager.launchRemovePrefixes = function ()
{
	var subjectTextBox = document.getElementById("msgSubject");

	var prefixFound = "";
	var firstPrefixFound = "";
	var tmpString = "";

	do {
		prefixFound = ""; // re-initializes found prefix

		if ( this.includeReplyPrefixes ) { // if 'Reply' prefixes have to be removed
			tmpString = this.removePrefixes(this.replyPrefixesList); // removes 'Reply' prefixes

			if ( tmpString != "" ) { // if at least one prefix was removed
				prefixFound = tmpString; // backups found prefix

				if ( firstPrefixFound == "" ) { // if first found prefix has not been set
					if ( this.replace1stReplyPrefix ) {
						firstPrefixFound = this.replyReplacementPrefix;
					}
					else {
						firstPrefixFound = prefixFound; // sets first found prefix
					}
				}
			}
		}

		if ( this.includeForwardPrefixes ) { // if 'Forward' prefixes have to be removed
			tmpString = this.removePrefixes(this.forwardPrefixesList); // removes 'Forward' prefixes

			if ( tmpString != "" ) { // if at least one prefix was removed
				prefixFound = tmpString; // backups found prefix

				if ( firstPrefixFound == "" ) { // if first found prefix has not been set
					if ( this.replace1stForwardPrefix ) {
						firstPrefixFound = this.forwardReplacementPrefix;
					}
					else {
						firstPrefixFound = prefixFound; // sets first found prefix
					}
				}
			}
		}

		if ( this.includeOtherPrefixes ) { // if other prefixes have to be removed
			tmpString = this.removePrefixes(this.otherPrefixesList); // removes other prefixes

			if ( tmpString != "" ) { // if at least one prefix was removed
				prefixFound = tmpString; // backups found prefix

				if ( firstPrefixFound == "" ) { // if first found prefix has not been set
					firstPrefixFound = prefixFound; // sets first found prefix
				}
			}
		}
	}
	while ( prefixFound != "" ); // repeats while a prefix has been found

	if ( (subjectTextBox != null) && this.keep1stPrefix && (firstPrefixFound != "") ) { // if first found prefix has to be kept
		subjectTextBox.value = firstPrefixFound + " " + subjectTextBox.value; // re-sets it
	}
};

/**
 * Removes given prefixes from current subject
 *
 * @param prefixesList (string) prefixes list to remove
 * @return (string) first prefix found
 */
SubjectManager.removePrefixes = function (prefixesList)
{
	var subjectTextBox = document.getElementById("msgSubject");
	var firstPrefixFound = "";

	// removal of automatic prefixes
	if ( (subjectTextBox != null) && (prefixesList != "") ) { // if prefixes list is not empty
		var foundPrefix = false;
		var currentSubject = subjectTextBox.value;

		try {
			prefixesList = prefixesList.replace(new RegExp("^\\s+", "g"), ""); // removes leading spaces if any (nb: trim() cannot be used under TB < v3)
			prefixesList = prefixesList.replace(new RegExp("\\s+$", "g"), ""); // removes trailing spaces if any (nb: trim() cannot be used under TB < v3)

			prefixesList = prefixesList.replace(new RegExp("^\\?\\?", "g"), ""); // removes leading '??' if any
			prefixesList = prefixesList.replace(new RegExp("\\?\\?$", "g"), ""); // removes trailing '??' if any

			var prefixes = prefixesList.split(new RegExp("\\?\\?", "g")); // splits auto prefixes list around double question mark into separated prefix strings array

			if ( prefixesList != "" ) {
				foundPrefix = true;
			}

			while ( foundPrefix ) { // while an automatic prefix has been found
				foundPrefix = false;

				for ( var idx = 0 ; (idx < prefixes.length) && !foundPrefix ; idx++ ) { // for each prefix and while no prefix has been found
					if ( currentSubject.match(new RegExp("^" + prefixes[idx], "gi")) != null ) { // if prefix can be found into subject
						foundPrefix = true;
						currentSubject = currentSubject.replace(new RegExp("^" + prefixes[idx], "gi"), "");
						currentSubject = currentSubject.replace(new RegExp("^\\s+", "g"), ""); // removes leading spaces if any (nb: trim() cannot be used under TB < v3)

						this.localConsole.logInformation("removePrefixes", "Prefix '" + prefixes[idx] + "' has been found and has been removed (New subject: '" + currentSubject + "')");

						if ( firstPrefixFound == "" ) { // if first prefix has not been set
							firstPrefixFound = prefixes[idx]; // backups first prefix found
						}
					}
				}
			}

			subjectTextBox.value = currentSubject; // updates subject
		}
		catch (err) {
			this.localConsole.logError("removePrefixes", err);
		}
	}

	return firstPrefixFound;
};

/**
 * Sends message
 *
 * @param msgType (nsIMsgCompDeliverMode) message type while sending
 * @param sending (boolean) sending flag
 * @param saving (boolean) saving flag
 */
SubjectManager.handlePreTreatmentMessageSending = function (msgType, sending, saving)
{
	var globalCounterUpdated = false;

	var globalCounterSettingsObj = JSON.parse(this.globalCounterSettings);
	var globalCounterSettings = globalCounterSettingsObj['global'];

	if ( this.globalCounterInserted ) { // if 'global counter' flag has been enabled
		if ( (sending && ((globalCounterSettings.update & 1) == 1))
				|| (saving && ((globalCounterSettings.update & 2) == 2)) )
		{
			globalCounterUpdated = true;
		}
	}

	if ( this.individualCounterInserted ) { // if 'individual counter' flag has been enabled
		if ( (sending && ((this.individualCountersSettingsObjTmp[this.accountKeyTmp].update & 1) == 1)) // if 'update when sending' flag has been set
			  || (saving && ((this.individualCountersSettingsObjTmp[this.accountKeyTmp].update & 2) == 2)) ) // or if 'update when saving' flag has been set
		{
			this.individualCountersSettings = JSON.stringify(this.individualCountersSettingsObjTmp);
			this.prefs.setCharPref("individualCountersSettings", this.individualCountersSettings); // saves individual counters values

			if ( (globalCounterSettings.update & 4) == 4 ) { // if 'update global counter when updating any individual counter' flag has been set
				globalCounterUpdated = true;
			}
		}
	}

	// update of global counter
	if ( globalCounterUpdated ) {
		globalCounterSettings.value++; // increments counter
		this.prefs.setCharPref("globalCounterSettings", JSON.stringify(globalCounterSettingsObj)); // saves global counter value
	}

	SubjectManager.DefaultGenericSendMessage(msgType); // sends message
};

/**
 * Cleans GUI
 */
SubjectManager.cleanGUI = function ()
{
	var updateSubjectButton = document.getElementById("subjectManagerUpdateSubjectButton"); // label

	if ( updateSubjectButton != null ) { // (JSCTSABT)
		updateSubjectButton.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Tooltip');
	}
};

/**
 * Finishes add-on execution
 */
SubjectManager.shutdown = function ()
{
	this.prefs.removeObserver("", this);
};


/**
 * (class) Manages behaviour when timer has expired
 *
 * @param timer (nsITimer) timer object which has expired
 * @param subject (string) subject
 */
SubjectManager.UpdateMenuItemTooltipTextTimer = function (timer, subject)
{
	// handles behaviour when timer has expired (overriding of inherited method from nsITimer interface)
	this.notify = function (timer) {
		var updateSubjectButton = document.getElementById("subjectManagerUpdateSubjectButton"); // label

		if ( updateSubjectButton != null ) { // (JSCTSABT)
			updateSubjectButton.tooltipText = document.getElementById("subjectManagerStringBundle").getString('subjectBoxButtonMenuItem3Tooltip') + ": " + subject;
		}
	}
};

/**
 * Overrides default behaviour when sending message
 *
 * @param msgType (nsIMsgCompDeliverMode) message type while sending
 */
SubjectManager.DefaultGenericSendMessage = GenericSendMessage;

GenericSendMessage = function (msgType)
{
	switch ( msgType ) {
		case Components.interfaces.nsIMsgCompDeliverMode.Now: // (0)
		case Components.interfaces.nsIMsgCompDeliverMode.Later: // (1)
		case Components.interfaces.nsIMsgCompDeliverMode.Background: // (8)
			SubjectManager.handlePreTreatmentMessageSending(msgType, true, false);
			break;
		case Components.interfaces.nsIMsgCompDeliverMode.SaveAsDraft: // (4)
		case Components.interfaces.nsIMsgCompDeliverMode.SaveAsTemplate: // (5)
		case Components.interfaces.nsIMsgCompDeliverMode.AutoSaveAsDraft: // (7)
			SubjectManager.handlePreTreatmentMessageSending(msgType, false, true);
			break;
		//case nsIMsgCompDeliverMode.Save: // (2)
		//case nsIMsgCompDeliverMode.SaveAs: // (3)
		//case nsIMsgCompDeliverMode.SendUnsent: // (6)
		default: // all other ways of "sending a message"
			SubjectManager.DefaultGenericSendMessage(msgType);
			break;
	}
};


window.addEventListener("load", function() { SubjectManager.initializeComposerOverLayStartup(); }, false);
window.addEventListener("unload", function() { SubjectManager.shutdown(); }, false);
window.addEventListener("compose-window-init", function() { SubjectManager.initializeComposingSession(); }, true);
window.addEventListener("compose-window-close", function() { SubjectManager.cleanGUI(); }, true);
