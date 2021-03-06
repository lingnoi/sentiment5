let priceData = {}
// let currentDataAsset = getCurrentAsset()

let myPriceChart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
        datasets: [{
            backgroundColor: Color('#4dc9f6').alpha(0).rgbString(),
            borderColor: '#4dc9f6',
            fill: false,
            data: []
        }]
    },
    options: {
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }]
        }
    }
})


function sendNeedPriceDataMsg(symbol) {
    const message = { msgType: 'NEED_PRICE_DATA', payload: symbol }
    console.log(`send `, message)
    chrome.runtime.sendMessage(null, message);
}

function priceMessageHandler(message, _sender, _sendResp) {
    if (gOnChangingAsset) {
        console.log(`changing asset -> skip message`)
        const currentAsset = getCurrentAsset()
        if (!(currentAsset in priceData)) {
            priceData[currentAsset] = { data: [] }
        }
        myPriceChart.data.datasets[0].data = []
        myPriceChart.data.datasets[0].data = [...priceData[currentAsset].data]
        myPriceChart.update()
        gOnChangingAsset = false
        sendNeedPriceDataMsg(currentAsset)
    }
    else if (message.msgType === 'PRICE') {
        console.log(`${message.msgType}`, message.payload)
        const currentAsset = getCurrentAsset()
        if (!(currentAsset in priceData)) {
            priceData[currentAsset] = { data: [] }
        }

        // if (currentDataAsset !== currentAsset) {
        //     currentDataAsset = currentAsset
        //     myPriceChart.data.datasets[0].data = []
        //     myPriceChart.data.datasets[0].data = [...priceData[currentAsset].data]
        // }

        if (message.payload.symbol === currentAsset) {
            let d = new Date()
            d.setTime(message.payload.data.time)
            const newPrice = parseFloat(message.payload.data.price)
            const newDataPoint = { x: message.payload.data.time, y: newPrice }
            priceData[currentAsset].data.push(newDataPoint)
            myPriceChart.data.datasets[0].data.push(newDataPoint)
            console.log(`price data: `, myPriceChart.data.datasets[0].data.length)
            myPriceChart.update()
        }
    }
}

chrome.runtime.onMessage.addListener(priceMessageHandler)
