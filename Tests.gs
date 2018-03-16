// TODO
// ----

// Test triggers made and deleted
// What state to leave in after error
// Test concurrent operation

// Config
// ------

var SCRIPT_NAME    = 'Subs Test Sheet'
var SCRIPT_VERSION = 'v1.0.dev'

var TEST_DISPLAY_FUNCTION_NAMES = true // Debugger won't work if truw
var TEST_DEBUG_LEVEL            = BBLog.Level.ALL

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
    .createMenu('[ Subs ]')
    .addItem('Run all tests', 'test_Subs_all')
    .addItem('Dump config',   'test_Subs_dumpState')
    .addItem('Clear config',  'test_Subs_clearState')
    .addToUi()
}

// Tests

function test_Subs_all() {

  var config = test_init()
  test_Subs_lock()
//  test_Subs_processEvent()
//  test_checkIfExpired()
  config.log.info('!!!! ALL TESTS OK !!!!')  
}

function test_Subs_lock() {

  // A small one to run with debug on
  var config = test_init()
  test_Subs_clearState()    
  
  var sub = Subs.get(config)
  var sub1 = Subs.get(config)
  
  var response = sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
  checkState_(sub, config, '0.1a. TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', response)

  var response = sub1.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
  checkState_(sub1, config, '0.1a. TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', response)

  var response = sub.processEvent({event:SUBS_EVENT.EXPIRE})
  checkState_(sub, config, '0.1b. TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_FALSE, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_NOT_FINISHED, '', response)

  var response = sub1.processEvent({event:SUBS_EVENT.EXPIRE})
  checkState_(sub1, config, '0.1b. TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_FALSE, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_NOT_FINISHED, '', response)

  var response = sub.processEvent({event:SUBS_EVENT.ACKNOWLEDGE})
  checkState_(sub, config, '0.1c. TRIAL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_FALSE, SUBS_STATE.NOSUB, TIME_CLEAR, TRIAL_NOT_FINISHED, '', response)

  var response = sub1.processEvent({event:SUBS_EVENT.ACKNOWLEDGE})
  checkState_(sub1, config, '0.1c. TRIAL - EXPIRED (ACKNOWLEDGE) => NOSUB', TRIAL_FALSE, SUBS_STATE.NOSUB, TIME_CLEAR, TRIAL_NOT_FINISHED, '', response)

  return
}

function test_Subs_processEvent() {

  var config = test_init()
  
  try {

    test_Subs_clearState()    
    var sub = Subs.get(config)
    
    var TESTS = [
    
      // INPUTS                             OUTPUTS
      // ======                             =======

      // Event                 Trial        Text (1st state (event) => 2nd state)     ExpTrial     ExpState              Exp         ExpTrialFin         ExpResp
      // -----                 -----        ----                                      --------     --------              ---         -----------         -------

      // 1. Full loop with expire

      [SUBS_EVENT.START,       TRIAL_FALSE, '1.1a. FULL - NOSUB (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.1b. FULL - STARTED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.1c. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],

      // 2. Full loop with cancel, then expire
      
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.2a. FULL - NOSUB (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.2b. FULL - STARTED (CANCEL) => CANCELLED',   TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.2c. FULL - CANCELLED (EXPIRE) => EXPIRED',   TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.2d. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      
      // 3. Full loop with "no action" on all states
      
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.3a. FULL - NOSUB (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.3b. FULL - START (START) => STARTED',        TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.3c. FULL - START (ACK) => STARTER',          TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.3d. FULL - STARTED (CANCEL) => CANCELLED',   TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.3e. FULL - CANCELLED (CANCEL) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.3f. FULL - CANCELLED (ACK) => CANCELLED',    TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.3g. FULL - CANCELLED (EXPIRE) => EXPIRED',   TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.3h. FULL - EXPIRED (CANCEL) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.3i. FULL - EXPIRED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.3j. FULL - EXPIRED (START) => STARTED',      TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.3k. FULL - STARTED (EXPIRE) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.3l. FULL - EXPIRED (ACK) => NOSUB',          TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_NOT_FINISHED, ''],

      // 4. Trial, to full after attempt at second trial

      [SUBS_EVENT.START,       TRIAL_TRUE,  '1.4a. TRIAL - NOSUB (START) => STARTED',       TRIAL_TRUE,  SUBS_STATE.STARTED,   TIME_SET,   TRIAL_NOT_FINISHED, ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_TRUE,  '1.4b. TRIAL - STARTED (EXPIRE) => EXPIRED',    TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '1.4c. TRIAL - EXPIRED (START) => EXPIRED',     TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     'The user has already had one trial'],
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.4d. FULL  - EXPIRED (START) => STARTED',     TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.4e. FULL  - STARTED (CANCEL) => CANCELLED',  TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '1.4f. TRIAL - CANCELLED (START) => CANCELLED', TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     'The user has already had one trial'],      
      [SUBS_EVENT.START,       TRIAL_FALSE, '1.4g. FULL  - CANCELLED (START) => STARTED',   TRIAL_FALSE, SUBS_STATE.STARTED,   TIME_SET,   TRIAL_FINISHED,     ''],      
      [SUBS_EVENT.CANCEL,      TRIAL_FALSE, '1.4h. FULL  - STARTED (CANCEL) => CANCELLED',  TRIAL_FALSE, SUBS_STATE.CANCELLED, TIME_SET,   TRIAL_FINISHED,     ''],
      [SUBS_EVENT.EXPIRE,      TRIAL_FALSE, '1.4i. FULL  - CANCELLED (EXPIRE) => EXPIRED',  TRIAL_FALSE, SUBS_STATE.EXPIRED,   TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.ACKNOWLEDGE, TRIAL_FALSE, '1.4j. TRIAL - EXPIRED (ACK) => NOSUB',         TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_FINISHED,     ''],
      [SUBS_EVENT.START,       TRIAL_TRUE,  '1.4k. TRIAL - NOSUB (START) => NOSUB',         TRIAL_FALSE, SUBS_STATE.NOSUB,     TIME_CLEAR, TRIAL_FINISHED,     'The user has already had one trial'],
    ]

    TESTS.forEach(function(test) {
      var response = sub.processEvent({event:test[0], isTrial: test[1]})
      checkState_(sub, config, test[2], test[3], test[4], test[5], test[6], test[7], response)
    })
  
  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }
  
} // test_Subs_processEvent()

function test_checkIfExpired() {
    
  try {

    var config = test_init()

    test_Subs_clearState()
    var sub = Subs.get(config)
    
    // Default sub lengths, no sub
    
    sub.checkIfExpired()
    checkState_(sub, config, '2.1a. TRIAL - NOSUB () => NOSUB', TRIAL_FALSE, SUBS_STATE.NOSUB, TIME_CLEAR, TRIAL_NOT_FINISHED, '', '')    
    
    // Default trial length, trial started 
    
    var response = sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
    checkState_(sub, config, '2.2a. TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', response)        
    sub.checkIfExpired()    
    checkState_(sub, config, '2.2b. TRIAL - STARTED () => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', '')    

    // 0 trial length
    
    test_Subs_clearState()
    
    config.trialLength = 0 // Expire immediately    

    var sub = Subs.get(config)
    
    var response = sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_TRUE})
    checkState_(sub, config, '2.3a. TRIAL - NOSUB (START) => STARTED', TRIAL_TRUE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', response)
    
    sub.checkIfExpired()    
    checkState_(sub, config, '2.3b. TRIAL - STARTED (EXPIRE) => EXPIRED', TRIAL_FALSE, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_FINISHED, '', '')    

    // 0 full sub length
    
    test_Subs_clearState()
    
    config.fullLength = 0 // Expire immediately    

    var sub = Subs.get(config)
    
    var response = sub.processEvent({event:SUBS_EVENT.START, isTrial: TRIAL_FALSE})
    checkState_(sub, config, '2.4a. FULL - NOSUB (START) => STARTED', TRIAL_FALSE, SUBS_STATE.STARTED, TIME_SET, TRIAL_NOT_FINISHED, '', response)
    
    sub.checkIfExpired()    
    checkState_(sub, config, '2,4b. FULL - STARTED (EXPIRE) => EXPIRED', TRIAL_FALSE, SUBS_STATE.EXPIRED, TIME_CLEAR, TRIAL_NOT_FINISHED, '', '')    

  } catch (error) {
  
    Assert.handleError(error, 'Test failed', config.log)
  }

} // test_checkIfExpired()

// Helpers

function test_init() {

  var log = BBLog.getLog({
    level                : TEST_DEBUG_LEVEL, 
    displayFunctionNames : BBLog.DisplayFunctionNames[TEST_DISPLAY_FUNCTION_NAMES ? 'YES' : 'NO'],
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
  }
    
} // test_init()

function test_Subs_dumpState() {
  var config = test_init()
  config.log.info('Properties: ' + JSON.stringify(config.properties.getProperties()))
}

function test_Subs_clearState() {
  test_init().properties.deleteAllProperties()
}

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

var Properties_ = (function(ns) {

  

  return ns

})({})

// Misc
// ----

function test_misc() {

}