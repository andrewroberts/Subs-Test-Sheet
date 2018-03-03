// Config
// ------

var SCRIPT_NAME = 'Subs Test Sheet'
var SCRIPT_VERSION = 'v1.0.dev'

var Log_ = null
var Properties_ = null

// Code
// ----

function test_init() {

  Log_ = BBLog.getLog({
    level                : BBLog.Level.ALL, 
    displayFunctionNames : BBLog.DisplayFunctionNames.NO,
    lock                 : LockService.getScriptLock(),
  })
    
  Assert.init({
    handleError    : Assert.HandleError.THROW, 
    sendErrorEmail : false, 
    emailAddress   : 'andrew@roberts.net',
    scriptName     : SCRIPT_NAME,
    scriptVersion  : SCRIPT_VERSION, 
  })
    
  Properties_ = PropertiesService.getScriptProperties() 
    
} // test_init()

// function onGetSubsState_()             {return Subs.getState()}
// function onProcessSubsEvent_(event)    {return Subs.processEvent(event)}

function test_Subs_dumpState() {
  test_init()
  Log_.fine('Properties: ' + JSON.stringify(Properties_.getProperties()))
}

function test_Subs_clearState() {
  test_init()
  Properties_.deleteAllProperties()
}

function test_Subs_processEvent() {

  test_init()
  test_Subs_clearState()
  
  var TRIAL_TRUE  = true
  var TRIAL_FALSE = false
  var TRIAL_NULL  = null
  
  var TIME_SET   = true
  var TIME_CLEAR = false
  
  try {

    // Full Subscription
    // -----------------

    var event = {event: SUBS_EVENTS.NOSUB, trial: false}
  
    checkState('NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)

    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('FULL - NOSUB (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)
   
    event.event = SUBS_EVENTS.CANCEL
    Subs.processEvent(event)
    checkState('FULL - STARTED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET)

    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('FULL - CANCELLED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)

    event.event = SUBS_EVENTS.EXPIRE
    Subs.processEvent(event)
    checkState('FULL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)
    
    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('FULL - EXPIRED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)
    
    event.event = SUBS_EVENTS.CANCEL
    Subs.processEvent(event)
    event.event = SUBS_EVENTS.EXPIRE
    Subs.processEvent(event)
    checkState('FULL - STARTED (CANCEL, EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)

    event.event = SUBS_EVENTS.ACKNOWLEDGE
    Subs.processEvent(event)
    checkState('FULL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)

    // Trial Subscription
    // ------------------
    
    event.trial = true
    
    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)
   
    event.event = SUBS_EVENTS.CANCEL
    Subs.processEvent(event)
    checkState('TRIAL - STARTED (CANCEL) => CANCELLED', TRIAL_TRUE, SUBS_STATE.CANCELLED, TIME_SET)

    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('TRIAL - CANCELLED (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)

    event.event = SUBS_EVENTS.EXPIRE
    Subs.processEvent(event)
    checkState('TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)
    
    event.event = SUBS_EVENTS.START
    Subs.processEvent(event)
    checkState('TRIAL - EXPIRED (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)
    
    event.event = SUBS_EVENTS.CANCEL
    Subs.processEvent(event)
    event.event = SUBS_EVENTS.EXPIRE
    Subs.processEvent(event)
    checkState('TRIAL - STARTED (CANCEL, EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)

    event.event = SUBS_EVENTS.ACKNOWLEDGE
    Subs.processEvent(event)
    checkState('TRIAL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)    

    Log_.info('!!!! ALL TESTS OK !!!!')

  } catch (error) {
  
    Assert.handleError(error, 'Test failed', Log)
  }
  
  return
  
  // Private Functions
  // -----------------
  
  function checkState(message, newTrial, newState, newTimeStartedSet) {

    var oldTrial       = Subs.isTrial()        
    var oldState       = Subs.getState()
    var oldTimeStarted = Subs.getTimeStarted()

    if (oldTrial !== newTrial) {
      throw new Error(message + ' - Bad trial, was ' + oldTrial + ', should be ' + newTrial)
    }

    if (oldState !== newState) {
      throw new Error(message + ' - Bad state, was ' + oldState + ', should be ' + newState)
    }

    if (newTimeStartedSet && typeof oldTimeStarted !== 'number') {
      throw new Error(message + ' - Bad time, was ' + oldTimeStarted + ', should be set')
    }
    
    if (!newTimeStartedSet && oldTimeStarted !== null) {
      throw new Error(message + ' - Bad time, was ' + oldTimeStarted + ', should be clear (null)')
    }
    
    Log_.info('TEST OK: "' + message + '", ' + newTrial + ', ' + newState + ', ' + newTimeStartedSet)
    
  } // test_Subs_processEvent.checkState()
  
} // test_Subs_processEvent()

// Misc
// ----

function test_misc() {

  test_init()

  var properties = PropertiesService.getScriptProperties()
  var log = Log_
  var sub = Subs.get(properties, log)
  var state = sub.getState()
  
  return
}