const offset = new Date().getTimezoneOffset() / 60
const iconUrl = 'http://openweathermap.org/img/wn/'
const links = [...document.querySelectorAll('nav a')]
const main = document.querySelector('main')
const modalForm = document.querySelector('.modal-form')
MicroModal.init();
let state
import MicroModal from 'micromodal'; 

function getValidateDateValue(value) {
    return value.toString().length === 1? '0' + value.toString() : value
}


async function fetchComingEvents() {
    const response = await fetch('http://localhost:7070/api/coming-events')
    const data = await response.json()
    return data
}

function createProgress({count, length}) {
    const tdPred = document.createElement('td')
    const percent = document.createElement('span')
    const progress = document.createElement('progress')
    if (length === 0) {
        percent.textContent = '0%'
        progress.setAttribute('value', 0)
    } else {
        percent.textContent = `${Math.round(count * 100 / length)}%`
        progress.setAttribute('value', Math.round(count * 100 / length))
    }
    tdPred.className = "td-pred"
    progress.setAttribute('max', '100')
    tdPred.insertAdjacentElement('beforeend', progress)
    tdPred.insertAdjacentElement('beforeend', percent)
    return tdPred
}

function getPrediction(prediction, name) {
    const {totemsPredictions, teamAway, teamHome} = prediction
    const totem = totemsPredictions.find(totem => totem.name === name)
    if (totem.prediction === 'home') {
        return teamHome
    } else if(totem.prediction === 'away') {
        return teamAway
    }
    return 'draw'
}

function createContainerHeader(prediction) {
    const containerHeader = document.createElement('div')
    containerHeader.className = 'container-head'
    const moonData = document.createElement('div') 
    const weatherData = document.createElement('div')
    moonData.className = 'moon-data'
    weatherData.className = 'weather'
    drawMoonData(prediction.moonPhase, moonData)
    drawWeather(prediction.weather, weatherData)
    containerHeader.append(moonData, weatherData)
    return containerHeader
}

function appendPredictions(totems, table, prediction) {
    totems.forEach(totem => {
        const tr = document.createElement('tr')
        const tdName = document.createElement('td')
        tdName.textContent = totem.name
        tdName.setAttribute('id', totem.name)
        const tdAccuracy = createProgress(totem)
        const tdPrediction = document.createElement('td')
        tdPrediction.textContent = getPrediction(prediction, totem.name)
        tr.append(tdName, tdAccuracy, tdPrediction)
        table.append(tr)
    })
}

function createContainers(data) {
    const {prediction, accuracyTotems} = data
        const container = document.createElement('div')
        const containerTitle = document.createElement('h1')
        const hour = getValidateDateValue(prediction.hour)
        const minute = getValidateDateValue(prediction.minute)
        containerTitle.innerHTML = 
        `<span> ${prediction.teamHome} vs ${prediction.teamAway}</span> <br/> ${prediction.type === 'Footbal'? 'Football' : prediction.type}, ${prediction.city}, ${prediction.date}, ${hour}:${minute} UTC`
        const containerFooter = document.createElement('div')
        const containerHeader = createContainerHeader(prediction)
        const table = document.createElement('table')
        const tr = document.createElement('tr')
        tr.innerHTML = `<th>Name</th><th>Forecast accuracy (statistics from ${accuracyTotems[0].length} matches)</th><th>Forecast</th>`
        table.append(tr)
        appendPredictions(accuracyTotems, table, prediction)
        container.className = 'container'
        containerFooter.className = 'container-footer'
        containerFooter.append(table)
        container.append(containerTitle)
        container.append(containerHeader)
        container.append(containerFooter)
        main.append(container)
}


function drawMoonData({ julian, phase, phaseEmoji, age}, moonData) {
    moonData.innerHTML = `
        <div class="moon-row">
            <div class="moon-emoji">
                ${phaseEmoji}
            </div>
        </div>
        <div class="moon-row">
            <div class="moon-julian">
                Julian day: ${julian}
            </div>
        </div>
        <div class="moon-row">
            <div class="moon-phase">
                Moon phase: ${phase}
            </div>
        </div>
        <div class="moon-row">
            <div class="moon-age">
                Moon age: ${age}
            </div>        
        </div>
    `

}

function drawWeather(weatherInfo, weatherData) {
    const { 
        temp, 
        humidity, 
        wind_speed, 
        weather,  
        clouds,
        pop,
    } = weatherInfo



    weatherData.innerHTML = `
        <div class="weather-row">
            <div class="weather-emoji">
                <img src='${iconUrl}${weather[0].icon}@2x.png'/>
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-description">
                ${weather[0].description}
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-temp">
                Temperature: ${temp.day}°C
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-humidity">
                Humidity: ${humidity}
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-clouds">
                Cloudiness: ${clouds}%
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-pop">
                Probability of precipitation: ${pop}
            </div>
        </div>
        <div class="weather-row">
            <div class="weather-wind_speed">
                Wind speed: ${wind_speed} metre/sec
            </div>
        </div>
    `
}

function appendFootbolData() {
    const [prediction] = state.currentPredictions.filter(prediction => prediction.type === "Footbal")
    const data = {
        prediction, 
        accuracyTotems: state.footbalAccuracyTotems
    }
    createContainers(data)
}
function appendNbaData() {
    const [prediction] = state.currentPredictions.filter(prediction => prediction.type === "NBA")
    const data = {
        prediction,  
        accuracyTotems: state.nbaAccuracyTotems
    }
    createContainers(data)
}
function appendNhlData() {
    const [prediction] = state.currentPredictions.filter(prediction => prediction.type === "NHL")
    const data = {
        prediction, 
        accuracyTotems: state.nhlAccuracyTotems
    }
    createContainers(data)
}

async function fetchResult(data) {
    const response = await fetch('http://localhost:7070/api/result-events', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    const result = response.json()
    console.log(result)
    return result
}

function addListener(id, form, value, type) {
    form.addEventListener('submit', async function handler(e) {
        e.preventDefault()
        const data = {
            home: form.elements.teamHome.value,
            away: form.elements.teamAway.value,
            city: form.elements.city.value,
            date: form.elements.date.value,
            oldId: id,
            newId: Date.now(),
            result: value,
            type
        }
        const response = await fetchResult(data)
        state = response   
        main.innerHTML = ''
        appendResults()
        MicroModal.close('modal-1');
        form.removeEventListener('submit', handler)
        form.reset()
    })
}

function submitHandler(e) {
    e.preventDefault()
    Array.from(e.target.elements).forEach(element => {
        if (element.checked) {
            //modalForm.reset()
            MicroModal.show('modal-1');
            addListener(e.target.dataset.id, modalForm, element.value, e.target.dataset.type)
        }
    });
}

function appendResults() {
    const container = document.createElement('div')
    container.className = 'container'
    const matches = document.createElement('div')
    matches.className = 'matches'
    state.currentPredictions.forEach(prediction => {
        const hour = getValidateDateValue(prediction.hour)
        const minute = getValidateDateValue(prediction.minute)
        const currentMatch = document.createElement('div')
        currentMatch.className = "current-match"
        currentMatch.setAttribute('data-type', prediction.type.toLowerCase())
        currentMatch.setAttribute('data-id', prediction.id)
        currentMatch.innerHTML = `<span> ${prediction.teamHome} vs ${prediction.teamAway}</span> <br/> ${prediction.type}<br/> ${prediction.city}<br/>${prediction.date}<br/>${hour}:${minute}`
        const form = document.createElement('form')
        form.setAttribute('data-id', prediction.id)
        form.setAttribute('data-type', prediction.type)
        form.innerHTML = `
            <div class="form-row">
                <label for="${prediction.type}-home">${prediction.teamHome}</label>
                <input name="${prediction.type}" type="radio" id="${prediction.type}-home" value="home" required>
            </div>
            <div class="form-row">
                <label for="${prediction.type}-away">${prediction.teamAway}</label>
                <input name="${prediction.type}" type="radio" id="${prediction.type}-away" value="away">
            </div>
            <div class="form-row">
                <label for="${prediction.type}-draw">draw</label>
                <input name="${prediction.type}" type="radio" id="${prediction.type}-draw" value="draw">
            </div>
            <div class="form-row">
                <button type="submit">save result</button>
            </div>`
        currentMatch.append(form)
        matches.append(currentMatch)
        form.addEventListener('submit', submitHandler)
    })
    container.append(matches)
    main.append(container)
    return
}

function clickHandler(e) {
    e.preventDefault()
    const clickedLink = e.target
    if(clickedLink.classList.contains('active')) {
        return 
    }

    links.find(link => link.classList.contains('active')).classList.remove('active')
    clickedLink.classList.add('active')
    const attr = clickedLink.getAttribute('id')
    main.innerHTML = ''
    if(attr === 'footbal') {
        appendFootbolData()
    } else if(attr === 'nba') {
        appendNbaData()
    } else if(attr === 'nhl') {
        appendNhlData()
    } else  {
        appendResults()
    }
}

function addListeners() {
    links.forEach(link => {
        link.addEventListener('click', clickHandler)
    })
}

function clickHandlerBtn(e) {
    if (!(document.querySelector('#footbal.active') || document.querySelector('#nhl.active') || document.querySelector('#nba.active'))) {
        return null
    }
    const array = []
    Array.from(document.querySelectorAll('tr')).forEach(tr => {
        const [name, progress, team]  = [...tr.querySelectorAll("td")]
        if (team && team.textContent === "Manchester City") {
            array.push(name.textContent)
        }
    })
    console.log(array)
}


fetchComingEvents().then(data => {
    state = data   
    addListeners()
    appendResults()
    const btn = document.querySelector('.click')
    btn.addEventListener('click', clickHandlerBtn)
})





