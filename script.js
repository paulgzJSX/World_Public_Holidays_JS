const selectCountry = document.querySelector('#country')
const selectYear = document.querySelector('#year')
const rows = document.querySelector('.rows')
const upcomingRows = document.querySelector('.upcoming-rows')
const homeLink = document.querySelector('.home-link')

const countriesURL = 'https://date.nager.at/api/v2/availablecountries/'
const byCountryURL = 'https://date.nager.at/api/v2/publicholidays/'
const upcomingHolsURL = 'https://date.nager.at/api/v2/NextPublicHolidaysWorldwide/'

let data = {
    country: '',
    year: 2020
}

let countries = []


function grabData() {
    selectCountry.addEventListener('change', (e) => {
        data.country = e.target.value
        getHolidays(data.year, data.country)
    })

    selectYear.addEventListener('change', (e) => {
        data.year = parseInt(e.target.value)
        getHolidays(data.year, data.country)
    })

    homeLink.addEventListener('click', () => {
        initCountries()
    })
}

function initYears() {
    const now = new Date().getUTCFullYear();
    const years = Array(now - (now - 20)).fill('').map((v, idx) => now - idx);

    years.forEach(year => {
        let option = document.createElement('option')
        option.value = year
        option.innerHTML = year
        selectYear.appendChild(option)
    })
}

async function initCountries() {
    countries  = await (await fetch(countriesURL)).json()

    countries.sort((a, b) => a.value.localeCompare(b.value)).forEach(country => {
        let option = document.createElement('option')
        option.value = country.key
        option.innerHTML = country.value
        selectCountry.appendChild(option)
    })

    getUpcomingHolidays()
}

async function getHolidays(year, country) {
    const holidays = await (await fetch(`${byCountryURL}${year}/${country}`)).json()

    document.querySelector('.upcoming').innerHTML = ''
    rows.innerHTML = ''
    const currentCountry = countries.find(country => country.key.includes(data.country))

    document.querySelector('.holidays').innerHTML = `
            <div class='heading'>
                <img src="images/${data.country.toLowerCase()}.svg" alt="">
                <h2>Holidays and observations in ${currentCountry.value}</h2>
            </div>
            <p>Total: ${holidays.length}</p>
        `

    document.querySelector('.table-header').classList.add('active')

    holidays.map(holiday => {
        const div = document.createElement('div')
        div.classList.add('row')
        div.innerHTML = `
                <p class="date">${setDate(holiday.date)}</p>
                <p class="name">${holiday.name}</p>
                <p class="type">${holiday.type}</p>
                <p class="local-name">${holiday.localName}</p>
            `
        rows.appendChild(div)
    })
}

async function getUpcomingHolidays() {
    const upcomingHolidays = await (await fetch(upcomingHolsURL)).json()

    upcomingHolidays.map(upcomingHoliday => {

        const upcomingHolidayCountry = countries.find(country => country.key === upcomingHoliday.countryCode)

        const div = document.createElement('div')
        div.classList.add('upcoming-row')
        div.innerHTML = `
            <div class="upcoming-image">
                <img src="images/${upcomingHoliday.countryCode.toLowerCase()}.svg" alt="">
                <p>${upcomingHolidayCountry.value}</p>
            </div>
            <p class="upcoming-date">${setDate(upcomingHoliday.date)}</p>
            <p class="upcoming-name">${upcomingHoliday.name}</p>
            <p class="upcoming-type">${upcomingHoliday.type}</p>
            <p class="upcoming-local-name">${upcomingHoliday.localName}</p>
        `
        upcomingRows.appendChild(div)
    })
}


document.addEventListener('DOMContentLoaded', () => {
    initCountries()
    initYears()
    grabData()
})


// Helper Functions

function addZeros(number) {
    return number < 10 ? ('0' + number) : number
}

function setDate(serverDate) {

    const holidayDate = new Date(serverDate)
    const date = addZeros(holidayDate.getDate())
    const day = holidayDate.toLocaleDateString('en-EN', { weekday: 'short' })
    const month = addZeros(holidayDate.getMonth() + 1)
    const processedDate = date + '/' + month + ' ' + day

    return processedDate
}
