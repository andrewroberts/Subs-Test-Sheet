// Config
// ------

var SCRIPT_NAME = 'Subs Test Sheet'
var SCRIPT_VERSION = 'v1.0.dev'

// Code
// ----

function test_init() {

  var log = BBLog.getLog({
    level                : BBLog.Level.INFO, 
    displayFunctionNames : BBLog.DisplayFunctionNames.NO,
    lock                 : LockService.getScriptLock(),
  })
    
  Assert.init({
    handleError    : Assert.HandleError.THROW, 
    sendErrorEmail : false, 
    emailAddress   : '',
    scriptName     : SCRIPT_NAME,
    scriptVersion  : SCRIPT_VERSION, 
  })
    
  return {
    properties : PropertiesService.getScriptProperties(),
    log        : log,
  }
    
} // test_init()

// function onGetSubsState_()             {return Subs.getState()}
// function onProcessSubsEvent_(event)    {return sub.processEvent(event)}

function test_Subs_dumpState() {
  var config = test_init()
  config.log.fine('Properties: ' + JSON.stringify(config.properties.getProperties()))
}

function test_Subs_clearState() {
  test_init().properties.deleteAllProperties()
}

function test_Subs_processEvent() {

  var config = test_init()
  
  var TRIAL_TRUE  = true
  var TRIAL_FALSE = false
  var TRIAL_NULL  = null
  
  var TIME_SET   = true
  var TIME_CLEAR = false
  
  var SUBS_EVENT = Subs.SUBS_EVENT
  var SUBS_STATE = Subs.SUBS_STATE
  
  try {

    test_Subs_clearState()
    var sub = Subs.get(config.properties, config.log)

    // Full Subscription
    // -----------------

    var event = {event: SUBS_EVENT.NOSUB, trial: TRIAL_FALSE}
  
    checkState('NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)

    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('FULL - NOSUB (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)
   
    event.event = SUBS_EVENT.CANCEL
    sub.processEvent(event)
    checkState('FULL - STARTED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET)

    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('FULL - CANCELLED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)

    event.event = SUBS_EVENT.EXPIRE
    sub.processEvent(event)
    checkState('FULL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)
    
    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('FULL - EXPIRED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET)
    
    event.event = SUBS_EVENT.CANCEL
    sub.processEvent(event)
    event.event = SUBS_EVENT.EXPIRE
    sub.processEvent(event)
    checkState('FULL - STARTED (CANCEL, EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)

    event.event = SUBS_EVENT.ACKNOWLEDGE
    sub.processEvent(event)
    checkState('FULL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)

    // Trial Subscription
    // ------------------
    
    event = {event:SUBS_EVENT.START, trial: TRIAL_TRUE}
    
    sub.processEvent(event)
    checkState('TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)
   
    event.event = SUBS_EVENT.CANCEL
    sub.processEvent(event)
    checkState('TRIAL - STARTED (CANCEL) => CANCELLED', TRIAL_TRUE, SUBS_STATE.CANCELLED, TIME_SET)

    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('TRIAL - CANCELLED (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)

    event.event = SUBS_EVENT.EXPIRE
    sub.processEvent(event)
    checkState('TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)
    
    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('TRIAL - EXPIRED (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET)
    
    event.event = SUBS_EVENT.CANCEL
    sub.processEvent(event)
    event.event = SUBS_EVENT.EXPIRE
    sub.processEvent(event)
    checkState('TRIAL - STARTED (CANCEL, EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR)

    event.event = SUBS_EVENT.ACKNOWLEDGE
    sub.processEvent(event)
    checkState('TRIAL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)    

    config.log.info('!!!! ALL TESTS OK !!!!')

  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }
  
  return
  
  // Private Functions
  // -----------------
  
  function checkState(message, newTrial, newState, newTimeStartedSet) {

    var oldTrial       = sub.isTrial()       
    var oldState       = sub.getState()
    var oldTimeStarted = sub.getTimeStarted()

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
    
    config.log.info('TEST OK: "' + message + '", ' + newTrial + ', ' + newState + ', ' + newTimeStartedSet)
    
  } // test_Subs_processEvent.checkState()
  
} // test_Subs_processEvent()

// Misc
// ----

function test_misc() {

  test_init()
  
  

  return
}