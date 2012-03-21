// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████                       ██████              ██          ██
//  ██                           ██  ██              ██          ██
//  ██     █████ ████ █████      ██  ██ █████ █████ █████ █████ █████ ████ █████ █████
//  ██     ██ ██ ██   ██ ██      █████  ██ ██ ██ ██  ██   ██     ██   ██      ██ ██ ██
//  ██     ██ ██ ██   █████      ██  ██ ██ ██ ██ ██  ██   █████  ██   ██   █████ ██ ██
//  ██     ██ ██ ██   ██         ██  ██ ██ ██ ██ ██  ██      ██  ██   ██   ██ ██ ██ ██
//  ██████ █████ ██   █████      ██████ █████ █████  ████ █████  ████ ██   █████ █████
//                                                                               ██
//                                                                               ██
//
// ------------------------------------------------------------------------------------------------------------------------
// Core Bootstrap - Sets up the framework, then loads core classes and modules

	// --------------------------------------------------------------------------------
	// Log constants

		/**
		 * @type {Object}	A selection of constants that can be used with xjsfl.output.log
		 */
		Log =
		{
			EVENT_SPLASH			:'EVENT_SPLASH',
			EVENT_INIT				:'EVENT_INIT',
		
			FILE_FIND				:'FILE_FIND',
			FILE_LOAD				:'FILE_LOAD',
			FILE_COPY				:'FILE_COPY',
		
			CLASS_LOAD				:'CLASS_LOAD',
			CLASS_REGISTER			:'CLASS_REGISTER',
		
			SYSTEM_INFO				:'SYSTEM_INFO',
			SYSTEM_MESSAGE			:'SYSTEM_MESSAGE',
			SYSTEM_WARNING			:'SYSTEM_WARNING',
			SYSTEM_ERROR			:'SYSTEM_ERROR',
			
			USER_INFO				:'USER_INFO',
			USER_MESSAGE			:'USER_MESSAGE',
			USER_WARNING			:'USER_WARNING',
			USER_ERROR				:'USER_ERROR',
		};

	// --------------------------------------------------------------------------------
	// initialize
	
		(function()
		{
			// clear existing values, in case we're reloading
				for(var name in xjsfl)
				{
					if( ! /^(reload|uri|reset|loading|debugState)$/.test(name) )
					{
						delete xjsfl[name];
					}
				}

			// temp trace
				trace = fl.trace;
				
			// placeholder for settings
				xjsfl.settings = {};

			// output needs to be created before main library is loaded
				xjsfl.output =
				{
					/**
					 * Traces an "> xjsfl:" message to the Output panel
					 * @param	{String}	message		The message to log
					 * @param	{Boolean}	highlight	An optional Boolean to highlight the message
					 */
					trace:function(message, highlight)
					{
						if(highlight)
						{
							fl.trace('');
							message = String(message).toUpperCase();
						}
						fl.trace('> xjsfl: ' + message);
					},

					/**
					 * Logs a message to the xjsfl log, and optionally traces it
					 * @param	{String}	message		The text of the log message
					 * @param	{Boolean}	highlight	An optional Boolean to highlight the message
					 * @param	{Boolean}	trace		An optional Boolean to trace the message, defaults to true
					 * @param	{Boolean}	clear		An optional Boolean to clear the log file, defaults to false
					 * @returns
					 */
					log:function(message, highlight, trace, clear)
					{
						// trace
							trace = typeof trace !== 'undefined' ? trace : true;
							if(trace)
							{
								this.trace(message, highlight);
							}

						// variables
							var newLine	= fl.version.substr(0, 3).toLowerCase() === 'win' ? '\r\n' : '\n';
							var uri		= xjsfl.uri + 'core/temp/xjsfl.log';
							var date	= new Date();
							var time	= date.toString().match(/\d{2}:\d{2}:\d{2}/) + ':' + (date.getMilliseconds() / 1000).toFixed(3).substr(2);
						
						// clear
							if(clear)
							{
								FLfile.remove(uri);
								xjsfl.output.log('xjsfl log created');
							}

						// log
							if(highlight)
							{
								message = String(message).toUpperCase();
							}
							FLfile.write(uri, (highlight ? newLine : '') + time + '\t' + message + newLine, 'append');
					}

				}

		})()

	// --------------------------------------------------------------------------------
	// load framework
	
		// --------------------------------------------------------------------------------
		// attempt to load core
	
			try
			{
				// --------------------------------------------------------------------------------
				// set up
	
					// log
						xjsfl.output.log('running core bootstrap...', true, true, true)
	
					// utility function
						function loadScript(path)
						{
							xjsfl.output.log('loading "{core}jsfl/' +path+ '"');
							fl.runScript(xjsfl.uri + 'core/jsfl/' +path);
						}
	
					// flags
						xjsfl.loading = true;
	
					// never debug the bootstrap!
						var debugState = false;
						if(xjsfl.debug)
						{
							debugState = xjsfl.debug.state;
							xjsfl.debug.state = false;
						}

				// --------------------------------------------------------------------------------
				// load files
				
					// need to load Utils & URI libraries first as core methods rely on them
						xjsfl.output.log('loading core...', true);
						loadScript('libraries/utils/utils.jsfl');
						loadScript('libraries/file/uri.jsfl');
						loadScript('libraries/file/uri-list.jsfl');
						loadScript('libraries/xjsfl.jsfl');
						loadScript('libraries/framework/globals.jsfl');
						
					// add core and user URIs
						if(FLfile.exists(fl.configURI + 'xJSFL/'))
						{
							xjsfl.settings.uris.add(fl.configURI + 'xJSFL/', 'core');
						}
						xjsfl.settings.uris.add(xjsfl.uri + 'core/', 'core');
						xjsfl.settings.uris.add(xjsfl.uri + 'user/', 'user');
	
					// initialize
						xjsfl.initGlobals(this, 'window');
						delete loadScript;
	
					// now, once xjsfl has loaded, register core libraries
						xjsfl.classes.register('Utils', Utils, '{core}jsfl/libraries/utils/utils.jsfl');
						xjsfl.classes.register('URI', URI, '{core}jsfl/libraries/file/uri.jsfl');
						xjsfl.classes.register('URIList', URIList, '{core}jsfl/libraries/file/uri-list.jsfl');
			}
			catch(error)
			{
				xjsfl.output.log('error running core bootstrap', true);
				fl.runScript(xjsfl.uri + 'core/jsfl/libraries/utils/utils.jsfl');
				fl.runScript(xjsfl.uri + 'core/jsfl/libraries/xjsfl.jsfl');
				fl.runScript(xjsfl.uri + 'core/jsfl/libraries/framework/globals.jsfl');
				xjsfl.initGlobals(this, 'window');
				xjsfl.debug.error(error, true);
			}
			
			
		// --------------------------------------------------------------------------------
		// attempt to load core libraries
	
			if(xjsfl.loading)
			{
				try
				{
					xjsfl.output.log('loading core libraries...', true);
					xjsfl.classes.load(['filesystem', 'template', 'class', 'base', 'events']);
					xjsfl.classes.load('libraries/**'); // could just send a folder refrernce through here (it knows it needs to be .jsfl)
				}
				catch(error)
				{
					xjsfl.output.log('error loading core libraries', true);
					debug(error, true);
				}			
			}
			
		// --------------------------------------------------------------------------------
		// attempt to load modules
	
			if(xjsfl.loading)
			{
				try
				{
					xjsfl.output.log('initialising modules...', true);
					xjsfl.modules.find();
				}
				catch(error)
				{
					xjsfl.output.log('error initializing modules', true);
					debug(error, true);
				}			
			}
			
		// --------------------------------------------------------------------------------
		// attempt to load user bootstrap & finalise
	
			if(xjsfl.loading)
			{
				try
				{
					xjsfl.output.log('running user bootstrap...', true);
					xjsfl.file.load('//user/jsfl/bootstrap.jsfl');
				}
				catch(error)
				{
					xjsfl.output.log('error running user bootstrap', true);
					debug(error, true);
				}			
			}
	
		// --------------------------------------------------------------------------------
		// cleanup
		
			if(xjsfl.loading)
			{
				xjsfl.output.log('ready!', true);
				delete xjsfl.loading;
			}

