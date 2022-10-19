/* Formatters */
const TIME_FORMAT = Intl.DateTimeFormat('de-DE', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
const NUMBER_FORMAT = Intl.NumberFormat('de-DE');       //e.g. NUMBER_FORMAT.format(10000) -> '10.000'

/* HTML element IDs */
const EXECUTION_MODE_ID = 'executionMode';
const CLOCK_ID = 'clock';
const COUNTER_ID = 'counter';
const BLOCKER_ID = 'blocker';
const INC_COUNTER_ID = 'incCounter';
const RUN_BLOCKER_ID = 'runBlocker';
const THE_END_ID = 'theEnd';

/* event handlers */
function incCounter() {
    const counterElem = document.getElementById(COUNTER_ID);
    const value = Number(counterElem.innerHTML) + 1;
    counterElem.innerHTML = value;
}

function runBlocker(seconds) {
    const blockerElem = document.getElementById(BLOCKER_ID);
    blockerElem.innerHTML = "running";
    blockerElem.className = "running";

    /* Call block() in the next event handling cycle.
    This give the browser the oppotunity to update the changes applied to blockerElem.
     */
    setTimeout(
        () => { block(5.0); },
        100      // 100ms seams to be a reasonable delay
    );
}


function sharedWorkerMessage(event){
    console.log("sharedWorkerMessage")
    if(event.data.msg === "running"){
        const blockerElem = document.getElementById(BLOCKER_ID);
        blockerElem.innerHTML = "running";
        blockerElem.className = "running";
    }else {
        const blockerElem = document.getElementById(BLOCKER_ID);
        blockerElem.innerHTML = "idle";
        blockerElem.className = "idle";
    }
}

// worker
var worker;
if (window.Worker) {
    worker = new Worker(
        new URL('worker.js', import.meta.url),
        { type: 'module', name: 'simple worker' }
    );
    worker.onmessage = setStateIdle;
}

var sharedWorker; 
if (window.Worker) {
    sharedWorker = new SharedWorker(
        new URL('sharedWorker.js', import.meta.url),
        { type: 'module', name: 'shared worker' }
    );
    sharedWorker.port.onmessage = sharedWorkerMessage;
}


//IdleState
function setIdleState(){
const seconds = 2.0;
    this.runBlocker(seconds);
    const blockerElem = document.getElementById(BLOCKER_ID);
    blockerElem.innerHTML = "idle";
    blockerElem.className = "idle";
}

//block

function block(seconds) {
    const execElem = document.getElementById(EXECUTION_MODE_ID);
    const executionMode = execElem.options[execElem.selectedIndex].text;

    if (executionMode === 'main thread non blocking') {
        setTimeout(
            () => {
                const blockerElem = document.getElementById(BLOCKER_ID);
                blockerElem.innerHTML = "idle";
                blockerElem.className = "idle";
                console.log(`Nothing done while blocking.`);
            },
            seconds * 1000);
    }else if(executionMode == 'main thread blocking'){
        

                let counter= 0;
                const startDate = new Date();
            
                const endDate = startDate.getSeconds() + 5;
                while(new Date().getSeconds() <= endDate){
                    counter ++;
                }
                 setStateIdle(counter); 
              
            
    }else if(executionMode === 'dedicated worker'){
            worker.postMessage({waitFor: 5.0});
            setTimeout(
                () => {
                    const blockerElem = document.getElementById(BLOCKER_ID);
                    blockerElem.innerHTML = "idle";
                    blockerElem.className = "idle";
                    console.log(`Block`);
                },
                seconds * 1000);
    }else if(executionMode === 'shared worker'){
        const msg = {msg: "running"};
        sharedWorker.port.postMessage(msg);
    }
}

function setStateIdle(counter){
    const blockerElem = document.getElementById(BLOCKER_ID);
    blockerElem.innerHTML = "idle";
    blockerElem.className = "idle";
    console.log(counter)
}

/**
 * The clock.
 * 
 * We poll the system clock in a high frequence of 19ms.
 * Whenever the time presentation truncated to hh:mm:ss changes, we update
 * the DOM, which happens only once per second.
 */
var toggle = true;
var localTime = TIME_FORMAT.format(new Date());
function updateClock() {
    const now = TIME_FORMAT.format(new Date());
    if (now !== localTime) {
        localTime = now;
        const clockElem = document.getElementById(CLOCK_ID);
        clockElem.innerHTML = localTime;
        if (toggle) {
            clockElem.classList.add("fade");
        } else {
            clockElem.classList.remove("fade");
        }
        toggle = !toggle;
    }
}
setInterval(updateClock, 19);

/* set up to user interface and attach the handlers */
document.getElementById(CLOCK_ID).innerHTML = localTime;
document.getElementById(INC_COUNTER_ID).addEventListener('click', incCounter);
document.getElementById(RUN_BLOCKER_ID).addEventListener('click', () => runBlocker(5.0));

/* If block() blocks the main thread,
this event handler will delay the redering of the page.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    const endElement = document.getElementById(THE_END_ID);
    block(3.0);
    endElement.innerHTML = 'This is the End.';
    block(3.0);
});
