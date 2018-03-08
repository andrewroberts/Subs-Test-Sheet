// Config
// ------

var SCRIPT_NAME = 'Subs Test Sheet'
var SCRIPT_VERSION = 'v1.0.dev'

// Code
// ----

function onOpen() {
  SpreadsheetApp
    .getUi()
    .createMenu('[ Subs Tests ]')
    .addItem('Run all tests', 'test_Subs_processEvent')
    .addItem('Dump config',   'test_Subs_dumpState')
    .addItem('Clear config',  'test_Subs_clearState')
    .addToUi()
}

function test_init() {

  var log = BBLog.getLog({
    level                : BBLog.Level.FINER, 
    displayFunctionNames : BBLog.DisplayFunctionNames.YES,
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
  
  var TRIAL_FINISHED = true
  var TRIAL_NOT_FINISHED = false
  
  try {

    // Full Subscription
    // -----------------
/*
    test_Subs_clearState()

    var sub = Subs.get({
      properties: config.properties,
      log: config.log,
    })
    
    var event = {event: SUBS_EVENT.NOSUB, isTrial: TRIAL_FALSE}
  
    checkState('NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)

    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('FULL - NOSUB (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED)
   
    event.event = SUBS_EVENT.CANCEL
    sub.processEvent(event)
    checkState('FULL - STARTED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET, TRIAL_NOT_FINISHED)

    event.event = SUBS_EVENT.START
    sub.processEvent(event)
    checkState('FULL - CANCELLED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED)

    event.event = SUBS_EVENT.EXPIRE
    sub.processEvent(event)
    checkState('FULL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_NOT_FINISHED)
    
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
    
    event = {event:SUBS_EVENT.START, isTrial: TRIAL_TRUE}
    
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

    // Check if expired
    // ----------------

    test_Subs_clearState()
    
    var config = {
      properties: config.properties,
      log: config.log,
    }

    var sub = Subs.get(config)
    
    // Default sub lengths, no sub
    
    sub.checkIfExpired()
    checkState('NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR)
    
    // Default sub trial length, trial started 
    
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
    sub.checkIfExpired() // Not expired yet as before default
    checkState('TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED)
    
    // 0 sub trial length, trial started
    
    config.trialLength = 0
    var sub = Subs.get(config)
    sub.checkIfExpired()    
    checkState('TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED)

    // default full sub length (0 trial length), full sub started

    test_Subs_clearState()
    config.trialLength = 0
    var sub = Subs.get(config)
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_FALSE})
    sub.checkIfExpired() // Not expired yet as before default full trial length
    checkState('FULL - NOSUB (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED)
        
    // 0 full sub trial length, trial started

    test_Subs_clearState()
    delete config.trialLength // Revert to default trial length
    config.fullLength = 0
    var sub = Subs.get(config)
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_FALSE})    
    sub.checkIfExpired()    
    checkState('FULL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_NOT_FINISHED)
*/    
    // Switch from trial to full sub
    
    test_Subs_clearState()
    
    config.fullLength = 0 // Expire immediately
    config.trialLength = 0 // Expire immediately
    var sub = Subs.get(config)
    
    // Start trial
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
    checkState('TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED)
    
    // Generate expire event (trial length 0 day)
    sub.checkIfExpired() 
    checkState('TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED)
    
    // Try for another trial and fail
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE}) 
    checkState('TRIAL - EXPIRED (START) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED)
    
    // Start full subscription
    sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_FALSE}) 
    checkState('FULL - EXPIRED (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET, TRIAL_FINISHED) 
    
    // Cancel subscription
    sub.processEvent({event:SUBS_EVENT.CANCEL, isTrial: TRIAL_FALSE}) 
    checkState('FULL - STARTED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET, TRIAL_FINISHED) 
    
    // Generate expire event
    sub.checkIfExpired() 
    checkState('FULL - CANCELLED (EXPIRE) => EXPIRED', TRIAL_NULL, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED)
    
    // User acknowledges expiration
    sub.processEvent(event)
    checkState('TRIAL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_NULL, SUBS_STATE.NOSUB, TIME_CLEAR, TRIAL_FINISHED)        
        
    config.log.info('!!!! ALL TESTS OK !!!!')

  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }
  
  return
  
  // Private Functions
  // -----------------
  
  function checkState(message, newTrial, newState, newTimeStartedSet, trialFinished) {

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
    
    checkTrialFinished(trialFinished)
    
    config.log.info('TEST OK: "' + message + '", ' + newTrial + ', ' + newState + ', ' + newTimeStartedSet)

    // Private Functions
    // -----------------
    
    function checkTrialFinished(checkFinished) {
    
      if (checkFinished) {
      
        if (!sub.isTrialFinished()) {
          throw new Error('Trial not finished')
        }
        
      } else {
      
        if (sub.isTrialFinished()) {
          throw new Error('Trial finished')
        }    
      }
      
    } // test_Subs_processEvent.checkState.checkTrialFinished()
  
  } // test_Subs_processEvent.checkState()


} // test_Subs_processEvent()

// Misc
// ----

function test_misc() {
  var a = -1
  var b = a.toString()
  return
}