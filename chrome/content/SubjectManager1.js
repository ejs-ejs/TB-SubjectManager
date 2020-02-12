if ( !SubjectManager ) var SubjectManager = {};


/**
 * Performs some cleaning when addon is updated
 */
SubjectManager.cleanUpdate = function ()
{
	var addonVersionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
								.getService(Components.interfaces.nsIVersionComparator);

	if ( this.prefs.prefHasUserValue("version") ) {
		// [ 0 ; 0.1.8a1 [
		if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.1.8a1") < 0 ) {
			// - replaces subjects list separator '\n' (new line) with ';'
			// - encodes only subjects, not separator any more
			var subjectsListString = unescape(this.prefs.getCharPref("subjectsList")); // decodes string
			var subjectsListSeparator = this.prefs.getCharPref("subjectsListSeparator");

			if ( subjectsListString != "" ) { // if subjects list is empty
				var subjectsListArray = subjectsListString.split(new RegExp("\n", "g")); // splits subjects list string around predefined separator into subjects array
				subjectsListString = this.escapeArray(subjectsListArray).join(subjectsListSeparator); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string
			}

			this.prefs.setCharPref("subjectsList", subjectsListString);

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v0.1.8: some cleaning has been performed", true);
		}

		// [ 0 ; 0.2.2a1 [
		if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.2a1") < 0 ) {
			// - changes name of preference 'prefixesKeep1' with 'keep1stPrefix'
			if ( this.prefs.prefHasUserValue("prefixesKeep1") ) {
				this.prefs.setBoolPref("keep1stPrefix", this.prefs.getBoolPref("prefixesKeep1"));
				this.prefs.clearUserPref("prefixesKeep1");
			}

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v0.2.2: some cleaning has been performed", true);
		}

		// [ 0.2.4a1 ; 0.2.5a1 [
		if ( (addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.4a1") >= 0)
				&& (addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.5a1") < 0) )
		{
			// - replaces '%c' metadata with '%g'
			this.subjectsList = this.prefs.getCharPref("subjectsList");
			this.subjectsListSeparator = this.prefs.getCharPref("subjectsListSeparator");

			if ( this.subjectsList != "" ) {
				var subjectsArray = new Array();
				subjectsArray = this.unescapeArray(this.subjectsList.split(new RegExp(this.subjectsListSeparator, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects

				for ( var idx = 0 ; idx < subjectsArray.length ; idx++ ) {
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "c", "%g");
				}

				this.subjectsList = this.escapeArray(subjectsArray).join(this.subjectsListSeparator); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string
				this.prefs.setCharPref("subjectsList", this.subjectsList); // saves subjects list in preferences
			}

			// - replaces name of preference 'subjectsCounter' with 'globalCounter'
			if ( this.prefs.prefHasUserValue("subjectsCounter") ) {
				this.prefs.setIntPref("globalCounter", this.prefs.getIntPref("subjectsCounter"));
				this.prefs.clearUserPref("subjectsCounter");
			}

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v0.2.5: some cleaning has been performed", true);
		}

		// [ 0.X.Y ; 0.4.0a1 [
		if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.4.0a1") < 0 ) {
			// [ 0.3.1a1 ; 0.4.0a1 [
			if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.3.1a1") >= 0 ) {
				// - replaces name of preference 'handleIdentities' with 'handleCounterIdentities'
				if ( this.prefs.prefHasUserValue("handleIdentities") ) {
					this.prefs.setBoolPref("handleCounterIdentities", this.prefs.getBoolPref("handleIdentities"));
					this.prefs.clearUserPref("handleIdentities");
				}
			}

			// [ 0.2.0a1 ; 0.4.0a1 [
			if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.0a1") >= 0 ) {
				if ( this.prefs.prefHasUserValue("defaultSubject") ) {
					// - builds default subjects array with old common values of default subject (subject, 'insert only if empty', 'enabled')
					// - removes preference 'defaultSubject'
					var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
											.getService(Components.interfaces.nsIMsgAccountManager);

					var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // gets accounts list
					var account = null;
					var accountIdentities = null;
					var accountIdentity = null;

					var defaultSubjectArray = {};

					var insertDefaultSubject = ( this.prefs.prefHasUserValue("insertDefaultSubject") );
					var insertOnlyIfEmpty = ( this.prefs.prefHasUserValue("insertOnlyIfEmpty") );

					for ( var idx = 0 ; idx < accounts.count() ; idx++ ) { // for each account of accounts list
						account = accounts.queryAt(idx); // gets account
						accountIdentity = account.defaultIdentity; // gets account default identity

						if ( accountIdentity != null ) { // if account has a default identity (= skips "Local Folder")
							defaultSubjectArray[accountIdentity.key] = new SubjectManager.DefaultSubject(
								this.prefs.getCharPref("defaultSubject"), // already escaped
								insertOnlyIfEmpty,
								insertDefaultSubject
							); // creates a new default subject object and adds it to the default subjects array
						}
					}

					this.prefs.setCharPref("defaultSubjects", JSON.stringify(defaultSubjectArray)); // saves default subjects setting

					this.prefs.clearUserPref("defaultSubject");
				}

				// - removes preference 'insertDefaultSubject'
				if ( this.prefs.prefHasUserValue("insertDefaultSubject") ) {
					this.prefs.clearUserPref("insertDefaultSubject");
				}

				// - removes preference 'insertOnlyIfEmpty'
				if ( this.prefs.prefHasUserValue("insertOnlyIfEmpty") ) {
					this.prefs.clearUserPref("insertOnlyIfEmpty");
				}
			}

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v0.4.1: some cleaning has been performed", true);
		}

		// [ 0.X.Y ; 0.5.0a1 [
		if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.5.0a1") < 0 ) {
			// [ 0.2.0 ; 0.5.0a1 [
			if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.0a1") >= 0 ) {
				// - replaces '%A' metadata with '%B'

				// main subjects list
				this.subjectsList = this.prefs.getCharPref("subjectsList");
				this.subjectsListSeparator = this.prefs.getCharPref("subjectsListSeparator");

				if ( this.subjectsList != "" ) {
					var subjectsArray = new Array();
					subjectsArray = this.unescapeArray(this.subjectsList.split(new RegExp(this.subjectsListSeparator, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects

					for ( var idx = 0 ; idx < subjectsArray.length ; idx++ ) {
						subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "A", "%B");
					}

					this.subjectsList = this.escapeArray(subjectsArray).join(this.subjectsListSeparator); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string
					this.prefs.setCharPref("subjectsList", this.subjectsList); // saves subjects list in preferences
				}

				// default subjects
				this.defaultSubjects = this.prefs.getCharPref("defaultSubjects");

				if ( (this.defaultSubjects != null) && (this.defaultSubjects != "") ) { // if default subjects string is valid
					var defaultSubjectsObj = null;

					try {
						var defaultSubjectsObj = JSON.parse(this.defaultSubjects); // parses default subjects as JSON string
					}
					catch ( err ) {
						this.localConsole.logError("cleanUpdate", err);
					}

					if ( (defaultSubjectsObj != null) && (typeof(defaultSubjectsObj) === 'object') ) { // (JSCTSABT)
						for ( var accountId in defaultSubjectsObj ) {
							defaultSubjectsObj[accountId].defaultSubject = escape(this.replacePattern(unescape(defaultSubjectsObj[accountId].defaultSubject), "%", "A", "%B"));
						}
					}
					else {
						defaultSubjectsObj = {};

						this.localConsole.logError("cleanUpdate", "Default subjects string is damaged: '" + this.defaultSubjects + "'");
					}

					this.prefs.setCharPref("defaultSubjects", JSON.stringify(defaultSubjectsObj)); // saves default subjects setting in preferences
				}

				this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v0.5.0: some cleaning has been performed", true);
			}

			this.prefs.setIntPref("newVersion", 3); // forces subject manager filter icon to be displayed
		}

		// [ 0.2.0 ; 1.1.0a1 [
		if ( (addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.2.0") >= 0)
				&& (addonVersionChecker.compare(this.prefs.getCharPref("version"), "1.1.0a1") < 0) )
		{
			// - replaces '%m' metadata with '%n'

			// - replaces '%Y' metadata with '%y'
			// - replaces '%X' metadata with '%x'
			// - replaces '%M' metadata with '%m'
			// - replaces '%B' metadata with '%b'
			// - replaces '%D' metadata with '%d'
			// - replaces '%W' metadata with '%w'

			// - replaces '%S' metadata with '%j'

			// subjects list
			this.subjectsList = this.prefs.getCharPref("subjectsList");

			if ( (this.subjectsList != null) && (this.subjectsList != "") ) { // if subjects list string is valid
				this.subjectsListSeparator = this.prefs.getCharPref("subjectsListSeparator");

				var subjectsArray = this.unescapeArray(this.subjectsList.split(new RegExp(this.subjectsListSeparator, "g"))); // splits subjects list string around predefined separator into subjects array and decodes subjects

				for ( var idx = 0 ; idx < subjectsArray.length ; idx++ ) {
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "m", "%n");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "Y", "%y");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "X", "%x");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "M", "%m");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "B", "%b");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "D", "%d");
					subjectsArray[idx] = this.replacePattern(subjectsArray[idx], "%", "W", "%w");
				}

				this.subjectsList = this.escapeArray(subjectsArray).join(this.subjectsListSeparator); // encodes subjects (necessary for accentuated and special characters) and converts subjects array to predefined-separator-separated subjects list string
				this.prefs.setCharPref("subjectsList", this.subjectsList); // saves subjects list in preferences
			}

			// default subjects
			this.defaultSubjects = this.prefs.getCharPref("defaultSubjects");

			if ( (this.defaultSubjects != null) && (this.defaultSubjects != "") ) { // if default subjects string is valid
				var defaultSubjectsObj = null;

				try {
					var defaultSubjectsObj = JSON.parse(this.defaultSubjects); // parses default subjects as JSON string
				}
				catch ( err ) {
					this.localConsole.logError("cleanUpdate", err);
				}

				if ( (defaultSubjectsObj != null) && (typeof(defaultSubjectsObj) === 'object') ) { // (JSCTSABT)
					var defaultSubject = "";

					for ( var accountId in defaultSubjectsObj ) {
						defaultSubject = unescape(defaultSubjectsObj[accountId].defaultSubject);
						defaultSubject = this.replacePattern(defaultSubject, "%", "m", "%n");
						defaultSubject = this.replacePattern(defaultSubject, "%", "Y", "%y");
						defaultSubject = this.replacePattern(defaultSubject, "%", "X", "%x");
						defaultSubject = this.replacePattern(defaultSubject, "%", "M", "%m");
						defaultSubject = this.replacePattern(defaultSubject, "%", "B", "%b");
						defaultSubject = this.replacePattern(defaultSubject, "%", "D", "%d");
						defaultSubject = this.replacePattern(defaultSubject, "%", "W", "%w");
						defaultSubjectsObj[accountId].defaultSubject = escape(defaultSubject);
					}
				}
				else {
					defaultSubjectsObj = {};

					this.localConsole.logError("cleanUpdate", "Default subjects string is damaged: '" + this.defaultSubjects + "'");
				}

				this.prefs.setCharPref("defaultSubjects", JSON.stringify(defaultSubjectsObj)); // saves default subjects setting in preferences
			}

			// filter subject settings
			this.filterSubjectsSettings = this.prefs.getCharPref("filterSubjectsSettings");

			if ( (this.filterSubjectsSettings != null) && (this.filterSubjectsSettings != "") ) { // if filter subject settings string is valid
				var filterSubjectsSettingsObj = null;

				try {
					var filterSubjectsSettingsObj = JSON.parse(this.filterSubjectsSettings); // parses filter subjects settings as JSON string
				}
				catch ( err ) {
					this.localConsole.logError("cleanUpdate", err);
				}

				if ( (filterSubjectsSettingsObj != null) && (typeof(filterSubjectsSettingsObj) === 'object') ) { // (JSCTSABT)
					var filterSubject = "";

					for ( var accountId in filterSubjectsSettingsObj ) {
						filterSubject = unescape(filterSubjectsSettingsObj[accountId].subject);
						filterSubject = this.replacePattern(filterSubject, "%", "m", "%n");
						filterSubject = this.replacePattern(filterSubject, "%", "Y", "%y");
						filterSubject = this.replacePattern(filterSubject, "%", "X", "%x");
						filterSubject = this.replacePattern(filterSubject, "%", "M", "%m");
						filterSubject = this.replacePattern(filterSubject, "%", "B", "%b");
						filterSubject = this.replacePattern(filterSubject, "%", "D", "%d");
						filterSubject = this.replacePattern(filterSubject, "%", "W", "%w");
						filterSubject = this.replacePattern(filterSubject, "%", "S", "%j");
						filterSubjectsSettingsObj[accountId].subject = escape(filterSubject);
					}
				}
				else {
					filterSubjectsSettingsObj = {};

					this.localConsole.logError("cleanUpdate", "Filter subjects settings string is damaged: '" + this.filterSubjectsSettings + "'");
				}

				this.prefs.setCharPref("filterSubjectsSettings", JSON.stringify(filterSubjectsSettingsObj)); // saves default subjects setting
			}

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v1.1.0: some cleaning has been performed", true);
		}

		// [ 0.3.0 ; 1.1.1a1 [
		if ( (addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.3.0") >= 0)
				&& (addonVersionChecker.compare(this.prefs.getCharPref("version"), "1.1.1a1") < 0) )
		{
			// - embeds global counter settings into one and only object
			// - adds the 'update', 'format' and 'reset' settings
			var globalCounterSettingsObj = {};

			var globalCounterTmp = 1;
			var globalCounterUpdateTmp = 5;
			var globalCounterFormatTmp = "0";

			if ( this.prefs.prefHasUserValue("globalCounter") ) {
				globalCounterTmp = this.prefs.getIntPref("globalCounter");
				this.prefs.clearUserPref("globalCounter");
			}
			if ( this.prefs.prefHasUserValue("globalCounterUpdate") ) {
				globalCounterUpdateTmp = this.prefs.getIntPref("globalCounterUpdate");
				this.prefs.clearUserPref("globalCounterUpdate");
			}
			if ( this.prefs.prefHasUserValue("globalCounterFormat") ) {
				globalCounterFormatTmp = this.prefs.getCharPref("globalCounterFormat");
				this.prefs.clearUserPref("globalCounterFormat");
			}

			globalCounterSettingsObj['global'] = new SubjectManager.CounterSettings(
				globalCounterTmp,		// value
				globalCounterUpdateTmp,	// update
				globalCounterFormatTmp, // format
				0						// reset
			); // creates a new global counter object

			this.prefs.setCharPref("globalCounterSettings", JSON.stringify(globalCounterSettingsObj)); // saves global counter settings

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v1.1.1: some cleaning has been performed", true);
		}

		// [ 0.X.Y ; 1.1.2a1 [
		if ( addonVersionChecker.compare(this.prefs.getCharPref("version"), "1.1.2a1") < 0 ) {
			// - removes preference 'autoPrefixesList'
			if ( this.prefs.prefHasUserValue("autoPrefixesList") ) {
				this.prefs.clearUserPref("autoPrefixesList");
			}

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v1.1.2: some cleaning has been performed", true);
		}

		// [ 0.3.0 ; 1.2.0a1 [
		if ( (addonVersionChecker.compare(this.prefs.getCharPref("version"), "0.3.0") >= 0)
				&& (addonVersionChecker.compare(this.prefs.getCharPref("version"), "1.2.0a1") < 0) )
		{
			// - embeds all individual counters settings into one and only object
			// - adds the 'update', 'format' and 'reset' settings
			var individualCountersSettingsObj = {};

			var individualCountersTmp = "";
			var individualCountersUpdateTmp = 1;
			var individualCountersFormatTmp = "0";

			if ( this.prefs.prefHasUserValue("individualCounters") ) {
				individualCountersTmp = this.prefs.getCharPref("individualCounters");
				this.prefs.clearUserPref("individualCounters");
			}
			if ( this.prefs.prefHasUserValue("individualCountersUpdate") ) {
				individualCountersUpdateTmp = this.prefs.getIntPref("individualCountersUpdate");
				this.prefs.clearUserPref("individualCountersUpdate");
			}
			if ( this.prefs.prefHasUserValue("individualCountersFormat") ) {
				individualCountersFormatTmp = this.prefs.getCharPref("individualCountersFormat");
				this.prefs.clearUserPref("individualCountersFormat");
			}

			if ( individualCountersTmp != "" ) { // if individual counters string is not empty
				var individualCountersArrayTmp1 = individualCountersTmp.split(new RegExp(";", "g")); // splits individual counters string ("idX:N;idY:M;idZ:P;...") around ';' into individual counters array
				var individualCountersArrayTmp2 = null;

				for ( var idx = 0 ; idx < individualCountersArrayTmp1.length ; idx++ ) { // for each individual counter
					individualCountersArrayTmp2 = individualCountersArrayTmp1[idx].split(new RegExp(":", "g")); // splits counter info ("idX:N")

					individualCountersSettingsObj[individualCountersArrayTmp2[0]] = new SubjectManager.CounterSettings(
						individualCountersArrayTmp2[1],	// value
						individualCountersUpdateTmp,	// update
						individualCountersFormatTmp, 	// format
						0								// reset
					); // creates a new individual counter settings object
				}
			}

			this.prefs.setCharPref("individualCountersSettings", JSON.stringify(individualCountersSettingsObj)); // saves individual counters settings

			this.localConsole.logInformation("cleanUpdate", "Updating addon from v" + this.prefs.getCharPref("version") + " to v1.2.0: some cleaning has been performed", true);
		}
	}
};

/**
 * Initializes startup
 */
SubjectManager.initializeOverLayStartup = function ()
{
	if ( this.isTBVersionEqualOrHigherThan("3.3a1pre") ) { // if current TB version uses gecko engine v2.0 (starting from TB v3.3a1pre)
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
		AddonManager.getAddonByID(this.addOnId, function (addon) { // asks for addon id
			SubjectManager.overlayStartup(addon.version);
		});
	}
	else {
		var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
								.getService(Components.interfaces.nsIExtensionManager);
		this.overlayStartup(extensionManager.getItemForID(this.addOnId).version);
	}

	// for TB version >= 3.3a1pre process will be pursued in overlayStartup() as soon as addon manager has loaded information (AddonManager.getAddonByID())
	// for TB version < 3.3a1pre process is pursued instantly
};

/**
 * Initializes add-on when starting Thunderbird composing session
 *
 * @param currentVersion (string) addon version
 */
SubjectManager.overlayStartup = function (currentVersion)
{
	// system info
	var runtimeInfo = Components.classes["@mozilla.org/xre/app-info;1"]
					.getService(Components.interfaces.nsIXULRuntime);
	var osVersion = runtimeInfo.OS;
	var x3264 = ( runtimeInfo.is64Bit ) ? "64bits" : "32bits";
	var procInfo = runtimeInfo.XPCOMABI;

	var tbVersion = ( "@mozilla.org/xre/app-info;1" in Components.classes ) ?
		Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo)
			.version
		:
		Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch)
			.getCharPref("app.version");

	this.localConsole.logInformation("initializeOverlayStartup", "OS: " + osVersion + " " + x3264 + " (" + procInfo + ")", true);
	this.localConsole.logInformation("initializeOverlayStartup", "Thunderbird: v" + tbVersion, true);
	this.localConsole.logInformation("initializeOverlayStartup", this.addOnName + ": v" + currentVersion, true);

	// startup
	var newVersion = 0;

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions." + this.addOnName + ".");

	// nsIPrefBranch2 allows to observe for changes to preferences
	// During Gecko 13 development, nsIPrefBranch2 was deprecated, and its methods moved to nsIPrefBranch
	// Calling .QueryInterface(Components.interfaces.nsIPrefBranch2) is no longer required, although it still works
	if ( this.isTBVersionEqualOrHigherThan("13.0a1") ) { // if current TB version uses gecko engine v13.0
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
	}
	else {
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	}

	this.prefs.addObserver("", this, false); // receives notifications if any preference changes

	this.cleanUpdate(); // makes some cleaning when updating addon version

	// checkings of global counter settings
	var globalCounterSettingsObj = this.createGlobalCountersSettingsObject(this.prefs.getCharPref("globalCounterSettings"));

	this.prefs.setCharPref("globalCounterSettings", JSON.stringify(globalCounterSettingsObj)); // saves global counter settings

	// checkings of individual counters settings
	this.identityNameObj = this.buildIdentityNameTable();
	this.identitiesObj = this.buildIdentitiesTable();

	var individualCountersSettingsObj = this.createIndividualCountersSettingsObject(this.prefs.getCharPref("individualCountersSettings"));

	this.prefs.setCharPref("individualCountersSettings", JSON.stringify(individualCountersSettingsObj)); // saves individual counters values

	// reset of counters
	this.resetAllCounters(this.prefs);

	// management of version update
	if ( !this.prefs.prefHasUserValue("version") ) { // if version is undefined (= if this is first run)
		newVersion = 2;
	}
	else if ( currentVersion != this.prefs.getCharPref("version") ) { // ... or if version is different from current version
		newVersion = 1;
	}

	this.debugMode = this.prefs.getBoolPref("debugMode");
	this.debugModeToFile = this.prefs.getBoolPref("debugModeToFile");
	this.debugFileName = unescape(this.prefs.getCharPref("debugFileName")); // decodes string

	if ( (newVersion > 1) || (this.prefs.prefHasUserValue("newVersion") && (this.prefs.getIntPref("newVersion") == 3)) ) { // if this is a new install
		// add of addon toolbar button
		var subjectManagerOverlayButton = document.getElementById("subjectManagerOverlayButton");
		var nextButton = document.getElementById("button-tag"); // next button reference

		var toolbar = document.getElementById("mail-bar3"); // main toolbar for TB v3

		if ( toolbar == null ) { // if main toolbar is null (= this is not TB v3)
			toolbar = document.getElementById("mail-bar2"); // main toolbar for TB v2
		}

		if ( (toolbar != null) && (nextButton != null) && (subjectManagerOverlayButton == null) ) { // if toolbar is not null and next button is not null and custom button is not already added to toolbar
			toolbar.insertItem("subjectManagerOverlayButton", nextButton, null, false); // adds button
			toolbar.setAttribute('currentset', toolbar.currentSet);
			document.persist(toolbar.id, "currentset");

			this.localConsole.logInformation("overlayStartup", "Overlay button has been displayed", true);
		}
	}

	if ( newVersion > 0 ) { // if version has changed
		// add of addon version
		this.prefs.setIntPref("newVersion", newVersion);
		this.prefs.setCharPref("version", currentVersion);

		// display of help page
		this.displayPopUpMessage(this.addOnName + " v" + currentVersion + " has been installed");
		//this.displayPage("chrome://" + this.addOnName + "/content/help/help.htm");
	}

	// initialization of filter subject class
	var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
								.getService(Components.interfaces.nsIMsgFolderNotificationService);

	notificationService.addListener(new SubjectManager.newMailListener(), notificationService.msgAdded);

	this.localConsole.logInformation("initializeOverlayStartup", "Initialization has been completed", true);
};


/**
 * (class) Handles new messages
 */
SubjectManager.newMailListener = function ()
{
    this.msgAdded = function (aMsgHdr) {
		try {
			// reading of settings
			var prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions." + SubjectManager.addOnName + ".");
			prefs.QueryInterface(Components.interfaces.nsIPrefBranch);

			SubjectManager.debugMode = prefs.getBoolPref("debugMode");
			SubjectManager.debugModeToFile = prefs.getBoolPref("debugModeToFile");
			SubjectManager.debugFileName = unescape(prefs.getCharPref("debugFileName")); // decodes string

			Components.utils.import("resource://gre/modules/iteratorUtils.jsm");

			// reading of new mails parameters
			var msgAccountKey = aMsgHdr.accountKey;

			SubjectManager.localConsole.logInformation("newMailListener", "New message for account #" + msgAccountKey + ": subject = '" + aMsgHdr.subject + "' / messageId = '" + aMsgHdr.messageId + "' / flags = " + aMsgHdr.flags);

			var msgHdrFolder = aMsgHdr.folder;

			if ( msgHdrFolder == null ) {
				SubjectManager.localConsole.logError("newMailListener", "Message folder for received message has not been found");
			}
			else if ( aMsgHdr.isRead // = Components.interfaces.nsMsgMessageFlags.Read = 0x00000001
				 //|| ((aMsgHdr.flags & Components.interfaces.nsMsgMessageFlags.Replied) == Components.interfaces.nsMsgMessageFlags.Replied) // 0x00000002
				 || ((aMsgHdr.flags & Components.interfaces.nsMsgMessageFlags.New) != Components.interfaces.nsMsgMessageFlags.New) ) // 0x00010000
			{
				SubjectManager.localConsole.logInformation("newMailListener", "This is not a new message (flags = " + aMsgHdr.flags + ")");
			}
			else {
				SubjectManager.localConsole.logInformation("newMailListener", "New message received for account #" + msgAccountKey + ": folder = '" + msgHdrFolder.folderURL + "' / subject = '" + aMsgHdr.subject + "' / messageId = '" + aMsgHdr.messageId + "' / flags = " + aMsgHdr.flags);

				// search of identity of recipient
				var identityKey = "";

				var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
										.getService(Components.interfaces.nsIMsgAccountManager);
				var accounts = new SubjectManager.VirtualArray(accountManager.accounts, Components.interfaces.nsIMsgAccount); // accounts list
				var account = null;
				var accountIdentities = null;
				var accountIdentity = null;
				var accountServer = null;
				var msgServerKey = "";

				// search of identity
				if ( msgAccountKey == "" ) {
					SubjectManager.localConsole.logWarning("newMailListener.folderSearch", "New received message has no account key defined");

					if ( msgHdrFolder.server != null ) {
						SubjectManager.localConsole.logInformation("newMailListener.folderSearch", "New received message is for server #" + msgHdrFolder.server.key + ": name = " + msgHdrFolder.server.prettyName + " / folder = '" + msgHdrFolder.folderURL + "'");

						msgServerKey = msgHdrFolder.server.key;
					}
					else {
						SubjectManager.localConsole.logWarning("newMailListener.folderSearch", "New received message server has not been found");
					}
				}

				for ( var idx = 0 ; (idx < accounts.count()) && (identityKey == "") ; idx++ ) { // for each account of accounts list
					account = accounts.queryAt(idx); // gets account object
					accountServer = account.incomingServer; // gets related server

					if ( account.key == msgAccountKey ) { // if account of recipient has been found
						accountIdentities = new SubjectManager.VirtualArray(account.identities, Components.interfaces.nsIMsgIdentity); // gets identities

						for ( var jdx = 0 ; (jdx < accountIdentities.count()) && (identityKey == "") ; jdx++ ) { // for each identity of current account
							accountIdentity = accountIdentities.queryAt(jdx); // gets identity object

							if ( aMsgHdr.mime2DecodedRecipients.indexOf(accountIdentity.email) != -1 ) { // if email address has been found
								identityKey = accountIdentity.key;

								SubjectManager.localConsole.logInformation("newMailListener.identitySearch", "Identity of recipient has been found: identity key = " + identityKey + " / email = " + accountIdentity.email + " / server key = " + accountServer.key);
							}
						}
					}
					else if ( msgServerKey == accountServer.key ) {
						identityKey = account.key;

						SubjectManager.localConsole.logInformation("newMailListener.identitySearch", "Identity of recipient has been found (default): identity key = " + identityKey + " / email = " + account.defaultIdentity.email + " / server key = " + accountServer.key);
					}
				}

				// search of templates folder related to current folder
				var rootFolder = msgHdrFolder.rootFolder;
				var templateFolder = null;
				var rootSubFolders = rootFolder.subFolders;
				var subFolder = null;

				// '^': start of string
				// '.+': any character 1 or several times (folder path but last subfolder)
				// '/': litteral character '/' (slash)
				// '(.+)': any character 1 or several times (last subfolder) -> group #1
				// '$': end of string
				var reSubFolderName = new RegExp("^.+/(.+)$");

				var subFolderName = null;

				while ( rootSubFolders.hasMoreElements() && (templateFolder == null) ) {
					subFolder = rootSubFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder);

					subFolderName = subFolder.URI.match(reSubFolderName);

					if ( (subFolderName != null) && (subFolderName[1] == "Templates") ) {
						templateFolder = subFolder;

						SubjectManager.localConsole.logInformation("newMailListener.templatesSubfolderSearch", "Templates subfolder has been found: URI = '" + templateFolder.URI + "'");
					}
				}

				// reset of counters
				SubjectManager.resetAllCounters(prefs);

				//
				if ( identityKey == "" ) {
					SubjectManager.localConsole.logWarning("newMailListener.identitySearch", "Identity of recipient has not been found");
				}
				else if ( templateFolder == null ) {
					SubjectManager.localConsole.logWarning("newMailListener.templatesSubfolderSearch", "Templates subfolder has not been found");
				}
				else {
					//
					var filterSubjectsList = SubjectManager.JSONparse(prefs.getCharPref("filterSubjectsSettings"), SubjectManager.preProcessLoadSettings, new Array("subject")); // parses filter subjects settings as JSON string

					if ( typeof(filterSubjectsList) !== 'object' ) { // if result is not an object (nb: arrays are objects)
						filterSubjectsList = {};

						SubjectManager.localConsole.logWarning("newMailListener", "Filter subjects list is empty");
					}

					//
					var currentFolderFiltersList = msgHdrFolder.getFilterList(msgWindow);
					var vCurrentFolderFilter = null;
					var filterKey = "";

					var msgAccountServer = msgHdrFolder.server;
					var protocol = "";
					var userHost = "";
					var subj = "";

					// '^': start of string
					// '([^:]+://[^/]+)': (protocol://user@server) -> group #1
					//    '[^:]+': any character but ':' (colon) 1 or several times (protocol)
					//    '://': litteral string '://'
					//    '[^/]+': any character but '/' (slash) 1 or several times (user@server)
					// '/': litteral character '/' (slash)
					// '.+': any character 1 or several times
					// '&subject=': litteral string '&subject='
					// '(.+)': any character 1 or several times (subject) -> group #2
					// '$': end of string
					var reMailboxMsg = new RegExp("^([^:]+)://([^/]+)/.+&subject=(.+)$");

					var srcMailboxMsg = null;

					var msgUri = "";
					var newMsgUri = "";
					var folderMessages = null;
					var msgHdr = null;

					var newSubj = "";

					// search of filters related to the addon
					for ( var idx = 0 ; idx < currentFolderFiltersList.filterCount ; idx++ ) { // for each filter
						vCurrentFolderFilter = new SubjectManager.VirtualFilter(currentFolderFiltersList.getFilterAt(idx));

						for ( var jdx = 0 ; jdx < vCurrentFolderFilter.actionsCount() ; jdx++ ) { // for each action of filter
							action = vCurrentFolderFilter.realFilterObj.getActionAt(jdx);

							if ( action.type == Components.interfaces.nsMsgFilterAction.Reply ) { // nsMsgFilterAction.Reply = 9
								SubjectManager.localConsole.logInformation("newMailListener.reply", "Action #" + jdx +  " of filter #" + idx + " is \"Reply with template message '" + action.strValue + "'\"");

								protocol = "";
								userHost = "";
								subj = "";

								if ( vCurrentFolderFilter.realFilterObj.enabled ) { // if filter is enabled
									SubjectManager.localConsole.logInformation("newMailListener.reply.filter", "Filter #" + idx + " '" + vCurrentFolderFilter.realFilterObj.filterName + "' is enabled");

									filterKey = msgAccountServer.key + "_" + vCurrentFolderFilter.realFilterObj.filterName;

									if ( filterSubjectsList[filterKey] == null ) {
										SubjectManager.localConsole.logError("newMailListener.reply.filterAction", "Filter subject settings cannot be retrieved");
									}
									else if ( !filterSubjectsList[filterKey].enabled ) {
										SubjectManager.localConsole.logInformation("newMailListener.reply.filterAction", "Filter subject is disabled");
									}
									else {
										SubjectManager.localConsole.logInformation("newMailListener.reply.filterAction", "Filter key is '" + filterKey + "'");

										srcMailboxMsg = action.strValue.match(reMailboxMsg);

										if ( srcMailboxMsg != null ) {
											protocol = srcMailboxMsg[1];
											userHost = srcMailboxMsg[2];
											subj = srcMailboxMsg[3];

											SubjectManager.localConsole.logInformation("newMailListener.reply.filterAction", "Message information: protocol = " + protocol + " / userHost = " + userHost + " / subject = " + subj);

											folderMessages = templateFolder.messages;

											newSubj = "";

											// search of template message in templates folder matching the template message to reply with
											while ( folderMessages.hasMoreElements() ) { // for each message of templates folder
												msgHdr = folderMessages.getNext().QueryInterface(Components.interfaces.nsIMsgDBHdr); // gets message header
												msgUri = templateFolder.URI + "?messageId=" + msgHdr.messageId + "&subject=" + msgHdr.mime2DecodedSubject; // builds related uri

												SubjectManager.localConsole.logInformation("newMailListener.reply.templateMessageSearch", "Template message URI is '" + msgUri + "'");

												if ( msgUri == action.strValue ) { // if current message matches the template message to reply with
													// building of new subject
													newSubj = unescape(filterSubjectsList[filterKey].subject); // decodes subject

													var advancedMode = prefs.getBoolPref("subjectsAdvancedMode");
													newSubj = SubjectManager.parseSubjectPt10(newSubj, advancedMode); // parses date/time metadata
													newSubj = SubjectManager.parseSubjectPt21(newSubj, identityKey, advancedMode); // parses counters metadata
													newSubj = SubjectManager.parseSubjectPt31(newSubj, aMsgHdr.subject, advancedMode); // parses subject metadata
													newSubj = SubjectManager.parseSubjectPt40(newSubj, advancedMode); // cleans metadata

													newMsgUri = templateFolder.URI + "?messageId=" + msgHdr.messageId + "&subject=" + newSubj;

													SubjectManager.localConsole.logInformation("newMailListener.reply.newSubject", "New subject is \"" + newSubj + "\"");
													SubjectManager.localConsole.logInformation("newMailListener.reply.newSubject", "New URI is '" + newMsgUri);

													SubjectManager.localConsole.logInformation("newMailListener.reply.newSubject", "URI '" + msgUri + "' will be replaced by '" + newMsgUri + "'");

													msgHdr.subject = newSubj; // replaces subject of template message
													vCurrentFolderFilter.realFilterObj.temporary = false;

													action.strValue = newMsgUri; // updates filter setting

													currentFolderFiltersList.saveToDefaultFile(); // makes changes persistent
												}
												else {
													SubjectManager.localConsole.logWarning("newMailListener.reply.templateMessageSearch", "Template message (URI '" + msgUri + "') does not match the template message to reply with (URI '" + action.strValue +"')");
												}
											}

											if ( newSubj == 0 ) {
												SubjectManager.localConsole.logError("newMailListener.reply.templateMessageSearch", "Template message '" + action.strValue + "' has not been found");
											}
										}
										else {
											SubjectManager.localConsole.logError("newMailListener.reply.uriParsing", "Error while parsing URI '" + action.strValue + "'");
										}
									}
								}
								else {
									SubjectManager.localConsole.logInformation("newMailListener.reply.filter", "Filter #" + idx + " '" + vCurrentFolderFilter.realFilterObj.filterName + "' is disabled");
								}
							}
							else {
								SubjectManager.localConsole.logInformation("newMailListener.filterAction", "Action #" + jdx +  " of filter #" + idx + " is not handled (type = " + action.type + ")");
							}
						}

						if ( jdx == 0 ) {
							SubjectManager.localConsole.logInformation("newMailListener.filterAction", "No action defined for filter #" + idx);
						}
					}

					if ( idx == 0 ) {
						SubjectManager.localConsole.logInformation("newMailListener.filter", "No filter defined");
					}
				}
			}
		}
		catch ( err ) {
			SubjectManager.localConsole.logError("newMailListener", err);
		}
	}
};


window.addEventListener("load", function() { SubjectManager.initializeOverLayStartup(); }, false);
