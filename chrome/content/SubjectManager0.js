if ( !SubjectManager ) var SubjectManager = {};

// JSCTSABT: Just Some Checks, This Should Always Be True

/**********
 * Add-on constants
 */

SubjectManager.PR_RDONLY		= 0x01;
SubjectManager.PR_WRONLY		= 0x02;
SubjectManager.PR_RDWR			= 0x04;
SubjectManager.PR_CREATE_FILE	= 0x08;
SubjectManager.PR_APPEND		= 0x10;
SubjectManager.PR_TRUNCATE		= 0x20;
SubjectManager.PR_SYNC			= 0x40;
SubjectManager.PR_EXCL			= 0x80;


/**
 * (class) Allows to use error console embedded in Mozilla apps
 */
SubjectManager.Console = function ()
{
	this.console = Components.classes["@mozilla.org/consoleservice;1"]
					.getService(Components.interfaces.nsIConsoleService);

	/**
	 * Adds 0-padding of given length to given number
	 *
	 * @param number (integer) number to format
	 * @param formatLength (integer) length of 0-padding to add
	 * @return (string) formatted number as string
	 */
	this.formatNumber = function (number, formatLength) {
		var paddingStr = "";
		var nmbrStr = "";
		var paddingLength = formatLength - number.toString().length;

		for ( var idx = 0 ; idx < paddingLength ; idx++ ) {
			paddingStr += "0";
		}
		nmbrStr = paddingStr + number.toString();

		return nmbrStr;
	}

	/**
	 * Formats date
	 *
	 * @param dt (Date object) date/time to format
	 * @return (string) formatted date as string
	 */
	this.formatDate = function (dt) {
		return dt.getFullYear() + "-" + this.formatNumber(dt.getMonth() + 1, 2) + "-" + this.formatNumber(dt.getDate(), 2);
	}

	/**
	 * Formats time
	 *
	 * @param dt (Date object) date/time to format
	 * @return (string) formatted time as string
	 */
	this.formatTime = function (dt) {
		return this.formatNumber(dt.getHours(), 2) + ":" + this.formatNumber(dt.getMinutes(), 2) + ":" + this.formatNumber(dt.getSeconds(), 2) + "." + this.formatNumber(dt.getMilliseconds(), 3);
	}

	/**
	 *
	 */
	this.logInformation = function (source, message, forceFlag) {
		forceFlag = ( typeof(forceFlag) !== "undefined" ) ? forceFlag : false;

		if ( SubjectManager.debugMode || forceFlag ) {
			var dt = new Date();
			var dateTime = this.formatDate(dt) + " " + this.formatTime(dt);

			this.console.logStringMessage(dateTime + " [" + SubjectManager.addOnName + "." + source + "]: " + message);
			SubjectManager.writeMessageToFile("Information;" + dateTime + ";" + source + ";" + message);
		}
	}

	/**
	 *
	 */
	this.logError = function (source, message, noForceFlag) {
		noForceFlag = ( typeof(noForceFlag) !== "undefined" ) ? noForceFlag : true;

		var error = Components.classes["@mozilla.org/scripterror;1"]
						.createInstance(Components.interfaces.nsIScriptError);
		var dt = new Date();
		var dateTime = this.formatDate(dt) + " " + this.formatTime(dt);

		error.init(dateTime + " [" + SubjectManager.addOnName + "." + source + "]: " + message, "", null, null, null, Components.interfaces.nsIScriptError.errorFlag, null);

		this.console.logMessage(error);

		if ( noForceFlag ) {
			SubjectManager.writeMessageToFile("Error;" + dateTime + ";" + source + ";" + message);
		}
	}

	/**
	 *
	 */
	this.logWarning = function (source, message) {
		var warning = Components.classes["@mozilla.org/scripterror;1"]
						.createInstance(Components.interfaces.nsIScriptError);
		var dt = new Date();
		var dateTime = this.formatDate(dt) + " " + this.formatTime(dt);

		warning.init(dateTime + " [" + SubjectManager.addOnName + "." + source + "]: " + message, "", null, null, null, Components.interfaces.nsIScriptError.warningFlag, null);

		this.console.logMessage(warning);
		SubjectManager.writeMessageToFile("Warning;" + dateTime + ";" + source + ";" + message);
	}
};


/**
 * (class) Holds information about default subject
 *
 * @param defaultSubject (object/string) default subject object / default subject for current account
 * @param onlyIfEmpty (boolean) true/false if default subject is/is not inserted only if subject is empty
 * @param onOff (boolean) true/false if default subject is enabled/disabled
 */
SubjectManager.DefaultSubject = function (objDefaultSubject, onlyIfEmpty, onOff)
{
	if ( typeof(objDefaultSubject) === 'object' ) { // if first parameter is an object (in this case this should be the one and only parameter)
		this.defaultSubject = objDefaultSubject.defaultSubject;
		this.onlyIfEmpty = objDefaultSubject.onlyIfEmpty;
		this.onOff = objDefaultSubject.onOff;
	}
	else { // if first parameter is not an object (in this case all other parameters should be defined)
		this.defaultSubject = objDefaultSubject;
		this.onlyIfEmpty = onlyIfEmpty;
		this.onOff = onOff;
	}
};


/**
 * (class) Holds information about filter subject settings
 *
 * @param objServerKey (string/object) server key OR FilterSubjectSettings object
 * @param filterName (boolean) filter name
 * @param subject (string) subject
 * @param enabled (boolean) true/false if filter subject is/is not enabled
 */
SubjectManager.FilterSubjectSettings = function (objServerKey, filterName, subject, enabled)
{
	// attributes
	if ( (typeof(objServerKey) === "object") ) { // if first parameter is an object (in this case this should be the one and only parameter)
		this.serverKey = objServerKey.serverKey;
		this.filterName = objServerKey.filterName;
		this.subject = objServerKey.subject;
		this.enabled = objServerKey.enabled;
	}
	else { // if first parameter is not an object (in this case all other parameters should be defined)
		this.serverKey = objServerKey;
		this.filterName = filterName;
		this.subject = subject;
		this.enabled = enabled;
	}
};


/**
 * (class) Holds information about filter subject settings
 *
 * @param objValue (string/object) counter value OR CounterSettings object
 * @param update (integer) update value as byte (2^0=1: when sending message, 2^1=2: when saving message, 2^2=4: when updating any individual counter (available for global counter only))
 * @param format (string) digits count
 * @param reset (integer) reset value (0/1/2/3/4 if counter shall be resetted never/each day/each week/each month/each year)
 */
SubjectManager.CounterSettings = function (objValue, update, format, reset)
{
	// attributes
	if ( (typeof(objValue) === "object") ) { // if first parameter is an object (in this case this should be the one and only parameter)
		this.value = objValue.value;
		this.update = objValue.update;
		this.format = objValue.format;
		this.reset = objValue.reset;
	}
	else { // if first parameter is not an object (in this case all other parameters should be defined)
		this.value = objValue;
		this.update = update;
		this.format = format;
		this.reset = reset;
	}
};


/**
 * (class) Simplifies manipulation of lists between TB versions
 *
 * Supports nsISupportsArray (TB <= v19.*) and nsIArray (TB >= v20.0a1)
 *
 * @param obj (object) object to virtualize
 * @param uuid (nsIIDRef) type of object contained in list
 */
SubjectManager.VirtualArray = function (obj, uuid)
{
	// attributes
	this.realObj = obj;
	this.uuid = uuid;

	// methods
	this.count = function () {
		var cnt = -1;

		if ( this.realObj != null ) {
			if ( this.realObj.toString() === "[xpconnect wrapped nsISupportsArray]" ) {
				cnt = this.realObj.Count();
			}
			else if ( this.realObj.toString() === "[xpconnect wrapped nsIArray]" ) {
				cnt = this.realObj.length;
			}
			else {
				throw this.realObj.toString() + " is not a handled class"; // throws an exception
			}
		}

		return cnt;
	}

	this.queryAt = function (index) {
		var elt = null;

		if ( this.realObj != null ) {
			if ( this.realObj.toString() === "[xpconnect wrapped nsISupportsArray]" ) {
				elt = this.realObj.QueryElementAt(index, this.uuid);
			}
			else if ( this.realObj.toString() === "[xpconnect wrapped nsIArray]" ) {
				elt = this.realObj.queryElementAt(index, this.uuid);
			}
			else {
				throw this.realObj.toString() + " is not a handled class"; // throws an exception
			}
		}

		return elt;
	}
};


/**
 * (class) Simplifies manipulation of a nsIMsgFilter between TB versions
 *
 * Supports handle of actions of filter:
 * - TB <= v19.*
 *   attribute 'actionList' (nsISupportsArray)
 * - TB >= v20.0a1
 *   attribute 'actionCount' (int) + method 'getFilterAt()'
 *
 * @param filterObj (object) object to virtualize
 */
SubjectManager.VirtualFilter = function (filterObj)
{
	// attributes
	this.realFilterObj = null;

	if ( (typeof(filterObj) !== "undefined") && (filterObj != null) && (filterObj.toString != null) && (filterObj.toString() === "[xpconnect wrapped nsIMsgFilter]") ) { // if given object is a nsIMsgFilter object
		this.realFilterObj = filterObj;
	}
	else { // if given object is not a nsIMsgFilter object
		if ( (filterObj != null) && (filterObj.toString != null) ) {
			throw filterObj.toString() + " is not a nsIMsgFilter object"; // throws an exception
		}
		else {
			throw "not a nsIMsgFilter object"; // throws an exception
		}
	}

	// methods
	this.actionsCount = function () {
		var cnt = -1;

		if ( this.realFilterObj != null ) {
			if ( (this.realFilterObj.actionList != null) && (this.realFilterObj.actionList.toString() === "[xpconnect wrapped nsISupportsArray]") ) {
				cnt = this.realFilterObj.actionList.Count();
			}
			else if ( this.realFilterObj.actionCount != null ) {
				cnt = this.realFilterObj.actionCount;
			}
			else {
				throw this.realFilterObj.toString() + " is not a handled class"; // throws an exception
			}
		}

		return cnt;
	}
};


/**
 * (class) Simplifies manipulation of a local file between TB versions
 *
 * nsILocalFile was merged with the interface of nsIFile in Gecko 14
 * Much of the documentation has not been updated to reflect this change.
 * - TB <= v13.*
 *   (nsILocalFile)
 * - TB >= v14.0a1
 *   (nsIFile)
 *
 * @return (object) file object
 */
SubjectManager.VirtualLocalFile = function ()
{
	var fileObj = null;

	if ( SubjectManager.isTBVersionEqualOrHigherThan("14.0a1") ) { // if current TB version uses gecko engine v14.0
		fileObj = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsIFile);
	}
	else {
		fileObj = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
	}

	return fileObj;
};


/**********
 * Add-on variables
 */

SubjectManager.addOnName = "SubjectManager";
SubjectManager.addOnId = "SubjectManager@gmail.com";
SubjectManager.temporaryRoot = "SM";
SubjectManager.exportSettingsMode = "PREFS"; // PREFS or INI
SubjectManager.metadataChar = "%";

SubjectManager.prefs = null;

SubjectManager.localConsole = new SubjectManager.Console();

SubjectManager.subjectsList = "";
SubjectManager.subjectsListSeparator = "";
SubjectManager.defaultSubjects = "";
SubjectManager.subjectPickedBehaviour = 0;
SubjectManager.subjectPickedBeginningEnd = false;
SubjectManager.subjectPickedEndBeginning = false;
SubjectManager.subjectsListCaseSensitive = false;
SubjectManager.subjectsAdvancedMode = false;
SubjectManager.handleSubjectsIdentities = false;
SubjectManager.lastExecution = "";
SubjectManager.globalCounterSettings = "";
SubjectManager.handleCounterIdentities = false;
SubjectManager.individualCountersSettings = "";
SubjectManager.includeReplyPrefixes = true;
SubjectManager.replyPrefixesList = "";
SubjectManager.includeForwardPrefixes = true;
SubjectManager.forwardPrefixesList = "";
SubjectManager.includeOtherPrefixes = false;
SubjectManager.otherPrefixesList = "";
SubjectManager.removeAutoPrefixes = false;
SubjectManager.keep1stPrefix = false;
SubjectManager.replace1stReplyPrefix = false;
SubjectManager.replyReplacementPrefix = "";
SubjectManager.replace1stForwardPrefix = false;
SubjectManager.forwardReplacementPrefix = "";
SubjectManager.filterSubjectsSettings = "";
SubjectManager.subjectBoxAutoCompleteEnabled = true;
SubjectManager.subjectBoxAutoCompleteCaseSensitive = false;
SubjectManager.subjectBoxButtonEnabled = true;
SubjectManager.subjectBoxButtonLabelReplaced = true;
SubjectManager.focusEmailBodyOnceSubjectPicked = true;
SubjectManager.debugMode = false;
SubjectManager.debugModeToFile = false;
SubjectManager.debugFileName = "";
SubjectManager.subjectsListChanged = false;

SubjectManager.individualCountersSettingsObj = {};
SubjectManager.individualCountersSettingsObjTmp = {};
SubjectManager.accountKeyTmp = "";


/**********
 * Common methods
 */

/**
 * Observes modifications of settings
 *
 * @param prefBranch (nsIPrefBranch) observed preferences branch
 * @param topic (string) fired event
 * @param data (string) name of changed preference
 */
SubjectManager.observe = function (prefBranch, topic, data)
{
	if ( topic == "nsPref:changed" ) {
		switch ( data ) {
			case "subjectsList": this.subjectsList = this.prefs.getCharPref("subjectsList"); break;
			case "defaultSubjects": this.defaultSubjects = this.prefs.getCharPref("defaultSubjects"); break;
			case "subjectPickedBehaviour":
				this.subjectPickedBehaviour = this.prefs.getIntPref("subjectPickedBehaviour");
				this.insertionPoint = 0; // re-initializes insertion point
				break;
			case "subjectPickedBeginningEnd": this.subjectPickedBeginningEnd = this.prefs.getBoolPref("subjectPickedBeginningEnd"); break;
			case "subjectPickedEndBeginning": this.subjectPickedEndBeginning = this.prefs.getBoolPref("subjectPickedEndBeginning"); break;
			case "subjectsListCaseSensitive": this.subjectsListCaseSensitive = this.prefs.getBoolPref("subjectsListCaseSensitive"); break;
			case "subjectsAdvancedMode": this.subjectsAdvancedMode = this.prefs.getBoolPref("subjectsAdvancedMode"); break;
			case "handleSubjectsIdentities": this.handleSubjectsIdentities = this.prefs.getBoolPref("handleSubjectsIdentities"); break;
			case "lastExecution": this.lastExecution = this.prefs.getCharPref("lastExecution"); break;
			case "globalCounterSettings": this.globalCounterSettings = this.prefs.getCharPref("globalCounterSettings"); break;
			case "handleCounterIdentities": this.handleCounterIdentities = this.prefs.getBoolPref("handleCounterIdentities"); break;
			case "individualCountersSettings":
				this.individualCountersSettings = this.prefs.getCharPref("individualCountersSettings");
				this.individualCountersSettingsObj = JSON.parse(this.individualCountersSettings);
				break;
			case "includeReplyPrefixes": this.includeReplyPrefixes = this.prefs.getBoolPref("includeReplyPrefixes"); break;
			case "replyPrefixesList": this.replyPrefixesList = unescape(this.prefs.getCharPref("replyPrefixesList")); break;
			case "includeForwardPrefixes": this.includeForwardPrefixes = this.prefs.getBoolPref("includeForwardPrefixes"); break;
			case "forwardPrefixesList": this.forwardPrefixesList = unescape(this.prefs.getCharPref("forwardPrefixesList")); break;
			case "includeOtherPrefixes": this.includeOtherPrefixes = this.prefs.getBoolPref("includeOtherPrefixes"); break;
			case "otherPrefixesList": this.otherPrefixesList = unescape(this.prefs.getCharPref("otherPrefixesList")); break;
			case "removeAutoPrefixes": this.removeAutoPrefixes = this.prefs.getBoolPref("removeAutoPrefixes"); break;
			case "keep1stPrefix": this.keep1stPrefix = this.prefs.getBoolPref("keep1stPrefix"); break;
			case "replace1stReplyPrefix": this.replace1stReplyPrefix = this.prefs.getBoolPref("replace1stReplyPrefix"); break;
			case "replyReplacementPrefix": this.replyReplacementPrefix = unescape(this.prefs.getCharPref("replyReplacementPrefix")); break;
			case "replace1stForwardPrefix": this.replace1stForwardPrefix = this.prefs.getBoolPref("replace1stForwardPrefix"); break;
			case "filterSubjectsSettings": this.filterSubjectsSettings = this.prefs.getCharPref("filterSubjectsSettings"); break;
			case "forwardReplacementPrefix": this.forwardReplacementPrefix = unescape(this.prefs.getCharPref("forwardReplacementPrefix")); break;
			case "subjectBoxAutoCompleteEnabled":
				this.enableSubjectTextBoxAutoComplete(this.prefs.getBoolPref("subjectBoxAutoCompleteEnabled")); // updates GUI regarding autocompletion state
				this.subjectsListChanged = this.subjectBoxAutoCompleteEnabled; // marks subjects list changed flag as dirty if autocompletion has been enabled
				if ( this.updateSubjectsList != null ) {
					this.updateSubjectsList(); // updates subjects list
				}
				break;
			case "subjectBoxAutoCompleteCaseSensitive": this.subjectBoxAutoCompleteCaseSensitive = this.prefs.getBoolPref("subjectBoxAutoCompleteCaseSensitive"); break;
			case "subjectBoxButtonEnabled":
				if ( this.showSubjectBoxButton != null ) {
					this.showSubjectBoxButton(this.prefs.getBoolPref("subjectBoxButtonEnabled")); // shows or hides subject box button regarding state
				}
				this.subjectsListChanged = this.subjectBoxButtonEnabled; // marks subjects list changed flag as dirty if subject box button has been enabled
				if ( this.updateSubjectsList != null ) {
					this.updateSubjectsList(); // updates subjects list
				}
				break;
			case "subjectBoxButtonLabelReplaced":
				this.subjectBoxButtonLabelReplaced = this.prefs.getBoolPref("subjectBoxButtonLabelReplaced"); // replaces or not subject box label regarding state
				if ( this.showSubjectBoxButton != null ) {
					this.showSubjectBoxButton(true); // shows subject box
				}
				this.subjectsListChanged = true; // marks subjects list changed flag as dirty
				if ( this.updateSubjectsList != null ) {
					this.updateSubjectsList(); // updates subjects list
				}
				break;
			case "focusEmailBodyOnceSubjectPicked": this.focusEmailBodyOnceSubjectPicked = this.prefs.getBoolPref("focusEmailBodyOnceSubjectPicked"); break;
			case "debugMode": this.debugMode = this.prefs.getBoolPref("debugMode"); break;
			case "debugModeToFile": this.debugModeToFile = this.prefs.getBoolPref("debugModeToFile"); break;
			case "debugFileName": this.debugFileName = unescape(this.prefs.getCharPref("debugFileName")); break;

			case "subjectsListChanged":
				this.subjectsListChanged = this.prefs.getBoolPref("subjectsListChanged");
				if ( this.subjectsListChanged && (this.updateSubjectsList != null) ) {
					this.updateSubjectsList(); // updates subjects list
				}
				break;
		}
	}
};

/**
 * Gets Thunderbird version
 *
 * @param comparedVersion (string) version to compare current version to
 * @return (boolean) true/false if Thunderbird version is equal or higher/lower than given version
 */
SubjectManager.isTBVersionEqualOrHigherThan = function (comparedVersion)
{
	var version;
	var versionChecker;

	version = ( "@mozilla.org/xre/app-info;1" in Components.classes ) ?
		Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo)
			.version
		:
		Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch)
			.getCharPref("app.version");

	versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
						.getService(Components.interfaces.nsIVersionComparator);

	if ( versionChecker.compare(version, comparedVersion) >= 0 ) {
		return true;
	}

	return false;
};

/**
 * Displays given message in a message dialog
 *
 * @param message (string) message to be displayed
 */
SubjectManager.displayMessageDialog = function (message)
{
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);

	promptService.confirmEx(window, this.addOnName, message, promptService.BUTTON_TITLE_OK * promptService.BUTTON_POS_0, "", "", null, "", {value: false});
};

/**
 * Displays given message in an alert dialog
 *
 * @param message (string) message to be displayed
 */
SubjectManager.displayAlertDialog = function (message)
{
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);

	promptService.alert(null, this.addOnName, message);
};

/**
 * Displays given message in a dialog and ask for confirmation
 *
 * @param message (string) message to be displayed
 * @return (boolean) true/false if user has/has not confirmed
 */
SubjectManager.displayConfirmDialog = function (message)
{
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);

	return promptService.confirm(null, this.addOnName, message);
};

/**
 * Displays given message in a popup dialog
 *
 * @param message (string) message to be displayed
 */
SubjectManager.displayPopUpMessage = function (message)
{
	try {
		var alertService = Components.classes["@mozilla.org/alerts-service;1"]
							.getService(Components.interfaces.nsIAlertsService);

		alertService.showAlertNotification("chrome://SubjectManager/skin/icon.png", this.addOnName, message, false, "", null, "");
	}
	catch ( err ) {
		var windowWatcher = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
					.getService(Components.interfaces.nsIWindowWatcher)
					.openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);

		windowWatcher.arguments = ["chrome://SubjectManager/skin/icon.png", this.addOnName, message, false, ""];
	}
};

/**
 * Loads and displays given page
 *
 * @param pageUrl (string) page URL to load and display
 */
SubjectManager.displayPage = function (pageUrl)
{
	var mail3PaneWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
							.getService(Components.interfaces.nsIWindowMediator)
							.getMostRecentWindow("mail:3pane");

	if ( mail3PaneWindow != null ) {
		var tabmail = mail3PaneWindow.document.getElementById("tabmail");

		if ( tabmail != null ) { // if application supports tabs (TB >= v3.*)
			tabmail.openTab("contentTab", {contentPage: pageUrl});
		}
		else { // if application does not support tabs (TB < v3.*)
			window.opener.openDialog(pageUrl, "_blank", "chrome,resizable=yes,height=800,width=1000");
		}
	}
};

/**
 * Clones object
 * For objects made of properties only (not ok for objects with methods)
 *
 * @param srcObj (object) source object
 * @param srcObjName (object name) source object name
 * @return (object) destination object
 */
SubjectManager.cloneObj = function (srcObj, srcObjName)
{
	/*var dstObj = null;

	if ( (typeof(srcObj) === "undefined") ) {
		if ( typeof(srcObjName) === "string" ) {
			throw "Error in function cloneObj(): Type of property '" + srcObjName + "' is undefined";
		}
		else {
			throw "Error in function cloneObj(): Type of property '<unnamed>' is undefined";
		}
	}
	else if ( (typeof(srcObj) !== "object") || (srcObj == null) ) {
		dstObj = srcObj;
	}
	else {
		var tmpVal = null;
		var tmpSrcObj = srcObj;

		dstObj = srcObj.constructor(); // issue here: it calls default constructor!!

		for ( var propty in srcObj ) {
			if ( srcObj.hasOwnProperty(propty) ) {
				tmpVal = SubjectManager.cloneObj(srcObj[propty], propty);
				if ( tmpVal != null ) {
					dstObj[propty] = tmpVal;
				}
			}
		}
	}

	return dstObj;*/

	return JSON.parse(JSON.stringify(srcObj));
};

// for TB v3.* there is a bug in native functions JSON.stringify() and JSON.parse() (checked from Shredder v3.0.6 to Lanikai 3.1.21):
// when using an object and a replacer function, properties values of the object are not returned correctly:
// they stay unchanged, even if modified into replacer function

/**
 * Turns given object into a JSON string using JSON engine
 *
 * Aimed to replace native function JSON.stringify() for TB v3.*:
 * First the names are escaped (using escape()), then the whole object is stringified using native JSON function
 *
 * @param obj (object) object to stringify
 * @param replacer (function) function to apply
 * @param keysArray (array of strings) list of properties to apply function to
 * @return (string) JSON
 */
SubjectManager.JSONstringify = function (obj, replacer, keysArray)
{
	if ( typeof(obj) !== "object" ) {
		throw "Error in function JSONstringify(): Argument is not a valid object but a " + typeof(obj);
	}

	if ( (replacer != null ) && (obj != null) ) { // if replacement function is defined and given object is not null
		if ( typeof(obj.length) === "number" ) { // if given object is an array
			for ( var idx = 0 ; idx < obj.length ; idx++ ) { // for each element
				for ( var propty in obj[idx] ) { // for each property of current element
					if ( keysArray.indexOf(propty) != -1 ) { // if property is one of allowed keys
						obj[idx][propty] = replacer(propty, obj[idx][propty]); // applies replacement function
					}
				}
			}
		}
		else { // if given object is a single object
			for ( var propty in obj ) { // for each property of current element
				if ( keysArray.indexOf(propty) != -1 ) { // if property is one of allowed keys
					obj[propty] = replacer(propty, obj[propty]); // applies replacement function
				}
			}
		}
	}

	return JSON.stringify(obj);
};

/**
 * Gets a JSON object from given string considered as a JSON string
 *
 * Aimed to replace native function JSON.parse() for TB v3.*:
 * First the string is parsed using native JSON function, then names are unescaped (using unescape())
 *
 * @param str (string) string to parse
 * @param replacer (function) function to apply
 * @param keysArray (array of strings) list of properties to apply function to
 * @return (object) resulting object
 */
SubjectManager.JSONparse = function (str, replacer, keysArray)
{
	if ( typeof(str) !== "string" ) {
		throw "Error in function JSONparse(): Argument is not a valid string but a " + typeof(str);
	}
	else if ( str === "" ) {
		throw "Error in function JSONparse(): Argument is an empty string";
	}

	var obj = JSON.parse(str);

	if ( (replacer != null ) && (obj != null) ) { // if replacement function is defined and JSON-parsed object is not null
		if ( typeof(obj.length) === "number" ) { // if JSON-parsed object is an array
			for ( var idx = 0 ; idx < obj.length ; idx++ ) { // for each element
				for ( var propty in obj[idx] ) { // for each property of current element
					if ( keysArray.indexOf(propty) != -1 ) { // if property is one of allowed keys
						obj[idx][propty] = replacer(propty, obj[idx][propty]); // applies replacement function
					}
				}
			}
		}
		else { // if JSON-parsed object is a single object
			for ( var propty in obj ) { // for each property of current element
				if ( keysArray.indexOf(propty) != -1 ) { // if property is one of allowed keys
					obj[propty] = replacer(propty, obj[propty]); // applies replacement function
				}
			}
		}
	}

	return obj;
};

/**
 * Applies escape() function on each source array element
 *
 * @param srcArray (array) source array
 * @return (array) array whose each element has been applied escape() function
 */
SubjectManager.escapeArray = function (srcArray)
{
	var dstArray = new Array();

	for ( var idx = 0 ; idx < srcArray.length ; idx++ ) {
		dstArray[idx] = escape(srcArray[idx]);
	}

	return dstArray;
};

/**
 * Applies unescape() function on each source array element
 *
 * @param srcArray (array) source array
 * @return (array) array whose each element has been applied unescape() function
 */
SubjectManager.unescapeArray = function (srcArray)
{
	var dstArray = new Array();

	for ( var idx = 0 ; idx < srcArray.length ; idx++ ) {
		dstArray[idx] = unescape(srcArray[idx]);
	}

	return dstArray;
};

/**
 * Applies unescape() function on string properties
 *
 * @param key (string) property key
 * @param value (string) property value
 * @return (string) modified property value
 */
SubjectManager.preProcessLoadSettings = function (key, value)
{
	if ( typeof(value) === "string" ) { // if property is a string
		value = unescape(value);
	}

	return value;
};

/**
 * Applies escape() function on string properties
 *
 * @param key (string) property key
 * @param value (string) property value
 * @return (string) modified property value
 */
SubjectManager.preProcessSaveSettings = function (key, value)
{
	if ( typeof(value) === "string" ) { // if property is a string
		value = escape(value);
	}

	return value;
};

/**
 * Parses global counters string and fixes it if needed
 *
 * @param globalCounterSettings (string) global counters preference value as JSON string
 * @return (object)
 */
SubjectManager.createGlobalCountersSettingsObject = function (globalCounterSettings)
{
	var globalCounterSettingsObj = null;

	if ( globalCounterSettings != "" ) { // if global counter settings string is not empty
		try {
			globalCounterSettingsObj = JSON.parse(globalCounterSettings); // parses global counter settings as JSON string
		}
		catch ( err ) {
			this.localConsole.logError("createGlobalCountersSettingsObject", err);
		}

		if ( (globalCounterSettingsObj == null) || // if global counter settings string cannot be parsed or...
			 globalCounterSettingsObj['global'] == null ) // ... if global counter settings string does not contain 'global' values
		{
			this.localConsole.logError("createGlobalCountersSettingsObject", "Global counter settings is damaged: '" + globalCounterSettings + "'");
			globalCounterSettings = ""; // reinitializes global counter settings string
		}
	}

	if ( globalCounterSettings == "" ) { // if global counter settings parsing has met an error
		globalCounterSettingsObj = {};
		globalCounterSettingsObj['global'] = new SubjectManager.CounterSettings(
			1,		// value
			5,		// update
			"0",	// format
			0		// reset
		); // creates a new global counter object


		this.localConsole.logWarning("createGlobalCountersSettingsObject", "Default global counter settings have been initialized");
	}

	return globalCounterSettingsObj;
};

/**
 * Parses individual counters string and fixes it if needed
 *
 * @param individualCountersSettings (string) individual counters preference value as JSON string
 * @return (object)
 */
SubjectManager.createIndividualCountersSettingsObject = function (individualCountersSettings)
{
	var individualCountersSettingsObj = {};

	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);

	var accountsList = new Array();
	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list

	var account = null;
	var accountIdentities = null;
	var accountIdentity = null;

	// building of existing accounts list
	for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
		account = accounts.queryAt(idx); // gets account object

		if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
			accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

			if ( this.prefs.getBoolPref("handleCounterIdentities") ) { // if identities have to be handled
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

	// removal of non-existing accounts from individual counters list
	if ( individualCountersSettings != "" ) { // if individual counters list is not empty
		var individualCountersSettingsTmp = {};

		if ( individualCountersSettings != "" ) { // if individual counters string is not empty
			try {
				individualCountersSettingsTmp = JSON.parse(individualCountersSettings); // parses individual counters settings as JSON string
			}
			catch ( err ) {
				this.localConsole.logError("options.cleanIndividualCountersSettings", err);
			}

			for ( var accountKey in individualCountersSettingsTmp ) { // for each individual counter
				if ( accountsList.indexOf(accountKey) != -1 ) { // if account is an available account
					individualCountersSettingsObj[accountKey] = new SubjectManager.CounterSettings(individualCountersSettingsTmp[accountKey]); // adds related individual counter settings
				}
				else {
					this.localConsole.logWarning("createIndividualCountersSettingsObject", "Account '" + accountKey + "' cannot be found: deletion of related individual counter settings");
				}
			}
		}
	}

	// add of new-existing accounts in individual counters list
	for ( var idx = 0 ; idx < accountsList.length ; idx++ ) { // for each account of accounts list
		if ( individualCountersSettingsObj[accountsList[idx]] == null ) { // if individual counter settings don't exist for current account
			individualCountersSettingsObj[accountsList[idx]] = new SubjectManager.CounterSettings(
				1,		// value
				1,		// update
				"0",	// format
				0		// reset
			); // creates a new individual counter settings object

			this.localConsole.logWarning("createIndividualCountersSettingsObject", "Account '" + accountsList[idx] + "' is a new account: creation of related individual counter settings");
		}
	}

	return individualCountersSettingsObj;
};

/**
 * Creates table of accounts identity & name
 *
 * @return (object) identity/name table
 */
SubjectManager.buildIdentityNameTable = function ()
{
	var identityNameObj = {};

	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);

	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list
	var account = null;
	var accountIdentities = null;
	var accountIdentity = null;

	for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
		account = accounts.queryAt(idx); // gets account object

		if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
			accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

			for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) {
				accountIdentity = accountIdentities.queryAt(jdx); // gets identity object
				identityNameObj[accountIdentity.key] = accountIdentity.identityName;
			}
		}
	}

	return identityNameObj;
};

/**
 * Creates table of identity
 *
 * @return (object) identities table
 */
SubjectManager.buildIdentitiesTable = function ()
{
	var identitiesObj = {};

	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
							.getService(Components.interfaces.nsIMsgAccountManager);

	var accountsList = new Array();
	var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list
	var account = null;
	var accountIdentities = null;
	var accountIdentity = null;

	for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
		account = accounts.queryAt(idx); // gets account object

		if ( account.defaultIdentity != null ) { // if account has a default identity (= skips "Local Folder")
			accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

			for ( var jdx = 0 ; jdx < accountIdentities.count() ; jdx++ ) {
				accountIdentity = accountIdentities.queryAt(jdx); // gets identity object
				identitiesObj[accountIdentity.key] = account.defaultIdentity.key;
			}
		}
	}

	return identitiesObj;
};

/**
 * Replaces all occurrences of a given pattern in a given string by a given replacement string
 *
 * this function ensures pattern character can be inserted into string providing it is doubled
 *
 * @param srcString (string) source string
 * @param patternCharacter (string) pattern character (e.g.: '%')
 * @param pattern (string) pattern (e.g.: 'Y' for year)
 * @param replacementString (string) replacement string
 * @return (string) parsed string
 */
SubjectManager.replacePattern = function (srcString, patternCharacter, pattern, replacementString)
{
	var dstString = srcString;

	// parsing of pattern in the whole string but the beginning
	// '[^' + patternCharacter ']': any single character except pattern character itself (this avoids to parse "%%" ) -> group #1
	// patternCharacter: pattern character
	// pattern: pattern
	dstString = dstString.replace(new RegExp("([^" + patternCharacter + "])" + patternCharacter + pattern, "g"), "$1" + replacementString); // replaces pattern with given replacement string

	// parsing of pattern for the beginning of the string
	dstString = dstString.replace(new RegExp("^" + patternCharacter + pattern, "g"), replacementString); // replaces pattern with given replacement string

	return dstString;
};

/**
 * Adds 0-padding of given length to given number
 *
 * @param number (integer) number to format
 * @param formatLength (integer) length of 0-padding to add
 * @return (string) formatted number as string
 */
SubjectManager.formatNumber = function (number, formatLength)
{
	var paddingStr = "";
	var paddingLength = formatLength - number.toString().length;

	for ( var idx = 0 ; idx < paddingLength ; idx++ ) {
		paddingStr += "0";
	}
	paddingStr += number.toString();

	return paddingStr;
};

/**
 * Parses subject in advanced mode
 * Pt1-0: all date & time metadata
 * (composed messages, filter messages & simulation)
 *
 * @param subject0 (string) subject to parse containing metadata
 * @param advancedMode (boolean) advanced mode
 * @return (string) parsed subject
 */
SubjectManager.parseSubjectPt10 = function (subject0, advancedMode)
{
	var subject = subject0;

	if ( advancedMode ) {
		var zeroStr = ""; // useful to add leading '0' for 2 digits metadata
		var currentDateTime = new Date();

		// usefull to clone currentDateTime because there is what seems to be a bug:
		// currentDateTime0 = new Date(currentDateTime.toISOString()) makes currentDateTime0 a reference to currentDateTime, so making a change to currentDateTime modifies also currentDateTime0!
		var currentDateTimeStr = currentDateTime.toISOString();
		var currentDateTime0 = null; // copy of current date time (in case a modifier has been applied to current date time)

		var currentDateTimeStr2 = "";
		var currentDateTime2 = null; // copy of current date time

		var currentAmPm = "";

		var weekDaysArray = document.getElementById("subjectManagerStringBundle").getString('weekDays').split(/,/);
		var monthsArray = document.getElementById("subjectManagerStringBundle").getString('months').split(/,/);
		var ampmArray = document.getElementById("subjectManagerStringBundle").getString('ampm').split(/,/);

		var reMetaData1 = null;
		var reMetaData2 = null;

		var subjectMetaData1 = null;
		var subjectMetaData2 = null;

		var replacementValue = 0;

		// versions __1 are for offset with spreading
		// versions __2 are for offset without spreading
		var secondsValueOffset1 = 0;
		var secondsValueOffset2 = 0;
		var minutesValueOffset1 = 0;
		var minutesValueOffset2 = 0;
		var hoursValueOffset1 = 0;
		var hoursValueOffset2 = 0;
		var ampmValueOffset1 = 0;
		var ampmValueOffset2 = 0;
		var daysValueOffset1 = 0;
		var daysValueOffset2 = 0;
		var monthsValueOffset1 = 0;
		var monthsValueOffset2 = 0;
		var yearsValueOffset1 = 0;
		var yearsValueOffset2 = 0;
		var weeksValueOffset1 = 0;
		var weeksValueOffset2 = 0;

		var pattern = "";
		var metaData = "";

		// step #1: analysis of modifiers (=offset)
		var localOffset = 0;

		reMetaData1 = new RegExp("%[\\-]?[0-9]?[0-9]?[SsNnHhKkPpDdWwMmBbYyXxVv]", "g"); // usefull to look for all metadata in the string
		reMetaData2 = new RegExp("%([\\-]?[0-9]{0,2})([SsNnHhKkPpDdWwMmBbYyXxVv])"); // usefull to get the exact metadata of each metadata found

		subjectMetaData1 = subject.match(reMetaData1);

		if ( subjectMetaData1 != null ) { // if some metadata has been found
			for ( var idx = 0 ; idx < subjectMetaData1.length ; idx++ ) { // for each metadata
				pattern = "";
				metaData = "";
				localOffset = 0;

				subjectMetaData2 = subjectMetaData1[idx].match(reMetaData2);

				if ( subjectMetaData2 != null ) { // if metadata contains offset
					metaData = subjectMetaData2[2]; // gets 'simple' metadata (without offset)
					pattern = "%" + metaData; // gets 'simple' pattern

					subject = subject.replace(new RegExp(subjectMetaData2[0], "g"), "%" + metaData); // replace the whole metadata (offset + metadata) by the metadata without offset
					localOffset = ( Number.isInteger(parseInt(subjectMetaData2[1])) ) ? parseInt(subjectMetaData2[1]) : 0; // gets offset value

					switch ( pattern ) {
						// seconds
						case "%S": // seconds with spreading
							secondsValueOffset1 += localOffset;
							break;
						case "%s": // seconds
							secondsValueOffset2 += localOffset;
							break;
						// minutes
						case "%N": // minutes with spreading
							minutesValueOffset1 += localOffset;
							break;
						case "%n": // minutes
							minutesValueOffset2 += localOffset;
							break;
						// hours
						case "%H": // 24-hour with spreading
						case "%K": // 12-hour with spreading
							hoursValueOffset1 += localOffset;
							break;
						case "%h": // 24-hour
						case "%k": // 12-hour
							hoursValueOffset2 += localOffset;
							break;
						case "%P": // AM/PM with spreading
							ampmValueOffset1 += localOffset;
							break;
						case "%p": // AM/PM
							ampmValueOffset2 += localOffset;
							break;
						// days
						case "%D": // day with spreading
						case "%W": // week day with spreading
							daysValueOffset1 += localOffset;
							break;
						case "%d": // day
						case "%w": // week day
							daysValueOffset2 += localOffset;
							break;
						// months
						case "%M": // month with spreading
						case "%B": // month name with spreading
							monthsValueOffset1 += localOffset;
							break;
						case "%m": // month
						case "%b": // month name
							monthsValueOffset2 += localOffset;
							break;
						// years
						case "%Y": // 4-digits year with spreading
						case "%X": // 2-digits year with spreading
							yearsValueOffset1 += localOffset;
							break;
						case "%y": // 4-digits year
						case "%x": // 2-digits year
							yearsValueOffset2 += localOffset;
							break;
						// weeks
						case "%V": // weeks count with spreading
							weeksValueOffset1 += localOffset;
							break;
						case "%v": // weeks count
							weeksValueOffset2 += localOffset;
							break;
					}
				}
			}
		}

		// shifting of current date time for metadata which use spreading of modifiers (___valueOffset1)
		currentDateTime.setFullYear(currentDateTime.getFullYear() + yearsValueOffset1); // shifts year number
		currentDateTime.setMonth(currentDateTime.getMonth() + monthsValueOffset1); // shifts month number
		currentDateTime.setDate(currentDateTime.getDate() + daysValueOffset1); // shifts day number
		currentDateTime.setHours(currentDateTime.getHours() + hoursValueOffset1); // shifts hours count
		currentDateTime.setMinutes(currentDateTime.getMinutes() + minutesValueOffset1); // shifts minutes count
		currentDateTime.setSeconds(currentDateTime.getSeconds() + secondsValueOffset1); // shifts seconds count

		// step #2: seconds, minutes, hours & days, months, years
		reMetaData1 = new RegExp("%[SsNnHhKkPpDdWwMmBbYyXx]", "g"); // usefull to look for all metadata in the string
		reMetaData2 = new RegExp("%([SsNnHhKkPpDdWwMmBbYyXx])"); // usefull to get the exact metadata of each metadata found

		subjectMetaData1 = subject.match(reMetaData1);

		if ( subjectMetaData1 != null ) { // if some metadata has been found
			for ( var idx = 0 ; idx < subjectMetaData1.length ; idx++ ) { // for each metadata
				pattern = "";
				metaData = "";
				replacementValue = 0;

				subjectMetaData2 = subjectMetaData1[idx].match(reMetaData2);

				if ( subjectMetaData2 != null ) { // if metadata contains offset
					metaData = subjectMetaData2[1]; // gets 'simple' metadata (without offset)
					pattern = "%" + metaData; // gets 'simple' pattern

					switch ( pattern ) {
						// seconds
						case "%S": // seconds with spreading
							replacementValue = currentDateTime.getSeconds(); // gets seconds count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%s": // seconds
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setSeconds(currentDateTime0.getSeconds() + secondsValueOffset2); // shifts seconds count
							replacementValue = currentDateTime0.getSeconds(); // gets seconds count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						// minutes
						case "%N": // minutes with spreading
							replacementValue = currentDateTime.getMinutes(); // gets minutes count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%n": // minutes
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setMinutes(currentDateTime0.getMinutes() + minutesValueOffset2); // shifts minutes count
							replacementValue = currentDateTime0.getMinutes(); // gets minutes count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						// hours
						case "%H": // 24-hour with spreading
							replacementValue = currentDateTime.getHours(); // gets hours count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%h": // 24-hour
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setHours(currentDateTime0.getHours() + hoursValueOffset2); // shifts hours count
							replacementValue = currentDateTime0.getHours(); // gets hours count
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%K": // 12-hour with spreading
							replacementValue = currentDateTime.getHours(); // gets hours count
							replacementValue = ( (replacementValue % 12) == 0 ) ? 12 : (replacementValue % 12); // gets hours count on a 12-hour clock & so that zero appears as '12'
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%k": // 12-hour
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setHours(currentDateTime0.getHours() + hoursValueOffset2); // shifts hours count
							replacementValue = currentDateTime0.getHours(); // gets hours count
							replacementValue = ( (replacementValue % 12) == 0 ) ? 12 : (replacementValue % 12); // gets hours count on a 12-hour clock & so that zero appears as '12'
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%P": // AM/PM with spreading
							currentAmPm = ( currentDateTime.getHours() < 12 ) ? ampmArray[0] : ampmArray[1]; // gets am/pm
							subject = SubjectManager.replacePattern(subject, "%", metaData, currentAmPm);
							break;
						case "%p": // AM/PM
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentAmPm = ( currentDateTime0.getHours() < 12 ) ? ampmArray[0] : ampmArray[1]; // gets am/pm
							subject = SubjectManager.replacePattern(subject, "%", metaData, currentAmPm);
							break;
						// days
						case "%D": // day with spreading
							replacementValue = currentDateTime.getDate(); // gets day number
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%d": // day
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setDate(currentDateTime0.getDate() + daysValueOffset2); // shifts day number
							replacementValue = currentDateTime0.getDate(); // gets day number
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%W": // week day with spreading
							replacementValue = currentDateTime.getDay(); // gets weekday
							subject = SubjectManager.replacePattern(subject, "%", metaData, weekDaysArray[replacementValue]);
							break;
						case "%w": // week day
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setDate(currentDateTime0.getDate() + daysValueOffset2); // shifts day number
							replacementValue = currentDateTime0.getDay(); // gets week day
							subject = SubjectManager.replacePattern(subject, "%", metaData, weekDaysArray[replacementValue]);
							break;
						// months
						case "%M": // month with spreading
							replacementValue = currentDateTime.getMonth() + 1; // gets month number
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%m": // month
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setMonth(currentDateTime0.getMonth() + monthsValueOffset2); // shifts month number
							replacementValue = currentDateTime0.getMonth() + 1; // gets month number (interval = [0 ; 11])
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%B": // month name with spreading
							replacementValue = currentDateTime.getMonth(); // gets month number
							subject = SubjectManager.replacePattern(subject, "%", metaData, monthsArray[replacementValue]);
						case "%b": // month name
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setMonth(currentDateTime0.getMonth() + monthsValueOffset2); // shifts month number
							replacementValue = currentDateTime0.getMonth(); // gets month number
							subject = SubjectManager.replacePattern(subject, "%", metaData, monthsArray[replacementValue]);
							break;
						// years
						case "%Y": // 4-digits year with spreading
							replacementValue = currentDateTime.getFullYear(); // gets year number
							subject = SubjectManager.replacePattern(subject, "%", metaData, replacementValue.toString());
							break;
						case "%y": // 4-digits year
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setFullYear(currentDateTime0.getFullYear() + yearsValueOffset2); // shifts year number
							replacementValue = currentDateTime0.getFullYear(); // gets year number
							subject = SubjectManager.replacePattern(subject, "%", metaData, replacementValue.toString());
							break;
						case "%X": // 2-digits year with spreading
							replacementValue = currentDateTime.getFullYear(); // gets year number
							subject = SubjectManager.replacePattern(subject, "%", metaData, replacementValue.toString().substring(2));
						case "%x": // 2-digits year
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTime0.setFullYear(currentDateTime0.getFullYear() + yearsValueOffset2); // shifts year number
							replacementValue = currentDateTime0.getFullYear(); // gets year number
							subject = SubjectManager.replacePattern(subject, "%", metaData, replacementValue.toString().substring(2));
							break;
					}
				}
			}
		}

		// step #3: week number
		var currentDateTimeWeek52 = null;
		var lastWeekOfYear = 0;
		var dtStr = "";

		reMetaData1 = new RegExp("%[Vv]", "g");
		reMetaData2 = new RegExp("%([Vv])");

		subjectMetaData1 = subject.match(reMetaData1);

		if ( subjectMetaData1 != null ) { // if some metadata has been found
			for ( var idx = 0 ; idx < subjectMetaData1.length ; idx++ ) { // for each metadata
				pattern = "";
				metaData = "";
				replacementValue = 0;

				subjectMetaData2 = subjectMetaData1[idx].match(reMetaData2);

				if ( subjectMetaData2 != null ) { // if metadata contains offset
					metaData = subjectMetaData2[1]; // gets 'simple' metadata (without offset)
					pattern = "%" + metaData; // gets 'simple' pattern

					switch ( pattern ) {
						// weeks
						case "%V": // week number with spreading
							replacementValue = SubjectManager.getWeeksNumber(currentDateTime) + weeksValueOffset1;

							// computation of the number of last week of current year (gets 28th of december)
							dtStr = currentDateTime.toISOString();
							currentDateTimeWeek52 = new Date(dtStr); // copies current datetime
							currentDateTimeWeek52.setMonth(11); // goes to december
							currentDateTimeWeek52.setDate(28); // goes to the 28th of january

							if ( replacementValue <= 0 ) { // if value is lower or equal than 0
								// if week number is 0 it means date is between 31/12/Y-1 and 04/01/Y, so week number should be set last week of last year
								// if week number is less than 0, week number is computed starting from last week of last year and then rewinded
								while ( replacementValue <= 0 ) { // while value is lower or equal than 0
									currentDateTimeWeek52.setFullYear(currentDateTimeWeek52.getFullYear() - 1); // sets year before last year
									lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);

									replacementValue = lastWeekOfYear + replacementValue;
								}
							}
							else { // else if value is greater than 0
								lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);
								
								// if week number is greater than last week of the year, week number is computed starting from this week and then forwarded
								while ( replacementValue > lastWeekOfYear ) { // while value is greater than last week of the year
									replacementValue = replacementValue - lastWeekOfYear;

									currentDateTimeWeek52.setFullYear(currentDateTimeWeek52.getFullYear() + 1); // sets year next
									lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);
								}
							}
							
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
						case "%v": // week number						
							currentDateTime0 = new Date(currentDateTimeStr); // copies current datetime
							replacementValue = SubjectManager.getWeeksNumber(currentDateTime0) + weeksValueOffset2;

							currentDateTimeWeek52 = new Date(currentDateTimeStr); // copies current datetime
							currentDateTimeWeek52.setMonth(11); // goes to december
							currentDateTimeWeek52.setDate(28); // goes to the 28th of january

							if ( replacementValue <= 0 ) { // if value is lower or equal than 0
								while ( replacementValue <= 0 ) { // while value is lower or equal than 0
									currentDateTimeWeek52.setFullYear(currentDateTimeWeek52.getFullYear() - 1); // sets year before last year
									lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);

									replacementValue = lastWeekOfYear + replacementValue;
								}
							}
							else { // else if value is greater than 0
								lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);

								while ( replacementValue > lastWeekOfYear ) { // while value is greater than last week of the year
									replacementValue = replacementValue - lastWeekOfYear;

									currentDateTimeWeek52.setFullYear(currentDateTimeWeek52.getFullYear() + 1); // sets year next
									lastWeekOfYear = SubjectManager.getWeeksNumber(currentDateTimeWeek52);
								}
							}
							
							zeroStr = ( replacementValue < 10 ) ? "0" : ""; // adds leading '0' if necessary to get 2 digits
							subject = SubjectManager.replacePattern(subject, "%", metaData, zeroStr + replacementValue.toString());
							break;
					}
				}
			}
		}
	}

	return subject;
};

/**
 * Computes the number of the week for the given date&time
 *
 * @param dt (DateTime object) date&time for which computing the week number
 * @return (integer) the week number
 */
SubjectManager.getWeeksNumber = function (dt)
{
	var dtWeek1Str = dt.toISOString();
	var dtWeek1 = new Date(dtWeek1Str);
	var dtWeek52 = new Date(dtWeek1Str);
	var fourthJanuaryShift = 0;
	var weeksNumber = -1;

	// gets 4th of january
	dtWeek1 = new Date(dtWeek1Str); // copies current datetime
	dtWeek1.setMonth(0); // goes to january of the current year
	dtWeek1.setDate(4); // goes to the 4th of january of the current year

	// gets the monday of the 4th january week
	fourthJanuaryShift = dtWeek1.getDay();
	fourthJanuaryShift = ( fourthJanuaryShift == 0 ) ? 7 - 1 : fourthJanuaryShift - 1;

	// 'fourthJanuaryShift': shift to take into account between 4th of january and the monday of the same week
	// 'dt.getTime() - dtWeek1.getTime()': gets difference in milliseconds between 2 dates
	// '/ (24*60*60*1000)': 24 hours per day * 60 minutes per hour * 60 seconds per minute * 1000 milliseconds per second
	// 'Math.floor((dt.getTime() - dtWeek1.getTime()) / (24*60*60*1000))': gets difference in days count rounded by default
	// '/ 7': 7 days in a week
	// 'Math.floor((4 + Math.floor((dt.getTime() - dtWeek1.getTime()) / (24*60*60*1000))) / 7)': gets difference in weeks count rounded by default
	// '+ 1': adds 1 because week number begins at 1, not 0
	weeksNumber = Math.floor((fourthJanuaryShift + Math.floor((dt.getTime() - dtWeek1.getTime()) / (24*60*60*1000))) / 7) + 1;

	return weeksNumber;
};

/**
 * Resets given counter if needed
 *
 * @param lastExecution (string) last execution date&time in milliseconds as string
 * @param counterInfo (string) counter info
 * @param resetParameter (integer) 1/2/3/4/0 if given counter should resetted every day/week/month/year/never
 * @param currentCounterVal (integer) current counter value
 * @return (integer) new counter value
 */
SubjectManager.resetCounter = function (lastExecution, counterInfo, resetParameter, currentCounterVal)
{
	if ( (lastExecution != "") && (lastExecution != "0") ) {
		var lastExecutionDt = new Date(parseInt(lastExecution));
		var currentDt = new Date();

		switch ( resetParameter ) {
			// days
			case "1":
				var lastExecutionDtStr = lastExecutionDt.getFullYear() + SubjectManager.formatNumber(lastExecutionDt.getMonth() + 1, 2) + SubjectManager.formatNumber(lastExecutionDt.getDate(), 2);
				var currentDtStr = currentDt.getFullYear() + SubjectManager.formatNumber(currentDt.getMonth() + 1, 2) + SubjectManager.formatNumber(currentDt.getDate(), 2);
				var dtDiff = parseInt(currentDtStr) - parseInt(lastExecutionDtStr);

				if ( dtDiff > 0 ) {
					currentCounterVal = 1;

					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is at least one day earlier than now (" + currentDtStr + "): resetted");
				}
				else if ( dtDiff == 0 ) {
					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is the same day than now (" + currentDtStr + "): unchanged = " + currentCounterVal);
				}
				else {
					this.localConsole.logWarning("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is later than now (" + currentDtStr + ")!");
				}
				break;
			// weeks
			case "2":
				var lastExecutionDtStr = lastExecutionDt.getFullYear() + SubjectManager.formatNumber(SubjectManager.getWeeksNumber(lastExecutionDt), 2);
				var currentDtStr = currentDt.getFullYear() + SubjectManager.formatNumber(SubjectManager.getWeeksNumber(currentDt), 2);
				var dtDiff = parseInt(currentDtStr) - parseInt(lastExecutionDtStr);

				if ( dtDiff > 0 ) {
					currentCounterVal = 1;

					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is at least one week earlier than now (" + currentDtStr + "): resetted");
				}
				else if ( dtDiff == 0 ) {
					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is the same week than now (" + currentDtStr + "): unchanged = " + currentCounterVal);
				}
				else {
					this.localConsole.logWarning("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is later than now (" + currentDtStr + ")!");
				}
				break;
			// months
			case "3":
				var lastExecutionDtStr = lastExecutionDt.getFullYear() + SubjectManager.formatNumber(lastExecutionDt.getMonth() + 1, 2);
				var currentDtStr = currentDt.getFullYear() + SubjectManager.formatNumber(currentDt.getMonth() + 1, 2);
				var dtDiff = parseInt(currentDtStr) - parseInt(lastExecutionDtStr);

				if ( dtDiff > 0 ) {
					currentCounterVal = 1;

					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is at least one month earlier than now (" + currentDtStr + "): resetted");
				}
				else if ( dtDiff == 0 ) {
					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is the same month than now (" + currentDtStr + "): unchanged = " + currentCounterVal);
				}
				else {
					this.localConsole.logWarning("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is later than now (" + currentDtStr + ")!");
				}
				break;
			// years
			case "4":
				var lastExecutionDtStr = lastExecutionDt.getFullYear();
				var currentDtStr = currentDt.getFullYear();
				var dtDiff = parseInt(currentDtStr) - parseInt(lastExecutionDtStr);

				if ( dtDiff > 0 ) {
					currentCounterVal = 1;

					this.localConsole.logInformation("resetCounter", "Last execution (" + lastExecutionDtStr + ") is at least one year earlier than now (" + currentDtStr + "): counter '" + counterInfo + "' resetted");
				}
				else if ( dtDiff == 0 ) {
					this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is the same year than now (" + currentDtStr + "): unchanged = " + currentCounterVal);
				}
				else {
					this.localConsole.logWarning("resetCounter", "Counter '" + counterInfo + "': Last execution (" + lastExecutionDtStr + ") is later than now (" + currentDtStr + ")!");
				}
				break;
			case "0":
			default:
				this.localConsole.logInformation("resetCounter", "Counter '" + counterInfo + "': Resetting is disabled");
				break;
		}
	}

	return currentCounterVal;
};

/**
 * Resets all counters
 *
 * @param prefs (nsIPrefBranch) current preferences branch
 */
SubjectManager.resetAllCounters = function (prefs)
{
	var lastExecution = prefs.getCharPref("lastExecution");

	// global counter
	this.debugMode = prefs.getBoolPref("debugMode");

	var globalCounterSettingsObj = JSON.parse(prefs.getCharPref("globalCounterSettings"));
	var globalCounterSettings = globalCounterSettingsObj['global']; // gets global counter settings

	if ( globalCounterSettings != null ) {
		globalCounterSettings.value = SubjectManager.resetCounter(lastExecution, "global", globalCounterSettings.reset, globalCounterSettings.value);
		SubjectManager.globalCounterSettings = JSON.stringify(globalCounterSettingsObj);
		prefs.setCharPref("globalCounterSettings", SubjectManager.globalCounterSettings);
	}

	// individual counters
	var individualCountersSettingsObj = JSON.parse(prefs.getCharPref("individualCountersSettings"));

	for ( var accountKey in individualCountersSettingsObj ) { // for each individual counter
		individualCountersSettingsObj[accountKey].value = SubjectManager.resetCounter(lastExecution, accountKey, individualCountersSettingsObj[accountKey].reset, individualCountersSettingsObj[accountKey].value);
	}

	SubjectManager.individualCountersSettings = JSON.stringify(individualCountersSettingsObj);
	prefs.setCharPref("individualCountersSettings", SubjectManager.individualCountersSettings);

	prefs.setCharPref("lastExecution", (new Date()).getTime()); // saves last execution
};

/**
 * Parses subject in advanced mode
 * Pt2-2: counters metadata
 * (composed messages)
 *
 * @param subject0 (string) subject to parse containing metadata
 * @param advancedMode (boolean) advanced mode
 * @return (string) parsed subject
 */
SubjectManager.parseSubjectPt22 = function (subject0, advancedMode)
{
	var subject = subject0;

	if ( advancedMode ) {
		var msgIdentityMenuList = document.getElementById("msgIdentity");

		var globalCounterSettingsObj = JSON.parse(this.globalCounterSettings);

		this.globalCounterInserted = false;
		this.individualCounterInserted = false;

		// parsing of global counter
		if ( subject.indexOf("%g") != -1 ) { // if subject contains global counter metadata
			var globalCounterSettings = globalCounterSettingsObj['global']; // gets global counter settings

			if ( globalCounterSettings != null ) {
				this.globalCounterInserted = true; // enables 'global counter' flag

				subject = this.replacePattern(subject, "%", "g", this.formatNumber(globalCounterSettings.value, globalCounterSettings.format));
			}
			else {
				this.localConsole.logError("parseSubjectPt22", "Global counter settings cannot be found");
			}
		}

		// parsing of individual counter
		if ( subject.indexOf("%i") != -1 ) { // if subject contains individual counter metadata
			if ( msgIdentityMenuList != null ) { // (JSCTSABT)
				this.individualCounterInserted = true; // enables 'individual counter' flag

				this.individualCountersSettingsObjTmp = this.cloneObj(this.individualCountersSettingsObj); // copies array

				var accountKey = null;
				var accountId = null;

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

				accountKey = accountId;
				if ( !this.handleCounterIdentities ) { // if identities should not be handled
					accountKey = this.identitiesObj[accountId]; // gets default identity of current identity
				}
				if ( accountKey == null ) { // if account id has not been found
					accountKey = accountId;
				}

				var individualCountersSettings = this.individualCountersSettingsObjTmp[accountKey]; // gets individual counter settings

				if ( individualCountersSettings != null ) {
					this.accountKeyTmp = accountKey;

					subject = this.replacePattern(subject, "%", "i", this.formatNumber(individualCountersSettings.value, individualCountersSettings.format));

					individualCountersSettings.value++; // increments individual counter
				}
				else {
					this.localConsole.logError("parseSubjectPt22", "Individual counter settings for account '" + accountKey + "' cannot be found");
				}
			}
		}
	}

	return subject;
};

/**
 * Parses subject in advanced mode
 * Pt2-1: counters metadata
 * (filter messages)
 *
 * @param subject0 (string) subject to parse containing metadata
 * @param accountKey (string) account key
 * @param advancedMode (boolean) advanced mode
 * @return (string) parsed subject
 */
SubjectManager.parseSubjectPt21 = function (subject0, accountKey, advancedMode)
{
	var subject = subject0;

	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions." + SubjectManager.addOnName + ".");
	prefs.QueryInterface(Components.interfaces.nsIPrefBranch);

	if ( advancedMode ) {
		var globalCounterSettingsObj = JSON.parse(prefs.getCharPref("globalCounterSettings"));
		var globalCounterSettings = globalCounterSettingsObj['global'];

		// parsing of counters
		var globalCounterUpdated = false;

		// parsing of global counter
		if ( subject.indexOf("%g") != -1 ) { // if subject contains global counter metadata
			subject = SubjectManager.replacePattern(subject, "%", "g", SubjectManager.formatNumber(globalCounterSettings.value, globalCounterSettings.format));

			if ( (globalCounterSettings.update & 1) == 1 ) { // if 'update when sending' flag has been set
				globalCounterUpdated = true;
			}
		}

		// parsing of individual counter
		if ( subject.indexOf("%i") != -1 ) { // if subject contains individual counter metadata
			if ( accountKey != "" ) { // (JSCTSABT)
				var individualCountersSettingsObj = SubjectManager.createIndividualCountersSettingsObject(prefs.getCharPref("individualCountersSettings"));

				if ( individualCountersSettingsObj[accountKey] != null ) { // gets individual counter settings
					subject = SubjectManager.replacePattern(subject, "%", "i", SubjectManager.formatNumber(individualCountersSettingsObj[accountKey].value, individualCountersSettingsObj[accountKey].format));

					// update of individual counter
					if ( (individualCountersSettingsObj[accountKey].update & 1) == 1 ) { // if 'update when sending' flag has been set
						// update of individual counter settings
						individualCountersSettingsObj[accountKey].value++; // increments individual counter
						prefs.setCharPref("individualCountersSettings", JSON.stringify(individualCountersSettingsObj)); // updates individual counter settings

						// update of global counter
						if ( (globalCounterSettings.update & 4) == 4 ) { // if 'update global counter when updating any individual counter' flag has been set
							globalCounterUpdated = true;
						}
					}
				}
				else {
					SubjectManager.localConsole.logError("parseSubjectPt21", "Individual counter settings for account '" + accountKey + "' cannot be found");
				}
			}
		}

		if ( globalCounterUpdated ) {
			// update of global counter
			globalCounterSettings.value++; // increments global counter
			prefs.setCharPref("globalCounterSettings", JSON.stringify(globalCounterSettingsObj)); // saves global counter value
		}
	}

	return subject;
};

/**
 * Parses subject in advanced mode
 * Pt3-1: subject of filtered message
 * (filter messages)
 *
 * @param subject0 (string) subject to parse containing metadata
 * @param orgSubject (string) original subject
 * @param advancedMode (boolean) advanced mode
 * @return (string) parsed subject
 */
SubjectManager.parseSubjectPt31 = function (subject0, orgSubject, advancedMode)
{
	var subject = subject0;

	if ( advancedMode ) {
		// parsing of '%j'
		subject = SubjectManager.replacePattern(subject, "%", "j", orgSubject);
	}

	return subject;
};

/**
 * Parses subject in advanced mode
 * Pt4-0: metadata cleaning
 * (composed messages, filter messages & simulation)
 *
 * @param subject0 (string) subject to parse containing metadata
 * @param advancedMode (boolean) advanced mode
 * @return (string) parsed subject
 */
SubjectManager.parseSubjectPt40 = function (subject0, advancedMode)
{
	var subject = subject0;

	if ( advancedMode ) {
		// parsing of '%%'
		subject = SubjectManager.replacePattern(subject, "%", "%", "%");
	}

	return subject;
};

/**
 * Writes given message to log file
 *
 * @param message (string) message to log
 */
SubjectManager.writeMessageToFile = function (message)
{
	if ( SubjectManager.debugMode && SubjectManager.debugModeToFile && (SubjectManager.debugFileName != "") ) {
		try {
			// check existence of debug log file
			var debugFile = SubjectManager.VirtualLocalFile();
			debugFile.initWithPath(SubjectManager.debugFileName);

			if ( !debugFile.exists() ) {
				debugFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
			}

			// writing of message into debug log file
			var debugFileStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
									.createInstance(Components.interfaces.nsIFileOutputStream);

			debugFileStream.init(debugFile, SubjectManager.PR_WRONLY | SubjectManager.PR_APPEND, 0664, 0);

			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
							.createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(debugFileStream, "UTF-8", 0, 0);
			converter.writeString(message + "\n");
			converter.close(); // closes debugFileStream too
		}
		catch ( err ) {
			SubjectManager.debugModeToFile = false;

			SubjectManager.localConsole.logError("writeMessageToFile", "Error while writing log message to debug file \"" + message + "\" (" + err + ")", false);
		}
	}
};
