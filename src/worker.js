
onmessage = (event) => {
    let counter= 0;
    const startDate = new Date();

    const endDate = startDate.getSeconds() + 5;
    while(new Date().getSeconds() <= endDate){
        counter ++;
    }
    postMessage({counter})
    console.log(counter);
}

