
const API_KEY = "490d29383ee926971139befa321ac9ec";

const DAYS_OF_THE_WEEK = ["sun", "mon", "tue" ,"wed","thu","fri","sat"];

let selectedCityText;
let selectedCity;

//get fubctions --------------------------
// current weather data

const getCitiesUsingGeoLocation = async (searchText) =>{
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`);
    return response.json()
}

//current weather data
const getCurrentWeatherData = async ({lat, lon, name:city}) => {
    const url = (lat&& lon)? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`:`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json()
}
//hourly weather data
const getHourlyWeatherData = async ({name:city}) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const hourlyData = await response.json();

    return hourlyData.list.map(forecast=>{
        const {main: {temp, temp_max, temp_min}, dt,dt_txt, weather:[{description, icon}]} = forecast;
        return {temp, temp_max, temp_min, dt, dt_txt, description,icon}
    })
}


//load functions ----------------------

const loadCurrentWeatherData = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const CurrentWeatherDataElement = document.querySelector("#currentForecast");
    CurrentWeatherDataElement.querySelector(".city").textContent = name;
    CurrentWeatherDataElement.querySelector(".temp").textContent = formatTemperature(temp);
    CurrentWeatherDataElement.querySelector(".description").textContent = description;
    CurrentWeatherDataElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`;
    }

const loadHourlyWeatherData =({main:{temp:tempNow}, weather:[{icon:iconNow}]},hourlyWeather)=>{
    console.log(hourlyWeather);
    let data12Hours = hourlyWeather.slice(2,14);
    const hourlyContainer = document.querySelector(".hourlyContainer");
    const timeFormatter = Intl.DateTimeFormat("en",{
        hour12 :true,
        hour: "numeric"
    })
    let innerHTMLString = `<article>
    <h3 class="time">Now</h3>
    <img  class="icon" src="${createIcon(iconNow)}" />
    <p class = "hourlyTemp">${formatTemperature(tempNow)}</p>
    </article>`;

    for( let {temp,icon, dt_txt} of  data12Hours) {
        innerHTMLString += `<article>
        <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
        <img  class="icon" src="${createIcon(icon)}" />
        <p class = "hourlyTemp">${formatTemperature(temp)}</p>
         </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString;
}

const load5DayWeather = (hourlyWeather)=>{
    const dayWiseWeather = calulateDayWiseWeather(hourlyWeather);
    const container = document.querySelector(".fiveDayForecastContainer");
    let dayWiseInfo = ``;
    Array.from(dayWiseWeather).map(([day, {temp_max, temp_min, icon}],index)=>{
        if(index<5){
            dayWiseInfo += `<article class="dayWiseForecast">
            <h3 class = "day">${index===0? "today" : day}</h3>
            <img class="icon" src="${createIcon(icon)}" alt="icon for 5 day forecast">
            <p class="minTemp">${formatTemperature(temp_min)}</p>
            <p class="maxTemp">${formatTemperature(temp_max)}</p>
        </article>`
        }
    })

    container.innerHTML = dayWiseInfo;
}

const loadFeelsLike = ({main:{feels_like}})=>{
    const feelsLikeTemp = document.querySelector(".feelsLikeTemp");
    feelsLikeTemp.textContent = formatTemperature(feels_like);
}

const loadHumidity = ({main:{humidity}})=>{
    const feelsLikeTemp = document.querySelector(".humidityValue");
    feelsLikeTemp.textContent = `${humidity} %`;
}

const loadData=async()=>{
    const CurrentWeather = await getCurrentWeatherData(selectedCity);
    console.log(CurrentWeather);
    loadCurrentWeatherData(CurrentWeather);

    const hourlyWeather = await getHourlyWeatherData(CurrentWeather);
    loadHourlyWeatherData(CurrentWeather,hourlyWeather);

    load5DayWeather(hourlyWeather);

    loadFeelsLike(CurrentWeather);
    loadHumidity(CurrentWeather);
}


//other functions--------------------
const formatTemperature = (temp) => `${temp?.toFixed(1)}°`;
const createIcon = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

const calulateDayWiseWeather = (hourlyWeather) => {
    let dayWiseWeather = new Map()
    for (const forecast of hourlyWeather) {
        const [date] = forecast.dt_txt.split(" ");
        const daysOftheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
        console.log(daysOftheWeek);
        if(dayWiseWeather.has(daysOftheWeek)){
            let forecstForTheDay = dayWiseWeather.get(daysOftheWeek);
            forecstForTheDay.push(forecast);
            dayWiseWeather.set(daysOftheWeek, forecstForTheDay)
        }
        else{
            dayWiseWeather.set(daysOftheWeek,[forecast]);
        }

    }
    console.log(dayWiseWeather);

    for(let [key , value] of dayWiseWeather){
        let temp_min = Math.min(...Array.from(value , val => val.temp_min));
        let temp_max = Math.max(...Array.from(value , val => val.temp_max));
        dayWiseWeather.set(key, {temp_min, temp_max, icon: value.find(v=> v.icon).icon})
    }
    console.log(dayWiseWeather);
    return dayWiseWeather;
}

//timer to wait for completion of typing
function debounce(func){
    let timer;
    return (...args)=>{
        clearTimeout(timer); // clear timeout
        // create a new time user is typing
        timer = setTimeout(() => {
            console.log("debounce");
            func.apply(this, args)
        }, 500);
    }
}

//after searching
const onSearchChange =async (event)=>{
    let {value} = event.target;
    if(!value){
        selectedCity=null;
        selectedCityText=" ";
    }

    if(value && (selectedCityText!== value)){
        const listOfCities = await getCitiesUsingGeoLocation(value);
        let options ="";
        for(let{ lat, lon, name, state, country}of listOfCities) {
            options +=`<option  data-city-details='${JSON.stringify({lat, lon, name})}' value="${name},${state},${country}"></option>`
        }
    
        document.querySelector("#cities").innerHTML = options;
        console.log(listOfCities);
    }

}

const handleCitySelection = (event)=>{
    console.log("selection done");
    selectedCityText = event.target.value;
    let options= document.querySelectorAll("#cities > option")
    console.log(options);
    if(options?.length){
        let selectedOption = Array.from(options).find(opt=>opt.value === selectedCityText);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log({selectedCity});
        loadData();
    }

}

const loadForecastUsingGeoLoaction=()=>{
navigator.geolocation.getCurrentPosition(({coords})=>{
    const {latitude:lat , longitude:lon} = coords;
    selectedCity = {lat,lon};
    loadData();
}, error=> console.log(error))
}

const debounceSearch = debounce((event)=> onSearchChange(event))

//main function------------------
    document.addEventListener("DOMContentLoaded", async () => {
        loadForecastUsingGeoLoaction()
        const searchInput = document.querySelector("#search");
        searchInput.addEventListener("input",debounceSearch)
        searchInput.addEventListener("change",handleCitySelection)

    })