
let subjectManagerOptionsStringBundle = Services.strings.createBundle("chrome://SubjectManager/locale/options.properties");
let subjectManagerStringBundle = Services.strings.createBundle("chrome://SubjectManager/locale/SubjectManager.properties");

//let stringProp = bundle.GetStringFromName("...");



Preferences.addAll([
	{id: "extensions.SubjectManager.subjectsListCaseSensitive", type: "bool"},
	{id: "extensions.SubjectManager.subjectsAdvancedMode", type: "bool"},
	{id: "extensions.SubjectManager.subjectPickedBehaviour", type: "int"},
	{id: "extensions.SubjectManager.subjectPickedBeginningEnd", type: "bool"},
	{id: "extensions.SubjectManager.subjectPickedEndBeginning", type: "bool"},
	{id: "extensions.SubjectManager.handleSubjectsIdentities", type: "bool"},
	{id: "extensions.SubjectManager.handleCounterIdentities", type: "bool" },
	{id: "extensions.SubjectManager.removeAutoPrefixes", type: "bool"},
	{id: "extensions.SubjectManager.includeReplyPrefixes", type: "bool"},
	{id: "extensions.SubjectManager.includeForwardPrefixes", type: "bool"},
	{id: "extensions.SubjectManager.includeOtherPrefixes", type: "bool"},
	{id: "extensions.SubjectManager.keep1stPrefix", type: "bool"},
	{id: "extensions.SubjectManager.replace1stReplyPrefix", type: "bool"},
	{id: "extensions.SubjectManager.replace1stForwardPrefix", type: "bool"},
	{id: "extensions.SubjectManager.subjectBoxAutoCompleteEnabled", type: "bool"},
	{id: "extensions.SubjectManager.focusEmailBodyOnceSubjectPicked", type: "bool"},
	{id: "extensions.SubjectManager.debugMode", type: "bool"},
	{id: "extensions.SubjectManager.debugModeToFile", type: "bool"},
	{id: "extensions.SubjectManager.subjectsList", type: "string"},
	{id: "extensions.SubjectManager.subjectsListSeparator", type: "string"},
	{id: "extensions.SubjectManager.defaultSubjects", type: "string"},
	{id: "extensions.SubjectManager.globalCounterSettings", type: "string"},
	{id: "extensions.SubjectManager.individualCountersSettings", type: "string"},
	{id: "extensions.SubjectManager.replyPrefixesList", type: "string"},
	{id: "extensions.SubjectManager.forwardPrefixesList", type: "string"},
	{id: "extensions.SubjectManager.otherPrefixesList", type: "string"},
	{id: "extensions.SubjectManager.replyReplacementPrefix", type: "string"},
	{id: "extensions.SubjectManager.forwardReplacementPrefix", type: "string"},
	{id: "extensions.SubjectManager.filterSubjectsSettings", type: "string"},
	{id: "extensions.SubjectManager.subjectBoxAutoCompleteCaseSensitive", type: "bool"},
	{id: "extensions.SubjectManager.subjectBoxButtonEnabled", type: "bool"},
	{id: "extensions.SubjectManager.subjectBoxButtonLabelReplaced", type: "bool"},
	{id: "extensions.SubjectManager.debugFileName", type: "string"},
	{id: "extensions.SubjectManager.subjectsListChanged", type: "bool"},
	
	{id: "extensions.SubjectManager.", type: "bool"},
	{id: "extensions.SubjectManager.", type: "bool"},
	{id: "extensions.SubjectManager.", type: "bool"},
	{id: "extensions.SubjectManager.", type: "bool"},
	{id: "extensions.SubjectManager.", type: "bool"},
	{id: "extensions.SubjectManager.", type: "string"},
	
	

	// dialog items
	
	{id: "extensions.SubjectManager.subjectAddButton", oncommand: "onClickSubjectAddButton();"},
	{id: "extensions.SubjectManager.subjectsListBox", onselect: "onSelectSubject();" },
	{id: "extensions.SubjectManager.subjectEditButton", oncommand: "onClickSubjectModifyButton();"},
	{id: "extensions.SubjectManager.subjectUpButton", oncommand: "onClickSubjectUpButton();"},
	{id: "extensions.SubjectManager.subjectDownButton", oncommand: "onClickSubjectDownButton();"},
	{id: "extensions.SubjectManager.sortSubjectsButton", oncommand: "onClickSortSubjectsButton();"},
	{id: "extensions.SubjectManager.subjectRemoveButton", oncommand: "onClickSubjectRemoveButton();"},
	{id: "extensions.SubjectManager.subjectsAdvancedModeCheckBox", oncommand: "onClickSubjectsAdvancedModeCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.subjectsAdvancedModeHelpButton", oncommand: "onClickSubjectsAdvancedModeHelpButton();"},
	
	{id: "extensions.SubjectManager.subjectPickedRadioGroup", oncommand: "onClickSubjectPickedRadioGroup();"},
	
	{id: "extensions.SubjectManager.handleSubjectsIdentitiesCheckBox", oncommand: "onClickHandleSubjectsIdentitiesCheckBox(this.checked);"},
	
	{id: "extensions.SubjectManager.defaultSubjectsListBox", onselect=: "onSelectDefaultSubject();", ondblclick: "onSelectDefaultSubject();"},
	{id: "extensions.SubjectManager.updateDefaultSubjectButton", oncommand: "onClickUpdateDefaultSubjectButton();"},
	{id: "extensions.SubjectManager.globalCounterFormatHelpButton", oncommand: "onClickCounterFormatHelpButton(this.id);"},
	
	{id: "extensions.SubjectManager.handleCounterIdentitiesCheckBox", oncommand: "onClickHandleCounterIdentitiesCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.individualCountersListBox", onselect: "onSelectIndividualCounter();", ondblclick: "onSelectIndividualCounter();" },
	{id: "extensions.SubjectManager.individualCounterFormatHelpButton", oncommand: "onClickCounterFormatHelpButton(this.id);"},
	{id: "extensions.SubjectManager.updateIndividualCounterButton", oncommand: "onClickUpdateIndividualCounterButton();"},
	{id: "extensions.SubjectManager.replyPrefixesCheckBox", oncommand: "onClickReplyPrefixesCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.replyPrefixesListHelpButton", oncommand: "prefixesHelpButton(this.id);" },
	{id: "extensions.SubjectManager.forwardPrefixesCheckBox", oncommand: "onClickForwardPrefixesCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.forwardPrefixesListHelpButton", oncommand: "prefixesHelpButton(this.id);"},
	{id: "extensions.SubjectManager.otherPrefixesListCheckBox", oncommand: "onClickOtherPrefixesCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.otherPrefixesListHelpButton", oncommand: "prefixesHelpButton(this.id);"},
	{id: "extensions.SubjectManager.keep1stPrefixCheckBox", oncommand: "onClickKeep1stPrefixCheckBox(this.checked);" },
	{id: "extensions.SubjectManager.1stReplyPrefixReplacementCheckBox", oncommand: "onClick1stReplyPrefixReplacementCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.1stForwardPrefixReplacementCheckBox", oncommand: "onClick1stForwardPrefixReplacementCheckBox(this.checked);"},
	
	{id: "extensions.SubjectManager.prefixesHelpButton", oncommand: "prefixesInfoHelpButton();"},
	{id: "extensions.SubjectManager.selectAllFiltersCheckBox", oncommand: "onClickSelectAllFiltersCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.allFiltersButton", oncommand: "onClickAllFiltersButton();"},
	{id: "extensions.SubjectManager.filtersSubjectsHelpButton", oncommand: "filtersSubjectsInfoHelpButton();"},
	{id: "extensions.SubjectManager.subjectBoxAutoCompleteEnabledCheckBox", oncommand: "onClickSubjectBoxAutoCompleteEnabledCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.subjectBoxButtonEnabledCheckBox", oncommand: "onClickSubjectBoxButtonEnabledCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.exportProfilesButton", oncommand: "onClickExportSubjectsButton();"},
	{id: "extensions.SubjectManager.importProfilesButton", oncommand: "onClickImportSubjectsButton();"},
	
	{id: "extensions.SubjectManager.debugModeCheckBox", oncommand: "onClickDebugModeCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.debugModeToFileCheckBox", oncommand: "onClickDebugModeToFileCheckBox(this.checked);"},
	{id: "extensions.SubjectManager.debugModeToFile", oncommand: "onClickDebugModeToFileButton();"},
	{id: "extensions.SubjectManager.resetDefaultsButton", oncommand: "onClickResetDefaultsButton();"},
	{id: "extensions.SubjectManager.exportSettingsButton", oncommand: "onClickExportSettingsButton();" },
	{id: "extensions.SubjectManager.reInitAutoCompletionButton", oncommand: "onClickReInitAutoCompleteButton();"},
	
	//{id: "extensions.SubjectManager.", oncommand: },
	//{id: "extensions.SubjectManager.", oncommand: },
	//{id: "extensions.SubjectManager.", oncommand: },
	
	
	
]);



										