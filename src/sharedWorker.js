
const ports = new Set();

function broadcastMessage(message) {
    for (const port of ports) {
        try {
            port.postMessage(message);
        } catch (err) {
            ports.delete(port);
        }
    }
}

onerror = (errorEvent) => {
    console.log(`Error in sharedWorker: ${errorEvent.message}`);
}

function handleMessageEvent(messageEvent) {
    if(messageEvent.data.msg === "running"){
        console.log("in loop")
        broadcastMessage(messageEvent.data);
        let counter= 0;
        const startDate = new Date();
        const endDate = startDate.getSeconds() + 5;
        while(new Date().getSeconds() <= endDate){
            counter ++;
        }
        broadcastMessage({msg: "idle"}); 

    }
    
}

onconnect = registerCaller;

function registerCaller(connectEvent) {
    console.log("registerCall")
    const port = connectEvent.ports[0];
    port.onmessage = handleMessageEvent;
    ports.add(port);
    
}

