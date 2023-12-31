import { ForecastPoint, StormGlass } from "@src/clients/storm-glass"
import { InternalError } from "@src/util/errors/internal-error";

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []
    try {
      for(const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
        const enrichedBeachData = this.enrichBeachData(points, beach);
        pointsWithCorrectSources.push(...enrichedBeachData);
      }
    } catch (error) {
      throw new ForecastProcessingInternalError('Error fetching data');
    }
    return this.mapForecastByTime(pointsWithCorrectSources);
  }

  private enrichBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[] {
    return points.map(point => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1
      },
      ...point,
    }))
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = []
    for(const point of forecast) {
      const timePoint = forecastByTime.find(f => f.time === point.time);
      if(timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }
    return forecastByTime;
  }
}