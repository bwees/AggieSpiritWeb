// download timetable from https://gist.githubusercontent.com/bwees/4e75c40adb4806b4db688ddb550a727f/raw/data.json
var timetableData = null
var shouldShowExpired = localStorage.getItem('showExpired') || false
document.getElementById('expiredBtn').innerHTML = shouldShowExpired ? 'Hide Expired' : 'Show Expired'

function hideExpired() {
    let now = new Date()
    let rows = document.getElementById('timetable').children[1].children
    for (let row of rows) {
        let cells = row.children
        var expiredCount = 0
        for (let cell of cells) {
            if (new Date(cell.firstChild.getAttribute('datetime')) < now) {
                cell.style.color = 'lightgrey'
                expiredCount++
            }
        }

        if (expiredCount == cells.length) {
            row.hidden = true
        }
    }
}

function showExpired() {
    let rows = document.getElementById('timetable').children[1].children
    for (let row of rows) {
        let cells = row.children
        for (let cell of cells) {
            cell.style.color = 'black'
        }
        row.hidden = false
    }
}

fetch('https://gist.githubusercontent.com/bwees/4e75c40adb4806b4db688ddb550a727f/raw/data.json')
    .then(response => response.json())
    .then(data => { 

        timetableData = data

        // populate select with id busSelector with bus numbers
        let busSelector = document.getElementById('busSelector')
        for (let bus of Object.keys(data)) {
            let option = document.createElement('option')
            option.value = bus
            option.innerHTML = bus + ' - ' + data[bus].name
            busSelector.appendChild(option)
        }

        // sort bus numbers
        let options = Array.from(busSelector.children)
        options.sort((a, b) => {
            var a = a.value.slice(0, 2)
            var b = b.value.slice(0, 2)
            return a - b
        })
        
        busSelector.innerHTML = '<option value="null">Select a bus</option>'
        for (let option of options) {
            busSelector.appendChild(option)
        }

        // select null
        busSelector.value = 'null'
    })

// when selector is changed
document.getElementById('busSelector').addEventListener('change', (event) => {
    let bus = event.target.value
    if (bus == 'null') {
        document.getElementById('timetable').innerHTML = ''
        document.getElementById('routeSelect').hidden = true
        document.getElementById('expiredBtn').hidden = true
        return
    }

    let timetable = timetableData[bus]

    if (timetable.routes.length == 1) {
        document.getElementById('timetable').innerHTML = timetable.routes[0].html
        document.getElementById('routeSelect').hidden = true

        if (timetable.routes[0].html.includes('No Service')) {
            // hide expired button
            document.getElementById('expiredBtn').hidden = true
        } 
        return
    }

    document.getElementById('expiredBtn').hidden = false

    op1Label = document.getElementById('op1Label')
    op1Label.innerHTML = timetable.routes[0].destination

    op2Label = document.getElementById('op2Label')
    op2Label.innerHTML = timetable.routes[1].destination


    document.getElementById('routeSelect').hidden = false
    document.getElementById('timetable').innerHTML = timetable.routes[0].html


    shouldShowExpired ? showExpired() : hideExpired()

    // when route is changed
    document.getElementById('routeSelect').addEventListener('change', (event) => {
        let route = event.target.value
        document.getElementById('timetable').innerHTML = timetable.routes[route].html
    })
})

document.getElementById('expiredBtn').addEventListener('click', () => {

    shouldShowExpired = !shouldShowExpired
    localStorage.setItem('showExpired', shouldShowExpired)

    shouldShowExpired ? showExpired() : hideExpired()

    document.getElementById('expiredBtn').innerHTML = shouldShowExpired ? 'Hide Expired' : 'Show Expired'

})

