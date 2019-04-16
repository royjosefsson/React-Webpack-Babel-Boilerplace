import moment from 'moment';

let sortDates = (a, b) => {
    return moment(`${a.date}T${a.time}`, 'YYYY-MM-DDYHH:mm:ss') - moment(`${b.date}T${b.time}`, 'YYYY-MM-DDYHH:mm:ss');
}

export const validateGoogleApiKey = () => new Promise(() => {
    fetch('http://yougapi.com/tools/google-api-key-checker.php?key=AIzaSyAS6WI2fRh5EFvyNl1UwRy6AlOCQENmTbY')
})

const ApiHandler = {

    SMHI: {
        /**
         * Get Places.
         * @param {Place} place - Choosen place from Google.
         * @returns {Array<Object>} - Places From SMHI
         */
        getPlaces: place => new Promise((resolve, reject) => {
            fetch('https://opendata-download-metobs.smhi.se/api/version/latest/parameter/1.json')
                .then(response => response.json())
                .then(result => resolve(result.station.filter(x => x.name.includes(place.name))))
                .catch(error => reject(error));
        }),

        /**
         * Get Periods.
         * @param {String} id - id.
         * @returns {Array<Object>} - Periods
         */
        getPeriods: id => new Promise((resolve, reject) => {
            fetch(`https://opendata-download-metobs.smhi.se/api/version/latest/parameter/1/station/${id}.json`)
                .then(response => response.json())
                .then(station => resolve(station.period))
                .catch(error => reject(error));

        }),

        /**
         * Get Current Weather.
         * @param {String} id - id.
         * @returns {Promise<Number>} - Current Weather
         */
        getCurrentWeather: id => {
            return new Promise((resolve, reject) => {
                fetch(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station/${id}/period/latest-hour.json`)
                    .then(response => response.json())
                    .then(result => {
                        let dataLink = result.data[0].link.filter(x => x.type === 'application/json')[0].href;
                        fetch(dataLink)
                            .then(response => response.json())
                            .then(data => {
                                if (data.value === null) {
                                    reject('data.value === null');
                                }
                                resolve(data.value[data.value.length - 1].value);
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
            })
        },

        /**
         * Get Last Years Data.
         * @param {String} id - id.
         * @param {Object} Period - period of which data shall be fetched.
         * @param {Array<Object>} currentData - Current Data this year.
         */
        getLastYearsData: (id, currentData) => new Promise((resolve, reject) => {
            let fromObject = currentData[0];
            let from = moment(`${fromObject.date}T${fromObject.time}`, 'YYYY-MM-DDTHH:mm:ss').subtract(1, 'year');

            fetch(`https://opendata-download-metobs.smhi.se/api/version/latest/parameter/1/station/${id}/period/corrected-archive/data.csv`,
                { method: "GET", headers: { 'Content-Type': 'text/plain;charset=UTF-8' } })
                .then(response => response.text())
                .then(data => {
                    let indexOfFromLastYear = data.search(moment(from).format('YYYY-MM-DD'));

                    let periodLastYearText = data.substring(indexOfFromLastYear, data.length);
                    let periodLastYearArray = periodLastYearText.split("\n");

                    let toValue = periodLastYearArray.filter(x => x.split(';')
                        .includes(from.format('YYYY-MM-DD')) && x.split(';').includes(from.format('HH:mm:ss')))[0];

                    let toIndex = periodLastYearArray.indexOf(toValue);
                    periodLastYearArray.splice(0, toIndex)


                    periodLastYearArray.splice(currentData.length);

                    let result = periodLastYearArray.sort(sortDates).map(x => ({
                        date: x.split(';')[0],
                        time: x.split(';')[1],
                        value: x.split(';')[2],
                        quality: x.split(';')[3],
                        formattedString: `${x.split(';')[0]}-${x.split(';')[1]}\n${x.split(';')[2]}`
                    }));

                    resolve(result)

                })
                .catch(err => reject(err));
        }),

        /**
         * 
         */
        getCurrentData: period => new Promise((resolve, reject) => {
            let uri = period.link.filter(x => x.type === 'application/json')[0].href;
            fetch(uri)
                .then(response => response.json())
                .then(result => {

                    let dataLink = result.data[0].link.filter(x => x.type === 'application/json')[0].href;
                    fetch(dataLink)
                        .then(response => response.json())
                        .then(data => {
                            if (data.value === null) {
                                reject('data.value === null');
                            }
                            resolve(data.value.map(x => ({
                                date: moment(x.date).format('YYYY-MM-DD'),
                                time: moment(x.date).format('HH:mm:ss'),
                                value: x.value,
                                quality: x.quality,
                                formattedString: `${moment(x.date).format('YYYY-MM-DD')}-${moment(x.date).format('HH:mm:ss')}\n${x.value}`
                            })))
                        })
                        .catch(err => reject(err));
                });
        })
    }
};

export default ApiHandler;