
const API_KEY = "490d29383ee926971139befa321ac9ec";
// const API_KEY = "3540ed5323b3e51df96ad6cf38f42cba";

const getCurrentWeatherData = async () => {
    const city = "mumbai";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json()
}
const formatTemperature = (temp) => `${temp?.toFixed(1)}°`;
const createIcon =(icon) =>`http://openweathermap.org/img/wn/${icon}@2x.png`

const getHourlyWeatherData = async ({name:city}) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const hourlyData = await response.json();

    return hourlyData.list.map(forecast=>{
        const {main: {temp, temp_max, temp_min}, dt,dt_txt, weather:[{description, icon}]} = forecast;
        return {temp, temp_max, temp_min, dt, dt_txt, description,icon}
    })
}


const loadCurrentWeatherData = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const CurrentWeatherDataElement = document.querySelector("#currentForecast");
    CurrentWeatherDataElement.querySelector(".city").textContent = name;
    CurrentWeatherDataElement.querySelector(".temp").textContent = formatTemperature(temp);
    CurrentWeatherDataElement.querySelector(".description").textContent = description;
    CurrentWeatherDataElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`;

    }

const loadHourlyWeatherData =(hourlyWeather)=>{
    console.log(hourlyWeather);
    let data12Hours = hourlyWeather.slice(1,13);
    const hourlyContainer = document.querySelector(".hourlyContainer");
    let innerHTMLString = ``;

    for( let {temp,icon, dt_txt} of  data12Hours) {
        innerHTMLString += `<article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img  class="icon" src="${createIcon(icon)}" >
        <p class = "hourlyTemp">${formatTemperature(temp)}</p>
         </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString;
}

    document.addEventListener("DOMContentLoaded", async () => {
        const CurrentWeather = await getCurrentWeatherData();
        console.log(CurrentWeather);
        loadCurrentWeatherData(CurrentWeather);

        const hourlyWeather = await getHourlyWeatherData(CurrentWeather);
        loadHourlyWeatherData(hourlyWeather);

    })