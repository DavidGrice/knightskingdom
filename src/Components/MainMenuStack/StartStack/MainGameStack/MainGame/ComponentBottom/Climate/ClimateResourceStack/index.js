import ClearWeather2 from './clear_weather_2.png';
import ClearWeather5 from './clear_weather_5.png';
import DarkClearWeather2 from './dark_clear_weather_2.png';
import DarkClearWeather5 from './dark_clear_weather_5.png';
import DarkDrizzlyWeather2 from './dark_drizzly_weather_2.png';
import DarkDrizzlyWeather5 from './dark_drizzly_weather_5.png';
import DarkFoggyWeather2 from './dark_foggy_weather_2.png';
import DarkFoggyWeather5 from './dark_foggy_weather_5.png';
import DarkThunderstormWeather2 from './dark_thunderstorm_weather_2.png';
import DarkThunderstormWeather5 from './dark_thunderstorm_weather_5.png';
import DarkWindyWeather2 from './dark_windy_weather_2.png';
import DarkWindyWeather5 from './dark_windy_weather_5.png';
import DrizzlyWeather2 from './drizzly_weather_2.png';
import DrizzlyWeather5 from './drizzly_weather_5.png';
import FoggyWeather2 from './foggy_weather_2.png';
import FoggyWeather5 from './foggy_weather_5.png';
import ThunderstormWeather2 from './thunderstorm_weather_2.png';
import ThunderstormWeather5 from './thunderstorm_weather_5.png';
import WindyWeather2 from './windy_weather_2.png';
import WindyWeather5 from './windy_weather_5.png';
import GoCheckmark2 from './go_checkmark_2.png';
import GoCheckmark5 from './go_checkmark_5.png';

export const images = [
    { passive: ClearWeather2, active: ClearWeather5, mode: 'SUNNY' },
    { passive: WindyWeather2, active: WindyWeather5, mode: 'WINDY' },
    { passive: FoggyWeather2, active: FoggyWeather5, mode: 'FOGGY' },
    { passive: DrizzlyWeather2, active: DrizzlyWeather5, mode: 'RAIN' },
    { passive: ThunderstormWeather2, active: ThunderstormWeather5, mode: 'SNOW' },
    { passive: DarkClearWeather2, active: DarkClearWeather5, mode: 'DARK_SUNNY' },
    { passive: DarkWindyWeather2, active: DarkWindyWeather5, mode: 'DARK_WINDY' },
    { passive: DarkFoggyWeather2, active: DarkFoggyWeather5, mode: 'DARK_FOGGY' },
    { passive: DarkDrizzlyWeather2, active: DarkDrizzlyWeather5, mode: 'DARK_DRIZZLY' },
    { passive: DarkThunderstormWeather2, active: DarkThunderstormWeather5, mode: 'DARK_THUNDERSTORM' },
];

export const checkmarks = { 
    passive: GoCheckmark2,
    active: GoCheckmark5
};