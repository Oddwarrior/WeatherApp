
const API_key = "490d29383ee926971139befa321ac9ec";

const getCurrentWeatherData = async()=>{
    const city = "mumbai";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid${API_key}&units=metric')`);
    return response.json()
}

const loadCurrentWeatherData = () =>{

}
document.addEventListener("DOMContentLoaded",async()=>{
    console.log(await getCurrentWeatherData());

})