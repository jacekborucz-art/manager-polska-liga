import { Club, WeatherSnapshot } from "@/types";
import { RivalryService } from './RivalryService';

export const AttendanceService = {
  calculate: (club: Club, rank: number, weather: WeatherSnapshot, opponent?: Club | null): number => {
    const homeRepScore = Math.min(club.reputation, 10) / 10;
    const awayRepScore = opponent ? Math.min(opponent.reputation, 10) / 10 : 0;
    const rivalryContext = opponent ? RivalryService.getMatchContext(club, opponent) : null;

    let rankScore = 0;
    if (rank <= 4) rankScore = 1.0 - (rank - 1) * 0.05;
    else if (rank <= 10) rankScore = 0.8 - (rank - 5) * 0.05;
    else rankScore = 0.4 - (rank - 11) * 0.04;

    let weatherScore = 1.0;
    if (weather.description.includes("Ulewny") || weather.description.includes("Å›niegu")) weatherScore = 0.5;
    else if (weather.description.includes("Lekki")) weatherScore = 0.8;

    let totalPercent =
      (homeRepScore * 0.37) +
      (rankScore * 0.33) +
      (weatherScore * 0.10) +
      (awayRepScore * 0.12);

    if (rivalryContext) {
      totalPercent += rivalryContext.attendanceBoost + rivalryContext.marqueeBoost;
      totalPercent = Math.max(totalPercent, rivalryContext.minimumAttendancePct);
    }

    const jitter = (Math.random() * 0.06) - 0.03;
    totalPercent = Math.max(0.05, Math.min(1.0, totalPercent + jitter));

    return Math.floor(club.stadiumCapacity * totalPercent);
  }
};
