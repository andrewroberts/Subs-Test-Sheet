// Config
// ------

var SCRIPT_NAME = 'Subs Test Sheet'
var SCRIPT_VERSION = 'v1.0.dev'

var DISPLAY_FUNCTION_NAMES = false // Debugger won't work if truw

var TRIAL_TRUE  = true
var TRIAL_FALSE = false

var TIME_SET   = true
var TIME_CLEAR = false

var SUBS_EVENT = Subs.SUBS_EVENT
var SUBS_STATE = Subs.SUBS_STATE

var TRIAL_FINISHED = true
var TRIAL_NOT_FINISHED = false

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
    level                : BBLog.Level.INFO, 
    displayFunctionNames : BBLog.DisplayFunctionNames[DISPLAY_FUNCTION_NAMES ? 'YES' : 'NO'],
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
    properties         : PropertiesService.getScriptProperties(),
    log                : log,
    fullLength         : 0, // Expire immediately
    trialLength        : 0, // Expire immediately    
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
    
  try {

    test_Subs_clearState()    
    var sub = Subs.get(config)
    
    var TESTS = [
    
      // INPUTS                             OUTPUTS
      // ======                             =======

      // Event                 Trial        Text                                      ExpTrial     ExpState              Exp         ExpTrialFin         ExpResp
      // -----                 -----        ----                                      --------     --------              ---         -----------         -------

// Check helper functions first
// sub.checkIfExpired() 
// Test triggers made and deleted
// What state to leave in after error

      // 1. Full loop with expire

      [SUBS_EVENT.START,       TRIAL_FALSE, '1a. FULL - NOSUB (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1b. FULL - STARTED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1c. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],

      // 2. Full loop with cancel, then expire
      
      [SUBS_EVENT.START,       TRIAL_FALSE, '2a. FULL - NOSUB (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '2b. FULL - STARTED (CANCEL) => CANCELLED',   TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '2c. FULL - CANCELLED (EXPIRE) => EXPIRED',   TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '2d. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      
      // 3. Full loop with "no action" on all states
      
      [SUBS_EVENT.START,       TRIAL_FALSE, '3a FULL - NOSUB (START) => STARTED',         TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.START,       TRIAL_FALSE, '3b. FULL - START (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '3c. FULL - START (ACK) => STARTER',          TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '3d. FULL - STARTED (CANCEL) => CANCELLED',   TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '3e. FULL - CANCELLED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '3f. FULL - CANCELLED (ACK) => CANCELLED',    TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '3g. FULL - CANCELLED (EXPIRE) => EXPIRED',   TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '3h. FULL - EXPIRED (CANCEL) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '3i. FULL - EXPIRED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.START,       TRIAL_FALSE, '3j. FULL - EXPIRED (START) => STARTED',      TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '3k. FULL - STARTED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '3l. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],

      // 4. Trial, to full after attempt at second trial

      [SUBS_EVENT.START,       TRIAL_TRUE,  '4a. TRIAL - NOSUB (START) => STARTED',       TRIAL_TRUE,  SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_TRUE,  '4b. TRIAL - STARTED (EXPIRE) => EXPIRED',    TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '4c. TRIAL - EXPIRED (START) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     'The user has already had one trial'],
      [SUBS_EVENT.START,       TRIAL_FALSE, '4d. FULL  - EXPIRED (START) => STARTED',     TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '4e. FULL  - STARTED (CANCEL) => CANCELLED',  TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '4f. TRIAL - CANCELLED (START) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     'The user has already had one trial'],      
      [SUBS_EVENT.START,       TRIAL_FALSE, '4g. FULL  - CANCELLED (START) => STARTED',   TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_FINISHED,     ''],      
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '4h. FULL  - STARTED (CANCEL) => CANCELLED',  TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '4i. FULL  - CANCELLED (EXPIRE) => EXPIRED',  TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '4j. TRIAL - EXPIRED (ACK) => NOSUB',         TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '4k. TRIAL - NOSUB (START) => NOSUB',         TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_FINISHED,     'The user has already had one trial'],
    ]

    TESTS.forEach(function(test) {
      var response = sub.processEvent({event:test[0], isTrial: test[1]})
      checkState_(sub, config, test[2], test[3], test[4], test[5], test[6], test[7], response)
    })
  
    config.log.info('!!!! ALL TESTS OK !!!!')

  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }
  
} // test_Subs_processEvent()

function test_checkIfExpired() {

  var config = test_init()
    
  try {

    test_Subs_clearState()
    var sub = Subs.get(config)
    
    // Default sub lengths, no sub
    
    sub.checkIfExpired()
    checkState_(sub, '5a. TRIAL - EXPIRED (NOSUB) => NOSUB', TRIAL_FALSE, SUBS_STATE.NOSUB, TIME_CLEAR, TRIAL_NOT_FINISHED, '', '')    
    
    // Default sub trial length, trial started 
    
    var response = sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
    sub.checkIfExpired() // Not expired yet as before default
    checkState_(sub, config, '5b. TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_FALSE, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED, '', response)    
        
  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }

} // test_checkIfExpired()

function checkState_(sub, config, testMessage, newTrial, newState, newTimeStarted, trialFinished, expectedMessage, actualMessage) {
  
  var oldTrial       = sub.isTrial()       
  var oldState       = sub.getState()
  var oldTimeStarted = (sub.getTimeTimerStarted() === -1) ? false : true
  
  if (oldTrial !== newTrial) {
    throw new Error(testMessage + ' - Bad trial, was ' + oldTrial + ', should be ' + newTrial)
  }
  
  if (oldState !== newState) {
    throw new Error(testMessage + ' - Bad state, was ' + oldState + ', should be ' + newState)
  }
  
  if (newTimeStarted !== oldTimeStarted) {
    throw new Error(testMessage + ' - Bad time, was ' + oldTimeStarted + ', should be clear (null)')
  }
  
  if (actualMessage !== expectedMessage) {
    throw new Error(testMessage + ' - Bad response, was "' + actualMessage + '", should be "' + expectedMessage + '"')    
  }
  
  checkTrialFinished(trialFinished)
  
  config.log.info('TEST OK: "' + testMessage + '", ' + newTrial + ', ' + newState + ', ' + newTimeStarted + ', ' + trialFinished + ', "' + expectedMessage + '"')
  
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
    
  } // checkState_.checkTrialFinished()
  
} // checkState_()

// Misc
// ----

function test_misc() {
  var a = -1
  var b = a.toString()
  return
}