
const API_KEY = "490d29383ee926971139befa321ac9ec";
// const API_KEY = "3540ed5323b3e51df96ad6cf38f42cba";

const getCurrentWeatherData = async () => {
    const city = "mumbai";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json()
}

const loadCurrentWeatherData = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const CurrentWeatherDataElement = document.querySelector("#currentForecast");
    CurrentWeatherDataElement.querySelector(".city").textContent = name;
    CurrentWeatherDataElement.querySelector(".temp").textContent = temp;
    CurrentWeatherDataElement.querySelector(".description").textContent = description;
    CurrentWeatherDataElement.querySelector(".min-max-temp").textContent = `H: ${temp_max} L: ${temp_min}`;

    }

    document.addEventListener("DOMContentLoaded", async () => {
        const CurrentWeather = await getCurrentWeatherData();
        console.log(CurrentWeather);

        loadCurrentWeatherData(CurrentWeather)
    })